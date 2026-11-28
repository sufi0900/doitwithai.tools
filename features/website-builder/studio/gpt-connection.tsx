"use client";
import { useEffect, useState } from "react";

type Connection={id:string;label:string;created_at:string};
export function GptConnection({projectId}:{projectId:string}) {
  const [entries,setEntries]=useState<Connection[]>([]);
  const [label,setLabel]=useState("My private GPT");
  const [key,setKey]=useState("");
  const [error,setError]=useState("");
  const base=`/api/projects/${projectId}/connections`;
  useEffect(()=>{fetch(base).then((r)=>r.json()).then((body)=>setEntries(body.connections??[])).catch(()=>setError("Could not load connections."));},[base]);
  async function create(){setError("");try {const response=await fetch(base,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({label})});const data=await response.json();if(!response.ok) throw new Error(data.error);setKey(data.key);setEntries((items)=>[data.connection,...items]);}catch(cause){setError(cause instanceof Error?cause.message:"Could not create connection.");}}
  async function revoke(id:string){setError("");try{const response=await fetch(base,{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});if(!response.ok) throw new Error("Could not revoke connection.");setEntries((items)=>items.filter((entry)=>entry.id!==id));setKey("");}catch(cause){setError(cause instanceof Error?cause.message:"Could not revoke connection.");}}
  return <section className="visitor-knowledge" aria-label="ChatGPT private connection"><h2>ChatGPT connection</h2><p>Brainstorm in your own private GPT and send approved edits into this portfolio draft. Publishing stays in Studio. The connection is scoped to this portfolio; do not share the GPT or its key.</p>
    <ol className="connection-steps"><li>Deploy DoItWithAI Studio to a public HTTPS address and set <code>NEXT_PUBLIC_SITE_URL</code> to that address in your hosting settings. ChatGPT cannot reach localhost.</li><li>Create a key below and copy it immediately. It appears once.</li><li>In ChatGPT → GPTs → Create or Edit GPT → Configure → Actions → Create new action, import <code>https://YOUR-HOST/api/connect/openapi</code>. Set authentication to <strong>API key → Bearer</strong> and paste your key.</li><li>Keep your GPT private. In its Preview, ask it to read your latest draft, then confirm a specific edit. Check the change in Studio before publishing.</li></ol>
    <p><a href="/api/connect/openapi" target="_blank" rel="noopener noreferrer">Open the DoItWithAI Studio Action schema</a>. You can revoke any key below; a revoked key stops working immediately.</p>
    <label>Connection name<input value={label} maxLength={60} onChange={(event)=>setLabel(event.target.value)} /></label><button type="button" disabled={!label.trim() || entries.length>=3} onClick={()=>void create()}>Create private key</button>
    {key&&<label>Copy this key now; it cannot be shown again<input value={key} readOnly onFocus={(event)=>event.target.select()} /><button type="button" onClick={()=>void navigator.clipboard.writeText(key)}>Copy key</button></label>}
    {error&&<p role="alert">{error}</p>}<ul>{entries.map((entry)=><li key={entry.id}><strong>{entry.label}</strong><small>Created {new Date(entry.created_at).toLocaleDateString()}</small><button type="button" onClick={()=>void revoke(entry.id)}>Revoke access</button></li>)}</ul>
    <small>This release supports private GPT Actions only. A shared ChatGPT plugin or MCP service requires separate OAuth account authorization and is not set up by this key.</small></section>;
}
