import * as THREE from "three";
import type { GarageStation, StationHandle, StationId } from "../types";
import type { WorkshopTextures } from "./materials";

type Vec3 = [number, number, number];
type BenchStationId = Exclude<StationId, "browzr" | "kickoff-hq" | "rovr" | "preparingforai" | "rightcourtsc" | "matt-preparingforai" | "matt-descartwright" | "matt-germanya" | "matt-digitaldetox">;

type KeyMaterial = {
  material: THREE.MeshStandardMaterial;
  base: number;
  lift: number;
};

type BuiltStation = {
  group: THREE.Group;
  halo?: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  floatGroup?: THREE.Group;
  borderMaterials: THREE.MeshBasicMaterial[];
  keyMaterials: KeyMaterial[];
  animate: (elapsed: number, activity: number) => void;
};

const noop = () => undefined;
const up = new THREE.Vector3(0, 1, 0);
const forward = new THREE.Vector3(0, 0, 1);

function material(parameters: THREE.MeshStandardMaterialParameters): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial(parameters);
}

function brushed(textures: WorkshopTextures | undefined, color = 0xaeb8bc, roughness = 0.24, metalness = 0.9) {
  return material({
    color,
    metalness,
    roughness,
    map: textures?.brushedMetal.map,
    bumpMap: textures?.brushedMetal.bumpMap,
    bumpScale: 0.012,
    roughnessMap: textures?.brushedMetal.roughnessMap,
  });
}

function timber(textures: WorkshopTextures | undefined, color = 0x6f452a, roughness = 0.62) {
  return material({
    color,
    map: textures?.butcherBlock.map,
    bumpMap: textures?.butcherBlock.bumpMap,
    bumpScale: 0.018,
    roughnessMap: textures?.butcherBlock.roughnessMap,
    roughness,
  });
}

function hideShadows<T extends THREE.Mesh>(mesh: T): T {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function box(width: number, height: number, depth: number, surface: THREE.Material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), surface);
  mesh.position.set(x, y, z);
  return hideShadows(mesh);
}

function beveledBox(width: number, height: number, depth: number, radius: number, surface: THREE.Material, x = 0, y = 0, z = 0) {
  const shape = new THREE.Shape();
  const left = -width / 2;
  const bottom = -height / 2;
  shape.moveTo(left + radius, bottom);
  shape.lineTo(left + width - radius, bottom);
  shape.quadraticCurveTo(left + width, bottom, left + width, bottom + radius);
  shape.lineTo(left + width, bottom + height - radius);
  shape.quadraticCurveTo(left + width, bottom + height, left + width - radius, bottom + height);
  shape.lineTo(left + radius, bottom + height);
  shape.quadraticCurveTo(left, bottom + height, left, bottom + height - radius);
  shape.lineTo(left, bottom + radius);
  shape.quadraticCurveTo(left, bottom, left + radius, bottom);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: Math.min(radius * 0.25, 0.008),
    bevelThickness: Math.min(depth * 0.16, 0.007),
    curveSegments: 4,
  });
  geometry.translate(0, 0, -depth / 2);
  const mesh = new THREE.Mesh(geometry, surface);
  mesh.position.set(x, y, z);
  return hideShadows(mesh);
}

function cylinder(top: number, bottom: number, height: number, surface: THREE.Material, x = 0, y = 0, z = 0, segments = 32) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, segments), surface);
  mesh.position.set(x, y, z);
  return hideShadows(mesh);
}

function sphere(radius: number, surface: THREE.Material, x = 0, y = 0, z = 0, width = 24, height = 16) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, width, height), surface);
  mesh.position.set(x, y, z);
  return hideShadows(mesh);
}

function plane(width: number, height: number, surface: THREE.Material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), surface);
  mesh.position.set(x, y, z);
  mesh.receiveShadow = true;
  return mesh;
}

function torus(radius: number, tube: number, surface: THREE.Material, x = 0, y = 0, z = 0, arc = Math.PI * 2) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 40, arc), surface);
  mesh.position.set(x, y, z);
  return hideShadows(mesh);
}

function rodBetween(start: Vec3, end: Vec3, radius: number, surface: THREE.Material, segments = 16) {
  const a = new THREE.Vector3().fromArray(start);
  const b = new THREE.Vector3().fromArray(end);
  const direction = b.clone().sub(a);
  const mesh = cylinder(radius, radius, direction.length(), surface, 0, 0, 0, segments);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(up, direction.normalize());
  return mesh;
}

function tube(points: Vec3[], radius: number, surface: THREE.Material, segments = 40) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3().fromArray(point)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, segments, radius, 10, false), surface);
  return hideShadows(mesh);
}

