"use client";
import { useEffect, useRef } from "react";
import {
  samplePose,
  STATIC_TIME,
  LINE_X0,
  LINE_X1,
  LINE_Y,
  type Point,
} from "./journey-motion";

// Short sleeves give the shoulder a natural shape. Set to 0 to go back to bare arms.
const SLEEVE = 0.44;
const f = (n: number) => n.toFixed(2);
const angleOf = (a: Point, b: Point) =>
  (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

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
    const leftHand = el("left-hand"),
      rightHand = el("right-hand");
    const parts = (side: "left" | "right") => ({
      outline: el(`${side}-arm-outline`),
      skin: el(`${side}-arm`),
      sleeve: el(`${side}-sleeve`),
      hem: el(`${side}-hem`),
      cap: el(`${side}-shoulder`),
    });
    const leftParts = parts("left"),
      rightParts = parts("right");
    const torso = el("torso"),
      face = el("face");
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
      `M${f(a.x)} ${f(a.y)}L${f(b.x)} ${f(b.y)}L${f(c.x)} ${f(c.y)}`;
    function setArm(
      ui: ReturnType<typeof parts>,
      shoulder: Point,
      elbow: Point,
      hand: Point,
    ) {
      const d = arm(shoulder, elbow, hand);
      ui.outline.setAttribute("d", d);
      ui.skin.setAttribute("d", d);
      const cx = shoulder.x + (elbow.x - shoulder.x) * SLEEVE,
        cy = shoulder.y + (elbow.y - shoulder.y) * SLEEVE;
      const len = Math.hypot(elbow.x - shoulder.x, elbow.y - shoulder.y) || 1;
      const nx = -(elbow.y - shoulder.y) / len,
        ny = (elbow.x - shoulder.x) / len;
      ui.sleeve.setAttribute("d", `M${f(shoulder.x)} ${f(shoulder.y)}L${f(cx)} ${f(cy)}`);
      ui.hem.setAttribute(
        "d",
        `M${f(cx + nx * 8.4)} ${f(cy + ny * 8.4)}L${f(cx - nx * 8.4)} ${f(cy - ny * 8.4)}`,
      );
      ui.cap.setAttribute("cx", f(shoulder.x));
      ui.cap.setAttribute("cy", f(shoulder.y));
    }
    function draw(time: number) {
      const p = samplePose(stage, time);
      setArm(leftParts, p.leftShoulder, p.leftElbow, p.leftHand);
      setArm(rightParts, p.rightShoulder, p.rightElbow, p.rightHand);
      leftHand.setAttribute(
        "transform",
        `translate(${f(p.leftHand.x)} ${f(p.leftHand.y)}) rotate(${f(angleOf(p.leftElbow, p.leftHand))})`,
      );
      rightHand.setAttribute(
        "transform",
        `translate(${f(p.rightHand.x)} ${f(p.rightHand.y)}) rotate(${f(angleOf(p.rightElbow, p.rightHand))})`,
      );
      torso.setAttribute(
        "transform",
        `translate(0 ${f(-0.6 * p.breath)}) rotate(${f(p.bodyAngle)} 165 210)`,
      );
      face.setAttribute(
        "transform",
        `translate(${p.gaze * 8} ${p.gaze * 5}) translate(165 0) scale(${1 - p.gaze * 0.2} 1) translate(-165 0)`,
      );
      head.setAttribute("transform", `rotate(${f(p.headAngle)} 165 110)`);
      eyes.setAttribute(
        "transform",
        `translate(165 78) scale(1 ${p.blink}) translate(-165 -78)`,
      );
      const edgeX = p.pageEdge.x,
        edgeY = p.pageEdge.y;
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
        stage === 1 && p.resourceVisible ? f(p.resourceAlpha) : "0",
      );
      icons.forEach((icon, i) =>
        icon.setAttribute("opacity", i === p.resourceIndex ? "1" : "0"),
      );
      flap.setAttribute(
        "transform",
        `translate(269 185) scale(1 ${1 - 1.8 * p.bagOpen}) translate(-269 -185)`,
      );
      pen.setAttribute("transform", `translate(${p.penTip.x} ${p.penTip.y})`);
      // Lines are fixed on the paper; the pen tip walks along them.
      const length = LINE_X1 - LINE_X0;
      lines.forEach((line, i) => {
        line.setAttribute(
          "stroke-dashoffset",
          f(length * (1 - Math.min(1, Math.max(0, p.writingProgress - i)))),
        );
        line.setAttribute("opacity", f(p.lineFade));
      });
    }
    draw(media.matches ? STATIC_TIME[stage] : clock.current);
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
      else if (media.matches) draw(STATIC_TIME[stage]);
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
        <g data-rig="torso">
          <path
            d="M128 118Q164 104 201 118L195 210Q165 223 135 210Z"
            fill="#5271ff"
          />
          <path d="M151 101V119Q165 129 179 116V100" fill="#e9ac7c" />
          <path
            className="rig-backpack"
            d="M133 124Q126 158 139 190"
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
            <g data-rig="face">
              <g data-rig="eyes">
                <circle cx="155" cy="79" r="2.6" fill="#253047" />
                <circle cx="176" cy="79" r="2.6" fill="#253047" />
              </g>
              <path
                d="M172 83L178 88L172 90"
                stroke="#d69a70"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M158 95Q168 100 176 94"
                stroke="#b7744e"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>
        <g className="rig-open-book">
          <g transform="translate(165 0) scale(.845 1) translate(-165 0)">
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
          </g>
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
        <g className="rig-shelf" transform="translate(-16 31)">
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
            d={`M${LINE_X0} ${LINE_Y[0]}H${LINE_X1}`}
            stroke="#5271ff"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray={LINE_X1 - LINE_X0}
            strokeDashoffset={LINE_X1 - LINE_X0}
          />
          <path
            data-rig="line-1"
            d={`M${LINE_X0} ${LINE_Y[1]}H${LINE_X1}`}
            stroke="#5271ff"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray={LINE_X1 - LINE_X0}
            strokeDashoffset={LINE_X1 - LINE_X0}
          />
          <path
            data-rig="line-2"
            d={`M${LINE_X0} ${LINE_Y[2]}H${LINE_X1}`}
            stroke="#5271ff"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray={LINE_X1 - LINE_X0}
            strokeDashoffset={LINE_X1 - LINE_X0}
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
        <g transform="translate(-14 0)">
          {" "}
          <g data-rig="flap">
            <path
              d="M239 184Q269 173 299 184V207Q269 218 239 207Z"
              fill="#f8d789"
              stroke="#d99d3c"
              strokeWidth="2"
            />
          </g>
        </g>
        {(["left", "right"] as const).map((side) => (
          <g key={side}>
            <path
              data-rig={`${side}-arm-outline`}
              stroke="#d8a074"
              strokeWidth="13.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              data-rig={`${side}-arm`}
              stroke="#f3c49e"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {SLEEVE > 0 && (
              <>
                <path
                  data-rig={`${side}-sleeve`}
                  stroke="#5271ff"
                  strokeWidth="17"
                  strokeLinecap="butt"
                />
                <path
                  data-rig={`${side}-hem`}
                  stroke="#3c57dc"
                  strokeWidth="2.2"
                  strokeLinecap="butt"
                />
                <circle data-rig={`${side}-shoulder`} r="8.5" fill="#5271ff" />
              </>
            )}
          </g>
        ))}
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
        <g className="rig-bag" transform="translate(-14 0)">
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
        {(["left", "right"] as const).map((side) => (
          <g key={side} data-rig={`${side}-hand`}>
            <path
              d="M-4 -4.6Q4 -6.4 10 -3Q13 0 10 3.6Q4 6 -4 4.6Z"
              fill="#f3c49e"
              stroke="#d8a074"
              strokeWidth="1"
              strokeLinejoin="round"
            />
            <path
              d="M1 -4Q7 -8.5 11.5 -5.6"
              stroke="#f3c49e"
              strokeWidth="3.6"
              strokeLinecap="round"
            />
            <path
              d="M6 -1.2L11 -0.4M6 1.6L10.4 2.6"
              stroke="#d6966b"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>
      <span className="jc-caption">
        {
          [
            "Read the guide. Turn the page.",
            "Keep your guide. Pack your resources.",
            "Bring your learning to the desk.",
          ][stage]
        }
      </span>
    </div>
  );
}
