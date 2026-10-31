// components/WebVitals.js
import { useEffect } from 'react';
import {    onLCP } from 'web-vitals';

export default function WebVitals() {
  useEffect(() => {
    // getCLS(console.log);
    // getFID(console.log);
    // getFCP(console.log);
    onLCP(console.log);
    // getTTFB(console.log);
  }, []);

  return null;
}