import * as THREE from "three";
import type { LightingMode, RoomHandle } from "../types";

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

export function buildGarageRoom(scene: THREE.Scene): RoomHandle {
  const group = new THREE.Group();
  group.name = "procedural-garage-room";
  scene.add(group);

  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const random = seededRandom();

  const trackGeometry = <T extends THREE.BufferGeometry>(geometry: T): T => {
    geometries.add(geometry);
    return geometry;
  };
  const trackMaterial = <T extends THREE.Material>(material: T): T => {
    materials.add(material);
    return material;
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

  const concreteCanvas = makeCanvas(1024, 1024);
  const concreteContext = concreteCanvas.context;
  concreteContext.fillStyle = "#777a78";
  concreteContext.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 24000; i += 1) {
    const shade = 80 + Math.floor(random() * 90);
    concreteContext.fillStyle = `rgba(${shade},${shade + 2},${shade},${0.025 + random() * 0.08})`;
    const size = 0.5 + random() * 2.4;
    concreteContext.fillRect(random() * 1024, random() * 1024, size, size);
  }
  concreteContext.strokeStyle = "rgba(35,38,38,0.4)";
  concreteContext.lineWidth = 4;
  concreteContext.beginPath();
  concreteContext.moveTo(512, 0);
  concreteContext.lineTo(512, 1024);
  concreteContext.moveTo(0, 512);
  concreteContext.lineTo(1024, 512);
  concreteContext.stroke();
  concreteContext.strokeStyle = "rgba(220,220,210,0.13)";
  concreteContext.lineWidth = 1;
  concreteContext.strokeRect(3, 3, 1018, 1018);
  for (let i = 0; i < 7; i += 1) {
    const x = random() * 1024;
    const y = random() * 1024;
    const radius = 35 + random() * 90;
    const stain = concreteContext.createRadialGradient(x, y, 2, x, y, radius);
    stain.addColorStop(0, "rgba(24,29,27,0.14)");
    stain.addColorStop(0.55, "rgba(34,38,34,0.06)");
    stain.addColorStop(1, "rgba(30,30,30,0)");
    concreteContext.fillStyle = stain;
    concreteContext.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  const concreteTexture = new THREE.CanvasTexture(concreteCanvas.canvas);
  concreteTexture.colorSpace = THREE.SRGBColorSpace;
  concreteTexture.wrapS = concreteTexture.wrapT = THREE.RepeatWrapping;
  concreteTexture.repeat.set(2.2, 1.8);
  concreteTexture.anisotropy = 4;
  textures.add(concreteTexture);

  const concrete = trackMaterial(new THREE.MeshStandardMaterial({
    map: concreteTexture,
    color: "#a2a39e",
    roughness: 0.94,
    metalness: 0.03,
  }));
  const wallMaterial = trackMaterial(new THREE.MeshStandardMaterial({ color: "#737974", roughness: 0.96 }));
  const upperWallMaterial = trackMaterial(new THREE.MeshStandardMaterial({ color: "#92978f", roughness: 0.94 }));
  const darkSteel = trackMaterial(new THREE.MeshStandardMaterial({ color: "#252a2c", roughness: 0.48, metalness: 0.72 }));
  const blackSteel = trackMaterial(new THREE.MeshStandardMaterial({ color: "#111517", roughness: 0.38, metalness: 0.8 }));
  const timber = trackMaterial(new THREE.MeshStandardMaterial({ color: "#795034", roughness: 0.72, metalness: 0.02 }));
  const timberTop = trackMaterial(new THREE.MeshStandardMaterial({ color: "#a4774e", roughness: 0.58, metalness: 0.02 }));
  const timberEdge = trackMaterial(new THREE.MeshStandardMaterial({ color: "#503623", roughness: 0.78 }));
  const cream = trackMaterial(new THREE.MeshStandardMaterial({ color: "#d8d0b9", roughness: 0.55, metalness: 0.12 }));

  box([11, 0.12, 9], [0, -0.06, -0.5], concrete);
  box([11, 4.2, 0.18], [0, 2.1, -5.09], upperWallMaterial);
  box([0.18, 4.2, 9], [-5.59, 2.1, -0.5], wallMaterial);
  box([0.18, 4.2, 9], [5.59, 2.1, -0.5], wallMaterial);
  box([11, 0.12, 9], [0, 4.26, -0.5], upperWallMaterial);
  box([11, 0.18, 0.08], [0, 0.09, -4.96], darkSteel);
  box([0.08, 0.18, 9], [-5.46, 0.09, -0.5], darkSteel);
  box([0.08, 0.18, 9], [5.46, 0.09, -0.5], darkSteel);

  const drivewayTexture = concreteTexture.clone();
  drivewayTexture.repeat.set(2.4, 1.25);
  drivewayTexture.needsUpdate = true;
  textures.add(drivewayTexture);
  const drivewayMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    map: drivewayTexture,
    color: "#a7aaa6",
    roughness: 0.96,
  }));
  box([12, 0.14, 6], [0, -0.1, 7], drivewayMaterial);

  const brick = trackMaterial(new THREE.MeshStandardMaterial({ color: "#725146", roughness: 0.91 }));
  const mortar = trackMaterial(new THREE.MeshStandardMaterial({ color: "#a69c8c", roughness: 1 }));
  box([0.85, 4.2, 0.68], [-4.92, 2.1, 4.04], brick);
  box([0.85, 4.2, 0.68], [4.92, 2.1, 4.04], brick);
  box([9.0, 0.88, 0.68], [0, 3.76, 4.04], brick);
  for (let row = 0; row < 10; row += 1) {
    const y = 0.22 + row * 0.4;
    box([0.86, 0.018, 0.7], [-4.92, y, 4.04], mortar);
    box([0.86, 0.018, 0.7], [4.92, y, 4.04], mortar);
  }
  for (let row = 0; row < 2; row += 1) {
    box([9, 0.018, 0.7], [0, 3.48 + row * 0.4, 4.04], mortar);
  }

  const doorCanvas = makeCanvas(1400, 560);
  const doorContext = doorCanvas.context;
  const doorGradient = doorContext.createLinearGradient(0, 0, 1400, 0);
  doorGradient.addColorStop(0, "#4e585b");
  doorGradient.addColorStop(0.5, "#788083");
  doorGradient.addColorStop(1, "#465053");
  doorContext.fillStyle = doorGradient;
  doorContext.fillRect(0, 0, 1400, 560);
  for (let y = 0; y < 560; y += 70) {
    const rib = doorContext.createLinearGradient(0, y, 0, y + 70);
    rib.addColorStop(0, "rgba(15,22,24,0.55)");
    rib.addColorStop(0.12, "rgba(220,225,220,0.19)");
    rib.addColorStop(0.75, "rgba(255,255,255,0.025)");
    rib.addColorStop(1, "rgba(10,15,16,0.42)");
    doorContext.fillStyle = rib;
    doorContext.fillRect(0, y, 1400, 70);
  }
  for (let i = 0; i < 1800; i += 1) {
    doorContext.fillStyle = `rgba(25,30,28,${random() * 0.12})`;
    doorContext.fillRect(random() * 1400, random() * 560, 1 + random() * 9, 1 + random() * 2);
  }
  doorContext.textAlign = "center";
  doorContext.textBaseline = "middle";
  doorContext.fillStyle = "rgba(230,218,181,0.9)";
  doorContext.font = "900 116px Arial, sans-serif";
  doorContext.fillText("JIM'S GARAGE", 700, 242);
  doorContext.font = "700 35px monospace";
  doorContext.letterSpacing = "5px";
  doorContext.fillText("EXPERIMENTS // JIMSGARAGE.DEV", 700, 342);
  doorContext.globalCompositeOperation = "source-over";
  doorContext.fillStyle = "#202725";
  for (let i = 0; i < 380; i += 1) {
    doorContext.globalAlpha = 0.08 + random() * 0.2;
    doorContext.fillRect(300 + random() * 800, 175 + random() * 205, 2 + random() * 16, 1 + random() * 3);
  }
  doorContext.globalAlpha = 1;

  const doorHitMeshes: THREE.Object3D[] = [];
  const doorMaterials: THREE.MeshStandardMaterial[] = [];
  const doorPanels: THREE.Mesh[] = [];
  const panelHeight = 0.405;
  for (let i = 0; i < 8; i += 1) {
    const panelTexture = new THREE.CanvasTexture(doorCanvas.canvas);
    panelTexture.colorSpace = THREE.SRGBColorSpace;
    panelTexture.wrapS = panelTexture.wrapT = THREE.ClampToEdgeWrapping;
    panelTexture.repeat.set(1, 1 / 8);
    panelTexture.offset.set(0, i / 8);
    panelTexture.anisotropy = 4;
    textures.add(panelTexture);
    const panelMaterial = trackMaterial(new THREE.MeshStandardMaterial({
      map: panelTexture,
      color: "#a9afb0",
      roughness: 0.48,
      metalness: 0.62,
      emissive: "#8c754f",
      emissiveIntensity: 0,
    }));
    const panel = box([8.65, panelHeight - 0.012, 0.09], [0, 0.22 + i * panelHeight, 4], panelMaterial);
    panel.name = `roller-door-slat-${i + 1}`;
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
    const rail = addMesh(new THREE.TubeGeometry(curve, 48, 0.035, 6, false), darkSteel, [0, 0, 0]);
    rail.castShadow = false;
  }
  box([8.95, 0.12, 0.18], [0, 3.3, 4.015], darkSteel);

  const porchMetal = trackMaterial(new THREE.MeshStandardMaterial({ color: "#272b29", roughness: 0.48, metalness: 0.68 }));
  const porchGlow = trackMaterial(new THREE.MeshStandardMaterial({
    color: "#ffe2a8",
    emissive: "#ffad52",
    emissiveIntensity: 3.5,
    roughness: 0.28,
  }));
  box([0.3, 0.42, 0.14], [-4.88, 2.65, 4.46], porchMetal);
  const porchBulb = addMesh(new THREE.SphereGeometry(0.1, 12, 8), porchGlow, [-4.88, 2.65, 4.56]);
  porchBulb.castShadow = false;
  const porchLight = new THREE.PointLight("#ffb463", 8, 5, 2);
  porchLight.position.set(-4.88, 2.65, 4.72);
  group.add(porchLight);

  const exteriorFloodlight = new THREE.SpotLight("#ffd0a0", 180, 14, 0.95, 0.72, 1.4);
  exteriorFloodlight.position.set(0, 3.85, 5.4);
  exteriorFloodlight.target.position.set(0, 1.35, 4);
  group.add(exteriorFloodlight, exteriorFloodlight.target);

  const keypadGroup = new THREE.Group();
  keypadGroup.position.set(4.9, 1.35, 4.43);
  group.add(keypadGroup);
  const keypadMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    color: "#26302d",
    roughness: 0.4,
    metalness: 0.55,
    emissive: "#43d6a0",
    emissiveIntensity: 0.22,
  }));
  const keypad = box([0.27, 0.42, 0.1], [0, 0, 0], keypadMaterial, keypadGroup);
  keypad.name = "garage-keypad";
  doorHitMeshes.push(keypad);
  const keyMaterial = trackMaterial(new THREE.MeshStandardMaterial({ color: "#aab3aa", roughness: 0.55, metalness: 0.35 }));
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
  const keypadLed = addMesh(new THREE.SphereGeometry(0.018, 8, 6), keypadLedMaterial, [0, 0.16, 0.065], keypadGroup);
  keypadLed.castShadow = false;

  const buildBench = (x: number, z: number, width: number, depth: number, alongZ = false, top = 0.96) => {
    const topSize: [number, number, number] = alongZ ? [depth, 0.12, width] : [width, 0.12, depth];
    box(topSize, [x, top - 0.06, z], timberTop);
    const apronSize: [number, number, number] = alongZ ? [depth - 0.08, 0.2, width - 0.12] : [width - 0.12, 0.2, depth - 0.08];
    box(apronSize, [x, top - 0.22, z], timber);
    const halfWidth = width / 2 - 0.16;
    const halfDepth = depth / 2 - 0.13;
    for (const a of [-1, 1]) {
      for (const b of [-1, 1]) {
        const legX = alongZ ? x + b * halfDepth : x + a * halfWidth;
        const legZ = alongZ ? z + a * halfWidth : z + b * halfDepth;
        box([0.12, top - 0.15, 0.12], [legX, (top - 0.15) / 2, legZ], timberEdge);
      }
    }
    const shelfSize: [number, number, number] = alongZ ? [depth - 0.14, 0.07, width - 0.2] : [width - 0.2, 0.07, depth - 0.14];
    box(shelfSize, [x, 0.25, z], timber);
  };

  buildBench(0, -3.55, 5.4, 0.94);
  buildBench(4.05, -2.25, 3.3, 1.1, true);
  buildBench(-4.05, -1.75, 3.9, 1.1, true);
  box([0.82, 0.1, 2.35], [5.02, 1.78, -2.8], timberTop);
  box([0.08, 0.52, 0.08], [5.31, 1.53, -3.75], darkSteel);
  box([0.08, 0.52, 0.08], [5.31, 1.53, -1.85], darkSteel);
  box([0.75, 0.09, 3.5], [-5.02, 1.82, -1.75], timberTop);

  const pegCanvas = makeCanvas(1024, 400);
  const pegContext = pegCanvas.context;
  pegContext.fillStyle = "#9a7853";
  pegContext.fillRect(0, 0, 1024, 400);
  for (let y = 16; y < 400; y += 24) {
    for (let x = 16; x < 1024; x += 24) {
      pegContext.fillStyle = "rgba(31,28,23,0.78)";
      pegContext.beginPath();
      pegContext.arc(x, y, 2.5, 0, Math.PI * 2);
      pegContext.fill();
      pegContext.fillStyle = "rgba(235,205,157,0.24)";
      pegContext.fillRect(x + 3, y - 1, 2, 1);
    }
  }
  const pegTexture = new THREE.CanvasTexture(pegCanvas.canvas);
  pegTexture.colorSpace = THREE.SRGBColorSpace;
  pegTexture.anisotropy = 4;
  textures.add(pegTexture);
  const pegMaterial = trackMaterial(new THREE.MeshStandardMaterial({ map: pegTexture, roughness: 0.8 }));
  box([5.65, 1.65, 0.07], [0, 2.12, -4.92], pegMaterial);
  box([5.78, 0.06, 0.11], [0, 1.28, -4.9], darkSteel);
  box([5.78, 0.06, 0.11], [0, 2.96, -4.9], darkSteel);

  const toolSteel = trackMaterial(new THREE.MeshStandardMaterial({ color: "#adb5b3", roughness: 0.3, metalness: 0.88 }));
  const toolRed = trackMaterial(new THREE.MeshStandardMaterial({ color: "#923e32", roughness: 0.6 }));
  const toolAmber = trackMaterial(new THREE.MeshStandardMaterial({ color: "#d49b3f", roughness: 0.55 }));
  const toolDark = trackMaterial(new THREE.MeshStandardMaterial({ color: "#252b29", roughness: 0.7 }));
  const toolZ = -4.855;
  const wrench = new THREE.Group();
  wrench.position.set(-1.95, 2.13, toolZ);
  wrench.rotation.z = -0.15;
  group.add(wrench);
  box([0.085, 0.64, 0.045], [0, 0, 0], toolSteel, wrench);
  const wrenchHead = addMesh(new THREE.TorusGeometry(0.12, 0.032, 7, 18, Math.PI * 1.55), toolSteel, [0, 0.36, 0], wrench);
  wrenchHead.rotation.z = -Math.PI * 0.77;
  const wrenchBottom = addMesh(new THREE.TorusGeometry(0.09, 0.027, 7, 18), toolSteel, [0, -0.36, 0], wrench);
  wrenchBottom.scale.y = 0.85;

  const hammer = new THREE.Group();
  hammer.position.set(-1.25, 2.08, toolZ);
  hammer.rotation.z = 0.17;
  group.add(hammer);
  box([0.09, 0.68, 0.06], [0, -0.04, 0], timberEdge, hammer);
  box([0.43, 0.13, 0.12], [0, 0.34, 0], toolSteel, hammer);
  box([0.1, 0.18, 0.1], [-0.23, 0.34, 0], toolSteel, hammer);

  for (let i = 0; i < 3; i += 1) {
    const screwdriver = new THREE.Group();
    screwdriver.position.set(-0.55 + i * 0.3, 2.1 + (i % 2) * 0.08, toolZ);
    group.add(screwdriver);
    const handle = addMesh(new THREE.CylinderGeometry(0.055, 0.07, 0.27, 10), i === 1 ? toolAmber : toolRed, [0, 0.2, 0], screwdriver);
    handle.castShadow = true;
    addMesh(new THREE.CylinderGeometry(0.014, 0.014, 0.43, 8), toolSteel, [0, -0.15, 0], screwdriver);
  }
  const tape = addMesh(new THREE.TorusGeometry(0.16, 0.055, 10, 24), toolAmber, [0.55, 2.16, toolZ]);
  tape.scale.y = 1.08;
  box([0.23, 0.07, 0.09], [0.55, 2.0, toolZ], toolDark);
  const cable = addMesh(new THREE.TorusGeometry(0.25, 0.018, 7, 32), toolDark, [1.35, 2.13, toolZ]);
  cable.scale.set(0.85, 1.3, 1);
  const cableInner = addMesh(new THREE.TorusGeometry(0.19, 0.014, 7, 28), toolDark, [1.35, 2.13, toolZ + 0.005]);
  cableInner.scale.set(0.85, 1.3, 1);
  for (const x of [-1.95, -1.25, -0.55, -0.25, 0.05, 0.55, 1.35]) {
    box([0.025, 0.025, 0.12], [x, 2.55, -4.86], toolSteel);
  }

  const signCanvas = makeCanvas(1024, 220);
  const signContext = signCanvas.context;
  signContext.clearRect(0, 0, 1024, 220);
  signContext.textAlign = "center";
  signContext.textBaseline = "middle";
  signContext.font = "700 112px Arial, sans-serif";
  signContext.shadowColor = "#ff9b45";
  signContext.shadowBlur = 30;
  signContext.strokeStyle = "#ffad5c";
  signContext.lineWidth = 5;
  signContext.strokeText("JIM'S GARAGE", 512, 112);
  signContext.shadowBlur = 8;
  signContext.strokeStyle = "#ffe0a6";
  signContext.lineWidth = 2;
  signContext.strokeText("JIM'S GARAGE", 512, 112);
  const signTexture = new THREE.CanvasTexture(signCanvas.canvas);
  signTexture.colorSpace = THREE.SRGBColorSpace;
  textures.add(signTexture);
  const signMaterial = trackMaterial(new THREE.MeshBasicMaterial({
    map: signTexture,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  }));
  const sign = addMesh(new THREE.PlaneGeometry(3.5, 0.75), signMaterial, [0, 3.47, -4.94]);
  sign.castShadow = false;
  const neonBar = addMesh(new THREE.CylinderGeometry(0.018, 0.018, 3.25, 10), porchGlow, [0, 3.08, -4.84]);
  neonBar.rotation.z = Math.PI / 2;
  neonBar.castShadow = false;
  const signLight = new THREE.PointLight("#ff9f50", 3.5, 3.4, 2);
  signLight.position.set(0, 3.25, -4.45);
  group.add(signLight);

  const shadeMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    color: "#29302f",
    roughness: 0.38,
    metalness: 0.76,
    side: THREE.DoubleSide,
  }));
  addMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.62, 8), blackSteel, [0, 3.96, -0.8]);
  addMesh(new THREE.ConeGeometry(0.47, 0.3, 32, 1, true), shadeMaterial, [0, 3.57, -0.8]);
  const shadeRim = addMesh(new THREE.TorusGeometry(0.47, 0.018, 8, 32), darkSteel, [0, 3.42, -0.8]);
  shadeRim.rotation.x = Math.PI / 2;

  const switchHitMeshes: THREE.Object3D[] = [];
  const switchGroup = new THREE.Group();
  switchGroup.position.set(-5.38, 1.45, 1.2);
  group.add(switchGroup);
  const switchPlateMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    color: "#d8d0b9",
    roughness: 0.48,
    metalness: 0.18,
    emissive: "#d7b878",
    emissiveIntensity: 0,
  }));
  const plate = box([0.055, 0.31, 0.21], [0, 0, 0], switchPlateMaterial, switchGroup);
  plate.name = "light-switch-plate";
  const rockerMaterial = trackMaterial(new THREE.MeshStandardMaterial({ color: "#bcb7a8", roughness: 0.5 }));
  const rocker = box([0.07, 0.14, 0.105], [0.045, 0, 0], rockerMaterial, switchGroup);
  rocker.name = "light-switch-rocker";
  switchHitMeshes.push(plate, rocker);
  const switchLedMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    color: "#ffbf69",
    emissive: "#ff9f43",
    emissiveIntensity: 3.2,
  }));
  const switchLed = addMesh(new THREE.SphereGeometry(0.014, 8, 6), switchLedMaterial, [0.037, 0.105, 0], switchGroup);
  switchLed.castShadow = false;

  const dustCount = 120;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustBase = new Float32Array(dustCount * 3);
  const dustPhase = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i += 1) {
    const y = 0.35 + random() * 3.05;
    const spread = 0.35 + (3.45 - y) * 0.43;
    dustBase[i * 3] = (random() - 0.5) * spread * 2;
    dustBase[i * 3 + 1] = y;
    dustBase[i * 3 + 2] = -0.8 + (random() - 0.5) * spread * 1.8;
    dustPositions[i * 3] = dustBase[i * 3];
    dustPositions[i * 3 + 1] = y;
    dustPositions[i * 3 + 2] = dustBase[i * 3 + 2];
    dustPhase[i] = random() * Math.PI * 2;
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
  const nightLed = new THREE.Color("#ff9f43");
  const dayLed = new THREE.Color("#77d9ff");

  const setDoorProgress = (value: number) => {
    const progress = THREE.MathUtils.clamp(value, 0, 1);
    const travel = progress * 5;
    const curveStart = 3.25;
    const radius = 0.75;
    const curveLength = radius * Math.PI * 0.5;
    for (let i = 0; i < doorPanels.length; i += 1) {
      const panel = doorPanels[i];
      const path = 0.22 + i * panelHeight + travel;
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
    keypadMaterial.emissiveIntensity = hovered ? 0.75 : 0.22;
  };

  const setSwitchHovered = (hovered: boolean) => {
    switchHovered = hovered;
    switchPlateMaterial.emissiveIntensity = hovered ? 0.22 : 0;
  };

  const setLightingMode = (_mode: LightingMode, blend: number) => {
    lightingBlend = THREE.MathUtils.clamp(blend, 0, 1);
    rocker.rotation.z = THREE.MathUtils.lerp(-0.24, 0.24, lightingBlend);
    switchLedMaterial.color.copy(nightLed).lerp(dayLed, lightingBlend);
    switchLedMaterial.emissive.copy(nightLed).lerp(dayLed, lightingBlend);
    dustMaterial.opacity = THREE.MathUtils.lerp(0.42, 0.16, lightingBlend);
  };

  const update = (elapsed: number, _dt: number) => {
    const positions = dustGeometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < dustCount; i += 1) {
      const phase = dustPhase[i];
      dustPositions[i * 3] = dustBase[i * 3] + Math.sin(elapsed * 0.19 + phase) * 0.075;
      dustPositions[i * 3 + 1] = dustBase[i * 3 + 1] + Math.sin(elapsed * 0.27 + phase * 1.7) * 0.11;
      dustPositions[i * 3 + 2] = dustBase[i * 3 + 2] + Math.cos(elapsed * 0.16 + phase) * 0.065;
    }
    positions.needsUpdate = true;
    const pulse = (Math.sin(elapsed * 3.2) + 1) * 0.5;
    keypadLedMaterial.emissiveIntensity = 2.8 + pulse * 2.2 + (doorHovered ? 1.5 : 0);
    switchLedMaterial.emissiveIntensity = 2.5 + pulse * 1.2 + (switchHovered ? 2 : 0);
    porchLight.intensity = 8 * (1 + Math.sin(elapsed * 5.7) * 0.012);
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
    textures.forEach((texture) => texture.dispose());
    group.clear();
  };

  setDoorProgress(0);
  setLightingMode("night", 0);

  return {
    group,
    doorHitMeshes,
    switchHitMeshes,
    setDoorProgress,
    setSwitchHovered,
    setDoorHovered,
    setLightingMode,
    update,
    dispose,
  };
}
