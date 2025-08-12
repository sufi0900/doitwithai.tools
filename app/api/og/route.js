// app/api/og/route.js
import Image from 'next/image';
import { ImageResponse } from 'next/og'

export const runtime = 'edge'



export async function GET(request) {



  try {
     // Load Inter font from your public folder
    const interFont = await fetch(
      new URL('../../../public/inter.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer())

    const { searchParams } = new URL(request.url)
    // Add your base64 logo string here

    // Extract parameters from URL
    const title = searchParams.get('title') || 'DoItWithAI.Tools'
    const description = searchParams.get('description') || 'Boost SEO and Daily Productivity with AI'
    const category = searchParams.get('category') || 'AI Tools'
    const badge = searchParams.get('badge') || 'NEW!'
    const bgColor = searchParams.get('bgColor') || 'blue'

    const author = searchParams.get('author') || null
    const readTime = searchParams.get('readTime') || null
    const ctaText = searchParams.get('ctaText') || 'Start Your AI Journey'; // New CTA parameter

        const featuresParam = searchParams.get('features'); // New Features parameter

    const features = featuresParam ? featuresParam.split(',').map(f => f.trim()) : ['AI-Powered SEO', '10x Productivity', 'Free Resources'];

    // You can also add a color array for the feature icons.
    const featureColors = ['#2563eb', '#8b5cf6', '#10b981'];
    // Enhanced color schemes matching your brand
    const colorSchemes = {
      blue: {
        primary: '#2563eb',
        secondary: '#1d4ed8',
        tertiary: '#1e40af',
        accent: '#3b82f6',
        light: '#60a5fa',
        gradient: 'linear-gradient(135deg, #bfdbfe 0%, #c7d2fe 50%, #ddd6fe 100%)',
      },
      purple: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        tertiary: '#6d28d9',
        accent: '#a78bfa',
        light: '#c4b5fd',
        gradient: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 50%, #fae8ff 100%)',
      },
      green: {
        primary: '#10b981',
        secondary: '#059669',
        tertiary: '#047857',
        accent: '#34d399',
        light: '#6ee7b7',
        gradient: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 50%, #a7f3d0 100%)',
      },
      orange: {
        primary: '#f97316',
        secondary: '#ea580c',
        tertiary: '#dc2626',
        accent: '#fb923c',
        light: '#fdba74',
        gradient: 'linear-gradient(135deg, #fed7aa 0%, #fde68a 50%, #fef3c7 100%)',
      },
      teal: {
        primary: '#0d9488',
        secondary: '#0f766e',
        tertiary: '#134e4a',
        accent: '#14b8a6',
        light: '#5eead4',
        gradient: 'linear-gradient(135deg, #ccfbf1 0%, #a7f3d0 50%, #bfdbfe 100%)',
      }
    }

    const currentScheme = colorSchemes[bgColor] || colorSchemes.blue

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
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif', // Enhanced font stack
          }}
        >
          {/* Enhanced AI Background Elements - Direct JSX SVG */}
          <svg
            width="1200"
            height="630"
            viewBox="0 0 1200 630"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: 0.6,
            }}
          >
            <defs>
              <linearGradient id="neuralGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={currentScheme.primary} stopOpacity="0.8" />
                <stop offset="50%" stopColor={currentScheme.accent} stopOpacity="0.6" />
                <stop offset="100%" stopColor={currentScheme.light} stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="neuralGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={currentScheme.primary} stopOpacity="0.7" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            
            {/* Neural Network Nodes */}
            {/* <circle cx="150" cy="120" r="12" fill={currentScheme.primary} opacity="0.8" />
            <circle cx="350" cy="80" r="10" fill={currentScheme.accent} opacity="0.8" />
            <circle cx="550" cy="140" r="11" fill={currentScheme.primary} opacity="0.8" />
            <circle cx="750" cy="100" r="9" fill={currentScheme.light} opacity="0.8" />
            <circle cx="950" cy="160" r="12" fill={currentScheme.primary} opacity="0.8" /> */}
            <circle cx="1050" cy="110" r="10" fill={currentScheme.accent} opacity="0.8" />
            
            {/* Bottom nodes */}
            <circle cx="200" cy="480" r="10" fill="#8b5cf6" opacity="0.8" />
            <circle cx="400" cy="520" r="11" fill="#10b981" opacity="0.8" />
            <circle cx="600" cy="470" r="9" fill="#8b5cf6" opacity="0.8" />
            <circle cx="800" cy="510" r="12" fill="#10b981" opacity="0.8" />
            <circle cx="1000" cy="480" r="10" fill="#8b5cf6" opacity="0.8" />
            
            {/* Connecting Lines */}
            {/* <path
              d="M150,120 L350,80 L550,140 L750,100 L950,160 L1050,110"
              stroke="url(#neuralGradient1)"
              strokeWidth="4"
              fill="none"
              opacity="0.9"
              strokeDasharray="15,8"
            />
            <path
              d="M200,480 L400,520 L600,470 L800,510 L1000,480"
              stroke="url(#neuralGradient2)"
              strokeWidth="4"
              fill="none"
              opacity="0.9"
              strokeDasharray="12,6"
            /> */}
            
            {/* Vertical connections */}
            {/* <path d="M350,80 L400,520" stroke={currentScheme.primary} strokeWidth="3" opacity="0.6" strokeDasharray="8,15" />
            <path d="M550,140 L600,470" stroke={currentScheme.accent} strokeWidth="3" opacity="0.6" strokeDasharray="8,15" />
            <path d="M750,100 L800,510" stroke={currentScheme.light} strokeWidth="3" opacity="0.6" strokeDasharray="8,15" />
             */}
            {/* Circuit Pattern */}
            <rect x="50" y="250" width="200" height="120" rx="15" fill="none" stroke="url(#circuitGradient)" strokeWidth="3" opacity="0.7" />
            <rect x="950" y="280" width="180" height="100" rx="12" fill="none" stroke="url(#circuitGradient)" strokeWidth="3" opacity="0.7" />
            
            {/* Data Flow Lines */}
            <path d="M60,280 L240,280" stroke={currentScheme.primary} strokeWidth="2.5" opacity="0.8" strokeDasharray="6,6" />
            <path d="M60,300 L240,300" stroke={currentScheme.accent} strokeWidth="2.5" opacity="0.8" strokeDasharray="6,6" />
            <path d="M60,320 L240,320" stroke={currentScheme.light} strokeWidth="2.5" opacity="0.8" strokeDasharray="6,6" />
            <path d="M960,310 L1120,310" stroke="#8b5cf6" strokeWidth="2.5" opacity="0.8" strokeDasharray="6,6" />
            <path d="M960,330 L1120,330" stroke="#10b981" strokeWidth="2.5" opacity="0.8" strokeDasharray="6,6" />
            
            {/* AI pattern elements */}
            <polygon points="100,350 120,330 140,350 120,370" fill="#10b981" opacity="0.6" />
            <polygon points="1100,200 1120,180 1140,200 1120,220" fill="#8b5cf6" opacity="0.6" />
            
            {/* Brain/AI pattern elements */}
            <path d="M80,400 Q120,380 160,400 T240,400" stroke={currentScheme.primary} strokeWidth="2" opacity="0.6" fill="none" />
            <path d="M1000,150 Q1040,130 1080,150 T1160,150" stroke="#8b5cf6" strokeWidth="2" opacity="0.6" fill="none" />
          </svg>

          {/* Main Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '60px',
              zIndex: 10,
              position: 'relative',
            }}
          >
            {/* Logo and Brand Section */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              {/* Enhanced Logo */}
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '24px',
             
                }}
              >
   </div>

              {/* Brand Name and Badge */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{
      fontSize: '72px',           // Increased from 55px
      fontWeight: '900',          // Increased from 800
      background: `linear-gradient(135deg, ${currentScheme.primary}, ${currentScheme.secondary}, ${currentScheme.tertiary})`,
      backgroundClip: 'text',
      color: 'transparent',
      margin: 0,
      marginRight: '24px',
      textShadow: '0 4px 8px rgba(0,0,0,0.15)',  // Enhanced shadow
      letterSpacing: '-2px',      // Increased letter spacing
      fontFamily: 'Inter, system-ui, sans-serif',
      lineHeight: '0.85',         // Tighter line height
    }}>
      DoItWithAI.tools
    </h1>
    
                
                {/* Enhanced Badge */}
               <div style={{
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      padding: '10px 18px',       // Slightly larger padding
      borderRadius: '24px',       // More rounded
      fontSize: '16px',           // Slightly larger
      fontWeight: '700',          // Bolder
      textTransform: 'uppercase',
      boxShadow: '0 6px 20px rgba(16,185,129,0.4)',  // Enhanced shadow
      border: '2px solid rgba(255,255,255,0.3)',     // Thicker border
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        width: '10px',            // Slightly larger dot
        height: '10px',
        borderRadius: '50%',
        backgroundColor: '#34d399',
      }}/>
      {badge}
    </div>
  </div>
