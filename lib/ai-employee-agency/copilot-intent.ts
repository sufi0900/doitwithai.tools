export function classifyCopilotIntent(message: string) {
  const text = message.trim().toLowerCase();
  const compact = text.replace(/\s+/g, '');
  if (/^(hi|hey|hello|salaam|salam|good (morning|evening|afternoon))[!.\s]*$/.test(text)) return 'greeting';
  if (/^(change|switch|prioriti[sz]e|focus|stop promoting)\b/.test(text)) return 'strategy_pivot';
  if (/^(delegate|assign|launch|schedule|write|publish|create)\b/.test(text)) return 'delegate_task';
  if (/^(research|search|look up|find sources)\b/.test(text)) return 'web_research';
  if (
    /\b(how\s*many|workspace\s*summary|published\s*count|queue\s*status|blogs?\s*published|articles?\s*published)\b/.test(text) ||
    /howmany(blogs?|articles?|posts?|published|queued|ready)/.test(compact)
  ) {
    return 'workspace_read';
  }
  return 'casual_chat';
}
