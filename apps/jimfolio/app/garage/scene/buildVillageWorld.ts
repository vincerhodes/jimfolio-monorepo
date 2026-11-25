import * as THREE from "three";
import type { DriveBoundsBox, LightingMode } from "../types";
import type { WorkshopTextures } from "./materials";

export interface VillageWorldHandle {
  group: THREE.Group;
  obstacles: DriveBoundsBox[];
  worldBounds: DriveBoundsBox;
  setLightingMode: (mode: LightingMode, blend: number) => void;
  update: (elapsed: number, dt: number) => void;
  dispose: () => void;
}

type RoadPoint = { x: number; z: number; tx: number; tz: number };
type OceanSurface = { mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>; base: Float32Array };

const ROAD_WIDTH = 5.2;
const ROAD_RADIUS = 11.35;
const ROAD_CENTER_Z = -1.15;

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function roadPoints(): RoadPoint[] {
  const points: RoadPoint[] = [];
  const straightSegments = 72;
  const turnSegments = 36;
  for (let index = 0; index <= straightSegments; index += 1) {
    const t = index / straightSegments;
    points.push({ x: -36 + t * 62, z: 10.2, tx: 1, tz: 0 });
  }
  for (let index = 1; index <= turnSegments; index += 1) {
    const angle = Math.PI / 2 - (index / turnSegments) * Math.PI;
    points.push({
      x: 26 + Math.cos(angle) * ROAD_RADIUS,
      z: ROAD_CENTER_Z + Math.sin(angle) * ROAD_RADIUS,
      tx: Math.sin(angle),
      tz: -Math.cos(angle),
    });
  }
  for (let index = 1; index <= straightSegments; index += 1) {
    const t = index / straightSegments;
    points.push({ x: 26 - t * 62, z: -12.5, tx: -1, tz: 0 });
  }
  for (let index = 1; index <= turnSegments; index += 1) {
    const angle = -Math.PI / 2 - (index / turnSegments) * Math.PI;
    points.push({
      x: -36 + Math.cos(angle) * ROAD_RADIUS,
      z: ROAD_CENTER_Z + Math.sin(angle) * ROAD_RADIUS,
      tx: Math.sin(angle),
      tz: -Math.cos(angle),
    });
  }
  return points;
}

