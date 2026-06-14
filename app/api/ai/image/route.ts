import { NextResponse } from 'next/server';
import https from 'https';

export const dynamic = 'force-dynamic';

// Helper function to perform requests using Node's built-in https module
// This bypasses any issues next/undici fetch has with DNS/IPv6/TLS on Vercel
function makeHttpsRequest(
  url: string,
  method: 'GET' | 'POST',
  headers: Record<string, string>,
  body?: string
): Promise<{ status: number; data: Buffer; contentType: string; text: string }> {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const reqOptions = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: method,
        headers: headers,
        timeout: 9000 // 9 second timeout to avoid Vercel 10s timeout crash
      };

      const req = https.request(reqOptions, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            status: res.statusCode || 200,
            data: buffer,
            contentType: res.headers['content-type'] || 'application/octet-stream',
            text: buffer.toString('utf8')
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out after 9 seconds'));
      });

      if (body) {
        req.write(body);
      }
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

export async function POST(request: Request) {
  try {
    const { prompt, width, height, seed, model } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const w = width || 512;
    const h = height || 512;
    const s = seed || Math.floor(Math.random() * 1000000);
    const m = model || 'flux';

    // Hugging Face Fallback / Alternative Integration
    const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
    if (hfToken) {
      console.log('[Proxy Image API] Using Hugging Face Inference API via built-in https module...');
      
      const primaryModel = m === 'turbo' ? 'stabilityai/stable-diffusion-xl-base-1.0' : 'black-forest-labs/FLUX.1-schnell';
      const modelsToTry = [
        primaryModel,
        'Lykon/dreamshaper-8',
        'runwayml/stable-diffusion-v1-5'
      ];
      
      const errors: string[] = [];
      for (const hfModel of modelsToTry) {
        const hfUrl = `https://api-inference.huggingface.co/models/${hfModel}`;
        console.log(`[Proxy Image API] Attempting generation with Hugging Face model: ${hfModel}`);
        
        try {
          let hfRes = await makeHttpsRequest(
            hfUrl,
            'POST',
            {
              'Authorization': `Bearer ${hfToken}`,
              'Content-Type': 'application/json'
            },
            JSON.stringify({ inputs: prompt })
          );
          
          // Retry on 503 loading (up to 1 time with a 2.5 second delay)
          if (hfRes.status === 503) {
            console.log(`[Proxy Image API] Model ${hfModel} is loading (HTTP 503). Retrying in 2.5s...`);
            await new Promise(resolve => setTimeout(resolve, 2500));
            hfRes = await makeHttpsRequest(
              hfUrl,
              'POST',
              {
                'Authorization': `Bearer ${hfToken}`,
                'Content-Type': 'application/json'
              },
              JSON.stringify({ inputs: prompt })
            );
          }
          
          if (hfRes.status === 200) {
            return new Response(new Uint8Array(hfRes.data), {
              headers: {
                'Content-Type': hfRes.contentType || 'image/jpeg',
                'Cache-Control': 'no-store, no-cache, must-revalidate'
              }
            });
          } else {
            console.warn(`[Proxy Image API] Hugging Face model ${hfModel} failed with status ${hfRes.status}:`, hfRes.text);
            errors.push(`${hfModel} (HTTP ${hfRes.status}): ${hfRes.text.substring(0, 150)}`);
            
            // Break early and return specific auth errors so the developer knows the key is invalid
            if (hfRes.status === 401) {
              return NextResponse.json({
                error: `Hugging Face Authentication Failed (HTTP 401). Please verify your HF_TOKEN environment variable on Vercel.`
              }, { status: 401 });
            }
          }
        } catch (err: any) {
          console.error(`[Proxy Image API] Hugging Face request error for ${hfModel}:`, err);
          errors.push(`${hfModel} (Error): ${err.message || err}`);
        }
      }
      
      // If we got here, all HF models failed. Return the exact details so the user can see the reason.
      return NextResponse.json({
        error: `AI generation failed. Details:\n` + errors.join('\n')
      }, { status: 502 });
    }

    // Tier 1: Main Pollinations Request (Using https module for maximum reliability)
    const finalPromptUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${s}&nologo=true&enhance=true&model=${m}`;
    console.log(`[Proxy Image API] Fetching from Pollinations: ${finalPromptUrl}`);

    try {
      let res = await makeHttpsRequest(finalPromptUrl, 'GET', {});
      
      // Tier 2 Fallback: If busy (402/429), try without extra query parameters (enhance/model) to bypass specific queue limits
      if (res.status !== 200 && (res.status === 402 || res.status === 429)) {
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${s}`;
        console.log(`[Proxy Image API] Fallback to simple request: ${fallbackUrl}`);
        const fallbackRes = await makeHttpsRequest(fallbackUrl, 'GET', {});
        if (fallbackRes.status === 200) {
          res = fallbackRes;
        }
      }

      if (res.status !== 200) {
        console.warn(`[Proxy Image API] Pollinations request failed with status: ${res.status}`);
        return NextResponse.json({
          error: `The image generation queue is currently full (HTTP status ${res.status}). Please wait a few seconds and try again.`
        }, { status: res.status });
      }

      return new Response(new Uint8Array(res.data), {
        headers: {
          'Content-Type': res.contentType || 'image/jpeg',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      });
    } catch (pollinationsErr: any) {
      console.error('[Proxy Image API] Pollinations fetch error:', pollinationsErr);
      return NextResponse.json({
        error: `Network failure connecting to Pollinations: ${pollinationsErr.message || pollinationsErr}`
      }, { status: 502 });
    }

  } catch (error: any) {
    console.error('[Proxy Image API Unhandled Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
