import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

const envApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

function generateMockResponse(prompt: string, taskType: string): string {
  const cleanPrompt = prompt.trim().toLowerCase();
  
  if (taskType === 'improve') {
    return `Here is the professionally optimized and polished version of your text:

"${prompt}"

*Improvements applied:*
- **Structural Rhythm**: Varied sentence lengths to create natural reading flow (burstiness).
- **Tone Alignment**: Balanced vocabulary density, replacing robotic structures with an engaging, organic voice.
- **Precision**: Polished active verbs and corrected minor syntax flow.`;
  }
  
  if (taskType === 'summarize') {
    return `Here is a concise, high-impact summary of the main points:

• **Primary Focus**: ${prompt.length > 80 ? prompt.substring(0, 80) + '...' : prompt}
• **Core Takeaway**: Secure client-side processing enables immediate data optimization without introducing network latency or privacy vulnerabilities.
• **Key Action Item**: Implement decentralized in-browser calculation scripts to eliminate external cloud server dependencies and protect sensitive data.`;
  }

  // Topic Specific Synthesis Engine
  if (cleanPrompt.includes('compress') || cleanPrompt.includes('compressor') || cleanPrompt.includes('shrink') || cleanPrompt.includes('reduce')) {
    return `# Comprehensive Guide to Modern Image Compression

Image compression is a critical optimization technique designed to reduce the storage footprint and transmission latency of visual media. By adjusting pixel arrays and metadata grids, modern algorithms enable high-fidelity visual representations at a fraction of the size.

### Lossy vs. Lossless Compression
1. **Lossy Compression (e.g., JPEG, WebP)**: Permanently discards redundant visual details that are less perceptible to the human eye. This uses discrete cosine transform (DCT) and chroma subsampling to achieve massive reduction ratios (up to 80-90%).
2. **Lossless Compression (e.g., PNG, GIF)**: Shrinks file sizes without losing a single pixel. It leverages statistical encoding models (like DEFLATE or LZW) to compress patterns in pixel values, making it perfect for diagrams and line art.

### How to Achieve Maximum Optimization
To achieve the best results on InfinityKit:
- Convert standard formats to **WebP** to save up to 30% more space at identical quality.
- Use our local-first **[Image Compressor](/image/image-compressor)** to shrink heavy camera captures safely inside your browser. No files are uploaded to external servers, protecting your absolute privacy.`;
  }

  if (cleanPrompt.includes('pdf') || cleanPrompt.includes('document') || cleanPrompt.includes('merge') || cleanPrompt.includes('split')) {
    return `# Advanced Document Workspace & PDF Architecture

The Portable Document Format (PDF) is constructed as a structured hierarchy of object streams, cross-reference tables (xref), and page dictionaries. Managing these files locally ensures total privacy and prevents document leaks.

### Primary PDF Operations:
1. **Multi-Page Merging**: Combines separate document streams by restructuring page tree dictionaries and appending reference catalogs, ensuring clickable links and embedded fonts remain intact.
2. **Lossless Compression**: Optimizes document size by compressing internal content streams, removing duplicate embedded font files, and stripping non-essential metadata.
3. **Secure Encryption**: Restricts document access by wrapping files in 128-bit or 256-bit AES encryption, requiring password verification for viewing or editing privileges.

*Tip:* Use our local-first **[PDF Documents Hub](/pdf)** to merge, split, rotate, or protect sheets safely inside your browser sandbox.`;
  }

  if (cleanPrompt.includes('secure') || cleanPrompt.includes('password') || cleanPrompt.includes('leak') || cleanPrompt.includes('vault') || cleanPrompt.includes('shred')) {
    return `# Principles of Modern Information Security and Cryptography

Maintaining strict information security requires implementing privacy-first client-side architectures and strong cryptographic practices. 

### Core Security Best Practices:
1. **Decentralized Storage**: Never store sensitive passwords or notes in unencrypted cloud databases. Keep credentials encrypted in-browser using the Advanced Encryption Standard (AES).
2. **HaveIBeenPwned Verification**: Check credentials against active breach databases using k-anonymity checks. By hashing passwords locally and sending only the first 5 characters of the SHA-1 hash, your passwords remain 100% private.
3. **Secure Self-Destruct**: Shred sensitive notes using CSS stripping animations and session memory purge tools, leaving zero digital footprints.

*Security Check:* Verify your credential strength using the **[Password Strength Evaluator](/utility/passwordstrength)** or securely purge notes using the **[Self-Destructing Notes](/utility/note-shredder)** tool.`;
  }

  if (cleanPrompt.includes('code') || cleanPrompt.includes('react') || cleanPrompt.includes('developer') || cleanPrompt.includes('json') || cleanPrompt.includes('ts') || cleanPrompt.includes('typescript')) {
    return `# High-Performance Frontend Architectures

Modern web development demands lightweight rendering systems, optimized routing, and absolute client-side calculation engines to ensure smooth, responsive interfaces.

### Standard TypeScript Registry Implementation:
\`\`\`typescript
export interface ToolDefinition {
  id: string;
  name: string;
  category: string;
  calculate?: (inputs: Record<string, any>) => any;
}

// Client-side execution loop with zero server dependency
export function executeLocalCalculation(tool: ToolDefinition, inputs: Record<string, any>) {
  if (!tool.calculate) return null;
  console.log('Executing utility [' + tool.id + '] locally...');
  return tool.calculate(inputs);
}
\`\`\`

### Dev Workspace Optimization Tips:
- Use **lazy loading** ('next/dynamic') to segment heavy visual tools and minimize your initial JavaScript bundle footprint.
- Format complex payloads instantly using our **[JSON Formatter](/developer-tools/json-code)** or audit meta tags using the **[Meta Tag Auditor](/developer-tools/metatagviewer)**.`;
  }

  if (cleanPrompt.includes('math') || cleanPrompt.includes('equation') || cleanPrompt.includes('solve') || cleanPrompt.includes('quadratic') || cleanPrompt.includes('parabola')) {
    return `# Mathematical Methods: Solving Quadratic Formulations

Quadratic equations ($ax^2 + bx + c = 0$) model dynamic motions, parabolic shapes, and physical acceleration curves. Resolving these equations reveals the roots where the parabola crosses the horizontal x-axis.

### The Quadratic Formula:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

### Solving Steps:
1. **Discriminant Analysis ($D = b^2 - 4ac$)**:
   - $D > 0$: Two distinct real roots.
   - $D = 0$: One repeated real root (vertex sits exactly on the axis).
   - $D < 0$: Two complex conjugate roots.
2. **Vertex Extraction**: Find the maximum or minimum point of the parabola using $h = -b / 2a$ and $k = f(h)$.

*Interactive Solver:* To solve these formulations and render parabola curves in real-time, try the **[Parabola Solver & Drawer](/utility/equationsolver)**.`;
  }

  if (cleanPrompt.includes('grass') && cleanPrompt.includes('edible')) {
    return `Yes, technically speaking, grass is edible for humans, but it is **not** a suitable or nutritious food source for several key reasons:

1. **Cellulose Digestion**: Unlike ruminants (cows, sheep), humans do not possess a multi-chambered stomach or the necessary enzymes/gut microbes to digest cellulose—the tough fibrous structural component of grass. It would pass through your digestive system completely undigested.
2. **Silica and Tooth Wear**: Grass leaves contain a high concentration of silica (essentially microscopic glass-like particles). Chewing grass would rapidly wear down human tooth enamel.
3. **Zero Nutritional Value**: Because we cannot break down the cellulose, eating grass would yield almost zero calories or usable nutrients for humans, and can lead to severe stomach distress or vomiting in large quantities.

If you have other science, biology, or technology questions, I'm delighted to help you explore them!`;
  }

  // Fallback default: comprehensive assistant response
  const words = cleanPrompt.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const topic = words.length > 0 ? words[words.length - 1] : 'your query';
  const topicTitle = topic.charAt(0).toUpperCase() + topic.slice(1);
  
  return `# Deep Insights Regarding ${topicTitle}

Your query regarding **${topicTitle}** touches on essential principles of modern digital systems and productivity workflows. To help you address this effectively, here is a structured analysis:

### 1. Architectural Foundations
Implementing robust solutions requires understanding the underlying data structures. Whether handling visual pixel grids, string characters, or cryptographic numbers, organizing data into modular components guarantees fast, secure processing.

### 2. Practical Application
To resolve challenges matching *${topic}* in a practical setting:
- Focus on client-side computational methods to bypass external server latency.
- Break complex problems down into step-by-step logic workflows.
- Keep user security at the forefront of your design.

### 3. Integrated Tools
InfinityKit is designed with over **80+ browser-secured utilities** built to address these workflows. I highly recommend exploring our **[Productivity Catalog](/tools)** to locate dedicated calculators, converters, and AI writers suited to your task!`;
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

    const clientKey = request.headers.get('x-gemini-key') || '';
    const activeKey = clientKey || envApiKey;

    if (!activeKey) {
      const dummyResponse = generateMockResponse(prompt, taskType);
      return NextResponse.json({ text: dummyResponse, demo: true });
    }

    const genAI = new GoogleGenerativeAI(activeKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

    const response = NextResponse.json({ text: responseText, demo: false });
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
        demo: true
      });
    }

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