function canvasTexture(
  width: number,
  height: number,
  textures: Set<THREE.CanvasTexture>,
  paint: (context: CanvasRenderingContext2D, width: number, height: number) => void,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is unavailable");
  paint(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  textures.add(texture);
  return texture;
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function stationShell(station: GarageStation, hitSize: Vec3, hitCenter: Vec3, haloRadius: number, haloStretch = 1): BuiltStation {
  const group = new THREE.Group();
  group.name = `station-${station.id}`;
  group.position.fromArray(station.anchorPosition);
  if (station.id === "crema" || station.id === "pantry" || station.id === "chinahols") group.rotation.y = -Math.PI / 2;
  if (station.id === "preppr" || station.id === "book-adventure" || station.id === "rocketsfc") group.rotation.y = Math.PI / 2;

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(haloRadius * 0.93, haloRadius, 72),
    new THREE.MeshBasicMaterial({
      color: station.accentHex,
      transparent: true,
      opacity: 0.055,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.006;
  halo.scale.x = haloStretch;
  group.add(halo);

  const hitBox = new THREE.Mesh(
    new THREE.BoxGeometry(...hitSize),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false, side: THREE.DoubleSide }),
  );
  hitBox.name = `${station.id}-hit-volume`;
  hitBox.position.fromArray(hitCenter);
  group.add(hitBox);
  return { group, halo, borderMaterials: [], keyMaterials: [], animate: noop };
}

function registerKey(shell: BuiltStation, surface: THREE.MeshStandardMaterial, base: number, lift = 0.55) {
  shell.keyMaterials.push({ material: surface, base, lift });
  return surface;
}

function predictrTexture(kind: "curves" | "radar", textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(1024, 640, textures, (context, width, height) => {
    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#071923");
    background.addColorStop(1, "#03090f");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#b9f6ff";
    context.font = "600 31px monospace";
    context.fillText(kind === "curves" ? "GEOPOLITICAL HORIZON" : "WORLD FRICTION RADAR", 42, 52);
    context.fillStyle = "#548997";
    context.font = "19px monospace";
    context.fillText(kind === "curves" ? "LIVE PROBABILITY / 90 DAY" : "SIGNAL CLUSTERS / GLOBAL", 42, 84);
    context.fillStyle = "#22d3ee";
    roundRect(context, 846, 28, 134, 38, 19);
    context.fill();
    context.fillStyle = "#03212a";
    context.font = "bold 19px monospace";
    context.fillText("● LIVE", 866, 54);
    context.strokeStyle = "rgba(71, 191, 213, 0.15)";
    context.lineWidth = 1;
    for (let x = 42; x < width - 30; x += 58) {
      context.beginPath();
      context.moveTo(x, 112);
      context.lineTo(x, height - 64);
      context.stroke();
    }
    for (let y = 120; y < height - 50; y += 52) {
      context.beginPath();
      context.moveTo(36, y);
      context.lineTo(width - 36, y);
      context.stroke();
    }
    if (kind === "curves") {
      const colors = ["#22d3ee", "#f59e0b", "#a78bfa"];
      const labels = ["TAIWAN STRAIT", "GLOBAL ELECTIONS", "TRADE FRICTION"];
      for (let line = 0; line < 3; line += 1) {
        context.strokeStyle = colors[line];
        context.shadowColor = colors[line];
        context.shadowBlur = 12;
        context.lineWidth = 4;
        context.beginPath();
        for (let x = 42; x <= 760; x += 5) {
          const progress = (x - 42) / 718;
          const y = 405 - line * 48 - Math.sin(progress * 9 + line * 1.8) * 48 - progress * (62 + line * 16);
          if (x === 42) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
        context.shadowBlur = 0;
        context.fillStyle = colors[line];
        context.font = "18px monospace";
        context.fillText(labels[line], 790, 170 + line * 48);
      }
      context.fillStyle = "#d9fbff";
      context.font = "600 68px monospace";
      context.fillText("68.4%", 45, 570);
      context.fillStyle = "#739ca6";
      context.font = "19px monospace";
      context.fillText("MARKET CONFIDENCE  +4.8 / 24H", 320, 562);
    } else {
      const centerX = 510;
      const centerY = 350;
      for (let ring = 1; ring <= 5; ring += 1) {
        context.strokeStyle = `rgba(34, 211, 238, ${0.12 + ring * 0.055})`;
        context.lineWidth = 2;
        context.beginPath();
        context.arc(centerX, centerY, ring * 43, 0, Math.PI * 2);
        context.stroke();
      }
      for (let spoke = 0; spoke < 10; spoke += 1) {
        const angle = (spoke / 10) * Math.PI * 2;
        context.beginPath();
        context.moveTo(centerX, centerY);
        context.lineTo(centerX + Math.cos(angle) * 215, centerY + Math.sin(angle) * 215);
        context.stroke();
      }
      const radar = context.createRadialGradient(centerX, centerY, 20, centerX, centerY, 210);
      radar.addColorStop(0, "rgba(245,158,11,0.5)");
      radar.addColorStop(1, "rgba(245,158,11,0.05)");
      context.fillStyle = radar;
      context.strokeStyle = "#f59e0b";
      context.lineWidth = 4;
      context.beginPath();
      for (let point = 0; point < 10; point += 1) {
        const angle = (point / 10) * Math.PI * 2;
        const radius = 82 + ((point * 47) % 122);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        if (point === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
      context.fill();
      context.stroke();
      context.fillStyle = "#ffe1a3";
      context.font = "bold 24px monospace";
      context.fillText("8 ACTIVE REGIONS", 42, 570);
      context.fillStyle = "#769da6";
      context.font = "18px monospace";
      context.fillText("FRICTION INDEX  43.7 / MODERATE", 600, 570);
    }
  });
}

function buildPredictr(station: GarageStation, ownedTextures: Set<THREE.CanvasTexture>, workshop?: WorkshopTextures): BuiltStation {
  const shell = stationShell(station, [2.4, 1.2, 1.1], [0, 0.56, 0.04], 0.96, 1.2);
  const { group } = shell;
  const aluminum = brushed(workshop, 0x9da8ab, 0.3, 0.86);
  const dark = material({ color: 0x11191e, metalness: 0.68, roughness: 0.32 });
  const rubber = material({ color: 0x101719, roughness: 0.88 });
  const brass = material({ color: 0xa98545, metalness: 0.88, roughness: 0.25, map: workshop?.brushedMetal.map });

  group.add(slab(1.72, 0.52, 0.025, 0.055, rubber, -0.2, 0.018, 0.13));
  const stitch = material({ color: 0x45666b, roughness: 0.8 });
  for (let index = 0; index < 24; index += 1) {
    group.add(box(0.038, 0.003, 0.006, stitch, -0.98 + index * 0.067, 0.033, 0.375));
  }

  group.add(cylinder(0.13, 0.16, 0.04, aluminum, -0.22, 0.04, -0.17));
  group.add(cylinder(0.034, 0.045, 0.38, aluminum, -0.22, 0.24, -0.17));
  group.add(sphere(0.063, dark, -0.22, 0.43, -0.17));
  group.add(rodBetween([-0.22, 0.43, -0.17], [-0.58, 0.5, -0.13], 0.027, aluminum));
  group.add(rodBetween([-0.22, 0.43, -0.17], [0.18, 0.5, -0.13], 0.027, aluminum));
  group.add(sphere(0.048, brass, -0.58, 0.5, -0.13));
  group.add(sphere(0.048, brass, 0.18, 0.5, -0.13));

  const monitorData = [
    { x: -0.59, angle: 0.1, kind: "curves" as const },
    { x: 0.19, angle: -0.1, kind: "radar" as const },
  ];
  for (const monitor of monitorData) {
    const assembly = new THREE.Group();
    assembly.position.set(monitor.x, 0.65, -0.08);
    assembly.rotation.y = monitor.angle;
    assembly.add(beveledBox(0.75, 0.475, 0.052, 0.026, aluminum));
    assembly.add(box(0.714, 0.438, 0.015, dark, 0, 0, 0.031));
    const screenMaterial = registerKey(shell, material({
      map: predictrTexture(monitor.kind, ownedTextures),
      emissive: monitor.kind === "curves" ? 0x0b8da2 : 0x9a5d08,
      emissiveIntensity: 0.72,
      roughness: 0.34,
      metalness: 0.05,
    }), 0.72, 0.35);
    screenMaterial.emissiveMap = screenMaterial.map;
    assembly.add(plane(0.686, 0.408, screenMaterial, 0, 0.006, 0.04));
    assembly.add(sphere(0.007, material({ color: 0x72f3ff, emissive: 0x22d3ee, emissiveIntensity: 1.4 }), 0.325, -0.218, 0.044, 12, 8));
    group.add(assembly);
  }

  const keyboard = new THREE.Group();
  keyboard.position.set(-0.28, 0.04, 0.25);
  keyboard.rotation.x = -0.045;
  keyboard.add(slab(0.69, 0.245, 0.035, 0.025, aluminum, 0, 0, 0));
  const keySurface = material({ color: 0x263239, roughness: 0.57, metalness: 0.15 });
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 11; column += 1) {
      keyboard.add(box(0.045, 0.034, 0.012, keySurface, -0.295 + column * 0.058, 0.023, -0.079 + row * 0.052));
    }
  }
  keyboard.add(box(0.25, 0.032, 0.013, keySurface, 0, 0.024, 0.087));
  group.add(keyboard);

  const mouse = sphere(0.09, dark, 0.24, 0.068, 0.27, 24, 16);
  mouse.scale.set(0.72, 0.42, 1.08);
  group.add(mouse);
  group.add(box(0.006, 0.025, 0.07, aluminum, 0.24, 0.094, 0.25));
  const mouseWheel = cylinder(0.012, 0.012, 0.018, rubber, 0.24, 0.108, 0.235, 12);
  mouseWheel.rotation.z = Math.PI / 2;
  group.add(mouseWheel);

  group.add(cylinder(0.18, 0.22, 0.065, dark, 0.9, 0.035, -0.02));
  group.add(cylinder(0.065, 0.09, 0.25, aluminum, 0.9, 0.19, -0.02));
  group.add(cylinder(0.15, 0.09, 0.055, brass, 0.9, 0.335, -0.02));
  const globe = new THREE.Group();
  globe.position.set(0.9, 0.55, -0.02);
  const core = registerKey(shell, material({
    color: 0x0c7080,
    emissive: 0x22d3ee,
    emissiveIntensity: 0.48,
    transparent: true,
    opacity: 0.26,
    roughness: 0.18,
    metalness: 0.25,
    depthWrite: false,
  }), 0.48, 0.38);
  globe.add(sphere(0.185, core, 0, 0, 0, 28, 18));
  const cyanWire = material({ color: 0x63efff, emissive: 0x22d3ee, emissiveIntensity: 1.1, wireframe: true, transparent: true, opacity: 0.74 });
  const amberWire = material({ color: 0xf5ad32, emissive: 0xf59e0b, emissiveIntensity: 0.7, wireframe: true, transparent: true, opacity: 0.52 });
  globe.add(sphere(0.202, cyanWire, 0, 0, 0, 20, 12));
  const longitude = sphere(0.208, amberWire, 0, 0, 0, 12, 8);
  longitude.rotation.z = Math.PI / 2;
  globe.add(longitude);
  const equator = torus(0.25, 0.012, brass);
  equator.rotation.x = Math.PI / 2;
  globe.add(equator);
  const meridian = torus(0.25, 0.009, brass);
  meridian.rotation.y = Math.PI / 2;
  globe.add(meridian);
  const tiltedRing = torus(0.26, 0.007, brass);
  tiltedRing.rotation.set(Math.PI / 2, 0.42, 0.42);
  globe.add(tiltedRing);
  const cities = new THREE.Group();
  const cityCyan = material({ color: 0xc5fbff, emissive: 0x22d3ee, emissiveIntensity: 2 });
  const cityAmber = material({ color: 0xffe2a8, emissive: 0xf59e0b, emissiveIntensity: 1.8 });
  for (let index = 0; index < 7; index += 1) {
    const angle = (index / 7) * Math.PI * 2;
    cities.add(sphere(0.012 + (index % 2) * 0.004, index % 2 ? cityAmber : cityCyan, Math.cos(angle) * 0.282, Math.sin(index * 2.3) * 0.065, Math.sin(angle) * 0.282, 12, 8));
  }
  globe.add(cities);
  group.add(globe);

  shell.animate = (elapsed) => {
    globe.rotation.y = elapsed * 0.25;
    globe.rotation.x = Math.sin(elapsed * 0.3) * 0.045;
    longitude.rotation.y = -elapsed * 0.28;
    cities.rotation.y = elapsed * 0.48;
    tiltedRing.rotation.z = 0.42 + Math.sin(elapsed * 0.42) * 0.1;
  };
  return shell;
}

function plannrTexture(textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(1024, 640, textures, (context, width, height) => {
    context.fillStyle = "#0c0d13";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#151722";
    context.fillRect(0, 0, width, 82);
    context.fillStyle = "#eceefe";
    context.font = "bold 29px sans-serif";
    context.fillText("PLANNR  /  SPRING SPRINT", 32, 42);
    context.fillStyle = "#82869c";
    context.font = "17px monospace";
    context.fillText("CYCLE 24  •  12 ISSUES  •  68% COMPLETE", 32, 68);
    context.fillStyle = "#102d27";
    roundRect(context, 792, 22, 198, 40, 20);
    context.fill();
    context.strokeStyle = "#34d399";
    context.stroke();
    context.fillStyle = "#78f7c5";
    context.font = "bold 17px monospace";
    context.fillText("● MCP CONNECTED", 810, 48);
    const columns = [
      { title: "TODO", color: "#8b90a5" },
      { title: "IN PROGRESS", color: "#f5b942" },
      { title: "DONE", color: "#55d6a7" },
    ];
    const cards = [
      ["Market signal adapter", "Artifact vault schema", "Mobile navigation"],
      ["Remote MCP tools", "Sprint burndown", "Live cursors"],
      ["Issue detail view", "PostgreSQL persistence", "Keyboard commands"],
    ];
    const priorities = ["#f87171", "#fbbf24", "#818cf8"];
    for (let column = 0; column < 3; column += 1) {
      const x = 28 + column * 334;
      context.fillStyle = "#11131c";
      roundRect(context, x, 105, 310, 500, 12);
      context.fill();
      context.fillStyle = columns[column].color;
      context.font = "bold 18px sans-serif";
      context.fillText(columns[column].title, x + 18, 140);
      for (let card = 0; card < 3; card += 1) {
        const y = 162 + card * 139;
        context.fillStyle = "#1b1e2a";
        roundRect(context, x + 12, y, 286, 119, 9);
        context.fill();
        context.strokeStyle = "#2c3041";
        context.stroke();
        context.fillStyle = "#777d96";
        context.font = "14px monospace";
        context.fillText(`PLN-${124 + column * 9 + card}`, x + 28, y + 27);
        context.fillStyle = "#e2e5f2";
        context.font = "18px sans-serif";
        context.fillText(cards[column][card], x + 28, y + 57);
        context.fillStyle = priorities[(column + card) % 3];
        roundRect(context, x + 27, y + 78, 70, 23, 11);
        context.fill();
        context.fillStyle = "#11131b";
        context.font = "bold 12px monospace";
        context.fillText(card === 0 ? "HIGH" : card === 1 ? "MED" : "LOW", x + 41, y + 94);
        context.fillStyle = "#5d637a";
        context.fillText("◫  3   ◇  2", x + 190, y + 95);
      }
    }
  });
}

function buildPlannr(station: GarageStation, ownedTextures: Set<THREE.CanvasTexture>, workshop?: WorkshopTextures): BuiltStation {
  const shell = stationShell(station, [1.95, 1.08, 1.0], [0, 0.5, 0], 0.78, 1.15);
  const { group } = shell;
  const aluminum = brushed(workshop, 0xa8b0b8, 0.25, 0.88);
  const slate = material({ color: 0x20232e, metalness: 0.6, roughness: 0.38 });
  const brass = material({ color: 0xb38b46, metalness: 0.9, roughness: 0.24 });
  const mat = material({ color: 0x181b25, roughness: 0.9 });
  group.add(slab(1.5, 0.55, 0.025, 0.04, mat, -0.1, 0.018, 0.12));

  group.add(slab(0.42, 0.28, 0.035, 0.04, aluminum, -0.22, 0.035, -0.08));
  group.add(cylinder(0.035, 0.05, 0.32, aluminum, -0.22, 0.21, -0.13));
  group.add(beveledBox(1.18, 0.69, 0.055, 0.035, aluminum, -0.22, 0.61, -0.12));
  group.add(box(1.135, 0.645, 0.018, slate, -0.22, 0.61, -0.087));
  const display = registerKey(shell, material({
    map: plannrTexture(ownedTextures),
    emissive: 0x353a8d,
    emissiveIntensity: 0.52,
    roughness: 0.38,
  }), 0.52, 0.38);
  display.emissiveMap = display.map;
  group.add(plane(1.105, 0.615, display, -0.22, 0.615, -0.075));

  const macro = new THREE.Group();
  macro.position.set(0.58, 0.055, 0.22);
  macro.rotation.x = -0.06;
  macro.add(slab(0.36, 0.3, 0.055, 0.035, aluminum));
  const macroKeys = material({ color: 0x292d3b, roughness: 0.5, metalness: 0.25 });
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      macro.add(slab(0.075, 0.06, 0.025, 0.01, macroKeys, -0.1 + column * 0.1, 0.046, -0.085 + row * 0.085));
    }
  }
  const knob = cylinder(0.044, 0.044, 0.035, brass, 0.12, 0.05, -0.102, 24);
  macro.add(knob);
  group.add(macro);

  const rail = new THREE.Group();
  rail.position.set(0.66, 0.04, -0.22);
  rail.add(beveledBox(0.36, 0.53, 0.045, 0.025, brass, 0, 0.29, 0));
  rail.add(box(0.32, 0.485, 0.022, slate, 0, 0.29, 0.028));
  const card = material({ color: 0x303549, roughness: 0.7 });
  const doneCard = material({ color: 0x263d38, roughness: 0.65 });
  for (let index = 0; index < 4; index += 1) {
    rail.add(beveledBox(0.25, 0.075, 0.015, 0.008, index === 3 ? doneCard : card, 0, 0.44 - index * 0.105, 0.046));
    rail.add(box(0.12, 0.008, 0.006, index === 3 ? material({ color: 0x5eead4, emissive: 0x14b8a6, emissiveIntensity: 0.8 }) : aluminum, -0.04, 0.45 - index * 0.105, 0.058));
  }
  const railLed = registerKey(shell, material({ color: 0xb7ffe6, emissive: 0x34d399, emissiveIntensity: 1.25 }), 1.25, 0.4);
  rail.add(sphere(0.017, railLed, 0.125, 0.5, 0.055, 16, 10));
  rail.add(box(0.24, 0.035, 0.18, brass, 0, 0.018, 0));
  group.add(rail);
  shell.animate = (elapsed) => {
    railLed.emissiveIntensity += 0.18 + Math.sin(elapsed * 2.2) * 0.12;
  };
  return shell;
}

function gaugeTexture(label: string, textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(384, 384, textures, (context) => {
    const face = context.createRadialGradient(160, 135, 20, 192, 192, 185);
    face.addColorStop(0, "#fffdf2");
    face.addColorStop(1, "#d8cfb8");
    context.fillStyle = face;
    context.fillRect(0, 0, 384, 384);
    context.strokeStyle = "#262a29";
    context.lineWidth = 7;
    context.beginPath();
    context.arc(192, 192, 170, 0, Math.PI * 2);
    context.stroke();
    for (let tick = 0; tick <= 36; tick += 1) {
      const angle = Math.PI * 0.75 + (tick / 36) * Math.PI * 1.5;
      const inner = tick % 3 === 0 ? 126 : 140;
      context.lineWidth = tick % 3 === 0 ? 5 : 2;
      context.beginPath();
      context.moveTo(192 + Math.cos(angle) * inner, 192 + Math.sin(angle) * inner);
      context.lineTo(192 + Math.cos(angle) * 157, 192 + Math.sin(angle) * 157);
      context.stroke();
      if (tick % 6 === 0) {
        context.fillStyle = "#303331";
        context.font = "22px monospace";
        context.textAlign = "center";
        context.fillText(String(tick / 3), 192 + Math.cos(angle) * 103, 200 + Math.sin(angle) * 103);
      }
    }
    context.strokeStyle = "#b13c26";
    context.lineWidth = 8;
    context.beginPath();
    context.moveTo(192, 192);
    const needle = label === "STEAM" ? Math.PI * 1.18 : Math.PI * 1.75;
    context.lineTo(192 + Math.cos(needle) * 115, 192 + Math.sin(needle) * 115);
    context.stroke();
    context.fillStyle = "#252927";
    context.beginPath();
    context.arc(192, 192, 13, 0, Math.PI * 2);
    context.fill();
    context.font = "bold 27px sans-serif";
    context.fillText(label, 192, 276);
    context.font = "bold 22px monospace";
    context.fillText("BAR", 192, 307);
  });
}

function steamTexture(textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(96, 384, textures, (context, width, height) => {
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.22, "rgba(255,248,232,0.65)");
    gradient.addColorStop(0.72, "rgba(255,248,232,0.35)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.strokeStyle = gradient;
    context.lineWidth = 13;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(width * 0.5, height);
    context.bezierCurveTo(8, height * 0.72, width - 8, height * 0.38, width * 0.48, 0);
    context.stroke();
  });
}

function coffeeBagTexture(textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(384, 512, textures, (context, width, height) => {
    context.fillStyle = "#b89260";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(81,52,29,0.2)";
    for (let y = 0; y < height; y += 9) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y + 3);
      context.stroke();
    }
    context.fillStyle = "#eee2c6";
    roundRect(context, 38, 100, 308, 290, 10);
    context.fill();
    context.fillStyle = "#30271e";
    context.textAlign = "center";
    context.font = "bold 40px sans-serif";
    context.fillText("CREMA", 192, 170);
    context.font = "22px monospace";
    context.fillText("SINGLE ORIGIN", 192, 209);
    context.fillStyle = "#7a4a28";
    context.beginPath();
    context.ellipse(192, 275, 42, 58, 0.5, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#d8b586";
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(171, 230);
    context.quadraticCurveTo(220, 270, 203, 327);
    context.stroke();
    context.fillStyle = "#30271e";
    context.font = "20px monospace";
    context.fillText("ETHIOPIA / 250g", 192, 360);
    context.fillText("ROAST  08.26", 192, 438);
  });
}

