import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { execSync } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';
// @ts-ignore
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
// @ts-ignore
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max execution timeout for long video transcodes

let ffmpegPathsResolved = false;

// Self-healing path resolution logic with caching for fast startup
function resolveFfmpegPaths() {
  if (ffmpegPathsResolved) return;

  const cachePath = path.join(os.tmpdir(), 'ik_ffmpeg_paths_cache.json');
  if (fs.existsSync(cachePath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      if (cached.ffmpeg && cached.ffprobe && fs.existsSync(cached.ffmpeg) && fs.existsSync(cached.ffprobe)) {
        console.log(`[Video API] Using cached FFmpeg: ${cached.ffmpeg}`);
        ffmpeg.setFfmpegPath(cached.ffmpeg);
        ffmpeg.setFfprobePath(cached.ffprobe);
        ffmpegPathsResolved = true;
        return;
      }
    } catch (e) {}
  }

  // 1. Check if ffmpeg is globally available in PATH
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    console.log('[Video API] ffmpeg binary is globally accessible in PATH.');
    ffmpegPathsResolved = true;
    return;
  } catch (e) {
    console.log('[Video API] ffmpeg not globally in PATH. Searching standard paths...');
  }

  // 2. Scan standard Linux/macOS binary locations
  const standardLinuxPaths = [
    '/usr/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    '/usr/sbin/ffmpeg',
    '/usr/local/sbin/ffmpeg',
    '/opt/homebrew/bin/ffmpeg'
  ];
  for (const p of standardLinuxPaths) {
    if (fs.existsSync(p)) {
      const ffprobePath = p.replace('ffmpeg', 'ffprobe');
      console.log(`[Video API] Found FFmpeg at standard location: ${p}`);
      ffmpeg.setFfmpegPath(p);
      if (fs.existsSync(ffprobePath)) {
        ffmpeg.setFfprobePath(ffprobePath);
      }
      ffmpegPathsResolved = true;
      return;
    }
  }

  // 3. Check local npm packages @ffmpeg-installer/ffmpeg and @ffprobe-installer/ffprobe
  try {
    const localFfmpeg = ffmpegInstaller.path;
    const localFfprobe = ffprobeInstaller.path;
    if (localFfmpeg && fs.existsSync(localFfmpeg) && localFfprobe && fs.existsSync(localFfprobe)) {
      let finalFfmpeg = localFfmpeg;
      let finalFfprobe = localFfprobe;

      // On non-Windows platforms, guarantee execute permissions by copying to /tmp and chmoding if necessary
      if (os.platform() !== 'win32') {
        try {
          const tmpFfmpeg = path.join(os.tmpdir(), 'ik_ffmpeg');
          const tmpFfprobe = path.join(os.tmpdir(), 'ik_ffprobe');

          if (!fs.existsSync(tmpFfmpeg)) {
            fs.copyFileSync(localFfmpeg, tmpFfmpeg);
            fs.chmodSync(tmpFfmpeg, '755');
          }
          if (!fs.existsSync(tmpFfprobe)) {
            fs.copyFileSync(localFfprobe, tmpFfprobe);
            fs.chmodSync(tmpFfprobe, '755');
          }

          finalFfmpeg = tmpFfmpeg;
          finalFfprobe = tmpFfprobe;
          console.log(`[Video API] Copied and chmod-ed binaries in /tmp: ${finalFfmpeg}`);
        } catch (chmodErr) {
          console.warn('[Video API WARNING] Could not copy/chmod binaries to /tmp:', chmodErr);
          try {
            fs.chmodSync(localFfmpeg, '755');
            fs.chmodSync(localFfprobe, '755');
          } catch (e) {}
        }
      }

      console.log(`[Video API] Using FFmpeg: ${finalFfmpeg}`);
      ffmpeg.setFfmpegPath(finalFfmpeg);
      ffmpeg.setFfprobePath(finalFfprobe);

      // Cache the paths to disk
      try {
        fs.writeFileSync(cachePath, JSON.stringify({ ffmpeg: finalFfmpeg, ffprobe: finalFfprobe }), 'utf8');
      } catch (e) {}

      ffmpegPathsResolved = true;
      return;
    }
  } catch (e) {
    console.log('[Video API] Failed to resolve npm package installers:', e);
  }

  // 4. Scan standard WinGet download location under user's profile and default Program Files (Windows)
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
        console.log(`[Video API] Found FFmpeg executable: ${match}`);
        console.log(`[Video API] Found FFprobe executable: ${ffprobeMatch}`);
        ffmpeg.setFfmpegPath(match);
        ffmpeg.setFfprobePath(ffprobeMatch);

        // Cache the paths to disk
        try {
          fs.writeFileSync(cachePath, JSON.stringify({ ffmpeg: match, ffprobe: ffprobeMatch }), 'utf8');
        } catch (e) {}

        ffmpegPathsResolved = true;
        return;
      }
    }
  }

  console.warn('[Video API WARNING] Could not resolve FFmpeg/FFprobe binary locations.');
}

