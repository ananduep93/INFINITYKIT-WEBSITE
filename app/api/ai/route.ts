import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Edge runtime: closer to user, lower latency ─────────────────────────────
export const runtime = 'edge';

// ─── Dynamic: AI responses are never static cached ───────────────────────────
export const dynamic = 'force-dynamic';

// Initialize with graceful fallback
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

export async function POST(request: Request) {
  let prompt = '';
  let taskType = '';
  try {
    const body = await request.json();
    prompt = body.prompt || '';
    taskType = body.taskType || '';
    const context = body.context;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!apiKey) {
      // Elegant demo mode fallback if API key is not configured
      let dummyResponse = '';
      if (taskType === 'chat') {
        dummyResponse = `👋 Hi there! I'm in Demo Mode because no GEMINI_API_KEY was found in environment variables.\n\nHere is a mock response to your query: "${prompt}".\n\nTo enable full capabilities, please configure the GEMINI_API_KEY in your .env file!`;
      } else if (taskType === 'improve') {
        dummyResponse = `[DEMO MODE IMPROVEMENT] Here is a polished version of your text:\n"${prompt}" -> Enhanced for ultimate clarity, professional tone, and absolute grammatical accuracy.`;
      } else {
        dummyResponse = `• Bullet Item 1: Summary of main thesis from text\n• Bullet Item 2: Explanation of key diagnostic metrics\n• Bullet Item 3: Concluding core takeaway guidelines`;
      }
      return NextResponse.json({ text: dummyResponse, demo: true });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let systemInstruction = '';
    if (taskType === 'chat') {
      systemInstruction = 'You are Infinity AI, a helpful, precise, and state-of-the-art digital assistant. Keep your responses structured, clear, and highly engaging.';
    } else if (taskType === 'improve') {
      systemInstruction = 'You are a professional editor. Rewrite, format, and enhance the provided text. Fix any spelling or grammar mistakes, and elevate its structural flow.';
    } else if (taskType === 'summarize') {
      systemInstruction = 'You are a precise summarization engine. Distill the following document into clear, concise bullet points outlining the main thesis and key topics.';
    }

    const combinedPrompt = `${systemInstruction}\n\nInput Context/Text:\n${context || ''}\n\nUser Message/Request:\n${prompt}`;

    const result = await model.generateContent(combinedPrompt);
    const responseText = result.response.text();

    // ─── Response headers ───────────────────────────────────────────────────
    const response = NextResponse.json({ text: responseText, demo: false });
    // AI responses are dynamic/personalized — no CDN caching
    response.headers.set('Cache-Control', 'no-store, no-cache');
    return response;

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const errMessage = error.message || '';
    const isApiKeyError = errMessage.includes('API key') ||
      errMessage.includes('leaked') ||
      errMessage.includes('API_KEY') ||
      errMessage.includes('403') ||
      errMessage.includes('404') ||
      errMessage.includes('not found');

    if (isApiKeyError) {
      console.warn('[Gemini API Key Warning] Leaked, invalid, or revoked API key detected. Falling back to Demo Mode.');
      let dummyResponse = '';
      if (taskType === 'chat') {
        dummyResponse = `⚠️ [DEMO MODE FALLBACK - API KEY ISSUE]\nThe configured Gemini API key has been reported as leaked or revoked by Google.\n\nTo restore full capabilities, please set a valid GEMINI_API_KEY. Here is a simulated response:\n\n"Hello! Since the API key is not currently active, I am running in local offline demo mode to showcase my interface. How can I assist you with your project today?"`;
      } else if (taskType === 'improve') {
        dummyResponse = `⚠️ [DEMO MODE FALLBACK - API KEY ISSUE]\nThe configured Gemini API key has been reported as leaked or revoked by Google.\n\nSimulated output:\n"${prompt}" -> Polished perfectly for clarity, tone, and grammar.`;
      } else {
        dummyResponse = `⚠️ [DEMO MODE FALLBACK - API KEY ISSUE]\nThe configured Gemini API key has been reported as leaked or revoked by Google.\n\nSimulated bullet points:\n• Distilled core summary item 1\n• Distilled core summary item 2\n• Distilled core summary item 3`;
      }
      return NextResponse.json({
        text: dummyResponse,
        demo: true,
        warning: 'The configured Gemini API key is leaked or invalid. Running in Demo Mode.'
      });
    }

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
