'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

// ADD THIS FUNCTION
// This satisfies the Next.js static export requirement.
export function generateStaticParams() {
  return []
}

export default function StudioPage() {
  return <NextStudio config={config} />
}