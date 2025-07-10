import React, { useEffect, useState } from 'react';
import ResumeText from './ResumeText';

interface FileUploadState {
  file: File | null;
  preview: string | null;
  uploadStatus: string;
}

interface ResumeData {
  id: string;
  fileName: string;
  originalName: string;
  path: string;
  uploadDate: string;
  extractedText: string;
  textAnalysis: {
    wordCount: number;
    characterCount: number;
  };
}


const ResumeUpload = () => {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    file: null,
    preview: null,
    uploadStatus: ''
  });
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
  const [viewMode, setViewMode] = useState<'pdf' | 'text'>('pdf');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch('http://localhost:5000/resumes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }
      const data = await response.json();
      setResumes(data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadState(prev => ({
          ...prev,
          uploadStatus: 'Please upload a PDF file'
        }));
        return;
      }

      const previewUrl = URL.createObjectURL(file);

      setUploadState(prev => ({
        ...prev,
        file,
        preview: previewUrl,
        uploadStatus: 'File selected: ' + file.name
      }));
    }
  };

  const handleUpload = async () => {
    if (!uploadState.file) {
      setUploadState(prev => ({
        ...prev,
        uploadStatus: 'Please select a file first'
      }));
      return;
    }

    const formData = new FormData();
    formData.append('resume', uploadState.file);

    try {
      setUploadState(prev => ({
        ...prev,
        uploadStatus: 'Uploading...'
      }));

      const response = await fetch('http://localhost:5000/upload-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      if (response.ok) {
        setUploadState({
          file: null,
          preview: null,
          uploadStatus: 'File uploaded successfully!'
        });
        fetchResumes();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        uploadStatus: 'Failed to upload file'
      }));
    }
  };

  const handlePreviewResume = (resume: ResumeData) => {
    setSelectedResume(resume);
    setViewMode('pdf');
  };

  const handleViewText = (resume: ResumeData) => {
    setSelectedResume(resume);
    setViewMode('text');
  };

  useEffect(() => {
    return () => {
      if (uploadState.preview) {
        URL.revokeObjectURL(uploadState.preview);
      }
    };
  }, [uploadState.preview]);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="resume-upload"
          />
          <label
            htmlFor="resume-upload"
            className="cursor-pointer block"
          >
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 14v20c0 4.418 3.582 8 8 8h16c4.418 0 8-3.582 8-8V14m-20 6l8-8 8 8m-8-8v28"
                />
              </svg>
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">Click to upload</span> or drag and drop
              </div>
              <p className="text-xs text-gray-500">PDF up to 10MB</p>
            </div>
          </label>
        </div>

        {uploadState.uploadStatus && (
          <div className={`p-3 rounded-md ${
            uploadState.uploadStatus.includes('successfully')
              ? 'bg-green-50 text-green-800'
              : uploadState.uploadStatus.includes('Failed') || uploadState.uploadStatus.includes('Please')
                ? 'bg-red-50 text-red-800'
                : 'bg-gray-50 text-gray-800'
          }`}>
            {uploadState.uploadStatus}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!uploadState.file}
          className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Upload Resume
        </button>
      </div>

      {/* Preview Section */}
      {(uploadState.preview || selectedResume) && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedResume ? 'Viewing: ' + selectedResume.originalName : 'Preview'}
              </h3>
              {selectedResume && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('pdf')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'pdf'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    PDF View
                  </button>
                  <button
                    onClick={() => setViewMode('text')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'text'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Text View
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white">
            {viewMode === 'pdf' ? (
              <div className="h-[600px]">
                <iframe
                  src={selectedResume ? `http://localhost:5000${selectedResume.path}?token=${localStorage.getItem('token')}` : uploadState.preview || ''}
                  className="w-full h-full"
                  title="Resume Preview"
                />
              </div>
            ) : (
              <div className="p-4">
                {selectedResume && (
                  <ResumeText 
                    text={selectedResume.extractedText}
                    analysis={selectedResume.textAnalysis}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Uploaded Resumes List */}
      {resumes.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Uploaded Resumes</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {resumes.map(resume => (
              <div
                key={resume.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-900">{resume.originalName}</span>
                  {resume.textAnalysis && (
                    <span className="text-xs text-gray-500">
                      ({resume.textAnalysis.wordCount.toLocaleString()} words)
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreviewResume(resume)}
                    className="text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    View PDF
                  </button>
                  <button
                    onClick={() => handleViewText(resume)}
                    className="text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    View Text
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload; 