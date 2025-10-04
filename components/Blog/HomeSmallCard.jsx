import Link from "next/link";
import { AccessTime, CalendarMonthOutlined } from "@mui/icons-material";
import Image from "next/image";

export default function HomeSmallCard({
  publishedAt,
  mainImage,
  title,
  overview,
  ReadTime,
  slug,
  tags,
}) {
  return (
    <section>
      <Link
        href={slug}
        className="group lg:h-[156px] transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-xl hover:shadow-blue-500/10
                   flex flex-col sm:flex-row items-center bg-white border border-gray-200 rounded-xl shadow-md
                   hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-750
                   relative overflow-hidden cursor-pointer w-full"
      >
        {/* Subtle Background Gradient on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/30 group-hover:to-purple-50/30 dark:group-hover:from-blue-900/10 dark:group-hover:to-purple-900/10 transition-all duration-300 pointer-events-none" />

        {/* Hover Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />

        {/* Image Container */}
        <div className="relative overflow-hidden flex-shrink-0 z-10 w-full sm:w-32 md:w-40 lg:w-[198px] h-40 sm:h-full rounded-t-xl sm:rounded-l-xl sm:rounded-t-none">
          <div className="w-full h-full transition-all duration-300 ease-out group-hover:scale-110 relative">
            <Image
              src={mainImage}
              alt={title}
              fill={true}
              quality={80}
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 250px, 300px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        <div className="flex flex-col justify-between p-4 leading-normal flex-1 relative z-10 w-full">
          {/* Title */}
          <div className="mb-2">
            <h5 className="line-clamp-2 text-base font-semibold text-start text-gray-900 dark:text-white sm:leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              {title}
            </h5>
          </div>

          {/* Overview */}
          <div className="flex-1 mb-2">
            <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
              {overview}
            </p>
          </div>

          {/* Meta Information */}
          <div className="mt-auto">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50 transition-colors duration-300">
                    <CalendarMonthOutlined className="text-blue-600 dark:text-blue-400" sx={{ fontSize: 10 }} />
                  </div>
                  <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{publishedAt}</p>
                </div>

                <div className="hidden sm:block w-px h-3 bg-gray-300 dark:bg-gray-600" />

                <div className="flex items-center gap-1">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-50 dark:bg-green-900/30 group-hover:bg-green-100 dark:group-hover:bg-green-800/50 transition-colors duration-300">
                    <AccessTime className="text-green-600 dark:text-green-400" sx={{ fontSize: 10 }} />
                  </div>
                  <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{ReadTime} min</p>
                </div>
              </div>

              {/* Read indicator */}
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] font-medium">Read</span>
                <svg
                  className="w-2.5 h-2.5 transform group-hover:translate-x-0.5 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Corner Accent */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300" />

        {/* Hover Border */}
        <div className="absolute inset-0 rounded-xl border-2 border-blue-500/0 group-hover:border-blue-500/20 transition-all duration-300 pointer-events-none" />
      </Link>
    </section>
  );
}
