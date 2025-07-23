interface JobDetails {
  title: string;
  company: string;
  location: string;
  description: string;
  employmentType?: string;
  postedDate?: string;
  requirements: string[];
  skills: string[];
}

const SCRAPER_WORKER_URL = process.env.SCRAPER_WORKER_URL || '';

export async function scrapeLinkedInJob(jobUrl: string): Promise<JobDetails> {
  if (!SCRAPER_WORKER_URL) {
    throw new Error('Scraper worker URL is not configured');
  }

  try {
    const response = await fetch(SCRAPER_WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: jobUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const jobDetails = await response.json();
    return jobDetails;
  } catch (error) {
    console.error('Error in scrapeLinkedInJob:', error);
    throw new Error(`Failed to scrape LinkedIn job: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateTailoringPrompt(jobDetails: JobDetails): Promise<string> {
  return `
    Please tailor this resume for the following job:
    
    Position: ${jobDetails.title}
    Company: ${jobDetails.company}
    Location: ${jobDetails.location}
    
    Key Requirements:
    ${jobDetails.requirements.map(req => `- ${req}`).join('\n')}
    
    Required Skills:
    ${jobDetails.skills.map(skill => `- ${skill}`).join('\n')}
    
    Job Description:
    ${jobDetails.description}
    
    Please modify the resume to:
    1. Highlight experiences that match the job requirements
    2. Emphasize proficiency in the required skills
    3. Use similar keywords and industry terminology from the job description
    4. Maintain truthfulness while optimizing relevance
    5. Ensure the most relevant experiences are prominently featured
  `;
} 