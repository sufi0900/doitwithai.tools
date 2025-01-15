/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import React from "react";

const AuthorPage = () => {
    return (
      <div className="container mx-auto mt-8 mb-4 px-4">
      <div className="flex flex-col space-y-8 md:flex-row md:space-x-8 md:space-y-0">
        <div className="flex-1 space-y-8">
          <h1 className="relative mb-8 text-3xl font-bold tracking-wide text-black transition-colors duration-300 after:absolute after:-bottom-2 after:left-0 after:h-1 after:w-24 after:bg-blue-600 dark:text-white md:text-4xl lg:text-5xl">
            About Me
          </h1>
    
          <section className="transform space-y-4 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-black dark:text-white">
              I am, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SuFiaN MusTaFa</span>
            </h2>
            <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
              AI-Assisted Web Creator and Content Creator
            </p>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Hello! I'm Sufian Mustafa, a passionate creator based in Pakistan with a unique approach to web development. At 27 years old, I have over two years of experience exploring and practicing the basics of modern web technologies. I combine these technologies with the power of AI tools like ChatGPT. This allows me to create advanced, dynamic websites.
            </p>
          </section>
    
          <section className="transform space-y-4 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Technical Expertise
            </h2>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              My journey started with learning the fundamentals of web technologies. These include <span className="font-semibold text-blue-600 dark:text-blue-400">HTML, CSS, JavaScript, ReactJS, and NextJS</span>. While I am not an expert in writing complex or logic-intensive code, I have developed the ability to integrate basic concepts with AI tools. Through prompt engineering and iterative problem-solving, I have successfully built dynamic interfaces. I have also created full-stack web applications, including the very website you are exploring.
            </p>
          </section>
    
          <section class="transform space-y-4 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
  <h2 class="text-2xl font-bold text-black dark:text-white mb-4">AI as My Creative Partner</h2>
  <p class="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
    My deep interest in AI stems from its ability to <span class="font-semibold text-blue-600 dark:text-blue-400">amplify creativity</span> and <span class="font-semibold text-blue-600 dark:text-blue-400">solve challenges</span>. <span class="font-bold text-blue-600 dark:text-blue-400">ChatGPT</span>, in particular, has been instrumental in helping me overcome coding roadblocks. It has also aided me in designing advanced user interfaces and exploring innovative ideas that would have been improbable on my own.
  </p>
  <p class="text-lg leading-relaxed text-gray-600 dark:text-gray-300 mt-4">
    This hands-on collaboration has deepened my understanding of <span class="font-semibold text-blue-600 dark:text-blue-400">prompt engineering</span>. It has enabled me to harness AI's potential in unique ways, including crafting effective prompts. This has become a skill that I now actively use in various areas, such as <span class="font-semibold text-blue-600 dark:text-blue-400">web development</span> and <span class="font-semibold text-blue-600 dark:text-blue-400">content creation</span>.
  </p>
</section>


    
          <section className="transform space-y-4 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Experience with Headless CMS
            </h2>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              I've also explored the world of headless CMS platforms, particularly <span className="font-semibold text-blue-600 dark:text-blue-400">Sanity.io</span>, to build scalable and manageable web architectures. The website you are currently visiting is a testament to this approach. It was created with the help of Next.js and Sanity.io, alongside AI support.
            </p>
          </section>
    
          <section className="transform space-y-4 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Passion for AI Tools
            </h2>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Beyond my role as a web creator and designer, I am also the author and curator of the content here at <span className="font-semibold text-blue-600 dark:text-blue-400">DoItWithAI.Tools</span>. My passion for artificial intelligence (AI) tools drives the focus of this website. 
            </p>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              My journey into AI began in 2023 when I first interacted with platforms like ChatGPT. These tools opened up new avenues for solving challenges in web development. They often accelerated solutions that would have taken weeks to uncover manually. 
            </p>
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                With the introduction of sophisticated AI applications like Bard, I expanded my expertise into SEO, blogging, and digital marketing. The surge in AI-powered tools, such as various image generators, further fueled my enthusiasm.
              </p>
            </div>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              I have spent countless hours experimenting and researching how to effectively leverage these tools. This includes optimizing content, generating creative ideas, and staying ahead of digital trends through extensive research, video tutorials, and reading articles. My dedication to finding impactful solutions is the driving force behind this platform.
            </p>
          </section>
    
          <section className="transform space-y-4 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Collaboration with AI Assistants
            </h2>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              This website, like many of my projects, is the result of a unique collaboration between human creativity and AI innovation. ChatGPT and Bard have served as my trusted assistants throughout this journey. They have offered guidance, suggestions, and creative solutions.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                  ChatGPT has helped me tackle coding challenges, enabling me to create advanced features and resolve issues efficiently.
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                  Meanwhile, Bard has been an invaluable resource for learning SEO and content creation.
                </p>
              </div>
            </div>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              By combining my foundational knowledge, AI-driven problem-solving, and hands-on experimentation, I have built something that showcases the power of modern technology.
            </p>
          </section>
    
          <section className="transform space-y-4  rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Closing Remarks
            </h2>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Thank you for visiting <span className="font-semibold text-blue-600 dark:text-blue-400">DoItWithAI.Tools</span>! My goal is to share insights, tools, and inspiration to help you navigate the exciting world of AI. I hope you find the resources shared here both useful and inspiring as you explore this transformative journey. Let's learn and grow together!
            </p>
          </section>
        </div>
    
        <div className="md:w-1/2">
          <div className="sticky ">
            <figure className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
              <a href="/sufi.jpeg" className="block">
                <div className="overflow-hidden">
           <Image src="/sufi.jpeg" alt="author-sufian-mustafa" quality={100} width={500} height={500} className="transition-transform duration-200 ease-in-out  hover:scale-[1.5] card4 w-full rounded-lg shadow-lg " />
                </div>
              </a>
              <figcaption className="bg-white p-4 text-center text-sm font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                Sufian Mustafa
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>

    );

};

export default AuthorPage;
