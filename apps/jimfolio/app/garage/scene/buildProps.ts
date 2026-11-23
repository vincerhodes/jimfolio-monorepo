import * as THREE from "three";
import type { GarageStation, StationHandle, StationId } from "../types";

type Vec3 = [number, number, number];

type KeyMaterial = {
  material: THREE.MeshStandardMaterial;
  base: number;
  lift: number;
};

type BuiltStation = {
  group: THREE.Group;
  halo: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  keyMaterials: KeyMaterial[];
  animate: (elapsed: number, activity: number) => void;
};

type StationShell = BuiltStation;

const noop = () => undefined;

function material(parameters: THREE.MeshStandardMaterialParameters) {
  return new THREE.MeshStandardMaterial(parameters);
}

function box(
  width: number,
  height: number,
  depth: number,
  surface: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), surface);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cylinder(
  top: number,
  bottom: number,
  height: number,
  surface: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
  segments = 24,
) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, segments), surface);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function sphere(radius: number, surface: THREE.Material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 12), surface);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
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
  texture.needsUpdate = true;
  textures.add(texture);
  return texture;
}

function stationShell(
  station: GarageStation,
  hitSize: Vec3,
  hitCenter: Vec3,
  haloRadius: number,
  haloStretch = 1,
): StationShell {
  const group = new THREE.Group();
  group.name = `station-${station.id}`;
  group.position.fromArray(station.anchorPosition);
  if (station.id === "crema" || station.id === "pantry") group.rotation.y = -Math.PI / 2;
  if (station.id === "preppr" || station.id === "book-adventure") group.rotation.y = Math.PI / 2;

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(haloRadius * 0.9, haloRadius, 64),
    new THREE.MeshBasicMaterial({
      color: station.accentHex,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.008;
  halo.scale.x = haloStretch;
  group.add(halo);

  const hitBox = new THREE.Mesh(
    new THREE.BoxGeometry(...hitSize),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      colorWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  hitBox.name = `${station.id}-hit-volume`;
  hitBox.position.fromArray(hitCenter);
  group.add(hitBox);

  return { group, halo, keyMaterials: [], animate: noop };
}

function registerKey(shell: StationShell, surface: THREE.MeshStandardMaterial, base: number, lift = 0.65) {
  shell.keyMaterials.push({ material: surface, base, lift });
  return surface;
}

function predictrTexture(kind: "curves" | "radar", textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(640, 360, textures, (context, width, height) => {
    context.fillStyle = "#06131d";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(58, 183, 205, 0.16)";
    context.lineWidth = 1;
    for (let x = 24; x < width; x += 40) {
      context.beginPath();
      context.moveTo(x, 52);
      context.lineTo(x, height - 28);
      context.stroke();
    }
    for (let y = 60; y < height; y += 40) {
      context.beginPath();
      context.moveTo(20, y);
      context.lineTo(width - 20, y);
      context.stroke();
    }

    context.fillStyle = "#8de9f5";
    context.font = "600 22px monospace";
    context.fillText(kind === "curves" ? "GEOPOLITICAL HORIZON" : "WORLD FRICTION RADAR", 24, 34);
    context.fillStyle = "#4f8d9a";
    context.font = "14px monospace";
    context.fillText(kind === "curves" ? "LIVE PROBABILITY / 90D" : "SIGNAL CLUSTERS / LIVE", width - 250, 33);

    if (kind === "curves") {
      const colors = ["#22d3ee", "#f59e0b", "#a78bfa"];
      for (let line = 0; line < 3; line += 1) {
        context.strokeStyle = colors[line];
        context.lineWidth = 3;
        context.beginPath();
        for (let x = 24; x <= width - 24; x += 5) {
          const progress = (x - 24) / (width - 48);
          const y = 226 - line * 30 - Math.sin(progress * 8 + line * 1.7) * 35 - progress * (38 + line * 12);
          if (x === 24) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      }
      context.fillStyle = "#22d3ee";
      context.font = "600 42px monospace";
      context.fillText("68.4%", 34, 316);
      context.fillStyle = "#7296a0";
      context.font = "14px monospace";
      context.fillText("TAIWAN STRAIT  /  ELECTIONS  /  TRADE", 190, 312);
    } else {
      const centerX = width * 0.52;
      const centerY = height * 0.55;
      for (let ring = 1; ring <= 4; ring += 1) {
        context.strokeStyle = `rgba(34, 211, 238, ${0.16 + ring * 0.08})`;
        context.lineWidth = 1.5;
        context.beginPath();
        context.arc(centerX, centerY, ring * 31, 0, Math.PI * 2);
        context.stroke();
      }
      for (let spoke = 0; spoke < 8; spoke += 1) {
        const angle = (spoke / 8) * Math.PI * 2;
        context.beginPath();
        context.moveTo(centerX, centerY);
        context.lineTo(centerX + Math.cos(angle) * 124, centerY + Math.sin(angle) * 124);
        context.stroke();
      }
      context.fillStyle = "rgba(245, 158, 11, 0.24)";
      context.strokeStyle = "#f59e0b";
      context.lineWidth = 3;
      context.beginPath();
      for (let point = 0; point < 8; point += 1) {
        const angle = (point / 8) * Math.PI * 2;
        const radius = 52 + ((point * 37) % 65);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        if (point === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
      context.fill();
      context.stroke();
      context.fillStyle = "#f8d58a";
      context.font = "14px monospace";
      context.fillText("8 ACTIVE REGIONS", 26, 322);
    }
  });
}

function buildPredictr(station: GarageStation, textures: Set<THREE.CanvasTexture>): BuiltStation {
  const shell = stationShell(station, [2.35, 1.05, 0.95], [0, 0.5, 0], 0.9, 1.25);
  const { group } = shell;
  const dark = material({ color: 0x111a20, metalness: 0.72, roughness: 0.28 });
  const steel = material({ color: 0x87949b, metalness: 0.9, roughness: 0.24 });
  const rubber = material({ color: 0x080c0f, roughness: 0.78 });

  group.add(box(1.55, 0.055, 0.42, rubber, -0.18, 0.035, 0));
  group.add(cylinder(0.045, 0.055, 0.43, steel, -0.18, 0.26, -0.03));
  const crossbar = cylinder(0.035, 0.035, 1.22, steel, -0.18, 0.39, -0.03);
  crossbar.rotation.z = Math.PI / 2;
  group.add(crossbar);

  const monitorData = [
    { x: -0.55, angle: 0.1, kind: "curves" as const },
    { x: 0.22, angle: -0.1, kind: "radar" as const },
  ];
  for (const monitor of monitorData) {
    const assembly = new THREE.Group();
    assembly.position.set(monitor.x, 0.62, 0);
    assembly.rotation.y = monitor.angle;
    assembly.add(box(0.73, 0.46, 0.065, dark));
    const screen = registerKey(
      shell,
      material({
        color: 0xffffff,
        map: predictrTexture(monitor.kind, textures),
        emissive: monitor.kind === "curves" ? 0x0d8fa5 : 0x9a5d08,
        emissiveIntensity: 0.65,
        roughness: 0.32,
      }),
      0.65,
      0.5,
    );
    screen.emissiveMap = screen.map;
    assembly.add(new THREE.Mesh(new THREE.PlaneGeometry(0.655, 0.385), screen));
    assembly.children[assembly.children.length - 1].position.set(0, 0, 0.034);
    group.add(assembly);
  }

  const pedestal = new THREE.Group();
  pedestal.position.set(0.91, 0, 0.02);
  pedestal.add(cylinder(0.2, 0.23, 0.07, dark, 0, 0.04));
  pedestal.add(cylinder(0.055, 0.075, 0.28, steel, 0, 0.2));
  pedestal.add(cylinder(0.15, 0.1, 0.045, steel, 0, 0.35));
  group.add(pedestal);

  const globe = new THREE.Group();
  globe.position.set(0.91, 0.55, 0.02);
  const cyanWire = registerKey(
    shell,
    material({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 0.9, wireframe: true }),
    0.9,
    0.7,
  );
  const amberWire = material({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.48,
    wireframe: true,
    transparent: true,
    opacity: 0.65,
  });
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(0.205, 18, 12), cyanWire));
  const longitudeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.211, 12, 8), amberWire);
  longitudeMesh.rotation.z = Math.PI / 2;
  globe.add(longitudeMesh);
  group.add(globe);

  const led = registerKey(
    shell,
    material({ color: 0x9bf5ff, emissive: 0x22d3ee, emissiveIntensity: 1.4 }),
    1.4,
    0.4,
  );
  group.add(sphere(0.026, led, -0.18, 0.075, 0.22));

  shell.animate = (elapsed) => {
    globe.rotation.y = elapsed * 0.32;
    globe.rotation.x = Math.sin(elapsed * 0.24) * 0.08;
    longitudeMesh.rotation.y = -elapsed * 0.21;
    led.emissiveIntensity += 0.45 + Math.sin(elapsed * 2.1) * 0.35;
  };
  return shell;
}

function gaugeTexture(textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(256, 256, textures, (context, width, height) => {
    context.fillStyle = "#eee6d4";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#282b29";
    context.lineWidth = 5;
    context.beginPath();
    context.arc(128, 128, 111, 0, Math.PI * 2);
    context.stroke();
    for (let tick = 0; tick <= 12; tick += 1) {
      const angle = Math.PI * 0.75 + (tick / 12) * Math.PI * 1.5;
      context.beginPath();
      context.moveTo(128 + Math.cos(angle) * 83, 128 + Math.sin(angle) * 83);
      context.lineTo(128 + Math.cos(angle) * 100, 128 + Math.sin(angle) * 100);
      context.stroke();
    }
    context.strokeStyle = "#a13d26";
    context.lineWidth = 7;
    context.beginPath();
    context.moveTo(128, 128);
    context.lineTo(183, 69);
    context.stroke();
    context.fillStyle = "#282b29";
    context.font = "bold 25px sans-serif";
    context.textAlign = "center";
    context.fillText("BAR", 128, 190);
    context.beginPath();
    context.arc(128, 128, 10, 0, Math.PI * 2);
    context.fill();
  });
}

function steamTexture(textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(64, 256, textures, (context, width, height) => {
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.25, "rgba(255,244,224,0.65)");
    gradient.addColorStop(0.75, "rgba(255,244,224,0.35)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.strokeStyle = gradient;
    context.lineWidth = 10;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(width * 0.5, height);
    context.bezierCurveTo(8, height * 0.72, width - 8, height * 0.38, width * 0.48, 0);
    context.stroke();
  });
}

function buildCrema(station: GarageStation, textures: Set<THREE.CanvasTexture>): BuiltStation {
  const shell = stationShell(station, [1.25, 1.15, 1.05], [0, 0.54, 0.08], 0.65, 1.05);
  const { group } = shell;
  const black = material({ color: 0x151716, metalness: 0.45, roughness: 0.38 });
  const chrome = material({ color: 0xb9c1c2, metalness: 0.96, roughness: 0.2 });
  const brass = material({ color: 0xb7873e, metalness: 0.86, roughness: 0.25 });
  const ceramic = material({ color: 0xe8d9bd, roughness: 0.3 });

  group.add(box(0.78, 0.57, 0.5, black, 0, 0.36, 0));
  group.add(box(0.82, 0.055, 0.54, chrome, 0, 0.665, 0));
  group.add(box(0.66, 0.38, 0.025, chrome, 0, 0.39, 0.263));
  group.add(box(0.52, 0.25, 0.03, black, 0.03, 0.27, 0.282));
  group.add(box(0.72, 0.055, 0.43, chrome, 0, 0.07, 0.2));
  for (let slit = -3; slit <= 3; slit += 1) {
    group.add(box(0.025, 0.008, 0.34, black, slit * 0.075, 0.101, 0.21));
  }

  const hopperGlass = material({
    color: 0xaeb8b3,
    transparent: true,
    opacity: 0.34,
    roughness: 0.12,
    metalness: 0.08,
    depthWrite: false,
  });
  group.add(cylinder(0.17, 0.105, 0.25, hopperGlass, 0.13, 0.815, -0.03));
  group.add(cylinder(0.145, 0.09, 0.17, material({ color: 0x3b2014, roughness: 0.9 }), 0.13, 0.79, -0.03));
  group.add(cylinder(0.18, 0.18, 0.035, black, 0.13, 0.957, -0.03));
  group.add(cylinder(0.12, 0.12, 0.09, chrome, 0.13, 0.69, -0.03));

  const gaugeRim = cylinder(0.098, 0.098, 0.035, brass, -0.2, 0.52, 0.292);
  gaugeRim.rotation.x = Math.PI / 2;
  group.add(gaugeRim);
  const gaugeFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.084, 32),
    material({ map: gaugeTexture(textures), roughness: 0.5 }),
  );
  gaugeFace.position.set(-0.2, 0.52, 0.313);
  group.add(gaugeFace);

  const portafilter = cylinder(0.09, 0.09, 0.055, chrome, 0.12, 0.39, 0.315);
  portafilter.rotation.x = Math.PI / 2;
  group.add(portafilter);
  const collar = cylinder(0.035, 0.035, 0.12, brass, 0.12, 0.37, 0.39);
  collar.rotation.x = Math.PI / 2;
  group.add(collar);
  const handle = cylinder(0.032, 0.042, 0.29, black, 0.12, 0.37, 0.57);
  handle.rotation.x = Math.PI / 2;
  group.add(handle);

  group.add(cylinder(0.09, 0.072, 0.13, ceramic, 0.12, 0.175, 0.32));
  group.add(cylinder(0.074, 0.074, 0.009, material({ color: 0x321a10, roughness: 0.55 }), 0.12, 0.245, 0.32));
  const cupHandle = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.014, 8, 20, Math.PI * 1.65), ceramic);
  cupHandle.position.set(0.205, 0.18, 0.32);
  cupHandle.rotation.z = -Math.PI * 0.82;
  group.add(cupHandle);

  const powerLed = registerKey(
    shell,
    material({ color: 0xffc55c, emissive: 0xf59e0b, emissiveIntensity: 1.1 }),
    1.1,
    0.5,
  );
  group.add(sphere(0.023, powerLed, 0.27, 0.52, 0.291));

  const wisps: Array<{
    mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
    phase: number;
    x: number;
  }> = [];
  const steamMap = steamTexture(textures);
  for (let index = 0; index < 3; index += 1) {
    const steam = new THREE.MeshBasicMaterial({
      map: steamMap,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
      side: THREE.DoubleSide,
      color: 0xfff2dc,
    });
    const wisp = new THREE.Mesh(new THREE.PlaneGeometry(0.065, 0.25), steam);
    wisp.position.set(0.12, 0.34 + index * 0.06, 0.32 + index * 0.008);
    group.add(wisp);
    wisps.push({ mesh: wisp, phase: index / 3, x: 0.12 + (index - 1) * 0.018 });
  }

  shell.animate = (elapsed) => {
    powerLed.emissiveIntensity += 0.2 + Math.sin(elapsed * 1.7) * 0.12;
    for (const wisp of wisps) {
      const rise = (elapsed * 0.19 + wisp.phase) % 1;
      wisp.mesh.position.y = 0.29 + rise * 0.39;
      wisp.mesh.position.x = wisp.x + Math.sin(elapsed * 1.2 + wisp.phase * 8) * 0.025;
      wisp.mesh.material.opacity = Math.sin(rise * Math.PI) * 0.23;
      wisp.mesh.scale.set(0.75 + rise * 0.55, 0.7 + rise * 0.55, 1);
    }
  };
  return shell;
}

