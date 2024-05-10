import Image from 'next/image';
import React from 'react';

const AuthorPage = () => {
    return (
        <div className="container mt-8 flex flex-col md:flex-row">
            <div className="md:w-1/2">
                <h1 className="mb-6 text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">About Me</h1>
                <div className="mb-6">
                    <h2 className='font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight'>I am, SuFiaN MusTaFa</h2>
                    <p className='mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl'>Full Stack Web Developer</p>
                    <p className='mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl'>Hello! I&apos;m Sufian Mustafa, a dedicated web developer based in Pakistan. At 27 years old, I have over two years of experience in creating intuitive and user-friendly websites, specializing in modern web technologies.</p>
                    {/* <p className='mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl'>I craft stunning static websites, but that&apos;s just the beginning 😉My superpower? Transforming them into dynamic marvels 😍 with CMS magic (Node.js, Sanity, Prisma). Think interactive, engaging, and SEO-friendly 🤝</p> */}
                </div>
                <div className="mb-6">
                    <h2 className='font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight'>Technical Expertise</h2>
                    <p className='mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl'>My technical arsenal includes HTML, CSS, JavaScript, and advanced frameworks like ReactJS and NextJS. I have a keen expertise in the MERN stack (MongoDB, Express.js, React, and Node.js) and utilize design frameworks such as Material-UI (MUI) and Tailwind CSS to bring aesthetic and functional elements to the projects I handle.</p>
                </div>
         
            </div>
            <div className="md:w-1/2 md:ml-6 overflow-hidden cursor-pointer">
                <figure className="w-full">
                    <a href='/sufi.jpeg'>
                        <div className='overflow-hidden transition-transform duration-200 ease-in-out hover:rounded-lg'>              
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
