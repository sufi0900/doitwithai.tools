import {
  Card,
  CardContent,
  Grid,
  CardMedia,
} from "@mui/material";
import Box from "@mui/material/Box";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import Link from "next/link";
import React from "react";
import BlogCardImageOptimizer from "./ImageOptimizer";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function FeaturePost({
  date,
  mainImage,
  title,
  overview,
  slug,
  readTime,
  tags,
}) {
  return (
    <Card
      className="mb-4 cursor-pointer rounded-lg border border-gray-200 bg-white text-black shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100%",
        width: "100%",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "scale(1.03)",
        },
        overflow: "hidden",
      }}
    >
      <Grid container sx={{ display: "flex", flexWrap: "wrap" }}>
        {/* Image Section */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
            <CardMedia
              component="div"
              sx={{
                position: "relative",
                width: "100%",
                overflow: "hidden",
                height: { xs: 250, md: "100%" },
              }}
            >
              <div                 className="w-full h-full object-cover transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.2]"
>
              <BlogCardImageOptimizer
                src={mainImage}
                alt={title}
                width={1000}
                height={1000}
              />
              </div>
            </CardMedia>

            {tags && tags.length > 0 && (
              <Link
                href={tags[0].link}
                className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold capitalize text-white transition duration-300 hover:bg-stone-50 hover:text-primary"
              >
                <LocalOfferIcon style={{ fontSize: "14px" }} /> {tags[0].name}
              </Link>
            )}
          </Box>
        </Grid>

        {/* Content Section */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 2,
          }}
        >
          <CardContent>
            <h1 className="mb-2 line-clamp-2 text-xl font-bold leading-tight text-black dark:text-white sm:text-xl">
              {title}
            </h1>
            <p className="line-clamp-3 text-base text-gray-800 dark:text-gray-400">
              {overview}
            </p>

            <div className="my-4 flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <EventNoteIcon className="text-body-color" /> {date}
              </div>
              <div className="flex items-center gap-1">
                <AccessTimeIcon className="text-body-color" /> Read Time: {readTime} min
              </div>
            </div>

            <Link
              href={slug}
              className="mt-4 inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Read more
              <svg
                className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </Link>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
}