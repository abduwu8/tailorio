import React, { useState, useEffect } from 'react';
import Card from '../components/Layout/Card';

interface Resume {
  id: string;
  fileName: string;
  originalName: string;
  uploadDate: string;
  path: string;
  textAnalysis: {
    wordCount: number;
    characterCount: number;
  };
}

const MyResumesPage = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<string>('');

  const fetchResumes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/resumes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setResumes(data);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setUploadStatus('Please upload a PDF file');
        return;
      }
      setFile(selectedFile);
      setUploadStatus('File selected: ' + selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploadStatus('Uploading...');

      const response = await fetch('http://localhost:5000/api/upload-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('File uploaded successfully!');
        setFile(null);
        // Reset the file input
        const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        // Refresh the resume list
        fetchResumes();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setUploadStatus('Failed to upload file');
      console.error('Upload error:', error);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      setDeleteStatus('Deleting...');
      const response = await fetch(`http://localhost:5000/api/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setDeleteStatus('Resume deleted successfully');
        setResumes(prevResumes => prevResumes.filter(resume => resume.id !== resumeId));
        if (selectedResume?.id === resumeId) {
          setSelectedResume(null);
        }
        setTimeout(() => setDeleteStatus(''), 3000);
      } else {
        throw new Error('Failed to delete resume');
      }
    } catch (error) {
      setDeleteStatus('Failed to delete resume');
      setTimeout(() => setDeleteStatus(''), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-semibold mb-8 text-center text-default">My Resumes</h1>

      {/* Upload Section */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold text-default mb-6">Upload New Resume</h2>
        <div className="space-y-4">
          <div>
            <label 
              htmlFor="resume-upload" 
              className="block text-sm font-medium text-muted mb-2"
            >
              Select PDF Resume
            </label>
            <input
              type="file"
              id="resume-upload"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => document.getElementById('resume-upload')?.click()}
              className="w-full px-4 py-2 border border-default rounded-lg text-sm text-muted hover:text-default hover:border-secondary transition-colors text-center"
            >
              Choose File
            </button>
          </div>
          
          {uploadStatus && (
            <p className={`text-sm ${
              uploadStatus.includes('success')
                ? 'text-green-400'
                : uploadStatus.includes('failed') || uploadStatus.includes('Please')
                ? 'text-red-400'
                : 'text-muted'
            }`}>
              {uploadStatus}
            </p>
          )}

          <button
            onClick={handleUpload}
            disabled={!file}
            className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              file
                ? 'bg-secondary text-primary hover:bg-secondary/90'
                : 'bg-accent cursor-not-allowed'
            }`}
          >
            Upload Resume
          </button>
        </div>
      </Card>

      {/* Resumes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resumes.map((resume) => (
          <Card key={resume.id} className="relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleDelete(resume.id)}
                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                title="Delete Resume"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col h-full">
              <h3 className="font-medium text-default mb-2 pr-8">{resume.originalName}</h3>
              <div className="text-sm text-muted mb-4">
                Uploaded: {formatDate(resume.uploadDate)}
              </div>
              
              <div className="text-xs text-muted space-y-1 mb-4">
                <div>Words: {resume.textAnalysis.wordCount.toLocaleString()}</div>
                <div>Characters: {resume.textAnalysis.characterCount.toLocaleString()}</div>
              </div>

              <div className="mt-auto">
                <a
                  href={`http://localhost:5000${resume.path}?token=${localStorage.getItem('token')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-secondary hover:text-secondary/80 transition-colors"
                >
                  View PDF
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {deleteStatus && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-sm ${
          deleteStatus.includes('success') ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
        }`}>
          {deleteStatus}
        </div>
      )}
    </div>
  );
};

export default MyResumesPage; 