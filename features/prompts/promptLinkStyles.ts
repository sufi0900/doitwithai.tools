/**
 * Matches the inline hyperlink styling used in standard blog articles
 * (`features/articles/legacy/components/createPortableTextComponents.jsx`):
 * blue text + smooth retracting 1.5px bottom underline on hover.
 */
export const PROMPT_INLINE_LINK_CLASS =
  "text-blue-600 dark:text-blue-400 font-semibold no-underline transition-all duration-300 ease-in-out hover:text-blue-700 dark:hover:text-blue-300 bg-gradient-to-r from-current to-current bg-[length:100%_1.5px] bg-no-repeat bg-[position:0_100%] pb-0.5 hover:bg-[length:0_1.5px] break-words";

/**
 * Companion studio link wrapper (preserves 44px mobile tap target via `min-h-11`)
 * paired with an inner text span so the 1.5px animated underline hugs the text
 * baseline rather than sitting at the bottom of the 44px flex box.
 */
export const PROMPT_COMPANION_LINK_CLASS =
  "group mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-blue-600 no-underline transition-colors duration-300 ease-in-out hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300";

export const PROMPT_COMPANION_LINK_TEXT_CLASS =
  "bg-gradient-to-r from-current to-current bg-[length:100%_1.5px] bg-no-repeat bg-[position:0_100%] pb-0.5 transition-[background-size] duration-300 ease-in-out group-hover:bg-[length:0_1.5px]";
