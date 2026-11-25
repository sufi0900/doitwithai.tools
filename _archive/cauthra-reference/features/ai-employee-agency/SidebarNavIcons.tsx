'use client';

export function SidebarNavIcon({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  const lower = label.toLowerCase();
  const baseClass = `h-4 w-4 shrink-0 transition-colors ${
    active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
  }`;

  // Dedicated Official Brand SVG Icons for Social & Video Sub-Items
  if (lower.includes('pinterest')) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`h-4 w-4 shrink-0 transition-colors ${
          active ? 'text-white' : 'text-[#E11D48] group-hover:text-[#FB7185]'
        }`}
      >
        <path d="M12.017 2C6.486 2 2 6.486 2 12.017c0 4.242 2.637 7.868 6.357 9.327-.088-.792-.167-2.008.035-2.874.182-.782 1.176-4.985 1.176-4.985s-.3-.6-.3-1.488c0-1.394.808-2.435 1.814-2.435.855 0 1.268.642 1.268 1.412 0 .86-.548 2.146-.831 3.338-.236.998.5 1.812 1.484 1.812 1.781 0 3.151-1.878 3.151-4.588 0-2.399-1.724-4.076-4.186-4.076-2.851 0-4.525 2.138-4.525 4.349 0 .861.331 1.785.745 2.287a.3.3 0 0 1 .069.288c-.076.316-.245.998-.278 1.138-.044.183-.145.222-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.531 0 10.017-4.486 10.017-10.017C22.034 6.486 17.548 2 12.017 2Z" />
      </svg>
    );
  }

  if (lower.includes('linkedin')) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`h-4 w-4 shrink-0 transition-colors ${
          active ? 'text-white' : 'text-[#0A66C2] group-hover:text-[#38BDF8]'
        }`}
      >
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14Zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75ZM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68Zm1.39 9.94v-8.37H5.5v8.37h2.77Z" />
      </svg>
    );
  }

  if (lower.includes('facebook')) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`h-4 w-4 shrink-0 transition-colors ${
          active ? 'text-white' : 'text-[#1877F2] group-hover:text-[#60A5FA]'
        }`}
      >
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
      </svg>
    );
  }

  if (lower.includes('tiktok') || lower.includes('reels') || lower.includes('video')) {
    if (lower.includes('hub')) {
      return (
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={baseClass}>
          <path
            d="M4 10a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm8-5a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm0 10a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM7.7 9l4.6-2.9M7.7 11l4.6 2.9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`h-4 w-4 shrink-0 transition-colors ${
          active ? 'text-white' : 'text-slate-200 group-hover:text-white'
        }`}
      >
        <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1-2.6-2.6 2.59 2.59 0 0 1 2.6-2.6c.27 0 .53.04.78.12V9.67a5.75 5.75 0 0 0-.78-.05A5.7 5.7 0 0 0 4.17 15.3 5.7 5.7 0 0 0 9.86 21a5.7 5.7 0 0 0 5.69-5.7V9.02a7.3 7.3 0 0 0 4.28 1.38V7.33a4.3 4.3 0 0 1-3.23-1.51Z" />
      </svg>
    );
  }

  // Calm Monochrome 16x16 Icons for Core Agency Panels
  if (lower.includes('overview')) {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={baseClass}>
        <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="11" y="3" width="6" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="11" y="9" width="6" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  if (lower.includes('calendar')) {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={baseClass}>
        <rect x="3" y="4.5" width="14" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M6.5 2.5v3M13.5 2.5v3M3 8.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (lower.includes('node') || lower.includes('canvas')) {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={baseClass}>
        <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="4.5" cy="5.5" r="1.6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="15.5" cy="5.5" r="1.6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="16.5" r="1.6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.8 6.6 8.3 8.6M14.2 6.6l-2.5 2M10 12.2v2.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (lower.includes('keyword') || lower.includes('topic')) {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={baseClass}>
        <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="m13.2 13.2 3.5 3.5M9 6.5v5M6.5 9h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (lower.includes('article') || lower.includes('studio')) {
    if (lower.includes('visual') || lower.includes('brand')) {
      return (
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={baseClass}>
          <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="7.5" cy="8.5" r="1.3" fill="currentColor" />
          <path d="m4.5 14 3.5-3.2 2.5 2.2 2.8-2.8 2.2 3.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={baseClass}>
        <path d="M5 3.5h7.5L16 7v9.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (lower.includes('technical') || lower.includes('audit')) {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={baseClass}>
        <path d="M10 2.8 16 5.2v4.6c0 3.7-2.6 6.5-6 7.4-3.4-.9-6-3.7-6-7.4V5.2L10 2.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="m7.5 10 1.8 1.8 3.4-3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (lower.includes('refresh') || lower.includes('on-page')) {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={baseClass}>
        <path d="M16 10a6 6 0 1 1-1.6-4.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M16 3.5v3.2h-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (lower.includes('visibility') || lower.includes('links')) {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={baseClass}>
        <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3.8 10h12.4M10 3.5c1.8 2 1.8 11 0 13M10 3.5c-1.8 2-1.8 11 0 13" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }

  if (lower.includes('qa') || lower.includes('publish')) {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={baseClass}>
        <circle cx="10" cy="10" r="6.8" stroke="currentColor" strokeWidth="1.6" />
        <path d="m7.2 10.2 2 2 3.8-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (lower.includes('token') || lower.includes('usage')) {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={baseClass}>
        <path d="M3.5 14.5 7.5 10l3 2.5 6-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.5 16.5h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Default: Agent Skills & Cron / Settings
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={baseClass}>
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10 3v2M10 15v2M3 10h2M15 10h2M5.1 5.1l1.4 1.4M13.5 13.5l1.4 1.4M14.9 5.1l-1.4 1.4M6.5 13.5l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