function buildCrema(station: GarageStation, ownedTextures: Set<THREE.CanvasTexture>, workshop?: WorkshopTextures): BuiltStation {
  const shell = stationShell(station, [1.55, 1.3, 1.25], [0, 0.6, 0.06], 0.73, 1.02);
  const { group } = shell;
  const stainless = brushed(workshop, 0xc4cbca, 0.14, 0.92);
  const chrome = material({ color: 0xd2d8d7, metalness: 0.97, roughness: 0.1 });
  const espresso = material({ color: 0x251b18, metalness: 0.18, roughness: 0.68 });
  const black = material({ color: 0x111312, roughness: 0.72 });
  const brass = material({ color: 0xba8740, metalness: 0.88, roughness: 0.23 });
  const walnut = timber(workshop, 0x4a2718, 0.45);
  const ceramic = material({ color: 0xf0e3ca, roughness: 0.24 });

  group.add(box(0.77, 0.055, 0.49, black, -0.18, 0.033, -0.05));
  group.add(beveledBox(0.77, 0.61, 0.5, 0.055, stainless, -0.18, 0.365, -0.07));
  group.add(box(0.045, 0.54, 0.47, espresso, -0.585, 0.37, -0.07));
  group.add(box(0.045, 0.54, 0.47, espresso, 0.225, 0.37, -0.07));
  group.add(beveledBox(0.82, 0.53, 0.065, 0.045, stainless, -0.18, 0.695, -0.07));
  group.add(box(0.64, 0.31, 0.026, stainless, -0.18, 0.435, 0.194));
  group.add(box(0.52, 0.19, 0.035, black, -0.16, 0.265, 0.215));
  group.add(box(0.75, 0.045, 0.42, stainless, -0.18, 0.075, 0.2));
  for (let slit = -5; slit <= 5; slit += 1) {
    group.add(box(0.025, 0.015, 0.35, chrome, -0.18 + slit * 0.058, 0.105, 0.21));
  }

  const gaugeMapA = gaugeTexture("PUMP", ownedTextures);
  const gaugeMapB = gaugeTexture("STEAM", ownedTextures);
  for (let index = 0; index < 2; index += 1) {
    const x = -0.36 + index * 0.235;
    const rim = cylinder(0.087, 0.087, 0.036, chrome, x, 0.535, 0.22);
    rim.rotation.x = Math.PI / 2;
    group.add(rim);
    group.add(plane(0.147, 0.147, material({ map: index === 0 ? gaugeMapA : gaugeMapB, roughness: 0.36 }), x, 0.535, 0.241));
  }
  const powerLed = registerKey(shell, material({ color: 0xffd282, emissive: 0xf59e0b, emissiveIntensity: 1.2 }), 1.2, 0.35);
  group.add(sphere(0.017, powerLed, 0.09, 0.535, 0.225, 16, 10));

  const groupHead = cylinder(0.092, 0.092, 0.065, brass, -0.18, 0.375, 0.245);
  groupHead.rotation.x = Math.PI / 2;
  group.add(groupHead);
  group.add(cylinder(0.067, 0.075, 0.07, chrome, -0.18, 0.32, 0.255));
  const handleCollar = cylinder(0.03, 0.03, 0.13, brass, -0.18, 0.345, 0.34);
  handleCollar.rotation.x = Math.PI / 2;
  group.add(handleCollar);
  const handle = cylinder(0.032, 0.047, 0.28, walnut, -0.18, 0.345, 0.525, 24);
  handle.rotation.x = Math.PI / 2;
  group.add(handle);
  for (const z of [0.405, 0.435, 0.61]) {
    const band = torus(0.038, 0.006, brass, -0.18, 0.345, z);
    group.add(band);
  }

  group.add(tube([[0.18, 0.46, 0.12], [0.31, 0.43, 0.2], [0.34, 0.29, 0.27], [0.3, 0.2, 0.3]], 0.014, chrome));
  const steamKnob = cylinder(0.048, 0.048, 0.04, black, 0.19, 0.5, 0.2);
  steamKnob.rotation.x = Math.PI / 2;
  group.add(steamKnob);

  const hopperGlass = material({ color: 0x71807b, transparent: true, opacity: 0.3, roughness: 0.09, metalness: 0.08, depthWrite: false });
  group.add(cylinder(0.165, 0.105, 0.25, hopperGlass, -0.09, 0.855, -0.09, 32));
  group.add(cylinder(0.18, 0.18, 0.035, black, -0.09, 0.997, -0.09));
  group.add(cylinder(0.11, 0.11, 0.075, chrome, -0.09, 0.715, -0.09));
  const beanMaterials = [material({ color: 0x3c2115, roughness: 0.82 }), material({ color: 0x5a301b, roughness: 0.78 })];
  for (let index = 0; index < 24; index += 1) {
    const angle = index * 2.39996;
    const radius = 0.025 + (index % 5) * 0.022;
    const bean = sphere(0.027, beanMaterials[index % 2], -0.09 + Math.cos(angle) * radius, 0.76 + Math.floor(index / 8) * 0.047, -0.09 + Math.sin(angle) * radius, 12, 8);
    bean.scale.set(1, 0.65, 0.72);
    bean.rotation.y = angle;
    group.add(bean);
  }

  group.add(cylinder(0.09, 0.065, 0.13, ceramic, -0.18, 0.18, 0.34));
  group.add(cylinder(0.075, 0.075, 0.008, material({ color: 0xb96e2d, roughness: 0.5 }), -0.18, 0.249, 0.34));
  const cremaRing = torus(0.048, 0.008, material({ color: 0xe6b66b, roughness: 0.5 }), -0.18, 0.254, 0.34);
  cremaRing.rotation.x = Math.PI / 2;
  group.add(cremaRing);
  const cupHandle = torus(0.052, 0.012, ceramic, -0.075, 0.185, 0.34, Math.PI * 1.65);
  cupHandle.rotation.z = -Math.PI * 0.82;
  group.add(cupHandle);

  const pitcher = new THREE.Group();
  pitcher.position.set(0.42, 0, 0.19);
  pitcher.add(cylinder(0.092, 0.068, 0.18, stainless, 0, 0.1, 0));
  pitcher.add(cylinder(0.082, 0.082, 0.008, material({ color: 0xd8cfb9, roughness: 0.38 }), 0, 0.192, 0));
  const pitcherHandle = torus(0.075, 0.012, chrome, 0.095, 0.115, 0, Math.PI * 1.5);
  pitcherHandle.rotation.z = -Math.PI * 0.75;
  pitcher.add(pitcherHandle);
  const spout = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.09, 3), stainless);
  spout.position.set(0, 0.18, 0.09);
  spout.rotation.x = Math.PI / 2;
  pitcher.add(spout);
  group.add(pitcher);

  group.add(cylinder(0.058, 0.07, 0.025, aluminumForTamper(workshop), 0.37, 0.025, -0.18));
  group.add(cylinder(0.022, 0.035, 0.095, walnut, 0.37, 0.083, -0.18));
  group.add(sphere(0.045, walnut, 0.37, 0.14, -0.18));

  const bag = new THREE.Group();
  bag.position.set(0.52, 0, -0.25);
  bag.rotation.y = -0.12;
  bag.add(beveledBox(0.25, 0.42, 0.13, 0.025, material({ color: 0xb89260, roughness: 0.92 }), 0, 0.22, 0));
  bag.add(box(0.25, 0.035, 0.14, material({ color: 0x8a683f, roughness: 0.9 }), 0, 0.445, 0));
  bag.add(plane(0.22, 0.3, material({ map: coffeeBagTexture(ownedTextures), roughness: 0.8 }), 0, 0.235, 0.072));
  group.add(bag);

  const wisps: Array<{ mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>; phase: number; x: number }> = [];
  const steamMap = steamTexture(ownedTextures);
  for (let index = 0; index < 3; index += 1) {
    const steam = new THREE.MeshBasicMaterial({ map: steamMap, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, color: 0xfff4df });
    const wisp = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.28), steam);
    wisp.position.set(-0.18, 0.34 + index * 0.06, 0.34 + index * 0.008);
    group.add(wisp);
    wisps.push({ mesh: wisp, phase: index / 3, x: -0.18 + (index - 1) * 0.017 });
  }
  shell.animate = (elapsed) => {
    powerLed.emissiveIntensity += 0.12 + Math.sin(elapsed * 1.7) * 0.08;
    for (const wisp of wisps) {
      const rise = (elapsed * 0.18 + wisp.phase) % 1;
      wisp.mesh.position.y = 0.285 + rise * 0.43;
      wisp.mesh.position.x = wisp.x + Math.sin(elapsed * 1.15 + wisp.phase * 8) * 0.026;
      wisp.mesh.material.opacity = Math.sin(rise * Math.PI) * 0.22;
      wisp.mesh.scale.set(0.72 + rise * 0.6, 0.72 + rise * 0.52, 1);
    }
  };
  return shell;
}

