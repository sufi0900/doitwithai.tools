import Image from "next/image";
import {
  BookOpen,
  Check,
  Copy,
  FileText,
  MousePointer2,
  Play,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import type { HomeArticle, HomeResource } from "./data";
import { articlePath } from "./article-path";

import JourneyCharacter from "./JourneyCharacter";

function Thumbnail({ src, label }: { src?: string; label: string }) {
  return (
    <div className="journey-thumbnail">
      {src ? (
        <Image src={src} alt="" fill sizes="240px" className="object-cover" />
      ) : (
        <div className="journey-art">
          <Sparkles size={26} />
          <b>{label}</b>
          <span>IDEA → CREATE → REFINE</span>
        </div>
      )}
    </div>
  );
}
export default function JourneySimulation({
  stage,
  articles,
  resources,
  active,
}: {
  stage: number;
  articles: HomeArticle[];
  resources: HomeResource[];
  active: boolean;
}) {
  const article = articles.find((a) => a._type === "seo") || articles[0];
  const visuals = resources.filter((r) => r.image).slice(0, 3);
  const prompt = resources.find((r) => r.prompt);
  const document = resources.find((r) =>
    ["pdf", "ebook", "guide", "document", "template"].includes(r.format || ""),
  );
  const video = resources.find((r) => r.format === "video");
  return (
    <div className={`journey-story story-${stage}`}>
      <div className="journey-window" key={stage}>
        <div className="journey-browser">
          <i />
          <i />
          <i />
          <span>
            doitwithai.tools
            {stage === 0 && article
              ? articlePath(article)
              : stage === 1
                ? "/free-ai-resources"
                : "/tools"}
          </span>
        </div>
        <div className="journey-screen">
          {stage === 0 ? (
            <>
              <div className="journey-reading">
                <div className="journey-site">
                  <Image
                    src="/icons/apple-touch-icon.png"
                    alt=""
                    width="22"
                    height="22"
                  />{" "}
                  DO IT WITH AI TOOLS <span>AI SEO</span>
                </div>
                <small className="journey-eyebrow">
                  SEO WITH AI · PRACTICAL GUIDE
                </small>
                <h4>{article?.title || "Create better content with AI"}</h4>
                <p className="journey-byline">
                  By Sufian Mustafa · Step-by-step learning
                </p>
                <Thumbnail
                  src={article?.image}
                  label="Content creation with AI"
                />
                <p>
                  {article?.overview ||
                    "Explore our practical guides. Learn the steps, prepare your context, and review what AI creates."}
                </p>
                {article?.previewBlocks?.length ? (
                  article.previewBlocks.map((block) =>
                    /^h[234]$/.test(block.style || "") ? (
                      <h5 key={block._key}>{block.text}</h5>
                    ) : (
                      <p key={block._key}>{block.text}</p>
                    ),
                  )
                ) : (
                  <>
                    <h5>Start with your reader</h5>
                    <p>
                      Define your topic, audience, and goal. Use clear examples
                      to give your draft direction.
                    </p>
                    <h5>Keep human judgment in the process</h5>
                    <p>
                      Review the facts and improve the wording before publishing
                      your work.
                    </p>
                  </>
                )}
              </div>
              <div className="journey-scroll-track">
                <i />
              </div>
            </>
          ) : stage === 1 ? (
            <>
              <div className="journey-resource-tabs">
                {["Prompts", "Visuals", "Documents", "Videos"].map(
                  (label, i) => (
                    <span key={label} className={`resource-tab-${i}`}>
                      {label}
                    </span>
                  ),
                )}
              </div>
              <div className="journey-resources">
                <div className="journey-resource resource-panel-0">
                  <small className="journey-eyebrow">COPY AND ADAPT</small>
                  <h4>{prompt?.title || "Your next article brief"}</h4>
                  <div className="journey-prompt">
                    {prompt?.prompt?.slice(0, 440) ||
                      "Act as a content editor. Create an outline for [topic]. Write for [audience]. Address their main questions. Include examples and useful next steps."}
                  </div>
                  <div className="journey-save">
                    <Copy size={13} /> Copy prompt{" "}
                    <span>
                      <Check size={13} /> Collected
                    </span>
                  </div>
                </div>
                <div className="journey-resource resource-panel-1">
                  <small className="journey-eyebrow">VISUAL LIBRARY</small>
                  <h4>Ideas you can see and save</h4>
                  <div className="journey-gallery">
                    {[0, 1, 2].map((i) => (
                      <div key={i}>
                        <Thumbnail
                          src={visuals[i]?.image}
                          label={
                            ["AI + SEO", "Content workflow", "Prompt guide"][i]
                          }
                        />
                        <span>
                          {visuals[i]?.title ||
                            [
                              "AI SEO framework",
                              "Content creation guide",
                              "Prompt reference",
                            ][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="journey-save">
                    Save visual references <Check size={13} />
                  </div>
                </div>
                <div className="journey-resource resource-panel-2">
                  <small className="journey-eyebrow">DOCUMENT LIBRARY</small>
                  <div className="journey-pdf">
                    <FileText size={35} />
                    <b>PDF</b>
                    <h4>{document?.title || "Content planning workbook"}</h4>
                    <p>01 · Define your audience</p>
                    <p>02 · Build your brief</p>
                    <p>03 · Review your draft</p>
                  </div>
                  <div className="journey-save">
                    Collect your document <Check size={13} />
                  </div>
                </div>
                <div className="journey-resource resource-panel-3">
                  <small className="journey-eyebrow">VIDEO LIBRARY</small>
                  <h4>{video?.title || "Learn the workflow in action"}</h4>
                  <div className="journey-video">
                    <Thumbnail
                      src={video?.image || visuals[0]?.image}
                      label="Create with AI"
                    />
                    <span className="journey-play">
                      <Play size={24} fill="currentColor" />
                    </span>
                  </div>
                  <div className="journey-video-track">
                    <i />
                  </div>
                  <div className="journey-save">
                    Save a video for later <Check size={13} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="journey-tool-list">
                <small className="journey-eyebrow">CHOOSE YOUR AI TOOL</small>
                <h4>What will you create?</h4>
                {[
                  "Meta title generator",
                  "Article outline generator",
                  "Readability rewriter",
                ].map((name, i) => (
                  <div key={name} className={i === 1 ? "chosen-tool" : ""}>
                    <WandSparkles size={18} />
                    <span>
                      {name}
                      <small>
                        {
                          [
                            "Make your page easier to discover",
                            "Turn a brief into a clear structure",
                            "Make your writing easier to read",
                          ][i]
                        }
                      </small>
                    </span>
                    <span>↗</span>
                  </div>
                ))}
              </div>
              <div className="journey-tool-form">
                <small className="journey-eyebrow">
                  ARTICLE OUTLINE GENERATOR
                </small>
                <h4>Turn preparation into a draft</h4>
                <label>Topic and context</label>
                <div className="journey-type">
                  <span>Writing a blog post with AI</span>
                </div>
                <div className="journey-context">
                  <BookOpen size={12} /> Guide read <FileText size={12} /> Brief
                  collected
                </div>
                <div className="journey-generate">
                  <Sparkles size={14} /> Generate outline
                </div>
                <div className="journey-working">
                  <i />
                  <i />
                  <i /> Building your draft
                </div>
                <div className="journey-output">
                  <small>
                    <Check size={12} /> DRAFT GENERATED
                  </small>
                  <b>Write a useful blog post with AI</b>
                  <p>01 · Define your audience and goal</p>
                  <p>02 · Prepare your article brief</p>
                  <p>03 · Generate and refine your draft</p>
                  <p>04 · Review facts and add examples</p>
                  <span>Review and make it your own</span>
                </div>
              </div>
            </>
          )}
          <MousePointer2
            className="journey-cursor"
            size={23}
            fill="currentColor"
          />
          <span className="journey-click" />
        </div>
        <div className="journey-window-footer">
          <span>
            {
              [
                "Reading a guide",
                "Building your resource bag",
                "From learning to creating",
              ][stage]
            }
          </span>
          <span>Preview</span>
        </div>
      </div>
      <JourneyCharacter stage={stage} active={active} />
    </div>
  );
}