function recipeTexture(textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(420, 560, textures, (context, width, height) => {
    context.fillStyle = "#f4f1df";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#27351e";
    context.fillRect(0, 0, width, 92);
    context.fillStyle = "#d5f99b";
    context.font = "bold 29px sans-serif";
    context.fillText("PANTRY / RECIPE", 30, 43);
    context.fillStyle = "#ffffff";
    context.font = "18px sans-serif";
    context.fillText("MATCHED TO YOUR SHELF", 30, 71);
    context.fillStyle = "#84cc16";
    context.fillRect(30, 124, 110, 108);
    context.fillStyle = "#c47b35";
    context.beginPath();
    context.arc(85, 178, 36, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#26321f";
    context.font = "bold 31px sans-serif";
    context.fillText("Golden oat bowl", 30, 278);
    context.fillStyle = "#71805f";
    context.font = "19px sans-serif";
    context.fillText("12 MIN  •  5 INGREDIENTS", 30, 312);
    const lines = ["01  Toast the oats & spice", "02  Fold through warm milk", "03  Finish with espresso", "04  Season to your taste"];
    context.fillStyle = "#39432f";
    context.font = "20px sans-serif";
    lines.forEach((line, index) => context.fillText(line, 30, 372 + index * 43));
  });
}

function buildPantry(station: GarageStation, textures: Set<THREE.CanvasTexture>): BuiltStation {
  const shell = stationShell(station, [2.05, 0.95, 0.85], [0.15, 0.43, 0], 0.72, 1.35);
  const { group } = shell;
  const timber = material({ color: 0x765033, roughness: 0.72 });
  const cork = material({ color: 0xa87946, roughness: 0.95 });
  const glass = material({
    color: 0xe8f2e7,
    transparent: true,
    opacity: 0.28,
    roughness: 0.08,
    metalness: 0.05,
    depthWrite: false,
  });
  const label = material({ color: 0xeee5ca, roughness: 0.8 });

  group.add(box(1.35, 0.09, 0.4, timber, -0.25, 0.055, 0));
  group.add(box(1.35, 0.055, 0.37, timber, -0.25, 0.43, -0.015));
  group.add(box(0.07, 0.43, 0.4, timber, -0.89, 0.235, 0));
  group.add(box(0.07, 0.43, 0.4, timber, 0.39, 0.235, 0));

  const contents = [0xd99b24, 0x6f913c, 0xb94728, 0xd7c59a, 0x392218];
  const fillHeights = [0.15, 0.19, 0.17, 0.22, 0.18];
  for (let index = 0; index < 5; index += 1) {
    const x = -0.75 + index * 0.25;
    group.add(cylinder(0.095, 0.09, 0.29, glass, x, 0.245, 0.015));
    group.add(cylinder(0.076, 0.073, fillHeights[index], material({ color: contents[index], roughness: 0.9 }), x, 0.11 + fillHeights[index] / 2, 0.015));
    group.add(cylinder(0.102, 0.098, 0.045, cork, x, 0.412, 0.015));
    group.add(box(0.115, 0.07, 0.008, label, x, 0.25, 0.107));
    group.add(box(0.075, 0.008, 0.01, material({ color: contents[index], roughness: 0.7 }), x, 0.25, 0.113));
  }

  const tablet = new THREE.Group();
  tablet.position.set(0.79, 0.035, 0.015);
  tablet.rotation.x = -0.18;
  const tabletBody = material({ color: 0x20251f, metalness: 0.55, roughness: 0.35 });
  tablet.add(box(0.5, 0.62, 0.045, tabletBody, 0, 0.34, 0));
  const tabletScreen = registerKey(
    shell,
    material({
      map: recipeTexture(textures),
      emissive: 0x84cc16,
      emissiveIntensity: 0.3,
      roughness: 0.42,
    }),
    0.3,
    0.45,
  );
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.555), tabletScreen);
  screen.position.set(0, 0.34, 0.024);
  tablet.add(screen);
  group.add(tablet);
  group.add(box(0.34, 0.035, 0.25, tabletBody, 0.79, 0.025, -0.02));

  shell.animate = (elapsed) => {
    tabletScreen.emissiveIntensity += 0.07 + Math.sin(elapsed * 1.15) * 0.055;
  };
  return shell;
}

