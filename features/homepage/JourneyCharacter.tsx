"use client";
import { useEffect, useRef } from "react";
import { samplePose, type Point } from "./journey-motion";

export default function JourneyCharacter({
  stage,
  active,
}: {
  stage: number;
  active: boolean;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const clock = useRef(0);
  const previousStage = useRef(stage);
  useEffect(() => {
    if (!svg.current) return;
    if (previousStage.current !== stage) {
      clock.current = 0;
      previousStage.current = stage;
    }
    const root = svg.current;
    const el = (name: string) => root.querySelector(`[data-rig="${name}"]`)!;
    const leftArm = el("left-arm"),
      rightArm = el("right-arm"),
      leftHand = el("left-hand"),
      rightHand = el("right-hand");
    const head = el("head"),
      eyes = el("eyes"),
      page = el("page"),
      rightCover = el("right-cover"),
      closedBook = el("closed-book");
    const openBook = root.querySelector(".rig-open-book")!;
    const card = el("card"),
      flap = el("flap"),
      pen = el("pen"),
      lines = [el("line-0"), el("line-1"), el("line-2")];
    const icons = Array.from(root.querySelectorAll("[data-card-icon]"));
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const arm = (a: Point, b: Point, c: Point) =>
      `M${a.x} ${a.y}L${b.x} ${b.y}L${c.x} ${c.y}`;
    function draw(time: number) {
      const p = samplePose(stage, time);
      leftArm.setAttribute("d", arm(p.leftShoulder, p.leftElbow, p.leftHand));
      rightArm.setAttribute(
        "d",
        arm(p.rightShoulder, p.rightElbow, p.rightHand),
      );
      leftHand.setAttribute(
        "transform",
        `translate(${p.leftHand.x} ${p.leftHand.y})`,
      );
      rightHand.setAttribute(
        "transform",
        `translate(${p.rightHand.x} ${p.rightHand.y})`,
      );
      head.setAttribute("transform", `rotate(${p.headAngle} 165 110)`);
      eyes.setAttribute(
        "transform",
        `translate(165 78) scale(1 ${p.blink}) translate(-165 -78)`,
      );
      const edgeX = 218 - 106 * p.page,
        edgeY = 158 - 19 * Math.sin(Math.PI * p.page);
      page.setAttribute(
        "d",
        `M165 163Q${(165 + edgeX) / 2} ${edgeY - 5} ${edgeX} ${edgeY}L${edgeX} ${edgeY + 39}Q${(165 + edgeX) / 2} 197 165 207Z`,
      );
      page.setAttribute("opacity", p.pageVisible ? "1" : "0");
      rightCover.setAttribute(
        "transform",
        `translate(165 0) scale(${1 - 2 * p.closedBook} 1) translate(-165 0)`,
      );
      closedBook.setAttribute(
        "opacity",
        stage === 1 && p.closedBook > 0.98 ? "1" : "0",
      );
      openBook.setAttribute(
        "opacity",
        stage === 1 && p.closedBook > 0.98 ? "0" : "1",
      );
      card.setAttribute(
        "transform",
        `translate(${p.resource.x} ${p.resource.y})`,
      );
      card.setAttribute(
        "opacity",
        stage === 1 && p.resourceVisible ? "1" : "0",
      );
      icons.forEach((icon, i) =>
        icon.setAttribute("opacity", i === p.resourceIndex ? "1" : "0"),
      );
      flap.setAttribute(
        "transform",
        `translate(269 185) scale(1 ${1 - 1.8 * p.bagOpen}) translate(-269 -185)`,
      );
      pen.setAttribute("transform", `translate(${p.penTip.x} ${p.penTip.y})`);
      lines.forEach((line, i) =>
        line.setAttribute(
          "stroke-dashoffset",
          String(28 * (1 - Math.min(1, Math.max(0, p.writingProgress - i)))),
        ),
      );
    }
    draw(
      media.matches
        ? stage === 1
          ? 2.6
          : stage === 2
            ? 3.5
            : 1
        : clock.current,
    );
    let frame = 0,
      last: number | undefined;
    const tick = (now: number) => {
      if (last !== undefined)
        clock.current += Math.min((now - last) / 1000, 0.05);
      last = now;
      draw(clock.current);
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      last = undefined;
      if (active && !media.matches) frame = requestAnimationFrame(tick);
      else if (media.matches) draw(stage === 1 ? 2.6 : stage === 2 ? 3.5 : 1);
    };
    sync();
    media.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", sync);
    };
  }, [stage, active]);
  return (
    <div className={`journey-character character-stage-${stage}`}>
      <svg
        ref={svg}
        width="360"
        height="300"
        viewBox="0 0 360 300"
        fill="none"
        aria-hidden
      >
        <ellipse
          cx="173"
          cy="281"
          rx="133"
          ry="10"
          fill="#5271ff"
          opacity=".12"
        />
        <g className="rig-chair">
          <rect
            x="117"
            y="117"
            width="97"
            height="105"
            rx="19"
            fill="#b9c9ff"
          />
          <path
            d="M117 217H214M126 221L119 278M205 221L212 278"
            stroke="#91a5db"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </g>
        <g className="rig-backpack">
          <rect
            x="105"
            y="123"
            width="44"
            height="79"
            rx="15"
            fill="#efb658"
            stroke="#d39835"
            strokeWidth="2"
          />
          <path d="M114 139H137V184H114Z" stroke="#ffe4a2" strokeWidth="3" />
        </g>
        <path
          d="M141 214L140 239L143 266M186 214L188 239L187 266"
          stroke="#2a3b62"
          strokeWidth="19"
          strokeLinecap="round"
        />
        <path
          d="M135 262H149L155 278H130Z M181 262H195L202 278H179Z"
          fill="#192641"
        />
        <path
          d="M137 115Q164 104 192 115L199 211Q165 225 130 211Z"
          fill="#5271ff"
        />
        <path d="M151 101V119Q165 129 179 116V100" fill="#e9ac7c" />
        <path
          className="rig-backpack"
          d="M137 122Q128 158 141 190"
          stroke="#e4a342"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <g data-rig="head">
          <ellipse cx="165" cy="75" rx="31" ry="35" fill="#f3c49e" />
          <path
            d="M134 71Q124 32 165 31Q201 30 197 70L183 58Q160 62 146 51L137 74Z"
            fill="#253047"
          />
          <g data-rig="eyes">
            <circle cx="155" cy="79" r="2.6" fill="#253047" />
            <circle cx="176" cy="79" r="2.6" fill="#253047" />
          </g>
          <path
            d="M158 95Q168 100 176 94"
            stroke="#b7744e"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
        <g className="rig-open-book">
          <path
            d="M111 159Q138 152 165 163V207Q138 196 111 200Z"
            fill="#fff"
            stroke="#344b9d"
            strokeWidth="3"
          />
          <g data-rig="right-cover">
            <path
              d="M165 163Q192 151 218 158V200Q192 195 165 207Z"
              fill="#fff"
              stroke="#344b9d"
              strokeWidth="3"
            />
            <path
              d="M176 174L207 169M176 184L207 179M176 194L203 190"
              stroke="#b7c6ee"
              strokeWidth="2"
            />
          </g>
          <path
            d="M121 171L153 176M121 182L153 187M121 192L150 197"
            stroke="#b7c6ee"
            strokeWidth="2"
          />
          <path
            data-rig="page"
            fill="#f2f6ff"
            stroke="#a9bbea"
            strokeWidth="1.5"
            opacity="0"
          />
        </g>
        <g data-rig="closed-book" opacity="0">
          <rect x="108" y="166" width="45" height="52" rx="4" fill="#344b9d" />
          <path d="M113 169H150V212H113Z" fill="#f7f9ff" />
          <path
            d="M114 210H150M114 206H150"
            stroke="#c0cdef"
            strokeWidth="1.5"
          />
          <rect x="108" y="166" width="42" height="39" rx="3" fill="#5271ff" />
          <text
            x="132"
            y="181"
            fontSize="6"
            fontWeight="700"
            fill="white"
            textAnchor="middle"
          >
            AI GUIDE
          </text>
          <path d="M118 189H142M118 194H136" stroke="#b8c6ff" strokeWidth="2" />
          <path d="M111 170V202" stroke="#344b9d" strokeWidth="2" />
        </g>
        <g className="rig-shelf">
          <rect
            x="246"
            y="117"
            width="62"
            height="50"
            rx="7"
            fill="#eef3ff"
            stroke="#b1c0f2"
          />
          <path
            d="M241 167H313"
            stroke="#91a5db"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect
            x="259"
            y="107"
            width="32"
            height="42"
            rx="3"
            fill="#fff"
            stroke="#b1c0f2"
          />
          <path
            d="M266 118H284M266 125H284M266 132H280"
            stroke="#5271ff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
        <g className="rig-desk">
          <path
            d="M83 197H265L284 223H65Z"
            fill="#ebcba4"
            stroke="#c79c6b"
            strokeWidth="2"
          />
          <path d="M77 223V278M270 223V278" stroke="#c79c6b" strokeWidth="8" />
          <path d="M183 190H234L250 218H194Z" fill="#fff" stroke="#c2cee9" />
          <path
            data-rig="line-0"
            d="M196 199H224"
            stroke="#5271ff"
            strokeWidth="1.6"
            strokeDasharray="28"
            strokeDashoffset="28"
          />
          <path
            data-rig="line-1"
            d="M196 204H224"
            stroke="#5271ff"
            strokeWidth="1.6"
            strokeDasharray="28"
            strokeDashoffset="28"
          />
          <path
            data-rig="line-2"
            d="M196 209H224"
            stroke="#5271ff"
            strokeWidth="1.6"
            strokeDasharray="28"
            strokeDashoffset="28"
          />
          <g>
            <path d="M103 195L144 192L157 214L113 216Z" fill="#344b9d" />
            <path d="M107 198L146 196L154 210L116 213Z" fill="#f7f9ff" />
            <path d="M104 195L145 193L153 205L112 208Z" fill="#5271ff" />
            <text
              x="126"
              y="202"
              fontSize="5"
              fontWeight="700"
              fill="white"
              textAnchor="middle"
            >
              AI GUIDE
            </text>
          </g>
        </g>
        <path
          data-rig="left-arm"
          d="M139 125L112 165L128 192"
          stroke="#f3c49e"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          data-rig="right-arm"
          d="M190 125L231 156L218 181"
          stroke="#f3c49e"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g data-rig="card" opacity="0">
          <rect
            x="-6"
            y="0"
            width="31"
            height="38"
            rx="3"
            fill="#fff"
            stroke="#5271ff"
            strokeWidth="1.5"
          />
          <g data-card-icon="0">
            <path
              d="M2 10L-1 14L2 18M16 10L19 14L16 18M11 10L7 18"
              stroke="#5271ff"
              strokeWidth="1.5"
            />
            <text x="9" y="29" fontSize="5" fill="#354da0" textAnchor="middle">
              PROMPT
            </text>
          </g>
          <g data-card-icon="1" opacity="0">
            <rect x="1" y="10" width="17" height="12" rx="2" fill="#dce7ff" />
            <circle cx="14" cy="13" r="2" fill="#f8c56c" />
            <path d="M1 22L6 14L11 20L15 17L18 22Z" fill="#5271ff" />
            <text x="9" y="29" fontSize="5" fill="#354da0" textAnchor="middle">
              VISUAL
            </text>
          </g>
          <g data-card-icon="2" opacity="0">
            <path d="M4 9H15V23H4Z" fill="#fce5dd" stroke="#e28b71" />
            <path d="M7 13H12M7 17H12" stroke="#e28b71" />
            <text x="9" y="29" fontSize="5" fill="#354da0" textAnchor="middle">
              PDF
            </text>
          </g>
          <g data-card-icon="3" opacity="0">
            <rect x="1" y="10" width="18" height="13" rx="2" fill="#5271ff" />
            <path d="M7 12L14 16L7 21Z" fill="#fff" />
            <text x="9" y="29" fontSize="5" fill="#354da0" textAnchor="middle">
              VIDEO
            </text>
          </g>
        </g>
        <g className="rig-bag">
          <path
            d="M247 185V174Q267 157 291 175V185"
            stroke="#c7892f"
            strokeWidth="5"
          />
          <rect
            x="234"
            y="184"
            width="69"
            height="83"
            rx="14"
            fill="#f8ca6d"
            stroke="#d99d3c"
            strokeWidth="2"
          />
          <ellipse cx="269" cy="185" rx="29" ry="6" fill="#9b6425" />
          <rect x="243" y="224" width="51" height="30" rx="5" fill="#fff3d0" />
          <text
            x="269"
            y="236"
            fontSize="8"
            fontWeight="700"
            fill="#745021"
            textAnchor="middle"
          >
            FREE
          </text>
          <text
            x="269"
            y="247"
            fontSize="7"
            fontWeight="700"
            fill="#745021"
            textAnchor="middle"
          >
            RESOURCES
          </text>
          <g data-rig="flap">
            <path
              d="M239 184Q269 173 299 184V207Q269 218 239 207Z"
              fill="#f8d789"
              stroke="#d99d3c"
              strokeWidth="2"
            />
          </g>
        </g>
        <g data-rig="pen" className="rig-pen">
          <path
            d="M-7 -20L-1 -3"
            stroke="#25375f"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M-1 -3L0 0" stroke="#d9a66d" strokeWidth="1.5" />
        </g>
        <g data-rig="left-hand">
          <ellipse rx="8" ry="6" fill="#f3c49e" />
          <path
            d="M-4 1L3 2"
            stroke="#d6966b"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
        <g data-rig="right-hand">
          <ellipse rx="8" ry="6" fill="#f3c49e" />
          <path
            d="M-4 1L3 2"
            stroke="#d6966b"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <span className="jc-caption">
        {
          [
            "Read the guide. Turn the page.",
            "Close the book. Pack your resources.",
            "Bring your learning to the desk.",
          ][stage]
        }
      </span>
    </div>
  );
}
