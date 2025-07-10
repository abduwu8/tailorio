import { PDFExtract } from 'pdf.js-extract';
import { IResume } from '../models/Resume';
import { model } from 'mongoose';
import path from 'path';
import { Groq } from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface PDFExtractText {
  str: string;
  x: number;
  y: number;
  fontName?: string;
  height?: number;
  width?: number;
}

interface PDFPage {
  content: PDFExtractText[];
}

interface PDFExtractResult {
  pages: PDFPage[];
}

interface TextBlock {
  text: string;
  x: number;
  y: number;
  isBold?: boolean;
  fontSize?: number;
  isHeader?: boolean;
}

const pdfExtract = new PDFExtract();

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    const data = await pdfExtract.extract(filePath) as PDFExtractResult;
    if (!data.pages || data.pages.length === 0) {
      throw new Error('No pages found in PDF');
    }

    let allBlocks: TextBlock[] = [];
    const marginThreshold = 5; // Tolerance for alignment
    let mostCommonX = 0; // Will store the most common x position for content

    // First pass: Collect all text blocks and analyze layout
    for (const page of data.pages) {
      const contents = page.content;
      
      // Find the most common x position (likely the main content alignment)
      const xPositions = contents.map(c => Math.round(c.x / marginThreshold) * marginThreshold);
      const xCounts = xPositions.reduce((acc, x) => {
        acc[x] = (acc[x] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      mostCommonX = Number(Object.entries(xCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 0);

      let currentY = contents[0]?.y || 0;
      let currentLine: PDFExtractText[] = [];

      for (const content of contents) {
        if (Math.abs(content.y - currentY) > marginThreshold) {
          // Process previous line
          if (currentLine.length > 0) {
            const block = processTextLine(currentLine, mostCommonX);
            if (block) allBlocks.push(block);
            currentLine = [];
          }
          currentY = content.y;
        }
        currentLine.push(content);
      }

      // Process last line of the page
      if (currentLine.length > 0) {
        const block = processTextLine(currentLine, mostCommonX);
        if (block) allBlocks.push(block);
      }
    }

    // Second pass: Identify headers and structure
    allBlocks = identifyHeaders(allBlocks);

    // Third pass: Format the text with proper structure
    const formattedText = formatBlocks(allBlocks);
    return formattedText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

function processTextLine(line: PDFExtractText[], mostCommonX: number): TextBlock | null {
  if (line.length === 0) return null;

  // Sort line contents by x position
  line.sort((a, b) => a.x - b.x);

  const text = line.map(item => item.str).join(' ').trim();
  if (!text) return null;

  // Calculate average font properties
  const avgX = line.reduce((sum, item) => sum + item.x, 0) / line.length;
  const isBold = line.some(item => item.fontName?.toLowerCase().includes('bold'));
  const fontSize = Math.max(...line.map(item => item.height || 0));

  return {
    text,
    x: avgX,
    y: line[0].y,
    isBold,
    fontSize
  };
}

function identifyHeaders(blocks: TextBlock[]): TextBlock[] {
  if (blocks.length === 0) return blocks;

  // Calculate average font size
  const avgFontSize = blocks.reduce((sum, block) => sum + (block.fontSize || 0), 0) / blocks.length;

  return blocks.map(block => {
    // A block is likely a header if it meets any of these criteria:
    const isHeader = 
      // 1. Text is all caps and ends with a colon
      (block.text === block.text.toUpperCase() && block.text.endsWith(':')) ||
      // 2. Significantly larger font size than average
      ((block.fontSize || 0) > avgFontSize * 1.2) ||
      // 3. Bold text at the start of a line
      (block.isBold && block.x < blocks[0].x + 20) ||
      // 4. Common header patterns
      /^(EDUCATION|EXPERIENCE|SKILLS|PROJECTS|SUMMARY|OBJECTIVE|CERTIFICATIONS|ACHIEVEMENTS|PUBLICATIONS|LANGUAGES|INTERESTS):/i.test(block.text);

    return { ...block, isHeader };
  });
}

function formatBlocks(blocks: TextBlock[]): string {
  let formattedText = '';
  let currentIndentation = '';
  let lastWasHeader = false;

  blocks.forEach((block, index) => {
    const nextBlock = blocks[index + 1];
    
    // Determine if this is the start of a new section
    if (block.isHeader) {
      // Add extra line break between sections
      if (formattedText && !lastWasHeader) {
        formattedText += '\n';
      }
      formattedText += `\n${block.text}\n`;
      lastWasHeader = true;
    } else {
      // Handle bullet points and other content
      let line = block.text;
      
      // Preserve bullet points and other list markers
      const isListItem = /^[•\-\*\⋅∙◦◆◇○●]/.test(line);
      
      // Calculate indentation based on x position relative to the first block
      const relativeX = block.x - blocks[0].x;
      currentIndentation = relativeX > 20 ? '  ' : '';

      // Add appropriate spacing
      if (!lastWasHeader && !isListItem) {
        formattedText += '\n';
      }

      // Add the line with proper indentation
      formattedText += `${currentIndentation}${line}`;
      lastWasHeader = false;
    }
  });

  return formattedText;
}

export const getTextAnalysis = (text: string) => {
  return {
    wordCount: text.trim().split(/\s+/).length,
    characterCount: text.replace(/\s/g, '').length,
  };
};

const Resume = model<IResume>('Resume');

export const saveResume = async (fileInfo: {
  originalName: string;
  fileName: string;
  path: string;
}) => {
  try {
    const extractedText = await extractTextFromPDF(fileInfo.path);
    const textAnalysis = getTextAnalysis(extractedText);

    const resume = new Resume({
      originalName: fileInfo.originalName,
      fileName: fileInfo.fileName,
      path: `/uploads/${fileInfo.fileName}`,
      uploadDate: new Date(),
      extractedText,
      textAnalysis,
    });

    await resume.save();
    return resume;
  } catch (error) {
    console.error('Error saving resume:', error);
    throw error;
  }
}; 

interface TechRole {
  id: string;
  title: string;
  description: string;
}

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

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
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

    if (!response.ok) {
      throw new Error(`Failed to tailor resume: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in tailorResume:', error);
    throw error;
  }
}; 