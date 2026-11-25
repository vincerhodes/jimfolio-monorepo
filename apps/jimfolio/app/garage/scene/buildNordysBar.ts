import * as THREE from "three";
import type {
  EasterEggId,
  GarageStation,
  LightingMode,
  PlotHandle,
  StationHandle,
  StationId,
} from "../types";
import type { WorkshopTextures } from "./materials";

const CENTER_X = -28.0;
const UP = new THREE.Vector3(0, 1, 0);

type Point = [number, number, number];

function vector(point: Point): THREE.Vector3 {
  return new THREE.Vector3(...point);
}

function mesh<G extends THREE.BufferGeometry, M extends THREE.Material>(
  parent: THREE.Object3D,
  geometry: G,
  material: M,
  position: Point,
  name: string,
): THREE.Mesh<G, M> {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  object.name = name;
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}

function box(
  parent: THREE.Object3D,
  size: Point,
  position: Point,
  material: THREE.Material,
  name: string,
): THREE.Mesh<THREE.BoxGeometry, THREE.Material> {
  const object = mesh(parent, new THREE.BoxGeometry(...size), material, position, name);
  return object;
}

function cylinder(
  parent: THREE.Object3D,
  radius: number,
  height: number,
  position: Point,
  material: THREE.Material,
  name: string,
  radiusTop = radius,
  segments = 16,
): THREE.Mesh<THREE.CylinderGeometry, THREE.Material> {
  return mesh(
    parent,
    new THREE.CylinderGeometry(radiusTop, radius, height, segments),
    material,
    position,
    name,
  );
}

function sphere<M extends THREE.Material>(
  parent: THREE.Object3D,
  radius: number,
  position: Point,
  material: M,
  name: string,
  segments = 16,
): THREE.Mesh<THREE.SphereGeometry, M> {
  return mesh(
    parent,
    new THREE.SphereGeometry(radius, segments, Math.max(8, segments / 2)),
    material,
    position,
    name,
  );
}

function rodBetween(
  parent: THREE.Object3D,
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  material: THREE.Material,
  name: string,
): THREE.Mesh<THREE.CylinderGeometry, THREE.Material> {
  const direction = end.clone().sub(start);
  const object = cylinder(
    parent,
    radius,
    direction.length(),
    start.clone().add(end).multiplyScalar(0.5).toArray(),
    material,
    name,
    radius,
    10,
  );
  object.quaternion.setFromUnitVectors(UP, direction.normalize());
  return object;
}

function positionRod(
  object: THREE.Mesh<THREE.CylinderGeometry, THREE.Material>,
  start: THREE.Vector3,
  end: THREE.Vector3,
): void {
  const direction = end.clone().sub(start);
  object.position.copy(start).add(end).multiplyScalar(0.5);
  object.scale.set(1, direction.length() / object.geometry.parameters.height, 1);
  object.quaternion.setFromUnitVectors(UP, direction.normalize());
}

function canvasTexture(
  width: number,
  height: number,
  paint: (context: CanvasRenderingContext2D) => void,
  ownedTextures: Set<THREE.Texture>,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("A 2D canvas context is required for Nordy's signs.");
  paint(context);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  ownedTextures.add(texture);
  return texture;
}

function paintKiwi(context: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.moveTo(19, 75);
  context.bezierCurveTo(17, 45, 42, 21, 83, 22);
  context.bezierCurveTo(106, 3, 139, 7, 148, 28);
  context.bezierCurveTo(151, 36, 147, 43, 137, 45);
  context.lineTo(202, 54);
  context.lineTo(137, 55);
  context.bezierCurveTo(126, 79, 100, 91, 68, 85);
  context.lineTo(56, 105);
  context.lineTo(47, 105);
  context.lineTo(52, 83);
  context.bezierCurveTo(36, 84, 25, 81, 19, 75);
  context.fill();
  context.lineWidth = 6;
  context.lineCap = "round";
  context.strokeStyle = "#ffffff";
  context.beginPath();
  context.moveTo(76, 83);
  context.lineTo(73, 105);
  context.lineTo(62, 108);
  context.stroke();
  context.restore();
}

function brandTexture(ownedTextures: Set<THREE.Texture>): THREE.CanvasTexture {
  return canvasTexture(1024, 256, (context) => {
    context.clearRect(0, 0, 1024, 256);
    context.shadowColor = "rgba(224, 242, 254, 0.85)";
    context.shadowBlur = 12;
    paintKiwi(context, 42, 48, 1.25);
    context.fillStyle = "#ffffff";
    context.font = "800 166px Arial, Helvetica, sans-serif";
    context.textBaseline = "middle";
    context.fillText("nordys", 325, 139);
  }, ownedTextures);
}

function chalkTexture(ownedTextures: Set<THREE.Texture>): THREE.CanvasTexture {
  return canvasTexture(512, 768, (context) => {
    context.fillStyle = "#15211f";
    context.fillRect(0, 0, 512, 768);
    context.strokeStyle = "rgba(255,255,255,0.12)";
    context.lineWidth = 3;
    for (let index = 0; index < 22; index += 1) {
      const y = 24 + index * 33;
      context.beginPath();
      context.moveTo(25, y);
      context.lineTo(487, y + Math.sin(index) * 3);
      context.stroke();
    }
    context.textAlign = "center";
    context.fillStyle = "#f8fafc";
    context.font = "italic 800 92px Arial, sans-serif";
    context.fillText("nordys", 256, 140);
    context.strokeStyle = "#fbbf24";
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(85, 177);
    context.quadraticCurveTo(256, 193, 427, 177);
    context.stroke();
    context.fillStyle = "#fdba74";
    context.font = "700 49px Arial, sans-serif";
    context.fillText("Burgers · Fries", 256, 290);
    context.fillStyle = "#a7f3d0";
    context.fillText("Cold Beers", 256, 372);
    context.fillStyle = "#f9a8d4";
    context.font = "700 34px Arial, sans-serif";
    context.fillText("SMASHED FRESH", 256, 470);
    context.fillStyle = "#fef3c7";
    context.font = "600 29px Arial, sans-serif";
    context.fillText("DOUBLE · CHEESE · PICKLES", 256, 525);
    context.fillStyle = "#fca5a5";
    context.font = "italic 700 40px Arial, sans-serif";
    context.fillText("Grab a chair!", 256, 650);
  }, ownedTextures);
}