function findFileRecursive(dir: string, fileName: string, depth = 0): string | null {
  if (depth > 5) return null; // Avoid traversing too deep
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

export async function POST(request: Request) {
  resolveFfmpegPaths();

  if (!ffmpegPathsResolved) {
    return NextResponse.json({
      error: 'FFmpeg binary was not found on the server. If you are the administrator, please install FFmpeg on the hosting server (e.g. run "sudo apt-get update && sudo apt-get install -y ffmpeg" on Linux/Ubuntu).'
    }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;
    
    if (!action) {
      return NextResponse.json({ error: 'Action parameter is required' }, { status: 400 });
    }

    console.log(`[Video API] Processing action: ${action}`);

    // Handle Merge action separately (receives multiple files)
    if (action === 'merge') {
      const files = formData.getAll('files') as File[];
      if (!files || files.length < 2) {
        return NextResponse.json({ error: 'At least 2 files are required for merging' }, { status: 400 });
      }

      const tempInputPaths: string[] = [];
      const tempOutputPath = path.join(os.tmpdir(), `merged_${Date.now()}.mp4`);
      const listFilePath = path.join(os.tmpdir(), `merge_list_${Date.now()}.txt`);

      try {
        for (const file of files) {
          const tempPath = path.join(os.tmpdir(), `input_merge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${file.name}`);
          const buffer = Buffer.from(await file.arrayBuffer());
          fs.writeFileSync(tempPath, buffer);
          tempInputPaths.push(tempPath);
        }

        // Write file list for concat demuxer (use forward slashes for cross-platform compatibility)
        const listContent = tempInputPaths.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n');
        fs.writeFileSync(listFilePath, listContent, 'utf8');

        await new Promise<void>((resolve, reject) => {
          ffmpeg(listFilePath)
            .inputOptions(['-f', 'concat', '-safe', '0'])
            .outputOptions('-c copy')
            .on('end', () => resolve())
            .on('error', (err) => {
              console.error('[FFmpeg Merge Error]', err);
              reject(err);
            })
            .save(tempOutputPath);
        });

        const fileBuffer = fs.readFileSync(tempOutputPath);

        // Cleanup
        tempInputPaths.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });
        if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
        if (fs.existsSync(listFilePath)) fs.unlinkSync(listFilePath);

        return new Response(fileBuffer, {
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Disposition': 'attachment; filename="merged_video.mp4"'
          }
        });
      } catch (err: any) {
        tempInputPaths.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });
        if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
        if (fs.existsSync(listFilePath)) fs.unlinkSync(listFilePath);
        return NextResponse.json({ error: `Merge process failed: ${err.message}` }, { status: 500 });
      }
    }

    // Standard single file actions
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const tempInputPath = path.join(os.tmpdir(), `input_${Date.now()}_${file.name}`);
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(tempInputPath, inputBuffer);

    // Determine output format & name
    let outputExtension = 'mp4';
    let outputMimeType = 'video/mp4';
    
    if (action === 'extract-audio') {
      const format = formData.get('format') as string || 'mp3';
      outputExtension = format === 'wav' ? 'wav' : 'mp3';
      outputMimeType = format === 'wav' ? 'audio/wav' : 'audio/mpeg';
    } else if (action === 'video-to-gif') {
      outputExtension = 'gif';
      outputMimeType = 'image/gif';
    } else if (action === 'extract-thumbnail') {
      outputExtension = 'png';
      outputMimeType = 'image/png';
    } else if (action === 'convert') {
      const targetFormat = formData.get('targetFormat') as string || 'mp4';
      outputExtension = targetFormat;
      if (targetFormat === 'mov') outputMimeType = 'video/quicktime';
      else if (targetFormat === 'webm') outputMimeType = 'video/webm';
      else if (targetFormat === 'mkv') outputMimeType = 'video/x-matroska';
      else if (targetFormat === 'avi') outputMimeType = 'video/x-msvideo';
      else outputMimeType = 'video/mp4';
    }

    const tempOutputPath = path.join(os.tmpdir(), `output_${Date.now()}_${file.name.replace(/\.[^/.]+$/, '')}.${outputExtension}`);

    try {
      const proc = ffmpeg(tempInputPath);

      switch (action) {
        case 'compress': {
          const quality = formData.get('quality') as string || 'medium';
          const crfValue = quality === 'low' ? '30' : quality === 'high' ? '20' : '25';
          proc
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions(['-crf', crfValue, '-preset', 'ultrafast']);
          break;
        }
        case 'trim': {
          const startTime = Number(formData.get('startTime') || 0);
          const duration = Number(formData.get('duration') || 0);
          proc.setStartTime(startTime);
          if (duration > 0) {
            proc.setDuration(duration);
          }
          proc.videoCodec('copy').audioCodec('copy');
          break;
        }
        case 'crop': {
          const cropW = Number(formData.get('cropW') || 0);
          const cropH = Number(formData.get('cropH') || 0);
          const cropX = Number(formData.get('cropX') || 0);
          const cropY = Number(formData.get('cropY') || 0);
          proc
            .videoFilter(`crop=${cropW}:${cropH}:${cropX}:${cropY}`)
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions(['-preset', 'ultrafast']);
          break;
        }
        case 'resize': {
          const resizeW = Number(formData.get('resizeW') || 640);
          const resizeH = Number(formData.get('resizeH') || 360);
          // Force h264-compliant even dimensions
          proc
            .videoFilter(`scale=w='trunc(${resizeW}/2)*2':h='trunc(${resizeH}/2)*2'`)
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions(['-preset', 'ultrafast']);
          break;
        }
        case 'rotate': {
          const rotateAngle = formData.get('rotateAngle') as string || '90';
          if (rotateAngle === '90') proc.videoFilter('transpose=1');
          else if (rotateAngle === '180') proc.videoFilter('transpose=2,transpose=2');
          else if (rotateAngle === '270') proc.videoFilter('transpose=2');
          proc.videoCodec('libx264').audioCodec('aac').outputOptions(['-preset', 'ultrafast']);
          break;
        }
        case 'reverse': {
          proc
            .videoFilter('reverse')
            .audioFilter('areverse')
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions(['-preset', 'ultrafast']);
          break;
        }
        case 'split': {
          // Extracts single portion chosen by range parameters
          const splitStart = Number(formData.get('splitStart') || 0);
          const splitDuration = Number(formData.get('splitDuration') || 0);
          proc.setStartTime(splitStart);
          if (splitDuration > 0) {
            proc.setDuration(splitDuration);
          }
          proc.videoCodec('copy').audioCodec('copy');
          break;
        }
        case 'convert': {
          // Handled via outputExtension already, standard transcoder params:
          if (outputExtension === 'webm') {
            proc.videoCodec('libvpx-vp9').audioCodec('libopus').outputOptions(['-deadline', 'realtime', '-cpu-used', '8']);
          } else if (outputExtension === 'mov' || outputExtension === 'mkv' || outputExtension === 'mp4') {
            proc.videoCodec('copy').audioCodec('copy');
          } else {
            proc.videoCodec('libx264').audioCodec('aac').outputOptions(['-preset', 'ultrafast']);
          }
          break;
        }
        case 'mute': {
          proc.noAudio().videoCodec('copy');
          break;
        }
        case 'extract-audio': {
          proc.noVideo();
          if (outputExtension === 'mp3') {
            proc.audioCodec('libmp3lame');
          } else {
            proc.audioCodec('pcm_s16le');
          }
          break;
        }
        case 'video-to-gif': {
          const gifW = Number(formData.get('gifW') || 480);
          const fps = Number(formData.get('fps') || 10);
          // Optimized lanczos color palette filters for beautiful high-fidelity GIFs
          proc.videoFilter(`fps=${fps},scale=${gifW}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`);
          break;
        }
        case 'extract-thumbnail': {
          const time = Number(formData.get('time') || 1);
          proc
            .seekInput(time)
            .frames(1)
            .videoFilter('scale=640:-1');
          break;
        }
        default:
          return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
      }

      await new Promise<void>((resolve, reject) => {
        proc
          .output(tempOutputPath)
          .on('end', () => resolve())
          .on('error', (err) => {
            console.error('[FFmpeg Process Error]', err);
            reject(err);
          })
          .run();
      });

      const fileBuffer = fs.readFileSync(tempOutputPath);

      // Cleanup
      if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
      if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);

      const downloadName = `${file.name.replace(/\.[^/.]+$/, '')}_processed.${outputExtension}`;

      return new Response(fileBuffer, {
        headers: {
          'Content-Type': outputMimeType,
          'Content-Disposition': `attachment; filename="${downloadName}"`
        }
      });

    } catch (err: any) {
      if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
      if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
      console.error('[Video API Error]', err);
      return NextResponse.json({ error: `FFmpeg execution failed: ${err.message || err}` }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[Unhandled Video API Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
