import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import { findCachedImage } from '@/lib/image-cache';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  // La key es un hex de 24 chars generado por nosotros — igual se valida el
  // formato antes de tocar el filesystem con algo que vino de una URL.
  if (!/^[a-f0-9]{24}$/.test(key)) return new NextResponse('not found', { status: 404 });

  const found = findCachedImage(key);
  if (!found) return new NextResponse('not found', { status: 404 });

  const body = fs.readFileSync(found.path);
  return new NextResponse(new Uint8Array(body), {
    headers: {
      'Content-Type': found.mediaType,
      // Content-addressed por hash del prompt: si existe, nunca cambia.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
