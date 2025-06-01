/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";
import Link from "next/link";

import "animate.css";

const Hero = () => {
  return (
    <>
     <section
  id="home"
  className="relative z-10 overflow-hidden bg-teal-50 pt-[110px] dark:bg-gray-800 md:pt-[80px] xl:pt-[100px] 2xl:pt-[30px]"
>
<div className="container mx-auto flex flex-col items-center justify-center px-2 pb-8 lg:px-8 lg:pb-7 max-w-7xl">
  {/* Hero Component with improved styling variety */}
  <div className="hero-section w-full">
  {/* Welcome with letter animation */}

  <h1 className="text-4xl md:text-5xl lg:text-6xl text-center font-bold mb-2 ">
  {["W", "e", "l", "c", "o", "m", "e", " ", "t", "o"].map((letter, index) => (
    <span
      key={index}
      className={`inline-block transform transition-all duration-400 hover:scale-150 
        ${index === 0 ? 'hover:text-red-500' : ''} 
        ${index === 1 ? 'hover:text-green-500' : ''} 
        ${index === 2 ? 'hover:text-blue-500' : ''} 
        ${index === 3 ? 'hover:text-amber-500' : ''} 
        ${index === 4 ? 'hover:text-purple-500' : ''} 
        ${index === 5 ? 'hover:text-pink-500' : ''} 
        ${index === 6 ? 'hover:text-cyan-500' : ''} 
        ${index === 7 ? 'hover:text-indigo-500' : ''} 
        ${index === 8 ? 'hover:text-zinc-500' : ''} 
        ${index === 9 ? 'hover:text-primary' : ''} 
        animate__animated animate__fadeInDown`}
      style={{
        animationDelay: `${index * 0.1 + 0.5}s`,
        animationDuration: '0.6s',
        ...(letter !== " " && {
          animationFillMode: 'both',
        }),
      }}
    >
      <span
        className="inline-block"
        style={{
          animation: `float 2s ease-in-out infinite`,
          animationDelay: `${index * 0.1}s`,
        }}
      >
        {letter === " " ? "\u00A0" : letter}
      </span>
    </span>
  ))}
</h1>



  {/* Do It With AI Tools with animated gradient border */}
  <h2 className="text-3xl text-center md:text-4xl lg:text-5xl font-extrabold mb-6 text-gray-600 dark:text-gray-400 ">
    <span className="relative inline-block">
      {["Do", "It", "With", "AI", "Tools"].map((word, index) => (
        <span
          key={index}
          className="inline-block mx-1 animate__animated animate__backInDown"
          style={{ 
            animationDelay: `${0.5 + index * 0.3}s`, 
            animationDuration: '0.4s',
            background: index === 3 ? 'linear-gradient(90deg, #3b82f6, #6366f1)' : 'transparent',
            backgroundClip: index === 3 ? 'text' : 'border-box',
            WebkitBackgroundClip: index === 3 ? 'text' : 'border-box',
            WebkitTextFillColor: index === 3 ? 'transparent' : 'currentColor',
            position: 'relative'
          }}
        >
          {word}
          {index === 4 && 
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500 rounded animate-pulse"></span>
          }
        </span>
      ))}
    </span>
  </h2>

  {/* Intro paragraph with enhanced first letter */}
  <p className="hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-4 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl first-line:uppercase first-line:tracking-widest first-letter:text-7xl first-letter:font-bold first-letter:text-primary dark:first-letter:text-primary first-letter:me-3 first-letter:float-start">
    Your trusted space for exploring the exciting potential of
    <span className="relative inline-block mx-1 animate__animated animate__fadeInDownBig animate__delay-1s">
      {/* Star animation - left */}
      <span className="absolute -left-2 top-4 text-yellow-400 animate-pulse2 text-sm">
        ✨
      </span>

      <span className="   uppercase text-blue-600 dark:text-gray-400 text-xl bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">Artificial Intelligence</span>
    {/* Make underline visible always */}
    <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600 rounded transition-all duration-500"></span>
    
    {/* Stars with glowing effect on hover */}
    <span className="absolute -right-2 -top-1 text-yellow-400 text-xs rotate-12 transform transition-all animate-pulse2  duration-300 group-hover:scale-150 group-hover:opacity-100 opacity-100">✨</span>
    
    <span className="absolute -left-2 -bottom-2 text-yellow-400 text-xs -rotate-12 transform transition-all animate-pulse2  duration-300 group-hover:scale-150 group-hover:opacity-100 opacity-100">✨</span>
    </span>
    .
    <br/>
    Discover smart strategies, tools, and prompts to
    <span className="text-primary font-bold">:</span>
    <span className="inline-block px-2 py-1 mx-1 bg-primary/10 text-primary font-semibold rounded-md animate__animated animate__fadeInDownBig animate__delay-2s">
      improve SEO
    </span>,
    <span className="inline-block px-2 py-1 mx-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold rounded-md animate__animated animate__fadeInDownBig high-quality duration-300 ">
      create high-quality content
    </span>, and
    <span className="inline-block px-2 py-1 mx-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold rounded-md animate__animated animate__fadeInLeftBig animate__delay-3s">
      grow your digital presence
    </span> using 
    {/* ChatGPT with unique styling */}
    <span className="relative font-bold text-blue-700 dark:text-blue-300 chatgpt chatgpt-glow mx-2 inline-block  ">
  ChatGPT
  {/* Tailwind ping animation for glow effect */}
  <span className="pointer-events-none absolute inset-0 rounded-md opacity-20 bg-blue-400 dark:bg-blue-600 animate-ping z-[-1]"></span>
</span>



    and other powerful AI tools.
    <br />
    
    {/* You'll also find insights on with styled animation */}
 
    <span className="inline w-[30px] h-[2px] bg-primary/40 rounded-full"></span> You’ll also find insights on:
    <span className="inline w-[30px] h-[2px] bg-primary/40 rounded-full"></span>

  <span className="inline-block px-2 py-[2px] mx-1 bg-primary/20 text-primary font-medium rounded animate__animated animate__fadeInUp animate__delay-4s">
    • boosting productivity
  </span>
  and creativity with the best AI tools,
  <span className="inline-block px-2 py-1 mx-1 bg-purple-100 dark:bg-violet-900/30  text-purple-700 dark:text-purple-300 font-medium rounded animate__animated animate__fadeInUpBig animate__delay-4s">
    • earning online
  </span>
  and upskilling with AI, and
  <span className="inline-block px-2 py-[2px] mx-1 bg-indigo-100 dark:bg-cyan-900/30   text-blue-900 dark:text-white font-medium rounded animate__animated animate__fadeInUpBig coding-challenges">
    • solving coding challenges
  </span> through AI-assisted development.
</p>

  {/* Together let's unlock - with sophisticated animation */}
  {/* Together let's unlock - with sophisticated animation */}
  <p className="text-center font-medium text-lg mt-4">
  <span className="relative inline-block  animate__animated animate__fadeInLeftBig let-unlock">
    <span className="animate-shimmer bg-gradient-to-r from-transparent via-primary/20 to-transparent absolute inset-0 w-full"></span>
    <span className="text-primary dark:text-white text-2xl">Together, let's unlock the future of AI,</span>
  </span>
  <span className="group relative inline-block mx-2 animate__animated animate__fadeInRightBig  one-article">
    <span className="font-semibold italic text-blue-600 dark:text-primary text-xl bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 ">one article at a time</span>
    {/* Make underline visible always */}
    <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600 rounded transition-all duration-500"></span>
    
    {/* Stars with glowing effect on hover */}
    <span className="absolute -right-2 -top-1 text-yellow-400 text-xs rotate-12 transform transition-all animate-pulse2  duration-300 group-hover:scale-150 group-hover:opacity-100 opacity-100">✨</span>
    <span className="absolute -left-2 -bottom-2 text-yellow-400 text-xs -rotate-12 transform transition-all animate-pulse2  duration-300 group-hover:scale-150 group-hover:opacity-100 opacity-100">✨</span>
  </span>
</p>


</div>
  {/* Call to action - streamlined */}
  <div className="flex flex-col mt-5 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
    <Link href="/blogs">
      <button className="whitespace-nowrap rounded-sm bg-primary px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-primary/80 animate__animated animate__fadeInUp animate__delay-6s">
        🔍 Read Blogs
      </button>
    </Link>
    <Link href="/contact">
      <button className="whitespace-nowrap rounded-sm bg-black px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-black/90 dark:bg-white/10 dark:text-white dark:hover:bg-white/5 animate__animated animate__fadeInUp animate__delay-6.5s">
        💌 Sign Up for Newsletter
      </button>
    </Link>
  </div>
</div>


        <div className="absolute right-0 top-0 z-[-1] opacity-30 lg:opacity-100">
          <svg
            width="450"
            height="556"
            viewBox="0 0 450 556"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="277"
              cy="63"
              r="225"
              fill="url(#paint0_linear_25:217)"
            />
            <circle
              cx="17.9997"
              cy="182"
              r="18"
              fill="url(#paint1_radial_25:217)"
            />
            <circle
              cx="76.9997"
              cy="288"
              r="34"
              fill="url(#paint2_radial_25:217)"
            />
            <circle
              cx="325.486"
              cy="302.87"
              r="180"
              transform="rotate(-37.6852 325.486 302.87)"
              fill="url(#paint3_linear_25:217)"
            />
            <circle
              opacity="0.8"
              cx="184.521"
              cy="315.521"
              r="132.862"
              transform="rotate(114.874 184.521 315.521)"
              stroke="url(#paint4_linear_25:217)"
            />
            <circle
              opacity="0.8"
              cx="356"
              cy="290"
              r="179.5"
              transform="rotate(-30 356 290)"
              stroke="url(#paint5_linear_25:217)"
            />
            <circle
              opacity="0.8"
              cx="191.659"
              cy="302.659"
              r="133.362"
              transform="rotate(133.319 191.659 302.659)"
              fill="url(#paint6_linear_25:217)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_25:217"
                x1="-54.5003"
                y1="-178"
                x2="222"
                y2="288"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
              <radialGradient
                id="paint1_radial_25:217"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(17.9997 182) rotate(90) scale(18)"
              >
                <stop offset="0.145833" stopColor="#4A6CF7" stopOpacity="0" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0.08" />
              </radialGradient>
              <radialGradient
                id="paint2_radial_25:217"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(76.9997 288) rotate(90) scale(34)"
              >
                <stop offset="0.145833" stopColor="#4A6CF7" stopOpacity="0" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0.08" />
              </radialGradient>
              <linearGradient
                id="paint3_linear_25:217"
                x1="226.775"
                y1="-66.1548"
                x2="292.157"
                y2="351.421"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="paint4_linear_25:217"
                x1="184.521"
                y1="182.159"
                x2="184.521"
                y2="448.882"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="paint5_linear_25:217"
                x1="356"
                y1="110"
                x2="356"
                y2="470"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="paint6_linear_25:217"
                x1="118.524"
                y1="29.2497"
                x2="166.965"
                y2="338.63"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 z-[-1] opacity-30 lg:opacity-100">
          <svg
            width="364"
            height="201"
            viewBox="0 0 364 201"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.88928 72.3303C33.6599 66.4798 101.397 64.9086 150.178 105.427C211.155 156.076 229.59 162.093 264.333 166.607C299.076 171.12 337.718 183.657 362.889 212.24"
              stroke="url(#paint0_linear_25:218)"
            />
            <path
              d="M-22.1107 72.3303C5.65989 66.4798 73.3965 64.9086 122.178 105.427C183.155 156.076 201.59 162.093 236.333 166.607C271.076 171.12 309.718 183.657 334.889 212.24"
              stroke="url(#paint1_linear_25:218)"
            />
            <path
              d="M-53.1107 72.3303C-25.3401 66.4798 42.3965 64.9086 91.1783 105.427C152.155 156.076 170.59 162.093 205.333 166.607C240.076 171.12 278.718 183.657 303.889 212.24"
              stroke="url(#paint2_linear_25:218)"
            />
            <path
              d="M-98.1618 65.0889C-68.1416 60.0601 4.73364 60.4882 56.0734 102.431C120.248 154.86 139.905 161.419 177.137 166.956C214.37 172.493 255.575 186.165 281.856 215.481"
              stroke="url(#paint3_linear_25:218)"
            />
            <circle
              opacity="0.8"
              cx="214.505"
              cy="60.5054"
              r="49.7205"
              transform="rotate(-13.421 214.505 60.5054)"
              stroke="url(#paint4_linear_25:218)"
            />
            <circle cx="220" cy="63" r="43" fill="url(#paint5_radial_25:218)" />
            <defs>
              <linearGradient
                id="paint0_linear_25:218"
                x1="184.389"
                y1="69.2405"
                x2="184.389"
                y2="212.24"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" stopOpacity="0" />
                <stop offset="1" stopColor="#4A6CF7" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_25:218"
                x1="156.389"
                y1="69.2405"
                x2="156.389"
                y2="212.24"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" stopOpacity="0" />
                <stop offset="1" stopColor="#4A6CF7" />
              </linearGradient>
              <linearGradient
                id="paint2_linear_25:218"
                x1="125.389"
                y1="69.2405"
                x2="125.389"
                y2="212.24"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" stopOpacity="0" />
                <stop offset="1" stopColor="#4A6CF7" />
              </linearGradient>
              <linearGradient
                id="paint3_linear_25:218"
                x1="93.8507"
                y1="67.2674"
                x2="89.9278"
                y2="210.214"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" stopOpacity="0" />
                <stop offset="1" stopColor="#4A6CF7" />
              </linearGradient>
              <linearGradient
                id="paint4_linear_25:218"
                x1="214.505"
                y1="10.2849"
                x2="212.684"
                y2="99.5816"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
              <radialGradient
                id="paint5_radial_25:218"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(220 63) rotate(90) scale(43)"
              >
                <stop offset="0.145833" stopColor="white" stopOpacity="0" />
                <stop offset="1" stopColor="white" stopOpacity="0.08" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </section>
    </>
  );
};

export default Hero;
