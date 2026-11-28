import Image from "next/image";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
export function HomepageJournal({document,publicBasePath,onOpenPost}:{document:SiteDocument;publicBasePath?:string;onOpenPost?:(id:string)=>void}){
 const posts=document.publishing.posts.filter(p=>!publicBasePath||p.status==="published").slice(0,3);
 if(!posts.length)return null;
 return <section className="homepage-journal" id="blog"><header><span>JOURNAL</span><h2>Latest articles</h2>{publicBasePath?<a href={`${publicBasePath}/blog`}>View all articles →</a>:<button type="button" onClick={()=>onOpenPost?.("__index__")}>View Blog listing →</button>}</header><div className="homepage-journal-grid">{posts.map(post=>{const asset=document.media.assets.find(a=>a.id===post.coverMediaId);return <article key={post.id}>{asset&&<div className="homepage-journal-cover"><Image src={asset.url} alt={asset.alt} fill sizes="(max-width:700px) 90vw, 400px" unoptimized/></div>}<div>{!publicBasePath&&<small>{post.status} · preview</small>}<h3>{post.title}</h3><p>{post.excerpt||post.seoDescription}</p>{publicBasePath?<a href={`${publicBasePath}/blog/${post.slug}`}>Read article →</a>:<button type="button" onClick={()=>onOpenPost?.(post.id)}>Read article →</button>}</div></article>;})}</div></section>;
}
