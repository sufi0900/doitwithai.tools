import Image from "next/image";
import Link from "next/link";


export default function SingleBlog({
  publishedAt,
  image = "/path-to-placeholder-image.jpg", // Fallback for missing image
  title,
  overview,
  date = "Unknown Date", // Fallback for missing date
  slug = "#", // Fallback for missing slug
}) {
  return (
    <div className="flex items-center lg:block xl:flex">
      <Link href={slug}>
        <div className="mr-5 lg:mb-3 xl:mb-0">
          <div className="relative h-[60px] w-[70px] overflow-hidden rounded-md sm:h-[75px] sm:w-[85px]">
            <Image src={image} alt={title || "No Title"} fill />
          </div>
        </div>
      </Link>
      <div className="w-full">
        <h5>
          <Link
            href={slug}
            className="mb-[6px] block text-base font-medium leading-snug text-black hover:text-primary dark:text-white dark:hover:text-primary"
          >
            {title || "Untitled"}
          </Link>
        </h5>
        <p className="text-xs font-medium text-body-color">{date}</p>
      </div>
    </div>
  );
};


