import React from "react";
import { urlForImage } from "../../sanity/lib/image"; // Update path if needed

const FeaturePost = ({ posts }) => {
  return (
    <div>
      {posts.map((post) => (
        <div key={post._id}>
          <h1>{post.title}</h1>
          <img src={urlForImage(post.mainImage).url()} alt={post.title} />
          {/* Add more details as needed */}
        </div>
      ))}
    </div>
  );
};

export default FeaturePost;
