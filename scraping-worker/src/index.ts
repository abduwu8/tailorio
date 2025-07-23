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

interface Env {
  ALLOWED_ORIGINS: string;
}

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

function extractSkills(text: string): string[] {
  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
}

function extractRequirements(text: string): string[] {
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
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { url } = await request.json();

    if (!url || !url.includes('linkedin.com/jobs/')) {
      return new Response(
        JSON.stringify({ error: 'Invalid LinkedIn job URL' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS,
          }
        }
      );
    }

    // Fetch the LinkedIn page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn page: ${response.status}`);
    }

    const html = await response.text();

    // Use regex to extract job details
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/) || 
                      html.match(/class="top-card-layout__title"[^>]*>([^<]+)</) ||
                      html.match(/class="job-details-jobs-unified-top-card__job-title"[^>]*>([^<]+)</);
    
    const companyMatch = html.match(/class="topcard__org-name-link"[^>]*>([^<]+)</) ||
                        html.match(/class="top-card-layout__company-name"[^>]*>([^<]+)</) ||
                        html.match(/class="job-details-jobs-unified-top-card__company-name"[^>]*>([^<]+)</);
    
    const locationMatch = html.match(/class="topcard__flavor--bullet"[^>]*>([^<]+)</) ||
                         html.match(/class="top-card-layout__bullet"[^>]*>([^<]+)</) ||
                         html.match(/class="job-details-jobs-unified-top-card__bullet"[^>]*>([^<]+)</);

    const descriptionMatch = html.match(/class="description__text[^>]*>([\s\S]*?)<\/div>/) ||
                            html.match(/class="show-more-less-html__markup[^>]*>([\s\S]*?)<\/div>/) ||
                            html.match(/class="job-description[^>]*>([\s\S]*?)<\/div>/);

    const employmentTypeMatch = html.match(/class="job-details-jobs-unified-top-card__workplace-type"[^>]*>([^<]+)</) ||
                               html.match(/class="top-card-layout__workplace-type"[^>]*>([^<]+)</) ||
                               html.match(/class="job-details-jobs-unified-top-card__job-type"[^>]*>([^<]+)</);

    const postedDateMatch = html.match(/class="posted-time-ago__text"[^>]*>([^<]+)</) ||
                           html.match(/class="job-posted-date"[^>]*>([^<]+)</) ||
                           html.match(/class="top-card-layout__posted-date"[^>]*>([^<]+)</);

    const description = descriptionMatch ? 
      descriptionMatch[1]
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim() : 
      'No description available';

    const jobDetails: JobDetails = {
      title: titleMatch ? titleMatch[1].trim() : 'Unknown Title',
      company: companyMatch ? companyMatch[1].trim() : 'Unknown Company',
      location: locationMatch ? locationMatch[1].trim() : 'Unknown Location',
      description,
      employmentType: employmentTypeMatch ? employmentTypeMatch[1].trim() : undefined,
      postedDate: postedDateMatch ? postedDateMatch[1].trim() : undefined,
      requirements: extractRequirements(description),
      skills: extractSkills(description)
    };

    return new Response(
      JSON.stringify(jobDetails),
      { 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS,
          'Cache-Control': 'no-store',
        }
      }
    );

  } catch (error) {
    console.error('Error in handleRequest:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to scrape LinkedIn job',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS,
        }
      }
    );
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return handleRequest(request, env);
  },
}; 