function aluminumForTamper(workshop?: WorkshopTextures) {
  return brushed(workshop, 0xb9c0c0, 0.2, 0.92);
}

function slab(width: number, depth: number, height: number, radius: number, surface: THREE.Material, x = 0, y = 0, z = 0) {
  const mesh = beveledBox(width, depth, height, radius, surface, x, y, z);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

function recipeTexture(textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(768, 1024, textures, (context, width, height) => {
    context.fillStyle = "#f4f0df";
    context.fillRect(0, 0, width, height);
    const header = context.createLinearGradient(0, 0, width, 0);
    header.addColorStop(0, "#26351d");
    header.addColorStop(1, "#425827");
    context.fillStyle = header;
    context.fillRect(0, 0, width, 168);
    context.fillStyle = "#d8faa0";
    context.font = "bold 45px sans-serif";
    context.fillText("PANTRY / RECIPE", 48, 72);
    context.fillStyle = "#ffffff";
    context.font = "25px monospace";
    context.fillText("MATCHED TO YOUR SHELF", 48, 124);
    const photo = context.createLinearGradient(48, 205, 700, 440);
    photo.addColorStop(0, "#b7dc6a");
    photo.addColorStop(1, "#e9c76b");
    context.fillStyle = photo;
    roundRect(context, 48, 204, 672, 260, 24);
    context.fill();
    context.fillStyle = "#f7edcf";
    context.beginPath();
    context.ellipse(382, 328, 150, 94, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#a76530";
    context.beginPath();
    context.ellipse(382, 322, 121, 72, 0, 0, Math.PI * 2);
    context.fill();
    for (let index = 0; index < 20; index += 1) {
      const angle = index * 2.4;
      context.fillStyle = index % 3 === 0 ? "#84a946" : "#e5bf67";
      context.beginPath();
      context.arc(382 + Math.cos(angle) * (25 + (index % 5) * 17), 322 + Math.sin(angle) * (17 + (index % 4) * 12), 9, 0, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = "#26321f";
    context.font = "bold 49px sans-serif";
    context.fillText("Golden oat bowl", 48, 544);
    context.fillStyle = "#71805f";
    context.font = "26px monospace";
    context.fillText("12 MIN  •  5 INGREDIENTS", 48, 590);
    context.fillStyle = "#84cc16";
    roundRect(context, 510, 516, 210, 62, 31);
    context.fill();
    context.fillStyle = "#1d2c12";
    context.font = "bold 23px monospace";
    context.fillText("96% MATCH", 537, 556);
    const lines = [
      ["01", "Toast the oats & spice", "Warm a dry pan; fold until fragrant."],
      ["02", "Fold through warm milk", "Simmer gently for six minutes."],
      ["03", "Finish with espresso", "Add a shot and a pinch of salt."],
      ["04", "Season to your taste", "Top with herbs from your pantry."],
    ];
    for (let index = 0; index < lines.length; index += 1) {
      const y = 668 + index * 79;
      context.fillStyle = "#d8e5c2";
      context.beginPath();
      context.arc(72, y - 10, 27, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#42562c";
      context.font = "bold 23px monospace";
      context.fillText(lines[index][0], 53, y - 2);
      context.fillStyle = "#35422b";
      context.font = "bold 27px sans-serif";
      context.fillText(lines[index][1], 119, y - 13);
      context.fillStyle = "#78816e";
      context.font = "22px sans-serif";
      context.fillText(lines[index][2], 119, y + 23);
    }
  });
}

function spiceLabelTexture(name: string, color: string, textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(256, 160, textures, (context, width, height) => {
    context.fillStyle = "#eee5cc";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#b9a987";
    context.lineWidth = 5;
    context.strokeRect(8, 8, width - 16, height - 16);
    context.fillStyle = color;
    context.fillRect(20, 20, 10, height - 40);
    context.fillStyle = "#352f26";
    context.textAlign = "center";
    context.font = "bold 28px sans-serif";
    context.fillText(name.toUpperCase(), 140, 76);
    context.fillStyle = "#887a63";
    context.font = "16px monospace";
    context.fillText("PANTRY / ORGANIC", 140, 111);
  });
}

function buildPantry(station: GarageStation, ownedTextures: Set<THREE.CanvasTexture>, workshop?: WorkshopTextures): BuiltStation {
  const shell = stationShell(station, [2.15, 1.18, 1.1], [0.05, 0.53, 0], 0.78, 1.28);
  const { group } = shell;
  const walnut = timber(workshop, 0x725037, 0.58);
  const cork = material({ color: 0xa87946, roughness: 0.96, bumpMap: workshop?.butcherBlock.bumpMap, bumpScale: 0.025 });
  const glass = material({ color: 0xe6f3e8, transparent: true, opacity: 0.3, roughness: 0.08, metalness: 0.04, depthWrite: false });
  const aluminum = brushed(workshop, 0xb2bab5, 0.24, 0.88);

  group.add(slab(1.22, 0.4, 0.075, 0.035, walnut, -0.32, 0.045, -0.06));
  group.add(slab(1.22, 0.38, 0.06, 0.03, walnut, -0.32, 0.44, -0.075));
  group.add(beveledBox(0.065, 0.46, 0.39, 0.018, walnut, -0.9, 0.25, -0.06));
  group.add(beveledBox(0.065, 0.46, 0.39, 0.018, walnut, 0.26, 0.25, -0.06));
  group.add(box(1.12, 0.39, 0.025, walnut, -0.32, 0.26, -0.245));

  const spices = [
    { name: "Turmeric", color: "#d99b24", fill: 0xd99b24 },
    { name: "Herbs", color: "#6f913c", fill: 0x64883b },
    { name: "Paprika", color: "#b94728", fill: 0xb94728 },
    { name: "Sea salt", color: "#9a9b8c", fill: 0xd7c59a },
    { name: "Pepper", color: "#493126", fill: 0x392218 },
    { name: "Cumin", color: "#a87536", fill: 0xa87536 },
  ];
  for (let index = 0; index < 6; index += 1) {
    const row = Math.floor(index / 3);
    const column = index % 3;
    const x = -0.69 + column * 0.37;
    const shelfY = row === 0 ? 0.083 : 0.472;
    const jarHeight = 0.245;
    const centerY = shelfY + jarHeight / 2;
    const z = -0.035;
    group.add(cylinder(0.105, 0.095, jarHeight, glass, x, centerY, z, 8));
    const fillHeight = 0.135 + (index % 3) * 0.022;
    group.add(cylinder(0.083, 0.078, fillHeight, material({ color: spices[index].fill, roughness: 0.92 }), x, shelfY + 0.018 + fillHeight / 2, z, 8));
    group.add(cylinder(0.108, 0.1, 0.047, cork, x, shelfY + jarHeight + 0.018, z, 12));
    group.add(plane(0.145, 0.09, material({ map: spiceLabelTexture(spices[index].name, spices[index].color, ownedTextures), roughness: 0.76 }), x, centerY, z + 0.102));
  }

  const board = slab(0.55, 0.38, 0.035, 0.055, walnut, 0.54, 0.025, 0.2);
  board.rotation.y = -0.13;
  group.add(board);
  const bowlSurface = material({ color: 0xe8e1ce, roughness: 0.27, side: THREE.DoubleSide });
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.14, 28, 16, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5), bowlSurface);
  bowl.position.set(0.49, 0.155, 0.19);
  bowl.scale.y = 0.65;
  hideShadows(bowl);
  group.add(bowl);
  const bowlRim = torus(0.14, 0.009, bowlSurface, 0.49, 0.155, 0.19);
  bowlRim.rotation.x = Math.PI / 2;
  group.add(bowlRim);
  const blade = box(0.25, 0.008, 0.055, aluminum, 0.65, 0.065, 0.34);
  blade.rotation.y = -0.28;
  group.add(blade);
  const knifeHandle = box(0.13, 0.026, 0.05, material({ color: 0x272b25, roughness: 0.55 }), 0.82, 0.07, 0.29);
  knifeHandle.rotation.y = -0.28;
  group.add(knifeHandle);

  const tablet = new THREE.Group();
  tablet.position.set(0.76, 0.045, -0.13);
  tablet.rotation.x = -0.14;
  tablet.add(beveledBox(0.48, 0.65, 0.045, 0.035, aluminum, 0, 0.35, 0));
  tablet.add(box(0.445, 0.612, 0.012, material({ color: 0x151a14, roughness: 0.4 }), 0, 0.35, 0.029));
  const tabletScreen = registerKey(shell, material({
    map: recipeTexture(ownedTextures),
    emissive: 0x587d19,
    emissiveIntensity: 0.42,
    roughness: 0.4,
  }), 0.42, 0.32);
  tabletScreen.emissiveMap = tabletScreen.map;
  tablet.add(plane(0.418, 0.575, tabletScreen, 0, 0.35, 0.037));
  group.add(tablet);
  group.add(slab(0.36, 0.28, 0.035, 0.035, aluminum, 0.76, 0.025, -0.08));
  group.add(rodBetween([0.76, 0.04, -0.17], [0.76, 0.28, -0.21], 0.025, aluminum));

  shell.animate = (elapsed) => {
    tabletScreen.emissiveIntensity += 0.055 + Math.sin(elapsed * 1.1) * 0.04;
  };
  return shell;
}

function chinaMapTexture(textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(1024, 640, textures, (context, width, height) => {
    context.fillStyle = "#d8c395";
    context.fillRect(0, 0, width, height);
    const wash = context.createRadialGradient(480, 280, 30, 480, 280, 570);
    wash.addColorStop(0, "rgba(255,247,214,0.42)");
    wash.addColorStop(1, "rgba(101,67,32,0.2)");
    context.fillStyle = wash;
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(83,65,39,0.13)";
    for (let x = 30; x < width; x += 42) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x + 15, height);
      context.stroke();
    }
    context.fillStyle = "#4a3c2c";
    context.font = "bold 31px serif";
    context.fillText("CHINA  /  NORTH & SOUTH", 44, 52);
    context.font = "18px monospace";
    context.fillText("RAIL ITINERARY  •  北京  →  上海  →  桂林", 44, 84);
    context.fillStyle = "rgba(108,122,77,0.32)";
    context.beginPath();
    context.moveTo(360, 145);
    context.bezierCurveTo(510, 70, 700, 130, 746, 230);
    context.bezierCurveTo(805, 355, 680, 525, 530, 505);
    context.bezierCurveTo(440, 480, 450, 390, 345, 350);
    context.bezierCurveTo(270, 275, 285, 190, 360, 145);
    context.fill();
    context.strokeStyle = "#766b48";
    context.lineWidth = 3;
    for (let mountain = 0; mountain < 15; mountain += 1) {
      const x = 300 + (mountain % 5) * 82 + (mountain % 2) * 20;
      const y = 175 + Math.floor(mountain / 5) * 120;
      context.beginPath();
      context.moveTo(x - 25, y + 25);
      context.lineTo(x, y - 20 - (mountain % 3) * 9);
      context.lineTo(x + 27, y + 25);
      context.moveTo(x - 7, y - 7);
      context.lineTo(x + 3, y + 3);
      context.lineTo(x + 10, y - 5);
      context.stroke();
    }
    context.strokeStyle = "#9e3e2f";
    context.lineWidth = 6;
    context.setLineDash([18, 10]);
    context.beginPath();
    context.moveTo(628, 142);
    context.bezierCurveTo(560, 195, 665, 235, 590, 285);
    context.bezierCurveTo(510, 340, 630, 382, 510, 470);
    context.stroke();
    context.strokeStyle = "#3e6070";
    context.beginPath();
    context.moveTo(628, 142);
    context.bezierCurveTo(750, 240, 690, 290, 740, 350);
    context.bezierCurveTo(700, 420, 610, 418, 510, 470);
    context.stroke();
    context.setLineDash([]);
    const cities = [["BEIJING", 628, 142], ["XI'AN", 520, 270], ["SHANGHAI", 740, 350], ["GUILIN", 510, 470]];
    context.font = "bold 19px monospace";
    for (const [name, x, y] of cities) {
      context.fillStyle = "#b03d2c";
      context.beginPath();
      context.arc(Number(x), Number(y), 8, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#42372a";
      context.fillText(String(name), Number(x) + 15, Number(y) - 12);
    }
    context.fillStyle = "#6c5337";
    context.font = "17px serif";
    context.fillText("NORTHERN ROUTE  /  7 DAYS", 48, 565);
    context.fillText("SOUTHERN ROUTE  /  9 DAYS", 48, 596);
    context.fillStyle = "#9e3e2f";
    context.fillRect(784, 530, 172, 55);
    context.fillStyle = "#ead9af";
    context.font = "bold 20px monospace";
    context.fillText("旅 行  /  2026", 800, 565);
  });
}

function buildChinahols(station: GarageStation, ownedTextures: Set<THREE.CanvasTexture>, workshop?: WorkshopTextures): BuiltStation {
  const shell = stationShell(station, [1.55, 1.35, 1.1], [0, 0.62, 0], 0.7, 1.05);
  const { group } = shell;
  const lacquer = timber(workshop, 0x3e1c16, 0.3);
  lacquer.metalness = 0.15;
  const brass = material({ color: 0xc99a3c, metalness: 0.86, roughness: 0.25 });
  const crimson = registerKey(shell, material({
    color: 0xa71927,
    emissive: 0x9e1521,
    emissiveIntensity: 0.7,
    roughness: 0.6,
    metalness: 0.02,
    transparent: true,
    opacity: 0.94,
  }), 0.7, 0.25);
  group.add(slab(0.62, 0.38, 0.05, 0.04, lacquer, -0.36, 0.03, -0.12));
  group.add(cylinder(0.035, 0.045, 0.72, lacquer, -0.57, 0.4, -0.12));
  group.add(tube([[-0.57, 0.73, -0.12], [-0.54, 0.94, -0.12], [-0.3, 1.01, -0.12], [-0.08, 0.9, -0.12]], 0.031, lacquer));
  group.add(sphere(0.047, brass, -0.57, 0.76, -0.12));

  const lanternPivot = new THREE.Group();
  lanternPivot.position.set(-0.09, 0.89, -0.12);
  lanternPivot.add(cylinder(0.008, 0.008, 0.12, brass, 0, -0.055, 0, 10));
  const lantern = new THREE.Group();
  lantern.position.y = -0.31;
  const silk = sphere(0.185, crimson, 0, 0, 0, 32, 20);
  silk.scale.y = 1.22;
  lantern.add(silk);
  for (const y of [-0.17, -0.085, 0, 0.085, 0.17]) {
    const radius = 0.185 * Math.sqrt(Math.max(0.2, 1 - (y / 0.245) ** 2));
    const rib = torus(radius, 0.006, brass, 0, y, 0);
    rib.rotation.x = Math.PI / 2;
    lantern.add(rib);
  }
  lantern.add(cylinder(0.085, 0.1, 0.045, brass, 0, 0.23, 0));
  lantern.add(cylinder(0.1, 0.085, 0.045, brass, 0, -0.23, 0));
  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2;
    lantern.add(rodBetween([Math.cos(angle) * 0.182, -0.15, Math.sin(angle) * 0.182], [Math.cos(angle) * 0.182, 0.15, Math.sin(angle) * 0.182], 0.0045, brass, 8));
  }
  lantern.add(cylinder(0.018, 0.018, 0.16, crimson, 0, -0.325, 0, 10));
  for (let index = 0; index < 5; index += 1) {
    lantern.add(cylinder(0.004, 0.004, 0.14, index % 2 ? brass : crimson, (index - 2) * 0.012, -0.39, 0, 8));
  }
  lanternPivot.add(lantern);
  group.add(lanternPivot);
  const lanternLight = new THREE.PointLight(0xff6238, 0.65, 1.4, 2);
  lanternLight.position.set(-0.09, 0.57, -0.12);
  group.add(lanternLight);

  const scroll = new THREE.Group();
  scroll.position.set(0.35, 0.035, 0.12);
  scroll.rotation.y = -0.08;
  const parchmentGeometry = new THREE.PlaneGeometry(0.82, 0.54, 20, 6);
  const positions = parchmentGeometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    positions.setZ(index, Math.sin((x / 0.82 + 0.5) * Math.PI * 2) * 0.009);
  }
  parchmentGeometry.computeVertexNormals();
  const parchment = material({ map: chinaMapTexture(ownedTextures), roughness: 0.88, side: THREE.DoubleSide });
  const map = new THREE.Mesh(parchmentGeometry, parchment);
  map.rotation.x = -Math.PI / 2;
  map.receiveShadow = true;
  scroll.add(map);
  for (const z of [-0.285, 0.285]) {
    const roll = cylinder(0.032, 0.032, 0.88, material({ color: 0xc5a875, roughness: 0.82 }), 0, 0.01, z, 24);
    roll.rotation.z = Math.PI / 2;
    scroll.add(roll);
    for (const x of [-0.46, 0.46]) scroll.add(sphere(0.038, brass, x, 0.01, z, 16, 10));
  }
  const waypoint = registerKey(shell, material({ color: 0xffe99a, emissive: 0xf6bd3c, emissiveIntensity: 1.3, metalness: 0.35, roughness: 0.25 }), 1.3, 0.4);
  const pinPositions = [[0.18, -0.16], [0.06, 0.02], [0.3, 0.12], [-0.02, 0.2]];
  for (const [x, z] of pinPositions) {
    scroll.add(sphere(0.018, waypoint, x, 0.035, z, 16, 10));
    scroll.add(cylinder(0.004, 0.004, 0.025, brass, x, 0.02, z, 8));
  }
  group.add(scroll);
  shell.animate = (elapsed) => {
    lanternPivot.rotation.z = Math.sin(elapsed * 0.72) * 0.055;
    lanternPivot.rotation.x = Math.sin(elapsed * 0.53) * 0.025;
    lanternLight.intensity = 0.62 + Math.sin(elapsed * 1.35) * 0.055;
    waypoint.emissiveIntensity += 0.18 + Math.sin(elapsed * 2) * 0.14;
  };
  return shell;
}

