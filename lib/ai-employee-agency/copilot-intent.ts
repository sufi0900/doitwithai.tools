export function classifyCopilotIntent(message: string) {
  const text = message.trim().toLowerCase();
  if (/^(hi|hey|hello|salaam|salam|good (morning|evening|afternoon))[!.\s]*$/.test(text)) return 'greeting';
  if (/^(change|switch|prioriti[sz]e|focus|retire|stop promoting)\b/.test(text)) return 'strategy_pivot';
  if (/^(pass|delegate|assign|launch|schedule|write|publish|create)\b/.test(text)) return 'delegate_task';
  if (/^(research|search|look up|find sources)\b/.test(text)) return 'web_research';
  if (/\b(how many|workspace summary|published count|queue status)\b/.test(text)) return 'workspace_read';
  return 'casual_chat';
}
