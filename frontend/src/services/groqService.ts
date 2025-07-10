import type { TechRole } from '../components/Resume/RoleSelector';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';  // Fixed API endpoint

export const tailorResume = async (resumeText: string, role: TechRole): Promise<string> => {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key is not configured. Please check your .env file.');
  }

  try {
    console.log('Starting resume tailoring for role:', role.title);
    console.log('API Key present:', !!GROQ_API_KEY);
    
    const prompt = `
      You are a professional resume tailoring expert. Please analyze and modify the following resume 
      to better target a ${role.title} position. Focus on:
      1. Highlighting relevant skills and experiences for ${role.title}
      2. Using industry-specific keywords
      3. Emphasizing achievements that align with ${role.description}
      4. Maintaining a professional and concise tone
      5. Preserving factual information while optimizing presentation

      Original Resume:
      ${resumeText}

      Please provide the tailored resume text maintaining the original structure but optimized for the role.
    `;

    console.log('Sending request to Groq API...');
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',  // Updated to current model name
        messages: [
          {
            role: 'system',
            content: 'You are a professional resume tailoring expert.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 32768
      }),
    });

    console.log('Groq API Response Status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API Error Response:', errorData);
      throw new Error(`Failed to get response from Groq API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Groq API Response received successfully');
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected API response structure:', data);
      throw new Error('Invalid response format from Groq API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Detailed error in tailoring resume:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to tailor resume: ${error.message}`);
    }
    throw new Error('Failed to tailor resume: Unknown error');
  }
}; 