import test from 'node:test';
import assert from 'node:assert/strict';
import { stripTypeScriptTypes } from 'node:module';
import { readFileSync } from 'node:fs';
const code=readFileSync(new URL('../../features/writer-workspace/research-evidence.ts',import.meta.url),'utf8');
const {collectResearchEvidence}=await import(`data:text/javascript,${encodeURIComponent(stripTypeScriptTypes(code))}`);
const prose='A real extracted passage explains the topic with enough detail to be useful as reference evidence. '.repeat(3);
test('imports extracted text, deduplicates and caps requests at two',async()=>{
 let calls=0;
 const result=await collectResearchEvidence([{url:'https://a.test/'},{url:'https://a.test/'},{url:'https://b.test/'},{url:'https://c.test/'}],[],async()=>{calls++;return Response.json({cleanText:prose,title:'Read page'});});
 assert.equal(calls,2);assert.equal(result.length,2);assert.equal(result[0].text,prose.trim());
});
test('failures and short pages create no fabricated evidence',async()=>{
 assert.deepEqual(await collectResearchEvidence([{url:'https://a.test/'}],[],async()=>Response.json({text:'short'})),[]);
 assert.deepEqual(await collectResearchEvidence([{url:'https://a.test/'}],[],async()=>{throw Error('offline');}),[]);
});
test('respects existing capacity, protocols and existing references',async()=>{
 let calls=0; const fetcher=async()=>{calls++;return Response.json({text:prose});};
 assert.deepEqual(await collectResearchEvidence([{url:'javascript:alert(1)'},{url:'https://a.test/'}],[{url:'https://a.test/'}],fetcher),[]);
 assert.deepEqual(await collectResearchEvidence([{url:'https://b.test/'}],Array.from({length:4},(_,i)=>({url:`https://${i}.test/`})),fetcher),[]);
 assert.equal(calls,0);
});