function bookTitleTexture(title: string, textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(512, 128, textures, (context, width, height) => {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#e6c875";
    context.textAlign = "center";
    context.font = "bold 37px serif";
    context.fillText(title.toUpperCase(), width / 2, 58);
    context.fillStyle = "#b6974d";
    context.font = "19px serif";
    context.fillText("ILLUSTRATED EDITION", width / 2, 96);
  });
}

function openBookTexture(textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(1024, 640, textures, (context, width, height) => {
    context.fillStyle = "#e8dcbb";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(104,79,43,0.25)";
    context.strokeRect(25, 25, width - 50, height - 50);
    context.fillStyle = "#4b3b2d";
    context.textAlign = "center";
    context.font = "bold 30px serif";
    context.fillText("THE ENCHANTED FOREST", 270, 65);
    context.font = "italic 20px serif";
    context.fillText("CHAPTER IV", 270, 101);
    context.fillStyle = "#767f72";
    context.fillRect(90, 132, 360, 240);
    const sky = context.createLinearGradient(0, 132, 0, 372);
    sky.addColorStop(0, "#7e88a2");
    sky.addColorStop(1, "#c6ae8e");
    context.fillStyle = sky;
    context.fillRect(98, 140, 344, 224);
    context.fillStyle = "#354d43";
    for (let index = 0; index < 9; index += 1) {
      const x = 110 + index * 40;
      const y = 300 - (index % 3) * 23;
      context.beginPath();
      context.moveTo(x, y - 105);
      context.lineTo(x - 34, y);
      context.lineTo(x + 34, y);
      context.fill();
    }
    context.fillStyle = "#e1c072";
    context.beginPath();
    context.arc(357, 184, 27, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#5a4936";
    context.font = "19px serif";
    context.textAlign = "left";
    const leftLines = [
      "Beyond the old stone bridge, the path",
      "narrowed beneath a canopy of stars.",
      "Every turning whispered a new tale,",
      "and the compass grew warm in hand.",
      "Ahead, a violet door stood open…",
    ];
    leftLines.forEach((line, index) => context.fillText(line, 70, 420 + index * 32));
    context.textAlign = "center";
    context.font = "bold 27px serif";
    context.fillText("WHAT WILL YOU CHOOSE?", 760, 85);
    context.textAlign = "left";
    context.font = "22px serif";
    const choices = ["1  Follow the lantern light", "2  Enter the hidden library", "3  Climb the winding stair", "4  Ask the fox for directions"];
    choices.forEach((line, index) => {
      context.fillStyle = index === 0 ? "#76508d" : "#554635";
      context.fillText(line, 570, 170 + index * 80);
      context.strokeStyle = "rgba(94,71,42,0.25)";
      context.beginPath();
      context.moveTo(570, 184 + index * 80);
      context.lineTo(945, 184 + index * 80);
      context.stroke();
    });
    context.fillStyle = "#77654d";
    context.font = "18px serif";
    context.fillText("Your story remembers every choice.", 590, 555);
  });
}

function buildBookAdventure(station: GarageStation, ownedTextures: Set<THREE.CanvasTexture>, workshop?: WorkshopTextures): BuiltStation {
  const shell = stationShell(station, [1.75, 1.3, 1.2], [0, 0.58, 0], 0.72, 1.08);
  const { group } = shell;
  const gold = material({ color: 0xc8a253, metalness: 0.86, roughness: 0.26 });
  const pages = material({ color: 0xded2b2, roughness: 0.94 });
  const colors = [0x651f2b, 0x234a38, 0x263b63, 0x9a6724];
  const titles = ["Dracula", "The Odyssey", "Sherlock Holmes", "The Odyssey"];
  const rotations = [-0.05, 0.035, -0.025, 0.05];
  for (let index = 0; index < 4; index += 1) {
    const book = new THREE.Group();
    const width = 0.69 - index * 0.024;
    const y = 0.068 + index * 0.117;
    book.position.set(-0.33, y, 0.08);
    book.rotation.y = rotations[index];
    const leather = material({
      color: colors[index],
      map: workshop?.leather.map,
      bumpMap: workshop?.leather.bumpMap,
      bumpScale: 0.025,
      roughnessMap: workshop?.leather.roughnessMap,
      roughness: 0.65,
      metalness: 0.03,
    });
    book.add(box(width - 0.045, 0.084, 0.385, pages, 0.01, 0, -0.005));
    book.add(box(width, 0.018, 0.43, leather, 0, 0.052, 0));
    book.add(box(width, 0.018, 0.43, leather, 0, -0.052, 0));
    book.add(box(width, 0.106, 0.025, leather, 0, 0, 0.215));
    for (const x of [-width * 0.38, -width * 0.25, width * 0.25, width * 0.38]) book.add(box(0.014, 0.109, 0.029, gold, x, 0, 0.22));
    book.add(plane(0.29, 0.073, new THREE.MeshStandardMaterial({ map: bookTitleTexture(titles[index], ownedTextures), transparent: true, roughness: 0.45, metalness: 0.5 }), 0, 0, 0.232));
    for (let line = 0; line < 5; line += 1) book.add(box(width - 0.07, 0.002, 0.005, material({ color: 0xb5a887, roughness: 0.9 }), 0.01, -0.03 + line * 0.015, 0.195));
    group.add(book);
  }

  const openBook = new THREE.Group();
  openBook.position.set(0.3, 0.16, 0.22);
  openBook.rotation.y = -0.09;
  openBook.add(slab(0.7, 0.48, 0.026, 0.018, material({ color: 0x44223a, map: workshop?.leather.map, bumpMap: workshop?.leather.bumpMap, bumpScale: 0.02, roughness: 0.65 }), 0, 0, 0));
  const pageGeometry = new THREE.PlaneGeometry(0.67, 0.45, 24, 6);
  const pagePositions = pageGeometry.attributes.position;
  for (let index = 0; index < pagePositions.count; index += 1) {
    const x = pagePositions.getX(index);
    const y = pagePositions.getY(index);
    const arch = Math.max(0, 1 - Math.abs(x) / 0.335) * 0.055;
    pagePositions.setZ(index, arch + Math.sin((y / 0.45 + 0.5) * Math.PI) * 0.009);
  }
  pageGeometry.computeVertexNormals();
  const openPages = new THREE.Mesh(pageGeometry, material({ map: openBookTexture(ownedTextures), roughness: 0.87, side: THREE.DoubleSide }));
  openPages.rotation.x = -Math.PI / 2;
  openPages.position.y = 0.024;
  openPages.receiveShadow = true;
  openBook.add(openPages);
  const violet = material({ color: 0x734397, roughness: 0.56 });
  const ribbon = box(0.033, 0.008, 0.53, violet, -0.1, 0.057, 0.08);
  ribbon.rotation.x = 0.09;
  openBook.add(ribbon);
  group.add(openBook);

  const brass = registerKey(shell, material({ color: 0xb8924f, metalness: 0.9, roughness: 0.22, emissive: 0x5f3712, emissiveIntensity: 0.08 }), 0.08, 0.16);
  group.add(cylinder(0.15, 0.18, 0.045, brass, 0.42, 0.03, -0.28));
  group.add(rodBetween([0.42, 0.05, -0.28], [0.43, 0.43, -0.28], 0.018, brass));
  group.add(sphere(0.042, brass, 0.43, 0.43, -0.28));
  group.add(rodBetween([0.43, 0.43, -0.28], [0.27, 0.67, -0.28], 0.018, brass));
  group.add(sphere(0.038, brass, 0.27, 0.67, -0.28));
  group.add(rodBetween([0.27, 0.67, -0.28], [0.03, 0.64, -0.28], 0.018, brass));
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.18, 0.24, 32, 1, true, 0, Math.PI), material({ color: 0x244c3c, metalness: 0.28, roughness: 0.26, side: THREE.DoubleSide }));
  shade.position.set(0.02, 0.54, -0.28);
  shade.rotation.z = Math.PI / 2;
  hideShadows(shade);
  group.add(shade);
  const shadeTop = box(0.28, 0.025, 0.045, brass, 0.02, 0.64, -0.28);
  group.add(shadeTop);
  const bulb = registerKey(shell, material({ color: 0xffe0a0, emissive: 0xffa733, emissiveIntensity: 1.4 }), 1.4, 0.22);
  group.add(sphere(0.038, bulb, 0.02, 0.5, -0.28));
  const lampLight = new THREE.PointLight(0xffbd72, 0.72, 1.8, 2);
  lampLight.position.set(0.02, 0.48, -0.26);
  lampLight.castShadow = false;
  group.add(lampLight);

  const compass = new THREE.Group();
  const compassBaseY = 0.48;
  compass.position.set(0.36, compassBaseY, 0.25);
  compass.add(cylinder(0.115, 0.115, 0.027, brass));
  const compassRing = torus(0.118, 0.012, gold);
  compassRing.rotation.x = Math.PI / 2;
  compass.add(compassRing);
  compass.add(cylinder(0.098, 0.098, 0.009, material({ color: 0xe3d8b5, roughness: 0.5 }), 0, 0.018));
  for (let index = 0; index < 16; index += 1) {
    const angle = (index / 16) * Math.PI * 2;
    const tick = box(0.004, 0.006, index % 4 === 0 ? 0.024 : 0.012, material({ color: 0x4b4030, roughness: 0.6 }), Math.sin(angle) * 0.078, 0.025, Math.cos(angle) * 0.078);
    tick.rotation.y = angle;
    compass.add(tick);
  }
  const needle = new THREE.Group();
  needle.position.y = 0.034;
  needle.add(box(0.024, 0.009, 0.13, violet, 0, 0, -0.045));
  needle.add(box(0.021, 0.009, 0.09, gold, 0, 0, 0.04));
  needle.add(sphere(0.016, gold, 0, 0.01, 0, 16, 10));
  compass.add(needle);
  group.add(compass);

  shell.animate = (elapsed) => {
    compass.position.y = compassBaseY + Math.sin(elapsed * 1.2) * 0.025;
    compass.rotation.z = Math.sin(elapsed * 0.8) * 0.04;
    needle.rotation.y = elapsed * 0.85 + Math.sin(elapsed * 0.6) * 0.2;
    bulb.emissiveIntensity += Math.sin(elapsed * 1.05) * 0.055;
    lampLight.intensity = 0.72 + Math.sin(elapsed * 1.05) * 0.04;
  };
  return shell;
}

