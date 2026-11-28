import React from "react";
import Image from "next/image";
import type { RichNode } from "@/features/website-builder/domain/rich-document";
import { safeLink } from "@/features/website-builder/domain/rich-document";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
export function RichDocumentView({node,document}:{node:RichNode;document:SiteDocument}) {
 const children=node.content?.map((child,i)=><RichDocumentView key={i} node={child} document={document}/>);
 if(node.type==="text"){
   let result:React.ReactNode=node.text;
   for(const mark of node.marks??[]){
     if(mark.type==="link"){const href=safeLink(mark.attrs?.href);if(href) result=<a href={href} rel="noopener noreferrer">{result}</a>;}
     else {const tag=({bold:"strong",italic:"em",underline:"u",strike:"s",code:"code"} as const)[mark.type as "bold"];if(tag) result=React.createElement(tag,null,result);}
   } return <>{result}</>;
 }
 if(node.type==="image") {const asset=document.media.assets.find(a=>a.id===node.attrs?.mediaId || a.url===node.attrs?.src);return asset?<figure><Image src={asset.url} alt={node.attrs?.alt??asset.alt} width={1200} height={800} unoptimized style={{width:"100%",height:"auto"}}/><figcaption>{node.attrs?.alt??asset.alt}</figcaption></figure>:null;}
 if(node.type==="hardBreak")return <br/>;
 if(node.type==="codeBlock")return <pre><code>{children}</code></pre>;
 if(node.type==="heading")return React.createElement(`h${Math.min(6,Math.max(2,node.attrs?.level??2))}`,null,children);
 const tag=({paragraph:"p",bulletList:"ul",orderedList:"ol",listItem:"li",blockquote:"blockquote"} as const)[node.type as "paragraph"];
 return tag?React.createElement(tag,null,children):<>{children}</>;
}
