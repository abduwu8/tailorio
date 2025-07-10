import React, { useState } from 'react';
import Card from '../Layout/Card';

interface LinkedInJobInputProps {
  onJobScraped: (data: any) => void;
  selectedResume: {
    id: string;
    extractedText: string;
  };
}

const LinkedInJobInput: React.FC<LinkedInJobInputProps> = ({
  onJobScraped,
  selectedResume,
}) => {
  const [jobUrl, setJobUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobUrl.includes('linkedin.com/jobs/')) {
      setError('Please enter a valid LinkedIn job URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/linkedin/scrape-and-tailor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          linkedinUrl: jobUrl, // Updated to match backend expected field name
          resumeText: selectedResume.extractedText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process LinkedIn job posting');
      }

      const data = await response.json();
      onJobScraped(data);
      setJobUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <h2 className="text-xl font-semibold text-default mb-4">
        LinkedIn Job Tailoring
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="jobUrl"
            className="block text-sm font-medium text-muted mb-2"
          >
            LinkedIn Job URL
          </label>
          <input
            type="url"
            id="jobUrl"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="https://www.linkedin.com/jobs/view/..."
            className="w-full px-4 py-2 rounded-lg bg-card border border-default text-default placeholder-accent focus:outline-none focus:border-secondary transition-colors"
            required
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-secondary rounded-lg text-sm font-medium transition-colors ${
            isLoading
              ? 'bg-accent cursor-not-allowed'
              : 'hover:bg-secondary hover:text-primary text-secondary'
          }`}
        >
          {isLoading ? 'Processing...' : 'Tailor Resume to Job'}
        </button>
      </form>
    </Card>
  );
};

export default LinkedInJobInput; 