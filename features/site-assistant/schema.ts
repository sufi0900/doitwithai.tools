import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(3_000),
});

export const siteAssistantRequestSchema = z
  .object({
    messages: z.array(messageSchema).min(1).max(14),
    currentPage: z
      .object({
        title: z.string().trim().max(180).optional(),
        url: z.string().trim().max(500).optional(),
      })
      .optional(),
    website: z.string().max(0).optional(),
  })
  .superRefine((value, context) => {
    const totalLength = value.messages.reduce(
      (total, message) => total + message.content.length,
      0,
    );
    if (totalLength > 12_000) {
      context.addIssue({
        code: "custom",
        path: ["messages"],
        message: "The conversation is too long. Start a new chat to continue.",
      });
    }
    if (value.messages.at(-1)?.role !== "user") {
      context.addIssue({
        code: "custom",
        path: ["messages"],
        message: "The final message must come from the user.",
      });
    }
  });
