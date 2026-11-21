/** Drain edits that arrive during a save, using only revisions confirmed by the server. */
export async function drainDraftQueue<T>(
 latest: {current:T}, confirmed:{current:T|null}, revision:{current:number},
 persist:(snapshot:T,expectedRevision:number)=>Promise<number>,
) {
 while(JSON.stringify(confirmed.current)!==JSON.stringify(latest.current)) {
  const snapshot=latest.current;
  const nextRevision=await persist(snapshot,revision.current);
  revision.current=nextRevision;
  confirmed.current=snapshot;
 }
 return revision.current;
}
