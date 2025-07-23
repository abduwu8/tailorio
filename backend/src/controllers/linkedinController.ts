import { Request, Response } from 'express';
import { scrapeLinkedInJob, generateTailoringPrompt } from '../services/linkedinServiceCloud';
import { tailorResume } from '../services/resumeService';

export const scrapeAndTailorResume = async (req: Request, res: Response) => {
  try {
    console.log('Received request body:', req.body);
    const { linkedinUrl, resumeText } = req.body;

    if (!linkedinUrl || !resumeText) {
      console.log('Missing required fields:', { linkedinUrl: !!linkedinUrl, resumeText: !!resumeText });
      return res.status(400).json({
        error: 'Both LinkedIn job URL and resume text are required'
      });
    }

    // Validate LinkedIn URL
    if (!linkedinUrl.includes('linkedin.com/jobs/')) {
      return res.status(400).json({
        error: 'Invalid LinkedIn job URL. Please provide a URL from linkedin.com/jobs/'
      });
    }

    console.log('Starting LinkedIn job scraping for URL:', linkedinUrl);
    // Scrape job details from LinkedIn using the cloud service
    const jobDetails = await scrapeLinkedInJob(linkedinUrl);
    
    // Log detailed job information
    console.log('Job details extracted:', {
      title: jobDetails.title,
      company: jobDetails.company,
      location: jobDetails.location,
      employmentType: jobDetails.employmentType,
      postedDate: jobDetails.postedDate,
      descriptionLength: jobDetails.description.length,
      requirementsCount: jobDetails.requirements.length,
      skillsFound: jobDetails.skills,
      descriptionPreview: jobDetails.description.substring(0, 200) + '...'
    });

    // If we didn't get a proper description, return an error
    if (!jobDetails.description || jobDetails.description === 'No description available') {
      return res.status(400).json({
        error: 'Failed to extract job description. Please check the URL and try again.'
      });
    }

    console.log('Starting resume tailoring');
    // Create a comprehensive job description for tailoring
    const jobDescription = `
      Position: ${jobDetails.title}
      Company: ${jobDetails.company}
      Location: ${jobDetails.location}
      ${jobDetails.employmentType ? `Employment Type: ${jobDetails.employmentType}` : ''}
      ${jobDetails.postedDate ? `Posted: ${jobDetails.postedDate}` : ''}

      Job Description:
      ${jobDetails.description}

      Key Requirements:
      ${jobDetails.requirements.map(req => `- ${req}`).join('\n')}

      Required Skills:
      ${jobDetails.skills.map(skill => `- ${skill}`).join('\n')}
    `;

    // Tailor the resume using the job details
    const tailoredResume = await tailorResume(resumeText, {
      id: jobDetails.title.toLowerCase().replace(/\s+/g, '-'),
      title: jobDetails.title,
      description: jobDescription
    });

    console.log('Resume tailoring completed');
    res.json({
      jobDetails,
      tailoredResume,
      message: 'Resume tailored successfully based on LinkedIn job posting'
    });

  } catch (error) {
    console.error('Detailed error in scrapeAndTailorResume:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });
    
    res.status(500).json({
      error: 'Failed to process LinkedIn job posting',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 