import type { SiteDocument } from './site-document';
import type { RichNode } from './rich-document';
export function inlineNodes(value:string):RichNode[]{
 const pattern=/(\[[^\]]+\]\(https:\/\/[^)\s]+\)|\*\*[^*]+\*\*|\+\+[^+]+\+\+|\*[^*]+\*)/g;
 return value.split(pattern).filter(Boolean).map(part=>{
  const link=part.match(/^\[([^\]]+)\]\((https:\/\/[^)\s]+)\)$/);
  if(link)return {type:'text',text:link[1],marks:[{type:'link',attrs:{href:link[2]}}]};
  if(part.startsWith('**')&&part.endsWith('**'))return {type:'text',text:part.slice(2,-2),marks:[{type:'bold'}]};
  if(part.startsWith('++')&&part.endsWith('++'))return {type:'text',text:part.slice(2,-2),marks:[{type:'underline'}]};
  if(part.startsWith('*')&&part.endsWith('*'))return {type:'text',text:part.slice(1,-1),marks:[{type:'italic'}]};
  return {type:'text',text:part};
 });
}
export function legacyRichDocument(item:Pick<SiteDocument['publishing']['pages'][number],'blocks'>,site:SiteDocument):RichNode{
 return {type:'doc',content:item.blocks.flatMap((block):RichNode[]=>{
  const content=inlineNodes(block.text);
  if(block.type==='heading')return [{type:'heading',attrs:{level:Number(block.headingLevel.slice(1))},content}];
  if(block.type==='quote')return [{type:'blockquote',content:[{type:'paragraph',content}]}];
  if(block.type==='list'||block.type==='ordered-list')return [{type:block.type==='list'?'bulletList':'orderedList',content:block.items.map(text=>({type:'listItem',content:[{type:'paragraph',content:inlineNodes(text)}]}))}];
  if(block.type==='image'){const asset=site.media.assets.find(a=>a.id===block.mediaId);return asset?[{type:'image',attrs:{src:asset.url,alt:asset.alt,mediaId:asset.id}}]:[];}
  return [{type:'paragraph',content}];
 })};
}
