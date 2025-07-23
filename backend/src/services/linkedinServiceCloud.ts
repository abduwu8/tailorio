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

// Use the exact URL from your Cloudflare dashboard
const SCRAPER_WORKER_URL = process.env.SCRAPER_WORKER_URL || 'https://linkedin-scraper.sigmasigma.workers.dev';

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1}: Fetching from ${url}`);
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
      });
      
      if (response.ok) {
        return response;
      }
      
      const errorText = await response.text();
      console.log(`Attempt ${i + 1} failed with status ${response.status}:`, errorText);
      
      if (i === retries - 1) {
        throw new Error(`Failed with status ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed with error:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1))); // Exponential backoff
    }
  }
  throw new Error(`Failed after ${retries} attempts`);
}

export async function scrapeLinkedInJob(jobUrl: string): Promise<JobDetails> {
  console.log('Starting LinkedIn job scraping with worker URL:', SCRAPER_WORKER_URL);
  console.log('Job URL to scrape:', jobUrl);

  try {
    const response = await fetchWithRetry(SCRAPER_WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: jobUrl }),
    });

    const jobDetails = await response.json();
    
    // Validate the response
    if (!jobDetails.title || !jobDetails.description) {
      console.error('Invalid response from scraper:', jobDetails);
      throw new Error('Invalid response from scraper: Missing required fields');
    }

    console.log('Successfully scraped job details:', {
      title: jobDetails.title,
      company: jobDetails.company,
      descriptionLength: jobDetails.description.length,
      requirementsCount: jobDetails.requirements?.length || 0,
      skillsCount: jobDetails.skills?.length || 0
    });

    return jobDetails;
  } catch (error) {
    console.error('Error in scrapeLinkedInJob:', error);
    
    // Enhance error message based on the type of error
    let errorMessage = 'Failed to scrape LinkedIn job';
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      errorMessage = `Failed to connect to scraper service at ${SCRAPER_WORKER_URL}. Please verify the worker is running and accessible.`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
}

export async function generateTailoringPrompt(jobDetails: JobDetails): Promise<string> {
  return `
    Please tailor this resume for the following job:
    
    Position: ${jobDetails.title}
    Company: ${jobDetails.company}
    Location: ${jobDetails.location}
    
    Key Requirements:
    ${jobDetails.requirements?.map(req => `- ${req}`).join('\n') || 'No specific requirements listed'}
    
    Required Skills:
    ${jobDetails.skills?.map(skill => `- ${skill}`).join('\n') || 'No specific skills listed'}
    
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