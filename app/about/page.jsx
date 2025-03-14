/* eslint-disable @next/next/no-img-element */
"use client"
import Link from "next/link";
import React, { useState, useEffect } from 'react';

/* eslint-disable react/no-unescaped-entities */
const AboutPage = () => {
    const [animationPhase, setAnimationPhase] = useState(0);
  
    // Subtle animation for border pulsing
    useEffect(() => {
      const interval = setInterval(() => {
        setAnimationPhase(prev => (prev + 1) % 100);
      }, 50);
      
      return () => clearInterval(interval);
    }, []);
    
    // Calculate animation values
    const pulseIntensity = Math.abs(Math.sin(animationPhase * 0.1)) * 0.5 + 0.5;
    const borderWidth = 1 + pulseIntensity * 2;
    

  return (
    <>
     <div className="container mt-8 flex flex-col md:flex-row">
            <div className="">
          

<br />
<br />
        
                <h1 className="mb-6 text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">About Us</h1>
                <div className="mb-6">
    <h2 className="font-bold mb-4 text-xl sm:text-2xl lg:text-3xl text-gray-800 dark:text-white leading-tight transition-all duration-300 ease-in-out transform hover:scale-[1.03]">
        Welcome to <Link href="/" className="text-primary underline hover:no-underline font-bold">Do It With AI Tools!</Link>
    </h2>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        The best website for professionals looking to improve their creativity, productivity, and digital strategy by utilizing artificial intelligence (AI). 
    </p>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        Our mission is to empower you with the insights, tools, and strategies needed to transform your work and personal projects. <br />
        We aim to help you harness cutting-edge AI innovations that foster creativity and productivity.
    </p>
</div>

                <div className="mb-6">
    <h2 className="font-bold mb-4 text-xl sm:text-2xl lg:text-3xl text-gray-800 dark:text-white leading-tight transition-all duration-300 ease-in-out transform hover:scale-[1.03]">
        Who We Are
    </h2>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        I am the sole author and creator behind <span className="font-semibold text-primary">DoItWithAI.Tools</span>. I manage every aspect of the website, from development to content creation. My goal is to connect advanced AI capabilities with practical professional applications. 
    </p>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        As a passionate web developer and AI enthusiast, I aim to empower you with tools and insights that enhance productivity and creativity through innovative AI applications.
    </p>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        To help you navigate the dynamic world of AI, our website is divided into several core areas. Each section highlights essential aspects of AI integration and application:
    </p>
</div>

<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 text-black dark:text-white leading-tight transition-all duration-300 ease-in-out transform hover:scale-[1.03]">
    To help you navigate the dynamic world of AI, our website is divided into several core areas. Each section highlights essential aspects of AI integration and application:
  </h2>
  <ul className="list-disc list-inside">
    <li className="text-lg sm:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-2">
      <Link className="text-primary underline hover:no-underline font-bold transition-all duration-300 ease-in-out mr-2" href="/">
        Best AI Tools
      </Link>  
      Explore an extensive collection of artificial intelligence tools and resources, all designed for boosting your productivity and creativity.
    </li>
    <li className="text-lg sm:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-2">
      <Link className="text-primary underline hover:no-underline font-bold transition-all duration-300 ease-in-out mr-2" href="/">
        Code With AI
      </Link>  
      Learn how AI can assist in coding processes, from simple scripts to complex applications.
    </li>
    <li className="text-lg sm:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-2">
      <Link className="text-primary underline hover:no-underline font-bold transition-all duration-300 ease-in-out mr-2" href="/">
        AI in SEO & Digital Marketing
      </Link>  
      Unlock AI-driven strategies to elevate your website’s visibility, optimize digital content, and supercharge your SEO efforts.
    </li>
    <li className="text-lg sm:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-2">
      <Link className="text-primary underline hover:no-underline font-bold transition-all duration-300 ease-in-out mr-2" href="/">
        Make Money With AI
      </Link>  
      Discover ways to monetize AI through innovative methods and tools that generate income.
    </li>
  </ul>
</div>


<div className="mb-8">
    <h2 className="font-bold mb-4 text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-gray-800 dark:text-white leading-tight transition-all duration-300 ease-in-out transform hover:scale-[1.03]">
        Our Vision
    </h2> 

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        At <span className="text-primary font-bold">DoItWithAI.Tools</span>, we see AI as a powerful tool that not only optimizes tasks but also redefines how those tasks are conceived. Our mission is to help you unlock the full potential of AI.
    </p>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        Whether you're aiming to <span className="text-primary font-semibold">boost creativity</span>, improve productivity, or spark innovation, we’re here to provide you with the tools and knowledge you need to succeed.
    </p>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        <span className="font-bold">A key focus of ours is empowering you to elevate your website’s 
            <span className="font-semibold text-primary"> SEO efforts</span>. 
            We offer AI-driven strategies tailored for your needs.
        </span>
    </p>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        If you're a <span className="font-semibold">business owner</span>, <span className="font-semibold">content creator</span>, or <span className="font-semibold">digital marketer</span>, our practical insights can help you optimize your online presence. Our goal is to make cutting-edge AI technology accessible to everyone.
    </p>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        We provide actionable tools that simplify complex processes, such as <span className="font-semibold text-primary">SEO</span>, so you can achieve better results with ease.
    </p>
</div>


<div className="mb-6">
    <h2 className="font-bold mb-4 text-xl sm:text-2xl lg:text-3xl text-gray-800 dark:text-white leading-tight transition-all duration-300 ease-in-out transform hover:scale-[1.03]">
        Why Choose Us?
    </h2>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        Our content focuses on quality, research, and up-to-date information. It is crafted to guide you through the complexities of artificial intelligence without overwhelming you with jargon.
        <br /><br />
        <Link className="text-primary underline hover:no-underline font-bold" href="/">Doitwithai.tools</Link> stands out as your one-stop shop for everything AI because we offer
    </p>

    <ul className="list-disc list-inside my-4">
        <li className="text-lg text-gray-700 dark:text-gray-300 mb-2">
            <Link className="text-primary underline hover:no-underline font-bold" href="/">Best AI Tools</Link> We provide a curated selection of the best AI tools across various categories, from productivity and coding to content creation and marketing.
        </li>
        <li className="text-lg text-gray-700 dark:text-gray-300 mb-2">
            <Link className="text-primary underline hover:no-underline font-bold" href="/">Free Resources & Learning</Link> Dive deeper with our extensive library of free AI resources and expert-led tutorials.
        </li>
        <li className="text-lg text-gray-700 dark:text-gray-300 mb-2">
            <Link className="text-primary underline hover:no-underline font-bold" href="/">Future-Proof Focus</Link> We keep you updated on the latest AI news & trends, ensuring you stay ahead of the curve and leverage the most innovative solutions.
        </li>
        <li className="text-lg text-gray-700 dark:text-gray-300 mb-2">
            <Link className="text-primary underline hover:no-underline font-bold" href="/">Actionable Insights</Link> Go beyond theoretical knowledge with our practical guides on using AI for specific tasks, like earning income or optimizing code.
        </li>
        <li className="text-lg text-gray-700 dark:text-gray-300 mb-2">
            <Link className="text-primary underline hover:no-underline font-bold" href="/">Community & Support</Link> Become part of a thriving community where you can learn from others and share your own experiences with AI.
        </li>
        <li className="text-lg text-gray-700 dark:text-gray-300 mb-2">
            <Link className="text-primary underline hover:no-underline font-bold" href="/">Focus on User Experience</Link> We prioritize clear, concise, and user-friendly content, making it easy for everyone to navigate the world of AI.
        </li>
    </ul>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        Doitwithai.tools is your trusted partner in your AI journey. We empower you to unlock the potential of AI and achieve your goals – all in one place!
    </p>
</div>

<div className="mb-6">
    <h2 className="font-bold mb-4 text-xl sm:text-2xl lg:text-3xl text-gray-800 dark:text-white leading-tight transition-all duration-300 ease-in-out transform hover:scale-[1.03]">
        Join Our Community
    </h2>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        We invite you to join our growing community of AI enthusiasts, professionals, and learners.
    </p>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        Connect with us on social media, join our blog discussions, and become part of the AI revolution.
    </p>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        Together, we can shape the future of AI and innovation.
    </p>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-semibold leading-relaxed text-primary dark:text-primary">
        Your journey with AI starts here!
    </p>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        Start your AI adventure with 
        <Link className="text-lg font-bold text-primary underline hover:no-underline transition-all duration-300 ease-in-out transform hover:scale-105" href="/"> Doitwithai.tools </Link>
        today and transform your approach to work and creativity with cutting-edge AI tools and knowledge.
    </p>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        Welcome to your future, powered by AI.
    </p>
</div>

<div className="mb-6">
    <h2 className="font-bold mb-4 text-xl sm:text-2xl lg:text-3xl text-gray-800 dark:text-white leading-tight transition-all duration-300 ease-in-out transform hover:scale-[1.03]">
        Collaboration with AI Assistants
    </h2>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        Building this website has been a collaborative effort with AI tools like <span className="font-semibold text-primary">ChatGPT</span> and <span className="font-semibold text-primary">Bard</span>.
    </p>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        These AI assistants have provided invaluable support, insights, and inspiration. They played a crucial role throughout the process of designing and implementing this platform.
    </p>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-bold leading-relaxed text-primary">
        With AI on our side, the possibilities are endless!
    </p>
</div>


<div>
    <h2 className="font-bold mb-4 text-xl sm:text-2xl lg:text-3xl text-gray-800 dark:text-white leading-tight transition-all duration-300 ease-in-out transform hover:scale-[1.03]">
        Closing Remarks
    </h2>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        Thank you for visiting <span className="font-semibold text-primary">DoItWithAI.Tools</span>!
    </p>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
        I hope the insights, tools, and resources shared here inspire and empower you on your journey into the exciting world of artificial intelligence. 
    </p>

    <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-bold leading-relaxed text-primary">
        Let’s work together to unlock the full potential of AI!
    </p>
</div>

            </div>
          
        </div>
      {/* <Breadcrumb
        pageName="About Page"
        pageName2=""
        linktext=""
        link=""
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. In varius eros eget sapien consectetur ultrices. Ut quis dapibus libero."
        firstlinktext="Home"
        firstlink="/"
      />
      <AboutSectionOne />
      <AboutSectionTwo /> */}
    </>
  );
};

export default AboutPage;