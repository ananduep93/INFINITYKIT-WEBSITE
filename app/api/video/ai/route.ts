import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { execSync } from 'child_process';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ffmpeg from 'fluent-ffmpeg';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max timeout

let ffmpegPathsResolved = false;

function resolveFfmpegPaths() {
  if (ffmpegPathsResolved) return;
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    ffmpegPathsResolved = true;
    return;
  } catch (e) {}

  const userHome = os.homedir();
  const searchDirs = [
    path.join(userHome, 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages'),
    path.join('C:', 'Program Files'),
    path.join('C:', 'Program Files (x86)')
  ];

  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      const match = findFileRecursive(dir, 'ffmpeg.exe');
      if (match) {
        const ffprobeMatch = findFileRecursive(dir, 'ffprobe.exe') || match.replace('ffmpeg.exe', 'ffprobe.exe');
        ffmpeg.setFfmpegPath(match);
        ffmpeg.setFfprobePath(ffprobeMatch);
        ffmpegPathsResolved = true;
        return;
      }
    }
  }
}

function findFileRecursive(dir: string, fileName: string, depth = 0): string | null {
  if (depth > 5) return null;
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const found = findFileRecursive(fullPath, fileName, depth + 1);
        if (found) return found;
      } else if (file.toLowerCase() === fileName.toLowerCase()) {
        return fullPath;
      }
    }
  } catch (e) {}
  return null;
}

