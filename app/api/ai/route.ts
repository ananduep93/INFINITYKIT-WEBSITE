import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

// ─── Environment Keys (Server-side, never exposed to client) ──────────────────
const ENV_GEMINI_KEY = process.env.GEMINI_API_KEY || '';

// ─── Rate Limiting ────────────────────────────────────────────────────────────
interface RateLimitRecord { timestamps: number[] }
const rateLimitMap = new Map<string, RateLimitRecord>();
const LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { timestamps: [now] });
    return false;
  }
  const record = rateLimitMap.get(ip)!;
  record.timestamps = record.timestamps.filter(ts => now - ts < LIMIT_WINDOW_MS);
  if (record.timestamps.length >= MAX_REQUESTS_PER_WINDOW) return true;
  record.timestamps.push(now);
  return false;
}

function sanitizeInput(text: string): string {
  if (!text) return '';
  return text
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim();
}

// ─── System Prompts ───────────────────────────────────────────────────────────
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
    case 'translate':
      prompt = 'You are a professional certified translator with expertise in all major world languages. Translate the provided text accurately and naturally into the target language specified by the user. Preserve the original meaning, tone, and formatting. Return ONLY the translated text without any explanation, introduction, or commentary.';
      break;
    default:
      prompt = 'You are a precise, highly intelligent digital assistant. Answer the user\'s request accurately and professionally using Markdown formatting.';
  }
  if (context) {
    prompt += `\n\nAdditional Context/Input Material:\n"""\n${context}\n"""`;
  }
  return prompt;
}

// ─── AI Providers ─────────────────────────────────────────────────────────────

// Gemini via official SDK (supports both AIzaSy and AQ. key formats)
async function queryGemini(key: string, system: string, prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: system
  });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text) throw new Error('Gemini returned empty response');
  return text;
}

// Gemini via REST API (alternative if SDK fails)
async function queryGeminiRest(key: string, system: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
    })
  });
  if (!resp.ok) {
    const err = await resp.text().catch(() => '');
    throw new Error(`Gemini REST ${resp.status}: ${err.slice(0, 200)}`);
  }
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text) throw new Error('Gemini REST returned empty response');
  return text;
}

// Pollinations free fallback
async function queryPollinations(system: string, prompt: string): Promise<string> {
  const resp = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ],
      model: 'openai-large',
      seed: Math.floor(Math.random() * 1000000)
    })
  });
  if (!resp.ok) {
    const err = await resp.text().catch(() => '');
    throw new Error(`Pollinations ${resp.status}: ${err.slice(0, 200)}`);
  }
  const text = await resp.text();
  if (!text || text.trim().length < 5) throw new Error('Pollinations returned empty response');
  return text;
}

// OpenAI (only used if user explicitly provides their own OpenAI key)
async function queryOpenAI(key: string, system: string, prompt: string): Promise<string> {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
      temperature: 0.7
    })
  });
  if (!resp.ok) {
    const err = await resp.text().catch(() => '');
    throw new Error(`OpenAI ${resp.status}: ${err.slice(0, 200)}`);
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

// ─── Main Route Handler ────────────────────────────────────────────────────────
export async function POST(request: Request) {
  // Rate limit check
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  if (isRateLimited(clientIp)) {
    return NextResponse.json({
      error: 'Too many requests. Please wait a moment and try again.'
    }, { status: 429, headers: { 'Retry-After': '60' } });
  }

  try {
    const body = await request.json();
    const prompt = sanitizeInput(body.prompt || '');
    const taskType = sanitizeInput(body.taskType || '');
    const context = sanitizeInput(body.context || '');

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    if (prompt.length > 30000) {
      return NextResponse.json({ error: 'Prompt too long (max 30,000 characters)' }, { status: 400 });
    }

    // Read user-provided keys (optional — from body or headers, WAF-safe)
    const userGeminiKey = (body.geminiKey || request.headers.get('x-gemini-key') || '').trim();
    const userOpenaiKey = (body.openaiKey || request.headers.get('x-openai-key') || '').trim();

    const systemPrompt = getSystemPrompt(taskType, context);
    let responseText = '';
    let usedEngine = '';
    const errors: string[] = [];

    // ── TIER 1: Our Server Gemini Key (Primary — always try this first) ────────
    if (ENV_GEMINI_KEY && !responseText) {
      try {
        console.log('[AI] Trying server Gemini key (SDK)...');
        responseText = await queryGemini(ENV_GEMINI_KEY, systemPrompt, prompt);
        usedEngine = 'Gemini';
      } catch (e: any) {
        errors.push(`Server Gemini SDK: ${e.message}`);
        console.warn('[AI] Server Gemini SDK failed, trying REST...', e.message);
        // Try REST fallback with same key
        try {
          responseText = await queryGeminiRest(ENV_GEMINI_KEY, systemPrompt, prompt);
          usedEngine = 'GeminiREST';
        } catch (e2: any) {
          errors.push(`Server Gemini REST: ${e2.message}`);
          console.warn('[AI] Server Gemini REST also failed:', e2.message);
        }
      }
    }

    // ── TIER 2: User's Personal Gemini Key (if they saved one in settings) ─────
    if (!responseText && userGeminiKey && userGeminiKey !== ENV_GEMINI_KEY) {
      try {
        console.log('[AI] Trying user Gemini key...');
        responseText = await queryGemini(userGeminiKey, systemPrompt, prompt);
        usedEngine = 'Gemini';
      } catch (e: any) {
        errors.push(`User Gemini: ${e.message}`);
        console.warn('[AI] User Gemini key failed:', e.message);
      }
    }

    // ── TIER 3: User's Personal OpenAI Key (if they explicitly set one) ────────
    if (!responseText && userOpenaiKey) {
      try {
        console.log('[AI] Trying user OpenAI key...');
        responseText = await queryOpenAI(userOpenaiKey, systemPrompt, prompt);
        usedEngine = 'OpenAI';
      } catch (e: any) {
        errors.push(`User OpenAI: ${e.message}`);
        console.warn('[AI] User OpenAI key failed:', e.message);
      }
    }

    // ── TIER 4: Pollinations Free (no key needed) ─────────────────────────────
    if (!responseText) {
      try {
        console.log('[AI] Trying Pollinations free fallback...');
        responseText = await queryPollinations(systemPrompt, prompt);
        usedEngine = 'Pollinations';
      } catch (e: any) {
        errors.push(`Pollinations: ${e.message}`);
        console.warn('[AI] Pollinations failed:', e.message);
      }
    }

    // ── ALL TIERS FAILED ──────────────────────────────────────────────────────
    if (!responseText) {
      console.error('[AI] All tiers failed:', errors.join(' | '));
      return NextResponse.json({
        error: 'AI service is temporarily unavailable. You can add your own free Gemini API key via the ⚡ AI Key button in the sidebar to ensure uninterrupted access.',
        fallbackSuggestion: true
      }, { status: 503 });
    }

    const response = NextResponse.json({
      text: responseText,
      engine: usedEngine,
      isFallback: usedEngine === 'Pollinations'
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;

  } catch (error: any) {
    console.error('[AI] Unhandled error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
