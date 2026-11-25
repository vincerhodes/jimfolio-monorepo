import * as THREE from "three";
import type {
  EasterEggId,
  GarageStation,
  LightingMode,
  ShedHandle,
  StationHandle,
} from "../types";
import type { WorkshopTextures } from "./materials";

const CENTER_X = 12.6;
const ORANGE = "#fb923c";

function seededRandom(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

export function buildMattsShed(
  scene: THREE.Scene,
  station: GarageStation,
  textures?: WorkshopTextures,
): ShedHandle {
  const group = new THREE.Group();
  group.name = "matts-potting-shed";
  scene.add(group);

  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const ownedTextures = new Set<THREE.Texture>();
  const random = seededRandom(0x4d415454);
  const doorHitMeshes: THREE.Object3D[] = [];
  const easterEggHitMeshes: THREE.Object3D[] = [];

  const geometry = <T extends THREE.BufferGeometry>(value: T): T => {
    geometries.add(value);
    return value;
  };

  const material = <T extends THREE.Material>(value: T): T => {
    materials.add(value);
    return value;
  };

  const standard = (parameters: THREE.MeshStandardMaterialParameters): THREE.MeshStandardMaterial =>
    material(new THREE.MeshStandardMaterial(parameters));

  const basic = (parameters: THREE.MeshBasicMaterialParameters): THREE.MeshBasicMaterial =>
    material(new THREE.MeshBasicMaterial(parameters));

  const canvasTexture = (canvas: HTMLCanvasElement, srgb = true): THREE.CanvasTexture => {
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 4;
    ownedTextures.add(texture);
    return texture;
  };

  const makeCanvas = (width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("A 2D canvas context is required to build Matt's shed.");
    return [canvas, context];
  };

  const box = (
    parent: THREE.Object3D,
    size: [number, number, number],
    position: [number, number, number],
    meshMaterial: THREE.Material,
    rotation?: [number, number, number],
  ): THREE.Mesh => {
    const mesh = new THREE.Mesh(geometry(new THREE.BoxGeometry(...size)), meshMaterial);
    mesh.position.set(...position);
    if (rotation) mesh.rotation.set(...rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const cylinder = (
    parent: THREE.Object3D,
    radii: [number, number],
    height: number,
    position: [number, number, number],
    meshMaterial: THREE.Material,
    segments = 16,
    openEnded = false,
  ): THREE.Mesh => {
    const mesh = new THREE.Mesh(
      geometry(new THREE.CylinderGeometry(radii[0], radii[1], height, segments, 1, openEnded)),
      meshMaterial,
    );
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const sphere = (
    parent: THREE.Object3D,
    radius: number,
    position: [number, number, number],
    meshMaterial: THREE.Material,
    scale?: [number, number, number],
  ): THREE.Mesh => {
    const mesh = new THREE.Mesh(geometry(new THREE.SphereGeometry(radius, 16, 10)), meshMaterial);
    mesh.position.set(...position);
    if (scale) mesh.scale.set(...scale);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const plane = (
    parent: THREE.Object3D,
    size: [number, number],
    position: [number, number, number],
    meshMaterial: THREE.Material,
    rotation?: [number, number, number],
  ): THREE.Mesh => {
    const mesh = new THREE.Mesh(geometry(new THREE.PlaneGeometry(...size)), meshMaterial);
    mesh.position.set(...position);
    if (rotation) mesh.rotation.set(...rotation);
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const torus = (
    parent: THREE.Object3D,
    radius: number,
    tube: number,
    position: [number, number, number],
    meshMaterial: THREE.Material,
    rotation?: [number, number, number],
    arc = Math.PI * 2,
  ): THREE.Mesh => {
    const mesh = new THREE.Mesh(
      geometry(new THREE.TorusGeometry(radius, tube, 8, 32, arc)),
      meshMaterial,
    );
    mesh.position.set(...position);
    if (rotation) mesh.rotation.set(...rotation);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const beamBetween = (
    parent: THREE.Object3D,
    start: [number, number, number],
    end: [number, number, number],
    radius: number,
    meshMaterial: THREE.Material,
    segments = 10,
  ): THREE.Mesh => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const direction = b.clone().sub(a);
    const mesh = cylinder(parent, [radius, radius], direction.length(), [0, 0, 0], meshMaterial, segments);
    mesh.position.copy(a.add(b).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return mesh;
  };

  const line = (
    parent: THREE.Object3D,
    points: [number, number, number][],
    color: string,
    opacity = 1,
  ): THREE.Line => {
    const lineGeometry = geometry(new THREE.BufferGeometry().setFromPoints(
      points.map((point) => new THREE.Vector3(...point)),
    ));
    const lineMaterial = material(new THREE.LineBasicMaterial({
      color,
      transparent: opacity < 1,
      opacity,
      depthWrite: opacity >= 1,
    }));
    const mesh = new THREE.Line(lineGeometry, lineMaterial);
    parent.add(mesh);
    return mesh;
  };

  const label = (
    parent: THREE.Object3D,
    size: [number, number],
    position: [number, number, number],
    resolution: [number, number],
    painter: (context: CanvasRenderingContext2D, width: number, height: number) => void,
    rotation?: [number, number, number],
    lit = true,
  ): THREE.Mesh => {
    const [canvas, context] = makeCanvas(...resolution);
    painter(context, resolution[0], resolution[1]);
    const map = canvasTexture(canvas);
    map.wrapS = THREE.ClampToEdgeWrapping;
    map.wrapT = THREE.ClampToEdgeWrapping;
    const labelMaterial = lit
      ? standard({ map, roughness: 0.96, side: THREE.DoubleSide, transparent: true })
      : basic({ map, side: THREE.DoubleSide, transparent: true });
    return plane(parent, size, position, labelMaterial, rotation);
  };

  const paintedLabel = (
    parent: THREE.Object3D,
    text: string,
    size: [number, number],
    position: [number, number, number],
    options: {
      background?: string;
      foreground?: string;
      font?: string;
      rotation?: [number, number, number];
      resolution?: [number, number];
      border?: boolean;
      subtext?: string;
    } = {},
  ): THREE.Mesh => label(
    parent,
    size,
    position,
    options.resolution ?? [768, 256],
    (context, width, height) => {
      context.fillStyle = options.background ?? "#d7c59b";
      context.fillRect(0, 0, width, height);
      for (let index = 0; index < 1800; index += 1) {
        const alpha = random() * 0.09;
        context.fillStyle = `rgba(57,42,24,${alpha})`;
        context.fillRect(random() * width, random() * height, random() * 16 + 1, random() * 3 + 1);
      }
      if (options.border) {
        context.strokeStyle = "rgba(58,42,25,0.6)";
        context.lineWidth = 8;
        context.strokeRect(12, 12, width - 24, height - 24);
      }
      context.save();
      context.translate(width / 2, height / 2);
      context.rotate(-0.012);
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = options.foreground ?? "#342d20";
      context.font = options.font ?? `bold ${Math.floor(height * (options.subtext ? 0.29 : 0.35))}px cursive`;
      context.fillText(text, 0, options.subtext ? -height * 0.1 : 0, width * 0.93);
      if (options.subtext) {
        context.font = `bold ${Math.floor(height * 0.13)}px cursive`;
        context.fillText(options.subtext, 0, height * 0.25, width * 0.91);
      }
      context.restore();
    },
    options.rotation,
  );

  const [woodCanvas, woodContext] = makeCanvas(512, 512);
  const woodPixels = woodContext.createImageData(512, 512);
  const [bumpCanvas, bumpContext] = makeCanvas(512, 512);
  const bumpPixels = bumpContext.createImageData(512, 512);
  for (let y = 0; y < 512; y += 1) {
    for (let x = 0; x < 512; x += 1) {
      const index = (y * 512 + x) * 4;
      const board = Math.floor(x / 64);
      const seam = x % 64 < 3;
      const grain = Math.sin(x * 0.31 + Math.sin(y * 0.025) * 3 + board) * 9
        + Math.sin(x * 1.73 + y * 0.015) * 3;
      const stain = Math.max(0, Math.sin(x * 0.027 + board * 2) * 0.5 + 0.25)
        * Math.max(0, (y - 170) / 342) * 30;
      const moss = Math.max(0, Math.sin(x * 0.06) * Math.cos(y * 0.043) - 0.35) * 35;
      const knotX = (board + 0.52) * 64;
      const knotY = 95 + (board * 137) % 330;
      const knotDistance = Math.sqrt(((x - knotX) / 15) ** 2 + ((y - knotY) / 7) ** 2);
      const knot = knotDistance < 2 ? (2 - knotDistance) * 20 + Math.sin(knotDistance * 15) * 5 : 0;
      const value = 91 + grain - stain - knot + (board % 3) * 7 - (seam ? 42 : 0);
      woodPixels.data[index] = value + 8 - moss * 0.4;
      woodPixels.data[index + 1] = value + 10 + moss;
      woodPixels.data[index + 2] = value - 10 - moss * 0.5;
      woodPixels.data[index + 3] = 255;
      const bump = 128 + grain * 2 - knot - (seam ? 75 : 0);
      bumpPixels.data[index] = bump;
      bumpPixels.data[index + 1] = bump;
      bumpPixels.data[index + 2] = bump;
      bumpPixels.data[index + 3] = 255;
    }
  }
  woodContext.putImageData(woodPixels, 0, 0);
  bumpContext.putImageData(bumpPixels, 0, 0);
  const woodMap = canvasTexture(woodCanvas);
  const woodBump = canvasTexture(bumpCanvas, false);
  woodMap.repeat.set(2, 2);
  woodBump.repeat.set(2, 2);
  const timber = standard({
    map: woodMap,
    bumpMap: woodBump,
    bumpScale: 0.065,
    color: "#a4a58a",
    roughness: 0.98,
  });
  const darkTimber = standard({
    map: woodMap,
    bumpMap: woodBump,
    bumpScale: 0.055,
    color: "#625f49",
    roughness: 1,
  });
  const replacementTimber = standard({
    map: woodMap,
    bumpMap: woodBump,
    bumpScale: 0.04,
    color: "#b69b72",
    roughness: 0.94,
  });
  const rustyMetal = standard({ color: "#76503b", metalness: 0.62, roughness: 0.82 });
  const darkMetal = standard({ color: "#292b29", metalness: 0.72, roughness: 0.56 });
  const silverMetal = standard({ color: "#c5cbd0", metalness: 0.88, roughness: 0.3 });
  const brass = standard({ color: "#9b7735", metalness: 0.72, roughness: 0.43 });
  const terracotta = standard({ color: "#a95335", roughness: 0.94 });
  const terracottaLight = standard({ color: "#c8754d", roughness: 0.96 });
  const soil = standard({ color: "#29271b", roughness: 1 });
  const mossMaterial = standard({ color: "#304a25", roughness: 1 });
  const leafMaterial = standard({ color: "#274127", roughness: 0.96, side: THREE.DoubleSide });
  const cardboard = standard({ color: "#9a8057", roughness: 1 });
  const tape = standard({ color: "#c9b88b", roughness: 0.88 });
  const cream = standard({ color: "#d4cbb2", roughness: 0.85 });

  const [gravelCanvas, gravelContext] = makeCanvas(512, 512);
  gravelContext.fillStyle = "#686458";
  gravelContext.fillRect(0, 0, 512, 512);
  for (let index = 0; index < 11000; index += 1) {
    const tone = Math.floor(63 + random() * 72);
    gravelContext.fillStyle = `rgb(${tone + 6},${tone + 3},${tone - 4})`;
    const radius = random() * 2.3 + 0.3;
    gravelContext.beginPath();
    gravelContext.arc(random() * 512, random() * 512, radius, 0, Math.PI * 2);
    gravelContext.fill();
  }
  for (let index = 0; index < 20; index += 1) {
    const gradient = gravelContext.createRadialGradient(
      random() * 512, random() * 512, 0,
      random() * 512, random() * 512, 90,
    );
    gradient.addColorStop(0, "rgba(47,43,29,0.22)");
    gradient.addColorStop(1, "rgba(47,43,29,0)");
    gravelContext.fillStyle = gradient;
    gravelContext.fillRect(0, 0, 512, 512);
  }
  const gravelMap = canvasTexture(gravelCanvas);
  gravelMap.repeat.set(5, 4);
  const gravel = standard({
    map: textures?.concrete.map ?? gravelMap,
    bumpMap: textures?.concrete.bumpMap,
    bumpScale: 0.04,
    color: textures ? "#8a8270" : "#aaa18c",
    roughness: 1,
  });
  box(group, [12.5, 0.09, 10.6], [11.75, -0.055, 8.7], gravel);
  const mud = standard({ color: "#4b4734", roughness: 1 });
  for (let index = 0; index < 14; index += 1) {
    sphere(group, 0.6 + random() * 0.55, [6.1 + random() * 11.2, -0.002, 4.2 + random() * 9.1], mud, [1.5, 0.025, 0.65]);
  }
  const stone = standard({ color: "#8c8b7a", roughness: 0.98 });
  const steppingStones: [number, number, number][] = [
    [8.0, 0.035, 9.0], [8.8, 0.04, 7.9], [9.55, 0.035, 6.9],
    [10.4, 0.04, 6.0], [11.3, 0.04, 5.15], [12.25, 0.045, 4.25],
  ];
  steppingStones.forEach((position, index) => {
    const steppingStone = cylinder(group, [0.52, 0.57], 0.075, position, stone, 7);
    steppingStone.scale.z = 0.72 + (index % 2) * 0.15;
    steppingStone.rotation.y = index * 0.71;
  });

  const fence = new THREE.Group();
  fence.position.x = 7.3;
  fence.rotation.z = -0.045;
  group.add(fence);
  for (let index = 0; index < 6; index += 1) {
    const z = -3.45 + index * 1.55;
    box(fence, [0.18, 1.75 + (index % 2) * 0.1, 0.2], [0, 0.82, z], darkTimber, [0, 0, (index - 2) * 0.008]);
    const cap = cylinder(fence, [0, 0.15], 0.2, [0, 1.75 + (index % 2) * 0.05, z], darkTimber, 4);
    cap.rotation.y = Math.PI / 4;
  }
  box(fence, [0.13, 0.14, 7.95], [-0.07, 0.55, 0.42], darkTimber, [0.012, 0, 0]);
  box(fence, [0.13, 0.14, 7.95], [-0.07, 1.28, 0.42], darkTimber, [-0.009, 0, 0]);
  for (let index = 0; index < 25; index += 1) {
    if (index === 17) continue;
    const broken = index === 16;
    const height = broken ? 0.76 : 1.35 + random() * 0.22;
    const z = -3.35 + index * 0.315;
    const picket = box(
      fence,
      [0.1, height, 0.265],
      [0.06 + random() * 0.035, height / 2 + 0.16, z],
      index === 5 || index === 21 ? replacementTimber : timber,
      [0.02 * (random() - 0.5), 0, (random() - 0.5) * 0.065],
    );
    if (!broken) {
      const point = cylinder(fence, [0, 0.19], 0.22, [picket.position.x, height + 0.24, z], timber, 4);
      point.scale.x = 0.55;
      point.rotation.y = Math.PI / 4;
    }
  }
  for (let index = 0; index < 34; index += 1) {
    const z = -3.5 + random() * 8;
    const x = 7.12 + random() * 0.5;
    sphere(group, 0.13 + random() * 0.14, [x, 0.06, z], mossMaterial, [1.4, 0.45, 1]);
    for (let blade = 0; blade < 3; blade += 1) {
      const weed = plane(group, [0.045, 0.24 + random() * 0.26], [x, 0.17, z], leafMaterial, [0, random() * Math.PI, (random() - 0.5) * 0.6]);
      weed.castShadow = true;
    }
  }
  const tippedPot = new THREE.Group();
  tippedPot.position.set(7.82, 0.26, 3.55);
  tippedPot.rotation.set(0.25, 0.4, Math.PI / 2.25);
  group.add(tippedPot);
  cylinder(tippedPot, [0.29, 0.19], 0.48, [0, 0, 0], terracotta, 20, true);
  torus(tippedPot, 0.29, 0.035, [0, 0.24, 0], terracottaLight, [Math.PI / 2, 0, 0]);
  for (let index = 0; index < 12; index += 1) {
    sphere(group, 0.12 + random() * 0.13, [8.05 + random() * 0.9, 0.035, 3.3 + random() * 0.75], soil, [1.5, 0.2, 1]);
  }
  box(fence, [0.09, 0.55, 1.75], [0.13, 1.48, 3.65], replacementTimber, [0.02, 0, -0.08]);
  paintedLabel(fence, "MATT'S SHED →", [1.65, 0.43], [0.19, 1.5, 3.65], {
    background: "#8b805c",
    foreground: "#e4dbb5",
    font: "bold 76px cursive",
    rotation: [0, Math.PI / 2, -0.08],
  });

  const shed = new THREE.Group();
  group.add(shed);
  box(shed, [6.4, 0.12, 7.4], [CENTER_X, -0.02, -0.3], darkTimber);
  for (let index = 0; index < 17; index += 1) {
    const x = 9.48 + index * 0.39;
    box(shed, [0.365, 0.09, 7.18], [x, 0.075 + (index % 4) * 0.005, -0.3], index === 4 || index === 13 ? replacementTimber : darkTimber, [0, (index % 3 - 1) * 0.002, 0]);
  }
  box(shed, [6.35, 2.95, 0.14], [CENTER_X, 1.51, -3.96], darkTimber);
  box(shed, [0.14, 2.95, 7.25], [9.44, 1.51, -0.3], timber);
  box(shed, [0.14, 2.95, 7.25], [15.76, 1.51, -0.3], timber);
  for (let index = 0; index < 18; index += 1) {
    const y = 0.19 + index * 0.16;
    const boardMaterial = index === 5 || index === 12 ? replacementTimber : timber;
    box(shed, [0.11, 0.145, 7.38], [9.35, y, -0.3], boardMaterial, [0, 0, -0.005]);
    box(shed, [0.11, 0.145, 7.38], [15.85, y, -0.3], boardMaterial, [0, 0, 0.004]);
    box(shed, [6.52, 0.145, 0.09], [CENTER_X, y, -4.05], boardMaterial);
  }
  const frontSegments: [number, number, number][] = [
    [9.47, 11.84, 0], [13.36, 15.75, 0], [11.84, 13.36, 2.28],
  ];
  frontSegments.forEach(([start, end, bottom], segmentIndex) => {
    const count = Math.max(1, Math.ceil((end - start) / 0.25));
    for (let index = 0; index < count; index += 1) {
      const width = (end - start) / count;
      const height = 2.96 - bottom;
      box(shed, [width - 0.018, height, 0.12], [start + width * (index + 0.5), bottom + height / 2, 3.4], (index + segmentIndex) % 7 === 0 ? replacementTimber : timber, [0, 0, (random() - 0.5) * 0.012]);
    }
  });
  for (let index = 0; index < 5; index += 1) {
    box(shed, [0.17, 0.16, 0.16], [9.65 + index * 1.48, 2.96, 3.47], darkTimber);
  }

  const upperFrame = new THREE.Group();
  upperFrame.rotation.z = -0.022;
  shed.add(upperFrame);
  const studPositions: [number, number, number][] = [
    [9.55, 1.5, -3.78], [15.65, 1.5, -3.78], [9.55, 1.5, 3.2], [15.65, 1.5, 3.2],
    [10.85, 1.5, -3.8], [14.35, 1.5, -3.8],
  ];
  studPositions.forEach((position, index) => {
    box(upperFrame, [0.14, 2.9, 0.14], position, replacementTimber, [0, 0, (index - 2) * 0.004]);
  });
  box(upperFrame, [6.45, 0.17, 0.17], [CENTER_X, 2.91, -3.78], darkTimber);
  box(upperFrame, [6.45, 0.17, 0.17], [CENTER_X, 2.91, 3.2], darkTimber);
  for (let index = 0; index < 6; index += 1) {
    const z = -3.65 + index * 1.36;
    box(upperFrame, [6.55, 0.13, 0.15], [CENTER_X, 2.96, z], darkTimber, [0, 0, -0.035]);
  }

  const [roofCanvas, roofContext] = makeCanvas(512, 512);
  const roofImage = roofContext.createImageData(512, 512);
  for (let y = 0; y < 512; y += 1) {
    for (let x = 0; x < 512; x += 1) {
      const index = (y * 512 + x) * 4;
      const ridge = Math.sin(x * Math.PI / 16);
      const rust = Math.max(0, Math.sin(x * 0.037 + y * 0.021) + Math.cos(y * 0.055) - 0.45);
      const value = 100 + ridge * 20 - rust * 34 + (random() - 0.5) * 12;
      roofImage.data[index] = value + rust * 48;
      roofImage.data[index + 1] = value + 5 + rust * 10;
      roofImage.data[index + 2] = value + 8 - rust * 12;
      roofImage.data[index + 3] = 255;
    }
  }
  roofContext.putImageData(roofImage, 0, 0);
  const roofMap = canvasTexture(roofCanvas);
  roofMap.repeat.set(2, 3);
  const roofMaterial = standard({ map: roofMap, metalness: 0.66, roughness: 0.73 });
  const roof = new THREE.Group();
  roof.position.set(CENTER_X, 3.24, -0.3);
  roof.rotation.z = -0.055;
  upperFrame.add(roof);
  box(roof, [6.9, 0.095, 7.9], [0, 0, 0], roofMaterial);
  for (let index = 0; index < 34; index += 1) {
    const z = -3.82 + index * 0.232;
    beamBetween(roof, [-3.42, 0.066, z], [3.42, 0.066, z], 0.025, roofMaterial, 8);
  }
  const patch = box(roof, [1.15, 0.035, 1.0], [1.1, 0.12, -0.65], silverMetal, [0, 0.13, 0.045]);
  for (const [x, z] of [[0.62, -1.02], [1.57, -1.02], [0.62, -0.28], [1.57, -0.28]]) {
    cylinder(patch, [0.035, 0.035], 0.035, [x - 1.1, 0.04, z + 0.65], darkMetal, 10);
  }
  for (let index = 0; index < 24; index += 1) {
    sphere(roof, 0.1 + random() * 0.16, [-3 + random() * 5.8, 0.12, -3.7 + random() * 7.3], mossMaterial, [1.6, 0.25, 1]);
  }
  const gutterPoints: THREE.Vector3[] = [];
  for (let index = 0; index <= 12; index += 1) {
    const z = -4.1 + index * 0.65;
    gutterPoints.push(new THREE.Vector3(15.99, 2.79 - Math.sin(index / 12 * Math.PI) * 0.17, z));
  }
  const gutter = new THREE.Mesh(
    geometry(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(gutterPoints), 48, 0.075, 8, false)),
    rustyMetal,
  );
  upperFrame.add(gutter);
  beamBetween(upperFrame, [15.99, 2.72, 3.55], [16.03, 1.95, 3.61], 0.065, rustyMetal);
  beamBetween(upperFrame, [16.03, 1.95, 3.61], [15.92, 1.78, 3.82], 0.065, rustyMetal);

  const doorPivot = new THREE.Group();
  doorPivot.position.set(11.875, 0.06, 3.49);
  shed.add(doorPivot);
  const doorMaterial = standard({
    map: woodMap,
    bumpMap: woodBump,
    bumpScale: 0.06,
    color: "#77785a",
    roughness: 0.98,
    emissive: "#6b3d16",
    emissiveIntensity: 0,
  });
  for (let index = 0; index < 6; index += 1) {
    const plank = box(doorPivot, [0.235, 2.18 - (index % 3) * 0.012, 0.12], [0.125 + index * 0.24, 1.09, 0], index === 4 ? replacementTimber : doorMaterial, [0, 0, (index - 2) * 0.003]);
    doorHitMeshes.push(plank);
  }
  doorHitMeshes.push(box(doorPivot, [1.4, 0.14, 0.12], [0.72, 0.35, 0.1], darkTimber, [0, 0, 0.12]));
  doorHitMeshes.push(box(doorPivot, [1.4, 0.14, 0.12], [0.72, 1.75, 0.1], darkTimber, [0, 0, -0.09]));
  doorHitMeshes.push(box(doorPivot, [1.4, 0.13, 0.11], [0.72, 1.05, 0.11], darkTimber, [0, 0, -0.55]));
  for (const y of [0.43, 1.72]) {
    box(doorPivot, [0.55, 0.075, 0.035], [0.29, y, 0.16], rustyMetal);
    const hinge = cylinder(doorPivot, [0.045, 0.045], 0.22, [0.025, y, 0.17], rustyMetal, 10);
    hinge.rotation.z = 0.04;
  }
  const handle = torus(doorPivot, 0.09, 0.018, [1.2, 1.02, 0.18], brass, [0, 0, 0.15], Math.PI * 1.55);
  doorHitMeshes.push(handle);
  const doorNote = paintedLabel(doorPivot, "PUSH HARD — STICKS", [0.88, 0.31], [0.73, 1.42, 0.19], {
    background: "#c5b68d",
    foreground: "#41392b",
    font: "bold 55px cursive",
    rotation: [0, 0, -0.055],
  });
  doorHitMeshes.push(doorNote);
  box(doorPivot, [0.26, 0.07, 0.015], [0.73, 1.58, 0.2], tape, [0, 0, 0.08]);
  const sign = new THREE.Group();
  sign.position.set(12.68, 2.56, 3.64);
  sign.rotation.z = 0.055;
  shed.add(sign);
  box(sign, [3.25, 0.63, 0.1], [0, 0, 0], darkTimber);
  paintedLabel(sign, "MATT'S POTTING SHED", [3.14, 0.55], [0, 0, 0.058], {
    background: "#787452",
    foreground: "#eee2b9",
    font: "bold 78px cursive",
    subtext: '"WORK IN PROGRESS (SINCE 2024)"',
    resolution: [1400, 360],
    border: true,
  });
  cylinder(sign, [0.025, 0.025], 0.05, [-1.35, 0.25, 0.09], rustyMetal, 8).rotation.x = Math.PI / 2;

  const windowGroup = new THREE.Group();
  windowGroup.position.set(10.48, 1.64, 3.49);
  windowGroup.rotation.z = -0.018;
  shed.add(windowGroup);
  const windowGlow = standard({
    color: "#d7b36c",
    emissive: "#ff9d42",
    emissiveIntensity: 0.72,
    roughness: 0.45,
    transparent: true,
    opacity: 0.82,
  });
  plane(windowGroup, [1.45, 1.18], [0, 0, -0.025], windowGlow);
  const dustyGlass = standard({ color: "#b7b499", transparent: true, opacity: 0.28, roughness: 0.9, side: THREE.DoubleSide });
  plane(windowGroup, [1.43, 1.16], [0, 0, 0.015], dustyGlass);
  box(windowGroup, [1.65, 0.12, 0.14], [0, 0.64, 0.06], darkTimber, [0, 0, 0.025]);
  box(windowGroup, [1.65, 0.13, 0.18], [0, -0.64, 0.09], darkTimber, [0, 0, -0.02]);
  box(windowGroup, [0.12, 1.35, 0.14], [-0.78, 0, 0.06], darkTimber);
  box(windowGroup, [0.12, 1.35, 0.14], [0.78, 0, 0.06], darkTimber, [0, 0, 0.025]);
  box(windowGroup, [0.07, 1.2, 0.09], [0.04, 0, 0.09], replacementTimber, [0, 0, -0.055]);
  box(windowGroup, [1.45, 0.07, 0.09], [0, -0.03, 0.09], replacementTimber, [0, 0, 0.035]);
  line(windowGroup, [[0.3, 0.52, 0.04], [0.18, 0.26, 0.045], [0.28, 0.08, 0.045], [0.11, -0.14, 0.045], [0.15, -0.42, 0.045]], "#ded9bd", 0.72);
  line(windowGroup, [[0.18, 0.26, 0.045], [-0.06, 0.15, 0.045], [-0.25, 0.2, 0.045]], "#ded9bd", 0.65);
  line(windowGroup, [[0.11, -0.14, 0.045], [0.38, -0.25, 0.045], [0.51, -0.2, 0.045]], "#ded9bd", 0.65);

  const lanternMaterial = standard({ color: "#ffc46d", emissive: "#ff9b3d", emissiveIntensity: 0.5 });
  box(shed, [0.26, 0.38, 0.22], [13.72, 2.05, 3.57], darkMetal);
  sphere(shed, 0.095, [13.72, 2.05, 3.71], lanternMaterial, [0.8, 1.25, 0.65]);
  const lanternLight = new THREE.PointLight("#ffad55", 0.35, 4.2, 2);
  lanternLight.position.set(13.72, 2.05, 3.95);
  shed.add(lanternLight);

  const shelfGroup = new THREE.Group();
  shed.add(shelfGroup);
  const makeBench = (x: number, z: number, width: number, depth: number): THREE.Group => {
    const bench = new THREE.Group();
    bench.position.set(x, 0, z);
    shelfGroup.add(bench);
    box(bench, [width, 0.12, depth], [0, 0.88, 0], textures ? standard({ map: textures.butcherBlock.map, bumpMap: textures.butcherBlock.bumpMap, bumpScale: 0.035, color: "#82755a", roughness: 0.98 }) : darkTimber);
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        box(bench, [0.12, 0.86, 0.12], [sx * (width / 2 - 0.13), 0.43, sz * (depth / 2 - 0.12)], darkTimber, [0, 0, sx * 0.018]);
      }
    }
    box(bench, [width - 0.15, 0.09, 0.09], [0, 0.3, -depth / 2 + 0.1], darkTimber);
    return bench;
  };
  makeBench(10.35, -0.65, 1.65, 1.25);
  makeBench(14.75, -0.65, 1.45, 1.2);
  makeBench(10.45, -2.85, 1.85, 0.8);
  for (const x of [9.65, 10.95]) {
    box(shelfGroup, [0.11, 2.05, 0.11], [x, 1.2, -1.65], darkTimber, [0, 0, x < 10 ? -0.025 : 0.018]);
  }
  for (let level = 0; level < 3; level += 1) {
    box(shelfGroup, [1.55, 0.09, 0.54], [10.28, 1.18 + level * 0.58, -1.65], level === 2 ? replacementTimber : darkTimber, [0, 0, level === 1 ? -0.028 : 0.008]);
  }
  for (const z of [-2.9, -1.65, -0.4]) {
    box(shelfGroup, [0.1, 2.15, 0.1], [15.25, 1.18, z], darkTimber, [0, 0, 0.015]);
  }
  for (let level = 0; level < 4; level += 1) {
    for (let slat = 0; slat < 4; slat += 1) {
      box(shelfGroup, [0.17, 0.065, 2.75], [14.72 + slat * 0.18, 0.58 + level * 0.53, -1.65], darkTimber, [0, 0, level === 2 ? -0.02 : 0]);
    }
  }
  for (const y of [1.4, 2.15]) {
    box(shelfGroup, [4.4, 0.17, 0.08], [12.6, y, -3.82], replacementTimber, [0, 0, y > 2 ? 0.012 : -0.01]);
    for (let index = 0; index < 9; index += 1) {
      const peg = cylinder(shelfGroup, [0.018, 0.018], 0.13, [10.7 + index * 0.47, y, -3.7], rustyMetal, 8);
      peg.rotation.x = Math.PI / 2;
    }
  }

  paintedLabel(shelfGroup, "MATT'S BIG APP (TBD)", [1.2, 0.32], [10.45, 1.14, -2.41], {
    background: "#c7b989", font: "bold 57px cursive", rotation: [0, 0, -0.04],
  });
  const breadboard = standard({ color: "#ddd4b7", roughness: 0.8 });
  box(shelfGroup, [0.55, 0.045, 0.3], [10.42, 0.99, -2.78], breadboard, [0, 0.16, 0]);
  for (let index = 0; index < 12; index += 1) {
    sphere(shelfGroup, 0.008, [10.2 + (index % 6) * 0.075, 1.017, -2.87 + Math.floor(index / 6) * 0.14], darkMetal);
  }
  const wireColors = ["#b63b32", "#d3a72c", "#315b80", "#30302b"];
  for (let index = 0; index < 7; index += 1) {
    const points: THREE.Vector3[] = [];
    for (let point = 0; point < 8; point += 1) {
      points.push(new THREE.Vector3(10.12 + point * 0.09, 1.02 + Math.sin(point * 1.4 + index) * 0.04, -2.9 + index * 0.035 + Math.cos(point + index) * 0.05));
    }
    const wire = new THREE.Mesh(
      geometry(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 28, 0.008, 5, false)),
      standard({ color: wireColors[index % wireColors.length], roughness: 0.7 }),
    );
    shelfGroup.add(wire);
  }
  paintedLabel(shelfGroup, "DOMAIN BOUGHT, NO CODE", [1.04, 0.3], [10.28, 1.43, -1.36], {
    background: "#d6cd75", foreground: "#4a4326", font: "bold 53px cursive", rotation: [0, 0, 0.045],
  });
  paintedLabel(shelfGroup, "WIP — NEEDS CSS", [0.94, 0.29], [15.12, 1.86, -0.23], {
    background: "#d2a9ae", foreground: "#51383a", font: "bold 62px cursive", rotation: [0, -0.18, -0.07],
  });

  const mugMaterial = standard({ color: "#b8b49d", roughness: 0.8 });
  const makeMug = (parent: THREE.Object3D, position: [number, number, number], scale = 1): THREE.Group => {
    const mug = new THREE.Group();
    mug.position.set(...position);
    mug.scale.setScalar(scale);
    parent.add(mug);
    cylinder(mug, [0.105, 0.09], 0.22, [0, 0.11, 0], mugMaterial, 18, true);
    cylinder(mug, [0.088, 0.088], 0.012, [0, 0.205, 0], standard({ color: "#34261b", roughness: 0.55 }), 18);
    torus(mug, 0.075, 0.018, [0.1, 0.12, 0], mugMaterial, [0, 0, 0], Math.PI * 1.75);
    return mug;
  };
  makeMug(shelfGroup, [14.95, 1.66, -2.15], 0.9);
  paintedLabel(shelfGroup, "HALF-FINISHED THING #3", [1.1, 0.31], [14.94, 1.52, -2.42], {
    background: "#c8b990", font: "bold 50px cursive", rotation: [0, 0, 0.025],
  });

  const gallery = new THREE.Group();
  gallery.position.set(15.64, 1.93, -1.65);
  gallery.rotation.set(0, -Math.PI / 2, -0.045);
  shelfGroup.add(gallery);
  box(gallery, [1.65, 1.1, 0.08], [0, 0, -0.035], darkTimber);
  label(gallery, [1.52, 0.98], [0, 0, 0.012], [900, 600], (context, width, height) => {
    context.fillStyle = "#aa9670";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#4a3c2a";
    context.lineWidth = 8;
    context.strokeRect(10, 10, width - 20, height - 20);
    context.fillStyle = "#382f22";
    context.textAlign = "center";
    context.font = "bold 47px cursive";
    context.fillText("SHIPPED: 1 (JOINT CUSTODY)", width / 2, 75);
    for (let index = 0; index < 4; index += 1) {
      const x = 80 + (index % 2) * 410;
      const y = 120 + Math.floor(index / 2) * 225;
      context.setLineDash([18, 13]);
      context.lineWidth = 5;
      context.strokeRect(x, y, 330, 175);
      context.setLineDash([]);
      context.font = "bold 45px cursive";
      context.fillText("TBD", x + 165, y + 102);
    }
  });
  const nail = cylinder(gallery, [0.025, 0.025], 0.12, [0, 0.64, 0], rustyMetal, 8);
  nail.rotation.x = Math.PI / 2;

  const cobwebMaterial = material(new THREE.LineBasicMaterial({ color: "#d8d7c4", transparent: true, opacity: 0.24, depthWrite: false }));
  const makeCobweb = (origin: [number, number, number], flip: number): void => {
    const web = new THREE.Group();
    web.position.set(...origin);
    web.scale.x = flip;
    shed.add(web);
    for (let ray = 0; ray < 7; ray += 1) {
      const angle = ray / 6 * Math.PI / 2;
      const webGeometry = geometry(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle) * 0.75, -Math.sin(angle) * 0.65, 0),
      ]));
      web.add(new THREE.Line(webGeometry, cobwebMaterial));
    }
    for (let ring = 1; ring <= 4; ring += 1) {
      const points: THREE.Vector3[] = [];
      for (let segment = 0; segment <= 18; segment += 1) {
        const angle = segment / 18 * Math.PI / 2;
        points.push(new THREE.Vector3(Math.cos(angle) * ring * 0.18, -Math.sin(angle) * ring * 0.155, 0));
      }
      web.add(new THREE.Line(geometry(new THREE.BufferGeometry().setFromPoints(points)), cobwebMaterial));
    }
  };
  makeCobweb([9.62, 2.77, 3.24], 1);
  makeCobweb([15.58, 2.77, 3.24], -1);
  makeCobweb([9.62, 2.77, -3.77], 1);

  const dustPositions = new Float32Array(180 * 3);
  for (let index = 0; index < 180; index += 1) {
    dustPositions[index * 3] = 9.7 + random() * 5.8;
    dustPositions[index * 3 + 1] = 0.25 + random() * 2.5;
    dustPositions[index * 3 + 2] = -3.7 + random() * 6.6;
  }
  const dustGeometry = geometry(new THREE.BufferGeometry());
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = material(new THREE.PointsMaterial({ color: "#d6c9a0", size: 0.018, transparent: true, opacity: 0.38, depthWrite: false }));
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  shed.add(dust);

  const cordPoints = [
    new THREE.Vector3(CENTER_X, 2.96, -0.4),
    new THREE.Vector3(CENTER_X + 0.035, 2.83, -0.39),
    new THREE.Vector3(CENTER_X - 0.025, 2.7, -0.41),
    new THREE.Vector3(CENTER_X, 2.58, -0.4),
  ];
  const cord = new THREE.Mesh(
    geometry(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cordPoints), 24, 0.012, 6, false)),
    darkMetal,
  );
  shed.add(cord);
  cylinder(shed, [0.07, 0.055], 0.12, [CENTER_X, 2.57, -0.4], darkMetal, 14);
  const bulbMaterial = standard({ color: "#ffe0a0", emissive: "#ffae54", emissiveIntensity: 2.2, roughness: 0.2 });
  sphere(shed, 0.09, [CENTER_X, 2.46, -0.4], bulbMaterial, [0.82, 1.15, 0.82]);
  const bulbLight = new THREE.PointLight("#ffb35e", 1.25, 7.5, 2);
  bulbLight.position.set(CENTER_X, 2.44, -0.4);
  bulbLight.castShadow = true;
  bulbLight.shadow.mapSize.set(512, 512);
  shed.add(bulbLight);
  const interiorFill = new THREE.PointLight("#ffd498", 0.12, 8, 2);
  interiorFill.position.set(CENTER_X, 1.8, 0.5);
  shed.add(interiorFill);

  const tagEgg = (object: THREE.Object3D, id: EasterEggId): void => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData.easterEggId = id;
        easterEggHitMeshes.push(child);
      }
    });
  };

  const bucket = new THREE.Group();
  bucket.position.set(11, 0.08, 0.3);
  shed.add(bucket);
  const bucketGeometry = geometry(new THREE.CylinderGeometry(0.31, 0.25, 0.48, 28, 5, true));
  const bucketPositions = bucketGeometry.getAttribute("position");
  for (let index = 0; index < bucketPositions.count; index += 1) {
    const x = bucketPositions.getX(index);
    const y = bucketPositions.getY(index);
    const z = bucketPositions.getZ(index);
    const angle = Math.atan2(z, x);
    const dent = 1 - Math.max(0, Math.cos(angle - 0.7)) ** 12 * (0.09 + (y + 0.24) * 0.08);
    bucketPositions.setXYZ(index, x * dent, y, z * dent);
  }
  bucketGeometry.computeVertexNormals();
  const bucketMaterial = standard({ color: "#929b98", metalness: 0.78, roughness: 0.48, side: THREE.DoubleSide });
  const bucketBody = new THREE.Mesh(bucketGeometry, bucketMaterial);
  bucketBody.position.y = 0.24;
  bucketBody.castShadow = true;
  bucket.add(bucketBody);
  cylinder(bucket, [0.245, 0.245], 0.025, [0, 0.015, 0], bucketMaterial, 28);
  torus(bucket, 0.31, 0.022, [0, 0.48, 0], silverMetal, [Math.PI / 2, 0, 0]);
  torus(bucket, 0.36, 0.015, [0, 0.45, 0], darkMetal, [0, 0, 0], Math.PI);
  const waterMaterial = standard({ color: "#4e6b68", metalness: 0.1, roughness: 0.2, transparent: true, opacity: 0.82 });
  cylinder(bucket, [0.272, 0.272], 0.012, [0, 0.36, 0], waterMaterial, 32);
  const dropletMaterial = standard({ color: "#a9d2d0", emissive: "#416e72", emissiveIntensity: 0.25, transparent: true, opacity: 0.85, roughness: 0.05 });
  const droplet = sphere(shed, 0.025, [11, 2.4, 0.3], dropletMaterial, [0.72, 1.6, 0.72]);
  const splashMaterial = basic({ color: "#a7d6d0", transparent: true, opacity: 0, depthWrite: false });
  const splashRing = torus(bucket, 0.09, 0.008, [0, 0.38, 0], splashMaterial, [Math.PI / 2, 0, 0]);
  tagEgg(bucket, "bucket");
  let splashPulse = 0;

  const flowerpots = new THREE.Group();
  flowerpots.position.set(10.2, 0.95, -0.2);
  shed.add(flowerpots);
  const potSpecs: [number, number, number, number][] = [
    [0, 0, 0, 0.23], [0.035, 0.32, 0.015, 0.2], [-0.025, 0.59, 0, 0.17],
  ];
  potSpecs.forEach(([x, y, z, radius], index) => {
    const pot = new THREE.Group();
    pot.position.set(x, y, z);
    pot.rotation.z = index === 2 ? 0.12 : index === 1 ? -0.06 : 0;
    flowerpots.add(pot);
    cylinder(pot, [radius, radius * 0.67], 0.31, [0, 0.155, 0], index === 1 ? terracottaLight : terracotta, 20, true);
    torus(pot, radius, 0.026, [0, 0.31, 0], terracottaLight, [Math.PI / 2, 0, 0]);
    cylinder(pot, [radius * 0.66, radius * 0.66], 0.025, [0, 0.015, 0], terracotta, 20);
  });
  tagEgg(flowerpots, "flowerpot");
  let flowerpotWobble = 0;

  const tbdBox = new THREE.Group();
  tbdBox.position.set(14.8, 0.95, -0.6);
  shed.add(tbdBox);
  box(tbdBox, [0.85, 0.52, 0.68], [0, 0.26, 0], cardboard, [0, 0, -0.018]);
  box(tbdBox, [0.08, 0.54, 0.7], [0.06, 0.27, 0], tape, [0, 0, -0.018]);
  const boxLid = new THREE.Group();
  boxLid.position.set(0, 0.52, -0.34);
  tbdBox.add(boxLid);
  box(boxLid, [0.9, 0.055, 0.72], [0, 0, 0.34], cardboard, [0.025, 0, 0.025]);
  box(boxLid, [0.1, 0.06, 0.73], [0.06, 0.015, 0.34], tape);
  const boxLabel = paintedLabel(tbdBox, "COMING SOON (2024)", [0.72, 0.25], [0, 0.3, 0.35], {
    background: "#c7b78a", foreground: "#4b3d28", font: "bold 56px cursive", rotation: [0, 0, -0.035],
  });
  box(tbdBox, [0.22, 0.06, 0.015], [0, 0.445, 0.36], tape, [0, 0, 0.09]);
  tagEgg(tbdBox, "tbd-box");
  let boxJiggle = 0;

  const stationGroup = new THREE.Group();
  stationGroup.name = `station-${station.id}`;
  stationGroup.position.set(...station.anchorPosition);
  shed.add(stationGroup);
  const stationHitMeshes: THREE.Object3D[] = [];
  const benchWood = textures
    ? standard({ map: textures.butcherBlock.map, bumpMap: textures.butcherBlock.bumpMap, bumpScale: 0.04, color: "#8b7958", roughness: 0.94 })
    : darkTimber;
  box(stationGroup, [3.35, 0.13, 1.25], [0, -0.065, -0.05], benchWood, [0, 0, -0.008]);
  for (const x of [-1.47, 1.47]) {
    for (const z of [-0.48, 0.4]) {
      box(stationGroup, [0.14, 0.89, 0.14], [x, -0.51, z], darkTimber, [0, 0, x * 0.008]);
    }
  }
  box(stationGroup, [3.05, 0.1, 0.1], [0, -0.66, -0.46], darkTimber);
  const mixerBody = standard({ color: "#303438", metalness: 0.45, roughness: 0.48 });
  const mixer = new THREE.Group();
  mixer.position.set(-0.18, 0.06, 0.12);
  mixer.rotation.x = -0.08;
  stationGroup.add(mixer);
  box(mixer, [1.05, 0.16, 0.7], [0, 0, 0], mixerBody);
  const sliderTrack = standard({ color: "#101315", roughness: 0.65 });
  const knobMaterial = standard({ color: "#b8b5a9", metalness: 0.28, roughness: 0.5 });
  for (let index = 0; index < 5; index += 1) {
    const x = -0.4 + index * 0.2;
    box(mixer, [0.025, 0.012, 0.3], [x, 0.09, 0.1], sliderTrack);
    box(mixer, [0.095, 0.045, 0.055], [x, 0.12, 0.02 + (index % 3) * 0.075], knobMaterial);
    const knob = cylinder(mixer, [0.045, 0.05], 0.045, [x, 0.11, -0.22], knobMaterial, 14);
    box(knob, [0.009, 0.025, 0.035], [0, 0.025, -0.025], darkMetal);
  }
  const vuLeds: THREE.MeshStandardMaterial[] = [];
  const vuColors = ["#54d66b", "#54d66b", "#e6bd45", "#e6bd45", "#e34f43"];
  for (let row = 0; row < 2; row += 1) {
    for (let index = 0; index < 5; index += 1) {
      const ledMaterial = standard({ color: vuColors[index], emissive: vuColors[index], emissiveIntensity: 0.25, roughness: 0.35 });
      vuLeds.push(ledMaterial);
      box(mixer, [0.055, 0.025, 0.035], [-0.43 + index * 0.08, 0.105, -0.02 + row * 0.07], ledMaterial);
    }
  }

  const onAir = new THREE.Group();
  onAir.position.set(-0.3, 0.42, -0.47);
  onAir.rotation.z = -0.018;
  stationGroup.add(onAir);
  box(onAir, [0.82, 0.3, 0.16], [0, 0, 0], darkMetal);
  const onAirMaterial = standard({ color: "#e24836", emissive: "#ff2418", emissiveIntensity: 1.9, roughness: 0.38 });
  box(onAir, [0.72, 0.22, 0.025], [0, 0, 0.09], onAirMaterial);
  paintedLabel(onAir, "ON AIR", [0.65, 0.18], [0, 0, 0.108], {
    background: "#c92f23", foreground: "#ffe0c5", font: "bold 96px monospace", resolution: [640, 200],
  });

  const laptop = new THREE.Group();
  laptop.position.set(0.95, 0.025, 0.08);
  laptop.rotation.y = -0.12;
  stationGroup.add(laptop);
  const laptopMaterial = standard({ color: "#777c7d", metalness: 0.75, roughness: 0.35 });
  box(laptop, [1.02, 0.055, 0.72], [0, 0.03, 0.13], laptopMaterial);
  box(laptop, [0.84, 0.008, 0.43], [0, 0.063, 0.07], darkMetal);
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 10; column += 1) {
      box(laptop, [0.061, 0.008, 0.055], [-0.32 + column * 0.071, 0.07, -0.07 + row * 0.068], knobMaterial);
    }
  }
  box(laptop, [0.3, 0.008, 0.16], [0, 0.068, 0.34], standard({ color: "#929795", metalness: 0.55, roughness: 0.4 }));
  const screen = new THREE.Group();
  screen.position.set(0, 0.07, -0.22);
  screen.rotation.x = -0.13;
  laptop.add(screen);
  box(screen, [1.02, 0.68, 0.045], [0, 0.34, 0], laptopMaterial);
  label(screen, [0.91, 0.57], [0, 0.35, 0.026], [768, 512], (context, width, height) => {
    context.fillStyle = "#11191c";
    context.fillRect(0, 0, width, height);
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(251,146,60,0.12)");
    gradient.addColorStop(1, "rgba(18,38,42,0.2)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#fb923c";
    context.font = "bold 27px monospace";
    context.fillText("PREPARING FOR AI // RECORDING EP.", 38, 60);
    context.fillStyle = "#e9e2d1";
    context.font = "bold 50px sans-serif";
    context.fillText("MATT + JIM", 38, 135);
    context.strokeStyle = "#fb923c";
    context.lineWidth = 5;
    context.beginPath();
    for (let x = 35; x < width - 35; x += 4) {
      const envelope = Math.sin((x / width) * Math.PI) * 0.75 + 0.25;
      const y = 300 + Math.sin(x * 0.075) * Math.sin(x * 0.019) * 95 * envelope;
      if (x === 35) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
    context.fillStyle = "#73898a";
    context.font = "22px monospace";
    context.fillText("00:47:23   •   HUMANITY, WITH RECEIPTS", 38, 455);
    context.fillStyle = "#d64b38";
    context.beginPath();
    context.arc(700, 48, 11, 0, Math.PI * 2);
    context.fill();
  }, undefined, false);

  const microphoneMetal = standard({ color: "#4d5353", metalness: 0.75, roughness: 0.37 });
  const foam = standard({ color: "#222526", roughness: 0.98 });
  box(stationGroup, [0.15, 0.22, 0.18], [-1.47, 0.06, -0.35], darkMetal);
  beamBetween(stationGroup, [-1.47, 0.14, -0.35], [-1.43, 0.75, -0.37], 0.025, microphoneMetal);
  beamBetween(stationGroup, [-1.43, 0.75, -0.37], [-0.9, 0.68, -0.2], 0.025, microphoneMetal);
  beamBetween(stationGroup, [-0.9, 0.68, -0.2], [-0.77, 0.48, -0.12], 0.018, microphoneMetal);
  const leftMic = new THREE.Group();
  leftMic.position.set(-0.77, 0.43, -0.1);
  leftMic.rotation.z = -0.15;
  stationGroup.add(leftMic);
  cylinder(leftMic, [0.065, 0.065], 0.27, [0, 0, 0], microphoneMetal, 18);
  sphere(leftMic, 0.09, [0, 0.16, 0], foam, [0.85, 1.2, 0.85]);
  torus(leftMic, 0.105, 0.012, [0, -0.02, 0], darkMetal, [Math.PI / 2, 0, 0]);
  const rightPot = new THREE.Group();
  rightPot.position.set(0.62, 0, -0.35);
  stationGroup.add(rightPot);
  cylinder(rightPot, [0.14, 0.22], 0.3, [0, 0.15, 0], terracotta, 20, true);
  torus(rightPot, 0.14, 0.025, [0, 0, 0], terracottaLight, [Math.PI / 2, 0, 0]);
  cylinder(rightPot, [0.21, 0.21], 0.025, [0, 0.3, 0], terracotta, 20);
  const rightMic = new THREE.Group();
  rightMic.position.set(0.62, 0.48, -0.35);
  rightMic.rotation.z = 0.07;
  stationGroup.add(rightMic);
  cylinder(rightMic, [0.07, 0.085], 0.3, [0, 0, 0], microphoneMetal, 18);
  sphere(rightMic, 0.105, [0, 0.18, 0], foam, [0.9, 1.15, 0.9]);
  torus(rightMic, 0.08, 0.013, [0, -0.12, 0], brass, [Math.PI / 2, 0, 0]);

  const headphones = new THREE.Group();
  headphones.position.set(-1.08, 0.09, 0.28);
  headphones.rotation.set(Math.PI / 2, 0.15, -0.3);
  stationGroup.add(headphones);
  torus(headphones, 0.21, 0.026, [0, 0, 0], darkMetal, undefined, Math.PI * 1.25);
  for (const x of [-0.2, 0.2]) {
    box(headphones, [0.11, 0.18, 0.09], [x, -0.03, 0], foam, [0, 0, x * 0.4]);
  }
  const benchMug = makeMug(stationGroup, [1.43, 0.01, 0.32], 1.05);
  box(benchMug, [0.055, 0.045, 0.025], [-0.07, 0.22, 0.085], darkTimber, [0, 0, 0.4]);
  paintedLabel(stationGroup, station.propLabel, [1.15, 0.23], [0, -0.11, 0.595], {
    background: "#5d553e", foreground: "#f2d5a3", font: "bold 66px monospace", resolution: [900, 200],
  });

  const haloMaterial = basic({ color: ORANGE, transparent: true, opacity: 0, depthWrite: false });
  const halo = torus(stationGroup, 1.74, 0.018, [0, -0.015, -0.02], haloMaterial, [Math.PI / 2, 0, 0]);
  halo.scale.z = 0.46;
  const hitMaterial = basic({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });
  const stationHitBox = box(stationGroup, [3.65, 1.45, 1.65], [0, 0.48, -0.02], hitMaterial);
  stationHitBox.castShadow = false;
  stationHitBox.receiveShadow = false;
  stationGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.userData.stationId = station.id;
      stationHitMeshes.push(child);
    }
  });

  let stationHovered = false;
  let stationSelected = false;
  let doorHovered = false;
  let lightingMode: LightingMode = "night";
  let lightingBlend = 1;
  let disposed = false;

  const stationHandle: StationHandle = {
    id: station.id,
    group: stationGroup,
    hitMeshes: stationHitMeshes,
    setHovered: (hovered) => {
      stationHovered = hovered;
    },
    setSelected: (selected) => {
      stationSelected = selected;
    },
    update: (elapsed, dt) => {
      vuLeds.forEach((led, index) => {
        const column = index % 5;
        const row = Math.floor(index / 5);
        const signal = (Math.sin(elapsed * (5.4 + row * 0.7) + row * 1.8) * 0.5 + 0.5) * 4.7;
        led.emissiveIntensity = column <= signal ? 0.8 + Math.sin(elapsed * 8 + index) * 0.22 : 0.06;
      });
      const active = stationHovered || stationSelected;
      const target = active ? (stationSelected ? 0.92 : 0.65) : 0;
      haloMaterial.opacity = THREE.MathUtils.damp(haloMaterial.opacity, target, 9, dt);
      halo.scale.x = 1 + (active ? Math.sin(elapsed * 2.4) * 0.012 : 0);
      halo.scale.y = halo.scale.x;
      onAirMaterial.emissiveIntensity = 1.9 + Math.sin(elapsed * 1.7) * 0.08;
    },
  };

  return {
    group,
    doorHitMeshes,
    easterEggHitMeshes,
    stationHandle,
    triggerEasterEgg: (id) => {
      if (id === "bucket") {
        splashPulse = 1;
        return "Bucket's 80% full. Matt says he'll fix the roof next weekend.";
      }
      if (id === "flowerpot") {
        flowerpotWobble = 1;
        return "Careful — that flowerpot is load-bearing for the whole shelf.";
      }
      if (id === "tbd-box") {
        boxJiggle = 1;
        return "Opened the box — just 47 half-written READMEs and an expired domain.";
      }
      return "";
    },
    setDoorProgress: (progress) => {
      const clamped = THREE.MathUtils.clamp(progress, 0, 1);
      const eased = clamped * clamped * (3 - 2 * clamped);
      doorPivot.rotation.y = -1.85 * eased;
    },
    setDoorHovered: (hovered) => {
      doorHovered = hovered;
    },
    setLightingMode: (mode, blend) => {
      lightingMode = mode;
      lightingBlend = THREE.MathUtils.clamp(blend, 0, 1);
    },
    update: (elapsed, dt) => {
      const dayAmount = lightingMode === "day" ? lightingBlend : 1 - lightingBlend;
      const flickerWave = Math.sin(elapsed * 17.3) * Math.sin(elapsed * 7.1);
      const dropout = Math.sin(elapsed * 0.73) > 0.965 ? Math.max(0.25, 0.72 + flickerWave * 0.35) : 1;
      const flicker = (1 + flickerWave * 0.035 + Math.sin(elapsed * 2.3) * 0.025) * dropout;
      bulbLight.intensity = (1.25 + dayAmount * 0.38) * flicker;
      bulbMaterial.emissiveIntensity = 2.2 * flicker + dayAmount * 0.3;
      windowGlow.emissiveIntensity = 0.72 * flicker;
      interiorFill.intensity = 0.12 + dayAmount * 0.5;
      lanternLight.intensity = THREE.MathUtils.damp(lanternLight.intensity, doorHovered ? 1.25 : 0.35, 8, dt);
      lanternMaterial.emissiveIntensity = THREE.MathUtils.damp(lanternMaterial.emissiveIntensity, doorHovered ? 1.7 : 0.5, 8, dt);
      doorMaterial.emissiveIntensity = THREE.MathUtils.damp(doorMaterial.emissiveIntensity, doorHovered ? 0.14 : 0, 8, dt);
      dust.rotation.y = Math.sin(elapsed * 0.07) * 0.025;
      dust.position.y = Math.sin(elapsed * 0.19) * 0.025;
      const dripPhase = (elapsed % 2.2) / 2.2;
      droplet.visible = dripPhase < 0.88;
      droplet.position.y = 2.42 - Math.pow(dripPhase / 0.88, 2) * 1.94;
      droplet.scale.y = 1.3 + dripPhase * 1.4;
      if (splashPulse > 0.001) {
        splashPulse = Math.max(0, splashPulse - dt * 1.35);
        const progress = 1 - splashPulse;
        splashRing.scale.setScalar(1 + progress * 3.2);
        splashMaterial.opacity = splashPulse * 0.75;
      } else {
        splashMaterial.opacity = dripPhase > 0.88 ? (1 - dripPhase) * 2.2 : 0;
        splashRing.scale.setScalar(1 + Math.max(0, dripPhase - 0.88) * 8);
      }
      if (flowerpotWobble > 0.001) {
        flowerpotWobble = Math.max(0, flowerpotWobble - dt * 0.65);
        flowerpots.rotation.z = Math.sin(elapsed * 17) * flowerpotWobble * 0.16;
        flowerpots.rotation.x = Math.cos(elapsed * 13) * flowerpotWobble * 0.07;
      } else {
        flowerpots.rotation.z = THREE.MathUtils.damp(flowerpots.rotation.z, 0, 10, dt);
        flowerpots.rotation.x = THREE.MathUtils.damp(flowerpots.rotation.x, 0, 10, dt);
      }
      if (boxJiggle > 0.001) {
        boxJiggle = Math.max(0, boxJiggle - dt * 0.9);
        boxLid.rotation.x = -Math.abs(Math.sin(elapsed * 15)) * boxJiggle * 0.42;
        boxLid.rotation.z = Math.sin(elapsed * 20) * boxJiggle * 0.06;
        boxLabel.rotation.z = -0.035 + Math.sin(elapsed * 18) * boxJiggle * 0.025;
      } else {
        boxLid.rotation.x = THREE.MathUtils.damp(boxLid.rotation.x, 0, 8, dt);
        boxLid.rotation.z = THREE.MathUtils.damp(boxLid.rotation.z, 0, 8, dt);
      }
      stationHandle.update(elapsed, dt);
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      scene.remove(group);
      geometries.forEach((item) => item.dispose());
      materials.forEach((item) => item.dispose());
      ownedTextures.forEach((item) => item.dispose());
      geometries.clear();
      materials.clear();
      ownedTextures.clear();
    },
  };
}
