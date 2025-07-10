import React from 'react';

interface ResumeTextProps {
  text: string;
  analysis?: {
    wordCount: number;
    characterCount: number;
  };
}

const ResumeText: React.FC<ResumeTextProps> = ({ text, analysis }) => {
  return (
    <div className="space-y-4">
      {analysis && (
        <div className="flex gap-4 text-sm text-muted mb-4">
          <span>{analysis.wordCount} words</span>
          <span>•</span>
          <span>{analysis.characterCount} characters</span>
        </div>
      )}
      <div className="prose prose-invert max-w-none">
        {text.split('\n').map((paragraph, index) => (
          <p key={index} className="text-default">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ResumeText; 