function atlasTexture(textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(640, 440, textures, (context, width, height) => {
    context.fillStyle = "#d9d0a8";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(70, 83, 55, 0.22)";
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
    context.fillStyle = "#718561";
    const land = [
      [70, 105, 150, 72],
      [145, 202, 90, 140],
      [300, 112, 105, 80],
      [350, 197, 92, 135],
      [420, 95, 150, 105],
      [510, 275, 78, 55],
    ];
    for (const [x, y, rx, ry] of land) {
      context.beginPath();
      context.ellipse(x, y, rx / 2, ry / 2, -0.2, 0, Math.PI * 2);
      context.fill();
    }
    context.strokeStyle = "#b45c39";
    context.lineWidth = 4;
    context.setLineDash([12, 8]);
    context.beginPath();
    context.moveTo(80, 280);
    context.bezierCurveTo(210, 85, 380, 350, 560, 125);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = "#283c31";
    context.font = "bold 24px monospace";
    context.fillText("WORLD RESILIENCE ATLAS", 24, 34);
    context.font = "16px monospace";
    context.fillText("FOOD SYSTEMS / OFFLINE FIELD EDITION", 24, 416);
    context.fillStyle = "#b45c39";
    for (const [x, y] of [[120, 140], [340, 180], [490, 150], [540, 290]]) {
      context.beginPath();
      context.arc(x, y, 7, 0, Math.PI * 2);
      context.fill();
    }
  });
}

