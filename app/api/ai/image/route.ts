import { NextResponse } from 'next/server';
// Trigger build to verify GitHub Pages check removal
export const dynamic = 'force-dynamic';

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
      console.log('[Proxy Image API] Using Hugging Face Inference API...');
      const hfModel = m === 'turbo' ? 'stabilityai/stable-diffusion-xl-base-1.0' : 'black-forest-labs/FLUX.1-schnell';
      const hfUrl = `https://api-inference.huggingface.co/models/${hfModel}`;
      
      try {
        const hfRes = await fetch(hfUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hfToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: prompt })
        });
        
        if (hfRes.ok) {
          const blob = await hfRes.blob();
          const buffer = Buffer.from(await blob.arrayBuffer());
          return new Response(buffer, {
            headers: {
              'Content-Type': blob.type || 'image/jpeg',
              'Cache-Control': 'no-store, no-cache, must-revalidate'
            }
          });
        } else {
          console.warn(`[Proxy Image API] Hugging Face failed with status ${hfRes.status}:`, await hfRes.text());
        }
      } catch (err) {
        console.error('[Proxy Image API] Hugging Face request error:', err);
      }
    }

    // Tier 1: Main Pollinations Request
    const finalPromptUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${s}&nologo=true&enhance=true&model=${m}`;
    console.log(`[Proxy Image API] Fetching from Pollinations: ${finalPromptUrl}`);

    let res = await fetch(finalPromptUrl);

    // Tier 2 Fallback: If busy (402/429), try without extra query parameters (enhance/model) to bypass specific queue limits
    if (!res.ok && (res.status === 402 || res.status === 429)) {
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${s}`;
      console.log(`[Proxy Image API] Fallback to simple request: ${fallbackUrl}`);
      const fallbackRes = await fetch(fallbackUrl);
      if (fallbackRes.ok) {
        res = fallbackRes;
      }
    }

    if (!res.ok) {
      console.warn(`[Proxy Image API] Request failed with status: ${res.status}`);
      return NextResponse.json({
        error: `The image generation queue is currently full (HTTP status ${res.status}). Please wait a few seconds and try again.`
      }, { status: res.status });
    }

    const blob = await res.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    return new Response(buffer, {
      headers: {
        'Content-Type': blob.type || 'image/jpeg',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error: any) {
    console.error('[Proxy Image API Unhandled Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
