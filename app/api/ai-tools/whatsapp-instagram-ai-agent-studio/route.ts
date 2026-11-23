import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import {
  buildDeterministicWhatsappInstagramPack,
  type WhatsappInstagramStudioInput,
} from "@/features/whatsapp-instagram-ai-agent-studio/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  brandOrShopName: z.string().trim().min(2).max(160),
  productOrServiceCatalogSummary: z.string().trim().max(1200).default(""),
  startingPriceAndPackages: z.string().trim().min(2).max(600),
  triggerKeyword: z.string().trim().min(1).max(60).default("PRICE"),
  topBuyerObjections: z.string().trim().max(1600).default(""),
  bookingOrCheckoutUrl: z.string().trim().max(2048).default(""),
  platformFocus: z
    .enum([
      "Instagram DM + WhatsApp Business + Telegram Community",
      "Instagram Shop Price Inquiry & ManyChat Automation",
      "WhatsApp Catalog, Booking & Cart Recovery",
      "Telegram Group Moderation & VIP Funnel",
    ])
    .default("Instagram DM + WhatsApp Business + Telegram Community"),
});

export async function POST(request: NextRequest) {
  let input: WhatsappInstagramStudioInput;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 120_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide your shop/brand name and pricing packages to build the DM & Community Sales Studio.",
        },
      },
      { status: 422 },
    );
  }

  const pack = buildDeterministicWhatsappInstagramPack(input);
  return NextResponse.json({
    pack,
    provider: "deterministic",
  });
}