function buildPreppr(station: GarageStation, textures: Set<THREE.CanvasTexture>): BuiltStation {
  const shell = stationShell(station, [1.8, 0.95, 1.15], [0, 0.43, 0], 0.72, 1.15);
  const { group } = shell;
  const olive = material({ color: 0x4c5637, metalness: 0.35, roughness: 0.66 });
  const oliveDark = material({ color: 0x293021, metalness: 0.4, roughness: 0.63 });
  const amber = material({ color: 0xe0a128, metalness: 0.5, roughness: 0.42 });
  const black = material({ color: 0x171c18, roughness: 0.72 });

  const crate = new THREE.Group();
  crate.position.set(-0.35, 0, -0.04);
  crate.add(box(0.78, 0.42, 0.5, olive, 0, 0.24, 0));
  crate.add(box(0.82, 0.075, 0.54, oliveDark, 0, 0.485, 0));
  crate.add(box(0.62, 0.035, 0.035, amber, 0, 0.48, 0.285));
  for (const x of [-0.34, 0.34]) {
    for (const z of [-0.22, 0.22]) {
      crate.add(box(0.075, 0.45, 0.065, oliveDark, x, 0.25, z));
      crate.add(box(0.12, 0.11, 0.035, amber, x, 0.36, z + Math.sign(z) * 0.04));
    }
  }
  for (const y of [0.15, 0.28]) crate.add(box(0.55, 0.035, 0.025, oliveDark, 0, y, 0.265));
  group.add(crate);

  const mapGeometry = new THREE.PlaneGeometry(0.72, 0.5, 3, 1);
  const mapPositions = mapGeometry.attributes.position;
  for (let index = 0; index < mapPositions.count; index += 1) {
    const x = mapPositions.getX(index);
    mapPositions.setZ(index, Math.abs(Math.sin((x / 0.72 + 0.5) * Math.PI * 3)) * 0.014);
  }
  mapGeometry.computeVertexNormals();
  const atlas = registerKey(
    shell,
    material({
      map: atlasTexture(textures),
      emissive: 0x8a7b3c,
      emissiveIntensity: 0.12,
      roughness: 0.86,
      side: THREE.DoubleSide,
    }),
    0.12,
    0.25,
  );
  const map = new THREE.Mesh(mapGeometry, atlas);
  map.rotation.x = -Math.PI / 2;
  map.position.set(0.43, 0.025, 0.21);
  map.receiveShadow = true;
  group.add(map);

  const radio = new THREE.Group();
  radio.position.set(0.48, 0, -0.28);
  radio.add(box(0.32, 0.3, 0.2, oliveDark, 0, 0.18, 0));
  radio.add(box(0.25, 0.11, 0.018, black, 0, 0.16, 0.11));
  for (let slit = -2; slit <= 2; slit += 1) radio.add(box(0.19, 0.008, 0.012, olive, 0, 0.16 + slit * 0.018, 0.123));
  radio.add(box(0.16, 0.065, 0.015, material({ color: 0x273f32, emissive: 0x123c27, emissiveIntensity: 0.4 }), -0.035, 0.265, 0.111));
  const tuningKnob = cylinder(0.035, 0.035, 0.025, black, 0.105, 0.27, 0.12);
  tuningKnob.rotation.x = Math.PI / 2;
  radio.add(tuningKnob);
  const antenna = cylinder(0.008, 0.013, 0.46, material({ color: 0x9ca49c, metalness: 0.95, roughness: 0.2 }), -0.11, 0.54, -0.02, 10);
  antenna.rotation.z = -0.17;
  radio.add(antenna);
  const beacon = registerKey(
    shell,
    material({ color: 0x8affc1, emissive: 0x10b981, emissiveIntensity: 1.25 }),
    1.25,
    0.55,
  );
  radio.add(sphere(0.022, beacon, 0.105, 0.21, 0.125));
  group.add(radio);

  shell.animate = (elapsed) => {
    const pulse = Math.pow(Math.max(0, Math.sin(elapsed * 1.45)), 5);
    beacon.emissiveIntensity += pulse * 1.5;
  };
  return shell;
}

