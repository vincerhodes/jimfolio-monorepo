import * as THREE from "three";
import type { EasterEggId, LightingMode, RoomHandle } from "../types";
import { createWorkshopTextures } from "./materials";
import type { ProceduralPBRSet, WorkshopTextures } from "./materials";

function seededRandom(seed = 93217) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create procedural workshop texture");
  return { canvas, context };
}

export function buildGarageRoom(scene: THREE.Scene, textures?: WorkshopTextures): RoomHandle {
  const group = new THREE.Group();
  group.name = "procedural-garage-room";
  scene.add(group);

  const workshopTextures = textures ?? createWorkshopTextures();
  const ownsWorkshopTextures = textures === undefined;
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const localTextures = new Set<THREE.Texture>();
  const random = seededRandom();

  const trackGeometry = <T extends THREE.BufferGeometry>(geometry: T): T => {
    geometries.add(geometry);
    return geometry;
  };
  const trackMaterial = <T extends THREE.Material>(material: T): T => {
    materials.add(material);
    return material;
  };
  const trackTexture = <T extends THREE.Texture>(texture: T): T => {
    localTextures.add(texture);
    return texture;
  };
  const addMesh = (
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: [number, number, number],
    parent: THREE.Object3D = group,
  ) => {
    trackGeometry(geometry);
    trackMaterial(material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const box = (
    size: [number, number, number],
    position: [number, number, number],
    material: THREE.Material,
    parent: THREE.Object3D = group,
  ) => addMesh(new THREE.BoxGeometry(...size), material, position, parent);
  const cylinder = (
    radiusTop: number,
    radiusBottom: number,
    height: number,
    position: [number, number, number],
    material: THREE.Material,
    parent: THREE.Object3D = group,
    segments = 20,
  ) => addMesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
    material,
    position,
    parent,
  );
  const canvasTexture = (canvas: HTMLCanvasElement) => {
    const texture = trackTexture(new THREE.CanvasTexture(canvas));
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  };
  const pbrMaterial = (
    set: ProceduralPBRSet,
    repeat: [number, number],
    parameters: THREE.MeshStandardMaterialParameters = {},
  ) => {
    const clone = (source: THREE.CanvasTexture) => {
      const texture = trackTexture(source.clone());
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(...repeat);
      texture.needsUpdate = true;
      return texture;
    };
    return trackMaterial(new THREE.MeshStandardMaterial({
      map: clone(set.map),
      bumpMap: clone(set.bumpMap),
      roughnessMap: set.roughnessMap ? clone(set.roughnessMap) : undefined,
      ...parameters,
    }));
  };

  const concrete = pbrMaterial(workshopTextures.concrete, [3.2, 2.7], {
    color: "#b4b5b1",
    bumpScale: 0.045,
    roughness: 0.94,
    metalness: 0.025,
  });
  const drivewayMaterial = pbrMaterial(workshopTextures.concrete, [3.4, 1.8], {
    color: "#a6aaa7",
    bumpScale: 0.055,
    roughness: 0.98,
  });
  const brickMaterial = pbrMaterial(workshopTextures.brick, [4.4, 1.1], {
    color: "#a78d7e",
    bumpScale: 0.075,
    roughness: 0.96,
  });
  const facadeBrickMaterial = pbrMaterial(workshopTextures.brick, [1.2, 2.4], {
    color: "#8f7163",
    bumpScale: 0.085,
    roughness: 0.97,
  });
  const butcherBlock = pbrMaterial(workshopTextures.butcherBlock, [2.8, 0.8], {
    color: "#d3aa78",
    bumpScale: 0.028,
    roughness: 0.72,
    metalness: 0.01,
  });
  const shelfWood = pbrMaterial(workshopTextures.butcherBlock, [1.8, 0.65], {
    color: "#806143",
    bumpScale: 0.035,
    roughness: 0.88,
  });
  const pegboardMaterial = pbrMaterial(workshopTextures.pegboard, [3.4, 1], {
    color: "#c19a6b",
    bumpScale: 0.055,
    roughness: 0.88,
  });
  const brushedSteel = pbrMaterial(workshopTextures.brushedMetal, [1.2, 2.5], {
    color: "#a8b0b1",
    bumpScale: 0.018,
    roughness: 0.42,
    metalness: 0.84,
  });
  const plaster = trackMaterial(new THREE.MeshStandardMaterial({ color: "#999c94", roughness: 0.94 }));
  const ceilingMaterial = trackMaterial(new THREE.MeshStandardMaterial({ color: "#5f625d", roughness: 0.96 }));
  const curbMaterial = trackMaterial(new THREE.MeshStandardMaterial({ color: "#343938", roughness: 0.94 }));
  const darkSteel = trackMaterial(new THREE.MeshStandardMaterial({ color: "#252b2d", roughness: 0.43, metalness: 0.78 }));
  const blackSteel = trackMaterial(new THREE.MeshStandardMaterial({ color: "#101517", roughness: 0.34, metalness: 0.86 }));
  const castIron = trackMaterial(new THREE.MeshStandardMaterial({ color: "#243b3d", roughness: 0.48, metalness: 0.72 }));
  const chrome = trackMaterial(new THREE.MeshStandardMaterial({ color: "#d4dcdd", roughness: 0.2, metalness: 0.96 }));
  const brass = trackMaterial(new THREE.MeshStandardMaterial({ color: "#b5975e", roughness: 0.3, metalness: 0.9 }));
  const timber = trackMaterial(new THREE.MeshStandardMaterial({ color: "#65472f", roughness: 0.76, metalness: 0.01 }));
  const rubber = trackMaterial(new THREE.MeshStandardMaterial({ color: "#171b1b", roughness: 0.93 }));
  const redPaint = trackMaterial(new THREE.MeshStandardMaterial({ color: "#a42e24", roughness: 0.38, metalness: 0.52 }));
  const yellowPaint = trackMaterial(new THREE.MeshStandardMaterial({ color: "#e1ad25", roughness: 0.5, metalness: 0.12 }));
  const cream = trackMaterial(new THREE.MeshStandardMaterial({ color: "#ded7c4", roughness: 0.52, metalness: 0.08 }));

  box([11, 0.12, 9], [0, -0.06, -0.5], concrete);
  box([22, 0.14, 22], [0, -0.1, 15], drivewayMaterial);
  box([11, 2.9, 0.18], [0, 2.75, -5.09], plaster);
  box([0.18, 2.9, 9], [-5.59, 2.75, -0.5], plaster);
  box([0.18, 2.9, 9], [5.59, 2.75, -0.5], plaster);
  box([11, 1.3, 0.18], [0, 0.65, -5.09], brickMaterial);
  box([0.18, 1.3, 9], [-5.59, 0.65, -0.5], brickMaterial);
  box([0.18, 1.3, 9], [5.59, 0.65, -0.5], brickMaterial);
  box([11, 0.12, 9], [0, 4.26, -0.5], ceilingMaterial);
  box([11, 0.18, 0.12], [0, 0.09, -4.95], curbMaterial);
  box([0.12, 0.18, 9], [-5.46, 0.09, -0.5], curbMaterial);
  box([0.12, 0.18, 9], [5.46, 0.09, -0.5], curbMaterial);
  box([11, 0.07, 0.1], [0, 1.32, -4.96], darkSteel);
  box([0.1, 0.07, 9], [-5.46, 1.32, -0.5], darkSteel);
  box([0.1, 0.07, 9], [5.46, 1.32, -0.5], darkSteel);

  for (const x of [-5.35, -2.75, 0, 2.75, 5.35]) {
    box([0.1, 4.08, 0.12], [x, 2.04, -4.94], darkSteel);
  }
  for (const z of [-4.65, -2.25, 0.15, 2.55]) {
    box([0.12, 4.08, 0.1], [-5.45, 2.04, z], darkSteel);
    box([0.12, 4.08, 0.1], [5.45, 2.04, z], darkSteel);
  }
  for (const z of [-4.55, -3.05, -1.55, -0.05, 1.45, 2.95]) {
    box([10.9, 0.2, 0.17], [0, 4, z], timber);
    box([10.9, 0.025, 0.2], [0, 3.89, z], shelfWood);
  }
  box([0.11, 0.31, 8.95], [0, 4, -0.5], darkSteel);
  box([0.36, 0.045, 8.95], [0, 3.845, -0.5], blackSteel);
  box([0.36, 0.045, 8.95], [0, 4.155, -0.5], blackSteel);

  box([3.55, 0.035, 0.74], [0, 0.022, -2.55], rubber);
  for (let index = 0; index < 22; index += 1) {
    box([0.025, 0.012, 0.68], [-1.68 + index * 0.16, 0.045, -2.55], curbMaterial);
  }

  const buildBench = (x: number, z: number, length: number, depth: number, alongZ = false) => {
    const topSize: [number, number, number] = alongZ
      ? [depth, 0.12, length]
      : [length, 0.12, depth];
    box(topSize, [x, 0.9, z], butcherBlock);
    const longApron: [number, number, number] = alongZ
      ? [0.08, 0.19, length - 0.18]
      : [length - 0.18, 0.19, 0.08];
    const shortApron: [number, number, number] = alongZ
      ? [depth - 0.18, 0.19, 0.08]
      : [0.08, 0.19, depth - 0.18];
    for (const side of [-1, 1]) {
      const longPosition: [number, number, number] = alongZ
        ? [x + side * (depth / 2 - 0.07), 0.77, z]
        : [x, 0.77, z + side * (depth / 2 - 0.07)];
      box(longApron, longPosition, darkSteel);
      const shortPosition: [number, number, number] = alongZ
        ? [x, 0.77, z + side * (length / 2 - 0.07)]
        : [x + side * (length / 2 - 0.07), 0.77, z];
      box(shortApron, shortPosition, darkSteel);
    }
    for (const longSide of [-1, 1]) {
      for (const shortSide of [-1, 1]) {
        const legX = alongZ ? x + shortSide * (depth / 2 - 0.13) : x + longSide * (length / 2 - 0.15);
        const legZ = alongZ ? z + longSide * (length / 2 - 0.15) : z + shortSide * (depth / 2 - 0.13);
        box([0.13, 0.72, 0.13], [legX, 0.39, legZ], darkSteel);
        box([0.23, 0.035, 0.23], [legX, 0.03, legZ], blackSteel);
      }
    }
    const shelfSize: [number, number, number] = alongZ
      ? [depth - 0.18, 0.065, length - 0.25]
      : [length - 0.25, 0.065, depth - 0.18];
    box(shelfSize, [x, 0.27, z], shelfWood);
    const braceSize: [number, number, number] = alongZ
      ? [0.055, 0.055, length - 0.28]
      : [length - 0.28, 0.055, 0.055];
    box(braceSize, [x, 0.17, z], darkSteel);
  };

  buildBench(0, -3.45, 5.5, 1.02);
  buildBench(3.95, -2, 4.5, 1.08, true);
  buildBench(-3.95, -2, 4.5, 1.08, true);

  const toolbox = new THREE.Group();
  toolbox.position.set(0.45, 0.45, -3.4);
  group.add(toolbox);
  box([0.82, 0.28, 0.39], [0, 0, 0], redPaint, toolbox);
  box([0.86, 0.075, 0.42], [0, 0.17, 0], redPaint, toolbox);
  box([0.26, 0.045, 0.055], [0, 0.29, 0], blackSteel, toolbox);
  for (const x of [-0.11, 0.11]) box([0.035, 0.12, 0.045], [x, 0.235, 0], blackSteel, toolbox);
  for (const x of [-0.27, 0.27]) {
    box([0.075, 0.12, 0.025], [x, 0.045, 0.208], chrome, toolbox);
    box([0.04, 0.035, 0.035], [x, 0.065, 0.23], blackSteel, toolbox);
  }

  const tinColors = ["#d4cdb7", "#647e8c", "#b34a36"];
  for (let index = 0; index < 3; index += 1) {
    const tinMaterial = trackMaterial(new THREE.MeshStandardMaterial({
      color: tinColors[index],
      roughness: 0.5,
      metalness: 0.35,
    }));
    const x = 3.82 + (index % 2) * 0.3;
    const y = index === 2 ? 0.62 : 0.43;
    const z = index === 2 ? -2.85 : -2.85 - index * 0.45;
    cylinder(0.16, 0.16, 0.3, [x, y, z], tinMaterial);
    cylinder(0.168, 0.168, 0.025, [x, y + 0.16, z], chrome);
    const handle = addMesh(new THREE.TorusGeometry(0.13, 0.009, 6, 20, Math.PI), chrome, [x, y + 0.03, z]);
    handle.rotation.x = Math.PI / 2;
  }

  for (let index = 0; index < 4; index += 1) {
    const coil = addMesh(
      new THREE.TorusGeometry(0.22 - index * 0.018, 0.018, 7, 32),
      yellowPaint,
      [-3.95, 0.34 + index * 0.035, -1.25],
    );
    coil.rotation.x = Math.PI / 2;
  }
  box([0.055, 0.04, 0.38], [-3.62, 0.33, -1.25], yellowPaint);

  const powerStrip = new THREE.Group();
  powerStrip.position.set(1.85, 0.39, -2.99);
  group.add(powerStrip);
  box([0.72, 0.11, 0.16], [0, 0, 0], cream, powerStrip);
  for (const x of [-0.22, -0.04, 0.14]) {
    for (const offset of [-0.025, 0.025]) {
      box([0.018, 0.04, 0.012], [x + offset, 0, 0.086], blackSteel, powerStrip);
    }
  }
  const rockerGlow = trackMaterial(new THREE.MeshStandardMaterial({
    color: "#ff6952",
    emissive: "#ff2818",
    emissiveIntensity: 2.8,
    roughness: 0.35,
  }));
  box([0.075, 0.065, 0.025], [0.28, 0, 0.09], rockerGlow, powerStrip);

  const galleryBoard = trackMaterial(new THREE.MeshStandardMaterial({
    color: "#111517",
    roughness: 0.48,
    metalness: 0.72,
  }));
  box([0.075, 1.48, 3.95], [5.42, 2.48, -1.8], galleryBoard);
  box([0.055, 0.055, 4.04], [5.365, 3.235, -1.8], brass);
  box([0.055, 0.055, 4.04], [5.365, 1.725, -1.8], brass);
  box([0.055, 1.56, 0.055], [5.365, 2.48, 0.22], brass);
  box([0.055, 1.56, 0.055], [5.365, 2.48, -3.82], brass);
  const galleryHeaderCanvas = makeCanvas(1400, 130);
  galleryHeaderCanvas.context.clearRect(0, 0, 1400, 130);
  galleryHeaderCanvas.context.textAlign = "center";
  galleryHeaderCanvas.context.textBaseline = "middle";
  galleryHeaderCanvas.context.font = "700 58px monospace";
  galleryHeaderCanvas.context.fillStyle = "#d6bd85";
  galleryHeaderCanvas.context.fillText("SHIPPED // OUT IN THE WILD", 700, 68);
  const galleryHeaderTexture = canvasTexture(galleryHeaderCanvas.canvas);
  const galleryHeaderMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    map: galleryHeaderTexture,
    transparent: true,
    roughness: 0.55,
    metalness: 0.35,
    emissive: "#6d5127",
    emissiveIntensity: 0.25,
    depthWrite: false,
  }));
  const galleryHeader = addMesh(new THREE.PlaneGeometry(3.55, 0.3), galleryHeaderMaterial, [5.32, 3.06, -1.8]);
  galleryHeader.rotation.y = -Math.PI / 2;
  galleryHeader.castShadow = false;
  const galleryLampGlow = trackMaterial(new THREE.MeshStandardMaterial({
    color: "#ffe0a3",
    emissive: "#ffc46b",
    emissiveIntensity: 1.8,
    roughness: 0.25,
  }));
  const galleryLightBar = cylinder(0.035, 0.035, 3.5, [5.16, 3.38, -1.8], brass);
  galleryLightBar.rotation.x = Math.PI / 2;
  const galleryDiffuser = cylinder(0.018, 0.018, 3.32, [5.12, 3.345, -1.8], galleryLampGlow);
  galleryDiffuser.rotation.x = Math.PI / 2;
  for (const z of [-3.25, -0.35]) {
    box([0.28, 0.035, 0.035], [5.3, 3.38, z], brass);
  }

  box([5.62, 1.62, 0.07], [0, 2.1, -4.94], pegboardMaterial);
  box([5.76, 0.065, 0.12], [0, 1.27, -4.89], darkSteel);
  box([5.76, 0.065, 0.12], [0, 2.93, -4.89], darkSteel);
  box([0.065, 1.72, 0.12], [-2.88, 2.1, -4.89], darkSteel);
  box([0.065, 1.72, 0.12], [2.88, 2.1, -4.89], darkSteel);

  const signCanvas = makeCanvas(1200, 240);
  signCanvas.context.clearRect(0, 0, 1200, 240);
  signCanvas.context.textAlign = "center";
  signCanvas.context.textBaseline = "middle";
  signCanvas.context.font = "700 126px Arial, sans-serif";
  signCanvas.context.shadowColor = "#ff8a32";
  signCanvas.context.shadowBlur = 34;
  signCanvas.context.strokeStyle = "#ff9c45";
  signCanvas.context.lineWidth = 10;
  signCanvas.context.strokeText("JIM'S GARAGE", 600, 122);
  signCanvas.context.shadowBlur = 10;
  signCanvas.context.strokeStyle = "#ffe2a8";
  signCanvas.context.lineWidth = 3;
  signCanvas.context.strokeText("JIM'S GARAGE", 600, 122);
  const signTexture = canvasTexture(signCanvas.canvas);
  const neonMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    map: signTexture,
    emissiveMap: signTexture,
    color: "#ffd39a",
    emissive: "#ff9b45",
    emissiveIntensity: 2.4,
    transparent: true,
    depthWrite: false,
    roughness: 0.2,
  }));
  const neonSign = addMesh(new THREE.PlaneGeometry(3.9, 0.78), neonMaterial, [0, 3.46, -4.91]);
  neonSign.castShadow = false;
  const neonDiffuserMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    color: "#ffd18c",
    emissive: "#ff9b45",
    emissiveIntensity: 2.4,
    roughness: 0.24,
  }));
  const diffuser = cylinder(0.018, 0.018, 3.45, [0, 3.055, -4.81], neonDiffuserMaterial);
  diffuser.rotation.z = Math.PI / 2;
  diffuser.castShadow = false;

  const toolSteel = trackMaterial(new THREE.MeshStandardMaterial({ color: "#b9c1c0", roughness: 0.27, metalness: 0.9 }));
  const toolRed = trackMaterial(new THREE.MeshStandardMaterial({ color: "#923e32", roughness: 0.58 }));
  const toolAmber = trackMaterial(new THREE.MeshStandardMaterial({ color: "#d49b3f", roughness: 0.53 }));
  const toolZ = -4.84;
  const easterEggHitMeshes: THREE.Object3D[] = [];
  const registerEasterEgg = (mesh: THREE.Mesh, id: EasterEggId) => {
    mesh.userData.easterEggId = id;
    easterEggHitMeshes.push(mesh);
    return mesh;
  };

  const wrench = new THREE.Group();
  wrench.position.set(-1.95, 2.48, toolZ);
  group.add(wrench);
  registerEasterEgg(box([0.085, 0.62, 0.05], [0, -0.31, 0], toolSteel, wrench), "wrench");
  const wrenchHead = registerEasterEgg(
    addMesh(new THREE.TorusGeometry(0.12, 0.032, 8, 20, Math.PI * 1.55), toolSteel, [0, 0.035, 0], wrench),
    "wrench",
  );
  wrenchHead.rotation.z = -Math.PI * 0.77;
  const wrenchBottom = registerEasterEgg(
    addMesh(new THREE.TorusGeometry(0.09, 0.027, 8, 20), toolSteel, [0, -0.67, 0], wrench),
    "wrench",
  );
  wrenchBottom.scale.y = 0.85;
  box([0.025, 0.025, 0.14], [-1.95, 2.52, -4.85], chrome);

  const hammer = new THREE.Group();
  hammer.position.set(-1.2, 2.1, toolZ);
  hammer.rotation.z = 0.14;
  group.add(hammer);
  box([0.09, 0.68, 0.065], [0, -0.04, 0], timber, hammer);
  box([0.43, 0.13, 0.13], [0, 0.34, 0], toolSteel, hammer);
  box([0.1, 0.18, 0.11], [-0.23, 0.34, 0], toolSteel, hammer);

  for (let index = 0; index < 3; index += 1) {
    const screwdriver = new THREE.Group();
    screwdriver.position.set(-0.5 + index * 0.3, 2.1 + (index % 2) * 0.08, toolZ);
    group.add(screwdriver);
    cylinder(0.055, 0.07, 0.27, [0, 0.2, 0], index === 1 ? toolAmber : toolRed, screwdriver, 12);
    cylinder(0.014, 0.014, 0.43, [0, -0.15, 0], toolSteel, screwdriver, 8);
  }
  const tape = addMesh(new THREE.TorusGeometry(0.16, 0.055, 10, 24), toolAmber, [0.58, 2.16, toolZ]);
  tape.scale.y = 1.08;
  box([0.23, 0.07, 0.09], [0.58, 2, toolZ], darkSteel);
  for (const radius of [0.25, 0.19]) {
    const cable = addMesh(new THREE.TorusGeometry(radius, 0.016, 7, 32), blackSteel, [1.38, 2.13, toolZ]);
    cable.scale.set(0.85, 1.3, 1);
  }
  for (const x of [-1.2, -0.5, -0.2, 0.1, 0.58, 1.38]) {
    box([0.025, 0.025, 0.13], [x, 2.55, -4.85], chrome);
  }

  const vise = new THREE.Group();
  vise.position.set(-2.45, 0.96, -3);
  group.add(vise);
  registerEasterEgg(box([0.55, 0.09, 0.42], [0, 0.045, 0], castIron, vise), "vise");
  registerEasterEgg(box([0.38, 0.22, 0.35], [0, 0.18, -0.02], castIron, vise), "vise");
  box([0.48, 0.22, 0.11], [0, 0.33, -0.16], castIron, vise);
  box([0.48, 0.22, 0.11], [0, 0.33, 0.17], castIron, vise);
  box([0.5, 0.055, 0.035], [0, 0.445, -0.1], chrome, vise);
  box([0.5, 0.055, 0.035], [0, 0.445, 0.11], chrome, vise);
  box([0.16, 0.26, 0.09], [0, -0.08, 0.19], castIron, vise);
  box([0.34, 0.06, 0.2], [0, -0.19, 0.16], castIron, vise);
  const viseSpinner = new THREE.Group();
  viseSpinner.position.set(0, 0.25, 0.37);
  vise.add(viseSpinner);
  const viseScrew = registerEasterEgg(cylinder(0.035, 0.035, 0.35, [0, 0, -0.1], chrome, viseSpinner), "vise");
  viseScrew.rotation.x = Math.PI / 2;
  const viseBar = registerEasterEgg(cylinder(0.022, 0.022, 0.55, [0, 0, 0.1], chrome, viseSpinner), "vise");
  viseBar.rotation.z = Math.PI / 2;
  for (const x of [-0.285, 0.285]) {
    registerEasterEgg(addMesh(new THREE.SphereGeometry(0.038, 12, 8), chrome, [x, 0, 0.1], viseSpinner), "vise");
  }

  const clock = new THREE.Group();
  clock.position.set(-5.42, 2.62, -1.8);
  group.add(clock);
  const clockBody = registerEasterEgg(cylinder(0.34, 0.34, 0.09, [0, 0, 0], darkSteel, clock, 40), "clock");
  clockBody.rotation.z = -Math.PI / 2;
  const clockFaceMaterial = trackMaterial(new THREE.MeshStandardMaterial({ color: "#ddd8c7", roughness: 0.67 }));
  const clockFace = registerEasterEgg(addMesh(new THREE.CircleGeometry(0.3, 40), clockFaceMaterial, [0.052, 0, 0], clock), "clock");
  clockFace.rotation.y = Math.PI / 2;
  const clockRim = registerEasterEgg(addMesh(new THREE.TorusGeometry(0.32, 0.025, 10, 40), brushedSteel, [0.065, 0, 0], clock), "clock");
  clockRim.rotation.y = Math.PI / 2;
  for (let index = 0; index < 12; index += 1) {
    const tick = new THREE.Group();
    tick.rotation.x = index * Math.PI / 6;
    clock.add(tick);
    box([0.014, index % 3 === 0 ? 0.055 : 0.032, 0.018], [0.064, 0.255, 0], blackSteel, tick);
  }
  const makeClockHand = (length: number, width: number, x: number, material: THREE.Material) => {
    const pivot = new THREE.Group();
    pivot.position.x = x;
    clock.add(pivot);
    box([0.015, length, width], [0, length / 2 - 0.025, 0], material, pivot);
    return pivot;
  };
  const hourHand = makeClockHand(0.16, 0.026, 0.075, blackSteel);
  const minuteHand = makeClockHand(0.23, 0.018, 0.083, blackSteel);
  const secondHand = makeClockHand(0.25, 0.009, 0.092, redPaint);
  const clockPin = cylinder(0.025, 0.025, 0.018, [0.105, 0, 0], brass, clock, 16);
  clockPin.rotation.z = -Math.PI / 2;

  const pendantShadeMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    color: "#29302f",
    roughness: 0.34,
    metalness: 0.8,
    side: THREE.DoubleSide,
  }));
  cylinder(0.018, 0.018, 0.55, [0, 3.92, -0.8], blackSteel, group, 10);
  addMesh(new THREE.ConeGeometry(0.49, 0.31, 40, 1, true), pendantShadeMaterial, [0, 3.57, -0.8]);
  const shadeRim = addMesh(new THREE.TorusGeometry(0.49, 0.018, 8, 40), darkSteel, [0, 3.415, -0.8]);
  shadeRim.rotation.x = Math.PI / 2;
  const pendantGlow = trackMaterial(new THREE.MeshStandardMaterial({
    color: "#ffe0ae",
    emissive: "#ff9d45",
    emissiveIntensity: 4.5,
    roughness: 0.2,
  }));
  addMesh(new THREE.SphereGeometry(0.09, 18, 12), pendantGlow, [0, 3.43, -0.8]);
  const pendantBulbLight = new THREE.PointLight("#ffad57", 2.8, 2.6, 2);
  pendantBulbLight.position.set(0, 3.4, -0.8);
  group.add(pendantBulbLight);

  const fluorescentGlow = trackMaterial(new THREE.MeshStandardMaterial({
    color: "#dce6e6",
    emissive: "#f0f7ff",
    emissiveIntensity: 0.04,
    roughness: 0.24,
  }));
  for (const x of [-2.35, 2.35]) {
    box([0.46, 0.1, 2.25], [x, 3.87, -1.05], brushedSteel);
    box([0.38, 0.055, 2.12], [x, 3.8, -1.05], blackSteel);
    for (const tubeX of [x - 0.11, x + 0.11]) {
      const tube = cylinder(0.032, 0.032, 1.98, [tubeX, 3.755, -1.05], fluorescentGlow, group, 14);
      tube.rotation.x = Math.PI / 2;
      tube.castShadow = false;
      for (const endZ of [-2.08, -0.02]) {
        box([0.09, 0.075, 0.08], [tubeX, 3.77, endZ], darkSteel);
      }
    }
    for (let index = 0; index < 8; index += 1) {
      box([0.43, 0.018, 0.018], [x, 3.7, -1.93 + index * 0.25], darkSteel);
    }
    for (const railX of [x - 0.2, x + 0.2]) {
      box([0.018, 0.018, 2.02], [railX, 3.7, -1.05], darkSteel);
    }
    for (const chainZ of [-1.85, -0.25]) {
      cylinder(0.009, 0.009, 0.25, [x, 4.015, chainZ], blackSteel, group, 6);
    }
  }

  const doorCanvas = makeCanvas(1400, 560);
  const doorContext = doorCanvas.context;
  const doorGradient = doorContext.createLinearGradient(0, 0, 1400, 0);
  doorGradient.addColorStop(0, "#465054");
  doorGradient.addColorStop(0.5, "#7c8587");
  doorGradient.addColorStop(1, "#434d50");
  doorContext.fillStyle = doorGradient;
  doorContext.fillRect(0, 0, 1400, 560);
  for (let y = 0; y < 560; y += 70) {
    const rib = doorContext.createLinearGradient(0, y, 0, y + 70);
    rib.addColorStop(0, "rgba(15,22,24,0.58)");
    rib.addColorStop(0.12, "rgba(220,225,220,0.2)");
    rib.addColorStop(0.75, "rgba(255,255,255,0.025)");
    rib.addColorStop(1, "rgba(10,15,16,0.45)");
    doorContext.fillStyle = rib;
    doorContext.fillRect(0, y, 1400, 70);
  }
  for (let index = 0; index < 1600; index += 1) {
    doorContext.fillStyle = `rgba(25,30,28,${random() * 0.11})`;
    doorContext.fillRect(random() * 1400, random() * 560, 1 + random() * 8, 1 + random() * 2);
  }
  doorContext.textAlign = "center";
  doorContext.textBaseline = "middle";
  doorContext.fillStyle = "rgba(235,222,184,0.92)";
  doorContext.font = "900 116px Arial, sans-serif";
  doorContext.fillText("JIM'S GARAGE", 700, 242);
  doorContext.font = "700 35px monospace";
  doorContext.fillText("EXPERIMENTS // JIMSGARAGE.DEV", 700, 342);

  box([0.85, 4.2, 0.68], [-4.92, 2.1, 4.04], facadeBrickMaterial);
  box([0.85, 4.2, 0.68], [4.92, 2.1, 4.04], facadeBrickMaterial);
  box([9, 0.88, 0.68], [0, 3.76, 4.04], facadeBrickMaterial);
  box([0.1, 3.32, 0.16], [-4.43, 1.66, 3.98], darkSteel);
  box([0.1, 3.32, 0.16], [4.43, 1.66, 3.98], darkSteel);
  box([8.95, 0.12, 0.18], [0, 3.3, 4.015], darkSteel);

  const doorHitMeshes: THREE.Object3D[] = [];
  const doorMaterials: THREE.MeshStandardMaterial[] = [];
  const doorPanels: THREE.Mesh[] = [];
  const panelHeight = 0.405;
  for (let index = 0; index < 8; index += 1) {
    const panelTexture = canvasTexture(doorCanvas.canvas);
    panelTexture.wrapS = THREE.ClampToEdgeWrapping;
    panelTexture.wrapT = THREE.ClampToEdgeWrapping;
    panelTexture.repeat.set(1, 1 / 8);
    panelTexture.offset.set(0, index / 8);
    const panelMaterial = trackMaterial(new THREE.MeshStandardMaterial({
      map: panelTexture,
      color: "#b1b6b6",
      roughness: 0.46,
      metalness: 0.65,
      emissive: "#8c754f",
      emissiveIntensity: 0,
    }));
    const panel = box([8.65, panelHeight - 0.008, 0.09], [0, 0.22 + index * panelHeight, 4], panelMaterial);
    panel.name = `roller-door-slat-${index + 1}`;
    doorPanels.push(panel);
    doorMaterials.push(panelMaterial);
    doorHitMeshes.push(panel);
  }
  const railPoints = [
    new THREE.Vector3(0, 0.08, 4.055),
    new THREE.Vector3(0, 3.14, 4.055),
    new THREE.Vector3(0, 3.55, 3.98),
    new THREE.Vector3(0, 3.88, 3.72),
    new THREE.Vector3(0, 4.015, 3.28),
    new THREE.Vector3(0, 4.015, -0.75),
  ];
  for (const x of [-4.4, 4.4]) {
    const curve = new THREE.CatmullRomCurve3(railPoints.map((point) => new THREE.Vector3(x, point.y, point.z)));
    addMesh(new THREE.TubeGeometry(curve, 48, 0.035, 6, false), darkSteel, [0, 0, 0]);
  }

  const porchMetal = trackMaterial(new THREE.MeshStandardMaterial({ color: "#272b29", roughness: 0.45, metalness: 0.72 }));
  const porchGlow = trackMaterial(new THREE.MeshStandardMaterial({
    color: "#ffe2a8",
    emissive: "#ffad52",
    emissiveIntensity: 3.5,
    roughness: 0.24,
  }));
  box([0.3, 0.42, 0.14], [-4.88, 2.65, 4.46], porchMetal);
  addMesh(new THREE.SphereGeometry(0.1, 14, 10), porchGlow, [-4.88, 2.65, 4.56]);
  for (const x of [-4.99, -4.77]) box([0.018, 0.36, 0.018], [x, 2.65, 4.65], porchMetal);
  const porchLight = new THREE.PointLight("#ffb463", 8, 5, 2);
  porchLight.position.set(-4.88, 2.65, 4.72);
  group.add(porchLight);

  const floodCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 3.72, 4.4),
    new THREE.Vector3(0, 4.03, 4.52),
    new THREE.Vector3(0, 4.08, 4.9),
    new THREE.Vector3(0, 3.88, 5.12),
  ]);
  addMesh(new THREE.TubeGeometry(floodCurve, 24, 0.035, 8, false), porchMetal, [0, 0, 0]);
  const floodShade = addMesh(new THREE.ConeGeometry(0.25, 0.2, 24, 1, true), porchMetal, [0, 3.78, 5.12]);
  floodShade.rotation.x = Math.PI;
  const exteriorFloodlight = new THREE.SpotLight("#ffd0a0", 120, 14, 0.9, 0.7, 1.4);
  exteriorFloodlight.position.set(0, 3.72, 5.12);
  exteriorFloodlight.target.position.set(0, 0.6, 5.4);
  group.add(exteriorFloodlight, exteriorFloodlight.target);

  const keypadGroup = new THREE.Group();
  keypadGroup.position.set(4.9, 1.35, 4.43);
  group.add(keypadGroup);
  const keypadMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    color: "#26302d",
    roughness: 0.38,
    metalness: 0.58,
    emissive: "#43d6a0",
    emissiveIntensity: 0.28,
  }));
  const keypad = box([0.27, 0.42, 0.1], [0, 0, 0], keypadMaterial, keypadGroup);
  keypad.name = "garage-keypad";
  doorHitMeshes.push(keypad);
  const keyMaterial = trackMaterial(new THREE.MeshStandardMaterial({ color: "#aab3aa", roughness: 0.52, metalness: 0.4 }));
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      box([0.045, 0.04, 0.018], [-0.065 + column * 0.065, 0.095 - row * 0.065, 0.058], keyMaterial, keypadGroup);
    }
  }
  const keypadLedMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    color: "#8fffc9",
    emissive: "#36ff9b",
    emissiveIntensity: 4,
  }));
  addMesh(new THREE.SphereGeometry(0.018, 8, 6), keypadLedMaterial, [0, 0.16, 0.065], keypadGroup);

  const switchHitMeshes: THREE.Object3D[] = [];
  const switchGroup = new THREE.Group();
  switchGroup.position.set(-5.42, 1.65, 0.95);
  group.add(switchGroup);
  const switchPlateMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    color: "#bda36f",
    roughness: 0.32,
    metalness: 0.86,
    emissive: "#d7b878",
    emissiveIntensity: 0,
  }));
  const plate = box([0.055, 0.38, 0.25], [0, 0, 0], switchPlateMaterial, switchGroup);
  plate.name = "light-switch-plate";
  switchHitMeshes.push(plate);
  for (const y of [-0.155, 0.155]) {
    const screw = cylinder(0.013, 0.013, 0.012, [0.035, y, 0], chrome, switchGroup, 12);
    screw.rotation.z = -Math.PI / 2;
  }
  const rockerMaterial = trackMaterial(new THREE.MeshStandardMaterial({ color: "#d2cbbc", roughness: 0.42, metalness: 0.15 }));
  const rocker = box([0.085, 0.15, 0.115], [0.055, 0.025, 0], rockerMaterial, switchGroup);
  rocker.name = "light-switch-rocker";
  switchHitMeshes.push(rocker);
  const switchLedMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    color: "#ffbf69",
    emissive: "#ff9f43",
    emissiveIntensity: 3.2,
  }));
  addMesh(new THREE.SphereGeometry(0.016, 10, 8), switchLedMaterial, [0.038, 0.125, 0], switchGroup);
  const lightsCanvas = makeCanvas(256, 90);
  lightsCanvas.context.fillStyle = "#262a28";
  lightsCanvas.context.fillRect(0, 0, 256, 90);
  lightsCanvas.context.fillStyle = "#e1d4b5";
  lightsCanvas.context.font = "700 42px monospace";
  lightsCanvas.context.textAlign = "center";
  lightsCanvas.context.textBaseline = "middle";
  lightsCanvas.context.fillText("LIGHTS", 128, 48);
  const lightsMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    map: canvasTexture(lightsCanvas.canvas),
    roughness: 0.55,
    metalness: 0.25,
  }));
  const lightsPlate = addMesh(new THREE.PlaneGeometry(0.17, 0.06), lightsMaterial, [0.03, -0.105, 0], switchGroup);
  lightsPlate.rotation.y = Math.PI / 2;
  switchHitMeshes.push(lightsPlate);

  const dustCount = 150;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustBase = new Float32Array(dustCount * 3);
  const dustPhase = new Float32Array(dustCount);
  for (let index = 0; index < dustCount; index += 1) {
    const y = 0.35 + random() * 3.15;
    const spread = 0.4 + (3.5 - y) * 0.5;
    dustBase[index * 3] = (random() - 0.5) * spread * 2;
    dustBase[index * 3 + 1] = y;
    dustBase[index * 3 + 2] = -0.8 + (random() - 0.5) * spread * 2;
    dustPositions[index * 3] = dustBase[index * 3];
    dustPositions[index * 3 + 1] = y;
    dustPositions[index * 3 + 2] = dustBase[index * 3 + 2];
    dustPhase[index] = random() * Math.PI * 2;
  }
  const dustGeometry = trackGeometry(new THREE.BufferGeometry());
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = trackMaterial(new THREE.PointsMaterial({
    color: "#ffe2b2",
    size: 0.022,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  }));
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  dust.frustumCulled = false;
  group.add(dust);

  let doorHovered = false;
  let switchHovered = false;
  let lightingBlend = 0;
  let wrenchAngle = 0;
  let wrenchVelocity = 0;
  let viseSpinElapsed = 2;
  let viseSpinStart = 0;
  let clockWhirl = 0;
  let clockSpin = 0;
  const nightLed = new THREE.Color("#ff9f43");
  const dayLed = new THREE.Color("#bdeaff");
  const easterEggMessages: Record<EasterEggId, string> = {
    wrench: "Spanner checked — 10mm socket still missing.",
    vise: "Bench vise locked down tight.",
    clock: "Workshop clock synced — always time to tinker.",
  };

  const triggerEasterEgg = (id: EasterEggId) => {
    if (id === "wrench") wrenchVelocity += 4.8;
    if (id === "vise") {
      viseSpinStart = viseSpinner.rotation.z;
      viseSpinElapsed = 0;
    }
    if (id === "clock") clockWhirl = 1;
    return easterEggMessages[id];
  };

  const setDoorProgress = (value: number) => {
    const progress = THREE.MathUtils.clamp(value, 0, 1);
    const travel = progress * 5;
    const curveStart = 3.25;
    const radius = 0.75;
    const curveLength = radius * Math.PI * 0.5;
    for (let index = 0; index < doorPanels.length; index += 1) {
      const panel = doorPanels[index];
      const path = 0.22 + index * panelHeight + travel;
      if (path <= curveStart) {
        panel.position.set(0, path, 4);
        panel.rotation.x = 0;
      } else if (path <= curveStart + curveLength) {
        const angle = (path - curveStart) / radius;
        panel.position.set(0, curveStart + Math.sin(angle) * radius, 3.25 + Math.cos(angle) * radius);
        panel.rotation.x = -angle;
      } else {
        panel.position.set(0, curveStart + radius, 3.25 - (path - curveStart - curveLength));
        panel.rotation.x = -Math.PI / 2;
      }
    }
  };

  const setDoorHovered = (hovered: boolean) => {
    doorHovered = hovered;
    for (const material of doorMaterials) material.emissiveIntensity = hovered ? 0.12 : 0;
    keypadMaterial.emissiveIntensity = hovered ? 0.8 : 0.28;
  };

  const setSwitchHovered = (hovered: boolean) => {
    switchHovered = hovered;
    switchPlateMaterial.emissiveIntensity = hovered ? 0.24 : 0;
  };

  const setLightingMode = (_mode: LightingMode, blend: number) => {
    lightingBlend = THREE.MathUtils.clamp(blend, 0, 1);
    const nightAmount = 1 - lightingBlend;
    rocker.rotation.z = THREE.MathUtils.lerp(-0.28, 0.28, lightingBlend);
    switchLedMaterial.color.copy(nightLed).lerp(dayLed, lightingBlend);
    switchLedMaterial.emissive.copy(nightLed).lerp(dayLed, lightingBlend);
    dustMaterial.opacity = THREE.MathUtils.lerp(0.42, 0.15, lightingBlend);
    pendantGlow.emissiveIntensity = THREE.MathUtils.lerp(4.5, 0.3, lightingBlend);
    pendantBulbLight.intensity = THREE.MathUtils.lerp(2.8, 0.08, lightingBlend);
    fluorescentGlow.emissiveIntensity = THREE.MathUtils.lerp(0.04, 2.2, lightingBlend);
    neonMaterial.emissiveIntensity = THREE.MathUtils.lerp(2.4, 0.45, lightingBlend);
    neonDiffuserMaterial.emissiveIntensity = THREE.MathUtils.lerp(2.4, 0.4, lightingBlend);
    galleryLampGlow.emissiveIntensity = THREE.MathUtils.lerp(1.8, 0.35, lightingBlend);
    porchGlow.emissiveIntensity = THREE.MathUtils.lerp(3.5, 0.15, lightingBlend);
    porchLight.intensity = 8 * nightAmount;
    exteriorFloodlight.intensity = 120 * nightAmount;
  };

  const update = (elapsed: number, dt: number) => {
    const delta = Math.min(dt, 0.05);
    const positions = dustGeometry.attributes.position as THREE.BufferAttribute;
    for (let index = 0; index < dustCount; index += 1) {
      const phase = dustPhase[index];
      dustPositions[index * 3] = dustBase[index * 3] + Math.sin(elapsed * 0.19 + phase) * 0.075;
      dustPositions[index * 3 + 1] = dustBase[index * 3 + 1] + Math.sin(elapsed * 0.27 + phase * 1.7) * 0.11;
      dustPositions[index * 3 + 2] = dustBase[index * 3 + 2] + Math.cos(elapsed * 0.16 + phase) * 0.065;
    }
    positions.needsUpdate = true;

    wrenchVelocity += (-18 * wrenchAngle - 3.2 * wrenchVelocity) * delta;
    wrenchAngle += wrenchVelocity * delta;
    wrench.rotation.z = wrenchAngle;

    if (viseSpinElapsed < 1.15) {
      viseSpinElapsed = Math.min(1.15, viseSpinElapsed + delta);
      const progress = viseSpinElapsed / 1.15;
      const eased = 1 - Math.pow(1 - progress, 3);
      viseSpinner.rotation.z = viseSpinStart + eased * Math.PI * 4;
    }

    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;
    if (clockWhirl > 0.002) {
      clockSpin += delta * 22 * clockWhirl;
      clockWhirl *= Math.exp(-delta * 2.4);
    }
    secondHand.rotation.x = -(Math.floor(seconds) / 60) * Math.PI * 2 - clockSpin * 1.8;
    minuteHand.rotation.x = -(minutes / 60) * Math.PI * 2 - clockSpin;
    hourHand.rotation.x = -(hours / 12) * Math.PI * 2 - clockSpin * 0.35;

    const pulse = (Math.sin(elapsed * 3.2) + 1) * 0.5;
    keypadLedMaterial.emissiveIntensity = 2.8 + pulse * 2.2 + (doorHovered ? 1.5 : 0);
    switchLedMaterial.emissiveIntensity = 2.5 + pulse * 1.2 + (switchHovered ? 2 : 0);
    porchLight.intensity = 8 * (1 - lightingBlend) * (1 + Math.sin(elapsed * 5.7) * 0.012);
  };

  const dispose = () => {
    scene.remove(group);
    group.traverse((object) => {
      if (object instanceof THREE.PointLight || object instanceof THREE.SpotLight || object instanceof THREE.DirectionalLight) {
        object.shadow.dispose();
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    localTextures.forEach((texture) => texture.dispose());
    if (ownsWorkshopTextures) workshopTextures.disposeAll();
    group.clear();
  };

  setDoorProgress(0);
  setLightingMode("night", 0);

  return {
    group,
    doorHitMeshes,
    switchHitMeshes,
    easterEggHitMeshes,
    triggerEasterEgg,
    setDoorProgress,
    setSwitchHovered,
    setDoorHovered,
    setLightingMode,
    update,
    dispose,
  };
}
