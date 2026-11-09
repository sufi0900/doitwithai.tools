import Link from "next/link";
import Image from "next/image";

const RelatedPost = ({ title, image, slug, date }) => {
  return (
    <div className="flex items-center lg:block xl:flex">
      <div className="mr-5 lg:mb-3 xl:mb-0">
        <div className="relative h-[60px] w-[70px] overflow-hidden rounded-md sm:h-[75px] sm:w-[85px]">
          <Image src={image || "/images/blog/blog-01.jpg"} alt={title || "Related article"} layout="fill" objectFit="cover" unoptimized />
        </div>
      </div>
      <div>
        <p className="m-0">
          <Link
            href={slug}
            className="text-base font-medium leading-snug text-black hover:text-primary dark:text-white dark:hover:text-primary"
          >
            {title}
          </Link>
        </p>
        <p className="text-xs font-medium text-body-color">{date}</p>
      </div>
    </div>
  );
};

export default RelatedPost;
