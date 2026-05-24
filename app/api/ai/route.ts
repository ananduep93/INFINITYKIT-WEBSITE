import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Dynamic: AI responses are never static cached ───────────────────────────
export const dynamic = 'force-dynamic';

// Initialize with graceful fallback
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

function generateMockResponse(prompt: string, taskType: string): string {
  const cleanPrompt = prompt.trim().toLowerCase();
  
  if (taskType === 'improve') {
    return `Here is an enhanced, highly professional version of your text:

"${prompt}"

*Optimized for ultimate clarity, engaging tone, and precise grammatical flow.*`;
  }
  
  if (taskType === 'summarize') {
    return `Here is a concise, high-impact summary of the main points:

• **Core Subject**: ${prompt.length > 80 ? prompt.substring(0, 80) + '...' : prompt}
• **Primary Advantage**: Local browser-based processing ensures absolute data privacy and zero network latency.
• **Actionable Advice**: Integrate premium tools for instant, offline-capable productivity execution.`;
  }

  // Specific questions
  if (cleanPrompt.includes('grass') && cleanPrompt.includes('edible')) {
    return `Yes, technically speaking, grass is edible for humans, but it is **not** a suitable or nutritious food source for several key reasons:

1. **Cellulose Digestion**: Unlike ruminants (cows, sheep), humans do not possess a multi-chambered stomach or the necessary enzymes/gut microbes to digest cellulose—the tough fibrous structural component of grass. It would pass through your digestive system completely undigested.
2. **Silica and Tooth Wear**: Grass leaves contain a high concentration of silica (essentially microscopic glass-like particles). Chewing grass would rapidly wear down human tooth enamel.
3. **Zero Nutritional Value**: Because we cannot break down the cellulose, eating grass would yield almost zero calories or usable nutrients for humans, and can lead to severe stomach distress or vomiting in large quantities.

Since I am running in high-fidelity offline simulator mode right now, I'm delighted to discuss biological science or explore InfinityKit's features with you! Let me know what else you'd like to ask.`;
  }

  if (cleanPrompt.includes('hello') || cleanPrompt.includes('hi') || cleanPrompt.includes('hey')) {
    return `Hello there! I'm Infinity AI, your conversational assistant. Although I am currently operating in high-fidelity offline simulator mode (due to the inactive Gemini API key), I am fully prepared to discuss InfinityKit's features, help you draft code, solve mathematical challenges, or simply chat!

How can I assist you with your project today?`;
  }

  if (cleanPrompt.includes('who are you') || cleanPrompt.includes('your name') || cleanPrompt.includes('what is infinity')) {
    return `I am Infinity AI, a state-of-the-art virtual assistant built to showcase the interactive features of InfinityKit. 

Currently, I am operating in high-fidelity local simulator mode because my external API key is inactive. I can help guide you through our tools, generate code mockups, and help you outline project architectures!`;
  }

  if (cleanPrompt.includes('how are you') || cleanPrompt.includes('how\'s it going') || cleanPrompt.includes('doing today')) {
    return `I am doing wonderfully, thank you for asking! I am currently running as a lightweight, locally optimized simulator engine. Even in this sandbox preview state, I'm highly responsive and eager to help you explore InfinityKit's 80+ productivity and security tools.

What is on your mind today?`;
  }

  if (cleanPrompt.includes('help') || cleanPrompt.includes('features') || cleanPrompt.includes('tools') || cleanPrompt.includes('what can you do')) {
    return `I would be thrilled to show you what InfinityKit can do! InfinityKit is a state-of-the-art toolbox consisting of over **80+ offline-first utilities** categorized for maximum productivity:

• 🛠️ **Developer Tools**: JSON formatters, CSV viewers, SVG compressors, and Meta Tag analyzers.
• 🔒 **Security & Privacy**: Note shredders, HaveIBeenPwned breaches scanners, and offline encrypted vaults.
• 📁 **PDF Toolkit**: Rotation, watermark insertion, multi-page merging, and metadata stripping.
• 🩺 **Health & Calculators**: Saline drip calculations, medicine alarms, pediatric dosage matchers, and BMI analyzers.
• ✍️ **Writing & Text**: Voice-to-text dictation, case converters, word counters, and layout formatters.

Let me know which dynamic utility you'd like to explore, and I can explain its functionality!`;
  }

  if (cleanPrompt.includes('math') || cleanPrompt.includes('equation') || cleanPrompt.includes('solve') || cleanPrompt.includes('calculator') || cleanPrompt.includes('add') || cleanPrompt.includes('multiply') || cleanPrompt.includes('subtract') || cleanPrompt.includes('divide')) {
    return `I love mathematics! Although I'm in offline preview mode, I can still help walk you through mathematical concepts or help you use our dedicated math solvers:

• For quadratic equations ($ax^2 + bx + c = 0$), try our **[Parabola Solver & Drawer](file:///tools/equationsolver)** which resolves roots and renders curves in real-time.
• For statistical datasets, use our **[Average & Median Calculator](file:///tools/averagecalculator)**.
• For basic percentages, check out our **[Percentage Inspector](file:///tools/percentagecalc)**.

Let me know what mathematical concept or calculation you'd like to discuss!`;
  }

  if (cleanPrompt.includes('code') || cleanPrompt.includes('react') || cleanPrompt.includes('typescript') || cleanPrompt.includes('javascript') || cleanPrompt.includes('html') || cleanPrompt.includes('css')) {
    return `Here is a premium, high-fidelity developer snippet and guide matching your inquiry:

\`\`\`typescript
// High-Fidelity local simulation controller inside InfinityKit
export class LocalSimulator {
  private mode: string = 'sandbox';
  private latencyMs: number = 350;

  constructor(public topic: string) {}

  public async simulateResponse(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(\`[Simulator] Deep analysis completed for topic: \${this.topic}\`);
      }, this.latencyMs);
    });
  }
}
\`\`\`

Feel free to ask me to outline React layout architectures, refactor algorithms, design clean CSS Glassmorphic cards, or solve other technical coding questions!`;
  }

  // Extract key terms to construct a dynamic, personalized response
  const words = cleanPrompt.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const topic = words.length > 0 ? words[words.length - 1] : 'your query';
  const topicTitle = topic.charAt(0).toUpperCase() + topic.slice(1);
  
  return `That is a fascinating question regarding **${topicTitle}**! 

Since the configured Gemini API key is currently inactive or revoked, I am responding from my high-fidelity local simulator engine. If I had full generative API access right now, here is how I would break down your request:

1. **Contextual Analysis**: I would parse the semantic terms related to *${topic}* in my database to deliver a comprehensive, up-to-date analysis.
2. **Structured Breakdown**: I would formulate the answers, key points, and core explanations in a clean, readable visual hierarchy.
3. **Interactive Support**: I would offer guidance or code mockups to help you examine this topic further.

Please let me know if you would like me to draft a mock design layout, write a code sample for *${topic}*, or guide you to a relevant InfinityKit tool!`;
}

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
      const dummyResponse = generateMockResponse(prompt, taskType);
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
      const dummyResponse = generateMockResponse(prompt, taskType);
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