function menuTexture(ownedTextures: Set<THREE.Texture>): THREE.CanvasTexture {
  return canvasTexture(384, 512, (context) => {
    const gradient = context.createLinearGradient(0, 0, 384, 512);
    gradient.addColorStop(0, "#2e1065");
    gradient.addColorStop(1, "#111827");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 384, 512);
    context.strokeStyle = "#c084fc";
    context.lineWidth = 12;
    context.strokeRect(16, 16, 352, 480);
    context.textAlign = "center";
    context.shadowColor = "#d8b4fe";
    context.shadowBlur = 18;
    context.fillStyle = "#f5f3ff";
    context.font = "800 61px Arial, sans-serif";
    context.fillText("NORDY'S", 192, 105);
    context.font = "700 37px Arial, sans-serif";
    context.fillText("SMASH", 192, 190);
    context.fillText("DOUBLE", 192, 242);
    context.fillStyle = "#fb923c";
    context.font = "700 31px Arial, sans-serif";
    context.fillText("FRIES + A PINT", 192, 330);
    context.fillStyle = "#e9d5ff";
    context.font = "600 25px Arial, sans-serif";
    context.fillText("GOOD TIMES", 192, 418);
  }, ownedTextures);
}

function addTextPlane(
  parent: THREE.Object3D,
  texture: THREE.Texture,
  size: [number, number],
  position: Point,
  materialOptions: Partial<THREE.MeshStandardMaterialParameters> = {},
): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial> {
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    roughness: 0.35,
    metalness: 0.05,
    side: THREE.DoubleSide,
    ...materialOptions,
  });
  return mesh(parent, new THREE.PlaneGeometry(...size), material, position, "Printed sign");
}

function createBurger(parent: THREE.Object3D, position: Point, scale = 1): THREE.Group {
  const burger = new THREE.Group();
  burger.position.set(...position);
  burger.scale.setScalar(scale);
  burger.name = "Double smash cheeseburger";
  parent.add(burger);
  const bun = new THREE.MeshStandardMaterial({ color: "#d99a4e", roughness: 0.72 });
  const bunCut = new THREE.MeshStandardMaterial({ color: "#edc17f", roughness: 0.8 });
  const patty = new THREE.MeshStandardMaterial({ color: "#4b2418", roughness: 0.92 });
  const cheese = new THREE.MeshStandardMaterial({ color: "#fbbf24", roughness: 0.65 });
  const lettuce = new THREE.MeshStandardMaterial({ color: "#65a30d", roughness: 0.85 });
  const tomato = new THREE.MeshStandardMaterial({ color: "#dc3f32", roughness: 0.75 });
  const pickle = new THREE.MeshStandardMaterial({ color: "#84a83b", roughness: 0.7 });
  const sesame = new THREE.MeshStandardMaterial({ color: "#fff1c7", roughness: 0.8 });
  cylinder(burger, 0.25, 0.075, [0, 0.04, 0], bunCut, "Bottom bun", 0.23, 24);
  cylinder(burger, 0.245, 0.065, [0, 0.105, 0], patty, "First smashed patty", 0.25, 20);
  const cheeseOne = box(burger, [0.4, 0.022, 0.4], [0, 0.147, 0], cheese, "Melted cheddar");
  cheeseOne.rotation.y = 0.28;
  cylinder(burger, 0.24, 0.065, [0, 0.19, 0], patty, "Second smashed patty", 0.25, 20);
  const cheeseTwo = box(burger, [0.39, 0.02, 0.39], [0, 0.23, 0], cheese, "Double cheddar");
  cheeseTwo.rotation.y = -0.2;
  cylinder(burger, 0.225, 0.027, [0, 0.263, 0], tomato, "Tomato", 0.225, 20);
  const greens = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.035, 6, 24), lettuce);
  greens.rotation.x = Math.PI / 2;
  greens.position.y = 0.29;
  greens.name = "Crisp lettuce";
  burger.add(greens);
  for (let index = 0; index < 5; index += 1) {
    const angle = (index / 5) * Math.PI * 2;
    cylinder(
      burger,
      0.052,
      0.018,
      [Math.cos(angle) * 0.12, 0.315, Math.sin(angle) * 0.12],
      pickle,
      "Extra pickle",
      0.052,
      12,
    );
  }
  const top = sphere(burger, 0.26, [0, 0.37, 0], bun, "Glazed brioche crown", 24);
  top.scale.set(1, 0.56, 1);
  for (let index = 0; index < 12; index += 1) {
    const angle = index * 2.4;
    const radius = 0.04 + (index % 4) * 0.035;
    const seed = sphere(
      burger,
      0.009,
      [Math.cos(angle) * radius, 0.505 - radius * 0.22, Math.sin(angle) * radius],
      sesame,
      "Sesame seed",
      8,
    );
    seed.scale.set(1.8, 0.5, 0.8);
    seed.rotation.y = angle;
  }
  return burger;
}

function createFries(parent: THREE.Object3D, position: Point): void {
  const group = new THREE.Group();
  group.position.set(...position);
  group.name = "Crispy fries basket";
  parent.add(group);
  const basket = new THREE.MeshStandardMaterial({
    color: "#27272a",
    metalness: 0.72,
    roughness: 0.36,
    wireframe: true,
  });
  const paper = new THREE.MeshStandardMaterial({ color: "#f5ead3", roughness: 0.9 });
  const fry = new THREE.MeshStandardMaterial({ color: "#f4c95d", roughness: 0.8 });
  box(group, [0.4, 0.12, 0.31], [0, 0.07, 0], basket, "Wire fry basket");
  box(group, [0.36, 0.015, 0.27], [0, 0.13, 0], paper, "Basket paper");
  for (let index = 0; index < 16; index += 1) {
    const object = box(
      group,
      [0.026, 0.27 + (index % 3) * 0.025, 0.026],
      [-0.15 + (index % 6) * 0.058, 0.25, -0.09 + Math.floor(index / 6) * 0.075],
      fry,
      "Golden fry",
    );
    object.rotation.z = -0.16 + (index % 5) * 0.07;
    object.rotation.x = (index % 3 - 1) * 0.08;
  }
}