</div>

            {/* Enhanced Category Tag */}
        <div style={{
  background: `rgba(255,255,255,0.25)`,    // More subtle
  backdropFilter: 'blur(12px)',
  color: currentScheme.primary,
  padding: '10px 20px',                    // Smaller padding
  borderRadius: '20px',                    // Less rounded
  fontSize: '14px',                        // Smaller font
  fontWeight: '500',                       // Less bold
  marginBottom: '28px',
  textTransform: 'uppercase',
  letterSpacing: '1px',                    // Less spacing
  border: `1px solid rgba(255,255,255,0.3)`,  // Thinner border
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',     // Subtle shadow
}}>
  {category}
</div>

            {/* Main Title with Enhanced Styling */}
      {/* Enhanced Main Title - Secondary Prominence */}
<h2 style={{
  fontSize: title.length > 50 ? '38px' : '42px',    // Reduced from 44px/52px
  fontWeight: '600',                                 // Reduced from 700
  color: '#374151',                                 // Slightly muted
  textAlign: 'center',
  lineHeight: '1.15',
  marginBottom: '20px',                             // Reduced margin
  maxWidth: '900px',
  textShadow: '0 1px 4px rgba(0,0,0,0.08)',        // Subtle shadow
  letterSpacing: '-0.5px',                         // Less spacing
  fontFamily: 'Inter, system-ui, sans-serif',
}}>
  {title}
