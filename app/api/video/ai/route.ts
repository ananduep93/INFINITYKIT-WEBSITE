import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max timeout

async function queryOpenAIWhisper(openaiKey: string, fileBuffer: Buffer, mimeType: string, fileName: string, responseFormat: 'vtt' | 'text' | 'verbose_json'): Promise<string> {
  const url = 'https://api.openai.com/v1/audio/transcriptions';
  const formData = new FormData();
  
  const fileBlob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType });
  
  formData.append('file', fileBlob, fileName);
  formData.append('model', 'whisper-1');
  formData.append('response_format', responseFormat);
  
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string; // 'subtitle', 'transcript', 'summary'
    const file = formData.get('file') as File;
    const providerParam = formData.get('provider') as string || 'openai';

    // Resolve Gemini API key
    const envGeminiKey = process.env.GEMINI_API_KEY || '';
    const clientGeminiKey = ((formData.get('geminiKey') as string) || request.headers.get('x-gemini-key') || '').trim();
    let geminiKey = clientGeminiKey || envGeminiKey;

    // Resolve OpenAI API key
    const envOpenaiKey = process.env.OPENAI_API_KEY || '';
    const clientOpenaiKey = ((formData.get('openaiKey') as string) || request.headers.get('x-openai-key') || '').trim();
    let openaiKey = clientOpenaiKey || envOpenaiKey;

    // Auto-detect and correct key swapping
    // Gemini keys: AIzaSy... (old format) or AQ. (new Google AI Studio format)
    const isGeminiKey = (k: string) => k.startsWith('AIzaSy') || k.startsWith('AQ.');
    const isOpenAIKey = (k: string) => k.startsWith('sk-');

    if (geminiKey && isOpenAIKey(geminiKey)) {
      if (!openaiKey) openaiKey = geminiKey;
      geminiKey = '';
      console.log('[Video AI API] Auto-routed OpenAI key passed as Gemini key.');
    }
    if (openaiKey && isGeminiKey(openaiKey)) {
      if (!geminiKey) geminiKey = openaiKey;
      openaiKey = '';
      console.log('[Video AI API] Auto-routed Gemini key passed as OpenAI key.');
    }

    // Determine active provider based on availability of keys
    let activeProvider = providerParam;
    if (activeProvider === 'openai' && !openaiKey) {
      if (geminiKey) {
        activeProvider = 'gemini';
        console.warn('[Video AI API] OpenAI Key missing, falling back to Gemini.');
      } else {
        return NextResponse.json({ 
          error: 'OpenAI API Key is missing. Please configure your API key in settings or try again.' 
        }, { status: 400 });
      }
    } else if (activeProvider === 'gemini' && !geminiKey) {
      if (openaiKey) {
        activeProvider = 'openai';
        console.warn('[Video AI API] Gemini Key missing, falling back to OpenAI.');
      } else {
        return NextResponse.json({ 
          error: 'Gemini API Key is missing. Please configure your API key in settings or try again.' 
        }, { status: 400 });
      }
    }

    if (activeProvider === 'openai' && !openaiKey) {
      return NextResponse.json({ error: 'OpenAI API Key is missing.' }, { status: 400 });
    }
    if (activeProvider === 'gemini' && !geminiKey) {
      return NextResponse.json({ error: 'Gemini API Key is missing.' }, { status: 400 });
    }

    if (!action || !file) {
      return NextResponse.json({ error: 'Action and file parameters are required' }, { status: 400 });
    }

    console.log(`[Video AI API] Provider: ${activeProvider}, Action: ${action}, File: ${file.name}`);



    // Save input video to a temp file
    const tempInputPath = path.join(os.tmpdir(), `ai_in_${Date.now()}_${file.name}`);
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(tempInputPath, inputBuffer);

    // Determine video MIME type (OpenAI Whisper and Gemini both support mp4/webm natively)
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const videoMimeType: string =
      fileExt === 'webm' ? 'video/webm' :
      fileExt === 'mov'  ? 'video/quicktime' :
      fileExt === 'mkv'  ? 'video/x-matroska' :
      'video/mp4';

    // Send the video file DIRECTLY to the AI — no FFmpeg needed.
    // OpenAI Whisper accepts mp4/webm/mov natively (up to 25 MB).
    // Gemini accepts video/* inline data natively.
    const aiFileBuffer: Buffer = inputBuffer;
    const aiMimeType: string = videoMimeType;
    const aiFileName: string = file.name;
    console.log(`[Video AI API] Sending ${videoMimeType} file directly to AI provider (no FFmpeg needed for ${action}).`);

    const audioBase64 = aiFileBuffer.toString('base64');

    let rawAiResponse = '';

    try {
      if (activeProvider === 'openai') {
        console.log(`[Video AI API] Routing to OpenAI for action: ${action}`);
        if (action === 'subtitle') {
          rawAiResponse = await queryOpenAIWhisper(openaiKey, aiFileBuffer, aiMimeType, aiFileName, 'vtt');
        } else if (action === 'transcript') {
          rawAiResponse = await queryOpenAIWhisper(openaiKey, aiFileBuffer, aiMimeType, aiFileName, 'text');
        } else if (action === 'summary') {
          const transcriptText = await queryOpenAIWhisper(openaiKey, aiFileBuffer, aiMimeType, aiFileName, 'text');
          const systemInstruction = 'You are an expert video summarization assistant. Analyze the transcript text and generate a clear, professional, and well-structured text summary of the video content. Use Markdown headings, bullet points, key takeaways, and action items.';
          const userPrompt = `Summarize the following video transcription:\n"""\n${transcriptText}\n"""`;
          rawAiResponse = await queryOpenAIChat(openaiKey, systemInstruction, userPrompt);
        }
      } else {
        console.log(`[Video AI API] Routing to Gemini for action: ${action}`);
        // Build Gen AI model instance
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        let systemInstruction = '';
        let userPrompt = '';

        if (action === 'transcript') {
          systemInstruction = 'You are an expert audio transcription assistant. Transcribe the audio file accurately. Return only the raw transcription text organized into clean paragraphs. Do not add any introductory or concluding remarks.';
          userPrompt = 'Transcribe this audio file completely.';
        } else if (action === 'summary') {
          systemInstruction = 'You are an expert video summarization assistant. Analyze the audio and generate a clear, professional, and well-structured text summary of the video content. Use Markdown headings, bullet points, key takeaways, and action items.';
          userPrompt = 'Analyze the audio and generate a comprehensive text summary.';
        } else if (action === 'subtitle') {
          systemInstruction = `You are an expert subtitling assistant. Generate subtitles for this audio in WebVTT format.
WebVTT format starts with 'WEBVTT' on the first line, followed by double carriage returns, and then timestamps in 'HH:MM:SS.mmm --> HH:MM:SS.mmm' format on one line, and the transcription of that segment on the next. Return ONLY the valid WebVTT format. Do not wrap the WebVTT in markdown blocks (e.g. do not use \`\`\`vtt).

Example:
WEBVTT

00:00:01.000 --> 00:00:04.200
Hello, welcome to Infinity Kit!

00:00:04.500 --> 00:00:08.000
Today we are editing videos.`;
          userPrompt = 'Generate subtitles in WebVTT format for this audio file.';
        }

        const response = await model.generateContent([
          {
            inlineData: {
              mimeType: aiMimeType,
              data: audioBase64
            }
          },
          { text: userPrompt }
        ]);

        rawAiResponse = response.response.text();
      }

      console.log(`[Video AI API] AI response received for action ${action}`);

      // Cleanup extracted audio (only created for shorts/reel with FFmpeg)
      

      // If text summary, transcript, or subtitle, return immediately
      if (action === 'transcript' || action === 'summary' || action === 'subtitle') {
        if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
        return NextResponse.json({ result: rawAiResponse.trim() });
      }

      // Shorts / Reels generation: parse timestamps and run FFmpeg clip+crop on server
      

      // Default fallback
      if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
      return NextResponse.json({ error: 'Unsupported action request' }, { status: 400 });

    } catch (aiErr: any) {
      if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
      const providerName = activeProvider === 'openai' ? 'OpenAI' : 'Gemini';
      console.error(`[Video AI API] ${providerName} request failed:`, aiErr);
      return NextResponse.json({ error: `${providerName} processing failed: ${aiErr.message}` }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[Unhandled Video AI API Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
