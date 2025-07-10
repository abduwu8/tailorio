import React, { useState } from 'react';
import Card from './Card';

interface SidebarProps {
  onUploadSuccess: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

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

      const response = await fetch('http://localhost:5000/upload-resume', {
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
        // Notify parent component to refresh resume list
        onUploadSuccess();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setUploadStatus('Failed to upload file');
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="w-64 h-screen bg-black border-r border-default fixed left-0 top-0">
      <div className="p-4">
        <h2 className="text-xl font-semibold text-default mb-6">Resume Upload</h2>
        <Card>
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
      </div>
    </div>
  );
};

export default Sidebar; 