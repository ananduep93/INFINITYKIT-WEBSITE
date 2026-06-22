import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { tools, mapCategoryToPath } from './config/tools';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 1. Redirect old /tools/[toolId] or /tools/[toolId].html to /[category]/[toolId]
  if (pathname.startsWith('/tools/')) {
    let toolId = pathname.substring(7);
    if (toolId.endsWith('.html')) {
      toolId = toolId.substring(0, toolId.length - 5);
    }

    // Find the tool by ID (case-insensitive fallback for safety)
    const tool = tools.find(t => t.id.toLowerCase() === toolId.toLowerCase());
    if (tool) {
      const categoryPath = mapCategoryToPath(tool.category);
      url.pathname = `/${categoryPath}/${tool.id}`;
      return NextResponse.redirect(url, 301); // 301 Permanent Redirect
    }
  }

  // 2. Redirect old /categories/[categoryId] or /categories/[categoryId].html to /[category]
  if (pathname.startsWith('/categories/')) {
    let categoryId = pathname.substring(12);
    if (categoryId.endsWith('.html')) {
      categoryId = categoryId.substring(0, categoryId.length - 5);
    }
    const categoryPath = mapCategoryToPath(categoryId);
    url.pathname = `/${categoryPath}`;
    return NextResponse.redirect(url, 301); // 301 Permanent Redirect
  }

  // 3. Redirect old /utility/[toolId] to proper standard category/tool path
  if (pathname.startsWith('/utility/')) {
    const toolId = pathname.substring(9);
    const tool = tools.find(t => t.id.toLowerCase() === toolId.toLowerCase());
    if (tool) {
      const categoryPath = mapCategoryToPath(tool.category);
      url.pathname = `/${categoryPath}/${tool.id}`;
      return NextResponse.redirect(url, 301);
    }
  }

  // 4. Redirect old /ai-writing/[toolId] or /ai-writing / /writing-tools to canonical paths
  if (pathname.startsWith('/ai-writing/')) {
    const toolId = pathname.substring(12);
    const tool = tools.find(t => t.id.toLowerCase() === toolId.toLowerCase());
    if (tool) {
      const categoryPath = mapCategoryToPath(tool.category);
      url.pathname = `/${categoryPath}/${tool.id}`;
      return NextResponse.redirect(url, 301);
    }
  }
  if (pathname === '/ai-writing' || pathname === '/writing-tools') {
    url.pathname = '/ai-tools';
    return NextResponse.redirect(url, 301);
  }

  // 5. Redirect old /audio/[toolId] or /audio / /audio-tools to standard utility/ai paths
  if (pathname.startsWith('/audio/')) {
    const toolId = pathname.substring(7);
    const tool = tools.find(t => t.id.toLowerCase() === toolId.toLowerCase());
    if (tool) {
      const categoryPath = mapCategoryToPath(tool.category);
      url.pathname = `/${categoryPath}/${tool.id}`;
      return NextResponse.redirect(url, 301);
    }
  }
  if (pathname === '/audio' || pathname === '/audio-tools') {
    url.pathname = '/utility-tools';
    return NextResponse.redirect(url, 301);
  }

  // 6. Redirect old /expense-tracker to utility-tools
  if (pathname === '/expense-tracker') {
    url.pathname = '/utility-tools';
    return NextResponse.redirect(url, 301);
  }

  // 7. Redirect old /image/[toolId] or /image to standard image paths
  if (pathname.startsWith('/image/')) {
    const toolId = pathname.substring(7);
    const tool = tools.find(t => t.id.toLowerCase() === toolId.toLowerCase());
    if (tool) {
      const categoryPath = mapCategoryToPath(tool.category);
      url.pathname = `/${categoryPath}/${tool.id}`;
      return NextResponse.redirect(url, 301);
    }
  }
  if (pathname === '/image') {
    url.pathname = '/image-tools';
    return NextResponse.redirect(url, 301);
  }

  // 8. Redirect signin to login
  if (pathname === '/signin' || pathname === '/signin.html') {
    url.pathname = '/login';
    return NextResponse.redirect(url, 301);
  }

  // 9. Redirect deleted video tools safely to tools homepage
  if (pathname.startsWith('/video-tools/') || pathname === '/video-tools') {
    url.pathname = '/tools';
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/tools/:path*',
    '/categories/:path*',
    '/utility/:path*',
    '/ai-writing/:path*',
    '/ai-writing',
    '/writing-tools',
    '/audio/:path*',
    '/audio',
    '/audio-tools',
    '/expense-tracker',
    '/image/:path*',
    '/image',
    '/signin',
    '/signin.html',
    '/video-tools/:path*',
    '/video-tools'
  ]
};

