// app/api/comments/route.js
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

// Initialize Sanity client for write operations
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN, // You'll need a write token
  apiVersion: '2024-01-01',
  useCdn: false, // Don't use CDN for write operations
});

// Validation helper
const validateCommentData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!data.comment || data.comment.trim().length < 10) {
    errors.push('Comment must be at least 10 characters long');
  }
  
  if (data.comment && data.comment.length > 1000) {
    errors.push('Comment must be less than 1000 characters');
  }
  
  if (!data.articleId) {
    errors.push('Article ID is required');
  }
  
  return errors;
};

// Basic spam detection
const detectSpam = (data) => {
  const spamKeywords = ['viagra', 'casino', 'loan', 'bitcoin', 'crypto', 'investment'];
  const text = (data.comment + ' ' + data.name).toLowerCase();
  
  // Check for spam keywords
  if (spamKeywords.some(keyword => text.includes(keyword))) {
    return true;
  }
  
  // Check for excessive links
  const linkCount = (data.comment.match(/https?:\/\//g) || []).length;
  if (linkCount > 2) {
    return true;
  }
  
  // Check for repeated characters
  if (/(.)\1{10,}/.test(data.comment)) {
    return true;
  }
  
  return false;
};

// POST - Submit a new comment
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, comment, articleId, articleSlug, articleType, articleTitle } = body;

    // Validate input
    const validationErrors = validateCommentData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Get client IP and user agent for spam protection
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Basic spam detection
    const isSpam = detectSpam(body);

    // First, verify the article exists
    const articleExists = await client.fetch(
      `*[_id == $articleId][0]`,
      { articleId }
    );

    if (!articleExists) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Create the comment document
    const commentDoc = {
      _type: 'comment',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      comment: comment.trim(),
      relatedArticle: {
        _type: 'reference',
        _ref: articleId
      },
      articleSlug: articleSlug,
      articleType: articleType,
      status: isSpam ? 'spam' : 'pending',
      submittedAt: new Date().toISOString(),
      ipAddress,
      userAgent
    };

    // Submit to Sanity
    const result = await client.create(commentDoc);

    return NextResponse.json({
      success: true,
      message: isSpam 
        ? 'Comment submitted but flagged for review'
        : 'Comment submitted successfully and is pending review',
      commentId: result._id
    });

  } catch (error) {
    console.error('Error submitting comment:', error);
    return NextResponse.json(
      { error: 'Failed to submit comment. Please try again.' },
      { status: 500 }
    );
  }
}

// GET - Retrieve comments for an article
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    const status = searchParams.get('status') || 'approved';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Fetch comments for the article
    const comments = await client.fetch(
      `*[_type == "comment" && references($articleId) && status == $status] | order(submittedAt desc) [0...$limit] {
        _id,
        name,
        comment,
        submittedAt,
        status
      }`,
      { articleId, status, limit }
    );

    return NextResponse.json({
      success: true,
      comments,
      count: comments.length
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}