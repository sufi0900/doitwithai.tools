// components/OGImageTemplate.jsx
"use client"
import React from 'react';

const OGImageTemplate = ({ title, description }) => {
  return (
    <div
      className="relative overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-200"
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#1a202c', // Your text color
        fontFamily: 'sans-serif',
        padding: '60px',
      }}
    >
      {/* Your background SVG and styling goes here */}
      
      {/* Dynamically rendered content */}
      <h1
        style={{
          fontSize: '68px',
          fontWeight: 'bold',
          lineHeight: '1',
          marginBottom: '20px',
          color: '#2b6cb0',
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: '32px',
          lineHeight: '1.4',
          maxWidth: '900px',
          color: '#4a5568',
        }}
      >
        {description}
      </p>
      
      {/* You can add your logo and other elements here */}
      <div style={{ position: 'absolute', bottom: '40px', right: '40px', fontSize: '24px' }}>
        doitwithai.tools
      </div>
    </div>
  );
};

export default OGImageTemplate;