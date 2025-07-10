import React, { useState } from 'react';
import Card from '../Layout/Card';
import { ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

interface TailoredResumeProps {
  text: string;
  isLoading: boolean;
  error?: string;
}

const TailoredResume: React.FC<TailoredResumeProps> = ({ text, isLoading, error }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-red-400 text-center py-4">{error}</div>
      </Card>
    );
  }

  if (!text) {
    return null;
  }

  const sections = text.split('\n\n').filter(section => section.trim());

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Tailored Resume</h2>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
          >
            {isCopied ? (
              <>
                <ClipboardDocumentCheckIcon className="w-4 h-4" />
                <span className="text-sm">Copied!</span>
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="w-4 h-4" />
                <span className="text-sm">Copy Text</span>
              </>
            )}
          </button>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="space-y-6">
            {sections.map((section, index) => {
              const lines = section.split('\n');
              const isContactSection = index === 0;

              if (isContactSection) {
                return (
                  <div key={index} className="border-b border-white/10 pb-6">
                    {lines.map((line, lineIndex) => (
                      <p key={lineIndex} className="text-white/90 font-medium text-center">
                        {line}
                      </p>
                    ))}
                  </div>
                );
              }

              return (
                <div key={index} className="space-y-2">
                  {lines.map((line, lineIndex) => {
                    // Check if the line is a section header (all caps or ends with a colon)
                    const isSectionHeader = line.toUpperCase() === line || line.endsWith(':');
                    
                    if (isSectionHeader) {
                      return (
                        <h3 key={lineIndex} className="text-white font-semibold text-lg mt-6">
                          {line}
                        </h3>
                      );
                    }

                    // Check if the line is a bullet point
                    const isBulletPoint = line.trim().startsWith('•') || line.trim().startsWith('-');
                    
                    if (isBulletPoint) {
                      return (
                        <p key={lineIndex} className="text-white/80 pl-4">
                          {line}
                        </p>
                      );
                    }

                    return (
                      <p key={lineIndex} className="text-white/90">
                        {line}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TailoredResume; 