function createCondiment(
  parent: THREE.Object3D,
  position: Point,
  color: string,
  name: string,
): void {
  const group = new THREE.Group();
  group.position.set(...position);
  group.name = name;
  parent.add(group);
  const plastic = new THREE.MeshStandardMaterial({ color, roughness: 0.48 });
  const cap = new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.5 });
  cylinder(group, 0.065, 0.24, [0, 0.12, 0], plastic, name, 0.052, 16);
  cylinder(group, 0.038, 0.07, [0, 0.275, 0], cap, "Squeeze bottle nozzle", 0.012, 12);
}

function makeHitBox(
  parent: THREE.Object3D,
  size: Point,
  position: Point,
  name: string,
): THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial> {
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const hit = mesh(parent, new THREE.BoxGeometry(...size), material, position, name);
  hit.castShadow = false;
  hit.receiveShadow = false;
  return hit;
}

function createStationHandle(
  station: GarageStation,
  group: THREE.Group,
  hitMeshes: THREE.Object3D[],
  ring: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>,
): StationHandle {
  let hovered = false;
  let selected = false;
  hitMeshes.forEach((object) => {
    object.userData.stationId = station.id;
  });
  return {
    id: station.id,
    group,
    hitMeshes,
    setHovered: (value: boolean) => {
      hovered = value;
      ring.visible = hovered || selected;
    },
    setSelected: (value: boolean) => {
      selected = value;
      ring.visible = hovered || selected;
    },
    update: (elapsed: number) => {
      if (!ring.visible) return;
      const pulse = 1 + Math.sin(elapsed * 4.5) * 0.06;
      ring.scale.setScalar(pulse);
      ring.material.opacity = selected ? 0.9 : 0.55 + Math.sin(elapsed * 4.5) * 0.15;
    },
  };
}

function stationRing(parent: THREE.Object3D, color: string, radius: number): THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial> {
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    toneMapped: false,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.018, 8, 48), material);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.025;
  ring.visible = false;
  ring.name = "Station highlight";
  parent.add(ring);
  return ring;
}

function createChair(
  parent: THREE.Object3D,
  position: Point,
  rotation: number,
  canvasMaterial: THREE.Material,
  frameMaterial: THREE.Material,
): THREE.Group {
  const chair = new THREE.Group();
  chair.position.set(...position);
  chair.rotation.y = rotation;
  chair.name = "Low folding terracotta street chair";
  parent.add(chair);
  const seat = box(chair, [0.5, 0.045, 0.46], [0, 0.38, 0], canvasMaterial, "Coral canvas seat");
  seat.rotation.x = -0.035;
  const back = box(chair, [0.5, 0.4, 0.035], [0, 0.68, 0.2], canvasMaterial, "Coral canvas back");
  back.rotation.x = -0.13;
  for (const side of [-1, 1]) {
    const x = side * 0.245;
    rodBetween(chair, new THREE.Vector3(x, 0.04, -0.25), new THREE.Vector3(x, 0.76, 0.23), 0.018, frameMaterial, "Folding chair frame");
    rodBetween(chair, new THREE.Vector3(x, 0.04, 0.26), new THREE.Vector3(x, 0.42, -0.23), 0.018, frameMaterial, "Crossed folding leg");
    rodBetween(chair, new THREE.Vector3(x, 0.48, -0.18), new THREE.Vector3(x, 0.49, 0.18), 0.016, frameMaterial, "Low armrest support");
    box(chair, [0.045, 0.035, 0.4], [x, 0.51, 0], frameMaterial, "Terracotta armrest");
    sphere(chair, 0.032, [x, 0.39, 0], frameMaterial, "Folding pivot", 10);
  }
  rodBetween(chair, new THREE.Vector3(-0.25, 0.12, 0.2), new THREE.Vector3(0.25, 0.12, 0.2), 0.014, frameMaterial, "Chair foot brace");
  return chair;
}

function createTable(
  parent: THREE.Object3D,
  position: Point,
  wood: THREE.Material,
  frame: THREE.Material,
): THREE.Group {
  const table = new THREE.Group();
  table.position.set(...position);
  table.name = "Compact square folding patio table";
  parent.add(table);
  box(table, [0.94, 0.065, 0.94], [0, 0.74, 0], wood, "Square wooden table top");
  box(table, [0.98, 0.035, 0.98], [0, 0.695, 0], frame, "Folding table rim");
  for (const z of [-0.31, 0.31]) {
    rodBetween(table, new THREE.Vector3(-0.38, 0.03, z), new THREE.Vector3(0.33, 0.69, z), 0.022, frame, "Folding table crossed leg");
    rodBetween(table, new THREE.Vector3(0.38, 0.03, z), new THREE.Vector3(-0.33, 0.69, z), 0.022, frame, "Folding table crossed leg");
  }
  rodBetween(table, new THREE.Vector3(-0.32, 0.32, -0.31), new THREE.Vector3(-0.32, 0.32, 0.31), 0.018, frame, "Table brace");
  rodBetween(table, new THREE.Vector3(0.32, 0.32, -0.31), new THREE.Vector3(0.32, 0.32, 0.31), 0.018, frame, "Table brace");
  return table;
}

function createFestoon(
  parent: THREE.Object3D,
  start: Point,
  end: Point,
  sag: number,
  bulbCount: number,
  cableMaterial: THREE.Material,
  bulbMaterial: THREE.MeshStandardMaterial,
  socketMaterial: THREE.Material,
  lights: THREE.PointLight[],
): void {
  const from = vector(start);
  const to = vector(end);
  const points: THREE.Vector3[] = [];
  for (let index = 0; index <= 48; index += 1) {
    const t = index / 48;
    const point = from.clone().lerp(to, t);
    point.y -= Math.sin(Math.PI * t) * sag;
    points.push(point);
  }
  const curve = new THREE.CatmullRomCurve3(points);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(curve, 72, 0.012, 6, false), cableMaterial);
  cable.name = "Sweeping festoon cable";
  cable.castShadow = true;
  parent.add(cable);
  for (let index = 0; index < bulbCount; index += 1) {
    const t = (index + 0.5) / bulbCount;
    const point = curve.getPoint(t);
    cylinder(parent, 0.032, 0.085, [point.x, point.y - 0.035, point.z], socketMaterial, "Festoon bulb socket", 0.027, 10);
    const bulb = sphere(parent, 0.092, [point.x, point.y - 0.13, point.z], bulbMaterial, "Large warm glowing festoon bulb", 16);
    bulb.scale.y = 1.08;
    if (index % 4 === 1) {
      const light = new THREE.PointLight("#ffd39a", 7.5, 4.6, 2);
      light.position.set(point.x, point.y - 0.2, point.z);
      light.name = "Festoon pool of warm light";
      parent.add(light);
      lights.push(light);
    }
  }
}

