import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Breadcrumb from "@/components/Common/Breadcrumb";

const AboutPage = () => {
  return (
    <>
     <div className="container mt-8 flex flex-col md:flex-row">
            <div className="">
                <h1 className="mb-6 text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">About Us</h1>
                <div className="mb-6">
                    <h2 className='font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight'>Welcome to</h2>
                    <p className='mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl'>AI Tool Trend</p>
                    <p className='mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl'>the premier destination for professionals seeking to harness the power of Artificial Intelligence (AI) to enhance their productivity, creativity, and digital strategy. Our mission is simple: to provide you with insightful content, powerful tools, and actionable resources to propel your work and personal projects to the forefront of innovation.</p>
                    {/* <p className='mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl'>I craft stunning static websites, but that's just the beginning 😉My superpower? Transforming them into dynamic marvels 😍 with CMS magic (Node.js, Sanity, Prisma). Think interactive, engaging, and SEO-friendly 🤝</p> */}
                </div>
                <div className="mb-6">
                    <h2 className='font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight'>Who We Are
</h2>
                    <p className='mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl'>
                    I am the sole author and creator behind AiToolTrend. Handling every aspect of the website from development to content creation, I am committed to bridging the gap between complex AI capabilities and everyday professional needs. As a passionate web developer and AI enthusiast, my mission is to empower you with tools and insights that enhance productivity and creativity through innovative AI applications.                      </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
  <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">Our website is divided into several core areas, each tailored to different aspects of AI integration and application:</h2>
  <ul className="list-disc list-inside">
    <li className="text-lg text-gray-700 dark:text-gray-300 mb-2">Best AI Tools: Discover state-of-the-art tools that bring efficiency and creativity to your projects.</li>
    <li className="text-lg text-gray-700 dark:text-gray-300 mb-2">Free AI Resources & Solutions: Tap into an extensive collection of free AI-generated assets and solutions.</li>
    <li className="text-lg text-gray-700 dark:text-gray-300 mb-2">Code With AI: Learn how AI can assist in coding processes, from simple scripts to complex applications.</li>
    <li className="text-lg text-gray-700 dark:text-gray-300 mb-2">AI in SEO & Digital Marketing: Employ AI-driven strategies to boost your online presence and marketing efforts.</li>
    <li className="text-lg text-gray-700 dark:text-gray-300 mb-2">AI News & Trends: Stay updated with the latest advances and how they can be applied in various sectors.</li>
    <li className="text-lg text-gray-700 dark:text-gray-300 mb-2">Make Money With AI: Utilize AI to unlock new revenue streams in the digital landscape.</li>
  </ul>
</div>

                <div className="mb-6">
                    <h2 className='font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight'>Our Vision</h2>
                    <p className='mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl'>
                    At [Your Website Name], we believe that AI can transform not just how tasks are performed but how they are conceived. We envision a world where every professional has access to AI tools that not only simplify workflows but also open doors to new possibilities and innovations.                      </p>
                </div>
                <div className="mb-6">
                    <h2 className='font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight'>Why Choose Us?
</h2>
                    <p className='mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl'>
                    With a focus on quality, research, and the most up-to-date information, our content is crafted to guide you through the complexities of artificial intelligence without overwhelming you with jargon. Whether you're a developer looking to streamline your process, a marketer aiming for the top ranks, or a hobbyist experimenting with AI, our platform is your go-to resource.                      </p>
                </div>
                <div className="mb-6">
                    <h2 className='font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight'>Join Our Community
</h2>
                    <p className='mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl'>
                    Connect with us, share insights, and take part in shaping the future of AI in the professional sphere. Whether through our blog posts, community forums, or direct interactions, your journey towards mastering AI starts here.

Embark on your AI journey with [Your Website Name] today and transform your approach to work and creativity with cutting-edge AI tools and knowledge. Welcome to your future, powered by AI.                      </p>
                </div>
                <div>
                    <h2 className='font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight'>Collaboration with AI Assistants</h2>
                    <p className='mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl'>Building this website was a collaborative effort with AI assistants like ChatGPT and Bard. These tools have been invaluable partners, providing me with the necessary support to conceptualize and execute this digital platform.</p>
                </div>
                <div>
                    <h2 className='font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight'>Closing Remarks</h2>
                    <p className='mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl'>Thank you for visiting! I hope you find the insights and tools shared here both useful and inspiring as you navigate the exciting world of AI.</p>
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
