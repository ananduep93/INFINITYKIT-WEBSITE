import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import os from 'os';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

// Set path to static FFmpeg binary
// In Next.js dev mode on Windows, ffmpeg-static may return a sandboxed \ROOT\ path.
// We detect this and resolve from process.cwd() (the real project root) instead.
function resolveFfmpegPath(): string | null {
  if (!ffmpegStatic) return null;
  // If the path starts with \ROOT\ or /ROOT/, resolve it relative to cwd
  if (ffmpegStatic.startsWith('\\ROOT\\') || ffmpegStatic.startsWith('/ROOT/')) {
    const relativePart = ffmpegStatic.replace(/^[\\/]ROOT[\\/]/, '');
    return path.resolve(process.cwd(), relativePart);
  }
  return ffmpegStatic;
}

const resolvedFfmpegPath = resolveFfmpegPath();
if (resolvedFfmpegPath) {
  console.log('[Audio Convert API] Using FFmpeg binary at:', resolvedFfmpegPath);
  ffmpeg.setFfmpegPath(resolvedFfmpegPath);
} else {
  console.warn('[Audio Convert API] ffmpeg-static binary path not found. Falling back to system path.');
}

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max timeout

export async function POST(request: Request) {
  let tempInputPath = '';
  let tempOutputPath = '';

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const targetFormat = formData.get('format') as string || 'mp3';

    if (!file) {
      return NextResponse.json({ error: 'File parameter is required' }, { status: 400 });
    }

    console.log(`[Audio Convert API] Input file: ${file.name}, size: ${file.size} bytes, converting to: ${targetFormat}`);

    // Create unique temp paths
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const originalExt = file.name.split('.').pop() || 'tmp';
    tempInputPath = path.join(os.tmpdir(), `audio_in_${uniqueId}.${originalExt}`);
    tempOutputPath = path.join(os.tmpdir(), `audio_out_${uniqueId}.${targetFormat}`);

    // Write input file to disk
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(tempInputPath, inputBuffer);

    // Run conversion using fluent-ffmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempInputPath)
        .toFormat(targetFormat)
        .audioBitrate('128k') // Standard quality
        .on('start', (commandLine) => {
          console.log('[Audio Convert API] Spawned FFmpeg with command: ' + commandLine);
        })
        .on('error', (err) => {
          console.error('[Audio Convert API] FFmpeg encoding error:', err);
          reject(err);
        })
        .on('end', () => {
          console.log('[Audio Convert API] FFmpeg conversion finished successfully.');
          resolve();
        })
        .save(tempOutputPath);
    });

    // Read converted file into buffer
    if (!fs.existsSync(tempOutputPath)) {
      throw new Error('Output file was not created by FFmpeg.');
    }

    const outputBuffer = fs.readFileSync(tempOutputPath);

    // Clean up temporary files
    try {
      if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
      if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
    } catch (cleanupErr) {
      console.warn('[Audio Convert API] Failed to clean up temp files:', cleanupErr);
    }

    // Return the converted file buffer as standard audio response
    const headers = new Headers();
    headers.set('Content-Type', 'audio/mpeg');
    headers.set('Content-Disposition', `attachment; filename="converted_${uniqueId}.${targetFormat}"`);

    return new Response(outputBuffer, {
      status: 200,
      headers
    });

  } catch (error: any) {
    console.error('[Audio Convert API] Error during conversion:', error);
    
    // Clean up temporary files on error
    try {
      if (tempInputPath && fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
      if (tempOutputPath && fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
    } catch (cleanupErr) {
      console.warn('[Audio Convert API] Cleanup failed during error handling:', cleanupErr);
    }

    return NextResponse.json({ error: error.message || 'Internal Server Error during conversion' }, { status: 500 });
  }
}