async function queryOpenAIWhisper(openaiKey: string, audioFilePath: string, responseFormat: 'vtt' | 'text' | 'verbose_json'): Promise<string> {
  const url = 'https://api.openai.com/v1/audio/transcriptions';
  const formData = new FormData();
  
  const fileBuffer = fs.readFileSync(audioFilePath);
  const fileBlob = new Blob([fileBuffer], { type: 'audio/mp3' });
  
  formData.append('file', fileBlob, 'audio.mp3');
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
  resolveFfmpegPaths();

  try {
    const formData = await request.formData();
    const action = formData.get('action') as string; // 'subtitle', 'transcript', 'summary', 'shorts', 'reel'
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
    if (geminiKey && geminiKey.trim().startsWith('sk-')) {
      if (!openaiKey) {
        openaiKey = geminiKey;
      }
      geminiKey = '';
      console.log('[Video AI API] Auto-routed OpenAI key passed as Gemini key.');
    }
    if (openaiKey && openaiKey.trim().startsWith('AIzaSy')) {
      if (!geminiKey) {
        geminiKey = openaiKey;
      }
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

    // Extract lightweight mono audio from video
    const tempAudioPath = path.join(os.tmpdir(), `ai_audio_${Date.now()}.mp3`);
    
    try {
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempInputPath)
          .noVideo()
          .audioCodec('libmp3lame')
          .audioBitrate(64) // 64kbps mono is perfectly readable by AI models but very lightweight
          .audioChannels(1)
          .output(tempAudioPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });
    } catch (audioErr: any) {
      if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
      if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);
      console.error('[Video AI API] Audio extraction failed:', audioErr);
      return NextResponse.json({ error: `Audio extraction failed: ${audioErr.message}` }, { status: 500 });
    }

    // Convert audio to base64 for Gemini if needed
    const audioBuffer = fs.readFileSync(tempAudioPath);
    const audioBase64 = audioBuffer.toString('base64');

    let rawAiResponse = '';

    try {
      if (activeProvider === 'openai') {
        console.log(`[Video AI API] Routing to OpenAI for action: ${action}`);
        if (action === 'subtitle') {
          rawAiResponse = await queryOpenAIWhisper(openaiKey, tempAudioPath, 'vtt');
        } else if (action === 'transcript') {
          rawAiResponse = await queryOpenAIWhisper(openaiKey, tempAudioPath, 'text');
        } else if (action === 'summary') {
          const transcriptText = await queryOpenAIWhisper(openaiKey, tempAudioPath, 'text');
          const systemInstruction = 'You are an expert video summarization assistant. Analyze the transcript text and generate a clear, professional, and well-structured text summary of the video content. Use Markdown headings, bullet points, key takeaways, and action items.';
          const userPrompt = `Summarize the following video transcription:\n"""\n${transcriptText}\n"""`;
          rawAiResponse = await queryOpenAIChat(openaiKey, systemInstruction, userPrompt);
        } else if (action === 'shorts' || action === 'reel') {
          const verboseJson = await queryOpenAIWhisper(openaiKey, tempAudioPath, 'verbose_json');
          let segments = [];
          try {
            const parsed = JSON.parse(verboseJson);
            segments = (parsed.segments || []).map((s: any) => ({
              start: s.start,
              end: s.end,
              text: s.text
            }));
          } catch (e) {
            console.warn('[Video AI API] Failed to parse Whisper verbose_json segments:', e);
          }

          const systemInstruction = 'You are an expert social media highlight clipper. Analyze the transcription segments with timestamps, identify the single most engaging and high-impact hook or segment that is between 15 and 45 seconds long. Return a JSON object with exactly two keys: "startTime" (in seconds) and "duration" (in seconds). Return ONLY this JSON object. No other text. Example: { "startTime": 15.2, "duration": 30.0 }';
          const userPrompt = `Here are the transcription segments with timestamps:\n"""\n${JSON.stringify(segments)}\n"""\n\nIdentify the best 15-45 second highlight segment and return the startTime and duration in JSON.`;
          
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
        } else if (action === 'shorts' || action === 'reel') {
          systemInstruction = 'You are an expert social media highlight clipper. Analyze the audio, identify the single most engaging and high-impact hook or segment that is between 15 and 45 seconds long. Return a JSON object with exactly two keys: "startTime" (in seconds) and "duration" (in seconds). Return ONLY this JSON object. No other text. Example: { "startTime": 15.2, "duration": 30.0 }';
          userPrompt = 'Identify the best 15-45 second highlight segment from this audio.';
        }

        const response = await model.generateContent([
          {
            inlineData: {
              mimeType: 'audio/mp3',
              data: audioBase64
            }
          },
          { text: userPrompt }
        ]);

        rawAiResponse = response.response.text();
      }

      console.log(`[Video AI API] AI response received for action ${action}`);

      // Cleanup extracted audio
      if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);

      // If text summary, transcript, or subtitle, return immediately
      if (action === 'transcript' || action === 'summary' || action === 'subtitle') {
        if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
        return NextResponse.json({ result: rawAiResponse.trim() });
      }

      // Shorts / Reels generation: parse timestamps and run FFmpeg clip+crop on server
      if (action === 'shorts' || action === 'reel') {
        let startTime = 0;
        let duration = 30;

        try {
          // Clean JSON brackets if wrapped
          const cleanJsonStr = rawAiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJsonStr);
          startTime = Number(parsed.startTime || 0);
          duration = Number(parsed.duration || 30);
        } catch (jsonErr) {
          console.warn('[Video AI API] AI failed to return valid JSON, falling back to default 0-30s trim:', rawAiResponse);
          // Try to regex parse
          const startMatch = rawAiResponse.match(/"startTime":\s*([\d.]+)/);
          const durMatch = rawAiResponse.match(/"duration":\s*([\d.]+)/);
          if (startMatch) startTime = Number(startMatch[1]);
          if (durMatch) duration = Number(durMatch[1]);
        }

        console.log(`[Video AI API] AI Clipper chosen: Start = ${startTime}s, Duration = ${duration}s. Clipping vertical crop...`);

        const tempShortsPath = path.join(os.tmpdir(), `ai_clip_${Date.now()}.mp4`);

        try {
          await new Promise<void>((resolve, reject) => {
            ffmpeg(tempInputPath)
              .setStartTime(startTime)
              .setDuration(duration)
              // Center crop horizontal video to vertical 9:16 aspect ratio
              .videoFilter(`crop=ih*9/16:ih:(iw-ow)/2:0,scale=w='trunc(720/2)*2':h='trunc(1280/2)*2'`)
              .videoCodec('libx264')
              .audioCodec('aac')
              .output(tempShortsPath)
              .on('end', () => resolve())
              .on('error', (err) => reject(err))
              .run();
          });

          const fileBuffer = fs.readFileSync(tempShortsPath);

          // Cleanup remaining temp files
          if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
          if (fs.existsSync(tempShortsPath)) fs.unlinkSync(tempShortsPath);

          const downloadName = `ai_${action}_${file.name}`;

          return new Response(fileBuffer, {
            headers: {
              'Content-Type': 'video/mp4',
              'Content-Disposition': `attachment; filename="${downloadName}"`,
              'X-AI-Start-Time': String(startTime),
              'X-AI-Duration': String(duration)
            }
          });

        } catch (ffmpegErr: any) {
          if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
          if (fs.existsSync(tempShortsPath)) fs.unlinkSync(tempShortsPath);
          console.error('[Video AI API] Highlight clipping failed:', ffmpegErr);
          return NextResponse.json({ error: `Highlight clipping failed: ${ffmpegErr.message}` }, { status: 500 });
        }
      }

      // Default fallback
      if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
      return NextResponse.json({ error: 'Unsupported action request' }, { status: 400 });

    } catch (aiErr: any) {
      if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
      if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);
      const providerName = activeProvider === 'openai' ? 'OpenAI' : 'Gemini';
      console.error(`[Video AI API] ${providerName} request failed:`, aiErr);
      return NextResponse.json({ error: `${providerName} processing failed: ${aiErr.message}` }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[Unhandled Video AI API Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
