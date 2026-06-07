import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

const envGeminiKey = process.env.GEMINI_API_KEY || '';
const envOpenaiKey = process.env.OPENAI_API_KEY || '';
const envOpenrouterKey = process.env.OPENROUTER_API_KEY || '';

// ─── SERVER-SIDE SECURITY & RATE LIMITING ───────────────────────────────────

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const LIMIT_WINDOW_MS = 60 * 1000;      // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60;    // 60 requests per minute limit

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { timestamps: [now] });
    return false;
  }

  const record = rateLimitMap.get(ip)!;
  // Filter timestamps keeping only those within the active 60-second window
  record.timestamps = record.timestamps.filter(ts => now - ts < LIMIT_WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.timestamps.push(now);
  return false;
}

function sanitizeInput(text: string): string {
  if (!text) return '';
  // Strip potential script injections & dangerous tags
  return text
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim();
}

// Smart System Prompts Generator
function getSystemPrompt(taskType: string, context?: string): string {
  let prompt = '';
  switch (taskType) {
    case 'humanize':
      prompt = 'You are an expert copywriter and elite AI humanizer. Your task is to rewrite the input text to make it sound 100% human-written, highly natural, engaging, readable, and professional. Completely avoid robotic, clunky, or overly complex generic structures commonly flagged by AI detectors (e.g., "delve", "moreover", "testament", "furthermore", "in conclusion", "it is worth noting"). Vary sentence lengths and structures (burstiness) and use a natural, organic vocabulary. Retain the exact original meaning, formatting, and key facts. Return ONLY the rewritten humanized text, with no introductory or concluding chat remarks.';
      break;
    case 'essay':
      prompt = 'You are an elite academic writer. Generate a highly structured, well-researched, and persuasive essay on the user\'s topic. Include a clear thesis statement, well-developed supporting arguments, professional vocabulary, appropriate academic transitions, and a solid conclusion. Format the essay beautifully with Markdown headings, subheadings, and lists where appropriate.';
      break;
    case 'blog':
    case 'article':
      prompt = 'You are a professional blogger and content marketer. Create a highly engaging, SEO-optimized blog article. Use catchy headings, short readable paragraphs, bullet points, a conversational yet professional tone, and add a logical FAQ section if appropriate. Keep it highly informative, polished, and beautifully structured using Markdown.';
      break;
    case 'summarize':
      prompt = 'You are a precise, analytical summarization assistant. Extract the core arguments, main themes, and key action items from the provided text. Present them as structured, clean bullet points with a brief introductory overview. Do not lose critical factual context or important metrics.';
      break;
    case 'grammar':
      prompt = 'You are an expert proofreader and grammarian. Correct all grammar, spelling, punctuation, typos, and structural syntax errors in the provided text. Preserve the original meaning, style, and tone, and return ONLY the polished, clean text.';
      break;
    case 'improve':
      prompt = 'You are a professional editor. Rewrite and polish the input text to significantly improve its clarity, vocabulary density, readability, and overall engagement while strictly preserving the original meaning and formatting.';
      break;
    case 'chat':
    case 'assistant':
      prompt = 'You are Infinity AI, an advanced, highly intelligent productivity and learning assistant. Answer the user\'s questions with absolute accuracy, helpfulness, and clear explanations. Use Markdown formatting (headings, code blocks, lists, bold text) to present information beautifully, and keep your responses professional and direct.';
      break;
    case 'faq':
      prompt = 'You are a professional technical writer. Generate a helpful, complete list of Frequently Asked Questions (FAQs) along with precise, highly accurate answers based on the user\'s topic or input content. Use Markdown formatting.';
      break;
    case 'rewrite':
      prompt = 'You are a professional writer. Rewrite the input text using a different structure, polished vocabulary, and enhanced flow. Retain the exact meaning and key points, but offer a fresh perspective. Return ONLY the rewritten text.';
      break;
    default:
      prompt = 'You are a precise, highly intelligent digital assistant. Answer the user\'s request accurately and professionally using Markdown formatting.';
  }

  if (context) {
    prompt += `\n\nAdditional Context/Input Material:\n"""\n${context}\n"""`;
  }
  return prompt;
}

// 1. OpenAI Integration
async function queryOpenAI(openaiKey: string, systemInstruction: string, userPrompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API returned status ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// 2. Google Gemini Integration
async function queryGemini(geminiKey: string, systemInstruction: string, userPrompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    systemInstruction: systemInstruction
  });

  const result = await model.generateContent(userPrompt);
  const responseText = result.response.text();
  return responseText || '';
}

