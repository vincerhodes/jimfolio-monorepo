import * as THREE from "three";
import type {
  EasterEggId,
  FarmHandle,
  GarageStation,
  LightingMode,
  StationHandle,
  StationId,
} from "../types";
import type { WorkshopTextures } from "./materials";

type Vec3 = [number, number, number];
type TextPanelOptions = {
  background?: string;
  border?: string;
  color?: string;
  accent?: string;
  font?: string;
  lineHeight?: number;
  padding?: number;
  transparent?: boolean;
};

const TAU = Math.PI * 2;

function randomSource(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function smoothPulse(value: number, center: number, width: number): number {
  const distance = Math.abs(value - center) / width;
  return distance >= 1 ? 0 : (1 - distance * distance) ** 2;
}

export function buildMattsFarm(
  scene: THREE.Scene,
  stations: GarageStation[],
  textures?: WorkshopTextures,
): FarmHandle {
  const group = new THREE.Group();
  group.name = "matts-farm";
  scene.add(group);

  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const ownedTextures = new Set<THREE.Texture>();
  const stationHandles = new Map<StationId, StationHandle>();
  const doorHitMeshes: THREE.Object3D[] = [];
  const exteriorEasterEggHitMeshes: THREE.Object3D[] = [];
  const interiorEasterEggHitMeshes: THREE.Object3D[] = [];

  const ownMaterial = <T extends THREE.Material>(value: T): T => {
    materials.add(value);
    return value;
  };

  const standard = (
    color: THREE.ColorRepresentation,
    parameters: Omit<THREE.MeshStandardMaterialParameters, "color"> = {},
  ): THREE.MeshStandardMaterial => ownMaterial(new THREE.MeshStandardMaterial({ color, ...parameters }));

  const basic = (
    color: THREE.ColorRepresentation,
    parameters: Omit<THREE.MeshBasicMaterialParameters, "color"> = {},
  ): THREE.MeshBasicMaterial => ownMaterial(new THREE.MeshBasicMaterial({ color, ...parameters }));

  const addMesh = <G extends THREE.BufferGeometry, M extends THREE.Material>(
    parent: THREE.Object3D,
    geometry: G,
    meshMaterial: M,
    position: Vec3 = [0, 0, 0],
    rotation: Vec3 = [0, 0, 0],
  ): THREE.Mesh<G, M> => {
    geometries.add(geometry);
    const object = new THREE.Mesh(geometry, meshMaterial);
    object.position.set(...position);
    object.rotation.set(...rotation);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  };

  const box = <M extends THREE.Material>(
    parent: THREE.Object3D,
    size: Vec3,
    position: Vec3,
    meshMaterial: M,
    rotation: Vec3 = [0, 0, 0],
  ): THREE.Mesh<THREE.BoxGeometry, M> => addMesh(
    parent,
    new THREE.BoxGeometry(...size),
    meshMaterial,
    position,
    rotation,
  );

  const cylinder = <M extends THREE.Material>(
    parent: THREE.Object3D,
    top: number,
    bottom: number,
    height: number,
    position: Vec3,
    meshMaterial: M,
    segments = 20,
    rotation: Vec3 = [0, 0, 0],
  ): THREE.Mesh<THREE.CylinderGeometry, M> => addMesh(
    parent,
    new THREE.CylinderGeometry(top, bottom, height, segments),
    meshMaterial,
    position,
    rotation,
  );

  const sphere = <M extends THREE.Material>(
    parent: THREE.Object3D,
    radius: number,
    position: Vec3,
    meshMaterial: M,
    scale: Vec3 = [1, 1, 1],
  ): THREE.Mesh<THREE.SphereGeometry, M> => {
    const object = addMesh(parent, new THREE.SphereGeometry(radius, 20, 14), meshMaterial, position);
    object.scale.set(...scale);
    return object;
  };

  const rodBetween = (
    parent: THREE.Object3D,
    start: Vec3,
    end: Vec3,
    radius: number,
    meshMaterial: THREE.Material,
    segments = 10,
  ): THREE.Mesh<THREE.CylinderGeometry, THREE.Material> => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const direction = b.clone().sub(a);
    const object = cylinder(
      parent,
      radius,
      radius,
      direction.length(),
      a.clone().add(b).multiplyScalar(0.5).toArray(),
      meshMaterial,
      segments,
    );
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return object;
  };

  const beamBetween = (
    parent: THREE.Object3D,
    start: Vec3,
    end: Vec3,
    width: number,
    depth: number,
    meshMaterial: THREE.Material,
  ): THREE.Mesh<THREE.BoxGeometry, THREE.Material> => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const direction = b.clone().sub(a);
    const object = box(
      parent,
      [width, direction.length(), depth],
      a.clone().add(b).multiplyScalar(0.5).toArray(),
      meshMaterial,
    );
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return object;
  };

  const tube = (
    parent: THREE.Object3D,
    points: Vec3[],
    radius: number,
    meshMaterial: THREE.Material,
    tubularSegments = 32,
  ): THREE.Mesh<THREE.TubeGeometry, THREE.Material> => {
    const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
    return addMesh(parent, new THREE.TubeGeometry(curve, tubularSegments, radius, 7, false), meshMaterial);
  };

  const canvasTexture = (
    width: number,
    height: number,
    painter: (context: CanvasRenderingContext2D, width: number, height: number) => void,
    repeat: [number, number] = [1, 1],
  ): THREE.CanvasTexture => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("A 2D canvas context is required to build Matt's Farm.");
    painter(context, width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(...repeat);
    texture.anisotropy = 4;
    ownedTextures.add(texture);
    return texture;
  };

  const canvasPanel = (
    parent: THREE.Object3D,
    width: number,
    height: number,
    position: Vec3,
    rotation: Vec3,
    painter: (context: CanvasRenderingContext2D, width: number, height: number) => void,
    resolution = 1024,
  ): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> => {
    const texture = canvasTexture(resolution, Math.max(128, Math.round(resolution * height / width)), painter);
    const panelMaterial = ownMaterial(new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      toneMapped: false,
    }));
    const panel = addMesh(parent, new THREE.PlaneGeometry(width, height), panelMaterial, position, rotation);
    panel.castShadow = false;
    return panel;
  };

  const textPanel = (
    parent: THREE.Object3D,
    lines: string[],
    width: number,
    height: number,
    position: Vec3,
    rotation: Vec3 = [0, 0, 0],
    options: TextPanelOptions = {},
  ): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> => canvasPanel(
    parent,
    width,
    height,
    position,
    rotation,
    (context, canvasWidth, canvasHeight) => {
      if (options.background) {
        context.fillStyle = options.background;
        roundedRect(context, 3, 3, canvasWidth - 6, canvasHeight - 6, canvasHeight * 0.07);
        context.fill();
      } else {
        context.clearRect(0, 0, canvasWidth, canvasHeight);
      }
      if (options.border) {
        context.strokeStyle = options.border;
        context.lineWidth = Math.max(4, canvasHeight * 0.025);
        roundedRect(context, 9, 9, canvasWidth - 18, canvasHeight - 18, canvasHeight * 0.06);
        context.stroke();
      }
      const padding = options.padding ?? canvasWidth * 0.06;
      const lineHeight = options.lineHeight ?? canvasHeight / (lines.length + 0.45);
      const fontSize = Math.min(lineHeight * 0.57, canvasWidth * 0.12);
      context.font = options.font ?? `700 ${fontSize}px Georgia, serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      lines.forEach((line, index) => {
        let size = fontSize;
        const family = options.font?.replace(/^\S+\s+\S+\s*/, "") ?? "Georgia, serif";
        const weight = options.font?.split(" ")[0] ?? "700";
        while (size > 12) {
          context.font = `${weight} ${size}px ${family}`;
          if (context.measureText(line).width <= canvasWidth - padding * 2) break;
          size *= 0.92;
        }
        context.fillStyle = index === 0 ? (options.color ?? "#fff4d6") : (options.accent ?? options.color ?? "#fff4d6");
        const totalHeight = lineHeight * (lines.length - 1);
        const y = canvasHeight / 2 - totalHeight / 2 + index * lineHeight;
        context.fillText(line, canvasWidth / 2, y);
      });
    },
  );

  const invisibleMaterial = basic("#ffffff", {
    transparent: true,
    opacity: 0,
    depthWrite: false,
    colorWrite: false,
  });

  const invisibleHit = (
    parent: THREE.Object3D,
    size: Vec3,
    position: Vec3,
  ): THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial> => {
    const hit = box(parent, size, position, invisibleMaterial);
    hit.castShadow = false;
    hit.receiveShadow = false;
    return hit;
  };

  const oakTexture = canvasTexture(512, 512, (context, width, height) => {
    const random = randomSource(1401);
    context.fillStyle = "#a86d35";
    context.fillRect(0, 0, width, height);
    for (let index = 0; index < 1800; index += 1) {
      const y = random() * height;
      const light = random() > 0.5;
      context.strokeStyle = light ? `rgba(255,215,145,${random() * 0.12})` : `rgba(56,24,7,${random() * 0.13})`;
      context.lineWidth = 0.4 + random() * 2;
      context.beginPath();
      context.moveTo(0, y);
      context.bezierCurveTo(width * 0.25, y + random() * 10 - 5, width * 0.75, y + random() * 10 - 5, width, y);
      context.stroke();
    }
    for (let knot = 0; knot < 9; knot += 1) {
      const x = random() * width;
      const y = random() * height;
      context.strokeStyle = "rgba(63,28,9,.32)";
      for (let ring = 1; ring < 6; ring += 1) {
        context.beginPath();
        context.ellipse(x, y, ring * 7, ring * 2.2, 0, 0, TAU);
        context.stroke();
      }
    }
  }, [2, 2]);

  const stoneTexture = canvasTexture(512, 512, (context, width, height) => {
    const random = randomSource(1402);
    context.fillStyle = "#8d826d";
    context.fillRect(0, 0, width, height);
    const rowHeight = 55;
    for (let row = -1; row < 11; row += 1) {
      let x = row % 2 === 0 ? -50 : -105;
      while (x < width) {
        const stoneWidth = 75 + random() * 70;
        const y = row * rowHeight;
        const tone = Math.round(145 + random() * 45);
        context.fillStyle = `rgb(${tone + 18},${tone + 9},${tone - 8})`;
        roundedRect(context, x + 3, y + 3, stoneWidth - 6, rowHeight - 6, 8 + random() * 7);
        context.fill();
        context.strokeStyle = "rgba(255,239,199,.2)";
        context.lineWidth = 2;
        context.stroke();
        for (let fleck = 0; fleck < 14; fleck += 1) {
          context.fillStyle = random() > 0.5 ? "rgba(74,67,52,.16)" : "rgba(255,246,218,.18)";
          context.fillRect(x + random() * stoneWidth, y + random() * rowHeight, 1 + random() * 4, 1 + random() * 3);
        }
        x += stoneWidth;
      }
    }
  }, [2, 1.4]);

  const slateTexture = canvasTexture(512, 512, (context, width, height) => {
    const random = randomSource(1403);
    context.fillStyle = "#29333a";
    context.fillRect(0, 0, width, height);
    for (let row = 0; row < 10; row += 1) {
      const y = row * 54;
      for (let column = -1; column < 8; column += 1) {
        const x = column * 78 + (row % 2) * 39;
        const value = 39 + Math.floor(random() * 20);
        context.fillStyle = `rgb(${value},${value + 8},${value + 13})`;
        context.fillRect(x + 2, y + 2, 75, 50);
        context.fillStyle = "rgba(190,209,213,.09)";
        context.fillRect(x + 3, y + 3, 72, 2);
      }
    }
  }, [3, 3]);

  const gravelTexture = canvasTexture(512, 512, (context, width, height) => {
    const random = randomSource(1404);
    context.fillStyle = "#aa9677";
    context.fillRect(0, 0, width, height);
    for (let index = 0; index < 9000; index += 1) {
      const value = 105 + Math.floor(random() * 95);
      context.fillStyle = `rgba(${value + 15},${value + 6},${value - 8},${0.25 + random() * 0.5})`;
      const size = 0.5 + random() * 3;
      context.beginPath();
      context.ellipse(random() * width, random() * height, size * 1.5, size, random() * TAU, 0, TAU);
      context.fill();
    }
  }, [5, 5]);

  const meadowTexture = canvasTexture(512, 512, (context, width, height) => {
    const random = randomSource(1405);
    context.fillStyle = "#426a2c";
    context.fillRect(0, 0, width, height);
    for (let index = 0; index < 12000; index += 1) {
      const green = 60 + Math.floor(random() * 75);
      context.fillStyle = `rgba(${25 + Math.floor(random() * 35)},${green},${20 + Math.floor(random() * 25)},.55)`;
      context.fillRect(random() * width, random() * height, 1 + random() * 2, 2 + random() * 5);
    }
  }, [6, 6]);

  const oak = standard("#c28a4b", { map: oakTexture, roughness: 0.57, metalness: 0.03 });
  const darkOak = standard("#6f3e1f", { map: oakTexture, roughness: 0.7 });
  const beech = standard("#d7ad70", { map: oakTexture, roughness: 0.5 });
  const stone = standard("#d4c29c", { map: stoneTexture, bumpMap: stoneTexture, bumpScale: 0.045, roughness: 0.94 });
  const slate = standard("#43515a", { map: slateTexture, bumpMap: slateTexture, bumpScale: 0.025, roughness: 0.82 });
  const gravel = standard("#bca585", { map: gravelTexture, bumpMap: gravelTexture, bumpScale: 0.055, roughness: 1 });
  const meadow = standard("#477c32", { map: meadowTexture, roughness: 1 });
  const brass = standard("#c99a43", { metalness: 0.82, roughness: 0.25 });
  const agedBrass = standard("#8f6a2d", { metalness: 0.7, roughness: 0.42 });
  const iron = standard("#24282a", { metalness: 0.72, roughness: 0.48 });
  const chrome = standard("#c6d0d1", { metalness: 0.92, roughness: 0.18 });
  const cream = standard("#e5d8b7", { metalness: 0.3, roughness: 0.4 });
  const red = standard("#a91519", { metalness: 0.45, roughness: 0.25 });
  const barnRed = standard("#7d1f1c", { metalness: 0.08, roughness: 0.5, emissive: "#2b0503", emissiveIntensity: 0 });
  const rubber = standard("#171918", { roughness: 0.94, metalness: 0.02 });
  const black = standard("#151718", { roughness: 0.68, metalness: 0.22 });
  const leather = standard("#30231d", {
    map: textures?.leather.map,
    bumpMap: textures?.leather.bumpMap,
    bumpScale: textures ? 0.025 : 0,
    roughness: 0.72,
  });
  const hay = standard("#d8a93c", { roughness: 0.95 });
  const hayLight = standard("#f0c85c", { roughness: 0.92 });
  const leaf = standard("#315f2c", { roughness: 0.94 });
  const moss = standard("#59713b", { roughness: 1 });
  const white = standard("#eee9da", { roughness: 0.75 });
  const ceramic = standard("#c9bda6", { roughness: 0.32, metalness: 0.02 });

  const addInstanced = <G extends THREE.BufferGeometry>(
    parent: THREE.Object3D,
    geometry: G,
    meshMaterial: THREE.Material,
    count: number,
  ): THREE.InstancedMesh<G, THREE.Material> => {
    geometries.add(geometry);
    const instances = new THREE.InstancedMesh(geometry, meshMaterial, count);
    instances.castShadow = true;
    instances.receiveShadow = true;
    parent.add(instances);
    return instances;
  };

  const hayBale = (
    parent: THREE.Object3D,
    position: Vec3,
    scale = 1,
    yaw = 0,
  ): THREE.Group => {
    const bale = new THREE.Group();
    bale.position.set(...position);
    bale.rotation.y = yaw;
    bale.scale.setScalar(scale);
    parent.add(bale);
    cylinder(bale, 0.34, 0.34, 0.74, [0, 0.34, 0], hay, 24, [0, 0, Math.PI / 2]);
    for (const x of [-0.25, 0.25]) {
      addMesh(bale, new THREE.TorusGeometry(0.345, 0.013, 6, 28), darkOak, [x, 0.34, 0], [0, Math.PI / 2, 0]);
    }
    for (let groove = 0; groove < 9; groove += 1) {
      const angle = groove / 9 * TAU;
      rodBetween(
        bale,
        [-0.36, 0.34 + Math.sin(angle) * 0.337, Math.cos(angle) * 0.337],
        [0.36, 0.34 + Math.sin(angle) * 0.337, Math.cos(angle) * 0.337],
        0.006,
        hayLight,
        5,
      );
    }
    return bale;
  };

  box(group, [20, 0.12, 25.7], [15.5, -0.09, 2.35], meadow);
  box(group, [12.5, 0.075, 11.4], [12.25, -0.015, 9.3], gravel);
  box(group, [1.0, 0.065, 10.8], [5.85, -0.025, 9.6], gravel);

  const random = randomSource(2026);
  const grassMaterials = [
    standard("#3d742e", { roughness: 1 }),
    standard("#5c8c36", { roughness: 1 }),
    standard("#749a42", { roughness: 1 }),
  ];
  const dummy = new THREE.Object3D();
  for (let colorIndex = 0; colorIndex < grassMaterials.length; colorIndex += 1) {
    const grass = addInstanced(group, new THREE.ConeGeometry(0.035, 0.28, 3), grassMaterials[colorIndex], 260);
    for (let index = 0; index < 260; index += 1) {
      let x = 5.5 + random() * 16.5;
      let z = -4.7 + random() * 19.7;
      let attempts = 0;
      while (((x > 5.95 && x < 18.6 && z > 3.45) || (x > 8.6 && x < 17 && z < 3.8 && z > -4.6)) && attempts < 30) {
        x = 5.5 + random() * 16.5;
        z = -4.7 + random() * 19.7;
        attempts += 1;
      }
      dummy.position.set(x, 0.08 + random() * 0.07, z);
      dummy.rotation.set((random() - 0.5) * 0.25, random() * TAU, (random() - 0.5) * 0.3);
      dummy.scale.set(0.65 + random() * 0.7, 0.6 + random() * 1.2, 0.65 + random() * 0.7);
      dummy.updateMatrix();
      grass.setMatrixAt(index, dummy.matrix);
    }
    grass.instanceMatrix.needsUpdate = true;
  }

  const flowerColors = ["#f4cf38", "#f7f3df", "#a68ac5"];
  const stemInstances = addInstanced(group, new THREE.CylinderGeometry(0.009, 0.012, 0.24, 5), leaf, 105);
  const blossomInstances = flowerColors.map((color) => addInstanced(
    group,
    new THREE.IcosahedronGeometry(0.055, 1),
    standard(color, { roughness: 0.8 }),
    35,
  ));
  for (let index = 0; index < 105; index += 1) {
    const side = index % 3;
    const x = side === 0 ? 5.8 + random() * 1.0 : side === 1 ? 18.8 + random() * 2.8 : 17.5 + random() * 3.2;
    const z = side === 2 ? 4.2 + random() * 7.8 : 4.2 + random() * 10.2;
    const height = 0.18 + random() * 0.22;
    dummy.position.set(x, height / 2, z);
    dummy.rotation.set(0, random() * TAU, (random() - 0.5) * 0.16);
    dummy.scale.set(1, height / 0.24, 1);
    dummy.updateMatrix();
    stemInstances.setMatrixAt(index, dummy.matrix);
    const colorIndex = index % 3;
    dummy.position.set(x, height + 0.02, z);
    dummy.rotation.set(random(), random() * TAU, random());
    dummy.scale.set(1.1, 0.48, 1.1);
    dummy.updateMatrix();
    blossomInstances[colorIndex].setMatrixAt(Math.floor(index / 3), dummy.matrix);
  }
  stemInstances.instanceMatrix.needsUpdate = true;
  blossomInstances.forEach((flowers) => { flowers.instanceMatrix.needsUpdate = true; });

  const paddock = new THREE.Group();
  paddock.name = "east-and-north-pastures";
  group.add(paddock);
  const paddockFenceLine = (start: [number, number], end: [number, number], sections: number): void => {
    for (let index = 0; index <= sections; index += 1) {
      const amount = index / sections;
      const x = THREE.MathUtils.lerp(start[0], end[0], amount);
      const z = THREE.MathUtils.lerp(start[1], end[1], amount);
      box(paddock, [0.18, 1.18, 0.18], [x, 0.56, z], darkOak, [0, 0, (index % 2 ? -1 : 1) * 0.025]);
      cylinder(paddock, 0, 0.15, 0.15, [x, 1.22, z], darkOak, 4, [0, Math.PI / 4, 0]);
      if (index < sections) {
        const nextAmount = (index + 1) / sections;
        const nextX = THREE.MathUtils.lerp(start[0], end[0], nextAmount);
        const nextZ = THREE.MathUtils.lerp(start[1], end[1], nextAmount);
        for (const y of [0.43, 0.88]) {
          beamBetween(paddock, [x, y, z], [nextX, y + 0.035, nextZ], 0.11, 0.12, oak);
        }
      }
    }
  };
  paddockFenceLine([17, -9.5], [25, -9.5], 5);
  paddockFenceLine([25, -9.5], [25, 6.5], 8);
  paddockFenceLine([17, -9.5], [17, -4.8], 3);
  paddockFenceLine([17, 4.1], [17, 6.5], 2);
  paddockFenceLine([17, 6.5], [18.4, 6.5], 1);
  paddockFenceLine([22.3, 6.5], [25, 6.5], 2);

  for (let colorIndex = 0; colorIndex < grassMaterials.length; colorIndex += 1) {
    const pastureGrass = addInstanced(group, new THREE.ConeGeometry(0.038, 0.32, 3), grassMaterials[colorIndex], 190);
    for (let index = 0; index < 190; index += 1) {
      let x = 17.15 + random() * 7.7;
      let z = -9.35 + random() * 15.65;
      let attempts = 0;
      const pondDistance = (): number => ((x - 21.5) / 2.45) ** 2 + ((z + 2.5) / 1.9) ** 2;
      while ((pondDistance() < 1 || (x > 19.45 && x < 21.75 && z > 1.5 && z < 4.1) || (x > 17.1 && x < 19.5 && z > -1.4 && z < 1.4)) && attempts < 30) {
        x = 17.15 + random() * 7.7;
        z = -9.35 + random() * 15.65;
        attempts += 1;
      }
      dummy.position.set(x, 0.09 + random() * 0.08, z);
      dummy.rotation.set((random() - 0.5) * 0.22, random() * TAU, (random() - 0.5) * 0.28);
      dummy.scale.set(0.7 + random() * 0.65, 0.65 + random() * 1.25, 0.7 + random() * 0.65);
      dummy.updateMatrix();
      pastureGrass.setMatrixAt(index, dummy.matrix);
    }
    pastureGrass.instanceMatrix.needsUpdate = true;
  }

  const pond = new THREE.Group();
  pond.name = "shimmering-duck-pond";
  pond.position.set(21.5, 0, -2.5);
  group.add(pond);
  const pondBank = standard("#827a55", { roughness: 1 });
  const bank = addMesh(pond, new THREE.CircleGeometry(1, 64), pondBank, [0, 0.006, 0], [-Math.PI / 2, 0, 0]);
  bank.scale.set(2.38, 1.78, 1);
  const waterMaterial = standard("#318d91", {
    emissive: "#176d70",
    emissiveIntensity: 0.24,
    metalness: 0.34,
    roughness: 0.16,
    transparent: true,
    opacity: 0.88,
  });
  const water = addMesh(pond, new THREE.CircleGeometry(1, 64), waterMaterial, [0, 0.035, 0], [-Math.PI / 2, 0, 0]);
  water.scale.set(2.12, 1.48, 1);
  water.castShadow = false;
  const riverStone = standard("#9b9b88", { roughness: 0.88 });
  for (let index = 0; index < 28; index += 1) {
    const angle = index / 28 * TAU;
    const radius = 0.16 + random() * 0.085;
    const stoneMesh = sphere(
      pond,
      radius,
      [Math.cos(angle) * 2.22, 0.08 + random() * 0.035, Math.sin(angle) * 1.59],
      riverStone,
      [1.2 + random() * 0.45, 0.55 + random() * 0.2, 0.9 + random() * 0.35],
    );
    stoneMesh.rotation.y = angle + random();
  }
  const reedMaterial = standard("#59743b", { roughness: 0.94 });
  const cattailMaterial = standard("#614127", { roughness: 1 });
  for (let cluster = 0; cluster < 12; cluster += 1) {
    const angle = cluster / 12 * TAU + 0.12;
    if (Math.sin(angle) > 0.65) continue;
    for (let stem = 0; stem < 4; stem += 1) {
      const x = Math.cos(angle) * (1.94 + random() * 0.15) + (random() - 0.5) * 0.13;
      const z = Math.sin(angle) * (1.34 + random() * 0.12) + (random() - 0.5) * 0.13;
      const height = 0.42 + random() * 0.34;
      rodBetween(pond, [x, 0.03, z], [x + (random() - 0.5) * 0.12, height, z + (random() - 0.5) * 0.08], 0.014, reedMaterial, 6);
      if (stem % 2 === 0) cylinder(pond, 0.026, 0.032, 0.15, [x, height, z], cattailMaterial, 8);
    }
  }
  const lilyMaterial = standard("#4d883e", { roughness: 0.72, side: THREE.DoubleSide });
  const lilyShape = new THREE.Shape();
  lilyShape.moveTo(0, 0);
  lilyShape.absarc(0, 0, 1, 0.24, TAU - 0.24, false);
  lilyShape.lineTo(0, 0);
  lilyShape.closePath();
  const lilyGeometry = new THREE.ShapeGeometry(lilyShape, 24);
  const lilyPositions: Array<[number, number, number]> = [
    [-1.25, -0.52, 0.24],
    [-0.95, 0.67, 0.19],
    [0.15, 0.88, 0.22],
    [1.25, 0.42, 0.26],
    [1.38, -0.55, 0.18],
    [0.15, -0.92, 0.2],
  ];
  lilyPositions.forEach(([x, z, size], index) => {
    const pad = addMesh(pond, lilyGeometry, lilyMaterial, [x, 0.057, z], [-Math.PI / 2, 0, index * 0.83]);
    pad.scale.setScalar(size);
    pad.castShadow = false;
    if (index === 1 || index === 3) {
      for (let petal = 0; petal < 6; petal += 1) {
        const angle = petal / 6 * TAU;
        sphere(pond, 0.047, [x + Math.cos(angle) * 0.045, 0.095, z + Math.sin(angle) * 0.045], white, [1, 0.42, 1]);
      }
      sphere(pond, 0.035, [x, 0.108, z], hayLight, [1, 0.55, 1]);
    }
  });
  const pondRipples: Array<{ mesh: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>; phase: number }> = [];
  for (let index = 0; index < 3; index += 1) {
    const rippleMaterial = basic("#b6eee0", { transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide });
    const ripple = addMesh(pond, new THREE.RingGeometry(0.32, 0.35, 40), rippleMaterial, [0, 0.063 + index * 0.001, 0], [-Math.PI / 2, 0, 0]);
    ripple.castShadow = false;
    pondRipples.push({ mesh: ripple, phase: index / 3 });
  }

  const ducks: Array<{ group: THREE.Group; baseY: number; baseRotation: number; phase: number }> = [];
  const duckBill = standard("#e6a02c", { roughness: 0.64 });
  const buildDuck = (position: Vec3, color: string, yaw: number, phase: number): void => {
    const duck = new THREE.Group();
    duck.position.set(...position);
    duck.rotation.y = yaw;
    pond.add(duck);
    const feathers = standard(color, { roughness: 0.82 });
    sphere(duck, 0.29, [0, 0.19, 0], feathers, [0.86, 0.72, 1.18]);
    sphere(duck, 0.18, [0, 0.43, 0.2], feathers, [0.94, 1.02, 0.94]);
    sphere(duck, 0.16, [-0.2, 0.22, -0.015], feathers, [0.25, 0.72, 1]);
    sphere(duck, 0.16, [0.2, 0.22, -0.015], feathers, [0.25, 0.72, 1]);
    cylinder(duck, 0, 0.09, 0.2, [0, 0.25, -0.34], feathers, 12, [-Math.PI / 2, 0, 0]);
    sphere(duck, 0.095, [0, 0.4, 0.375], duckBill, [1.05, 0.36, 1.15]);
    for (const side of [-1, 1]) {
      sphere(duck, 0.025, [side * 0.1, 0.48, 0.325], black);
      sphere(duck, 0.007, [side * 0.106, 0.488, 0.346], white);
    }
    duck.scale.setScalar(0.78);
    ducks.push({ group: duck, baseY: position[1], baseRotation: yaw, phase });
  };
  buildDuck([-0.72, 0.075, 0.12], "#f2ce55", 0.48, 0);
  buildDuck([0.72, 0.075, -0.3], "#f3efe0", -0.7, 1.9);

  const sheepHeads: Array<{ group: THREE.Group; baseY: number; phase: number }> = [];
  const sheepWool = standard("#eeeadd", { roughness: 1 });
  const sheepFace = standard("#5b5147", { roughness: 0.96 });
  const buildSheep = (x: number, z: number, yaw: number, phase: number): void => {
    const sheep = new THREE.Group();
    sheep.position.set(x, 0, z);
    sheep.rotation.y = yaw;
    sheep.scale.setScalar(0.88);
    group.add(sheep);
    sphere(sheep, 0.47, [0, 0.66, 0], sheepWool, [1.05, 0.9, 1.34]);
    for (let tuft = 0; tuft < 14; tuft += 1) {
      const angle = tuft / 14 * TAU;
      sphere(
        sheep,
        0.2,
        [Math.cos(angle) * 0.39, 0.69 + Math.sin(tuft * 2.1) * 0.16, Math.sin(angle) * 0.49],
        sheepWool,
        [1.05, 0.9, 1.05],
      );
    }
    for (const legX of [-0.27, 0.27]) {
      for (const legZ of [-0.31, 0.31]) {
        cylinder(sheep, 0.055, 0.065, 0.42, [legX, 0.24, legZ], sheepFace, 10);
        sphere(sheep, 0.075, [legX, 0.055, legZ + 0.035], sheepFace, [0.9, 0.55, 1.3]);
      }
    }
    sphere(sheep, 0.16, [0, 0.71, -0.65], sheepWool, [0.85, 0.85, 1.2]);
    const head = new THREE.Group();
    head.position.set(0, 0.73, 0.57);
    sheep.add(head);
    sphere(head, 0.25, [0, -0.08, 0.08], sheepFace, [0.75, 1.08, 0.9]);
    sphere(head, 0.22, [0, 0.1, 0.015], sheepWool, [1.05, 0.65, 0.95]);
    for (const side of [-1, 1]) {
      sphere(head, 0.105, [side * 0.21, 0.015, 0.02], sheepFace, [1.3, 0.35, 0.75]);
      sphere(head, 0.038, [side * 0.125, 0.005, 0.255], white);
      sphere(head, 0.019, [side * 0.13, 0.003, 0.284], black);
    }
    sphere(head, 0.035, [0, -0.19, 0.275], black, [1.25, 0.55, 0.5]);
    head.rotation.x = 0.24;
    sheepHeads.push({ group: head, baseY: head.position.y, phase });
  };
  buildSheep(18.65, -6.35, 0.4, 0);
  buildSheep(20.15, -5.15, -0.55, 1.4);
  buildSheep(22.15, -6.55, 0.85, 2.8);
  buildSheep(23.35, -4.75, -1.1, 4.1);

  const cropSoil = standard("#57442b", { roughness: 1 });
  box(group, [2.15, 0.07, 2.45], [18.3, 0.005, 0], cropSoil);
  const wheatStems = addInstanced(group, new THREE.CylinderGeometry(0.012, 0.017, 0.68, 5), hayLight, 63);
  const wheatEars = addInstanced(group, new THREE.ConeGeometry(0.055, 0.26, 6), hay, 63);
  for (let index = 0; index < 63; index += 1) {
    const column = index % 7;
    const row = Math.floor(index / 7);
    const x = 17.48 + column * 0.27 + (random() - 0.5) * 0.07;
    const z = -1.02 + row * 0.255 + (random() - 0.5) * 0.07;
    const height = 0.82 + random() * 0.2;
    dummy.position.set(x, height * 0.36, z);
    dummy.rotation.set((random() - 0.5) * 0.09, random() * TAU, (random() - 0.5) * 0.1);
    dummy.scale.set(1, height, 1);
    dummy.updateMatrix();
    wheatStems.setMatrixAt(index, dummy.matrix);
    dummy.position.set(x, height * 0.76, z);
    dummy.scale.set(0.9 + random() * 0.25, 0.9 + random() * 0.25, 0.9 + random() * 0.25);
    dummy.updateMatrix();
    wheatEars.setMatrixAt(index, dummy.matrix);
  }
  wheatStems.instanceMatrix.needsUpdate = true;
  wheatEars.instanceMatrix.needsUpdate = true;

  const orchardLeaf = standard("#477c36", { roughness: 0.95 });
  const appleMaterial = standard("#b94332", { roughness: 0.68 });
  const buildOrchardTree = (x: number, z: number, scale: number): void => {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    tree.scale.setScalar(scale);
    group.add(tree);
    cylinder(tree, 0.14, 0.24, 1.65, [0, 0.82, 0], darkOak, 12);
    for (const side of [-1, 1]) {
      rodBetween(tree, [0, 1.05, 0], [side * 0.55, 1.85, 0.08], 0.075, darkOak, 9);
      rodBetween(tree, [0, 1.25, 0], [side * 0.28, 2.05, -0.42], 0.065, darkOak, 9);
    }
    const canopyPositions: Vec3[] = [
      [0, 2.15, 0],
      [-0.63, 1.95, 0.04],
      [0.63, 1.98, 0.05],
      [-0.25, 2.35, -0.48],
      [0.35, 2.32, -0.4],
      [0, 1.93, 0.58],
    ];
    canopyPositions.forEach((position, index) => {
      const crown = addMesh(tree, new THREE.IcosahedronGeometry(0.72, 2), index % 2 ? leaf : orchardLeaf, position);
      crown.scale.set(1.05, 0.9, 1.05);
    });
    for (let apple = 0; apple < 10; apple += 1) {
      const angle = apple / 10 * TAU + random() * 0.3;
      sphere(tree, 0.075, [Math.cos(angle) * (0.58 + random() * 0.32), 1.82 + random() * 0.63, Math.sin(angle) * 0.66 + 0.15], appleMaterial);
    }
  };
  buildOrchardTree(18.35, -8.75, 0.88);
  buildOrchardTree(21.3, -8.8, 1.0);
  buildOrchardTree(24.0, -8.75, 0.9);

  const fence = new THREE.Group();
  group.add(fence);
  for (let index = 0; index < 6; index += 1) {
    const z = -4.5 + index * 1.94;
    box(fence, [0.18, 1.18, 0.18], [7.1, 0.56, z], darkOak, [0, 0, (index % 2 ? -1 : 1) * 0.025]);
    cylinder(fence, 0, 0.15, 0.15, [7.1, 1.22, z], darkOak, 4, [0, Math.PI / 4, 0]);
    if (index < 5) {
      for (const y of [0.43, 0.88]) {
        beamBetween(fence, [7.1, y, z + 0.08], [7.1, y + 0.035, z + 1.86], 0.11, 0.12, oak);
      }
    }
  }
  box(group, [0.17, 2.0, 0.17], [7.45, 0.96, 5.45], darkOak);
  box(group, [1.95, 0.48, 0.11], [8.15, 1.65, 5.43], oak);
  textPanel(group, ["MATT'S FARM →"], 1.78, 0.34, [8.15, 1.65, 5.495], [0, 0, 0], {
    background: "#7b4d26",
    border: "#c99a43",
    color: "#fff1c4",
    font: "700 86px Georgia, serif",
  });
  sphere(group, 0.055, [7.31, 1.65, 5.51], brass, [1, 1, 0.4]);
  sphere(group, 0.055, [8.99, 1.65, 5.51], brass, [1, 1, 0.4]);

  const hayStack = new THREE.Group();
  hayStack.position.set(16.4, 0, 5.5);
  group.add(hayStack);
  hayBale(hayStack, [-0.48, 0, 0], 1, 0.08);
  hayBale(hayStack, [0.4, 0, 0.1], 1, -0.07);
  hayBale(hayStack, [0, 0, -0.7], 1, Math.PI / 2);
  hayBale(hayStack, [-0.25, 0.67, -0.02], 0.95, 0.04);
  hayBale(hayStack, [0.48, 0.67, -0.13], 0.95, -0.1);
  hayBale(hayStack, [0.05, 1.3, -0.08], 0.9, 0.12);

  const shed = new THREE.Group();
  shed.name = "old-potting-shed";
  shed.position.set(20.6, 0, 2.6);
  shed.scale.setScalar(0.72);
  shed.rotation.y = -0.12;
  group.add(shed);
  const shedWood = standard("#50654b", { map: oakTexture, roughness: 0.94 });
  const shedTrim = standard("#344839", { map: oakTexture, roughness: 0.9 });
  const rustyRoof = standard("#83503a", { metalness: 0.42, roughness: 0.72 });
  const terracotta = standard("#b86d45", { roughness: 0.92 });
  box(shed, [2.5, 0.18, 1.85], [0, 0.07, 0], stone);
  box(shed, [2.3, 2.08, 1.65], [0, 1.15, 0], shedWood);
  for (let plank = 0; plank < 12; plank += 1) {
    const x = -1.08 + plank * 0.196;
    box(shed, [0.025, 2.02, 0.035], [x, 1.15, 0.842], shedTrim);
    box(shed, [0.025, 2.02, 0.035], [x, 1.15, -0.842], shedTrim);
  }
  for (const side of [-1, 1]) {
    for (let plank = 0; plank < 9; plank += 1) {
      box(shed, [0.035, 2.02, 0.025], [side * 1.165, 1.15, -0.76 + plank * 0.19], shedTrim);
    }
    box(shed, [0.12, 2.18, 0.12], [side * 1.15, 1.17, 0.84], darkOak);
  }
  const shedGable = new THREE.Shape();
  shedGable.moveTo(-1.15, 0);
  shedGable.lineTo(0, 0.72);
  shedGable.lineTo(1.15, 0);
  shedGable.closePath();
  addMesh(shed, new THREE.ShapeGeometry(shedGable), shedWood, [0, 2.19, 0.837]);
  addMesh(shed, new THREE.ShapeGeometry(shedGable), shedWood, [0, 2.19, -0.837], [0, Math.PI, 0]);
  const shedRoofAngle = Math.atan2(0.72, 1.25);
  const shedRoofLength = Math.sqrt(1.25 ** 2 + 0.72 ** 2) + 0.22;
  box(shed, [shedRoofLength, 0.12, 2.05], [-0.625, 2.55, 0], rustyRoof, [0, 0, shedRoofAngle]);
  box(shed, [shedRoofLength, 0.12, 2.05], [0.625, 2.55, 0], rustyRoof, [0, 0, -shedRoofAngle]);
  cylinder(shed, 0.085, 0.085, 2.12, [0, 2.91, 0], rustyRoof, 12, [Math.PI / 2, 0, 0]);
  for (let seam = 0; seam < 5; seam += 1) {
    const z = -0.88 + seam * 0.44;
    rodBetween(shed, [-1.31, 2.18, z], [0, 2.93, z], 0.014, agedBrass, 6);
    rodBetween(shed, [0, 2.93, z], [1.31, 2.18, z], 0.014, agedBrass, 6);
  }
  for (let patch = 0; patch < 9; patch += 1) {
    sphere(shed, 0.1 + random() * 0.07, [(random() - 0.5) * 1.5, 2.77 + random() * 0.08, (random() - 0.5) * 1.5], moss, [1.5, 0.18, 1]);
  }

  const shedDoor = new THREE.Group();
  shedDoor.position.set(-0.43, 0.14, 0.875);
  shedDoor.rotation.set(0, -0.09, -0.035);
  shed.add(shedDoor);
  box(shedDoor, [0.86, 1.65, 0.075], [0.43, 0.825, 0], shedTrim);
  for (let plank = 0; plank < 5; plank += 1) {
    box(shedDoor, [0.018, 1.56, 0.02], [0.09 + plank * 0.17, 0.825, 0.047], darkOak);
  }
  beamBetween(shedDoor, [0.08, 0.18, 0.065], [0.78, 1.43, 0.065], 0.07, 0.055, oak);
  sphere(shedDoor, 0.055, [0.72, 0.82, 0.09], agedBrass, [1, 1, 0.5]);
  box(shed, [0.48, 0.57, 0.055], [0.73, 1.36, 0.878], darkOak);
  box(shed, [0.39, 0.47, 0.025], [0.73, 1.36, 0.915], standard("#d7b76d", { emissive: "#b97b32", emissiveIntensity: 0.35, roughness: 0.4 }));
  box(shed, [0.035, 0.47, 0.025], [0.73, 1.36, 0.936], darkOak);
  box(shed, [0.39, 0.035, 0.025], [0.73, 1.36, 0.936], darkOak);
  box(shed, [1.65, 0.29, 0.065], [0, 1.99, 0.9], darkOak);
  textPanel(shed, ["OLD SHED (RETIRED)"], 1.56, 0.22, [0, 1.99, 0.938], [0, 0, 0], {
    background: "#e2d4a9",
    border: "#76522c",
    color: "#283326",
    font: "800 82px Arial, sans-serif",
  });
  const potPositions: Vec3[] = [[-1.03, 0.15, 1.08], [0.91, 0.15, 1.19], [1.23, 0.15, 0.94]];
  potPositions.forEach((position, index) => {
    cylinder(shed, 0.18, 0.13, 0.3, position, terracotta, 18);
    addMesh(shed, new THREE.TorusGeometry(0.18, 0.025, 7, 20), terracotta, [position[0], position[1] + 0.15, position[2]], [Math.PI / 2, 0, 0]);
    cylinder(shed, 0.145, 0.145, 0.015, [position[0], position[1] + 0.145, position[2]], cropSoil, 18);
    for (let sprout = 0; sprout < 4; sprout += 1) {
      const angle = sprout / 4 * TAU + index;
      rodBetween(shed, [position[0], position[1] + 0.16, position[2]], [position[0] + Math.cos(angle) * 0.1, position[1] + 0.43 + random() * 0.1, position[2] + Math.sin(angle) * 0.1], 0.012, leaf, 6);
      sphere(shed, 0.09, [position[0] + Math.cos(angle) * 0.1, position[1] + 0.42, position[2] + Math.sin(angle) * 0.1], orchardLeaf, [0.55, 1, 0.35]);
    }
  });
  for (let step = 0; step < 3; step += 1) {
    box(shed, [0.72, 0.055, 0.34], [0, 0.025, 1.15 + step * 0.39], stone, [0, (step - 1) * 0.08, 0]);
  }
  sphere(shed, 0.45, [-1.34, 0.38, -0.32], leaf, [0.8, 0.85, 1.1]);
  sphere(shed, 0.38, [1.32, 0.32, -0.42], leaf, [0.85, 0.8, 1]);
  const shedHit = invisibleHit(shed, [2.9, 3.05, 2.45], [0, 1.42, 0.25]);
  shedHit.userData.easterEggId = "old-shed";
  exteriorEasterEggHitMeshes.push(shedHit);
  let shedAnimation = 0;

  const tractor = new THREE.Group();
  tractor.name = "vintage-red-tractor";
  tractor.position.set(9.75, 0, 6.45);
  tractor.rotation.y = 0.48;
  group.add(tractor);

  const tractorBody = new THREE.Group();
  tractor.add(tractorBody);
  box(tractorBody, [1.05, 0.18, 2.25], [0, 0.56, 0.05], iron);
  rodBetween(tractorBody, [-0.83, 0.43, 1.03], [0.83, 0.43, 1.03], 0.075, iron, 14);
  rodBetween(tractorBody, [-0.86, 0.69, -0.72], [0.86, 0.69, -0.72], 0.095, iron, 14);

  const makeTractorWheel = (x: number, z: number, radius: number, width: number): void => {
    const centerY = radius + 0.055;
    cylinder(tractorBody, radius, radius, width, [x, centerY, z], rubber, 36, [0, 0, Math.PI / 2]);
    const outside = Math.sign(x) * (width / 2 + 0.012);
    cylinder(tractorBody, radius * 0.55, radius * 0.55, 0.035, [x + outside, centerY, z], cream, 28, [0, 0, Math.PI / 2]);
    cylinder(tractorBody, radius * 0.25, radius * 0.25, 0.07, [x + outside * 1.04, centerY, z], chrome, 20, [0, 0, Math.PI / 2]);
    addMesh(
      tractorBody,
      new THREE.TorusGeometry(radius * 0.77, radius * 0.055, 8, 32),
      rubber,
      [x + outside * 1.015, centerY, z],
      [0, Math.PI / 2, 0],
    );
    for (let tread = 0; tread < 18; tread += 1) {
      const angle = tread / 18 * TAU;
      const y = centerY + Math.sin(angle) * (radius + 0.005);
      const treadZ = z + Math.cos(angle) * (radius + 0.005);
      box(
        tractorBody,
        [width + 0.065, radius * 0.16, radius * 0.31],
        [x, y, treadZ],
        rubber,
        [-angle, 0, tread % 2 === 0 ? 0.15 : -0.15],
      );
    }
    for (let bolt = 0; bolt < 6; bolt += 1) {
      const angle = bolt / 6 * TAU;
      sphere(
        tractorBody,
        radius * 0.035,
        [x + outside * 1.12, centerY + Math.sin(angle) * radius * 0.36, z + Math.cos(angle) * radius * 0.36],
        chrome,
      );
    }
  };

  makeTractorWheel(-0.78, -0.69, 0.69, 0.39);
  makeTractorWheel(0.78, -0.69, 0.69, 0.39);
  makeTractorWheel(-0.63, 1.03, 0.37, 0.24);
  makeTractorWheel(0.63, 1.03, 0.37, 0.24);

  sphere(tractorBody, 0.7, [0, 1.02, 0.42], red, [0.66, 0.48, 1.04]);
  box(tractorBody, [0.84, 0.5, 1.12], [0, 0.92, 0.48], red);
  box(tractorBody, [0.77, 0.55, 0.12], [0, 0.97, 1.075], red);
  box(tractorBody, [0.64, 0.4, 0.025], [0, 0.97, 1.144], chrome);
  box(tractorBody, [0.55, 0.32, 0.031], [0, 0.97, 1.164], black);
  for (let grille = 0; grille < 9; grille += 1) {
    box(tractorBody, [0.025, 0.31, 0.026], [-0.24 + grille * 0.06, 0.97, 1.184], chrome);
  }
  for (const side of [-1, 1]) {
    box(tractorBody, [0.026, 0.055, 0.9], [side * 0.438, 1.04, 0.44], chrome);
    box(tractorBody, [0.028, 0.028, 0.74], [side * 0.442, 0.91, 0.4], chrome);
    for (let vent = 0; vent < 5; vent += 1) {
      box(tractorBody, [0.03, 0.17, 0.023], [side * 0.445, 0.95, 0.12 + vent * 0.09], iron, [0.2, 0, 0]);
    }
  }
  sphere(tractorBody, 0.075, [0, 1.29, 0.96], agedBrass, [1, 0.55, 1]);

  cylinder(tractorBody, 0.052, 0.065, 1.02, [0.34, 1.65, 0.27], black, 16);
  cylinder(tractorBody, 0.082, 0.055, 0.12, [0.34, 2.19, 0.27], iron, 16);
  cylinder(tractorBody, 0.09, 0.09, 0.025, [0.34, 2.255, 0.27], black, 16, [0, 0, 0.18]);
  tube(tractorBody, [[-0.36, 1.22, 0.35], [-0.41, 1.45, 0.32], [-0.41, 1.73, 0.3]], 0.035, black, 12);
  cylinder(tractorBody, 0.065, 0.065, 0.1, [-0.41, 1.76, 0.3], black, 12);

  const headlightMaterial = standard("#ffe2a0", {
    emissive: "#ffb64c",
    emissiveIntensity: 0.9,
    metalness: 0.08,
    roughness: 0.2,
  });
  for (const x of [-0.34, 0.34]) {
    cylinder(tractorBody, 0.13, 0.13, 0.12, [x, 1.18, 1.08], brass, 24, [Math.PI / 2, 0, 0]);
    cylinder(tractorBody, 0.102, 0.102, 0.018, [x, 1.18, 1.151], headlightMaterial, 24, [Math.PI / 2, 0, 0]);
    addMesh(tractorBody, new THREE.TorusGeometry(0.112, 0.015, 8, 24), chrome, [x, 1.18, 1.166]);
  }

  for (const side of [-1, 1]) {
    const fender = addMesh(
      tractorBody,
      new THREE.TorusGeometry(0.78, 0.075, 8, 28, Math.PI),
      red,
      [side * 0.77, 0.74, -0.69],
      [0, Math.PI / 2, 0],
    );
    fender.scale.set(1, 1, 1.7);
    box(tractorBody, [0.42, 0.08, 0.82], [side * 0.73, 1.22, -0.65], red, [0, 0, side * -0.04]);
    rodBetween(tractorBody, [side * 0.53, 0.72, -1.02], [side * 0.53, 1.62, -1.05], 0.032, iron);
    rodBetween(tractorBody, [side * 0.53, 1.62, -1.05], [side * 0.53, 1.65, -0.28], 0.032, iron);
  }
  rodBetween(tractorBody, [-0.53, 1.62, -1.05], [0.53, 1.62, -1.05], 0.035, iron);

  sphere(tractorBody, 0.34, [0, 1.02, -0.65], leather, [1.05, 0.23, 0.8]);
  const seatBack = sphere(tractorBody, 0.32, [0, 1.2, -0.91], leather, [1.05, 0.75, 0.19]);
  seatBack.rotation.x = -0.18;
  rodBetween(tractorBody, [0, 0.64, -0.7], [0, 0.96, -0.7], 0.07, iron);
  rodBetween(tractorBody, [0, 0.71, -0.02], [0, 1.25, 0.13], 0.032, iron);
  addMesh(tractorBody, new THREE.TorusGeometry(0.22, 0.025, 8, 28), black, [0, 1.27, 0.14], [0.95, 0, 0]);
  rodBetween(tractorBody, [-0.18, 1.18, 0.07], [0.18, 1.35, 0.2], 0.012, black);
  rodBetween(tractorBody, [-0.18, 1.35, 0.2], [0.18, 1.18, 0.07], 0.012, black);
  box(tractorBody, [0.8, 0.07, 0.38], [0, 0.65, -0.4], iron);
  rodBetween(tractorBody, [0, 0.47, -1.0], [0, 0.29, -1.42], 0.055, iron);
  box(tractorBody, [0.38, 0.08, 0.13], [0, 0.28, -1.44], iron);
  cylinder(tractorBody, 0.04, 0.04, 0.45, [0, 0.29, -1.44], chrome, 12, [0, 0, Math.PI / 2]);

  const tractorHit = invisibleHit(tractor, [2.25, 2.35, 3.1], [0, 1.05, 0]);
  tractorHit.userData.easterEggId = "tractor";
  exteriorEasterEggHitMeshes.push(tractorHit);

  const exhaustPuffs: Array<{ mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>; phase: number }> = [];
  for (let index = 0; index < 7; index += 1) {
    const puffMaterial = standard("#bac0b8", {
      transparent: true,
      opacity: 0,
      depthWrite: false,
      roughness: 1,
    });
    const puff = sphere(tractorBody, 0.09, [0.34, 2.27, 0.27], puffMaterial);
    puff.castShadow = false;
    exhaustPuffs.push({ mesh: puff, phase: index / 7 });
  }
  let tractorAnimation = 0;

  const barn = new THREE.Group();
  barn.name = "cotswold-oak-barn";
  group.add(barn);
  box(barn, [8.05, 0.12, 8.05], [12.8, -0.015, -0.4], darkOak);
  for (let board = 0; board < 20; board += 1) {
    box(barn, [0.385, 0.055, 7.88], [8.99 + board * 0.4, 0.065, -0.4], board % 3 === 0 ? darkOak : oak);
  }

  const wallSections: Array<{ x: number; width: number; z: number; depth: number; front: boolean }> = [
    { x: 10.05, width: 2.5, z: 3.6, depth: 0.22, front: true },
    { x: 15.55, width: 2.5, z: 3.6, depth: 0.22, front: true },
    { x: 12.8, width: 8.0, z: -4.4, depth: 0.22, front: false },
  ];
  wallSections.forEach((section) => {
    box(barn, [section.width, 1.05, section.depth], [section.x, 0.59, section.z], stone);
    box(barn, [section.width, 2.1, section.depth], [section.x, 2.1, section.z], oak);
    if (section.front) {
      for (let plank = 0; plank < 10; plank += 1) {
        box(barn, [section.width, 0.018, 0.025], [section.x, 1.11 + plank * 0.205, section.z + 0.125], darkOak);
      }
    }
  });
  for (const x of [8.8, 16.8]) {
    box(barn, [0.22, 1.05, 8], [x, 0.59, -0.4], stone);
    box(barn, [0.22, 2.1, 8], [x, 2.1, -0.4], oak);
    for (let plank = 0; plank < 10; plank += 1) {
      box(barn, [0.025, 0.018, 8], [x + (x < 12.8 ? -0.125 : 0.125), 1.11 + plank * 0.205, -0.4], darkOak);
    }
  }
  box(barn, [3.0, 0.6, 0.22], [12.8, 2.85, 3.6], oak);
  for (const x of [8.82, 11.3, 14.3, 16.78]) {
    box(barn, [0.16, 3.18, 0.28], [x, 1.59, 3.62], darkOak);
  }
  box(barn, [3.22, 0.16, 0.3], [12.8, 2.58, 3.63], darkOak);

  const gableShape = new THREE.Shape();
  gableShape.moveTo(-4, 0);
  gableShape.lineTo(0, 1.5);
  gableShape.lineTo(4, 0);
  gableShape.closePath();
  addMesh(barn, new THREE.ExtrudeGeometry(gableShape, { depth: 0.18, bevelEnabled: false }), oak, [12.8, 3.15, 3.5]);
  addMesh(barn, new THREE.ExtrudeGeometry(gableShape, { depth: 0.18, bevelEnabled: false }), oak, [12.8, 3.15, -4.48]);
  beamBetween(barn, [8.63, 3.13, 3.73], [12.8, 4.69, 3.73], 0.15, 0.16, darkOak);
  beamBetween(barn, [12.8, 4.69, 3.73], [16.97, 3.13, 3.73], 0.15, 0.16, darkOak);
  box(barn, [0.16, 1.43, 0.16], [12.8, 3.88, 3.74], darkOak);

  const roofAngle = Math.atan2(1.5, 4);
  const roofLength = Math.sqrt(4 ** 2 + 1.5 ** 2) + 0.5;
  box(barn, [roofLength, 0.16, 8.65], [10.68, 3.91, -0.4], slate, [0, 0, roofAngle]);
  box(barn, [roofLength, 0.16, 8.65], [14.92, 3.91, -0.4], slate, [0, 0, -roofAngle]);
  cylinder(barn, 0.13, 0.13, 8.72, [12.8, 4.69, -0.4], slate, 16, [Math.PI / 2, 0, 0]);
  for (let seam = 0; seam < 13; seam += 1) {
    const z = -4.55 + seam * 0.69;
    rodBetween(barn, [8.43, 3.15, z], [12.8, 4.72, z], 0.018, iron, 6);
    rodBetween(barn, [12.8, 4.72, z], [17.17, 3.15, z], 0.018, iron, 6);
  }

  const archShape = (width: number, height: number): THREE.Shape => {
    const shape = new THREE.Shape();
    const radius = width / 2;
    shape.moveTo(-radius, -height / 2);
    shape.lineTo(radius, -height / 2);
    shape.lineTo(radius, height / 2 - radius);
    shape.absarc(0, height / 2 - radius, radius, 0, Math.PI, false);
    shape.lineTo(-radius, -height / 2);
    shape.closePath();
    return shape;
  };
  const windowGlow = standard("#ffc66d", { emissive: "#ff9d35", emissiveIntensity: 0.95, roughness: 0.25 });
  addMesh(barn, new THREE.ShapeGeometry(archShape(1.08, 1.04)), darkOak, [12.8, 3.78, 3.705]);
  addMesh(barn, new THREE.ShapeGeometry(archShape(0.82, 0.82)), windowGlow, [12.8, 3.77, 3.718]);
  box(barn, [0.045, 0.76, 0.035], [12.8, 3.73, 3.742], darkOak);
  box(barn, [0.78, 0.045, 0.035], [12.8, 3.7, 3.742], darkOak);
  box(barn, [0.17, 0.17, 1.02], [12.8, 4.4, 4.04], darkOak, [-0.08, 0, 0]);
  addMesh(barn, new THREE.TorusGeometry(0.14, 0.027, 8, 20), iron, [12.8, 4.27, 4.52], [0, 0, 0]);
  rodBetween(barn, [12.8, 4.25, 4.52], [12.8, 3.72, 4.52], 0.015, darkOak, 7);

  box(barn, [3.2, 0.56, 0.09], [12.8, 2.98, 3.72], darkOak);
  textPanel(barn, ["MATT'S FARM", "EST. 2026 // FINISHED & GROWING"], 3.06, 0.48, [12.8, 2.98, 3.772], [0, 0, 0], {
    background: "#5d351b",
    border: "#c99a43",
    color: "#ffe6a5",
    accent: "#d9b978",
    font: "700 84px Georgia, serif",
  });
  for (const x of [11.34, 14.26]) {
    sphere(barn, 0.035, [x, 2.98, 3.79], brass, [1, 1, 0.35]);
  }

  const warmLights: Array<{ light: THREE.PointLight | THREE.SpotLight; night: number; day: number }> = [];
  const interiorLights: Array<THREE.PointLight | THREE.SpotLight> = [];
  const addLantern = (parent: THREE.Object3D, position: Vec3, exterior: boolean): THREE.Group => {
    const lantern = new THREE.Group();
    lantern.position.set(...position);
    parent.add(lantern);
    tube(lantern, [[0, 0.25, -0.08], [0, 0.43, 0.03], [0, 0.38, 0.23], [0, 0.24, 0.27]], 0.025, iron, 18);
    cylinder(lantern, 0.17, 0.07, 0.12, [0, 0.14, 0.27], brass, 20);
    cylinder(lantern, 0.105, 0.13, 0.28, [0, -0.03, 0.27], agedBrass, 16);
    const glow = sphere(lantern, 0.095, [0, -0.015, 0.27], windowGlow, [0.75, 1.25, 0.75]);
    glow.castShadow = false;
    cylinder(lantern, 0.14, 0.1, 0.06, [0, -0.2, 0.27], brass, 18);
    for (let bar = 0; bar < 4; bar += 1) {
      const angle = bar / 4 * TAU;
      rodBetween(lantern, [Math.sin(angle) * 0.1, -0.18, 0.27 + Math.cos(angle) * 0.1], [Math.sin(angle) * 0.08, 0.11, 0.27 + Math.cos(angle) * 0.08], 0.009, brass, 6);
    }
    const light = new THREE.PointLight("#ffb65d", exterior ? 1.3 : 1.15, exterior ? 4.5 : 5.5, 2);
    light.position.set(0, -0.03, 0.38);
    lantern.add(light);
    warmLights.push({ light, night: exterior ? 1.3 : 1.15, day: exterior ? 0.45 : 0.65 });
    if (!exterior) interiorLights.push(light);
    return lantern;
  };
  addLantern(barn, [10.62, 2.18, 3.78], true);
  addLantern(barn, [14.98, 2.18, 3.78], true);

  const leftDoor = new THREE.Group();
  const rightDoor = new THREE.Group();
  leftDoor.position.set(11.3, 0.06, 3.64);
  rightDoor.position.set(14.3, 0.06, 3.64);
  barn.add(leftDoor, rightDoor);

  const buildDoor = (pivot: THREE.Group, side: -1 | 1): void => {
    const direction = side === -1 ? 1 : -1;
    const centerX = direction * 0.75;
    box(pivot, [1.48, 2.49, 0.13], [centerX, 1.275, 0], barnRed);
    for (let plank = 0; plank < 7; plank += 1) {
      box(pivot, [0.018, 2.4, 0.025], [direction * (0.1 + plank * 0.215), 1.275, 0.079], darkOak);
    }
    for (const x of [direction * 0.06, direction * 1.44]) {
      box(pivot, [0.12, 2.54, 0.13], [x, 1.275, 0.085], oak);
    }
    for (const y of [0.08, 2.47]) {
      box(pivot, [1.48, 0.13, 0.13], [centerX, y, 0.085], oak);
    }
    beamBetween(pivot, [direction * 0.12, 0.16, 0.16], [direction * 1.38, 2.38, 0.16], 0.105, 0.105, oak);
    beamBetween(pivot, [direction * 0.12, 2.38, 0.16], [direction * 1.38, 0.16, 0.16], 0.105, 0.105, oak);
    for (const y of [0.42, 2.1]) {
      box(pivot, [0.57, 0.095, 0.045], [direction * 0.28, y, 0.19], iron);
      for (const x of [0.06, 0.48]) {
        sphere(pivot, 0.027, [direction * x, y, 0.22], brass, [1, 1, 0.35]);
      }
    }
    const handleX = direction * 1.22;
    sphere(pivot, 0.065, [handleX, 1.24, 0.2], brass, [1, 1, 0.4]);
    addMesh(pivot, new THREE.TorusGeometry(0.095, 0.018, 8, 24), brass, [handleX, 1.14, 0.235]);
    const hit = invisibleHit(pivot, [1.5, 2.56, 0.25], [centerX, 1.28, 0.02]);
    hit.userData.door = true;
    doorHitMeshes.push(hit);
  };
  buildDoor(leftDoor, -1);
  buildDoor(rightDoor, 1);

  for (const z of [-3.75, -1.15, 1.45]) {
    beamBetween(barn, [8.98, 3.02, z], [16.62, 3.02, z], 0.16, 0.18, darkOak);
    beamBetween(barn, [9.0, 3.05, z], [12.8, 4.49, z], 0.18, 0.2, darkOak);
    beamBetween(barn, [12.8, 4.49, z], [16.6, 3.05, z], 0.18, 0.2, darkOak);
    beamBetween(barn, [12.8, 3.03, z], [12.8, 4.47, z], 0.14, 0.15, darkOak);
    beamBetween(barn, [10.4, 3.03, z], [11.75, 4.03, z], 0.1, 0.12, oak);
    beamBetween(barn, [15.2, 3.03, z], [13.85, 4.03, z], 0.1, 0.12, oak);
    for (const x of [9.1, 16.5]) {
      box(barn, [0.18, 2.92, 0.18], [x, 1.48, z], darkOak);
    }
  }

  box(barn, [7.5, 0.14, 1.48], [12.8, 2.78, -3.65], darkOak);
  for (let plank = 0; plank < 18; plank += 1) {
    box(barn, [0.39, 0.055, 1.45], [9.14 + plank * 0.42, 2.875, -3.65], oak);
  }
  for (let post = 0; post < 9; post += 1) {
    box(barn, [0.075, 0.68, 0.075], [9.15 + post * 0.91, 3.19, -2.89], darkOak);
  }
  box(barn, [7.45, 0.1, 0.1], [12.8, 3.51, -2.89], darkOak);
  box(barn, [7.45, 0.075, 0.075], [12.8, 3.14, -2.89], oak);
  hayBale(barn, [10.0, 2.91, -3.67], 0.8, 0.03);
  hayBale(barn, [10.65, 2.91, -3.74], 0.8, -0.08);
  hayBale(barn, [15.25, 2.91, -3.6], 0.85, Math.PI / 2);
  hayBale(barn, [15.2, 3.48, -3.65], 0.72, 0.1);
  const ladderBottomLeft: Vec3 = [9.25, 0.12, -2.28];
  const ladderBottomRight: Vec3 = [9.75, 0.12, -2.28];
  const ladderTopLeft: Vec3 = [9.25, 2.95, -3.08];
  const ladderTopRight: Vec3 = [9.75, 2.95, -3.08];
  rodBetween(barn, ladderBottomLeft, ladderTopLeft, 0.045, oak, 10);
  rodBetween(barn, ladderBottomRight, ladderTopRight, 0.045, oak, 10);
  for (let rung = 0; rung < 9; rung += 1) {
    const amount = rung / 9;
    const y = 0.25 + amount * 2.55;
    const z = -2.32 - amount * 0.75;
    rodBetween(barn, [9.25, y, z], [9.75, y, z], 0.035, oak, 10);
  }

  addLantern(barn, [9.45, 2.62, -1.15], false);
  addLantern(barn, [16.15, 2.62, -1.15], false);
  const bulbMaterial = standard("#ffd28a", {
    emissive: "#ffae42",
    emissiveIntensity: 0.92,
    roughness: 0.18,
  });
  const festoonLights: THREE.PointLight[] = [];
  for (const z of [-2.65, -0.35, 1.85]) {
    const points: Vec3[] = [];
    for (let segment = 0; segment <= 16; segment += 1) {
      const t = segment / 16;
      points.push([9.12 + t * 7.36, 3.28 - Math.sin(t * Math.PI) * 0.48, z]);
    }
    tube(barn, points, 0.012, black, 48);
    for (let bulb = 0; bulb < 9; bulb += 1) {
      const t = (bulb + 0.5) / 9;
      const x = 9.12 + t * 7.36;
      const y = 3.28 - Math.sin(t * Math.PI) * 0.48;
      cylinder(barn, 0.033, 0.04, 0.09, [x, y - 0.055, z], brass, 10);
      const glass = sphere(barn, 0.055, [x, y - 0.14, z], bulbMaterial, [0.82, 1.25, 0.82]);
      glass.castShadow = false;
    }
    const light = new THREE.PointLight("#ffbd68", 0.4, 5.2, 2);
    light.position.set(12.8, 2.65, z);
    barn.add(light);
    warmLights.push({ light, night: 0.4, day: 0.2 });
    festoonLights.push(light);
    interiorLights.push(light);
  }
  const interiorSpot = new THREE.SpotLight("#ffd39a", 18, 12, Math.PI / 3.2, 0.65, 1.5);
  interiorSpot.position.set(12.8, 4.2, 0.5);
  interiorSpot.target.position.set(12.8, 0, -1.0);
  barn.add(interiorSpot, interiorSpot.target);
  warmLights.push({ light: interiorSpot, night: 18, day: 6 });
  interiorLights.push(interiorSpot);
  const daylight = new THREE.DirectionalLight("#fff1ce", 0.3);
  daylight.position.set(12, 8, 10);
  daylight.target.position.set(12.8, 0, -0.5);
  barn.add(daylight, daylight.target);

  const bellMount = new THREE.Group();
  bellMount.position.set(10.8, 1.75, 2.4);
  barn.add(bellMount);
  box(bellMount, [0.12, 0.6, 0.12], [-0.24, -0.05, -0.1], iron);
  tube(bellMount, [[-0.24, 0.2, -0.1], [-0.1, 0.35, -0.08], [0.16, 0.31, 0], [0.19, 0.1, 0]], 0.026, iron, 20);
  const bellPivot = new THREE.Group();
  bellPivot.position.set(0.18, 0.08, 0);
  bellMount.add(bellPivot);
  const bellProfile = [
    new THREE.Vector2(0.035, 0.22),
    new THREE.Vector2(0.09, 0.18),
    new THREE.Vector2(0.12, 0.05),
    new THREE.Vector2(0.17, -0.11),
    new THREE.Vector2(0.24, -0.2),
    new THREE.Vector2(0.25, -0.24),
    new THREE.Vector2(0.2, -0.26),
  ];
  addMesh(bellPivot, new THREE.LatheGeometry(bellProfile, 28), brass);
  addMesh(bellPivot, new THREE.TorusGeometry(0.235, 0.018, 8, 28), agedBrass, [0, -0.235, 0], [Math.PI / 2, 0, 0]);
  rodBetween(bellPivot, [0, 0.1, 0], [0, -0.29, 0], 0.018, iron, 8);
  sphere(bellPivot, 0.055, [0, -0.3, 0], agedBrass);
  addMesh(bellPivot, new THREE.TorusGeometry(0.055, 0.013, 7, 18), brass, [0, 0.24, 0]);
  const bellHit = invisibleHit(bellMount, [0.7, 0.85, 0.65], [0.12, -0.02, 0]);
  bellHit.userData.easterEggId = "bell";
  interiorEasterEggHitMeshes.push(bellHit);
  let bellAnimation = 0;

  hayBale(barn, [15.65, 0.04, 1.9], 0.58, Math.PI / 2);
  const chicken = new THREE.Group();
  chicken.position.set(15.65, 0.58, 1.9);
  chicken.rotation.y = -0.32;
  barn.add(chicken);
  const henBody = sphere(chicken, 0.28, [0, 0.23, 0], white, [0.95, 1.08, 1.18]);
  henBody.rotation.x = -0.08;
  sphere(chicken, 0.17, [0, 0.48, 0.23], white, [0.9, 1.02, 0.92]);
  const combMaterial = standard("#b92c26", { roughness: 0.72 });
  const beakMaterial = standard("#e6ad32", { roughness: 0.65 });
  for (const x of [-0.065, 0, 0.065]) {
    sphere(chicken, 0.055, [x, 0.655 - Math.abs(x) * 0.4, 0.22], combMaterial, [0.75, 1.25, 0.65]);
  }
  cylinder(chicken, 0, 0.075, 0.18, [0, 0.48, 0.43], beakMaterial, 12, [Math.PI / 2, 0, 0]);
  sphere(chicken, 0.045, [0, 0.39, 0.34], combMaterial, [0.7, 1.25, 0.65]);
  for (const side of [-1, 1]) {
    sphere(chicken, 0.024, [side * 0.105, 0.53, 0.34], black);
    sphere(chicken, 0.007, [side * 0.111, 0.538, 0.358], white);
    rodBetween(chicken, [side * 0.09, 0.08, 0.02], [side * 0.09, -0.1, 0.03], 0.018, beakMaterial, 8);
    for (const toe of [-1, 0, 1]) {
      rodBetween(chicken, [side * 0.09, -0.1, 0.03], [side * 0.09 + toe * 0.045, -0.1, 0.14], 0.009, beakMaterial, 6);
    }
  }
  const leftWing = new THREE.Group();
  const rightWing = new THREE.Group();
  leftWing.position.set(-0.24, 0.31, 0);
  rightWing.position.set(0.24, 0.31, 0);
  chicken.add(leftWing, rightWing);
  sphere(leftWing, 0.19, [0, 0, 0], white, [0.32, 0.9, 1.12]);
  sphere(rightWing, 0.19, [0, 0, 0], white, [0.32, 0.9, 1.12]);
  for (let feather = 0; feather < 5; feather += 1) {
    const angle = -0.55 + feather * 0.24;
    const tail = cylinder(chicken, 0.015, 0.075, 0.35, [(feather - 2) * 0.055, 0.37, -0.3], white, 10, [-0.7, 0, angle]);
    tail.rotation.z = angle;
  }
  for (let speckle = 0; speckle < 22; speckle += 1) {
    const angle = random() * TAU;
    const y = 0.1 + random() * 0.35;
    const radial = Math.sqrt(Math.max(0.01, 1 - ((y - 0.23) / 0.34) ** 2));
    sphere(chicken, 0.012 + random() * 0.008, [Math.sin(angle) * 0.255 * radial, y, Math.cos(angle) * 0.3 * radial], darkOak, [1, 0.55, 0.35]);
  }
  const chickenHit = invisibleHit(chicken, [0.85, 0.95, 0.9], [0, 0.3, 0.05]);
  chickenHit.userData.easterEggId = "chicken";
  interiorEasterEggHitMeshes.push(chickenHit);
  let chickenAnimation = 0;

  type StationContent = {
    update: (elapsed: number, dt: number) => void;
    accentMaterials?: THREE.MeshStandardMaterial[];
  };

  const registerStation = (
    station: GarageStation,
    hitSize: Vec3,
    hitCenter: Vec3,
    haloRadius: number,
    builder: (root: THREE.Group) => StationContent,
  ): void => {
    const root = new THREE.Group();
    root.name = station.id;
    root.position.set(...station.anchorPosition);
    if (station.id === "matt-descartwright") root.rotation.y = -0.14;
    if (station.id === "matt-germanya") root.rotation.y = Math.PI / 2;
    if (station.id === "matt-digitaldetox") root.rotation.y = -Math.PI / 2;
    group.add(root);
    const content = builder(root);
    const haloMaterial = basic(station.accentHex, {
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const halo = addMesh(root, new THREE.RingGeometry(haloRadius * 0.88, haloRadius, 48), haloMaterial, [0, 0.014, 0], [-Math.PI / 2, 0, 0]);
    halo.castShadow = false;
    halo.receiveShadow = false;
    const hit = invisibleHit(root, hitSize, hitCenter);
    root.traverse((object) => {
      if (object instanceof THREE.Mesh) object.userData.stationId = station.id;
    });
    let hovered = false;
    let selected = false;
    const accents = content.accentMaterials ?? [];
    const applyState = (): void => {
      haloMaterial.opacity = selected ? 0.52 : hovered ? 0.3 : 0;
      accents.forEach((accent) => {
        accent.emissive.set(station.accentHex);
        accent.emissiveIntensity = selected ? 0.34 : hovered ? 0.16 : 0;
      });
    };
    stationHandles.set(station.id, {
      id: station.id,
      group: root,
      hitMeshes: [hit],
      setHovered: (value) => {
        hovered = value;
        applyState();
      },
      setSelected: (value) => {
        selected = value;
        applyState();
      },
      update: (elapsed, dt) => {
        content.update(elapsed, dt);
        if (selected) haloMaterial.opacity = 0.43 + Math.sin(elapsed * 3.2) * 0.1;
      },
    });
  };

  const buildStudioBench = (root: THREE.Group, width: number, depth: number): void => {
    box(root, [width, 0.1, depth], [0, -0.05, 0], oak);
    box(root, [width - 0.12, 0.12, 0.09], [0, -0.18, -depth / 2 + 0.08], darkOak);
    for (const x of [-width / 2 + 0.14, width / 2 - 0.14]) {
      for (const z of [-depth / 2 + 0.12, depth / 2 - 0.12]) {
        box(root, [0.11, 0.84, 0.11], [x, -0.52, z], darkOak);
      }
    }
  };

  stations.forEach((station) => {
    if (station.id === "matt-preparingforai") {
      registerStation(station, [2.75, 1.65, 1.45], [0, 0.64, 0], 1.12, (root) => {
        buildStudioBench(root, 2.65, 1.18);
        const onAirMaterial = standard("#b81419", { emissive: "#ff241c", emissiveIntensity: 0.95, roughness: 0.3 });
        const vuMaterials = [
          standard("#52d273", { emissive: "#32d667", emissiveIntensity: 0.62 }),
          standard("#e4bb3f", { emissive: "#f2ae2e", emissiveIntensity: 0.62 }),
          standard("#e3583e", { emissive: "#ff392b", emissiveIntensity: 0.62 }),
        ];
        box(root, [0.94, 0.26, 0.13], [0, 0.76, -0.4], black);
        box(root, [0.85, 0.18, 0.025], [0, 0.76, -0.324], onAirMaterial);
        textPanel(root, ["ON AIR"], 0.77, 0.14, [0, 0.76, -0.306], [0, 0, 0], {
          color: "#fff1d0",
          font: "800 96px Arial, sans-serif",
        });
        for (const x of [-0.43, 0.43]) sphere(root, 0.025, [x, 0.76, -0.302], brass);

        box(root, [0.88, 0.045, 0.54], [0.22, 0.045, 0.13], black);
        const laptopScreen = new THREE.Group();
        laptopScreen.position.set(0.22, 0.08, -0.115);
        laptopScreen.rotation.x = -0.13;
        root.add(laptopScreen);
        box(laptopScreen, [0.88, 0.53, 0.045], [0, 0.25, 0], black);
        canvasPanel(laptopScreen, 0.78, 0.42, [0, 0.26, 0.027], [0, 0, 0], (context, width, height) => {
          context.fillStyle = "#101b20";
          context.fillRect(0, 0, width, height);
          context.fillStyle = "#f2a65a";
          context.font = "700 43px Arial, sans-serif";
          context.textAlign = "center";
          context.fillText("PREPARING FOR AI // MATT + JIM", width / 2, 62);
          context.strokeStyle = "#6de0bd";
          context.lineWidth = 5;
          context.beginPath();
          for (let x = 30; x < width - 30; x += 4) {
            const y = height * 0.56 + Math.sin(x * 0.053) * 30 * Math.sin(x * 0.009) + Math.sin(x * 0.15) * 10;
            if (x === 30) context.moveTo(x, y);
            else context.lineTo(x, y);
          }
          context.stroke();
          context.fillStyle = "#89a9aa";
          context.font = "24px monospace";
          context.fillText("EPISODE 026  •  RECORDING", width / 2, height - 35);
        });
        cylinder(root, 0.045, 0.045, 0.86, [0.22, 0.065, 0.15], chrome, 16, [0, 0, Math.PI / 2]);

        const microphoneGroups: THREE.Group[] = [];
        for (const side of [-1, 1]) {
          const mic = new THREE.Group();
          root.add(mic);
          microphoneGroups.push(mic);
          box(mic, [0.11, 0.18, 0.13], [side * 1.12, 0.04, -0.22], black);
          rodBetween(mic, [side * 1.12, 0.12, -0.22], [side * 1.02, 0.61, -0.25], 0.025, black);
          rodBetween(mic, [side * 1.02, 0.61, -0.25], [side * 0.63, 0.82, -0.02], 0.023, black);
          rodBetween(mic, [side * 1.12, 0.22, -0.22], [side * 0.88, 0.62, -0.2], 0.009, chrome, 6);
          sphere(mic, 0.055, [side * 1.02, 0.61, -0.25], iron);
          const capsule = cylinder(mic, 0.065, 0.065, 0.32, [side * 0.57, 0.73, 0.035], black, 18, [0.9, 0, side * 0.45]);
          capsule.rotation.z = side * 0.45;
          for (let ring = 0; ring < 5; ring += 1) {
            addMesh(mic, new THREE.TorusGeometry(0.067, 0.007, 5, 16), iron, [side * (0.52 + ring * 0.012), 0.68 + ring * 0.026, 0.09 - ring * 0.018], [0.9, 0, side * 0.45]);
          }
        }

        box(root, [0.61, 0.1, 0.42], [-0.7, 0.065, 0.28], black, [-0.08, 0, 0]);
        const vuBars: THREE.Mesh<THREE.BoxGeometry, THREE.Material>[] = [];
        for (let channel = 0; channel < 8; channel += 1) {
          for (let segment = 0; segment < 6; segment += 1) {
            const bar = box(root, [0.035, 0.018, 0.025], [-0.91 + channel * 0.061, 0.13, 0.15 + segment * 0.038], vuMaterials[segment < 3 ? 0 : segment < 5 ? 1 : 2]);
            vuBars.push(bar);
          }
          cylinder(root, 0.026, 0.026, 0.035, [-0.91 + channel * 0.061, 0.14, 0.43], chrome, 12);
        }
        rodBetween(root, [0.95, 0, 0.25], [0.95, 0.48, 0.25], 0.035, beech);
        rodBetween(root, [0.8, 0.47, 0.25], [1.1, 0.47, 0.25], 0.028, beech);
        addMesh(root, new THREE.TorusGeometry(0.19, 0.025, 8, 28, Math.PI), black, [0.95, 0.42, 0.25], [0, 0, 0]);
        for (const x of [0.76, 1.14]) {
          sphere(root, 0.095, [x, 0.28, 0.25], black, [0.48, 1, 0.8]);
        }
        return {
          accentMaterials: [oak, darkOak],
          update: (elapsed) => {
            onAirMaterial.emissiveIntensity = 0.85 + Math.sin(elapsed * 2.4) * 0.15;
            vuBars.forEach((bar, index) => {
              const channel = Math.floor(index / 6);
              const segment = index % 6;
              const level = 2.4 + Math.sin(elapsed * 7.2 + channel * 1.7) * 1.5 + Math.sin(elapsed * 3.1 + channel) * 0.8;
              bar.scale.setScalar(segment < level ? 1 : 0.38);
            });
            microphoneGroups.forEach((mic, index) => {
              mic.rotation.y = Math.sin(elapsed * 0.65 + index * 2) * 0.006;
            });
          },
        };
      });
    }

    if (station.id === "matt-descartwright") {
      registerStation(station, [2.25, 2.15, 1.4], [0.25, 1.0, 0], 1.02, (root) => {
        beamBetween(root, [-0.56, 0.02, 0.18], [0, 1.93, -0.08], 0.095, 0.11, beech);
        beamBetween(root, [0.56, 0.02, 0.18], [0, 1.93, -0.08], 0.095, 0.11, beech);
        beamBetween(root, [0, 0.02, -0.62], [0, 1.85, -0.08], 0.11, 0.12, beech);
        box(root, [1.25, 0.11, 0.18], [0, 0.72, 0.12], beech);
        box(root, [0.11, 0.48, 0.11], [0, 1.9, -0.06], beech);
        cylinder(root, 0.035, 0.035, 0.17, [0, 1.9, 0.02], brass, 12, [Math.PI / 2, 0, 0]);
        const painting = new THREE.Group();
        painting.position.set(0, 1.23, 0.15);
        painting.rotation.x = -0.055;
        root.add(painting);
        const gilt = standard("#c8a34e", { metalness: 0.62, roughness: 0.34 });
        box(painting, [1.35, 1.02, 0.08], [0, 0, 0], gilt);
        box(painting, [1.19, 0.86, 0.035], [0, 0, 0.055], darkOak);
        canvasPanel(painting, 1.1, 0.77, [0, 0, 0.076], [0, 0, 0], (context, width, height) => {
          const sky = context.createLinearGradient(0, 0, 0, height * 0.7);
          sky.addColorStop(0, "#517895");
          sky.addColorStop(0.48, "#a9c0c1");
          sky.addColorStop(1, "#f2c984");
          context.fillStyle = sky;
          context.fillRect(0, 0, width, height);
          const paintRandom = randomSource(8128);
          for (let cloud = 0; cloud < 38; cloud += 1) {
            const x = paintRandom() * width;
            const y = paintRandom() * height * 0.43;
            const radius = 18 + paintRandom() * 58;
            context.fillStyle = `rgba(248,237,211,${0.08 + paintRandom() * 0.23})`;
            context.beginPath();
            context.ellipse(x, y, radius * 1.8, radius * 0.55, -0.12, 0, TAU);
            context.fill();
          }
          const hillLayers = [
            { y: 0.48, color: "#71856a", amplitude: 40 },
            { y: 0.58, color: "#7d9455", amplitude: 55 },
            { y: 0.7, color: "#9c9b4e", amplitude: 42 },
            { y: 0.82, color: "#647b39", amplitude: 35 },
          ];
          hillLayers.forEach((layer, layerIndex) => {
            context.fillStyle = layer.color;
            context.beginPath();
            context.moveTo(0, height);
            context.lineTo(0, height * layer.y);
            for (let x = 0; x <= width; x += 12) {
              const y = height * layer.y + Math.sin(x * 0.006 + layerIndex * 1.8) * layer.amplitude + Math.sin(x * 0.015) * 13;
              context.lineTo(x, y);
            }
            context.lineTo(width, height);
            context.closePath();
            context.fill();
          });
          context.fillStyle = "#dbcda9";
          context.fillRect(width * 0.65, height * 0.54, width * 0.12, height * 0.13);
          context.fillStyle = "#685345";
          context.beginPath();
          context.moveTo(width * 0.62, height * 0.55);
          context.lineTo(width * 0.71, height * 0.47);
          context.lineTo(width * 0.8, height * 0.55);
          context.closePath();
          context.fill();
          context.fillStyle = "#433d32";
          context.fillRect(width * 0.69, height * 0.59, width * 0.025, height * 0.08);
          context.fillStyle = "#f4c46d";
          context.fillRect(width * 0.735, height * 0.575, width * 0.02, height * 0.03);
          for (let stroke = 0; stroke < 650; stroke += 1) {
            const x = paintRandom() * width;
            const y = height * 0.68 + paintRandom() * height * 0.32;
            const colors = ["#f1cf4f", "#f4eee0", "#8876a4", "#416334", "#b87e36"];
            context.strokeStyle = colors[Math.floor(paintRandom() * colors.length)];
            context.lineWidth = 2 + paintRandom() * 5;
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + paintRandom() * 12 - 6, y - 3 - paintRandom() * 10);
            context.stroke();
          }
          context.fillStyle = "rgba(255,239,194,.12)";
          for (let glaze = 0; glaze < 80; glaze += 1) {
            context.fillRect(paintRandom() * width, paintRandom() * height, 30 + paintRandom() * 90, 2 + paintRandom() * 5);
          }
        });
        for (const x of [-0.64, 0.64]) box(painting, [0.055, 1.0, 0.09], [x, 0, 0.06], gilt);
        for (const y of [-0.48, 0.48]) box(painting, [1.33, 0.055, 0.09], [0, y, 0.06], gilt);

        const stoolX = 0.92;
        cylinder(root, 0.34, 0.32, 0.09, [stoolX, 0.45, 0.1], oak, 24);
        for (let leg = 0; leg < 3; leg += 1) {
          const angle = leg / 3 * TAU;
          rodBetween(root, [stoolX + Math.sin(angle) * 0.23, 0.43, 0.1 + Math.cos(angle) * 0.23], [stoolX + Math.sin(angle) * 0.3, 0.02, 0.1 + Math.cos(angle) * 0.3], 0.035, beech);
        }
        const paletteShape = new THREE.Shape();
        paletteShape.absellipse(0, 0, 0.28, 0.2, 0, TAU, false, 0);
        const thumbHole = new THREE.Path();
        thumbHole.absellipse(0.14, 0.04, 0.047, 0.037, 0, TAU, true, 0);
        paletteShape.holes.push(thumbHole);
        addMesh(root, new THREE.ShapeGeometry(paletteShape, 32), beech, [stoolX - 0.03, 0.505, 0.12], [-Math.PI / 2, 0, -0.2]);
        const pigments = ["#d33b2e", "#e4bb35", "#325a91", "#eee5cf", "#48743d"];
        pigments.forEach((color, index) => {
          sphere(root, 0.027, [stoolX - 0.2 + index * 0.075, 0.52, 0.04 + Math.sin(index) * 0.04], standard(color, { roughness: 0.42 }), [1.2, 0.35, 1]);
        });
        cylinder(root, 0.085, 0.07, 0.2, [stoolX + 0.18, 0.59, -0.03], ceramic, 20);
        cylinder(root, 0.068, 0.068, 0.01, [stoolX + 0.18, 0.696, -0.03], darkOak, 20);
        for (let brush = 0; brush < 7; brush += 1) {
          const x = stoolX + 0.18 + (random() - 0.5) * 0.09;
          const z = -0.03 + (random() - 0.5) * 0.08;
          rodBetween(root, [x, 0.58, z], [x + (random() - 0.5) * 0.12, 0.94 + random() * 0.13, z + (random() - 0.5) * 0.1], 0.009, beech, 6);
        }
        return {
          accentMaterials: [gilt],
          update: (elapsed) => {
            painting.rotation.z = Math.sin(elapsed * 0.62) * 0.004;
          },
        };
      });
    }

    if (station.id === "matt-germanya") {
      registerStation(station, [1.75, 1.55, 1.45], [0, 0.61, 0], 0.83, (root) => {
        buildStudioBench(root, 1.65, 1.08);
        const standMaterial = standard("#a36d34", { map: oakTexture, roughness: 0.5 });
        box(root, [0.82, 0.09, 0.7], [0, 0.055, 0.1], standMaterial);
        box(root, [0.52, 0.18, 0.46], [0, 0.16, 0.1], standMaterial);
        cylinder(root, 0.16, 0.24, 0.12, [0, 0.29, 0.1], brass, 24);
        const globe = new THREE.Group();
        globe.position.set(0, 0.66, 0.1);
        globe.rotation.z = -0.18;
        root.add(globe);
        const globeTexture = canvasTexture(1536, 768, (context, width, height) => {
          const ocean = context.createLinearGradient(0, 0, 0, height);
          ocean.addColorStop(0, "#779a9d");
          ocean.addColorStop(0.5, "#396c78");
          ocean.addColorStop(1, "#244b5b");
          context.fillStyle = ocean;
          context.fillRect(0, 0, width, height);
          context.strokeStyle = "rgba(220,205,144,.18)";
          context.lineWidth = 2;
          for (let longitude = 0; longitude < width; longitude += width / 24) {
            context.beginPath();
            context.moveTo(longitude, 0);
            context.lineTo(longitude, height);
            context.stroke();
          }
          for (let latitude = 0; latitude < height; latitude += height / 12) {
            context.beginPath();
            context.moveTo(0, latitude);
            context.lineTo(width, latitude);
            context.stroke();
          }
          const drawLand = (points: Array<[number, number]>, color: string): void => {
            context.fillStyle = color;
            context.strokeStyle = "#d2c38c";
            context.lineWidth = 4;
            context.beginPath();
            points.forEach(([x, y], index) => {
              if (index === 0) context.moveTo(x * width, y * height);
              else context.lineTo(x * width, y * height);
            });
            context.closePath();
            context.fill();
            context.stroke();
          };
          drawLand([[0.07, 0.2], [0.19, 0.12], [0.29, 0.22], [0.27, 0.46], [0.2, 0.68], [0.12, 0.57], [0.1, 0.4]], "#8c9a68");
          drawLand([[0.43, 0.24], [0.48, 0.19], [0.51, 0.27], [0.55, 0.24], [0.58, 0.34], [0.55, 0.42], [0.57, 0.55], [0.51, 0.66], [0.48, 0.54], [0.44, 0.47], [0.4, 0.37]], "#b4ad78");
          drawLand([[0.52, 0.2], [0.62, 0.13], [0.77, 0.17], [0.9, 0.28], [0.86, 0.45], [0.72, 0.49], [0.65, 0.6], [0.56, 0.47]], "#a5a675");
          drawLand([[0.47, 0.53], [0.57, 0.54], [0.6, 0.76], [0.54, 0.93], [0.48, 0.8], [0.44, 0.62]], "#9a9b68");
          context.fillStyle = "#e1c44f";
          context.strokeStyle = "#5d4521";
          context.lineWidth = 5;
          context.beginPath();
          context.moveTo(width * 0.503, height * 0.29);
          context.lineTo(width * 0.525, height * 0.285);
          context.lineTo(width * 0.537, height * 0.325);
          context.lineTo(width * 0.523, height * 0.38);
          context.lineTo(width * 0.5, height * 0.36);
          context.closePath();
          context.fill();
          context.stroke();
          context.fillStyle = "#fff0b6";
          context.font = "700 28px Arial, sans-serif";
          context.fillText("DEUTSCHLAND", width * 0.535, height * 0.32);
        });
        const globeMaterial = standard("#5e8990", {
          map: globeTexture,
          emissive: "#244f55",
          emissiveIntensity: 0.38,
          roughness: 0.4,
          metalness: 0.08,
        });
        sphere(globe, 0.35, [0, 0, 0], globeMaterial);
        addMesh(root, new THREE.TorusGeometry(0.405, 0.018, 10, 64), brass, [0, 0.66, 0.1], [0, 0.18, -0.18]);
        addMesh(root, new THREE.TorusGeometry(0.383, 0.012, 8, 64), agedBrass, [0, 0.66, 0.1], [Math.PI / 2, 0, 0]);
        rodBetween(root, [0, 0.24, 0.1], [0, 1.08, 0.1], 0.018, brass, 10);
        sphere(root, 0.04, [0, 1.075, 0.1], brass);
        const globeLight = new THREE.PointLight("#ffd985", 0.65, 2.0, 2);
        globeLight.position.set(0, 0.8, 0.28);
        root.add(globeLight);
        interiorLights.push(globeLight);

        box(root, [1.25, 0.55, 0.07], [0, 0.37, -0.45], darkOak, [-0.12, 0, 0]);
        textPanel(root, ["GERMANYA", "germanya.vercel.app"], 1.13, 0.43, [0, 0.38, -0.405], [-0.12, 0, 0], {
          background: "#e4d6ae",
          border: "#8b5a2c",
          color: "#30291e",
          accent: "#65573f",
          font: "700 78px Georgia, serif",
        });
        const ribbonColors = ["#171717", "#b32625", "#dfad32"];
        ribbonColors.forEach((color, index) => {
          box(root, [0.075, 0.34, 0.015], [0.45 + index * 0.075, 0.28, -0.385], standard(color, { roughness: 0.75 }), [-0.12, 0, 0]);
        });
        return {
          accentMaterials: [standMaterial],
          update: (elapsed, dt) => {
            globe.rotation.y += dt * 0.12;
            globeMaterial.emissiveIntensity = 0.34 + Math.sin(elapsed * 1.2) * 0.06;
          },
        };
      });
    }

    if (station.id === "matt-digitaldetox") {
      registerStation(station, [2.35, 1.55, 1.35], [0, 0.62, 0], 1.0, (root) => {
        buildStudioBench(root, 2.25, 1.05);
        const lockboxMaterial = standard("#8f592c", { map: oakTexture, roughness: 0.52 });
        box(root, [0.96, 0.5, 0.55], [-0.38, 0.27, -0.12], lockboxMaterial);
        box(root, [0.84, 0.4, 0.025], [-0.38, 0.28, 0.171], darkOak);
        for (let row = 0; row < 2; row += 1) {
          for (let column = 0; column < 3; column += 1) {
            const x = -0.66 + column * 0.28;
            const y = 0.18 + row * 0.2;
            box(root, [0.245, 0.16, 0.035], [x, y, 0.193], black);
            box(root, [0.22, 0.135, 0.04], [x, y, 0.218], lockboxMaterial);
            textPanel(root, [String(row * 3 + column + 1).padStart(2, "0")], 0.085, 0.055, [x - 0.06, y + 0.025, 0.244], [0, 0, 0], {
              color: "#e6c37e",
              font: "700 84px monospace",
            });
          }
        }
        box(root, [0.16, 0.025, 0.29], [-0.66, 0.41, 0.07], black, [0, 0.18, 0]);
        box(root, [0.13, 0.008, 0.24], [-0.66, 0.428, 0.07], standard("#24333a", { metalness: 0.35, roughness: 0.22 }), [0, 0.18, 0]);
        box(root, [0.12, 0.13, 0.055], [-0.03, 0.25, 0.25], brass);
        addMesh(root, new THREE.TorusGeometry(0.065, 0.016, 8, 22, Math.PI), brass, [-0.03, 0.34, 0.25], [0, 0, 0]);
        sphere(root, 0.014, [-0.03, 0.26, 0.282], black);

        const teapot = new THREE.Group();
        teapot.position.set(0.45, 0.05, 0.17);
        root.add(teapot);
        sphere(teapot, 0.22, [0, 0.19, 0], ceramic, [1, 0.9, 1]);
        cylinder(teapot, 0.13, 0.16, 0.05, [0, 0.38, 0], ceramic, 24);
        sphere(teapot, 0.045, [0, 0.435, 0], darkOak);
        cylinder(teapot, 0.04, 0.1, 0.31, [0.24, 0.23, 0], ceramic, 18, [0, 0, -1.05]);
        addMesh(teapot, new THREE.TorusGeometry(0.18, 0.035, 10, 28, Math.PI * 1.5), ceramic, [-0.19, 0.21, 0], [0, 0, Math.PI * 0.75]);
        const teaMaterial = standard("#513221", { roughness: 0.2 });
        for (const position of [[0.88, 0.13, 0.22], [0.73, 0.13, -0.18]] as Vec3[]) {
          cylinder(root, 0.1, 0.075, 0.2, position, ceramic, 22);
          cylinder(root, 0.082, 0.082, 0.008, [position[0], position[1] + 0.104, position[2]], teaMaterial, 22);
          addMesh(root, new THREE.TorusGeometry(0.075, 0.018, 8, 22), ceramic, [position[0] + 0.1, position[1], position[2]], [Math.PI / 2, 0, 0]);
        }
        const steamMaterial = basic("#f4eee0", { transparent: true, opacity: 0.28, depthWrite: false });
        const steamGroups: THREE.Group[] = [];
        for (let index = 0; index < 4; index += 1) {
          const steam = new THREE.Group();
          steam.position.set(index < 2 ? 0.88 : 0.73, 0.26, index < 2 ? 0.22 : -0.18);
          root.add(steam);
          const steamMesh = tube(steam, [[0, 0, 0], [0.025, 0.09, 0], [-0.02, 0.19, 0.01], [0.018, 0.29, 0]], 0.006, steamMaterial, 18);
          steamMesh.castShadow = false;
          steamGroups.push(steam);
        }

        const chalkboard = new THREE.Group();
        chalkboard.position.set(0.45, 0.56, -0.36);
        chalkboard.rotation.x = -0.16;
        root.add(chalkboard);
        box(chalkboard, [1.15, 0.65, 0.075], [0, 0, 0], oak);
        textPanel(chalkboard, ["DIGITAL DETOX CLUB", "NEXT EVENT: FRI · RSVPs: 0", "digital-detox.club"], 1.03, 0.53, [0, 0, 0.043], [0, 0, 0], {
          background: "#263b34",
          border: "#c5b183",
          color: "#f2edcf",
          accent: "#d7ddc7",
          font: "700 66px 'Comic Sans MS', cursive",
        });
        beamBetween(root, [0.12, 0.01, -0.53], [0.22, 0.78, -0.43], 0.045, 0.055, darkOak);
        beamBetween(root, [0.78, 0.01, -0.53], [0.68, 0.78, -0.43], 0.045, 0.055, darkOak);
        return {
          accentMaterials: [lockboxMaterial],
          update: (elapsed) => {
            steamGroups.forEach((steam, index) => {
              const phase = (elapsed * 0.19 + index * 0.24) % 1;
              steam.position.y = 0.24 + phase * 0.16;
              steam.position.x += Math.sin(elapsed * 0.8 + index) * 0.00008;
              steam.scale.setScalar(0.65 + phase * 0.5);
            });
            steamMaterial.opacity = 0.2 + Math.sin(elapsed * 1.4) * 0.055;
          },
        };
      });
    }
  });

  const setLightingMode = (mode: LightingMode, blend: number): void => {
    const amount = THREE.MathUtils.clamp(blend, 0, 1);
    const day = mode === "day" ? amount : 1 - amount;
    warmLights.forEach(({ light, night, day: dayIntensity }) => {
      light.intensity = THREE.MathUtils.lerp(night, dayIntensity, day);
    });
    daylight.intensity = THREE.MathUtils.lerp(0.3, 2.1, day);
    windowGlow.emissiveIntensity = THREE.MathUtils.lerp(0.95, 0.3, day);
    bulbMaterial.emissiveIntensity = THREE.MathUtils.lerp(0.92, 0.3, day);
    headlightMaterial.emissiveIntensity = Math.max(headlightMaterial.emissiveIntensity, THREE.MathUtils.lerp(0.9, 0.7, day));
  };

  setLightingMode("night", 1);

  let disposed = false;
  return {
    group,
    doorHitMeshes,
    exteriorEasterEggHitMeshes,
    interiorEasterEggHitMeshes,
    handles: stationHandles,
    triggerEasterEgg: (id: EasterEggId): string => {
      if (id === "tractor") {
        tractorAnimation = 1.6;
        return "Vintage diesel purring nicely — Matt's officially upgraded from the potting shed.";
      }
      if (id === "bell") {
        bellAnimation = 2.4;
        return "Clang! Tea and scones ready in the barn.";
      }
      if (id === "chicken") {
        chickenAnimation = 1.25;
        return "Bawk! Even the barn chicken prefers this to the old potting shed.";
      }
      if (id === "old-shed") {
        shedAnimation = 1.65;
        return "Matt insists we never speak of the potting shed era again.";
      }
      return "";
    },
    setDoorProgress: (progress: number): void => {
      const amount = THREE.MathUtils.clamp(progress, 0, 1);
      leftDoor.rotation.y = -1.95 * amount;
      rightDoor.rotation.y = 1.95 * amount;
    },
    setDoorHovered: (hovered: boolean): void => {
      barnRed.emissiveIntensity = hovered ? 0.32 : 0;
    },
    setLightingMode,
    setActiveLights: (active: boolean): void => {
      interiorLights.forEach((light) => { light.visible = active; });
    },
    update: (elapsed: number, dt: number): void => {
      waterMaterial.emissiveIntensity = 0.24 + Math.sin(elapsed * 1.7) * 0.075;
      waterMaterial.opacity = 0.87 + Math.sin(elapsed * 1.15) * 0.025;
      water.rotation.z = Math.sin(elapsed * 0.18) * 0.012;
      pondRipples.forEach(({ mesh, phase }) => {
        const life = (elapsed * 0.16 + phase) % 1;
        const scale = 0.5 + life * 3.6;
        mesh.scale.set(scale * 1.35, scale, 1);
        mesh.material.opacity = Math.sin(life * Math.PI) * 0.17;
      });
      ducks.forEach(({ group: duck, baseY, baseRotation, phase }) => {
        duck.position.y = baseY + Math.sin(elapsed * 1.65 + phase) * 0.025;
        duck.rotation.y = baseRotation + Math.sin(elapsed * 0.55 + phase) * 0.08;
        duck.rotation.z = Math.sin(elapsed * 1.2 + phase) * 0.018;
      });
      sheepHeads.forEach(({ group: head, baseY, phase }) => {
        head.position.y = baseY + Math.sin(elapsed * 1.1 + phase) * 0.025;
        head.rotation.x = 0.28 + Math.sin(elapsed * 0.85 + phase) * 0.12;
      });
      if (shedAnimation > 0) {
        shedAnimation = Math.max(0, shedAnimation - dt);
        const age = 1.65 - shedAnimation;
        const envelope = Math.min(1, shedAnimation * 4) * Math.min(1, age * 8 + 0.15);
        shed.position.x = 20.6 + Math.sin(age * 29) * 0.018 * envelope;
        shed.rotation.z = Math.sin(age * 24) * 0.022 * envelope;
        shedDoor.rotation.y = -0.09 + Math.sin(age * 15) * 0.075 * envelope;
      } else {
        shed.position.x = 20.6;
        shed.rotation.z = 0;
        shedDoor.rotation.y = -0.09;
      }
      if (tractorAnimation > 0) {
        tractorAnimation = Math.max(0, tractorAnimation - dt);
        const age = 1.6 - tractorAnimation;
        const envelope = Math.min(1, tractorAnimation * 4) * Math.min(1, age * 8 + 0.2);
        tractorBody.position.y = (Math.sin(age * 45) * 0.018 + Math.abs(Math.sin(age * 13)) * 0.022) * envelope;
        tractorBody.rotation.z = Math.sin(age * 38) * 0.008 * envelope;
        const flash = smoothPulse(age, 0.18, 0.13) + smoothPulse(age, 0.58, 0.13);
        headlightMaterial.emissiveIntensity = 0.9 + flash * 2.0;
        exhaustPuffs.forEach(({ mesh, phase }) => {
          const life = (age * 0.72 + phase) % 1;
          const puffMaterial = mesh.material;
          puffMaterial.opacity = Math.sin(life * Math.PI) * 0.25 * envelope;
          mesh.position.set(0.34 + life * 0.17, 2.27 + life * 0.82, 0.27 - life * 0.08);
          mesh.scale.setScalar(0.45 + life * 1.8);
        });
      } else {
        tractorBody.position.y = 0;
        tractorBody.rotation.z = 0;
        headlightMaterial.emissiveIntensity = 0.9;
        exhaustPuffs.forEach(({ mesh }) => { mesh.material.opacity = 0; });
      }
      if (bellAnimation > 0) {
        bellAnimation = Math.max(0, bellAnimation - dt);
        const age = 2.4 - bellAnimation;
        bellPivot.rotation.z = Math.sin(age * 13.5) * 0.55 * Math.exp(-age * 1.45);
      } else {
        bellPivot.rotation.z = 0;
      }
      if (chickenAnimation > 0) {
        chickenAnimation = Math.max(0, chickenAnimation - dt);
        const age = 1.25 - chickenAnimation;
        chicken.position.y = 0.58 + Math.abs(Math.sin(age * 8.5)) * 0.24 * Math.min(1, chickenAnimation * 5);
        const flap = Math.sin(age * 25) * 0.9;
        leftWing.rotation.z = -0.35 - Math.abs(flap);
        rightWing.rotation.z = 0.35 + Math.abs(flap);
        chicken.rotation.x = Math.sin(age * 8.5) * 0.08;
      } else {
        chicken.position.y = 0.58 + Math.sin(elapsed * 1.8) * 0.006;
        leftWing.rotation.z = -0.35;
        rightWing.rotation.z = 0.35;
        chicken.rotation.x = 0;
      }
      stationHandles.forEach((handle) => handle.update(elapsed, dt));
    },
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      scene.remove(group);
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((meshMaterial) => meshMaterial.dispose());
      ownedTextures.forEach((texture) => texture.dispose());
      stationHandles.clear();
      doorHitMeshes.length = 0;
      exteriorEasterEggHitMeshes.length = 0;
      interiorEasterEggHitMeshes.length = 0;
    },
  };
}
