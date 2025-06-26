import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple Content Proxy - Matches the working Pi project pattern
 * Route: /content/[id] (just like the ordinal-frame project)
 */

interface ContentParams {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: ContentParams }
) {
  const { id } = params;
  
  console.log(`🖼️ Simple content proxy for: ${id}`);

  // Try ordinals.com first (most reliable from your Pi project)
  const sourceUrl = `https://ordinals.com/content/${id}`;
  
  try {
    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'HEX-Portfolio-Tracker/1.0',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      console.log(`✅ Content fetched for: ${id}`);
      
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const content = await response.arrayBuffer();
      
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  } catch (error) {
    console.error(`❌ Failed to fetch content for ${id}:`, error);
  }

  return NextResponse.json(
    { error: 'Content not found', id },
    { status: 404 }
  );
}