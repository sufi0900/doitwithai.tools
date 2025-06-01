
import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import {
  Card,
  CardContent,
  Grid,
  CardMedia,

} from "@mui/material";


import Link from "next/link";
import React, { useEffect, useState } from "react";


import EventNoteIcon from "@mui/icons-material/EventNote"; // Import MUI icon for date
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const FeaturePost = () => {
  const [aiToolTrendBigData, setAiToolTrendBigData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const seoEnabledBlogsQuery = `*[_type == "aitool" && isSeoPageEnabled == true]`;  // Query only enabled blogs
  
      const seoEnabledBlogs = await client.fetch(seoEnabledBlogsQuery);
  
      setAiToolTrendBigData(seoEnabledBlogs);
    };
  
    fetchData();
  }, []);
  
  return (
    <div>
 {aiToolTrendBigData.slice(0, 2).map((post) => (
  <Card        
    key={post._id}
    className="card cursor-pointer mb-8 items-center rounded-lg border border-gray-200 bg-white text-black shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
    sx={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
    }}
  >
    <Grid container className="flex">
      <Grid
        item
        xs={12}
        sm={12}
        lg={4}
        sx={{ alignItems: "stretch" }}
      >
        <Card className="flex2 card cursor-pointer rounded-lg bg-white text-black shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
          <CardMedia
            component="img"
            src={urlForImage(post.mainImage).url()}
            alt="Blog thumbnail"
            sx={{
              width: "100%",
              height: "340px", // Adjust height
            }}
          />
        </Card>
      </Grid>
      <Grid
        item
        xs={12}
        sm={12}
        lg={8}
        sx={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "16px" }}
      >
        <CardContent>
          <Link href={`/blog/${post.slug.current}`} passHref>
            <h3 className="font-medium text-lg">{post.title}</h3>
            <p>{post.overview}</p>
          </Link>
          <div className="flex mt-2 items-center text-sm text-gray-600">
            <AccessTimeIcon sx={{ fontSize: "18px" }} />
            <span className="ml-1">{post.readTime?.minutes} min read</span>
          </div>
        </CardContent>
      </Grid>
    </Grid>
  </Card>
))}


    </div>
  )
}

export default FeaturePost