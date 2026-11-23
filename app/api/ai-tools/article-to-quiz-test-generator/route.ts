import { NextResponse } from "next/server";
import { generateDeterministicQuizFromArticle } from "@/features/article-to-quiz-test-generator/ArticleToQuizTestGeneratorClient";

export const runtime = "nodejs";

interface QuizRequest {
  articleTitle?: string;
  articleText?: string;
  questionCount?: number;
  difficulty?: "Easy" | "Medium" | "Hard";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuizRequest;
    const title = (body.articleTitle || "Article Assessment").trim();
    const text = (body.articleText || "").trim();
    const count = Math.min(10, Math.max(3, Number(body.questionCount) || 5));
    const difficulty = body.difficulty || "Medium";

    const questions = generateDeterministicQuizFromArticle(title, text, count, difficulty);

    return NextResponse.json({
      questions,
      sourceTier: "Verified Citation-Mapped Assessment Engine"
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate quiz from article." },
      { status: 500 }
    );
  }
}
