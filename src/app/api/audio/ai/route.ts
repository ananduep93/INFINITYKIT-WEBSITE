import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max timeout

async function queryOpenAIWhisper(openaiKey: string, fileBuffer: Buffer, mimeType: string, fileName: string): Promise<string> {
  const url = 'https://api.openai.com/v1/audio/transcriptions';
  const formData = new FormData();
  
  const fileBlob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType });
  formData.append('file', fileBlob, fileName);
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'text');
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`
    },
    body: formData
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI Whisper API returned status ${response.status}: ${errText}`);
  }

  return await response.text();
}

async function queryOpenAIChat(openaiKey: string, systemInstruction: string, userPrompt: string): Promise<string> {
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
    throw new Error(`OpenAI Chat API returned status ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function queryOpenAITTS(openaiKey: string, text: string, voice: string): Promise<Buffer> {
  const url = 'https://api.openai.com/v1/audio/speech';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: voice || 'alloy',
      response_format: 'mp3'
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI TTS API returned status ${response.status}: ${errText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string; // 'summary' | 'tts'
    
    // Resolve Gemini API key
    const envGeminiKey = process.env.GEMINI_API_KEY || '';
    const clientGeminiKey = ((formData.get('geminiKey') as string) || request.headers.get('x-gemini-key') || '').trim();
    let geminiKey = clientGeminiKey || envGeminiKey;

    // Resolve OpenAI API key
    const envOpenaiKey = process.env.OPENAI_API_KEY || '';
    const clientOpenaiKey = ((formData.get('openaiKey') as string) || request.headers.get('x-openai-key') || '').trim();
    let openaiKey = clientOpenaiKey || envOpenaiKey;

    // Provider config
    const providerParam = formData.get('provider') as string || 'openai';
    let activeProvider = providerParam;

    // Auto-detect and correct key swapping
    const isGeminiKey = (k: string) => k.startsWith('AIzaSy') || k.startsWith('AQ.');
    const isOpenAIKey = (k: string) => k.startsWith('sk-');

    if (geminiKey && isOpenAIKey(geminiKey)) {
      if (!openaiKey) openaiKey = geminiKey;
      geminiKey = '';
    }
    if (openaiKey && isGeminiKey(openaiKey)) {
      if (!geminiKey) geminiKey = openaiKey;
      openaiKey = '';
    }

    if (activeProvider === 'openai' && !openaiKey) {
      if (geminiKey) activeProvider = 'gemini';
    } else if (activeProvider === 'gemini' && !geminiKey) {
      if (openaiKey) activeProvider = 'openai';
    }

    if (action === 'tts') {
      const text = formData.get('text') as string;
      const voice = formData.get('voice') as string || 'alloy';

      if (!text) {
        return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
      }

      if (!openaiKey) {
        return NextResponse.json({ error: 'OpenAI API Key is missing for premium TTS.' }, { status: 400 });
      }

      console.log(`[Audio AI API] Running TTS for text length: ${text.length}, voice: ${voice}`);
      const speechBuffer = await queryOpenAITTS(openaiKey, text, voice);
      
      const headers = new Headers();
      headers.set('Content-Type', 'audio/mpeg');
      headers.set('Content-Disposition', 'attachment; filename="tts.mp3"');
      
      return new Response(new Uint8Array(speechBuffer), {
        status: 200,
        headers
      });
    }

    if (action === 'summary') {
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ error: 'Audio file is required for summary.' }, { status: 400 });
      }

      console.log(`[Audio AI API] Summarizing podcast file: ${file.name}, provider: ${activeProvider}`);

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'mp3';
      const mimeType = file.type || `audio/${fileExt}`;

      let summaryResult = '';

      if (activeProvider === 'openai') {
        if (!openaiKey) {
          return NextResponse.json({ error: 'OpenAI API Key is missing.' }, { status: 400 });
        }

        const transcription = await queryOpenAIWhisper(openaiKey, fileBuffer, mimeType, file.name);
        const systemInstruction = 'You are an expert podcast summarization assistant. Analyze the podcast transcription and generate a clear, professional, and well-structured text summary. Use Markdown headings, bullet points, key takeaways, and action items.';
        const userPrompt = `Summarize the following podcast transcription:\n"""\n${transcription}\n"""`;
        summaryResult = await queryOpenAIChat(openaiKey, systemInstruction, userPrompt);
      } else {
        if (!geminiKey) {
          return NextResponse.json({ error: 'Gemini API Key is missing.' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const audioBase64 = fileBuffer.toString('base64');
        const systemInstruction = 'You are an expert podcast summarization assistant. Analyze the audio content and generate a clear, professional, and well-structured text summary. Use Markdown headings, bullet points, key takeaways, and action items.';
        const userPrompt = 'Analyze this audio and generate a comprehensive text summary.';

        const response = await model.generateContent([
          {
            inlineData: {
              mimeType: mimeType.startsWith('audio/') ? mimeType : 'audio/mp3',
              data: audioBase64
            }
          },
          { text: `${systemInstruction}\n\n${userPrompt}` }
        ]);

        summaryResult = response.response.text();
      }

      return NextResponse.json({ result: summaryResult.trim() });
    }

    return NextResponse.json({ error: 'Unsupported action request' }, { status: 400 });

  } catch (error: any) {
    console.error('[Audio AI API Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error during AI audio task' }, { status: 500 });
  }
}
