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

  return NextResponse.next();
}

// Intercept only old tools and categories pathways to optimize runtime latency
export const config = {
  matcher: ['/tools/:path*', '/categories/:path*']
};
