import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env file from server directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Also try loading from process.cwd() as fallback
if (!process.env.GEMINI_API_KEY) {
  dotenv.config();
}

if (!process.env.GEMINI_API_KEY) {
  throw new Error(`GEMINI_API_KEY environment variable is not set. Tried loading from: ${envPath}`);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export interface GeminiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function callGemini(prompt: string, maxRetries = 3): Promise<GeminiResponse> {
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse as JSON first
      try {
        const jsonData = JSON.parse(text);
        return { success: true, data: jsonData };
      } catch (parseError) {
        // If not JSON, try to extract JSON from markdown code blocks
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            const jsonData = JSON.parse(jsonMatch[1]);
            return { success: true, data: jsonData };
          } catch (e) {
            // If JSON extraction fails, return as plain text
            return { success: true, data: text.trim() };
          }
        }
        // If no JSON found, return as plain text (for advisor chat)
        return { success: true, data: text.trim() };
      }
    } catch (error: any) {
      console.error(`Gemini API attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        return {
          success: false,
          error: error.message || 'Failed to generate response from Gemini'
        };
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  return {
    success: false,
    error: 'Max retries exceeded'
  };
}