</h2>

{/* Enhanced Description - Least Prominent */}
<p style={{
  fontSize: '18px',                                 // Reduced from 22px
  color: '#6b7280',                                // More muted
  textAlign: 'center',
  lineHeight: '1.4',
  marginBottom: '28px',                            // Reduced margin
  maxWidth: '750px',                               // Slightly narrower
  fontWeight: '400',                               // Normal weight
  fontFamily: 'Inter, system-ui, sans-serif',
  opacity: '0.9',                                  // Slightly transparent
}}>
  {description}
</p>
            {/* Enhanced Key Features */}
          <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '24px',                                     // Reduced gap
  marginBottom: '28px',
  flexWrap: 'wrap',
}}>
  {features.map((feature, index) => (
    <div key={index} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px'                                   // Reduced gap
    }}>
      <div style={{
        width: '10px',                             // Smaller dots
        height: '10px',
        borderRadius: '50%',
        background: featureColors[index] || currentScheme.primary,
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',  // Subtle shadow
      }}/>
      <span style={{
        color: '#4b5563',                          // More muted
        fontSize: '16px',                          // Smaller font
        fontWeight: '500',                         // Less bold
      }}>
        {feature}
      </span>
    </div>
  ))}
</div>

            {/* Enhanced Call to Action Button */}
             <div
              style={{
                background: `linear-gradient(135deg, ${currentScheme.primary}, ${currentScheme.secondary})`,
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                padding: '16px 32px',
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                }}
              >
                🚀
              </div>
              <span>{ctaText}</span> {/* Use the dynamic CTA text */}
              <div
                style={{
                  fontSize: '20px',
                  transform: 'translateX(2px)',
                }}
              >
                →
              </div>
            </div>

            {/* Author and Read Time (if provided) */}
            {(author || readTime) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginTop: '24px',
                  fontSize: '16px',
                  color: '#6b7280',
                }}
              >
                {author && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ fontSize: '16px' }}>✍️</div>
                    <span>{author}</span>
                  </div>
                )}
                {author && readTime && (
                  <div
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: '#9ca3af',
                    }}
                  />
                )}
                {readTime && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ fontSize: '16px' }}>⏱️</div>
                    <span>{readTime} min read</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Bottom Brand Watermark */}
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              right: '32px',
              color: '#6b7280',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '15px',
                height: '15px',
                borderRadius: '17px',
                background: `linear-gradient(135deg, ${currentScheme.primary}, ${currentScheme.secondary})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
              }}
            >
              
            </div>
            doitwithai.tools
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}