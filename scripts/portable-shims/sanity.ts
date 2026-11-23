export const createClient = () => ({ fetch: async () => [], withConfig() { return this; } });
export default createClient;
export const groq = (s: TemplateStringsArray) => s.join("");

