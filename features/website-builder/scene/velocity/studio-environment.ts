import * as THREE from "three";

interface Softbox { size: [number, number]; position: [number, number, number]; color: string; intensity: number }

/**
 * Procedural photo-studio reflection map (softbox strips + warm/cool kickers), pre-filtered with PMREM.
 * Built in code, so there is no HDRI download. It is assigned only to the car's materials, which keeps the
 * floor and scene props free of unwanted image-based lighting and gives per-material intensity control.
 */
const SOFTBOXES: Softbox[] = [
  { size: [16, 0.7], position: [0, 5.5, 1.6], color: "#eaf1ff", intensity: 3.2 },
  { size: [16, 0.7], position: [0, 5.5, -1.6], color: "#f4f7ff", intensity: 3.2 },
  { size: [10, 3.4], position: [0, 5.2, 0], color: "#b9cdea", intensity: 0.8 },
  { size: [11, 1.4], position: [-7, 2.2, -5], color: "#ff8a5c", intensity: 5 },
  { size: [11, 1.2], position: [7, 1.8, 5], color: "#9fd4ff", intensity: 4.2 },
  { size: [18, 1.2], position: [0, 1.4, -9], color: "#ffd9c0", intensity: 1.4 },
  { size: [8, 1.6], position: [9, 1.2, -1], color: "#ffffff", intensity: 1.6 },
  { size: [8, 1.6], position: [-9, 1.2, 3], color: "#ffffff", intensity: 1.4 },
];

export function buildStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#04060a");
  for (const box of SOFTBOXES) {
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(box.color).multiplyScalar(box.intensity), side: THREE.DoubleSide, toneMapped: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(box.size[0], box.size[1]), material);
    mesh.position.set(...box.position);
    mesh.lookAt(0, 0.5, 0);
    scene.add(mesh);
  }
  const generator = new THREE.PMREMGenerator(renderer);
  const target = generator.fromScene(scene, 0.015);
  generator.dispose();
  scene.traverse((object) => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); (object.material as THREE.Material).dispose(); } });
  return target.texture;
}
