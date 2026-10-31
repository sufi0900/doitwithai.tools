export const FeaturedPosts = {
  name: "FeaturedPosts",
  title: "Featured",
  type: "document",
  fields: [
    {
      name: "mostSellingProducts",
      title: "Most Selling Products",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "aiimagegen" }],
        },
      ],
    },
    {
      name: "bestDeals",
      title: "Best Deals",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "aiimagegen" }],
        },
      ],
    },
    {
      name: "trendingProducts",
      title: "Trending Products",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "aiimagegen" }],
        },
      ],
    },
  ],
};
