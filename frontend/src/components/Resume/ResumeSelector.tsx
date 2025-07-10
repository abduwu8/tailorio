import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

interface ResumeSelectorProps {
  resumes: Array<{
    id: string;
    fileName: string;
    originalName: string;
    uploadDate: string;
  }>;
  selectedResumeId: string | null;
  onResumeSelect: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ResumeSelector: React.FC<ResumeSelectorProps> = ({
  resumes,
  selectedResumeId,
  onResumeSelect,
  onDelete,
}) => {
  return (
    <div className="space-y-3">
      {resumes.map((resume) => (
        <div
          key={resume.id}
          className={`w-full rounded-lg border transition-all ${
            selectedResumeId === resume.id
              ? 'border-secondary bg-card-hover'
              : 'border-default hover:bg-card-hover'
          }`}
        >
          <button
            onClick={() => onResumeSelect(resume.id)}
            className="w-full text-left p-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`font-medium ${
                  selectedResumeId === resume.id
                    ? 'text-secondary'
                    : 'text-muted hover:text-default'
                }`}>{resume.originalName}</h3>
                <p className="text-sm text-muted">
                  {new Date(resume.uploadDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="text-secondary">
                {selectedResumeId === resume.id && (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          </button>
          {onDelete && (
            <div className="border-t border-default px-4 py-2">
              <button
                onClick={() => onDelete(resume.id)}
                className="flex items-center space-x-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ResumeSelector; 