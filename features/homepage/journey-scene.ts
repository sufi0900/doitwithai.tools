// Three-dimensional geometry projected into SVG, with depth-sorted surfaces.
// No external model downloads or WebGL context are needed.
export type Vec = { x: number; y: number; z: number };
const v = (x: number, y: number, z: number): Vec => ({ x, y, z });
const add = (a: Vec, b: Vec) => v(a.x + b.x, a.y + b.y, a.z + b.z);
const sub = (a: Vec, b: Vec) => v(a.x - b.x, a.y - b.y, a.z - b.z);
const mul = (a: Vec, n: number) => v(a.x * n, a.y * n, a.z * n);
const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a: Vec, b: Vec) =>
  v(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
export const length = (a: Vec) => Math.sqrt(dot(a, a));
const unit = (a: Vec) => mul(a, 1 / (length(a) || 1));
const lerp = (a: Vec, b: Vec, t: number) => add(a, mul(sub(b, a), t));
const ease = (n: number) => {
  const t = Math.min(1, Math.max(0, n));
  return t * t * (3 - 2 * t);
};
const UPPER = 0.34,
  LOWER = 0.31;
export function joint(shoulder: Vec, hand: Vec, outward: number): Vec {
  const delta = sub(hand, shoulder),
    d = length(delta);
  const axis = unit(delta);
  // Elbows bend outward and slightly forward, never into the torso.
  const hint = v(outward * 0.25, -1, 0.45);
  const bend = unit(sub(hint, mul(axis, dot(hint, axis))));
  const along = (UPPER * UPPER - LOWER * LOWER + d * d) / (2 * d);
  return add(
    shoulder,
    add(
      mul(axis, along),
      mul(bend, Math.sqrt(Math.max(0, UPPER * UPPER - along * along))),
    ),
  );
}
export function scenePose(stage: number, seconds: number) {
  const breath = 0.003 * Math.sin(seconds * 1.8);
  const ls = v(-0.23, 1.31 + breath, 0.03),
    rs = v(0.23, 1.31 + breath, 0.03);
  let left = v(-0.2, 1.015, 0.38),
    right = v(0.22, 1.025, 0.4),
    page = 0,
    card = false,
    resource = right,
    closed = 0;
  let pen = v(0.2, 0.86, 0.49),
    ink = 0;
  if (stage === 0) {
    const t = seconds % 6;
    page = t < 2 ? 0 : t < 4 ? ease((t - 2) / 2) : 1;
    const angle = Math.PI * page;
    const corner = v(
      0.22 * Math.cos(angle),
      1.025 + 0.22 * Math.sin(angle),
      0.4,
    );
    right =
      t < 4
        ? corner
        : lerp(v(-0.22, 1.025, 0.4), v(0.22, 1.025, 0.4), ease((t - 4) / 1.4));
  } else if (stage === 1) {
    closed = ease(seconds / 0.9);
    left = lerp(
      v(-0.2, 1.015, 0.38),
      v(-0.18, 0.89, 0.43),
      ease((seconds - 0.9) / 0.6),
    );
    if (seconds < 0.9)
      right = v(
        0.22 * Math.cos(Math.PI * closed),
        1.025 + 0.22 * Math.sin(Math.PI * closed),
        0.4,
      );
    else {
      const t = Math.max(0, seconds - 1.5) % 4.6;
      const rest = v(0.26, 1.01, 0.28),
        pick = v(0.55, 1.12, 0.17),
        drop = v(0.55, 0.91, 0.27);
      if (seconds < 1.5)
        right = lerp(v(-0.22, 1.025, 0.4), rest, ease((seconds - 0.9) / 0.6));
      else if (t < 1) right = lerp(rest, pick, ease(t));
      else if (t < 1.45) right = pick;
      else if (t < 2.95) {
        const p = ease((t - 1.45) / 1.5);
        right = lerp(pick, drop, p);
        right.y += 0.07 * Math.sin(Math.PI * p);
      } else if (t < 3.35) right = drop;
      else right = lerp(drop, rest, ease((t - 3.35) / 1.25));
      card = seconds >= 1.5 && t >= 1 && t < 3.55;
      resource = t < 3.2 ? right : add(drop, v(0, -1.6 * (t - 3.2) ** 2, 0));
    }
  } else {
    left = v(-0.16, 0.89, 0.37);
    const t = seconds % 5.4,
      line = Math.min(2, Math.floor(t / 1.6)),
      phase = t - line * 1.6;
    if (t < 4.8) {
      const z = 0.43 + line * 0.045;
      const p = ease(phase / 1.15);
      pen = v(0.1 + 0.2 * p, 0.86, z);
      if (phase > 1.15) {
        const lift = ease((phase - 1.15) / 0.45);
        pen = lerp(
          v(0.3, 0.86, z),
          v(line < 2 ? 0.1 : 0.3, 0.86, line < 2 ? z + 0.045 : z),
          lift,
        );
        pen.y += 0.04 * Math.sin(Math.PI * lift);
      }
      ink = line + p;
    } else {
      const p = ease((t - 4.8) / 0.6);
      pen = lerp(v(0.3, 0.86, 0.52), v(0.1, 0.86, 0.43), p);
      pen.y += 0.04 * Math.sin(Math.PI * p);
      ink = 3;
    }
    right = add(pen, v(0.012, 0.082, -0.018));
  }
  return {
    ls,
    rs,
    left,
    right,
    le: joint(ls, left, -1),
    re: joint(rs, right, 1),
    page,
    closed,
    card,
    resource,
    pen,
    ink,
  };
}
type Face = {
  markup?: string;
  points: Vec[];
  color: string;
  depth: number;
};
const camera = unit(v(2.4, 1.7, 6)),
  screenX = unit(cross(v(0, 1, 0), camera)),
  screenY = cross(camera, screenX);
const light = unit(v(-3, 6, 5));
function shade(hex: string, n: number) {
  const c = parseInt(hex.slice(1), 16);
  return (
    "#" +
    [c >> 16, (c >> 8) & 255, c & 255]
      .map((x) =>
        Math.round(Math.min(255, x * n))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
export function renderScene(stage: number, seconds: number): string {
  const p = scenePose(stage, seconds),
    faces: Face[] = [];
  function face(points: Vec[], color: string) {
    const normal = unit(
      cross(sub(points[1], points[0]), sub(points[2], points[0])),
    );
    faces.push({
      points,
      color: shade(color, 0.72 + 0.28 * Math.abs(dot(normal, light))),
      depth: points.reduce((s, a) => s + dot(a, camera), 0) / points.length,
    });
  }
  function box(center: Vec, size: Vec, color: string) {
    const pts = Array.from({ length: 8 }, (_, i) =>
      add(
        center,
        v(
          ((i & 1 ? 1 : -1) * size.x) / 2,
          ((i & 2 ? 1 : -1) * size.y) / 2,
          ((i & 4 ? 1 : -1) * size.z) / 2,
        ),
      ),
    );
    for (const ids of [
      [0, 1, 3, 2],
      [4, 6, 7, 5],
      [0, 4, 5, 1],
      [2, 3, 7, 6],
      [0, 2, 6, 4],
      [1, 5, 7, 3],
    ])
      face(
        ids.map((i) => pts[i]),
        color,
      );
  }
  const gradients = new Set<string>();
  function sphere(c: Vec, r: Vec, color: string) {
    gradients.add(color);
    const rx =
      112 * Math.hypot(screenX.x * r.x, screenX.y * r.y, screenX.z * r.z);
    const ry =
      112 * Math.hypot(screenY.x * r.x, screenY.y * r.y, screenY.z * r.z);
    const [cx, cy] = project(c).split(",");
    faces.push({
      points: [],
      color,
      depth: dot(c, camera),
      markup: `<ellipse cx="${cx}" cy="${cy}" rx="${rx.toFixed(2)}" ry="${ry.toFixed(2)}" fill="url(#jc-${color.slice(1)})"/>`,
    });
  }
  function bone(a: Vec, b: Vec, r: number, color: string) {
    const axis = unit(sub(b, a)),
      u = unit(cross(axis, Math.abs(axis.y) < 0.9 ? v(0, 1, 0) : v(1, 0, 0))),
      w = cross(axis, u);
    const ring = (c: Vec, i: number) =>
      add(
        c,
        add(
          mul(u, r * Math.cos((i * Math.PI) / 5)),
          mul(w, r * Math.sin((i * Math.PI) / 5)),
        ),
      );
    for (let i = 0; i < 10; i++)
      face([ring(a, i), ring(b, i), ring(b, i + 1), ring(a, i + 1)], color);
    sphere(a, v(r, r, r), color);
    sphere(b, v(r, r, r), color);
  }
  const skin = "#f1bb91",
    blue = "#5271ff",
    navy = "#273751";
  // Chair, shoes and legs share a fixed seated pose in every scene.
  box(v(0, 0.57, 0.02), v(0.57, 0.07, 0.43), "#9aafe5");
  box(v(0, 0.97, -0.19), v(0.52, 0.66, 0.06), "#b5c9f3");
  for (const x of [-0.22, 0.22])
    for (const z of [-0.16, 0.18])
      bone(v(x, 0.55, z), v(x, 0.05, z), 0.025, "#899dcc");
  for (const x of [-0.145, 0.145]) {
    bone(v(x, 0.7, 0), v(x, 0.53, 0.35), 0.082, navy);
    bone(v(x, 0.53, 0.35), v(x, 0.14, 0.35), 0.065, navy);
    sphere(v(x, 0.08, 0.42), v(0.085, 0.065, 0.15), "#182943");
  }
  if (stage === 2) {
    box(v(0, 1.02, -0.19), v(0.45, 0.53, 0.17), "#e6af51");
    bone(v(-0.17, 1.28, 0.02), v(-0.19, 0.85, 0.07), 0.024, "#e7ba6b");
  }
  sphere(v(0, 1.01, 0), v(0.25, 0.34, 0.15), blue);
  bone(v(0, 1.3, 0), v(0, 1.43, 0), 0.075, skin);
  // Head has depth. Eye direction stays down toward the current activity.
  const breath = 0.003 * Math.sin(seconds * 1.8);
  const headPoint = (point: Vec) => {
    const a = 0.035 + 0.015 * Math.sin(seconds * 0.9),
      q = sub(point, v(0, 1.4, 0));
    return v(
      q.x,
      1.4 + q.y * Math.cos(a) - q.z * Math.sin(a) + breath,
      q.y * Math.sin(a) + q.z * Math.cos(a),
    );
  };
  const head = v(0, 1.63, 0.035);
  sphere(headPoint(head), v(0.19, 0.235, 0.17), skin);
  sphere(
    headPoint(add(head, v(0, 0.16, -0.025))),
    v(0.197, 0.105, 0.18),
    "#283347",
  );
  const blink = seconds % 5.1 > 3.8 && seconds % 5.1 < 3.96 ? 0.004 : 0.013;
  for (const x of [-0.065, 0.065])
    sphere(headPoint(v(x, 1.62, 0.195)), v(0.012, blink, 0.009), "#253047");
  sphere(headPoint(v(0, 1.565, 0.207)), v(0.024, 0.028, 0.023), skin);
  bone(
    headPoint(v(-0.032, 1.51, 0.179)),
    headPoint(v(0.034, 1.51, 0.179)),
    0.005,
    "#b87b59",
  );
  if (stage === 2) {
    box(v(0, 0.82, 0.46), v(0.98, 0.055, 0.65), "#e2bd94");
    for (const x of [-0.43, 0.43])
      for (const z of [0.19, 0.72])
        bone(v(x, 0.8, z), v(x, 0.03, z), 0.027, "#bd9268");
    box(v(0.21, 0.852, 0.48), v(0.36, 0.008, 0.26), "#ffffff");
    for (let i = 0; i < 3; i++) {
      const n = Math.min(1, Math.max(0, p.ink - i));
      if (n > 0)
        bone(
          v(0.1, 0.859, 0.43 + i * 0.045),
          v(0.1 + 0.2 * n, 0.859, 0.43 + i * 0.045),
          0.003,
          blue,
        );
    }
    box(v(-0.27, 0.86, 0.45), v(0.22, 0.05, 0.28), "#3d56b8");
    box(v(-0.27, 0.887, 0.45), v(0.2, 0.006, 0.26), "#f8f9ff");
  } else if (stage === 1 && seconds >= 0.9) {
    const c = lerp(
      v(-0.11, 1.01, 0.26),
      v(-0.18, 0.86, 0.32),
      ease((seconds - 0.9) / 0.6),
    );
    box(c, v(0.22, 0.042, 0.3), "#3d56b8");
    box(add(c, v(0, 0.012, 0)), v(0.2, 0.024, 0.28), "#f6f7ff");
    box(add(c, v(0, 0.027, 0)), v(0.22, 0.008, 0.3), blue);
  } else {
    box(v(-0.11, 1.005, 0.26), v(0.22, 0.024, 0.3), "#3d56b8");
    box(v(0.11, 1.005, 0.26), v(0.22, 0.024, 0.3), "#3d56b8");
    for (const x of [-0.11, 0.11])
      box(v(x, 1.021, 0.26), v(0.21, 0.005, 0.29), "#fffdfa");
    const angle = Math.PI * (stage === 1 ? p.closed : p.page),
      edge = v(0.22 * Math.cos(angle), 1.026 + 0.22 * Math.sin(angle), 0.4);
    face(
      [v(0, 1.027, 0.11), v(edge.x, edge.y, 0.11), edge, v(0, 1.027, 0.4)],
      "#f5f8ff",
    );
    for (const x of [-0.11, 0.11])
      for (let i = 0; i < 4; i++)
        bone(
          v(x - 0.07, 1.027, 0.16 + i * 0.05),
          v(x + 0.07, 1.027, 0.16 + i * 0.05),
          0.002,
          "#a9bce4",
        );
  }
  if (stage === 1) {
    box(v(0.57, 1.0, -0.02), v(0.3, 0.035, 0.31), "#a2b7e8");
    box(v(0.56, 1.12, 0.15), v(0.16, 0.22, 0.018), "#ffffff");
    box(v(0.55, 0.64, 0.22), v(0.3, 0.37, 0.25), "#efbd60");
    box(v(0.55, 0.82, 0.22), v(0.24, 0.012, 0.19), "#8d612d");
    box(v(0.55, 0.66, 0.352), v(0.21, 0.14, 0.018), "#ffedbc");
    // An open lid sits behind the opening, rather than intersecting the hand.
    box(v(0.55, 0.9, 0.1), v(0.3, 0.17, 0.025), "#f6d287");
    if (p.card)
      box(
        add(p.resource, v(0, -0.075, 0.004)),
        v(0.14, 0.16, 0.018),
        "#ffffff",
      );
  }
  if (stage === 1) {
    const center = v(0.55, 0.66, 0.368),
      [x, y] = project(center).split(",");
    faces.push({
      points: [],
      color: navy,
      depth: dot(center, camera) + 0.02,
      markup: `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial,sans-serif" font-size="4.3" font-weight="700" fill="#705022"><tspan x="${x}" dy="-2">FREE</tspan><tspan x="${x}" dy="5">RESOURCES</tspan></text>`,
    });
    if (p.card) {
      const c = add(p.resource, v(0, -0.075, 0.016)),
        [cx, cy] = project(c).split(",");
      const label = ["PROMPT", "VISUAL", "PDF", "VIDEO"][
        Math.floor(Math.max(0, seconds - 1.5) / 4.6) % 4
      ];
      faces.push({
        points: [],
        color: blue,
        depth: dot(c, camera) + 0.01,
        markup: `<text x="${cx}" y="${cy}" text-anchor="middle" font-family="Arial,sans-serif" font-size="4" font-weight="700" fill="#5271ff">${label}</text>`,
      });
    }
  }
  // Short sleeves anchor the arm at each shoulder.
  bone(p.ls, p.le, 0.048, skin);
  bone(p.le, p.left, 0.04, skin);
  bone(p.rs, p.re, 0.048, skin);
  bone(p.re, p.right, 0.04, skin);
  bone(p.ls, lerp(p.ls, p.le, 0.24), 0.063, blue);
  bone(p.rs, lerp(p.rs, p.re, 0.24), 0.063, blue);
  sphere(p.left, v(0.048, 0.027, 0.045), skin);
  if (stage === 2) {
    const top = add(p.pen, v(0.026, 0.19, -0.04));
    bone(p.pen, top, 0.007, "#e7aa43");
    bone(p.pen, add(p.pen, v(0.002, 0.017, -0.004)), 0.003, "#253047");
    sphere(p.right, v(0.044, 0.03, 0.039), skin);
    // Thumb and index wrap around the pencil shaft from opposing sides.
    const grip = add(p.pen, v(0.011, 0.08, -0.018));
    bone(
      add(grip, v(-0.033, 0.012, 0.025)),
      add(grip, v(0.002, 0.002, 0.008)),
      0.013,
      skin,
    );
    bone(
      add(grip, v(0.03, 0.023, -0.015)),
      add(grip, v(0.004, 0.01, 0.006)),
      0.012,
      skin,
    );
    bone(
      add(grip, v(0.025, -0.018, 0.005)),
      add(grip, v(0.003, -0.014, 0.012)),
      0.011,
      skin,
    );
  } else {
    sphere(p.right, v(0.041, 0.027, 0.043), skin);
    bone(
      add(p.right, v(-0.028, 0.01, 0.024)),
      add(p.right, v(0.01, -0.012, 0.027)),
      0.012,
      skin,
    );
  }
  function project(a: Vec) {
    const center = sub(a, v(0.14, 0.94, 0.12));
    return `${(180 + dot(center, screenX) * 112).toFixed(2)},${(144 - dot(center, screenY) * 112).toFixed(2)}`;
  }
  const ground =
    '<ellipse cx="174" cy="267" rx="112" ry="13" fill="#5271ff" opacity=".10"/>';
  return (
    `<defs>${[...gradients].map((c) => `<radialGradient id="jc-${c.slice(1)}" cx="32%" cy="24%" r="80%"><stop offset="0" stop-color="${shade(c, 1.08)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, 0.75)}"/></radialGradient>`).join("")}</defs>` +
    ground +
    faces
      .sort((a, b) => a.depth - b.depth)
      .map(
        (f) =>
          f.markup ||
          `<polygon points="${f.points.map(project).join(" ")}" fill="${f.color}" stroke="${f.color}" stroke-width=".35" stroke-linejoin="round"/>`,
      )
      .join("")
  );
}
