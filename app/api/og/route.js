// app/api/og/route.js - Optimized for performance and visibility
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Simplified parameters - removed features
    const title = searchParams.get('title') || 'Boost Your SEO and Daily Productivity with Cutting-Edge AI Tools';
    const category = searchParams.get('category') || 'AI Tools';
    const badge = searchParams.get('badge') || 'NEW!';
    const bgColor = searchParams.get('bgColor') || 'blue';
    
    const ctaText = searchParams.get('ctaText') || 'Start Your AI Journey';

    // Streamlined color schemes for better performance
    const colorSchemes = {
      blue: {
        primary: '#2563eb',
        secondary: '#1d4ed8',
        accent: '#3b82f6',
        light: '#60a5fa',
        gradient: 'linear-gradient(135deg, #bfdbfe 0%, #c7d2fe 50%, #ddd6fe 100%)',
      },
      purple: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#a78bfa',
        light: '#c4b5fd',
        gradient: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 50%, #fae8ff 100%)',
      },
      green: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#34d399',
        light: '#6ee7b7',
        gradient: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 50%, #a7f3d0 100%)',
      }
    };

    const currentScheme = colorSchemes[bgColor] || colorSchemes.blue;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: currentScheme.gradient,
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Minimal background elements for better performance */}
          <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.5 }}>
            <defs>
              <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={currentScheme.primary} stopOpacity="0.7" />
                <stop offset="100%" stopColor={currentScheme.accent} stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={currentScheme.primary} stopOpacity="0.6" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {/* Reduced nodes for performance */}
            <circle cx="1050" cy="110" r="8" fill={currentScheme.accent} opacity="0.7" />
            <circle cx="200" cy="480" r="8" fill="#8b5cf6" opacity="0.7" />
            <circle cx="600" cy="470" r="8" fill="#10b981" opacity="0.7" />
            <circle cx="1000" cy="480" r="8" fill="#8b5cf6" opacity="0.7" />
            {/* Simplified Circuit Pattern */}
            <rect x="50" y="250" width="200" height="120" rx="15" fill="none" stroke="url(#circuitGradient)" strokeWidth="2" opacity="0.6" />
            <rect x="950" y="280" width="180" height="100" rx="12" fill="none" stroke="url(#circuitGradient)" strokeWidth="2" opacity="0.6" />
            {/* Reduced Data Flow Lines */}
            <path d="M60,280 L240,280" stroke={currentScheme.primary} strokeWidth="2" opacity="0.7" strokeDasharray="5,5" />
            <path d="M60,320 L240,320" stroke={currentScheme.light} strokeWidth="2" opacity="0.7" strokeDasharray="5,5" />
            <path d="M960,310 L1120,310" stroke="#8b5cf6" strokeWidth="2" opacity="0.7" strokeDasharray="5,5" />
            {/* Simplified AI pattern elements */}
            <polygon points="100,350 120,330 140,350 120,370" fill="#10b981" opacity="0.5" />
            <polygon points="1100,200 1120,180 1140,200 1120,220" fill="#8b5cf6" opacity="0.5" />
          </svg>

          {/* Main content container */}
       <div
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '60px 40px',
    zIndex: 10,
    position: 'relative',
    maxWidth: '1120px',
  }}
>
  {/* Logo and Brand Section - Now Correctly Spaced */}
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
    {/* This is the container for the logo, now with the correct margin */}
    <div
      style={{
        width: '122px',
        height: '122px',
        borderRadius: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight:"6px",
     
      }}
    >
        <img
  src={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://doitwithai.tools'}/D2.png`}
  width={142}
  height={142}
  style={{
  paddingRight: "10px",
    objectFit: 'contain',
  }}
   alt="DoItWithAI.tools Logo"
/>

 </div>
           
              {/* Brand Name - Enhanced visibility */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <h1
        style={{
          fontSize: '72px',
          fontWeight: '900',
          background: `linear-gradient(135deg, ${currentScheme.primary}, ${currentScheme.secondary})`,
          backgroundClip: 'text',
          color: 'transparent',
          margin: 0,
          textShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          letterSpacing: '-2px',
          fontFamily: 'Inter, system-ui, sans-serif',
          lineHeight: '0.9',
        }}
      >
        DoItWithAI.tools
      </h1>
      
      {/* Enhanced Badge */}
      <div
        style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '8px 16px', // Reduced padding
          borderRadius: '32px',
          fontSize: '16px', // Reduced font size
          fontWeight: '800',
          textTransform: 'uppercase',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
          border: '3px solid rgba(255, 255, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '12px', // Reduced size for dot
            height: '12px', // Reduced size for dot
            borderRadius: '50%',
            backgroundColor: '#a7f3d0' // New color for dot
          }}
        />
        {badge}
      </div>
    </div>
  </div>
            {/* Main Title - Optimized for readability */}
            <h2
              style={{
                fontSize: title.length > 60 ? '44px' : title.length > 40 ? '52px' : '60px',
                fontWeight: '800',
                color: '#111827',
                textAlign: 'center',
                lineHeight: '1.1',
                marginBottom: '48px',
                maxWidth: '1000px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                letterSpacing: '-0.5px',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {title}
            </h2>

            {/* Enhanced Call to Action Button - Much larger and more visible */}
            <div
              style={{
                background: `linear-gradient(135deg, ${currentScheme.primary}, ${currentScheme.secondary})`,
                border: '4px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '32px',
                padding: '28px 56px',
                color: 'white',
                fontSize: '32px',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                transform: 'translateY(-2px)',
              }}
            >
              <div style={{ 
                fontSize: '36px', 
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' 
              }}>
                🚀
              </div>
              <span style={{ letterSpacing: '-0.5px' }}>{ctaText}</span>
              <div style={{ 
                fontSize: '32px', 
                transform: 'translateX(4px)',
                fontWeight: '900'
              }}>
                →
              </div>
            </div>

          
          </div>

          {/* Bottom Brand Watermark - Enhanced visibility */}
          <div
            style={{
              position: 'absolute',
              bottom: '32px',
              right: '48px',
              color: '#374151',
              fontSize: '20px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '24px',
                background: `linear-gradient(135deg, ${currentScheme.primary}, ${currentScheme.secondary})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            />
            doitwithai.tools
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );
  } catch (e) {
    console.log(`OG Image generation error: ${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