function leatherTexture(color: number, textures: Set<THREE.CanvasTexture>) {
  return canvasTexture(256, 256, textures, (context, width, height) => {
    const base = `#${color.toString(16).padStart(6, "0")}`;
    context.fillStyle = base;
    context.fillRect(0, 0, width, height);
    for (let index = 0; index < 900; index += 1) {
      const x = (Math.sin(index * 91.17) * 0.5 + 0.5) * width;
      const y = (Math.sin(index * 47.31 + 2) * 0.5 + 0.5) * height;
      const light = index % 3 === 0;
      context.fillStyle = light ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.065)";
      context.fillRect(x, y, 1.5, 1.5);
    }
    context.strokeStyle = "rgba(255,255,255,0.08)";
    context.lineWidth = 2;
    context.strokeRect(8, 8, width - 16, height - 16);
  });
}

function buildBookAdventure(station: GarageStation, textures: Set<THREE.CanvasTexture>): BuiltStation {
  const shell = stationShell(station, [1.65, 1.2, 1.15], [0, 0.52, 0], 0.68, 1.05);
  const { group } = shell;
  const gold = material({ color: 0xc9a455, metalness: 0.83, roughness: 0.28 });
  const pageMaterial = material({ color: 0xd8cba9, roughness: 0.92 });
  const colors = [0x651f2b, 0x234a38, 0x263b63, 0x9a6724];
  const rotations = [-0.05, 0.035, -0.025, 0.05];
  for (let index = 0; index < 4; index += 1) {
    const book = new THREE.Group();
    const width = 0.68 - index * 0.025;
    const y = 0.065 + index * 0.115;
    book.position.set(-0.28, y, 0.08);
    book.rotation.y = rotations[index];
    const leather = material({
      color: 0xffffff,
      map: leatherTexture(colors[index], textures),
      roughness: 0.68,
      metalness: 0.04,
    });
    book.add(box(width - 0.035, 0.085, 0.4, pageMaterial, 0, 0, 0));
    book.add(box(width, 0.018, 0.44, leather, 0, 0.052, 0));
    book.add(box(width, 0.018, 0.44, leather, 0, -0.052, 0));
    book.add(box(width, 0.105, 0.025, leather, 0, 0, 0.215));
    for (const x of [-width * 0.34, width * 0.34]) book.add(box(0.018, 0.107, 0.029, gold, x, 0, 0.218));
    book.add(box(0.18, 0.012, 0.03, gold, 0, 0.018, 0.22));
    group.add(book);
  }

  const violet = material({ color: 0x6f3c91, roughness: 0.68 });
  const ribbon = box(0.045, 0.009, 0.37, violet, -0.42, 0.19, 0.38);
  ribbon.rotation.x = 0.13;
  group.add(ribbon);
  const ribbonEdge = box(0.009, 0.011, 0.37, gold, -0.405, 0.192, 0.38);
  ribbonEdge.rotation.x = 0.13;
  group.add(ribbonEdge);

  const brass = registerKey(
    shell,
    material({ color: 0xb8924f, metalness: 0.88, roughness: 0.25, emissive: 0x5f3712, emissiveIntensity: 0.12 }),
    0.12,
    0.22,
  );
  group.add(cylinder(0.16, 0.19, 0.045, brass, 0.42, 0.03, -0.2));
  const lampCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.42, 0.05, -0.2),
    new THREE.Vector3(0.43, 0.48, -0.2),
    new THREE.Vector3(0.33, 0.72, -0.2),
    new THREE.Vector3(0.08, 0.77, -0.2),
    new THREE.Vector3(-0.02, 0.64, -0.2),
  ]);
  const lampArch = new THREE.Mesh(new THREE.TubeGeometry(lampCurve, 32, 0.018, 10, false), brass);
  lampArch.castShadow = true;
  group.add(lampArch);
  group.add(cylinder(0.07, 0.16, 0.14, brass, -0.02, 0.59, -0.2));
  const bulb = registerKey(
    shell,
    material({ color: 0xffe0a0, emissive: 0xffa733, emissiveIntensity: 1.5 }),
    1.5,
    0.35,
  );
  group.add(sphere(0.052, bulb, -0.02, 0.515, -0.2));
  const lampLight = new THREE.SpotLight(0xffbd6b, 2.2, 2.2, 0.72, 0.75, 2);
  lampLight.position.set(-0.02, 0.51, -0.2);
  lampLight.target.position.set(-0.28, 0, 0.08);
  lampLight.castShadow = false;
  group.add(lampLight, lampLight.target);

  const compass = new THREE.Group();
  const compassBaseY = 0.39;
  compass.position.set(0.3, compassBaseY, 0.25);
  compass.add(cylinder(0.115, 0.115, 0.025, brass));
  const compassRing = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.013, 10, 32), gold);
  compassRing.rotation.x = Math.PI / 2;
  compass.add(compassRing);
  const compassFace = cylinder(0.098, 0.098, 0.009, material({ color: 0xe3d8b5, roughness: 0.55 }), 0, 0.018);
  compass.add(compassFace);
  const needleNorth = box(0.025, 0.012, 0.14, violet, 0, 0.03, -0.035);
  needleNorth.rotation.y = -0.35;
  compass.add(needleNorth);
  const needleSouth = box(0.022, 0.012, 0.09, gold, 0.025, 0.031, 0.045);
  needleSouth.rotation.y = -0.35;
  compass.add(needleSouth);
  compass.add(sphere(0.018, gold, 0, 0.042, 0));
  group.add(compass);

  shell.animate = (elapsed) => {
    compass.position.y = compassBaseY + Math.sin(elapsed * 1.25) * 0.025;
    compass.rotation.y = elapsed * 0.16 + Math.sin(elapsed * 0.7) * 0.12;
    compass.rotation.z = Math.sin(elapsed * 0.9) * 0.045;
    bulb.emissiveIntensity += Math.sin(elapsed * 1.05) * 0.08;
    lampLight.intensity = 2.2 + Math.sin(elapsed * 1.05) * 0.08;
  };
  return shell;
}