function pitchTexture(textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(1024, 640, textures, (context, width, height) => {
    context.fillStyle = "#173d31";
    context.fillRect(0, 0, width, height);
    for (let stripe = 0; stripe < 10; stripe += 1) {
      context.fillStyle = stripe % 2 ? "rgba(255,255,255,0.018)" : "rgba(0,0,0,0.035)";
      context.fillRect(stripe * width / 10, 0, width / 10, height);
    }
    context.strokeStyle = "#e9f1df";
    context.lineWidth = 5;
    context.strokeRect(48, 48, width - 96, height - 96);
    context.beginPath();
    context.moveTo(width / 2, 48);
    context.lineTo(width / 2, height - 48);
    context.stroke();
    context.beginPath();
    context.arc(width / 2, height / 2, 92, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(width / 2, height / 2, 7, 0, Math.PI * 2);
    context.fillStyle = "#e9f1df";
    context.fill();
    for (const x of [48, width - 48]) {
      const direction = x === 48 ? 1 : -1;
      context.strokeRect(x, 190, direction * 145, 260);
      context.strokeRect(x, 255, direction * 58, 130);
      context.beginPath();
      context.arc(x + direction * 100, height / 2, 7, 0, Math.PI * 2);
      context.fill();
    }
    context.font = "bold 22px monospace";
    context.fillStyle = "rgba(232,244,226,0.8)";
    context.fillText("ROCKETS FC  /  4-3-3  /  ATTACK →", 55, 34);
  });
}

function buildRocketsfc(station: GarageStation, ownedTextures: Set<THREE.CanvasTexture>, workshop?: WorkshopTextures): BuiltStation {
  const shell = stationShell(station, [1.65, 1.15, 1.15], [0, 0.52, 0], 0.7, 1.05);
  const { group } = shell;
  const steel = brushed(workshop, 0xaeb8b7, 0.22, 0.93);
  const chrome = material({ color: 0xd4dad8, metalness: 0.98, roughness: 0.1 });
  const dark = material({ color: 0x171c1b, roughness: 0.55 });
  const ballCenter = new THREE.Vector3(-0.38, 0.37, 0.04);
  for (let index = 0; index < 3; index += 1) {
    const angle = (index / 3) * Math.PI * 2;
    group.add(rodBetween([
      ballCenter.x + Math.cos(angle) * 0.22,
      0.025,
      ballCenter.z + Math.sin(angle) * 0.22,
    ], [ballCenter.x + Math.cos(angle) * 0.11, 0.26, ballCenter.z + Math.sin(angle) * 0.11], 0.018, steel));
    group.add(cylinder(0.045, 0.055, 0.025, dark, ballCenter.x + Math.cos(angle) * 0.22, 0.015, ballCenter.z + Math.sin(angle) * 0.22));
  }
  const standRing = torus(0.13, 0.015, steel, ballCenter.x, 0.25, ballCenter.z);
  standRing.rotation.x = Math.PI / 2;
  group.add(standRing);
  const ball = new THREE.Group();
  ball.position.copy(ballCenter);
  ball.rotation.set(0.2, 0.3, -0.12);
  const whiteLeather = material({ color: 0xf2f0e8, roughness: 0.24, metalness: 0.02, bumpMap: workshop?.leather.bumpMap, bumpScale: 0.008 });
  ball.add(sphere(0.235, whiteLeather, 0, 0, 0, 40, 28));
  const panel = material({ color: 0x171a19, roughness: 0.3, side: THREE.DoubleSide });
  const directions: Vec3[] = [
    [0, 1, 0], [0, -1, 0], [0.89, 0.45, 0], [-0.89, 0.45, 0], [0.28, 0.45, 0.85], [-0.72, 0.45, 0.53],
    [0.72, 0.45, -0.53], [-0.28, 0.45, -0.85], [0.72, -0.45, 0.53], [-0.28, -0.45, 0.85], [0.28, -0.45, -0.85], [-0.72, -0.45, -0.53],
  ];
  for (const values of directions) {
    const direction = new THREE.Vector3().fromArray(values).normalize();
    const patch = new THREE.Mesh(new THREE.CircleGeometry(0.067, 5), panel);
    patch.position.copy(direction).multiplyScalar(0.236);
    patch.quaternion.setFromUnitVectors(forward, direction);
    ball.add(patch);
  }
  const seams = new THREE.Mesh(new THREE.IcosahedronGeometry(0.237, 2), new THREE.MeshBasicMaterial({ color: 0x444843, wireframe: true, transparent: true, opacity: 0.13 }));
  ball.add(seams);
  group.add(ball);

  const board = new THREE.Group();
  board.position.set(0.39, 0.36, -0.13);
  board.rotation.x = -0.27;
  board.add(beveledBox(0.8, 0.54, 0.045, 0.035, steel));
  board.add(box(0.755, 0.495, 0.016, dark, 0, 0, 0.03));
  const pitch = registerKey(shell, material({ map: pitchTexture(ownedTextures), emissive: 0x174c36, emissiveIntensity: 0.35, roughness: 0.6 }), 0.35, 0.25);
  pitch.emissiveMap = pitch.map;
  board.add(plane(0.73, 0.465, pitch, 0, 0, 0.04));
  const red = registerKey(shell, material({ color: 0xff7770, emissive: 0xef4444, emissiveIntensity: 1.05, roughness: 0.28 }), 1.05, 0.35);
  const gold = registerKey(shell, material({ color: 0xffd46e, emissive: 0xf5b82e, emissiveIntensity: 0.85, roughness: 0.3 }), 0.85, 0.35);
  const magnets = [[-0.25, -0.12], [-0.12, 0.02], [0.02, -0.09], [0.14, 0.08], [0.27, -0.02], [-0.18, 0.14], [0.08, 0.16]];
  for (let index = 0; index < magnets.length; index += 1) {
    board.add(sphere(0.023, index % 2 ? gold : red, magnets[index][0], magnets[index][1], 0.058, 16, 10));
  }
  const arrowA = rodBetween([-0.21, -0.04, 0.057], [-0.04, 0.1, 0.057], 0.006, red, 10);
  board.add(arrowA);
  const arrowHead = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.055, 12), red);
  arrowHead.position.set(-0.04, 0.1, 0.057);
  arrowHead.rotation.z = -0.9;
  board.add(arrowHead);
  board.add(rodBetween([0.06, 0.13, 0.057], [0.25, 0.12, 0.057], 0.005, gold, 10));
  group.add(board);
  group.add(slab(0.73, 0.3, 0.03, 0.03, dark, 0.39, 0.02, 0.25));
  const whistle = new THREE.Group();
  whistle.position.set(0.42, 0.065, 0.3);
  whistle.rotation.y = 0.3;
  const whistleBody = torus(0.045, 0.018, chrome, 0, 0, 0, Math.PI * 1.65);
  whistleBody.rotation.x = Math.PI / 2;
  whistle.add(whistleBody);
  const mouthpiece = box(0.09, 0.035, 0.045, chrome, 0.065, 0, 0);
  whistle.add(mouthpiece);
  whistle.add(sphere(0.012, dark, -0.012, 0.018, 0.025, 12, 8));
  group.add(whistle);
  shell.animate = (elapsed) => {
    red.emissiveIntensity += 0.1 + Math.sin(elapsed * 1.7) * 0.08;
    gold.emissiveIntensity += 0.08 + Math.sin(elapsed * 1.7 + 1) * 0.06;
  };
  return shell;
}