export function buildNordysBar(
  scene: THREE.Scene,
  stations: GarageStation[],
  textures?: WorkshopTextures,
): PlotHandle {
  const group = new THREE.Group();
  group.name = "Nordy's shipping-container burger bar";
  scene.add(group);

  const ownedTextures = new Set<THREE.Texture>();
  const activeLights: THREE.PointLight[] = [];
  const whiteSteel = new THREE.MeshStandardMaterial({
    color: "#f1f5f9",
    metalness: 0.55,
    roughness: 0.32,
  });
  const charcoal = new THREE.MeshStandardMaterial({
    color: "#24292c",
    metalness: 0.48,
    roughness: 0.58,
  });
  const hatchMaterial = new THREE.MeshStandardMaterial({
    color: "#202528",
    metalness: 0.52,
    roughness: 0.55,
    emissive: "#334155",
    emissiveIntensity: 0,
  });
  const chrome = new THREE.MeshStandardMaterial({
    color: "#dbe4ea",
    metalness: 0.94,
    roughness: 0.18,
    map: textures?.brushedMetal.map,
    roughnessMap: textures?.brushedMetal.roughnessMap,
  });
  const stainless = new THREE.MeshStandardMaterial({
    color: "#aab4bb",
    metalness: 0.85,
    roughness: 0.28,
    map: textures?.brushedMetal.map,
    bumpMap: textures?.brushedMetal.bumpMap,
    bumpScale: 0.012,
  });
  const interiorWhite = new THREE.MeshStandardMaterial({
    color: "#c6d7da",
    roughness: 0.58,
    metalness: 0.04,
  });
  const kitchenGlow = new THREE.MeshStandardMaterial({
    color: "#e6f6f9",
    emissive: "#c8eef7",
    emissiveIntensity: 0.9,
    roughness: 0.35,
  });
  const darkWood = new THREE.MeshStandardMaterial({ color: "#211b18", roughness: 0.84 });
  const wood = new THREE.MeshStandardMaterial({
    color: "#b98b5a",
    roughness: 0.7,
    map: textures?.butcherBlock.map,
    bumpMap: textures?.butcherBlock.bumpMap,
    bumpScale: 0.018,
  });
  const patioWood = new THREE.MeshStandardMaterial({ color: "#b69a78", roughness: 0.76 });
  const coral = new THREE.MeshStandardMaterial({ color: "#d97757", roughness: 0.78 });
  const terracotta = new THREE.MeshStandardMaterial({ color: "#c86446", roughness: 0.8 });
  const orangeFrame = new THREE.MeshStandardMaterial({ color: "#b9573d", metalness: 0.42, roughness: 0.48 });
  const blackMetal = new THREE.MeshStandardMaterial({ color: "#171b1c", metalness: 0.65, roughness: 0.42 });

  const concrete = new THREE.MeshStandardMaterial({
    color: "#c5c2b5",
    roughness: 0.86,
    map: textures?.concrete.map,
    bumpMap: textures?.concrete.bumpMap,
    bumpScale: 0.016,
    roughnessMap: textures?.concrete.roughnessMap,
  });
  box(group, [10.7, 0.12, 6.8], [-27.85, -0.055, 4.2], concrete, "Smooth light-concrete south courtyard");
  for (const x of [-31.4, -24.6]) {
    box(group, [0.15, 3.05, 0.15], [x, 1.525, -2.125], whiteSteel, "ISO rear corner post");
    box(group, [0.15, 3.05, 0.15], [x, 1.525, 0.725], whiteSteel, "ISO front corner post");
    box(group, [0.12, 3.05, 2.85], [x, 1.525, -0.7], charcoal, "Charcoal corrugated container side");
    for (let index = 0; index < 13; index += 1) {
      box(group, [0.045, 2.82, 0.055], [x + (x < CENTER_X ? 0.075 : -0.075), 1.52, -2.02 + index * 0.22], charcoal, "Side wall corrugation");
    }
  }
  box(group, [6.8, 3.05, 0.13], [CENTER_X, 1.525, -2.135], charcoal, "Container back wall");
  for (let index = 0; index < 29; index += 1) {
    box(group, [0.055, 2.82, 0.045], [-31.28 + index * 0.235, 1.52, -2.055], charcoal, "Back wall corrugation");
  }
  box(group, [6.8, 0.14, 3.0], [CENTER_X, 2.98, -0.7], charcoal, "Container roof");
  box(group, [6.8, 0.13, 3.0], [CENTER_X, 0.035, -0.7], charcoal, "Container floor");
  for (const z of [-2.2, 0.8]) {
    box(group, [6.95, 0.16, 0.16], [CENTER_X, 3.0, z], whiteSteel, "White roof perimeter beam");
    box(group, [6.95, 0.16, 0.16], [CENTER_X, 0.08, z], whiteSteel, "White bottom perimeter beam");
  }
  for (const x of [-31.4, -24.6]) {
    box(group, [0.16, 0.16, 3.15], [x, 3.0, -0.7], whiteSteel, "White side roof beam");
  }
  for (const x of [-31.32, -24.68]) {
    for (const y of [0.16, 2.92]) {
      for (const z of [-2.12, 0.72]) {
        box(group, [0.24, 0.24, 0.24], [x, y, z], whiteSteel, "ISO corner casting");
      }
    }
  }

  box(group, [5.15, 0.9, 0.12], [CENTER_X, 0.54, 0.73], charcoal, "Front lower corrugated panel");
  for (let index = 0; index < 23; index += 1) {
    box(group, [0.045, 0.76, 0.04], [-30.48 + index * 0.225, 0.53, 0.81], charcoal, "Serving panel corrugation");
  }
  box(group, [0.8, 1.65, 0.12], [-31.0, 1.78, 0.73], charcoal, "Left hatch jamb panel");
  box(group, [0.8, 1.65, 0.12], [-25.0, 1.78, 0.73], charcoal, "Right hatch jamb panel");
  for (const x of [-30.67, -25.33]) {
    box(group, [0.1, 1.7, 0.12], [x, 1.76, 0.8], whiteSteel, "Crisp white serving hatch upright");
  }
  box(group, [5.45, 0.11, 0.12], [CENTER_X, 2.57, 0.8], whiteSteel, "Serving hatch header");
  box(group, [6.35, 2.55, 0.06], [CENTER_X, 1.55, -1.98], interiorWhite, "Bright clean kitchen backsplash");
  box(group, [0.06, 2.5, 2.45], [-31.23, 1.53, -0.72], interiorWhite, "Cool-white left kitchen lining");
  box(group, [0.06, 2.5, 2.45], [-24.77, 1.53, -0.72], interiorWhite, "Cool-white right kitchen lining");
  box(group, [6.15, 0.06, 2.45], [CENTER_X, 2.84, -0.75], interiorWhite, "White kitchen ceiling");
  for (let index = 0; index < 18; index += 1) {
    box(group, [0.012, 2.4, 0.008], [-30.95 + index * 0.35, 1.55, -1.943], chrome, "Backsplash tile grout");
  }
  for (const y of [0.65, 1.05, 1.45, 1.85, 2.25, 2.65]) {
    box(group, [6.1, 0.012, 0.008], [CENTER_X, y, -1.94], chrome, "Horizontal tile grout");
  }
  for (const x of [-29.65, -26.35]) {
    box(group, [1.75, 0.055, 0.48], [x, 2.77, -0.45], kitchenGlow, "Cool-white kitchen light panel");
    const light = new THREE.PointLight("#e4f8ff", 4.2, 5.5, 2);
    light.position.set(x, 2.5, -0.2);
    light.name = "Bright interior kitchen light";
    group.add(light);
    activeLights.push(light);
  }
  box(group, [5.75, 0.12, 0.72], [CENTER_X, 1.0, 0.45], stainless, "Stainless serving counter");
  box(group, [5.82, 0.1, 0.1], [CENTER_X, 1.015, 0.82], charcoal, "Dark serving counter lip");
  box(group, [5.55, 0.06, 0.5], [CENTER_X, 1.5, -1.62], stainless, "Kitchen wall shelf");
  for (let index = 0; index < 8; index += 1) {
    const jarMaterial = new THREE.MeshStandardMaterial({
      color: index % 2 === 0 ? "#f1f5f9" : "#d6b98a",
      roughness: 0.55,
    });
    cylinder(group, 0.085, 0.22 + (index % 3) * 0.035, [-30.2 + index * 0.55, 1.65, -1.62], jarMaterial, "Kitchen ingredient jar", 0.085, 12);
  }

  const brand = brandTexture(ownedTextures);
  box(group, [3.85, 0.78, 0.1], [CENTER_X, 3.48, 0.66], charcoal, "Rooftop sign backing");
  for (const x of [-29.45, -26.55]) {
    box(group, [0.08, 0.48, 0.08], [x, 3.16, 0.65], whiteSteel, "Rooftop sign mount at y 3.12");
  }
  const roofSign = addTextPlane(group, brand, [3.65, 0.72], [CENTER_X, 3.49, 0.725], {
    emissive: new THREE.Color("#effaff"),
    emissiveMap: brand,
    emissiveIntensity: 1.9,
    toneMapped: false,
  });
  roofSign.name = "Glowing white kiwi and lowercase nordys rooftop sign";

  const hatch = new THREE.Group();
  hatch.position.set(CENTER_X, 2.55, 0.84);
  hatch.name = "Top-hinged propped-up dark serving hatch";
  group.add(hatch);
  const hatchPanel = box(hatch, [5.2, 1.5, 0.09], [0, -0.75, 0], hatchMaterial, "Clickable corrugated serving hatch");
  const hatchHitMeshes: THREE.Object3D[] = [hatchPanel];
  for (let index = 0; index < 23; index += 1) {
    box(hatch, [0.04, 1.36, 0.035], [-2.45 + index * 0.223, -0.75, 0.06], hatchMaterial, "Hatch steel corrugation");
  }
  const hatchStencil = addTextPlane(hatch, brand, [2.55, 0.62], [0, -0.76, 0.065], {
    color: "#cbd5e1",
    emissive: "#64748b",
    emissiveIntensity: 0.15,
  });
  hatchStencil.name = "Kiwi nordys hatch stencil";
  box(hatch, [4.8, 0.045, 0.16], [0, -1.42, -0.02], kitchenGlow, "Awning underside light strip");
  const struts: Array<{
    object: THREE.Mesh<THREE.CylinderGeometry, THREE.Material>;
    fixed: THREE.Vector3;
    moving: THREE.Vector3;
  }> = [];
  for (const x of [-2.35, 2.35]) {
    const fixed = new THREE.Vector3(CENTER_X + x, 2.15, 0.72);
    const moving = new THREE.Vector3(x, -1.22, 0);
    const worldMoving = moving.clone().applyMatrix4(hatch.matrixWorld);
    const object = rodBetween(group, fixed, worldMoving, 0.025, chrome, "Chrome hatch gas strut");
    struts.push({ object, fixed, moving });
  }

  const chalk = new THREE.Group();
  chalk.position.set(-30.2, 0.02, 2.4);
  chalk.rotation.y = -0.08;
  chalk.name = "Black wooden A-frame chalkboard menu";
  group.add(chalk);
  const chalkMap = chalkTexture(ownedTextures);
  for (const direction of [-1, 1]) {
    const panel = new THREE.Group();
    panel.position.set(0, 0.83, direction * 0.18);
    panel.rotation.x = direction * -0.14;
    chalk.add(panel);
    box(panel, [0.82, 1.25, 0.055], [0, 0, 0], darkWood, "Chalkboard black wooden frame");
    if (direction === 1) {
      addTextPlane(panel, chalkMap, [0.7, 1.1], [0, 0, 0.032], { roughness: 0.95 });
    }
    for (const x of [-0.37, 0.37]) {
      rodBetween(chalk, new THREE.Vector3(x, 0, direction * 0.43), new THREE.Vector3(x, 1.52, 0), 0.035, darkWood, "A-frame chalkboard leg");
    }
  }
  rodBetween(chalk, new THREE.Vector3(-0.4, 0.62, -0.29), new THREE.Vector3(-0.4, 0.62, 0.29), 0.013, chrome, "Chalkboard restraint chain");

  const clusters: Array<{ center: Point; rotation: number }> = [
    { center: [-30.0, 0, 4.55], rotation: 0.12 },
    { center: [-26.2, 0, 3.65], rotation: -0.08 },
    { center: [-28.35, 0, 6.3], rotation: 0.2 },
    { center: [-23.9, 0, 5.55], rotation: -0.18 },
  ];
  clusters.forEach(({ center, rotation }, clusterIndex) => {
    const cluster = new THREE.Group();
    cluster.position.set(...center);
    cluster.rotation.y = rotation;
    cluster.name = `Terracotta patio cluster ${clusterIndex + 1}`;
    group.add(cluster);
    createTable(cluster, [0, 0, 0], patioWood, orangeFrame);
    const chairPositions: Array<{ point: Point; angle: number }> = [
      { point: [0, 0, 0.93], angle: 0 },
      { point: [0, 0, -0.93], angle: Math.PI },
      { point: [0.94, 0, 0], angle: -Math.PI / 2 },
      { point: [-0.94, 0, 0], angle: Math.PI / 2 },
    ];
    chairPositions.forEach(({ point, angle }, chairIndex) => {
      createChair(cluster, point, angle, (clusterIndex + chairIndex) % 2 === 0 ? coral : terracotta, orangeFrame);
    });
  });

  const tree = new THREE.Group();
  tree.position.set(-23.6, 0, 1.4);
  tree.name = "Leafy courtyard shade tree with red lanterns";
  group.add(tree);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: "#5a3b26", roughness: 0.95 });
  const leafMaterials = [
    new THREE.MeshStandardMaterial({ color: "#3f612d", roughness: 0.94 }),
    new THREE.MeshStandardMaterial({ color: "#557c36", roughness: 0.92 }),
    new THREE.MeshStandardMaterial({ color: "#6c8d3d", roughness: 0.9 }),
  ];
  cylinder(tree, 0.17, 2.6, [0, 1.3, 0], trunkMaterial, "Warm tree trunk", 0.11, 12);
  const branchEnds: Point[] = [
    [-0.85, 2.65, 0.2], [0.75, 2.8, 0.35], [0.25, 3.05, -0.75],
    [-0.55, 2.75, -0.65], [0.8, 2.5, -0.45], [0.05, 3.35, 0.1],
  ];
  branchEnds.forEach((end, index) => {
    rodBetween(tree, new THREE.Vector3(0, 1.55 + (index % 2) * 0.25, 0), vector(end), 0.065, trunkMaterial, "Tree branch");
    for (let leaf = 0; leaf < 4; leaf += 1) {
      const foliage = mesh(
        tree,
        new THREE.IcosahedronGeometry(0.62 + (leaf % 2) * 0.12, 1),
        leafMaterials[(index + leaf) % leafMaterials.length],
        [end[0] + Math.sin(leaf * 2.1) * 0.45, end[1] + (leaf % 2) * 0.32, end[2] + Math.cos(leaf * 2.1) * 0.42],
        "Leafy green canopy",
      );
      foliage.scale.set(1.1, 0.8, 1);
    }
  });
  const lanternMaterial = new THREE.MeshStandardMaterial({
    color: "#dc2626",
    emissive: "#ef4444",
    emissiveIntensity: 1.25,
    roughness: 0.5,
  });
  const lanternPositions: Point[] = [[-0.7, 2.15, 0.25], [0.65, 2.25, 0.15], [0.2, 2.45, -0.7]];
  lanternPositions.forEach((position) => {
    rodBetween(tree, new THREE.Vector3(position[0], position[1] + 0.35, position[2]), new THREE.Vector3(position[0], position[1] + 0.1, position[2]), 0.009, blackMetal, "Lantern hanging cord");
    const lantern = sphere(tree, 0.13, position, lanternMaterial, "Tiny red courtyard lantern", 12);
    lantern.scale.y = 1.25;
    cylinder(tree, 0.075, 0.035, [position[0], position[1] + 0.15, position[2]], blackMetal, "Lantern cap", 0.075, 10);
  });
  const treeLight = new THREE.PointLight("#ffb46b", 10, 5.5, 2);
  treeLight.position.set(0, 2.35, 0.2);
  treeLight.name = "Warm tree and lantern light";
  tree.add(treeLight);
  activeLights.push(treeLight);

  const bulbMaterial = new THREE.MeshStandardMaterial({
    color: "#fff1c7",
    emissive: "#ffca78",
    emissiveIntensity: 2.0,
    roughness: 0.25,
    toneMapped: false,
  });
  const polePositions: Array<[number, number]> = [[-33.0, 0.5], [-22.5, 6.9], [-33.0, 6.9], [-22.5, 0.5]];
  for (const [x, z] of polePositions) {
    cylinder(group, 0.045, 4.2, [x, 2.1, z], blackMetal, "Tall steel festoon pole", 0.045, 12);
    sphere(group, 0.075, [x, 4.22, z], chrome, "Festoon pole finial", 12);
  }
  createFestoon(group, [-33.0, 4.2, 0.5], [-22.5, 4.15, 6.9], 0.48, 18, blackMetal, bulbMaterial, blackMetal, activeLights);
  createFestoon(group, [-33.0, 4.05, 6.9], [-22.5, 4.3, 0.5], 0.43, 18, blackMetal, bulbMaterial, blackMetal, activeLights);
  const patioLight = new THREE.PointLight("#ffd2a1", 14, 8.5, 2);
  patioLight.position.set(-27.7, 3.25, 4.2);
  patioLight.name = "Warm courtyard ambient light";
  group.add(patioLight);
  activeLights.push(patioLight);

  const handles = new Map<StationId, StationHandle>();
  const burgerStation = stations.find((station) => station.id === "nordy-burgers");
  let grillHit: THREE.Object3D | undefined;
  const steamPuffs: Array<{ object: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>; phase: number; drift: number }> = [];
  if (burgerStation) {
    const stationGroup = new THREE.Group();
    stationGroup.position.set(...burgerStation.anchorPosition);
    stationGroup.name = "Nordy's commercial smash-burger serving pass";
    group.add(stationGroup);
    box(stationGroup, [1.15, 0.28, 0.68], [-0.25, 0.13, -0.08], stainless, "Commercial stainless flat-top grill");
    const grillTop = box(stationGroup, [1.08, 0.035, 0.59], [-0.25, 0.29, -0.07], charcoal, "Sizzling seasoned flat-top");
    grillHit = grillTop;
    grillTop.userData.easterEggId = "grill";
    box(stationGroup, [1.12, 0.28, 0.045], [-0.25, 0.42, -0.4], stainless, "Flat-top backsplash");
    for (let index = 0; index < 4; index += 1) {
      const knob = cylinder(stationGroup, 0.045, 0.04, [-0.61 + index * 0.24, 0.14, 0.285], blackMetal, "Grill control knob", 0.045, 12);
      knob.rotation.x = Math.PI / 2;
    }
    for (const x of [-0.45, -0.1]) {
      cylinder(stationGroup, 0.14, 0.035, [x, 0.325, -0.05], new THREE.MeshStandardMaterial({ color: "#5b2d1c", roughness: 0.9 }), "Smash patty on grill", 0.15, 18);
    }
    const steamMaterial = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      emissive: "#f8fafc",
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      roughness: 1,
    });
    for (let index = 0; index < 8; index += 1) {
      const material = steamMaterial.clone();
      const puff = sphere(stationGroup, 0.07 + (index % 3) * 0.018, [-0.45 + (index % 4) * 0.16, 0.45, -0.05], material, "Rising white grill sizzle steam", 12);
      puff.castShadow = false;
      steamPuffs.push({ object: puff, phase: index / 8, drift: index % 2 === 0 ? 1 : -1 });
    }
    box(stationGroup, [0.75, 0.045, 0.58], [0.95, 0.035, 0.02], wood, "Wooden burger serving board");
    createBurger(stationGroup, [0.95, 0.065, 0.02], 1.05);
    createFries(stationGroup, [1.52, 0.02, -0.03]);
    createCondiment(stationGroup, [0.55, 0.02, -0.38], "#dc2626", "Ketchup bottle");
    createCondiment(stationGroup, [0.76, 0.02, -0.4], "#eab308", "Mustard bottle");
    const menu = new THREE.Group();
    menu.position.set(-1.12, 0.02, 0.05);
    menu.rotation.y = 0.08;
    menu.name = "Glowing purple neon tabletop menu";
    stationGroup.add(menu);
    box(menu, [0.46, 0.64, 0.055], [0, 0.32, 0], blackMetal, "Tabletop menu frame");
    addTextPlane(menu, menuTexture(ownedTextures), [0.41, 0.57], [0, 0.33, 0.032], {
      emissive: "#a855f7",
      emissiveIntensity: 1.25,
      toneMapped: false,
    });
    const hit = makeHitBox(stationGroup, [3.35, 0.85, 1.0], [0.15, 0.35, 0], "Nordy burgers station hit area");
    const ring = stationRing(stationGroup, burgerStation.accentHex, 1.38);
    handles.set(burgerStation.id, createStationHandle(burgerStation, stationGroup, [hit], ring));
  }

  const tap = new THREE.Group();
  tap.position.set(-25.6, 1.05, 0.55);
  tap.name = "Chrome beer tap tower";
  group.add(tap);
  cylinder(tap, 0.13, 0.045, [0, 0.025, 0], chrome, "Beer tap base", 0.13, 20);
  cylinder(tap, 0.075, 0.58, [0, 0.32, 0], chrome, "Chrome beer tap tower", 0.065, 20);
  rodBetween(tap, new THREE.Vector3(0, 0.57, 0), new THREE.Vector3(0, 0.57, 0.23), 0.042, chrome, "Curved tap swan neck");
  cylinder(tap, 0.033, 0.13, [0, 0.515, 0.23], chrome, "Beer tap nozzle", 0.033, 12);
  const tapHandle = new THREE.Group();
  tapHandle.position.set(0, 0.62, 0.04);
  tapHandle.name = "Pullable tap handle";
  tap.add(tapHandle);
  rodBetween(tapHandle, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.24, 0), 0.025, chrome, "Tap handle stem");
  box(tapHandle, [0.11, 0.2, 0.065], [0, 0.28, 0], darkWood, "Nordy's tap handle badge");
  const tapHit = makeHitBox(tap, [0.5, 1.05, 0.6], [0, 0.43, 0.08], "Beer tap Easter egg hit area");
  tapHit.userData.easterEggId = "tap";

  const patioStation = stations.find((station) => station.id === "nordy-patio");
  let candleFlame: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial> | undefined;
  let candleLight: THREE.PointLight | undefined;
  if (patioStation) {
    const stationGroup = new THREE.Group();
    stationGroup.position.set(...patioStation.anchorPosition);
    stationGroup.name = "Nordy's featured south courtyard folding table";
    group.add(stationGroup);
    box(stationGroup, [0.63, 0.035, 0.46], [-0.1, 0.025, 0], wood, "Wooden burger tray");
    createBurger(stationGroup, [-0.12, 0.055, 0], 0.72);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: "#f3f8fa",
      transmission: 0.45,
      transparent: true,
      opacity: 0.38,
      roughness: 0.08,
      metalness: 0,
      thickness: 0.025,
      side: THREE.DoubleSide,
    });
    const beerMaterial = new THREE.MeshPhysicalMaterial({
      color: "#d98a22",
      emissive: "#7c3f08",
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 0.78,
      roughness: 0.18,
      transmission: 0.12,
    });
    const foamMaterial = new THREE.MeshStandardMaterial({ color: "#fff8e8", roughness: 0.9 });
    cylinder(stationGroup, 0.105, 0.43, [0.31, 0.245, -0.12], glassMaterial, "Tall frosty pint glass", 0.13, 24);
    cylinder(stationGroup, 0.092, 0.34, [0.31, 0.205, -0.12], beerMaterial, "Cold amber beer", 0.112, 24);
    cylinder(stationGroup, 0.114, 0.075, [0.31, 0.435, -0.12], foamMaterial, "White pint foam", 0.118, 24);
    for (let index = 0; index < 7; index += 1) {
      sphere(stationGroup, 0.009, [0.4, 0.12 + index * 0.045, -0.1 + Math.sin(index) * 0.04], foamMaterial, "Frosty glass condensation", 8);
    }
    const card = box(stationGroup, [0.25, 0.018, 0.34], [-0.34, 0.03, 0.23], interiorWhite, "Folded menu card");
    card.rotation.y = -0.22;
    const cardFold = box(stationGroup, [0.25, 0.018, 0.22], [-0.34, 0.105, 0.31], interiorWhite, "Raised fold of menu card");
    cardFold.rotation.x = -0.85;
    cardFold.rotation.y = -0.22;
    const candleGlass = new THREE.MeshPhysicalMaterial({
      color: "#fbbf24",
      transparent: true,
      opacity: 0.4,
      roughness: 0.2,
      transmission: 0.3,
    });
    cylinder(stationGroup, 0.085, 0.16, [0.28, 0.09, 0.27], candleGlass, "Warm table candle holder", 0.085, 18);
    const flameMaterial = new THREE.MeshStandardMaterial({
      color: "#fff7c2",
      emissive: "#ff9f43",
      emissiveIntensity: 2.4,
      toneMapped: false,
    });
    candleFlame = sphere(stationGroup, 0.035, [0.28, 0.205, 0.27], flameMaterial, "Glowing candle flame", 12);
    candleFlame.scale.set(0.7, 1.45, 0.7);
    candleLight = new THREE.PointLight("#ffb45e", 2.5, 2.2, 2);
    candleLight.position.set(0.28, 0.27, 0.27);
    stationGroup.add(candleLight);
    activeLights.push(candleLight);
    const hit = makeHitBox(stationGroup, [1.0, 0.7, 0.95], [0, 0.25, 0], "Nordy patio station hit area");
    const ring = stationRing(stationGroup, patioStation.accentHex, 0.65);
    handles.set(patioStation.id, createStationHandle(patioStation, stationGroup, [hit], ring));
  }

  const interiorEasterEggHitMeshes: THREE.Object3D[] = [];
  if (grillHit) interiorEasterEggHitMeshes.push(grillHit);
  interiorEasterEggHitMeshes.push(tapHit);
  const exteriorEasterEggHitMeshes: THREE.Object3D[] = [tapHit];
  let grillBoost = 0;
  let tapAnimation = 0;
  let lightsActive = true;
  let nightAmount = 1;
  let doorTarget = 0;
  let disposed = false;

  const setDoorProgress = (value: number): void => {
    doorTarget = THREE.MathUtils.clamp(value, 0, 1);
    hatch.rotation.x = -1.42 * doorTarget;
    hatch.updateMatrixWorld(true);
    struts.forEach(({ object, fixed, moving }) => {
      const worldMoving = moving.clone().applyMatrix4(hatch.matrixWorld);
      positionRod(object, fixed, worldMoving);
    });
  };
  setDoorProgress(0);

  return {
    group,
    doorHitMeshes: hatchHitMeshes,
    exteriorEasterEggHitMeshes,
    interiorEasterEggHitMeshes,
    handles,
    triggerEasterEgg: (id: EasterEggId): string => {
      if (id === "grill") {
        grillBoost = 2.5;
        return "Double smash burger with extra pickles hitting the pass at Nordy's!";
      }
      if (id === "tap") {
        tapAnimation = 1;
        return "Cold pint poured on the house — grab an orange chair at Nordy's.";
      }
      return "";
    },
    setDoorProgress,
    setDoorHovered: (hovered: boolean) => {
      hatchMaterial.emissiveIntensity = hovered ? 0.32 : 0;
    },
    setLightingMode: (mode: LightingMode, blend: number) => {
      const amount = THREE.MathUtils.clamp(blend, 0, 1);
      nightAmount = mode === "night" ? amount : 1 - amount;
      roofSign.material.emissiveIntensity = 0.45 + nightAmount * 1.45;
      bulbMaterial.emissiveIntensity = 0.3 + nightAmount * 1.7;
      activeLights.forEach((light) => {
        light.visible = lightsActive;
      });
    },
    setActiveLights: (active: boolean) => {
      lightsActive = active;
      activeLights.forEach((light) => {
        light.visible = active;
      });
    },
    update: (elapsed: number, dt: number) => {
      grillBoost = Math.max(0, grillBoost - dt);
      steamPuffs.forEach(({ object, phase, drift }, index) => {
        const speed = grillBoost > 0 ? 0.85 : 0.36;
        const cycle = (elapsed * speed + phase) % 1;
        object.position.y = 0.38 + cycle * (grillBoost > 0 ? 0.9 : 0.56);
        object.position.x = -0.45 + (index % 4) * 0.16 + Math.sin(cycle * 5 + index) * 0.055 * drift;
        object.position.z = -0.05 + Math.cos(cycle * 4 + index) * 0.04;
        object.scale.setScalar(0.65 + cycle * 1.5);
        object.material.opacity = (1 - cycle) * (grillBoost > 0 ? 0.65 : 0.24);
      });
      if (tapAnimation > 0) {
        tapAnimation = Math.max(0, tapAnimation - dt * 1.25);
        tapHandle.rotation.x = -Math.sin((1 - tapAnimation) * Math.PI) * 0.62;
      } else {
        tapHandle.rotation.x = 0;
      }
      if (candleFlame && candleLight) {
        const flicker = 1 + Math.sin(elapsed * 13.7) * 0.09 + Math.sin(elapsed * 21.3) * 0.05;
        candleFlame.scale.set(0.7 / flicker, 1.45 * flicker, 0.7 / flicker);
        candleLight.intensity = (0.35 + nightAmount * 2.15) * flicker;
      }
      activeLights.forEach((light) => {
        if (light === candleLight) return;
        if (!light.userData.baseIntensity) light.userData.baseIntensity = light.intensity;
        light.intensity = light.userData.baseIntensity * (0.18 + nightAmount * 0.82);
      });
      handles.forEach((handle) => handle.update(elapsed, dt));
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      scene.remove(group);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      group.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        geometries.add(object.geometry);
        const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
        objectMaterials.forEach((material) => materials.add(material));
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      ownedTextures.forEach((texture) => texture.dispose());
      activeLights.length = 0;
      handles.clear();
    },
  };
}
