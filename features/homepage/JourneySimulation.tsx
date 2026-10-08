import {
  BookOpen,
  Check,
  Copy,
  FileText,
  Image,
  MousePointer2,
  Sparkles,
} from "lucide-react";

// Illustrative interfaces only. Every scene shares a twelve-second animation clock.
export default function JourneySimulation({ stage }: { stage: number }) {
  return (
    <div className={`journey-simulation simulation-${stage}`}>
      <div className="simulation-browser">
        <i />
        <i />
        <i />
        <span>
          doitwithai.tools /{" "}
          {stage === 0 ? "ai-seo" : stage === 1 ? "free-ai-resources" : "tools"}
        </span>
      </div>
      <div className="simulation-viewport">
        {stage === 0 ? (
          <>
            <div className="simulation-article-scroll">
              <div className="simulation-kicker">
                <BookOpen size={12} /> PRACTICAL GUIDE · 6 MIN READ
              </div>
              <h4>How to turn an AI draft into a useful article</h4>
              <p>
                Start with your reader’s question. Give AI context, then review
                the draft with your own judgment.
              </p>
              <div className="simulation-article-art">
                <span>YOUR IDEA</span>
                <b>Context → Draft → Review</b>
                <Sparkles size={28} />
              </div>
              <h5>Give your draft a clear direction</h5>
              <p>
                Explain who you are writing for and what they need to learn.
                Include examples that make the topic easier to understand.
              </p>
              <div className="simulation-checklist">
                <Check size={13} /> Define the audience
                <br />
                <Check size={13} /> Add useful context
                <br />
                <Check size={13} /> Check the important claims
              </div>
              <h5>Review before you publish</h5>
              <p>
                Read the result, verify the facts, and adjust the wording so it
                reflects your experience.
              </p>
            </div>
            <div className="simulation-scrollbar">
              <i />
            </div>
          </>
        ) : stage === 1 ? (
          <div className="simulation-resource-workspace">
            <div className="simulation-resource-tabs">
              <span className="sim-prompt-tab">Prompts</span>
              <span className="sim-visual-tab">Visuals</span>
              <span className="sim-document-tab">Documents</span>
            </div>
            <div className="simulation-resource-stack">
              <div className="simulation-resource-panel sim-prompt-panel">
                <div className="simulation-kicker">PROMPT LIBRARY</div>
                <h4>Give your idea a starting point</h4>
                <div className="simulation-terminal">
                  <span>$ adapt article_brief</span>
                  <p>
                    Topic: [your idea]
                    <br />
                    Audience: [your readers]
                    <br />
                    Goal: [what they should learn]
                  </p>
                </div>
                <div className="simulation-copy">
                  <Copy size={12} /> <span>Copy prompt</span>
                  <b>
                    <Check size={12} /> Copied
                  </b>
                </div>
              </div>
              <div className="simulation-resource-panel sim-visual-panel">
                <div className="simulation-kicker">
                  <Image size={12} /> VISUAL RESOURCE
                </div>
                <h4>A framework you can explore</h4>
                <div className="simulation-visual-map">
                  <b>YOUR PROJECT</b>
                  <div>
                    <span>Plan</span>
                    <span>Create</span>
                    <span>Review</span>
                  </div>
                </div>
                <p>Use a visual reference to organize your next steps.</p>
              </div>
              <div className="simulation-resource-panel sim-document-panel">
                <div className="simulation-kicker">
                  <FileText size={12} /> DOCUMENT PREVIEW
                </div>
                <h4>Your content planning checklist</h4>
                <div className="simulation-paper">
                  <b>Before you begin</b>
                  <span>
                    <Check size={12} /> Set your reader’s goal
                  </span>
                  <span>
                    <Check size={12} /> Collect useful examples
                  </span>
                  <span>
                    <Check size={12} /> Prepare your brief
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="simulation-tool-workspace">
            <div className="simulation-tool-tabs">
              <span className="sim-title-tab">Meta title</span>
              <span className="sim-outline-tab">Article outline</span>
            </div>
            <div className="simulation-tool-stack">
              <div className="simulation-tool-panel sim-title-panel">
                <div className="simulation-kicker">
                  <Sparkles size={12} /> META TITLE GENERATOR
                </div>
                <h4>Give your page a clear title</h4>
                <label>What is your page about?</label>
                <div className="simulation-input">
                  <span>Writing a blog post with AI</span>
                </div>
                <div className="simulation-generate">
                  Generate ideas <Sparkles size={12} />
                </div>
                <div className="simulation-loading">
                  <i />
                  <i />
                  <i /> Shaping your ideas
                </div>
                <div className="simulation-title-result">
                  <span>EXAMPLE RESULT</span>
                  <b>How to Write a Blog Post with AI: A Practical Workflow</b>
                  <small>
                    <Check size={11} /> Ready for your review
                  </small>
                </div>
              </div>
              <div className="simulation-tool-panel sim-outline-panel">
                <div className="simulation-kicker">
                  <FileText size={12} /> ARTICLE OUTLINE GENERATOR
                </div>
                <h4>Build on your starting point</h4>
                <div className="simulation-outline-input">
                  How to write a blog post with AI
                </div>
                <div className="simulation-generate">
                  Generate outline <Sparkles size={12} />
                </div>
                <div className="simulation-outline-result">
                  <b>H1 · Writing a Blog Post with AI</b>
                  <span>H2 · Prepare a useful article brief</span>
                  <small>H3 · Define your reader’s question</small>
                  <span>H2 · Review and refine your AI draft</span>
                  <small>H3 · Verify facts and add examples</small>
                </div>
              </div>
            </div>
          </div>
        )}
        <MousePointer2
          className="simulation-pointer"
          size={25}
          fill="currentColor"
        />
        <span className="simulation-click-ring" />
      </div>
      <div className="simulation-caption">
        <span className="simulation-progress" />
        <span>Illustrative simulation</span>
        <span>12s loop</span>
      </div>
    </div>
  );
}