function atlasTexture(textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(1024, 640, textures, (context, width, height) => {
    context.fillStyle = "#d8d0aa";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(61,78,52,0.16)";
    context.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    context.fillStyle = "#738363";
    const land = [[130, 170, 160, 110], [225, 350, 100, 190], [480, 185, 125, 110], [515, 350, 105, 180], [690, 170, 205, 130], [825, 420, 105, 72]];
    for (const [x, y, rx, ry] of land) {
      context.beginPath();
      context.ellipse(x, y, rx / 2, ry / 2, -0.2, 0, Math.PI * 2);
      context.fill();
    }
    context.strokeStyle = "rgba(50,73,48,0.45)";
    for (let contour = 0; contour < 7; contour += 1) {
      context.beginPath();
      context.ellipse(710, 220, 45 + contour * 13, 28 + contour * 8, -0.25, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.ellipse(235, 345, 25 + contour * 8, 45 + contour * 12, 0.15, 0, Math.PI * 2);
      context.stroke();
    }
    context.strokeStyle = "#a44f36";
    context.lineWidth = 5;
    context.setLineDash([15, 10]);
    context.beginPath();
    context.moveTo(120, 360);
    context.bezierCurveTo(320, 95, 570, 470, 905, 160);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = "#293b30";
    context.font = "bold 30px monospace";
    context.fillText("WORLD FOOD & SUPPLY-CHAIN RESILIENCE ATLAS", 30, 43);
    context.font = "18px monospace";
    context.fillText("TOPOGRAPHICAL FIELD EDITION  /  OFFLINE", 30, 606);
    context.fillStyle = "#a44f36";
    for (const [x, y] of [[160, 180], [500, 230], [780, 190], [825, 420]]) {
      context.beginPath();
      context.arc(x, y, 8, 0, Math.PI * 2);
      context.fill();
    }
  });
}

function radioLcdTexture(textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(512, 160, textures, (context, width, height) => {
    context.fillStyle = "#09271c";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#75f2aa";
    context.font = "bold 54px monospace";
    context.fillText("146.520 MHz", 28, 77);
    context.fillStyle = "#3c9d69";
    context.font = "22px monospace";
    context.fillText("CH 02  FM  RX  ▮▮▮▮▯", 30, 125);
  });
}

function buildPreppr(station: GarageStation, ownedTextures: Set<THREE.CanvasTexture>, workshop?: WorkshopTextures): BuiltStation {
  const shell = stationShell(station, [1.85, 1.15, 1.2], [0, 0.5, 0], 0.73, 1.15);
  const { group } = shell;
  const olive = material({ color: 0x4c5637, metalness: 0.32, roughness: 0.67 });
  const oliveDark = material({ color: 0x293021, metalness: 0.34, roughness: 0.69 });
  const amber = material({ color: 0xe0a128, metalness: 0.48, roughness: 0.4 });
  const black = material({ color: 0x141915, roughness: 0.77 });
  const chrome = brushed(workshop, 0xb7bfba, 0.18, 0.94);
  const brass = material({ color: 0xb28b46, metalness: 0.88, roughness: 0.26 });

  const crate = new THREE.Group();
  crate.position.set(-0.39, 0, -0.08);
  crate.add(beveledBox(0.8, 0.42, 0.5, 0.06, olive, 0, 0.25, 0));
  crate.add(slab(0.82, 0.53, 0.075, 0.045, oliveDark, 0, 0.49, 0));
  for (let rib = -3; rib <= 3; rib += 1) {
    crate.add(box(0.045, 0.045, 0.45, olive, rib * 0.1, 0.535, 0));
  }
  for (const x of [-0.35, 0.35]) {
    for (const z of [-0.22, 0.22]) {
      crate.add(beveledBox(0.11, 0.45, 0.07, 0.025, black, x, 0.25, z));
      crate.add(beveledBox(0.12, 0.105, 0.04, 0.018, amber, x, 0.35, z + Math.sign(z) * 0.045));
    }
  }
  for (const y of [0.13, 0.25, 0.4]) crate.add(box(0.58, 0.025, 0.025, oliveDark, 0, y, 0.265));
  const handle = torus(0.14, 0.025, black, 0, 0.31, 0.31, Math.PI);
  handle.rotation.z = Math.PI;
  crate.add(handle);
  group.add(crate);

  const mapGeometry = new THREE.PlaneGeometry(0.82, 0.55, 12, 5);
  const mapPositions = mapGeometry.attributes.position;
  for (let index = 0; index < mapPositions.count; index += 1) {
    const x = mapPositions.getX(index);
    mapPositions.setZ(index, Math.abs(Math.sin((x / 0.82 + 0.5) * Math.PI * 3)) * 0.013);
  }
  mapGeometry.computeVertexNormals();
  const atlas = registerKey(shell, material({ map: atlasTexture(ownedTextures), emissive: 0x6e6538, emissiveIntensity: 0.1, roughness: 0.88, side: THREE.DoubleSide }), 0.1, 0.18);
  const map = new THREE.Mesh(mapGeometry, atlas);
  map.rotation.x = -Math.PI / 2;
  map.position.set(0.39, 0.028, 0.21);
  map.receiveShadow = true;
  group.add(map);
  for (const x of [0.08, 0.7]) {
    const weight = cylinder(0.035, 0.035, 0.16, brass, x, 0.065, 0.23, 24);
    weight.rotation.x = Math.PI / 2;
    group.add(weight);
  }

  const radio = new THREE.Group();
  radio.position.set(0.48, 0, -0.3);
  radio.add(beveledBox(0.36, 0.34, 0.22, 0.045, oliveDark, 0, 0.2, 0));
  radio.add(box(0.19, 0.14, 0.018, black, -0.055, 0.145, 0.122));
  const grille = material({ color: 0x090d0b, roughness: 0.82 });
  for (let row = 0; row < 5; row += 1) {
    for (let column = 0; column < 6; column += 1) {
      const hole = new THREE.Mesh(new THREE.CircleGeometry(0.009, 10), grille);
      hole.position.set(-0.125 + column * 0.028, 0.095 + row * 0.025, 0.133);
      radio.add(hole);
    }
  }
  const lcd = registerKey(shell, material({ map: radioLcdTexture(ownedTextures), emissive: 0x2ebc70, emissiveIntensity: 0.85, roughness: 0.34 }), 0.85, 0.25);
  lcd.emissiveMap = lcd.map;
  radio.add(plane(0.225, 0.07, lcd, -0.035, 0.292, 0.122));
  for (const x of [0.12, 0.12]) {
    const knob = cylinder(0.032, 0.032, 0.03, chrome, x, x === 0.12 ? 0.28 : 0.17, 0.135, 24);
    knob.rotation.x = Math.PI / 2;
    radio.add(knob);
  }
  radio.add(cylinder(0.013, 0.017, 0.22, chrome, -0.12, 0.46, -0.02, 12));
  radio.add(cylinder(0.008, 0.011, 0.24, chrome, -0.12, 0.67, -0.02, 12));
  radio.add(cylinder(0.004, 0.007, 0.2, chrome, -0.12, 0.88, -0.02, 10));
  const beacon = registerKey(shell, material({ color: 0x8affc1, emissive: 0x10b981, emissiveIntensity: 1.3 }), 1.3, 0.35);
  radio.add(sphere(0.019, beacon, 0.12, 0.205, 0.145, 16, 10));
  radio.add(box(0.14, 0.025, 0.04, black, 0, 0.385, 0));
  group.add(radio);
  shell.animate = (elapsed) => {
    const pulse = Math.pow(Math.max(0, Math.sin(elapsed * 1.5)), 5);
    beacon.emissiveIntensity += pulse * 1.4;
    lcd.emissiveIntensity += Math.sin(elapsed * 0.8) * 0.025;
  };
  return shell;
}

function plaqueTexture(station: GarageStation, textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(768, 352, textures, (context, width, height) => {
    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#202832");
    background.addColorStop(0.55, "#111820");
    background.addColorStop(1, "#090e14");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(255,255,255,0.055)";
    context.lineWidth = 1;
    for (let x = -height; x < width; x += 34) {
      context.beginPath();
      context.moveTo(x, height);
      context.lineTo(x + height, 0);
      context.stroke();
    }
    context.fillStyle = station.accentHex;
    context.fillRect(38, 34, 52, 5);
    context.fillStyle = "#8b9aa8";
    context.font = "18px monospace";
    context.fillText("SHIPPED  /  OUT IN THE WILD", 38, 75);
    context.fillStyle = "#f1f5f7";
    context.font = `700 ${station.name.length > 16 ? 54 : 66}px sans-serif`;
    context.fillText(station.name.toUpperCase(), 38, 164);
    context.fillStyle = "#9eabb5";
    context.font = "26px monospace";
    context.fillText(station.domainLabel ?? station.url.replace(/^https?:\/\//, ""), 40, 215);
    context.fillStyle = "#52616e";
    context.font = "17px monospace";
    context.fillText("BUILT BY JIMMY  •  VISIT THE LIVE PRODUCT", 40, 309);
    context.fillStyle = "rgba(16,185,129,0.13)";
    roundRect(context, 558, 244, 168, 52, 26);
    context.fill();
    context.strokeStyle = "#34d399";
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = "#86f7c8";
    context.font = "bold 25px monospace";
    context.fillText("LIVE ↗", 592, 279);
    context.strokeStyle = station.accentHex;
    context.globalAlpha = 0.42;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(620, 93);
    context.lineTo(704, 93);
    context.lineTo(704, 177);
    context.stroke();
    context.globalAlpha = 1;
  });
}

function buildPlaque(station: GarageStation, ownedTextures: Set<THREE.CanvasTexture>, workshop?: WorkshopTextures): BuiltStation {
  const group = new THREE.Group();
  group.name = `station-${station.id}`;
  group.position.fromArray(station.anchorPosition);
  group.rotation.y = -Math.PI / 2;
  const floatGroup = new THREE.Group();
  group.add(floatGroup);
  const titanium = brushed(workshop, 0x77828a, 0.25, 0.92);
  const slate = material({ color: 0x202933, metalness: 0.78, roughness: 0.29, map: workshop?.brushedMetal.map, bumpMap: workshop?.brushedMetal.bumpMap, bumpScale: 0.008 });
  const standoffMetal = material({ color: 0xb5c0c5, metalness: 0.96, roughness: 0.16 });
  floatGroup.add(beveledBox(0.96, 0.44, 0.045, 0.04, titanium));
  floatGroup.add(beveledBox(0.91, 0.39, 0.018, 0.025, slate, 0, 0, 0.027));

  const faceMaterial = material({
    map: plaqueTexture(station, ownedTextures),
    emissive: new THREE.Color(station.accentHex).multiplyScalar(0.32),
    emissiveIntensity: 0.34,
    metalness: 0.08,
    roughness: 0.4,
  });
  faceMaterial.emissiveMap = faceMaterial.map;
  floatGroup.add(plane(0.872, 0.4, faceMaterial, 0, -0.005, 0.045));

  const accent = new THREE.Color(station.accentHex);
  const glowBar = material({ color: accent, emissive: accent, emissiveIntensity: 1.2, metalness: 0.2, roughness: 0.28 });
  floatGroup.add(beveledBox(0.82, 0.012, 0.012, 0.005, glowBar, 0, 0.207, 0.046));
  for (const x of [-0.425, 0.425]) {
    for (const y of [-0.165, 0.165]) {
      const standoff = cylinder(0.024, 0.024, 0.038, standoffMetal, x, y, 0.047, 24);
      standoff.rotation.x = Math.PI / 2;
      floatGroup.add(standoff);
      const screw = cylinder(0.009, 0.009, 0.041, slate, x, y, 0.052, 16);
      screw.rotation.x = Math.PI / 2;
      floatGroup.add(screw);
      floatGroup.add(box(0.012, 0.0025, 0.003, standoffMetal, x, y, 0.074));
    }
  }

  const led = material({ color: 0xa8ffda, emissive: 0x10b981, emissiveIntensity: 1.65, metalness: 0.12, roughness: 0.18 });
  floatGroup.add(sphere(0.018, led, 0.412, 0.174, 0.073, 20, 12));
  const ledBezel = torus(0.022, 0.0045, standoffMetal, 0.412, 0.174, 0.069);
  floatGroup.add(ledBezel);

  const borderMaterials: THREE.MeshBasicMaterial[] = [];
  const border = new THREE.Group();
  border.position.z = 0.079;
  const borderSpecs: Array<[number, number, number, number]> = [
    [0.925, 0.008, 0, 0.202],
    [0.925, 0.008, 0, -0.202],
    [0.008, 0.405, -0.46, 0],
    [0.008, 0.405, 0.46, 0],
  ];
  for (const [width, height, x, y] of borderSpecs) {
    const borderMaterial = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.09, depthWrite: false, blending: THREE.AdditiveBlending });
    borderMaterials.push(borderMaterial);
    border.add(box(width, height, 0.004, borderMaterial, x, y, 0));
  }
  floatGroup.add(border);

  const hitBox = new THREE.Mesh(
    new THREE.BoxGeometry(1.12, 0.62, 0.24),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false, side: THREE.DoubleSide }),
  );
  hitBox.name = `${station.id}-hit-volume`;
  hitBox.position.z = 0.04;
  group.add(hitBox);

  const built: BuiltStation = {
    group,
    floatGroup,
    borderMaterials,
    keyMaterials: [
      { material: faceMaterial, base: 0.34, lift: 0.32 },
      { material: glowBar, base: 1.2, lift: 0.65 },
      { material: led, base: 1.65, lift: 0.4 },
    ],
    animate: (elapsed) => {
      led.emissiveIntensity += 0.32 + Math.sin(elapsed * 2.4) * 0.24;
    },
  };
  return built;
}

