/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import React from "react";

const AuthorPage = () => {
    return (
        <div className="container mt-8 flex flex-col md:flex-row">
            <div className="md:w-1/2">
                <h1 className="mb-6 text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">About Me</h1>
                <div className="mb-6">
                    <h2 className="font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight">I am, SuFiaN MusTaFa</h2>
                    <p className="mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl">Full Stack Web Developer</p>
                    <p className="mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl">Hello! I"m Sufian Mustafa, a dedicated web developer based in Pakistan. At 27 years old, I have over two years of experience in creating intuitive and user-friendly websites, specializing in modern web technologies.</p>
                </div>
                <div className="mb-6">
                    <h2 className="font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight">Technical Expertise</h2>
                    <p className="mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl">My technical arsenal includes HTML, CSS, JavaScript, and advanced frameworks like ReactJS and NextJS. I have a keen expertise in the MERN stack (MongoDB, Express.js, React, and Node.js) and utilize design frameworks such as Material-UI (MUI) and Tailwind CSS to bring aesthetic and functional elements to the projects I handle.</p>
                </div>
                <div className="mb-6">
                    <h2 className="font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight">Experience with Headless CMS</h2>
                    <p className="mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl">In addition to my development skills, I am deeply involved in integrating headless CMS technologies, particularly Sanity.io, to enhance website management and scalability. This website, which you are browsing right now, was designed and developed by me from the ground up using Next.js coupled with Sanity.io. This setup demonstrates my capacity to build and manage complex web architectures.</p>
                </div>
                <div className="mb-6">
                    <h2 className="font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight">Passion for AI Tools</h2>
                    <p className="mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl">Beyond my role as a web developer and designer, I am also the author and curator of content here. My passion for artificial intelligence (AI) tools drives this website"s focus. My journey into the world of AI began back in 2023 when I first interacted with AI through platforms like ChatGPT. This interaction opened up new avenues for overcoming challenges in web development, often speeding up solutions that would otherwise have taken weeks.</p>
                </div>
                <div className="mb-6">
                    <h2 className="font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight">Exploration of AI Applications</h2>
                    <p className="mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl">With the introduction of sophisticated AI applications like Bard, I have expanded my expertise into SEO, blogging, and digital marketing. The surge in AI-powered tools, such as various AI image generators, has further fueled my enthusiasm. Through extensive research, exploring video tutorials, reading articles, and personal experimentation, I have gained substantial insights into AI technologies.</p>
                </div>
                <div>
                    <h2 className="font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight">Collaboration with AI Assistants</h2>
                    <p className="mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl">Building this website was a collaborative effort with AI assistants like ChatGPT and Bard. These tools have been invaluable partners, providing me with the necessary support to conceptualize and execute this digital platform.</p>
                </div>
                <div>
                    <h2 className="font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight">Closing Remarks</h2>
                    <p className="mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl">Thank you for visiting! I hope you find the insights and tools shared here both useful and inspiring as you navigate the exciting world of AI.</p>
                </div>
            </div>
            <div className="md:w-1/2 md:ml-6 overflow-hidden cursor-pointer">
          
            <figure className="w-full">
            <a href="/sufi.jpeg">
<div className="overflow-hidden transition-transform duration-200 ease-in-out hover:rounded-lg">              
  <Image src="/sufi.jpeg" alt="author-sufian-mustafa" quality={100} width={500} height={500} className="transition-transform duration-200 ease-in-out  hover:scale-[1.5] card4 w-full rounded-lg shadow-lg " />
</div>
</a>        
 <figcaption class="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">Sufian Mustafa</figcaption>

                </figure>
            </div>
        </div>
    );
};

export default AuthorPage;
