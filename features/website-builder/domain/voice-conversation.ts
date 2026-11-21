/** Only clear, affirmative responses can approve a pending exact fact. */
export function isAffirmative(input: string): boolean {
  const answer = input.trim().toLowerCase().replace(/[.!?]+$/g, "").trim();
  return /^(?:yes(?:,? yes)?(?:,? (?:this is |that is |it's |it is )?(?:correct|right|exact|okay|ok|done))?(?:,? (?:please )?proceed(?: (?:to|with) (?:the )?next(?: step)?)?)?|yes please|correct|confirmed|confirm|that's (?:right|correct|exact)|that is (?:right|correct|exact)|exactly|approve|approved|looks (?:right|correct|good)|sounds (?:right|correct|good)|(?:okay|ok)(?:,? (?:this is |that is |it's |it is )?(?:correct|right|exact|done))?|(?:please )?proceed(?: (?:to|with) (?:the )?next(?: step)?)?|go ahead(?: to the next step)?|this is (?:correct|right|exact|okay|ok|done))$/i.test(answer);
}

/** Agent deltas are individual spoken words, without guaranteed whitespace. */
export function appendSpokenWord(previous: string, delta: string): string {
  if (!delta) return previous;
  if (!previous || /^\s/.test(delta) || /^[,.;:!?\])}]/.test(delta)) return previous + delta;
  if (/[\s([{’'-]$/.test(previous)) return previous + delta;
  return `${previous} ${delta}`;
}

/** Only an explicit finalization request can save the first private draft. */
export function isDraftCreationIntent(input: string): boolean {
  const value = input.trim().toLowerCase();
  if (/\b(?:don't|do not|not yet|wait|hold|cancel|later|should i|can i|how do i)\b/.test(value)) return false;
  return /\b(?:publish(?: it)? now|create (?:my |the |a )?(?:private )?(?:first )?draft(?: now)?|save (?:my |the |a )?(?:private )?draft(?: now)?|finish (?:my |the )?(?:portfolio|draft)|(?:go ahead and |please )?(?:publish|create|save) (?:it|the draft|my draft)(?: now)?|(?:create|save|build|make) it (?:now|again)|proceed (?:to|with) (?:the )?(?:draft|publish|creation|final step)|finalize (?:my |the )?(?:draft|portfolio))\b/.test(value);
}

export function isTemplateConfirmationIntent(input: string): boolean {
  const value = input.trim().toLowerCase();
  if (/\b(?:don't|do not|not yet|wait|hold|cancel|how|can i|should i)\b/.test(value)) return false;
  return /\b(?:confirm|approve|finalize|lock in) (?:this |the |my )?(?:template|design|choice|selection)\b|\b(?:this is (?:my|the) (?:template|one)|use this template)\b/.test(value);
}