function ribbonGeometry(points: RoadPoint[], width: number): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let distance = 0;
  points.forEach((point, index) => {
    if (index > 0) {
      const previous = points[index - 1];
      distance += Math.hypot(point.x - previous.x, point.z - previous.z);
    }
    const nx = -point.tz;
    const nz = point.tx;
    positions.push(
      point.x + nx * width * 0.5, 0, point.z + nz * width * 0.5,
      point.x - nx * width * 0.5, 0, point.z - nz * width * 0.5,
    );
    uvs.push(0, distance / 4, 1, distance / 4);
    if (index < points.length - 1) {
      const offset = index * 2;
      indices.push(offset, offset + 2, offset + 1, offset + 2, offset + 3, offset + 1);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("A 2D canvas context is required to create the village road.");
  const image = context.createImageData(256, 256);
  const random = seededRandom(0x51a7);
  for (let index = 0; index < image.data.length; index += 4) {
    const grain = random() * 24 - 12;
    const aggregate = random() > 0.975 ? 30 : 0;
    const value = 65 + grain + aggregate;
    image.data[index] = value;
    image.data[index + 1] = value + 2;
    image.data[index + 2] = value + 1;
    image.data[index + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  context.strokeStyle = "rgba(25, 28, 26, .28)";
  context.lineWidth = 1;
  for (let index = 0; index < 9; index += 1) {
    const x = random() * 256;
    const y = random() * 256;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + random() * 38 - 19, y + random() * 60 - 30);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function makeSignTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 160;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("A 2D canvas context is required to create village signs.");
  context.fillStyle = "#765233";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#b99361";
  context.lineWidth = 9;
  context.strokeRect(7, 7, canvas.width - 14, canvas.height - 14);
  context.fillStyle = "#fff0c9";
  context.font = "bold 48px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function addMesh(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number],
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function setInstance(mesh: THREE.InstancedMesh, index: number, position: THREE.Vector3, rotation: number, scale: THREE.Vector3): void {
  const matrix = new THREE.Matrix4();
  matrix.compose(position, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotation), scale);
  mesh.setMatrixAt(index, matrix);
}

function createOcean(
  group: THREE.Group,
  width: number,
  depth: number,
  segmentsX: number,
  segmentsZ: number,
  position: [number, number, number],
  material: THREE.MeshStandardMaterial,
): OceanSurface {
  const geometry = new THREE.PlaneGeometry(width, depth, segmentsX, segmentsZ);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(...position);
  mesh.receiveShadow = true;
  group.add(mesh);
  const attribute = geometry.getAttribute("position");
  return { mesh, base: new Float32Array(attribute.array) };
}

export function buildVillageWorld(scene: THREE.Scene, textures?: WorkshopTextures): VillageWorldHandle {
  const group = new THREE.Group();
  group.name = "village-world";
  scene.add(group);
  const ownedTextures: THREE.Texture[] = [];
  const random = seededRandom(0xc0a57);

  const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x718553, roughness: 1 });
  const sandMaterial = new THREE.MeshStandardMaterial({ color: 0xd8c28e, roughness: 1 });
  const earthMaterial = new THREE.MeshStandardMaterial({ color: 0x79684b, roughness: 1 });
  const roadTexture = makeAsphaltTexture();
  ownedTextures.push(roadTexture);
  const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b8c82,
    map: roadTexture,
    bumpMap: textures?.concrete.bumpMap,
    bumpScale: 0.035,
    roughness: 0.96,
  });
  const shoulderMaterial = new THREE.MeshStandardMaterial({ color: 0x9a8b69, roughness: 1 });
  const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xe5dbb9, roughness: 0.9 });
  const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x65482e, roughness: 0.95 });
  const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x8a8b79, roughness: 1, flatShading: true });
  const hedgeMaterial = new THREE.MeshStandardMaterial({ color: 0x355638, roughness: 1, flatShading: true });
  const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x353b39, roughness: 0.6, metalness: 0.55 });
  const bulbMaterial = new THREE.MeshStandardMaterial({ color: 0x8c826b, emissive: 0xffb347, emissiveIntensity: 0 });

  const land = addMesh(group, new THREE.BoxGeometry(84, 0.65, 37), grassMaterial, [-4.5, -0.43, -4.5]);
  land.castShadow = false;
  const beach = addMesh(group, new THREE.BoxGeometry(88, 0.38, 5.4), sandMaterial, [-4, -0.26, 12.15]);
  beach.castShadow = false;
  const islandBase = addMesh(group, new THREE.BoxGeometry(88, 1.1, 39), earthMaterial, [-4, -1.05, -3.5]);
  islandBase.castShadow = false;

  const points = roadPoints();
  const shoulder = addMesh(group, ribbonGeometry(points, ROAD_WIDTH + 1.05), shoulderMaterial, [0, 0.015, 0]);
  shoulder.castShadow = false;
  const road = addMesh(group, ribbonGeometry(points, ROAD_WIDTH), roadMaterial, [0, 0.045, 0]);
  road.castShadow = false;

  let dashCount = 0;
  for (let index = 0; index < points.length - 1; index += 3) dashCount += 1;
  const dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.11, 0.025, 0.85), lineMaterial, dashCount);
  dashes.receiveShadow = true;
  let dashIndex = 0;
  for (let index = 0; index < points.length - 1; index += 3) {
    const point = points[index];
    setInstance(
      dashes,
      dashIndex,
      new THREE.Vector3(point.x, 0.077, point.z),
      Math.atan2(point.tx, point.tz),
      new THREE.Vector3(1, 1, 1),
    );
    dashIndex += 1;
  }
  dashes.instanceMatrix.needsUpdate = true;
  group.add(dashes);

  [-28, -14, 0, 12.8].forEach((x) => {
    const apron = addMesh(group, new THREE.BoxGeometry(x === 12.8 ? 5.8 : 4.2, 0.08, 3.1), shoulderMaterial, [x, -0.028, 6.15]);
    apron.castShadow = false;
    const apronSurface = addMesh(group, new THREE.BoxGeometry(x === 12.8 ? 5.4 : 3.8, 0.08, 3.15), roadMaterial, [x, 0.001, 6.175]);
    apronSurface.castShadow = false;
  });

  const oceanMaterial = new THREE.MeshStandardMaterial({
    color: 0x38aeb3,
    emissive: 0x0c4c56,
    emissiveIntensity: 0.12,
    roughness: 0.24,
    metalness: 0.08,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const oceans = [
    createOcean(group, 126, 42, 64, 22, [-9, -0.16, 35.5], oceanMaterial),
    createOcean(group, 24, 38, 16, 24, [-54, -0.17, -3.5], oceanMaterial),
  ];

  const foamMaterial = new THREE.MeshStandardMaterial({
    color: 0xf1f3df,
    emissive: 0xaad7d0,
    emissiveIntensity: 0.16,
    transparent: true,
    opacity: 0.74,
    roughness: 0.7,
    depthWrite: false,
  });
  const foamCount = 64;
  const foam = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 7, 4), foamMaterial, foamCount);
  const foamData: { x: number; z: number; scale: number; phase: number }[] = [];
  for (let index = 0; index < foamCount; index += 1) {
    const x = -43 + index * 1.22;
    const z = 14.45 + Math.sin(index * 0.63) * 0.2;
    const scale = 0.45 + random() * 0.5;
    foamData.push({ x, z, scale, phase: random() * Math.PI * 2 });
    setInstance(foam, index, new THREE.Vector3(x, -0.015, z), random() * Math.PI, new THREE.Vector3(scale * 1.8, 0.035, scale * 0.34));
  }
  foam.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  foam.instanceMatrix.needsUpdate = true;
  group.add(foam);

  const hillMaterialA = new THREE.MeshStandardMaterial({ color: 0x587447, roughness: 1, flatShading: true });
  const hillMaterialB = new THREE.MeshStandardMaterial({ color: 0x6f8951, roughness: 1, flatShading: true });
  const hillGeometry = new THREE.IcosahedronGeometry(1, 2);
  const hillsA = new THREE.InstancedMesh(hillGeometry, hillMaterialA, 7);
  const hillsB = new THREE.InstancedMesh(hillGeometry, hillMaterialB, 7);
  const hillPositions: [number, number, number, number, number, number][] = [
    [-36, -2.6, -23, 11, 5.8, 8], [-20, -3.4, -25, 13, 7, 9], [-3, -2.8, -24, 12, 6, 8],
    [14, -3.2, -25, 14, 7, 9], [29, -2.5, -21, 10, 6, 8], [39, -2.4, -10, 9, 6, 10], [40, -2.8, 6, 9, 5, 9],
  ];
  hillPositions.forEach(([x, y, z, sx, sy, sz], index) => {
    setInstance(hillsA, index, new THREE.Vector3(x, y, z), random() * Math.PI, new THREE.Vector3(sx, sy, sz));
    setInstance(hillsB, index, new THREE.Vector3(x + 4, y - 1.1, z - 4), random() * Math.PI, new THREE.Vector3(sx * 0.8, sy * 0.8, sz * 0.8));
  });
  hillsA.receiveShadow = true;
  hillsB.receiveShadow = true;
  group.add(hillsA, hillsB);

  const treePositions: { x: number; z: number; scale: number; pine: boolean }[] = [];
  for (let index = 0; index < 44; index += 1) {
    treePositions.push({ x: -39 + index * 1.72, z: -17.2 - random() * 3.6, scale: 0.75 + random() * 0.65, pine: index % 3 === 0 });
  }
  for (let index = 0; index < 17; index += 1) {
    treePositions.push({ x: 34.5 + random() * 3, z: -15 + index * 1.75, scale: 0.8 + random() * 0.55, pine: index % 2 === 0 });
  }
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.24, 1.7, 6), woodMaterial, treePositions.length);
  const oaks = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), hedgeMaterial, treePositions.filter((tree) => !tree.pine).length);
  const pineMaterial = new THREE.MeshStandardMaterial({ color: 0x2e5542, roughness: 1, flatShading: true });
  const pines = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 2.8, 7), pineMaterial, treePositions.filter((tree) => tree.pine).length);
  let oakIndex = 0;
  let pineIndex = 0;
  treePositions.forEach((tree, index) => {
    setInstance(trunks, index, new THREE.Vector3(tree.x, 0.75 * tree.scale, tree.z), random() * Math.PI, new THREE.Vector3(tree.scale, tree.scale, tree.scale));
    if (tree.pine) {
      setInstance(pines, pineIndex, new THREE.Vector3(tree.x, 2.35 * tree.scale, tree.z), random() * Math.PI, new THREE.Vector3(tree.scale, tree.scale, tree.scale));
      pineIndex += 1;
    } else {
      setInstance(oaks, oakIndex, new THREE.Vector3(tree.x, 2.15 * tree.scale, tree.z), random() * Math.PI, new THREE.Vector3(1.15 * tree.scale, 1.35 * tree.scale, 1.15 * tree.scale));
      oakIndex += 1;
    }
  });
  trunks.castShadow = true;
  oaks.castShadow = true;
  pines.castShadow = true;
  group.add(trunks, oaks, pines);

  const hedgeCount = 42;
  const hedges = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.7, 0), hedgeMaterial, hedgeCount);
  for (let index = 0; index < hedgeCount; index += 1) {
    const x = -35 + index * 1.48;
    setInstance(hedges, index, new THREE.Vector3(x, 0.48, -16.25 + Math.sin(index) * 0.18), random() * Math.PI, new THREE.Vector3(1.25, 0.8 + random() * 0.35, 0.75));
  }
  hedges.castShadow = true;
  group.add(hedges);

  const wallCount = 58;
  const wall = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.5, 0), stoneMaterial, wallCount);
  for (let index = 0; index < wallCount; index += 1) {
    const east = index >= 34;
    const local = east ? index - 34 : index;
    const x = east ? 33.7 + Math.sin(local * 0.6) * 0.16 : -36 + local * 1.82;
    const z = east ? -13.5 + local * 1.08 : -15.55;
    setInstance(wall, index, new THREE.Vector3(x, 0.28, z), random() * Math.PI, new THREE.Vector3(1.25, 0.6, 0.75));
  }
  wall.castShadow = true;
  group.add(wall);

  const lampPositions: [number, number][] = [
    [-33, 7.1], [-21, 7.1], [-7, 7.1], [7, 7.1], [21, 7.1], [29.7, 4],
    [29.7, -7], [18, -9.4], [2, -9.4], [-15, -9.4], [-31, -9.4], [-39.7, 2],
  ];
  const poles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.065, 0.1, 3.1, 8), metalMaterial, lampPositions.length);
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 10, 7), bulbMaterial, lampPositions.length);
  const caps = new THREE.InstancedMesh(new THREE.ConeGeometry(0.3, 0.22, 8), metalMaterial, lampPositions.length);
  const lampLights: THREE.PointLight[] = [];
  lampPositions.forEach(([x, z], index) => {
    setInstance(poles, index, new THREE.Vector3(x, 1.55, z), 0, new THREE.Vector3(1, 1, 1));
    setInstance(bulbs, index, new THREE.Vector3(x, 3.05, z), 0, new THREE.Vector3(1, 1, 1));
    setInstance(caps, index, new THREE.Vector3(x, 3.28, z), 0, new THREE.Vector3(1, 1, 1));
    if (index % 3 === 0) {
      const light = new THREE.PointLight(0xffb55f, 0, 8, 2);
      light.position.set(x, 2.9, z);
      group.add(light);
      lampLights.push(light);
    }
  });
  poles.castShadow = true;
  group.add(poles, bulbs, caps);

  const addFingerpost = (x: number, z: number, rotation: number): void => {
    const sign = new THREE.Group();
    sign.position.set(x, 0, z);
    sign.rotation.y = rotation;
    group.add(sign);
    addMesh(sign, new THREE.CylinderGeometry(0.09, 0.12, 2.35, 7), woodMaterial, [0, 1.15, 0]);
    const labels = ["← NORDY'S BAR · SAM'S BEACH", "JIM'S GARAGE · MATT'S FARM →"];
    labels.forEach((label, index) => {
      const y = 2.05 - index * 0.43;
      addMesh(sign, new THREE.BoxGeometry(3.65, 0.38, 0.13), woodMaterial, [index === 0 ? -0.18 : 0.18, y, 0]);
      const texture = makeSignTexture(label);
      ownedTextures.push(texture);
      const faceMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const face = addMesh(sign, new THREE.PlaneGeometry(3.5, 0.34), faceMaterial, [index === 0 ? -0.18 : 0.18, y, 0.071]);
      face.castShadow = false;
    });
  };
  addFingerpost(-39.2, 5.8, Math.PI / 2);
  addFingerpost(29.2, -7.7, -Math.PI / 2);

  const obstacles: DriveBoundsBox[] = [
    { minX: -33.1, maxX: -22.9, minZ: -4.8, maxZ: 6.7 },
    { minX: -18.6, maxX: -9.4, minZ: -2.1, maxZ: 6.5 },
    { minX: -5.1, maxX: 5.1, minZ: -4.7, maxZ: 6.5 },
    { minX: 7.7, maxX: 17.8, minZ: -5.7, maxZ: 6.5 },
    { minX: 18.4, maxX: 21.4, minZ: 1.2, maxZ: 5.8 },
  ];
  const worldBounds: DriveBoundsBox = { minX: -42.8, maxX: 32.8, minZ: -18.2, maxZ: 14.1 };
  let disposed = false;

  return {
    group,
    obstacles,
    worldBounds,
    setLightingMode: (mode, blend) => {
      const amount = THREE.MathUtils.clamp(mode === "night" ? blend : 1 - blend, 0, 1);
      bulbMaterial.emissiveIntensity = amount * 1.05;
      bulbMaterial.color.setHex(amount > 0.01 ? 0xffd38a : 0x8c826b);
      lampLights.forEach((light) => { light.intensity = amount * 2.2; });
    },
    update: (elapsed) => {
      oceans.forEach(({ mesh, base }, oceanIndex) => {
        const attribute = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let index = 0; index < attribute.count; index += 1) {
          const offset = index * 3;
          const x = base[offset];
          const y = base[offset + 1];
          attribute.array[offset + 2] = Math.sin(x * 0.3 + elapsed * 0.85 + oceanIndex) * 0.075
            + Math.cos(y * 0.38 - elapsed * 0.65) * 0.045;
        }
        attribute.needsUpdate = true;
        mesh.geometry.computeVertexNormals();
      });
      foamData.forEach((item, index) => {
        const pulse = 0.86 + Math.sin(elapsed * 1.35 + item.phase) * 0.14;
        setInstance(
          foam,
          index,
          new THREE.Vector3(item.x, -0.005 + Math.sin(elapsed + item.phase) * 0.018, item.z + Math.sin(elapsed * 0.7 + item.phase) * 0.16),
          item.phase,
          new THREE.Vector3(item.scale * 1.8 * pulse, 0.035, item.scale * 0.34),
        );
      });
      foam.instanceMatrix.needsUpdate = true;
      oceanMaterial.emissiveIntensity = 0.1 + Math.sin(elapsed * 0.45) * 0.025;
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      scene.remove(group);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      group.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
          objectMaterials.forEach((material) => materials.add(material));
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      ownedTextures.forEach((texture) => texture.dispose());
    },
  };
}
