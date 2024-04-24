/* eslint-disable react/no-unescaped-entities */
import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Grid,
  Typography,
  Button,
  IconButton,
  CardMedia,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";
import Avatar from "@mui/material/Avatar"; // Add this import statement
import Breadcrumb from "@/components/Common/Breadcrumb";
import { urlForImage } from "@/sanity/lib/image"; // Update path if needed

import Link from "next/link";
import { CalendarMonth, Email, Person } from "@mui/icons-material";

const FeaturePost = ({ posts }) => {
  const firstPost = posts.length > 0 ? posts[0] : null;

  return (
    <div>
      {/* <Breadcrumb
        pageName="Blog Grid"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. In varius eros eget sapien consectetur ultrices. Ut quis dapibus libero."
      /> */}
      <section className="container mx-auto px-4 py-8  ">
        <h1 className="mb-6 text-3xl font-bold tracking-wide text-black dark:text-white sm:text-4xl">
          <span className="group inline-block cursor-pointer">
            <span className="relative mr-2 inline-block">
              Feature
              <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </span>
            <span className="relative text-blue-500">
              Post
              <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
            </span>
          </span>
        </h1>

        {firstPost && (
          <Card
            key={firstPost._id}
            className="card  items-center  rounded-lg         border border-gray-200 bg-white text-black shadow hover:bg-gray-100  dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700
            " // Adjust background and text color based on theme
            sx={{
              marginTop: "5px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: "100%", // Ensure fixed width for all cards
            }}
          >
            <Grid container className="flex">
              <Grid item xs={12} sm={12} lg={4} sx={{ alignItems: "stretch" }}>
                <div className="flex2">
                  <CardMedia
                    component="img"
                    src={urlForImage(firstPost.mainImage).url()}
                    alt="Blog thumbnail"
                    sx={{ width: "100%", height: "300px", objectFit: "cover" }}
                  />
                </div>
              </Grid>

              {/* Content Section */}
              <Grid
                item
                sm={12}
                xs={12}
                lg={8}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                {/* Person Avatar with Name and Date */}

                {/* Content */}
                <CardContent sx={{ flexGrow: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <Avatar src="avatar img here" />{" "}
                    {/* Add avatar image source */}
                    <div style={{ marginLeft: "10px" }}>
                      <Typography variant="subtitle1">John Doe</Typography>{" "}
                      {/* Replace with author's name */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        className="bg-white text-black dark:bg-gray-800 dark:text-white"
                      >
                        March 19, 2024
                      </Typography>{" "}
                      {/* Replace with date */}
                    </div>
                  </div>
                  <h1 className="mb-2 mt-4 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight">
                    {/* {firstPost.title} */}
                    {`${firstPost.title.split(" ").slice(0, 10).join(" ")}${
                      firstPost.title.split(" ").length > 10 ? " ..." : ""
                    }`}
                  </h1>
                  <p className="text-base font-medium text-dark dark:text-white sm:text-lg lg:text-base xl:text-lg">
                    {`${firstPost.overview.split(" ").slice(0, 30).join(" ")}${
                      firstPost.overview.split(" ").length > 30 ? " ..." : ""
                    }`}
                    {/* {firstPost.overview} */}
                  </p>
                  {/* Tags */}
                </CardContent>

                {/* Actions */}
                <CardActions
                  sx={{
                    padding: "5px",
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "auto",
                  }}
                >
                  <List className="mr-2">
                    <ListItem>
                      <div className="mb-4 flex gap-2">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800 transition duration-300 hover:bg-blue-200 hover:text-blue-900 dark:bg-blue-200 dark:text-blue-900 dark:hover:bg-blue-300 dark:hover:text-blue-800">
                          New
                        </span>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 transition duration-300 hover:bg-green-200 hover:text-green-900 dark:bg-green-200 dark:text-green-900 dark:hover:bg-green-300 dark:hover:text-green-800">
                          Featured
                        </span>
                        <span className="dark:bg-yellow-200 dark:text-yellow-900  hover:bg-yellow-200 hover:text-yellow-900 dark:hover:bg-yellow-300 dark:hover:text-yellow-800 rounded-full bg-slate-600 px-3  py-1 text-sm font-semibold text-yellow transition duration-300">
                          Popular
                        </span>
                      </div>
                    </ListItem>
                  </List>
                </CardActions>
              </Grid>
            </Grid>
          </Card>
        )}
      </section>
    </div>
  );
};

export default FeaturePost;