const builders: Record<BenchStationId, (station: GarageStation, textures: Set<THREE.CanvasTexture>, workshop?: WorkshopTextures) => BuiltStation> = {
  predictr: buildPredictr,
  plannr: buildPlannr,
  crema: buildCrema,
  pantry: buildPantry,
  chinahols: buildChinahols,
  "book-adventure": buildBookAdventure,
  rocketsfc: buildRocketsfc,
  preppr: buildPreppr,
};

export function buildProjectStations(stations: GarageStation[], textures?: WorkshopTextures): {
  root: THREE.Group;
  handles: Map<StationId, StationHandle>;
  dispose: () => void;
} {
  const root = new THREE.Group();
  root.name = "project-stations";
  const handles = new Map<StationId, StationHandle>();
  const ownedTextures = new Set<THREE.CanvasTexture>();

  for (const station of stations) {
    const built = station.category === "shipped"
      ? buildPlaque(station, ownedTextures, textures)
      : builders[station.id as BenchStationId](station, ownedTextures, textures);
    root.add(built.group);
    const hitMeshes: THREE.Object3D[] = [];
    built.group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.userData.stationId = station.id;
        hitMeshes.push(object);
      }
    });

    let hovered = false;
    let selected = false;
    let activity = 0;
    handles.set(station.id, {
      id: station.id,
      group: built.group,
      hitMeshes,
      setHovered: (value) => {
        hovered = value;
      },
      setSelected: (value) => {
        selected = value;
      },
      update: (elapsed, dt) => {
        const target = selected ? 1 : hovered ? 0.72 : 0;
        activity += (target - activity) * (1 - Math.exp(-9 * Math.min(dt, 0.1)));
        if (built.halo) {
          built.halo.material.opacity = 0.055 + activity * 0.42;
          const haloScale = 1 + activity * 0.045;
          built.halo.scale.y = haloScale;
          built.halo.scale.z = haloScale;
        }
        if (built.floatGroup) built.floatGroup.position.z = activity * 0.025;
        for (const borderMaterial of built.borderMaterials) borderMaterial.opacity = 0.09 + activity * 0.91;
        for (const key of built.keyMaterials) key.material.emissiveIntensity = key.base + activity * key.lift;
        built.animate(elapsed, activity);
      },
    });
  }

  let disposed = false;
  return {
    root,
    handles,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      root.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          if (Array.isArray(object.material)) {
            for (const surface of object.material) materials.add(surface);
          } else {
            materials.add(object.material);
          }
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((surface) => surface.dispose());
      ownedTextures.forEach((texture) => texture.dispose());
      root.clear();
      handles.clear();
    },
  };
}