const builders: Record<StationId, (station: GarageStation, textures: Set<THREE.CanvasTexture>) => BuiltStation> = {
  predictr: buildPredictr,
  crema: buildCrema,
  pantry: buildPantry,
  preppr: buildPreppr,
  "book-adventure": buildBookAdventure,
};

export function buildProjectStations(stations: GarageStation[]): {
  root: THREE.Group;
  handles: Map<StationId, StationHandle>;
  dispose: () => void;
} {
  const root = new THREE.Group();
  root.name = "project-stations";
  const handles = new Map<StationId, StationHandle>();
  const textures = new Set<THREE.CanvasTexture>();

  for (const station of stations) {
    const built = builders[station.id](station, textures);
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
        activity += (target - activity) * (1 - Math.exp(-8 * Math.min(dt, 0.1)));
        built.halo.material.opacity = 0.07 + activity * 0.4;
        const haloScale = 1 + activity * 0.055;
        built.halo.scale.y = haloScale;
        built.halo.scale.z = haloScale;
        for (const key of built.keyMaterials) {
          key.material.emissiveIntensity = key.base + activity * key.lift;
        }
        built.animate(elapsed, activity);
      },
    });
  }

  return {
    root,
    handles,
    dispose: () => {
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
      textures.forEach((texture) => texture.dispose());
      root.clear();
    },
  };
}
