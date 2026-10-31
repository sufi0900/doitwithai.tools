import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  if (!key) {
    return NextResponse.json({ error: 'Key is required' }, { status: 400 });
  }

  try {
    const data = await redis.get(key);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Redis GET error:', error);
    return NextResponse.json({ error: 'Failed to get data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { key, value, ttl } = await request.json();
    
    if (!key || !value) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    let result;
    if (ttl) {
      result = await redis.setex(key, ttl, JSON.stringify(value));
    } else {
      result = await redis.set(key, JSON.stringify(value));
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Redis SET error:', error);
    return NextResponse.json({ error: 'Failed to set data' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  if (!key) {
    return NextResponse.json({ error: 'Key is required' }, { status: 400 });
  }

  try {
    const result = await redis.del(key);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Redis DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}