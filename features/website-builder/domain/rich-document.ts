import { z } from "zod";
export type RichNode = {type:string;text?:string;attrs?:{level?:number;src?:string;alt?:string;title?:string;mediaId?:string;href?:string};marks?:{type:string;attrs?:{href?:string}}[];content?:RichNode[]};
export const richNodeSchema: z.ZodType<RichNode> = z.lazy(()=>z.object({
 type:z.enum(["doc","paragraph","text","heading","bulletList","orderedList","listItem","blockquote","codeBlock","hardBreak","image"]),
 text:z.string().max(30000).optional(),
 attrs:z.object({level:z.number().int().min(2).max(6).optional(),src:z.string().max(2000).optional(),alt:z.string().max(500).optional(),title:z.string().max(500).optional(),mediaId:z.string().max(120).optional(),href:z.string().max(2000).optional()}).optional(),
 marks:z.array(z.object({type:z.enum(["bold","italic","underline","strike","code","link"]),attrs:z.object({href:z.string().max(2000).optional()}).optional()})).max(6).optional(),
 content:z.array(richNodeSchema).max(200).optional(),
}));
export function safeLink(url:string=""){return /^(https?:\/\/|mailto:|#|\/(?!\/))/i.test(url)?url:undefined;}
export function richText(node:RichNode):string {return node.text??(node.content??[]).map(richText).join(node.type==="doc"?"\n":"");}
