import puppeteer from 'puppeteer';

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

export async function scrapeLinkedInJob(jobUrl: string): Promise<JobDetails> {
  console.log('Initializing Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--single-process',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ],
    executablePath: process.env.NODE_ENV === 'production' 
      ? '/usr/bin/google-chrome'
      : process.env.PUPPETEER_EXECUTABLE_PATH || undefined
  });

  try {
    console.log('Creating new page...');
    const page = await browser.newPage();
    
    // Set a more realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport to a common desktop size
    await page.setViewport({ width: 1920, height: 1080 });

    // Add extra headers to avoid detection
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document'
    });

    console.log('Navigating to LinkedIn job URL:', jobUrl);
    await page.goto(jobUrl, { 
      waitUntil: 'networkidle0',
      timeout: 60000 // 60 seconds timeout
    });

    // Wait for the main content to load with multiple selector attempts
    try {
      await Promise.race([
        page.waitForSelector('.top-card-layout__card', { timeout: 10000 }),
        page.waitForSelector('.job-details-jobs-unified-top-card__content', { timeout: 10000 }),
        page.waitForSelector('.jobs-unified-top-card', { timeout: 10000 })
      ]);
    } catch (error) {
      console.log('Initial selector wait failed, trying alternative approach...');
      // If the main selectors fail, wait for any job-related content
      await page.waitForFunction(() => {
        return document.body.innerText.includes('job') || 
               document.body.innerText.includes('Job Description') ||
               document.body.innerText.includes('About the job');
      }, { timeout: 15000 });
    }

    console.log('Page loaded, extracting job details...');
    // Extract job details
    const jobDetails = await page.evaluate(() => {
      function getTextContent(selector: string): string {
        const element = document.querySelector(selector);
        return element ? element.textContent?.trim() || '' : '';
      }

      function getTextContentFromMultiple(selectors: string[]): string {
        for (const selector of selectors) {
          const text = getTextContent(selector);
          if (text) return text;
        }
        return '';
      }

      // Extract skills from the job description
      const extractSkills = (text: string): string[] => {
        const commonSkills = [
          'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'React', 'Angular',
          'Vue.js', 'Node.js', 'Express', 'MongoDB', 'SQL', 'AWS', 'Docker',
          'Kubernetes', 'Git', 'CI/CD', 'Agile', 'Scrum', 'REST API', 'GraphQL',
          'HTML', 'CSS', 'SASS', 'LESS', 'Redux', 'Vue', 'jQuery', 'Bootstrap',
          'Tailwind', 'Material-UI', 'Webpack', 'Babel', 'ESLint', 'Jest',
          'Mocha', 'Chai', 'Cypress', 'Selenium', 'PHP', 'Laravel', 'Ruby',
          'Rails', 'Django', 'Flask', 'Spring', 'ASP.NET', '.NET', 'C#',
          'Swift', 'Kotlin', 'Android', 'iOS', 'React Native', 'Flutter'
        ];

        return commonSkills.filter(skill => 
          text.toLowerCase().includes(skill.toLowerCase())
        );
      };

      // Extract requirements from description
      const extractRequirements = (text: string): string[] => {
        const lines = text.split(/[\n\r]+/);
        return lines
          .filter(line => {
            const trimmed = line.trim();
            return (
              trimmed.startsWith('•') || 
              trimmed.startsWith('-') ||
              trimmed.startsWith('*') ||
              /^\d+\./.test(trimmed) ||
              trimmed.toLowerCase().includes('required') ||
              trimmed.toLowerCase().includes('qualification') ||
              trimmed.toLowerCase().includes('experience with') ||
              trimmed.toLowerCase().includes('experience in') ||
              trimmed.toLowerCase().includes('you will need') ||
              trimmed.toLowerCase().includes('you should have')
            );
          })
          .map(line => line.trim())
          .filter(line => line.length > 0);
      };

      // Get the job title
      const title = getTextContentFromMultiple([
        '.top-card-layout__title',
        '.job-details-jobs-unified-top-card__job-title',
        'h1'
      ]);

      // Get the company name
      const company = getTextContentFromMultiple([
        '.topcard__org-name-link',
        '.top-card-layout__company-name',
        '.job-details-jobs-unified-top-card__company-name'
      ]);

      // Get the location
      const location = getTextContentFromMultiple([
        '.topcard__flavor--bullet',
        '.top-card-layout__bullet',
        '.job-details-jobs-unified-top-card__bullet'
      ]);

      // Get employment type
      const employmentType = getTextContentFromMultiple([
        '.job-details-jobs-unified-top-card__workplace-type',
        '.top-card-layout__workplace-type',
        '.job-details-jobs-unified-top-card__job-type'
      ]);

      // Get posted date
      const postedDate = getTextContentFromMultiple([
        '.posted-time-ago__text',
        '.job-posted-date',
        '.top-card-layout__posted-date'
      ]);

      // Get the job description
      const description = getTextContentFromMultiple([
        '.description__text',
        '.show-more-less-html__markup',
        '.job-description'
      ]);

      // If we can't get the description from the main selectors, try to get all text from the description container
      const descriptionContainer = document.querySelector('.description__text') || 
                                 document.querySelector('.show-more-less-html__markup') ||
                                 document.querySelector('.job-description');
      
      const fullDescription = description || (descriptionContainer ? descriptionContainer.textContent?.trim() : '');

      return {
        title: title || 'Unknown Title',
        company: company || 'Unknown Company',
        location: location || 'Unknown Location',
        description: fullDescription || 'No description available',
        employmentType: employmentType || undefined,
        postedDate: postedDate || undefined,
        requirements: extractRequirements(fullDescription || ''),
        skills: extractSkills(fullDescription || '')
      };
    });

    // Take a screenshot for debugging if details are missing
    if (!jobDetails.description || jobDetails.description === 'No description available') {
      await page.screenshot({ path: 'linkedin-debug.png' });
      console.log('Saved debug screenshot as linkedin-debug.png');
    }

    console.log('Successfully extracted job details:', {
      title: jobDetails.title,
      company: jobDetails.company,
      location: jobDetails.location,
      employmentType: jobDetails.employmentType,
      postedDate: jobDetails.postedDate,
      descriptionLength: jobDetails.description.length,
      requirementsCount: jobDetails.requirements.length,
      skillsCount: jobDetails.skills.length
    });

    return jobDetails;
  } catch (error) {
    console.error('Error in scrapeLinkedInJob:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      url: jobUrl
    });
    throw new Error(`Failed to scrape LinkedIn job: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    try {
      console.log('Closing browser...');
      await browser.close();
    } catch (error) {
      console.error('Error closing browser:', error);
    }
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