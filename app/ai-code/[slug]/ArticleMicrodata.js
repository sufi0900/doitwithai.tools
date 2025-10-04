// components/ArticleMicrodata.jsx
import { urlForImage } from "@/sanity/lib/image"; // Adjust path as needed

/**
 * Renders common microdata properties for articles.
 * @param {object} props - Component props.
 * @param {object} props.data - The article data.
 */
export default function ArticleMicrodata({ data }) {
  const imageUrl = data?.mainImage ? urlForImage(data.mainImage).url() : null;

  if (!data) return null; // Don't render microdata if no data

  return (
    <>
      <meta itemProp="headline" content={data.metatitle || ''} />
      <meta itemProp="description" content={data.metadesc || ''} />
      <meta itemProp="datePublished" content={data.publishedAt || ''} />
      <meta itemProp="dateModified" content={data._updatedAt || data.publishedAt || ''} />
      <div itemProp="author" itemScope itemType="https://schema.org/Person">
        <meta itemProp="name" content="Sufian Mustafa" />
      </div>
      <div itemProp="publisher" itemScope itemType="https://schema.org/Organization">
        <meta itemProp="name" content="DoItWithAI.tools" />
        <meta itemProp="url" content="https://www.doitwithai.tools" />
      </div>
      {imageUrl && (
        <div itemProp="image" itemScope itemType="https://schema.org/ImageObject">
          <meta itemProp="url" content={imageUrl} />
          <meta itemProp="width" content="1200" />
          <meta itemProp="height" content="630" />
        </div>
      )}
    </>
  );
}