// 3. OpenRouter Integration
async function queryOpenRouter(openrouterKey: string, systemInstruction: string, userPrompt: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openrouterKey}`,
      'HTTP-Referer': 'https://infinitykit.online',
      'X-Title': 'InfinityKit'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API returned status ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// 4. Free, Live Fallback Powered by Pollinations AI Text Endpoint
async function queryPollinationsFree(systemInstruction: string, userPrompt: string): Promise<string> {
  console.log('[Pollinations Free Fallback] Fetching live AI response...');
  const response = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt }
      ],
      model: 'openai',
      seed: Math.floor(Math.random() * 1000000)
    })
  });

  if (!response.ok) {
    throw new Error(`Pollinations free API returned status ${response.status}`);
  }

  const text = await response.text();
  if (!text) {
    throw new Error('Pollinations returned empty response body');
  }
  return text;
}

export async function POST(request: Request) {
  // 1. IP-Based Sliding Window Rate Limiting Check
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  if (isRateLimited(clientIp)) {
    return NextResponse.json({
      error: 'Too many requests. Please slow down and try again in a minute.'
    }, { 
      status: 429,
      headers: { 'Retry-After': '60' }
    });
  }

  let prompt = '';
  let taskType = '';
  let context = '';
  
  try {
    const body = await request.json();
    // 2. HTML sanitization of inputs to prevent script/tag injection
    prompt = sanitizeInput(body.prompt || '');
    taskType = sanitizeInput(body.taskType || '');
    context = sanitizeInput(body.context || '');

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 3. Size boundaries check to prevent excessive payload attacks
    if (prompt.length > 30000) {
      return NextResponse.json({ error: 'Prompt exceeds the maximum allowed payload size (30,000 characters)' }, { status: 400 });
    }

    // Resolve client header keys & env keys
    const clientOpenaiKey = request.headers.get('x-openai-key') || '';
    const clientGeminiKey = request.headers.get('x-gemini-key') || '';
    const clientOpenrouterKey = request.headers.get('x-openrouter-key') || '';

    let openaiKey = clientOpenaiKey || envOpenaiKey;
    let geminiKey = clientGeminiKey || envGeminiKey;
    const openrouterKey = clientOpenrouterKey || envOpenrouterKey;

    // Robust key validation and routing auto-correction
    if (geminiKey && geminiKey.trim().startsWith('sk-')) {
      if (!openaiKey) {
        openaiKey = geminiKey;
      }
      geminiKey = '';
      console.log('[AI API] Auto-routed OpenAI key passed as Gemini key.');
    }
    if (openaiKey && openaiKey.trim().startsWith('AIzaSy')) {
      if (!geminiKey) {
        geminiKey = openaiKey;
      }
      openaiKey = '';
      console.log('[AI API] Auto-routed Gemini key passed as OpenAI key.');
    }

    const systemInstruction = getSystemPrompt(taskType, context);
    let responseText = '';
    let usedTier = '';

    // TIER 1: OpenAI (Primary)
    if (openaiKey) {
      try {
        usedTier = 'OpenAI';
        responseText = await queryOpenAI(openaiKey, systemInstruction, prompt);
      } catch (err: any) {
        console.warn('OpenAI Tier failed, attempting fallback...', err.message);
        if (clientOpenaiKey) {
          return NextResponse.json({ error: `OpenAI API Error: ${err.message}` }, { status: 400 });
        }
      }
    }

    // TIER 2: Google Gemini (Secondary)
    if (!responseText && geminiKey) {
      try {
        usedTier = 'Gemini';
        responseText = await queryGemini(geminiKey, systemInstruction, prompt);
      } catch (err: any) {
        console.warn('Gemini Tier failed, attempting fallback...', err.message);
        if (clientGeminiKey) {
          return NextResponse.json({ error: `Gemini API Error: ${err.message}` }, { status: 400 });
        }
      }
    }

    // TIER 3: OpenRouter
    if (!responseText && openrouterKey) {
      try {
        usedTier = 'OpenRouter';
        responseText = await queryOpenRouter(openrouterKey, systemInstruction, prompt);
      } catch (err: any) {
        console.warn('OpenRouter Tier failed...', err.message);
        if (clientOpenrouterKey) {
          return NextResponse.json({ error: `OpenRouter API Error: ${err.message}` }, { status: 400 });
        }
      }
    }

    // TIER 4: Pollinations Free Live AI Fallback
    if (!responseText) {
      try {
        usedTier = 'PollinationsFree';
        responseText = await queryPollinationsFree(systemInstruction, prompt);
      } catch (err: any) {
        console.error('All AI tiers including Pollinations Free Fallback failed:', err);
        return NextResponse.json({
          error: 'AI service currently experiencing high volume. Please check connection and try again.'
        }, { status: 503 });
      }
    }

    const response = NextResponse.json({
      text: responseText,
      engine: usedTier,
      isFallback: usedTier === 'PollinationsFree'
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;

  } catch (error: any) {
    console.error('Unhandled AI API Route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
