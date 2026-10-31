export type ReviewSentiment = "5-star" | "3-star" | "1-star";

export type ReviewResponseInput = {
  businessName: string;
  cityAndState: string;
  primaryServiceMentioned: string;
  reviewerName: string;
  sentiment: ReviewSentiment;
  reviewText: string;
  ownerSignOff: string;
  resolutionPhoneOrEmail: string;
};

export type ReviewReplyVariant = {
  style: "Warm & Local-SEO Optimized" | "Concise & Professional" | "Empathy & Offline Resolution";
  replyText: string;
  wordCount: number;
  localSignalsIncluded: string[];
};

export const DEFAULT_REVIEW_RESPONSE_INPUT: ReviewResponseInput = {
  businessName: "Apex Dental & Implant Studio",
  cityAndState: "Austin, TX",
  primaryServiceMentioned: "Invisalign consultation and dental cleaning",
  reviewerName: "Marcus Vance",
  sentiment: "5-star",
  reviewText:
    "Dr. Carter and the hygienist were incredible! I was nervous about getting Invisalign, but they walked me through the 3D scan, explained my insurance coverage clearly, and got my cleaning done with zero pain.",
  ownerSignOff: "Dr. Carter & the Apex Dental Team",
  resolutionPhoneOrEmail: "(512) 555-0194",
};

export function buildDeterministicReviewReplies(
  input: ReviewResponseInput,
): ReviewReplyVariant[] {
  const biz = input.businessName.trim() || "our team";
  const city = input.cityAndState.trim() || "our community";
  const service = input.primaryServiceMentioned.trim() || "your visit";
  const reviewer = input.reviewerName.trim() || "there";
  const signOff = input.ownerSignOff.trim() || biz;
  const contact = input.resolutionPhoneOrEmail.trim() || "our office directly";

  if (input.sentiment === "1-star") {
    const v1 = `Hi ${reviewer}, thank you for bringing this to our attention. At ${biz} in ${city}, we hold our ${service} standards very high, and we are sorry your experience fell short of expectations. Because we take patient/client privacy seriously and want to resolve this properly, please reach out to me directly at ${contact} so I can review your file and make this right. — ${signOff}`;
    const v2 = `Dear ${reviewer}, we appreciate your candid feedback regarding your recent ${service}. This is not the standard of care we strive to deliver at ${biz}. I have shared your notes with our ${city} management team and would welcome the opportunity to speak with you directly at ${contact} to resolve your concerns promptly. — ${signOff}`;
    const v3 = `Hi ${reviewer}, I am sorry to hear that your visit with us did not go as smoothly as it should have. We value every client in ${city} and want to address this right away. Please call or email us at ${contact} at your earliest convenience so we can personally assist you. — ${signOff}`;

    return [
      {
        style: "Empathy & Offline Resolution",
        replyText: v1,
        wordCount: v1.split(/\s+/).length,
        localSignalsIncluded: [biz, city, "Offline de-escalation contact"],
      },
      {
        style: "Concise & Professional",
        replyText: v2,
        wordCount: v2.split(/\s+/).length,
        localSignalsIncluded: [biz, city, service],
      },
      {
        style: "Warm & Local-SEO Optimized",
        replyText: v3,
        wordCount: v3.split(/\s+/).length,
        localSignalsIncluded: [city, "Direct owner accountability"],
      },
    ];
  }

  if (input.sentiment === "3-star") {
    const v1 = `Hi ${reviewer}, thank you for visiting ${biz} in ${city} for your ${service} and for sharing your honest feedback! We are glad parts of your visit went well, and we take your constructive notes seriously so we can make your next experience a full 5-star visit. Feel free to reach out to us at ${contact} anytime. — ${signOff}`;
    const v2 = `Thank you for the thoughtful review, ${reviewer}! Our ${city} team appreciates knowing both what worked well during your ${service} and where we can improve. Please let us know at ${contact} if we can help with anything else! — ${signOff}`;
    const v3 = `Hi ${reviewer}, we appreciate you choosing ${biz} for your ${service} in ${city}. Your feedback helps our team refine our scheduling and service workflow every day. We look forward to welcoming you back soon! — ${signOff}`;

    return [
      {
        style: "Warm & Local-SEO Optimized",
        replyText: v1,
        wordCount: v1.split(/\s+/).length,
        localSignalsIncluded: [biz, city, service],
      },
      {
        style: "Concise & Professional",
        replyText: v2,
        wordCount: v2.split(/\s+/).length,
        localSignalsIncluded: [city, service],
      },
      {
        style: "Empathy & Offline Resolution",
        replyText: v3,
        wordCount: v3.split(/\s+/).length,
        localSignalsIncluded: [biz, city],
      },
    ];
  }

  // 5-Star Positive Review Replies
  const v1 = `Thank you so much for the wonderful 5-star review, ${reviewer}! We are thrilled to hear that your ${service} at ${biz} in ${city} was comfortable, transparent, and stress-free. Our team works hard to make every visit a great experience for our ${city} neighbors, and we look forward to seeing you at your next appointment! — ${signOff}`;
  const v2 = `Hi ${reviewer}, thank you for trusting ${biz} with your ${service}! It means a lot to our ${city} team to know you felt well taken care of from start to finish. Thank you for recommending us, and we will see you next time! — ${signOff}`;
  const v3 = `We appreciate your kind words, ${reviewer}! Helping clients across ${city} feel confident and informed during their ${service} is our #1 priority at ${biz}. Thank you for taking the time to share your experience on Google! — ${signOff}`;

  return [
    {
      style: "Warm & Local-SEO Optimized",
      replyText: v1,
      wordCount: v1.split(/\s+/).length,
      localSignalsIncluded: [biz, city, service],
    },
    {
      style: "Concise & Professional",
      replyText: v2,
      wordCount: v2.split(/\s+/).length,
      localSignalsIncluded: [biz, city, service],
    },
    {
      style: "Empathy & Offline Resolution",
      replyText: v3,
      wordCount: v3.split(/\s+/).length,
      localSignalsIncluded: [biz, city, service],
    },
  ];
}
