import { Injectable, InternalServerErrorException } from '@nestjs/common';
export interface MeetingIntelligenceOutput {
  summary: string;
  actionItems: Array<{
    title: string;
    owner: string | null;
    deadline: string | null;
  }>;
  tasks: Array<{
    title: string;
    status: 'todo' | 'doing' | 'done';
  }>;
  decisions: string[];
  keyPoints: string[];
  keywords: string[];
}

@Injectable()
export class GeminiService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly model: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
  }

  async generateMeetingIntelligence(
    meetingTitle: string,
    meetingText: string,
    language: string = 'en',
  ): Promise<MeetingIntelligenceOutput> {
    if (!this.apiKey) {
      throw new InternalServerErrorException(
        'GEMINI_API_KEY is not configured',
      );
    }

    const systemPrompt = this.buildSystemPrompt(language);
    const userPrompt = this.buildUserPrompt(meetingTitle, meetingText);

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: userPrompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Gemini API Error:', errorBody);
        throw new InternalServerErrorException(
          `Gemini API error: ${response.status} - ${errorBody}`,
        );
      }

      const result = await response.json();
      
      const generatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new InternalServerErrorException(
          'No response generated from Gemini API',
        );
      }

      const parsed = this.parseResponse(generatedText);
      return parsed;

    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      console.error('Gemini service error:', error);
      throw new InternalServerErrorException(
        `Failed to process meeting text: ${error.message}`,
      );
    }
  }


  private buildSystemPrompt(language: string): string {
    const languageInstruction = language === 'ar' 
      ? 'Respond in Arabic language.'
      : 'Respond in English language.';

    return `You are a professional meeting intelligence assistant. Your task is to analyze meeting transcripts or notes and extract structured information.

${languageInstruction}

You must respond with a valid JSON object following this exact schema:
{
  "summary": "A concise summary of the meeting (2-4 sentences)",
  "actionItems": [
    {
      "title": "Action item description",
      "owner": "Person responsible or null",
      "deadline": "Due date or null"
    }
  ],
  "tasks": [
    {
      "title": "Task description",
      "status": "todo"
    }
  ],
  "decisions": ["List of decisions made during the meeting"],
  "keyPoints": ["Key discussion points and important topics"],
  "keywords": ["Relevant keywords and topics from the meeting"]
}

Guidelines:
- Extract all action items mentioned with their owners if specified
- Convert action items to tasks with status "todo"
- Identify clear decisions that were made
- Summarize key discussion points
- Extract relevant keywords for categorization
- Be accurate and do not invent information not in the text
- Keep the summary concise but comprehensive`;
  }

  private buildUserPrompt(meetingTitle: string, meetingText: string): string {
    return `Analyze the following meeting and extract structured intelligence:

Meeting Title: ${meetingTitle}

Meeting Content:
${meetingText}

Please provide the analysis in JSON format.`;
  }

  private parseResponse(responseText: string): MeetingIntelligenceOutput {
    try {
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
      }
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3);
      }
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
      }
      cleanedText = cleanedText.trim();

      const parsed = JSON.parse(cleanedText);

      return {
        summary: parsed.summary || '',
        actionItems: Array.isArray(parsed.actionItems)
          ? parsed.actionItems.map((item: any) => ({
              title: item.title || '',
              owner: item.owner || null,
              deadline: item.deadline || null,
            }))
          : [],
        tasks: Array.isArray(parsed.tasks)
          ? parsed.tasks.map((task: any) => ({
              title: task.title || '',
              status: ['todo', 'doing', 'done'].includes(task.status)
                ? task.status
                : 'todo',
            }))
          : [],
        decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      };
    } catch (error) {
      console.error('Failed to parse Gemini response:', responseText);
      throw new InternalServerErrorException(
        'Failed to parse AI response. Please try again.',
      );
    }
  }
}
