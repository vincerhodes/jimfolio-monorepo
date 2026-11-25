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

type PalmAnimation = {
  crown: THREE.Group;
  fronds: THREE.Group[];
  phase: number;
};

type SteamWisp = {
  mesh: THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>;
  baseY: number;
  phase: number;
};

type GlowMaterial = {
  material: THREE.MeshStandardMaterial;
  day: number;
  night: number;
};

const CENTER_X = -14;
const LANTERN_MESSAGE = "Hội An lantern lit — Sam's officially living the beach-hut dream.";
const SURFBOARD_MESSAGE = "Surf's up in Hội An — Browzr ships best barefoot.";

export function buildSamsBeach(
  scene: THREE.Scene,
  stations: GarageStation[],
  textures?: WorkshopTextures,
): PlotHandle {
  const group = new THREE.Group();
  group.name = "sams-beach";
  scene.add(group);

  const ownedTextures: THREE.Texture[] = [];
  const interiorLights: THREE.PointLight[] = [];
  const palms: PalmAnimation[] = [];
  const steamWisps: SteamWisp[] = [];
  const glowMaterials: GlowMaterial[] = [];
  const handles = new Map<StationId, StationHandle>();
  const doorHitMeshes: THREE.Object3D[] = [];
  const interiorEasterEggHitMeshes: THREE.Object3D[] = [];
  const exteriorEasterEggHitMeshes: THREE.Object3D[] = [];

  let lightsActive = true;
  let nightAmount = 1;
  let doorHovered = false;
  let lanternPulse = 0;
  let surfboardPulse = 0;

  const standard = (
    color: THREE.ColorRepresentation,
    roughness = 0.72,
    metalness = 0,
  ) => new THREE.MeshStandardMaterial({ color, roughness, metalness });

  const sandMaterial = standard("#dcb978", 0.96);
  const sandTexture = createSandTexture();
  ownedTextures.push(sandTexture);
  sandMaterial.map = sandTexture;
  sandMaterial.bumpMap = sandTexture;
  sandMaterial.bumpScale = 0.035;

  const teakMaterial = new THREE.MeshStandardMaterial({
    color: "#9a5c31",
    map: textures?.butcherBlock.map,
    bumpMap: textures?.butcherBlock.bumpMap,
    bumpScale: 0.025,
    roughness: 0.7,
  });
  const darkTeakMaterial = standard("#56351f", 0.82);
  const lightTeakMaterial = standard("#bd8150", 0.74);
  const bambooMaterial = standard("#b89352", 0.82);
  const bambooLightMaterial = standard("#d1b56d", 0.79);
  const bambooDarkMaterial = standard("#766332", 0.88);
  const thatchMaterial = standard("#b98232", 0.98);
  const thatchLightMaterial = standard("#d3a44f", 0.96);
  const ropeMaterial = standard("#bca476", 1);
  const silverMaterial = new THREE.MeshStandardMaterial({
    color: "#c8d0d2",
    map: textures?.brushedMetal.map,
    roughness: 0.28,
    metalness: 0.78,
  });
  const blackMaterial = standard("#172126", 0.45, 0.12);
  const creamMaterial = standard("#fff0cf", 0.8);
  const coralMaterial = standard("#ef6f61", 0.72);
  const tealMaterial = standard("#1faeaa", 0.58);
  const leafMaterial = standard("#16734c", 0.82);
  const leafLightMaterial = standard("#29945c", 0.79);
  const trunkMaterial = standard("#795235", 0.96);
  const trunkLightMaterial = standard("#936a43", 0.94);

  function addMesh<T extends THREE.BufferGeometry, M extends THREE.Material | THREE.Material[]>(
    parent: THREE.Object3D,
    geometry: T,
    material: M,
    position: [number, number, number],
  ): THREE.Mesh<T, M> {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function box(
    parent: THREE.Object3D,
    size: [number, number, number],
    position: [number, number, number],
    material: THREE.Material,
  ): THREE.Mesh<THREE.BoxGeometry, THREE.Material> {
    return addMesh(parent, new THREE.BoxGeometry(...size), material, position);
  }

  function cylinderBetween(
    parent: THREE.Object3D,
    start: THREE.Vector3,
    end: THREE.Vector3,
    radius: number,
    material: THREE.Material,
    radialSegments = 10,
  ): THREE.Mesh {
    const direction = new THREE.Vector3().subVectors(end, start);
    const mesh = addMesh(
      parent,
      new THREE.CylinderGeometry(radius, radius * 1.04, direction.length(), radialSegments),
      material,
      [0, 0, 0],
    );
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return mesh;
  }

  function makeCanvasTexture(
    width: number,
    height: number,
    painter: (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void,
  ): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("A 2D canvas context is required to build Sam's Beach.");
    painter(context, canvas);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
    ownedTextures.push(texture);
    return texture;
  }

  function labelMaterial(
    width: number,
    height: number,
    title: string,
    subtitle: string,
    background = "#173d3a",
    foreground = "#fff1c7",
  ): THREE.MeshStandardMaterial {
    const texture = makeCanvasTexture(width, height, (context, canvas) => {
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = "rgba(255,235,180,0.72)";
      context.lineWidth = Math.max(5, canvas.width * 0.008);
      context.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = foreground;
      const padX = Math.max(40, canvas.width * 0.06);
      const maxWidth = canvas.width - padX * 2;
      for (let fontSize = Math.round(canvas.height * (subtitle ? 0.34 : 0.40)); fontSize >= 24; fontSize -= 2) {
        context.font = `700 ${fontSize}px sans-serif`;
        if (context.measureText(title).width <= maxWidth || fontSize <= 24) break;
      }
      context.fillText(title, canvas.width / 2, canvas.height * (subtitle ? 0.4 : 0.52), maxWidth);
      if (subtitle) {
        context.fillStyle = "#f6c866";
        context.font = `600 ${Math.round(canvas.height * 0.14)}px sans-serif`;
        context.fillText(subtitle, canvas.width / 2, canvas.height * 0.75, maxWidth);
      }
    });
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.72,
      emissive: new THREE.Color(background),
      emissiveIntensity: 0.1,
    });
  }

  function glowingMaterial(color: THREE.ColorRepresentation, day = 0.15, night = 0.82) {
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.5,
      emissive: new THREE.Color(color),
      emissiveIntensity: night,
    });
    glowMaterials.push({ material, day, night });
    return material;
  }

  function addPointLight(
    color: THREE.ColorRepresentation,
    intensity: number,
    distance: number,
    position: [number, number, number],
  ): THREE.PointLight {
    const light = new THREE.PointLight(color, intensity, distance, 2);
    light.position.set(...position);
    light.userData.dayIntensity = intensity * 0.2;
    light.userData.nightIntensity = intensity;
    group.add(light);
    interiorLights.push(light);
    return light;
  }

  function createLantern(
    parent: THREE.Object3D,
    position: [number, number, number],
    color: THREE.ColorRepresentation,
    scale = 1,
  ): { group: THREE.Group; body: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial> } {
    const lantern = new THREE.Group();
    lantern.position.set(...position);
    lantern.scale.setScalar(scale);
    parent.add(lantern);
    const silk = glowingMaterial(color);
    const gold = standard("#dcae45", 0.4, 0.35);
    const body = addMesh(
      lantern,
      new THREE.SphereGeometry(0.22, 20, 14),
      silk,
      [0, 0, 0],
    );
    body.scale.set(0.88, 1.22, 0.88);
    for (let index = 0; index < 8; index += 1) {
      const angle = (index / 8) * Math.PI * 2;
      const rib = addMesh(
        lantern,
        new THREE.TorusGeometry(0.218, 0.008, 5, 24, Math.PI),
        gold,
        [0, 0, 0],
      );
      rib.rotation.set(0, angle, Math.PI / 2);
      rib.scale.y = 1.2;
    }
    addMesh(lantern, new THREE.CylinderGeometry(0.12, 0.12, 0.055, 16), gold, [0, 0.26, 0]);
    addMesh(lantern, new THREE.CylinderGeometry(0.12, 0.12, 0.055, 16), gold, [0, -0.26, 0]);
    cylinderBetween(
      lantern,
      new THREE.Vector3(0, -0.28, 0),
      new THREE.Vector3(0, -0.52, 0),
      0.012,
      gold,
      6,
    );
    const tassel = addMesh(
      lantern,
      new THREE.ConeGeometry(0.055, 0.2, 8),
      silk,
      [0, -0.53, 0],
    );
    tassel.rotation.z = Math.PI;
    return { group: lantern, body };
  }

  const sandPad = box(group, [13, 0.16, 12.8], [CENTER_X, -0.09, 1.2], sandMaterial);
  sandPad.castShadow = false;
  const leftCove = addMesh(
    group,
    new THREE.CircleGeometry(3.3, 48),
    sandMaterial,
    [-19.25, 0.002, 2.5],
  );
  leftCove.rotation.x = -Math.PI / 2;
  leftCove.scale.set(0.48, 1.35, 1);
  leftCove.castShadow = false;
  const rightCove = leftCove.clone();
  rightCove.position.x = -8.75;
  rightCove.position.z = 0.5;
  group.add(rightCove);

  const shallowWaterMaterial = new THREE.MeshStandardMaterial({
    color: "#43b8b2",
    roughness: 0.24,
    metalness: 0.08,
    transparent: true,
    opacity: 0.74,
  });
  const water = addMesh(
    group,
    new THREE.PlaneGeometry(11.8, 1.05, 24, 1),
    shallowWaterMaterial,
    [CENTER_X, 0.015, -4.85],
  );
  water.rotation.x = -Math.PI / 2;
  water.castShadow = false;

  const boardwalk = new THREE.Group();
  boardwalk.name = "weathered-boardwalk";
  group.add(boardwalk);
  for (let index = 0; index < 14; index += 1) {
    const z = 3.48 + index * 0.305;
    const plank = box(
      boardwalk,
      [2.15 + Math.sin(index * 2.3) * 0.06, 0.105, 0.275],
      [CENTER_X + Math.sin(index * 1.7) * 0.018, 0.105, z],
      index % 3 === 0 ? lightTeakMaterial : teakMaterial,
    );
    plank.rotation.y = Math.sin(index * 4.1) * 0.008;
    for (const side of [-1, 1]) {
      addMesh(
        boardwalk,
        new THREE.CylinderGeometry(0.018, 0.018, 0.008, 8),
        blackMaterial,
        [CENTER_X + side * 0.87, 0.163, z],
      );
    }
  }
  for (const side of [-1, 1]) {
    box(boardwalk, [0.11, 0.12, 4.35], [CENTER_X + side * 0.91, 0.035, 5.5], darkTeakMaterial);
  }

  const hut = new THREE.Group();
  hut.name = "bamboo-and-teak-beach-hut";
  group.add(hut);
  box(hut, [6.8, 0.22, 7.4], [CENTER_X, 0.13, -0.5], darkTeakMaterial);
  for (let index = 0; index < 17; index += 1) {
    const x = -17.2 + index * 0.4;
    box(hut, [0.375, 0.09, 7.35], [x, 0.24, -0.5], index % 3 === 0 ? lightTeakMaterial : teakMaterial);
  }
  for (let index = 0; index < 3; index += 1) {
    box(
      hut,
      [2.65 + index * 0.24, 0.12, 0.36],
      [CENTER_X, 0.18 - index * 0.065, 3.37 + index * 0.33],
      teakMaterial,
    );
  }
  for (const x of [-17.18, -10.82]) {
    for (const z of [-3.94, 2.95]) {
      box(hut, [0.22, 0.48, 0.22], [x, 0.02, z], darkTeakMaterial);
    }
  }

  const postPositions: Array<[number, number]> = [
    [-17.22, -4.0], [-10.78, -4.0], [-17.22, 3.02], [-10.78, 3.02],
    [-15.48, 3.08], [-12.52, 3.08],
  ];
  for (const [x, z] of postPositions) {
    addMesh(hut, new THREE.CylinderGeometry(0.105, 0.13, 2.55, 12), bambooMaterial, [x, 1.47, z]);
    for (const y of [0.48, 1.05, 1.65, 2.25]) {
      addMesh(hut, new THREE.TorusGeometry(0.112, 0.014, 5, 12), bambooDarkMaterial, [x, y, z]).rotation.x = Math.PI / 2;
    }
  }

  box(hut, [6.5, 0.13, 0.13], [CENTER_X, 2.54, 3.04], bambooDarkMaterial);
  box(hut, [6.5, 0.13, 0.13], [CENTER_X, 2.54, -4.0], bambooDarkMaterial);
  for (let index = 0; index < 32; index += 1) {
    const x = -17.12 + index * 0.202;
    addMesh(
      hut,
      new THREE.CylinderGeometry(0.062, 0.067, 1.96, 8),
      index % 4 === 0 ? bambooLightMaterial : bambooMaterial,
      [x, 1.3, -4.02],
    );
  }
  for (const x of [-17.23, -10.77]) {
    for (let index = 0; index < 34; index += 1) {
      const z = -3.9 + index * 0.202;
      addMesh(
        hut,
        new THREE.CylinderGeometry(0.06, 0.065, 1.96, 8),
        index % 5 === 0 ? bambooLightMaterial : bambooMaterial,
        [x, 1.3, z],
      );
    }
  }
  for (const side of [-1, 1]) {
    for (let index = 0; index < 7; index += 1) {
      const x = CENTER_X + side * (1.52 + index * 0.2);
      addMesh(
        hut,
        new THREE.CylinderGeometry(0.06, 0.065, 1.96, 8),
        index % 3 === 0 ? bambooLightMaterial : bambooMaterial,
        [x, 1.3, 3.03],
      );
    }
  }

  function addGable(z: number): void {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([
      -17.35, 2.48, z, -10.65, 2.48, z, CENTER_X, 4.16, z,
    ], 3));
    geometry.computeVertexNormals();
    const gableMaterial = bambooMaterial.clone();
    gableMaterial.side = THREE.DoubleSide;
    addMesh(hut, geometry, gableMaterial, [0, 0, 0]);
    for (let index = 0; index < 17; index += 1) {
      const x = -16.95 + index * 0.37;
      const height = Math.max(0.08, 1.58 * (1 - Math.abs(x - CENTER_X) / 3.3));
      box(hut, [0.055, height, 0.045], [x, 2.5 + height / 2, z + 0.025], bambooLightMaterial);
    }
  }
  addGable(3.05);
  addGable(-4.04);

  const roofAngle = 0.41;
  for (const side of [-1, 1]) {
    const roof = box(
      hut,
      [4.12, 0.17, 8.25],
      [CENTER_X + side * 1.84, 3.31, -0.48],
      thatchMaterial,
    );
    roof.rotation.z = -side * roofAngle;
    for (let layer = 0; layer < 7; layer += 1) {
      const strip = box(
        hut,
        [0.58, 0.085, 8.42 + (layer % 2) * 0.08],
        [CENTER_X + side * (0.34 + layer * 0.52), 4.06 - layer * 0.226, -0.48],
        layer % 2 === 0 ? thatchLightMaterial : thatchMaterial,
      );
      strip.rotation.z = -side * roofAngle;
    }
    for (let index = 0; index < 23; index += 1) {
      const z = -4.48 + index * 0.36;
      const fringe = addMesh(
        hut,
        new THREE.ConeGeometry(0.095, 0.46 + (index % 3) * 0.045, 5),
        index % 2 === 0 ? thatchLightMaterial : thatchMaterial,
        [CENTER_X + side * 3.64, 2.37, z],
      );
      fringe.rotation.z = side * 0.2;
    }
  }
  cylinderBetween(
    hut,
    new THREE.Vector3(CENTER_X, 4.19, -4.66),
    new THREE.Vector3(CENTER_X, 4.19, 3.68),
    0.12,
    thatchLightMaterial,
    10,
  );

  const signTextureMaterial = labelMaterial(
    1200,
    300,
    "SAM'S BEACH",
    "HỘI AN, VIETNAM // BROWZR & BREEZE",
    "#174d46",
  );
  box(hut, [4.9, 0.93, 0.13], [CENTER_X, 2.85, 3.29], darkTeakMaterial);
  const hutSign = addMesh(
    hut,
    new THREE.PlaneGeometry(4.64, 0.75),
    signTextureMaterial,
    [CENTER_X, 2.85, 3.365],
  );
  hutSign.castShadow = false;
  for (const x of [-16.5, -11.5]) {
    cylinderBetween(
      hut,
      new THREE.Vector3(x, 2.38, 3.33),
      new THREE.Vector3(x, 3.36, 3.33),
      0.045,
      bambooLightMaterial,
      8,
    );
  }

  const doorMaterial = new THREE.MeshStandardMaterial({
    color: "#c3a05c",
    roughness: 0.77,
    emissive: new THREE.Color("#e5a84b"),
    emissiveIntensity: 0.08,
  });
  const leftDoor = new THREE.Group();
  const rightDoor = new THREE.Group();
  leftDoor.position.set(-15.43, 0.27, 3.17);
  rightDoor.position.set(-12.57, 0.27, 3.17);
  hut.add(leftDoor, rightDoor);

  function populateDoor(door: THREE.Group, direction: number): void {
    const centerX = direction * 0.67;
    box(door, [1.34, 0.09, 0.1], [centerX, 0.06, 0], darkTeakMaterial);
    box(door, [1.34, 0.09, 0.1], [centerX, 2.02, 0], darkTeakMaterial);
    for (const edge of [0.04, 1.3]) {
      box(door, [0.09, 2.04, 0.1], [direction * edge, 1.03, 0], darkTeakMaterial);
    }
    for (let index = 0; index < 8; index += 1) {
      const x = direction * (0.15 + index * 0.148);
      box(door, [0.085, 1.85, 0.065], [x, 1.03, 0], doorMaterial);
    }
    for (const y of [0.45, 1.58]) {
      box(door, [1.22, 0.065, 0.12], [centerX, y, 0.015], bambooDarkMaterial);
    }
    const handle = addMesh(
      door,
      new THREE.TorusGeometry(0.075, 0.015, 7, 16),
      standard("#b58a37", 0.32, 0.65),
      [direction * 1.12, 1.02, 0.105],
    );
    doorHitMeshes.push(handle);
    door.traverse((object) => {
      if (object instanceof THREE.Mesh && !doorHitMeshes.includes(object)) doorHitMeshes.push(object);
    });
  }
  populateDoor(leftDoor, 1);
  populateDoor(rightDoor, -1);

  const eaveRope = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-17.05, 2.55, 3.46),
    new THREE.Vector3(-15.6, 2.33, 3.5),
    new THREE.Vector3(CENTER_X, 2.25, 3.52),
    new THREE.Vector3(-12.4, 2.33, 3.5),
    new THREE.Vector3(-10.95, 2.55, 3.46),
  ]);
  addMesh(hut, new THREE.TubeGeometry(eaveRope, 48, 0.014, 6, false), ropeMaterial, [0, 0, 0]);
  const eaveColors = ["#f3b638", "#ef5b51", "#29bdb2", "#f3b638", "#ef5b51", "#29bdb2", "#f3b638"];
  const eaveLanterns: THREE.Group[] = [];
  eaveColors.forEach((color, index) => {
    const t = (index + 0.5) / eaveColors.length;
    const point = eaveRope.getPoint(t);
    const lantern = createLantern(hut, [point.x, point.y - 0.32, point.z], color, 0.68);
    eaveLanterns.push(lantern.group);
    cylinderBetween(
      hut,
      point,
      new THREE.Vector3(point.x, point.y - 0.17, point.z),
      0.008,
      ropeMaterial,
      5,
    );
  });

  const entranceLantern = createLantern(hut, [CENTER_X, 1.91, 3.48], "#d94238", 1.15);
  const entranceGold = addMesh(
    entranceLantern.group,
    new THREE.TorusGeometry(0.2, 0.024, 8, 24),
    glowingMaterial("#f4bd43"),
    [0, 0, 0.17],
  );
  entranceGold.scale.y = 1.15;
  cylinderBetween(
    hut,
    new THREE.Vector3(CENTER_X, 2.26, 3.48),
    new THREE.Vector3(CENTER_X, 2.52, 3.48),
    0.018,
    ropeMaterial,
    6,
  );
  entranceLantern.group.traverse((object) => {
    if (object instanceof THREE.Mesh) interiorEasterEggHitMeshes.push(object);
  });

  addPointLight("#ffb454", 1.2, 7, [-15.1, 2.1, -0.8]);
  addPointLight("#ff9a54", 1.1, 7, [-12.4, 1.95, -0.4]);
  addPointLight("#ffc76a", 0.78, 4.5, [CENTER_X, 2.0, 3.0]);

  function createPalm(
    x: number,
    z: number,
    height: number,
    leanX: number,
    leanZ: number,
    phase: number,
  ): void {
    const palm = new THREE.Group();
    palm.position.set(x, 0, z);
    group.add(palm);
    const pointAt = (t: number) => new THREE.Vector3(
      leanX * t * t,
      height * t,
      leanZ * t * t,
    );
    const segments = 12;
    for (let index = 0; index < segments; index += 1) {
      const start = pointAt(index / segments);
      const end = pointAt((index + 1) / segments);
      cylinderBetween(
        palm,
        start,
        end,
        0.17 - index * 0.005,
        index % 2 === 0 ? trunkMaterial : trunkLightMaterial,
        11,
      );
      const ringStart = pointAt((index + 0.88) / segments);
      const ringEnd = pointAt((index + 0.96) / segments);
      cylinderBetween(palm, ringStart, ringEnd, 0.181 - index * 0.005, trunkMaterial, 11);
    }
    const crown = new THREE.Group();
    crown.position.copy(pointAt(1));
    palm.add(crown);
    const fronds: THREE.Group[] = [];
    for (let index = 0; index < 10; index += 1) {
      const angle = (index / 10) * Math.PI * 2 + phase * 0.15;
      const length = 1.65 + (index % 3) * 0.17;
      const frond = createPalmFrond(length, 0.62 + (index % 2) * 0.16, index % 2 === 0 ? leafMaterial : leafLightMaterial);
      frond.rotation.y = angle;
      frond.rotation.z = 0.1 - (index % 3) * 0.035;
      frond.userData.baseZ = frond.rotation.z;
      crown.add(frond);
      fronds.push(frond);
    }
    for (let index = 0; index < 4; index += 1) {
      const angle = index * 2.1 + phase;
      const coconut = addMesh(
        crown,
        new THREE.SphereGeometry(0.14, 12, 9),
        standard(index % 2 === 0 ? "#6e7132" : "#81733b", 0.9),
        [Math.cos(angle) * 0.2, -0.2 - (index % 2) * 0.09, Math.sin(angle) * 0.2],
      );
      coconut.scale.set(0.9, 1.12, 0.9);
    }
    palms.push({ crown, fronds, phase });
  }

  function createPalmFrond(
    length: number,
    droop: number,
    material: THREE.Material,
  ): THREE.Group {
    const frond = new THREE.Group();
    const segments = 14;
    const positions: number[] = [];
    const indices: number[] = [];
    const spinePoints: THREE.Vector3[] = [];
    for (let index = 0; index <= segments; index += 1) {
      const t = index / segments;
      const x = length * t;
      const y = Math.sin(t * Math.PI) * 0.17 - droop * t * t;
      const width = Math.sin(t * Math.PI) * 0.27 * (index % 2 === 0 ? 1 : 0.83) + 0.008;
      positions.push(x, y, -width, x, y, width);
      spinePoints.push(new THREE.Vector3(x, y + 0.008, 0));
      if (index < segments) {
        const offset = index * 2;
        indices.push(offset, offset + 2, offset + 1, offset + 2, offset + 3, offset + 1);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const frondMaterial = material.clone();
    frondMaterial.side = THREE.DoubleSide;
    addMesh(frond, geometry, frondMaterial, [0, 0, 0]);
    const spine = new THREE.CatmullRomCurve3(spinePoints);
    addMesh(frond, new THREE.TubeGeometry(spine, 20, 0.012, 5, false), bambooDarkMaterial, [0, 0, 0]);
    return frond;
  }

  createPalm(-19.25, 5.25, 4.8, 0.8, -0.35, 0.3);
  createPalm(-8.85, 5.65, 5.25, -0.85, -0.4, 1.8);
  createPalm(-19.05, -3.6, 5.5, 0.9, 0.3, 3.2);
  createPalm(-8.95, -3.25, 4.65, -0.7, 0.45, 4.6);

  const hammock = new THREE.Group();
  hammock.position.set(-18.6, 0, 3.2);
  group.add(hammock);
  for (const side of [-1, 1]) {
    addMesh(hammock, new THREE.CylinderGeometry(0.085, 0.12, 1.65, 10), darkTeakMaterial, [side * 1.38, 0.78, 0]);
    addMesh(hammock, new THREE.SphereGeometry(0.115, 10, 8), lightTeakMaterial, [side * 1.38, 1.62, 0]);
  }
  const hammockTexture = makeCanvasTexture(512, 128, (context, canvas) => {
    const colors = ["#f7ddaa", "#e66d59", "#f7ddaa", "#29a9a1"];
    const stripeWidth = canvas.width / 16;
    for (let index = 0; index < 16; index += 1) {
      context.fillStyle = colors[index % colors.length];
      context.fillRect(index * stripeWidth, 0, stripeWidth + 1, canvas.height);
    }
    context.strokeStyle = "rgba(91,60,35,0.22)";
    context.lineWidth = 1;
    for (let y = 3; y < canvas.height; y += 5) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }
  });
  hammockTexture.wrapS = THREE.RepeatWrapping;
  const hammockMaterial = new THREE.MeshStandardMaterial({
    map: hammockTexture,
    roughness: 0.94,
    side: THREE.DoubleSide,
  });
  const hammockPositions: number[] = [];
  const hammockUvs: number[] = [];
  const hammockIndices: number[] = [];
  const lengthSegments = 28;
  const widthSegments = 4;
  for (let xIndex = 0; xIndex <= lengthSegments; xIndex += 1) {
    const u = xIndex / lengthSegments;
    const x = (u - 0.5) * 2.18;
    const sag = 1.12 - Math.sin(u * Math.PI) * 0.48;
    for (let zIndex = 0; zIndex <= widthSegments; zIndex += 1) {
      const v = zIndex / widthSegments;
      const z = (v - 0.5) * 0.72 * Math.sin(Math.max(0.08, u) * Math.PI) * Math.sin(Math.max(0.08, 1 - u) * Math.PI + 0.3);
      hammockPositions.push(x, sag - Math.abs(v - 0.5) * 0.07, z);
      hammockUvs.push(u, v);
      if (xIndex < lengthSegments && zIndex < widthSegments) {
        const offset = xIndex * (widthSegments + 1) + zIndex;
        hammockIndices.push(offset, offset + widthSegments + 1, offset + 1, offset + widthSegments + 1, offset + widthSegments + 2, offset + 1);
      }
    }
  }
  const hammockGeometry = new THREE.BufferGeometry();
  hammockGeometry.setAttribute("position", new THREE.Float32BufferAttribute(hammockPositions, 3));
  hammockGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(hammockUvs, 2));
  hammockGeometry.setIndex(hammockIndices);
  hammockGeometry.computeVertexNormals();
  addMesh(hammock, hammockGeometry, hammockMaterial, [0, 0, 0]);
  for (const side of [-1, 1]) {
    for (const z of [-0.22, 0.22]) {
      cylinderBetween(
        hammock,
        new THREE.Vector3(side * 1.38, 1.47, 0),
        new THREE.Vector3(side * 1.08, 1.12, z),
        0.016,
        ropeMaterial,
        6,
      );
    }
  }

  const driftwood = new THREE.Group();
  driftwood.position.set(-18.7, 0.14, 5.05);
  driftwood.rotation.y = -0.35;
  group.add(driftwood);
  const log = addMesh(driftwood, new THREE.CylinderGeometry(0.18, 0.23, 2.15, 11), trunkLightMaterial, [0, 0, 0]);
  log.rotation.z = Math.PI / 2;
  cylinderBetween(driftwood, new THREE.Vector3(-0.45, 0.04, 0), new THREE.Vector3(-0.75, 0.38, 0.28), 0.065, trunkMaterial, 8);
  cylinderBetween(driftwood, new THREE.Vector3(0.55, 0.03, 0), new THREE.Vector3(0.82, 0.25, -0.3), 0.05, trunkMaterial, 8);

  const umbrella = new THREE.Group();
  umbrella.position.set(-18.75, 0, 6.45);
  umbrella.rotation.z = -0.09;
  group.add(umbrella);
  addMesh(umbrella, new THREE.CylinderGeometry(0.035, 0.045, 2.15, 10), bambooLightMaterial, [0, 1.02, 0]);
  const canopy = addMesh(umbrella, new THREE.ConeGeometry(1.08, 0.43, 12, 1, true), coralMaterial, [0, 2.02, 0]);
  canopy.material = new THREE.MeshStandardMaterial({ color: "#ed7a62", roughness: 0.9, side: THREE.DoubleSide });
  for (let index = 0; index < 12; index += 1) {
    const angle = (index / 12) * Math.PI * 2;
    cylinderBetween(
      umbrella,
      new THREE.Vector3(0, 2.22, 0),
      new THREE.Vector3(Math.cos(angle) * 1.04, 1.81, Math.sin(angle) * 1.04),
      0.012,
      creamMaterial,
      5,
    );
  }
  addMesh(umbrella, new THREE.SphereGeometry(0.07, 10, 8), creamMaterial, [0, 2.27, 0]);

  const signpost = new THREE.Group();
  signpost.position.set(-9.25, 0, 6.5);
  signpost.rotation.y = -0.15;
  group.add(signpost);
  box(signpost, [0.13, 1.75, 0.13], [0, 0.82, 0], darkTeakMaterial);
  box(signpost, [2.75, 0.52, 0.12], [0, 1.48, 0], lightTeakMaterial);
  const directionSign = addMesh(
    signpost,
    new THREE.PlaneGeometry(2.62, 0.42),
    labelMaterial(1024, 192, "SAM'S BEACH · HỘI AN →", "", "#78512f", "#fff0bf"),
    [0, 1.48, 0.066],
  );
  directionSign.castShadow = false;

  const shellMaterial = standard("#f4d8b5", 0.9);
  const stoneMaterial = standard("#9c9b86", 0.96);
  const shellPositions: Array<[number, number, number]> = [
    [-19.6, 6.8, 0.1], [-17.2, 6.4, -0.2], [-10.0, 5.25, 0.4], [-8.35, 3.9, -0.3],
    [-19.7, 1.0, 0.5], [-11.0, 7.05, -0.5], [-16.7, 4.4, 0.2], [-9.0, 0.8, 0.1],
  ];
  shellPositions.forEach(([x, z, rotation], index) => {
    const shell = addMesh(
      group,
      index % 2 === 0 ? new THREE.SphereGeometry(0.085, 10, 6) : new THREE.DodecahedronGeometry(0.1, 0),
      index % 2 === 0 ? shellMaterial : stoneMaterial,
      [x, 0.055, z],
    );
    shell.scale.set(1.35, 0.42, 0.85);
    shell.rotation.y = rotation;
  });

  const surfboard = new THREE.Group();
  surfboard.position.set(-11.1, 0, 4.4);
  surfboard.rotation.z = -0.1;
  group.add(surfboard);
  const boardShape = new THREE.Shape();
  boardShape.moveTo(0, 1.24);
  boardShape.bezierCurveTo(0.32, 1.05, 0.39, 0.65, 0.37, 0);
  boardShape.bezierCurveTo(0.36, -0.72, 0.25, -1.12, 0, -1.22);
  boardShape.bezierCurveTo(-0.25, -1.12, -0.36, -0.72, -0.37, 0);
  boardShape.bezierCurveTo(-0.39, 0.65, -0.32, 1.05, 0, 1.24);
  const boardGeometry = new THREE.ExtrudeGeometry(boardShape, {
    depth: 0.085,
    bevelEnabled: true,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    bevelSegments: 2,
    curveSegments: 20,
  });
  addMesh(surfboard, boardGeometry, tealMaterial, [0, 1.24, 0]);
  for (const [y, width] of [[0.72, 0.55], [0.53, 0.64], [-0.55, 0.59]] as Array<[number, number]>) {
    box(surfboard, [width, 0.14, 0.025], [0, 1.24 + y, 0.135], coralMaterial);
  }
  box(surfboard, [0.055, 2.18, 0.025], [0, 1.25, 0.137], creamMaterial);
  const fin = box(surfboard, [0.055, 0.28, 0.3], [0, 0.24, -0.12], coralMaterial);
  fin.rotation.x = -0.28;
  surfboard.traverse((object) => {
    if (object instanceof THREE.Mesh) exteriorEasterEggHitMeshes.push(object);
  });

  function collectMeshes(target: THREE.Object3D): THREE.Object3D[] {
    const meshes: THREE.Object3D[] = [];
    target.traverse((object) => {
      if (object instanceof THREE.Mesh) meshes.push(object);
    });
    return meshes;
  }

  function createStationHandle(
    station: GarageStation,
    stationGroup: THREE.Group,
    accentMaterial: THREE.MeshStandardMaterial,
    ring: THREE.Mesh,
    updateStation: (elapsed: number, dt: number) => void = () => undefined,
  ): void {
    let hovered = false;
    let selected = false;
    ring.visible = false;
    handles.set(station.id, {
      id: station.id,
      group: stationGroup,
      hitMeshes: collectMeshes(stationGroup),
      setHovered: (value) => {
        hovered = value;
        ring.visible = hovered || selected;
        accentMaterial.emissiveIntensity = hovered ? 1.25 : selected ? 0.85 : 0.38;
      },
      setSelected: (value) => {
        selected = value;
        ring.visible = hovered || selected;
        accentMaterial.emissiveIntensity = hovered ? 1.25 : selected ? 0.85 : 0.38;
      },
      update: updateStation,
    });
  }

  function stationRing(parent: THREE.Group, color: THREE.ColorRepresentation): THREE.Mesh {
    const ring = addMesh(
      parent,
      new THREE.TorusGeometry(0.78, 0.025, 8, 48),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.82, depthWrite: false }),
      [0, -0.91, 0],
    );
    ring.rotation.x = Math.PI / 2;
    ring.castShadow = false;
    return ring;
  }

  function buildBrowzrStation(station: GarageStation): void {
    const stationGroup = new THREE.Group();
    stationGroup.name = station.id;
    stationGroup.position.set(...station.anchorPosition);
    group.add(stationGroup);
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: station.accentHex,
      emissive: new THREE.Color(station.accentHex),
      emissiveIntensity: 0.38,
      roughness: 0.48,
    });
    box(stationGroup, [2.35, 0.14, 1.05], [0, -0.08, 0], teakMaterial);
    for (const x of [-0.98, 0.98]) {
      for (const z of [-0.36, 0.36]) {
        box(stationGroup, [0.11, 0.82, 0.11], [x, -0.52, z], darkTeakMaterial);
      }
    }
    box(stationGroup, [2.4, 0.035, 0.045], [0, -0.005, 0.51], accentMaterial);

    const laptop = new THREE.Group();
    laptop.position.set(-0.22, 0.015, -0.08);
    stationGroup.add(laptop);
    box(laptop, [1.16, 0.055, 0.72], [0, 0.035, 0.12], silverMaterial);
    const keyboardMaterial = standard("#465155", 0.42, 0.35);
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 10; column += 1) {
        box(laptop, [0.075, 0.012, 0.055], [-0.43 + column * 0.095, 0.07, -0.05 + row * 0.075], keyboardMaterial);
      }
    }
    box(laptop, [0.34, 0.009, 0.16], [0, 0.07, 0.34], standard("#aeb9bb", 0.35, 0.5));
    const screen = new THREE.Group();
    screen.position.set(0, 0.065, -0.22);
    screen.rotation.x = -0.12;
    laptop.add(screen);
    box(screen, [1.18, 0.75, 0.055], [0, 0.37, 0], silverMaterial);
    box(screen, [1.1, 0.67, 0.025], [0, 0.38, 0.035], blackMaterial);
    const screenTexture = makeCanvasTexture(768, 512, (context, canvas) => {
      const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#071f2c");
      gradient.addColorStop(1, "#075b60");
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#2dd4bf";
      context.fillRect(0, 0, canvas.width, 62);
      context.fillStyle = "#082d35";
      context.font = "700 30px sans-serif";
      context.textAlign = "left";
      context.fillText("BROWZR", 34, 42);
      context.fillStyle = "rgba(255,255,255,0.11)";
      for (let index = 0; index < 6; index += 1) {
        context.fillRect(38 + (index % 3) * 238, 302 + Math.floor(index / 3) * 78, 210, 56);
      }
      context.textAlign = "center";
      context.fillStyle = "#f4f0d8";
      context.font = "700 61px sans-serif";
      context.fillText("BROWZR", canvas.width / 2, 159);
      context.fillStyle = "#76f4de";
      context.font = "600 25px sans-serif";
      context.fillText("// DISCOVER BEYOND ALGORITHMS", canvas.width / 2, 211);
      context.strokeStyle = "rgba(118,244,222,0.7)";
      context.lineWidth = 3;
      context.beginPath();
      context.arc(canvas.width / 2, 258, 18, 0, Math.PI * 2);
      context.stroke();
    });
    const screenMaterial = new THREE.MeshStandardMaterial({
      map: screenTexture,
      emissiveMap: screenTexture,
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: 0.48,
      roughness: 0.35,
    });
    const display = addMesh(screen, new THREE.PlaneGeometry(1.055, 0.615), screenMaterial, [0, 0.39, 0.051]);
    display.castShadow = false;
    addMesh(screen, new THREE.SphereGeometry(0.012, 8, 6), blackMaterial, [0, 0.723, 0.035]);

    const phone = new THREE.Group();
    phone.position.set(0.69, 0.03, -0.12);
    phone.rotation.x = -0.15;
    phone.rotation.z = -0.06;
    stationGroup.add(phone);
    box(phone, [0.29, 0.53, 0.035], [0, 0.27, 0], blackMaterial);
    const phoneScreenMaterial = new THREE.MeshStandardMaterial({
      color: "#1e4b4f",
      emissive: "#2dd4bf",
      emissiveIntensity: 0.28,
      roughness: 0.45,
    });
    const phoneScreen = addMesh(phone, new THREE.PlaneGeometry(0.25, 0.45), phoneScreenMaterial, [0, 0.28, 0.02]);
    phoneScreen.castShadow = false;
    box(phone, [0.38, 0.035, 0.3], [0, 0.015, -0.03], silverMaterial);

    const coffee = new THREE.Group();
    coffee.position.set(-0.94, 0.02, 0.14);
    stationGroup.add(coffee);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: "#e9ffff",
      roughness: 0.08,
      metalness: 0,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    addMesh(coffee, new THREE.CylinderGeometry(0.13, 0.105, 0.48, 24, 1, true), glassMaterial, [0, 0.25, 0]);
    addMesh(coffee, new THREE.CylinderGeometry(0.105, 0.105, 0.025, 24), glassMaterial, [0, 0.018, 0]);
    addMesh(coffee, new THREE.CylinderGeometry(0.106, 0.102, 0.075, 24), creamMaterial, [0, 0.072, 0]);
    addMesh(coffee, new THREE.CylinderGeometry(0.117, 0.105, 0.26, 24), standard("#5b2d18", 0.38), [0, 0.225, 0]);
    addMesh(coffee, new THREE.CylinderGeometry(0.124, 0.117, 0.055, 24), standard("#b98354", 0.48), [0, 0.375, 0]);
    const iceMaterial = new THREE.MeshPhysicalMaterial({
      color: "#dff8ef",
      transparent: true,
      opacity: 0.65,
      roughness: 0.15,
      depthWrite: false,
    });
    for (let index = 0; index < 5; index += 1) {
      const ice = box(coffee, [0.09, 0.075, 0.075], [
        Math.cos(index * 2.3) * 0.055,
        0.36 + (index % 2) * 0.065,
        Math.sin(index * 2.3) * 0.05,
      ], iceMaterial);
      ice.rotation.set(index * 0.2, index * 0.45, index * 0.15);
    }
    cylinderBetween(coffee, new THREE.Vector3(0.035, 0.17, 0), new THREE.Vector3(0.095, 0.69, 0.015), 0.012, coralMaterial, 8);
    addMesh(coffee, new THREE.TorusGeometry(0.127, 0.012, 8, 24), glassMaterial, [0, 0.49, 0]).rotation.x = Math.PI / 2;

    const ring = stationRing(stationGroup, station.accentHex);
    createStationHandle(station, stationGroup, accentMaterial, ring);
  }

  function buildVietnamStation(station: GarageStation): void {
    const stationGroup = new THREE.Group();
    stationGroup.name = station.id;
    stationGroup.position.set(...station.anchorPosition);
    group.add(stationGroup);
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: station.accentHex,
      emissive: new THREE.Color(station.accentHex),
      emissiveIntensity: 0.38,
      roughness: 0.48,
    });
    box(stationGroup, [2.35, 0.15, 1.12], [0, -0.075, 0], teakMaterial);
    for (let index = 0; index < 14; index += 1) {
      addMesh(
        stationGroup,
        new THREE.CylinderGeometry(0.052, 0.058, 0.82, 8),
        index % 3 === 0 ? bambooLightMaterial : bambooMaterial,
        [-1.07 + index * 0.165, -0.53, 0.46],
      );
    }
    box(stationGroup, [2.38, 0.04, 0.05], [0, -0.005, 0.54], accentMaterial);

    const pho = new THREE.Group();
    pho.position.set(-0.27, 0.02, 0.12);
    stationGroup.add(pho);
    const ceramicMaterial = standard("#e8e0cc", 0.32);
    const bowl = addMesh(
      pho,
      new THREE.SphereGeometry(0.34, 28, 16, 0, Math.PI * 2, Math.PI * 0.48, Math.PI * 0.48),
      ceramicMaterial,
      [0, 0.19, 0],
    );
    bowl.scale.y = 0.65;
    const bowlRim = addMesh(pho, new THREE.TorusGeometry(0.337, 0.025, 9, 32), ceramicMaterial, [0, 0.205, 0]);
    bowlRim.rotation.x = Math.PI / 2;
    const broth = addMesh(pho, new THREE.CircleGeometry(0.31, 32), standard("#a86b2c", 0.28), [0, 0.211, 0]);
    broth.rotation.x = -Math.PI / 2;
    const noodleMaterial = standard("#f0ddae", 0.65);
    for (let index = 0; index < 7; index += 1) {
      const noodle = addMesh(pho, new THREE.TorusGeometry(0.1 + index * 0.018, 0.009, 5, 24, Math.PI * 1.45), noodleMaterial, [0, 0.22 + index * 0.001, 0]);
      noodle.rotation.set(Math.PI / 2, 0, index * 0.72);
    }
    for (let index = 0; index < 5; index += 1) {
      const herb = addMesh(pho, new THREE.SphereGeometry(0.035, 8, 5), leafLightMaterial, [Math.cos(index * 2.1) * 0.17, 0.235, Math.sin(index * 2.1) * 0.15]);
      herb.scale.set(1.5, 0.18, 0.75);
      herb.rotation.y = index;
    }
    for (const offset of [-0.035, 0.035]) {
      cylinderBetween(pho, new THREE.Vector3(-0.42 + offset, 0.34, -0.28), new THREE.Vector3(0.39 + offset, 0.31, 0.25), 0.012, darkTeakMaterial, 7);
    }
    for (const side of [-1, 1]) {
      const lime = addMesh(
        pho,
        new THREE.SphereGeometry(0.105, 12, 8, 0, Math.PI, 0, Math.PI / 2),
        standard("#8dbb3e", 0.7),
        [side * 0.43, 0.09, 0.26],
      );
      lime.rotation.set(Math.PI / 2, side * 0.4, 0);
      const limeFlesh = addMesh(pho, new THREE.CircleGeometry(0.085, 12, 0, Math.PI), standard("#d4df72", 0.65), [side * 0.43, 0.14, 0.26]);
      limeFlesh.rotation.x = -Math.PI / 2;
    }

    for (let index = 0; index < 5; index += 1) {
      const x = (index - 2) * 0.055;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, 0, 0),
        new THREE.Vector3(x + 0.04, 0.12, 0.01),
        new THREE.Vector3(x - 0.035, 0.25, -0.01),
        new THREE.Vector3(x + 0.03, 0.4, 0),
      ]);
      const steamMaterial = new THREE.MeshBasicMaterial({
        color: "#fff4dd",
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      });
      const wisp = addMesh(pho, new THREE.TubeGeometry(curve, 16, 0.009, 5, false), steamMaterial, [0, 0.25, 0]);
      wisp.castShadow = false;
      steamWisps.push({ mesh: wisp, baseY: 0.25, phase: index * 1.37 });
    }

    const tabletopLantern = createLantern(stationGroup, [0.79, 0.34, -0.18], "#f4b936", 0.68);
    cylinderBetween(stationGroup, new THREE.Vector3(0.79, 0.02, -0.18), new THREE.Vector3(0.79, 0.17, -0.18), 0.035, bambooDarkMaterial, 8);
    tabletopLantern.group.rotation.z = 0.03;

    const postcard = new THREE.Group();
    postcard.position.set(0.45, 0.05, -0.42);
    postcard.rotation.x = -0.12;
    postcard.rotation.y = -0.12;
    stationGroup.add(postcard);
    box(postcard, [0.93, 0.64, 0.055], [0, 0.32, 0], darkTeakMaterial);
    const postcardTexture = makeCanvasTexture(640, 420, (context, canvas) => {
      context.fillStyle = "#f2d6a0";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#69b9b3";
      context.fillRect(18, 18, canvas.width - 36, 218);
      context.fillStyle = "#efd18a";
      context.beginPath();
      context.moveTo(18, 190);
      context.quadraticCurveTo(280, 105, 622, 199);
      context.lineTo(622, 236);
      context.lineTo(18, 236);
      context.fill();
      context.fillStyle = "#e36d4f";
      context.beginPath();
      context.arc(505, 75, 38, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#285e53";
      context.lineWidth = 9;
      context.beginPath();
      context.moveTo(145, 196);
      context.quadraticCurveTo(148, 112, 190, 61);
      context.stroke();
      for (let index = 0; index < 6; index += 1) {
        const angle = (index / 6) * Math.PI * 2;
        context.beginPath();
        context.moveTo(188, 65);
        context.quadraticCurveTo(188 + Math.cos(angle) * 48, 55 + Math.sin(angle) * 26, 188 + Math.cos(angle) * 72, 66 + Math.sin(angle) * 42);
        context.stroke();
      }
      context.textAlign = "center";
      context.fillStyle = "#174d46";
      context.font = "700 45px serif";
      context.fillText("HỘI AN", canvas.width / 2, 299);
      context.font = "600 24px sans-serif";
      context.fillText("// MOVING TO VIETNAM", canvas.width / 2, 351);
      context.strokeStyle = "#b78a55";
      context.lineWidth = 4;
      context.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
    });
    const postcardFace = addMesh(
      postcard,
      new THREE.PlaneGeometry(0.84, 0.55),
      new THREE.MeshStandardMaterial({ map: postcardTexture, roughness: 0.8 }),
      [0, 0.32, 0.031],
    );
    postcardFace.castShadow = false;

    const ring = stationRing(stationGroup, station.accentHex);
    createStationHandle(station, stationGroup, accentMaterial, ring);
  }

  for (const station of stations) {
    if (station.id === "sam-browzr") buildBrowzrStation(station);
    if (station.id === "sam-vietnam") buildVietnamStation(station);
  }

  const gamesTable = new THREE.Group();
  gamesTable.name = "beach-games-table";
  gamesTable.position.set(CENTER_X - 0.15, 0.25, 0.65);
  hut.add(gamesTable);
  const tableSurfaceY = 0.53;
  box(gamesTable, [1.38, 0.07, 0.82], [0, 0.495, 0], teakMaterial);
  box(gamesTable, [1.4, 0.035, 0.045], [0, 0.485, 0.405], bambooDarkMaterial);
  box(gamesTable, [1.4, 0.035, 0.045], [0, 0.485, -0.405], bambooDarkMaterial);
  for (const xSide of [-1, 1]) {
    for (const zSide of [-1, 1]) {
      cylinderBetween(
        gamesTable,
        new THREE.Vector3(xSide * 0.59, 0.015, zSide * 0.32),
        new THREE.Vector3(xSide * 0.5, 0.47, zSide * 0.27),
        0.038,
        bambooMaterial,
        9,
      );
    }
  }
  box(gamesTable, [1.13, 0.035, 0.59], [0, 0.15, 0], darkTeakMaterial);
  for (let index = 0; index < 8; index += 1) {
    box(gamesTable, [1.08, 0.025, 0.038], [0, 0.18, -0.25 + index * 0.071], bambooLightMaterial);
  }
  for (const x of [-0.55, 0.55]) {
    box(gamesTable, [0.04, 0.04, 0.61], [x, 0.17, 0], bambooMaterial);
  }

  const cushionTexture = makeCanvasTexture(256, 256, (context, canvas) => {
    context.fillStyle = "#e8d7b7";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(83,58,37,0.32)";
    context.lineWidth = 3;
    for (let offset = 0; offset < canvas.width; offset += 12) {
      context.beginPath();
      context.moveTo(offset, 0);
      context.lineTo(offset, canvas.height);
      context.stroke();
      context.beginPath();
      context.moveTo(0, offset);
      context.lineTo(canvas.width, offset);
      context.stroke();
    }
  });
  const cushionMaterials = ["#d97b62", "#299c91"].map((color) => new THREE.MeshStandardMaterial({
    color,
    map: cushionTexture,
    roughness: 0.96,
  }));
  [-1, 1].forEach((side, index) => {
    const cushion = addMesh(
      gamesTable,
      new THREE.CylinderGeometry(0.25, 0.27, 0.105, 20),
      cushionMaterials[index],
      [side * 0.96, 0.055, 0.08 - index * 0.16],
    );
    cushion.rotation.y = side * 0.16;
    const piping = addMesh(
      gamesTable,
      new THREE.TorusGeometry(0.247, 0.012, 6, 28),
      ropeMaterial,
      [side * 0.96, 0.105, 0.08 - index * 0.16],
    );
    piping.rotation.x = Math.PI / 2;
  });

  const mattePaperMaterial = new THREE.MeshStandardMaterial({
    color: "#d6cebe",
    roughness: 0.85,
    metalness: 0,
  });
  const farkleTray = new THREE.Group();
  farkleTray.position.set(-0.36, tableSurfaceY, -0.1);
  gamesTable.add(farkleTray);
  box(farkleTray, [0.42, 0.05, 0.32], [0, 0.025, 0], darkTeakMaterial);
  box(farkleTray, [0.365, 0.007, 0.265], [0, 0.053, 0], standard("#075a43", 0.98));
  for (const z of [-0.149, 0.149]) {
    box(farkleTray, [0.42, 0.04, 0.022], [0, 0.065, z], darkTeakMaterial);
  }
  for (const x of [-0.199, 0.199]) {
    box(farkleTray, [0.022, 0.04, 0.276], [x, 0.065, 0], darkTeakMaterial);
  }

  const pipLayouts: Record<number, Array<[number, number]>> = {
    1: [[0.5, 0.5]],
    2: [[0.28, 0.28], [0.72, 0.72]],
    3: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
    4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
    5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
    6: [[0.28, 0.25], [0.28, 0.5], [0.28, 0.75], [0.72, 0.25], [0.72, 0.5], [0.72, 0.75]],
  };
  const diceMaterials = [3, 4, 5, 2, 1, 6].map((pipCount) => {
    const texture = makeCanvasTexture(128, 128, (context, canvas) => {
      context.fillStyle = "#dcd5c5";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = "#d8c9aa";
      context.lineWidth = 5;
      context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
      context.fillStyle = "#213337";
      pipLayouts[pipCount].forEach(([x, y]) => {
        context.beginPath();
        context.arc(x * canvas.width, y * canvas.height, 10, 0, Math.PI * 2);
        context.fill();
      });
    });
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85, metalness: 0 });
  });
  const dicePlacements: Array<[number, number, number, number, number, number]> = [
    [-0.49, 0.608, -0.15, 0.05, 0.35, -0.06],
    [-0.35, 0.608, -0.17, -0.07, 1.1, 0.05],
    [-0.23, 0.608, -0.1, 0.08, 2.0, 0.04],
    [-0.45, 0.608, -0.01, -0.04, 2.7, 0.08],
    [-0.29, 0.608, 0.01, 0.06, 0.7, -0.05],
    [-0.1, tableSurfaceY + 0.027, 0.015, 0.04, 1.8, 0.08],
  ];
  dicePlacements.forEach(([x, y, z, rx, ry, rz]) => {
    const die = addMesh(gamesTable, new THREE.BoxGeometry(0.052, 0.052, 0.052), diceMaterials, [x, y, z]);
    die.rotation.set(rx, ry, rz);
  });

  const scorePad = new THREE.Group();
  scorePad.position.set(-0.43, tableSurfaceY + 0.012, 0.27);
  scorePad.rotation.y = -0.13;
  gamesTable.add(scorePad);
  box(scorePad, [0.25, 0.012, 0.16], [0, 0, 0], mattePaperMaterial);
  const scoreTexture = makeCanvasTexture(400, 256, (context, canvas) => {
    context.fillStyle = "#dcd5c5";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#174d46";
    context.font = "700 39px sans-serif";
    context.textAlign = "center";
    context.fillText("FARKLE", canvas.width / 2, 46);
    context.strokeStyle = "#79a99b";
    context.lineWidth = 3;
    for (const x of [24, 142, 258, 376]) {
      context.beginPath();
      context.moveTo(x, 67);
      context.lineTo(x, 236);
      context.stroke();
    }
    for (const y of [67, 108, 149, 190, 231]) {
      context.beginPath();
      context.moveTo(24, y);
      context.lineTo(376, y);
      context.stroke();
    }
    context.strokeStyle = "#375c65";
    context.lineWidth = 4;
    for (const [x, y] of [[61, 88], [178, 127], [295, 88], [98, 171]]) {
      context.beginPath();
      context.moveTo(x - 10, y - 12);
      context.lineTo(x + 10, y + 12);
      context.moveTo(x + 10, y - 12);
      context.lineTo(x - 10, y + 12);
      context.stroke();
    }
  });
  const scoreFace = addMesh(
    scorePad,
    new THREE.PlaneGeometry(0.238, 0.148),
    new THREE.MeshStandardMaterial({ map: scoreTexture, roughness: 0.85, metalness: 0 }),
    [0, 0.007, 0],
  );
  scoreFace.rotation.x = -Math.PI / 2;
  scoreFace.castShadow = false;
  cylinderBetween(
    gamesTable,
    new THREE.Vector3(-0.235, tableSurfaceY + 0.018, 0.2),
    new THREE.Vector3(-0.235, tableSurfaceY + 0.018, 0.345),
    0.009,
    standard("#e9b936", 0.58),
    8,
  );

  function playingCardMaterial(rank: string, suit: string): THREE.MeshStandardMaterial {
    const texture = makeCanvasTexture(256, 368, (context, canvas) => {
      const suitColor = suit === "♥" || suit === "♦" ? "#c73c42" : "#172b34";
      context.fillStyle = "#dcd5c5";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = "#d8cfba";
      context.lineWidth = 5;
      context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
      context.fillStyle = suitColor;
      context.textAlign = "center";
      context.font = "700 50px serif";
      context.fillText(rank, 37, 57);
      context.font = "42px serif";
      context.fillText(suit, 37, 101);
      context.save();
      context.translate(canvas.width - 37, canvas.height - 45);
      context.rotate(Math.PI);
      context.font = "700 50px serif";
      context.fillText(rank, 0, 0);
      context.font = "42px serif";
      context.fillText(suit, 0, 45);
      context.restore();
      context.font = "142px serif";
      context.fillText(suit, canvas.width / 2, canvas.height * 0.64);
    });
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85, metalness: 0 });
  }

  function playingCard(rank: string, suit: string): THREE.Group {
    const card = new THREE.Group();
    box(card, [0.11, 0.006, 0.16], [0, 0, 0], mattePaperMaterial);
    const face = addMesh(card, new THREE.PlaneGeometry(0.104, 0.152), playingCardMaterial(rank, suit), [0, 0.0035, 0]);
    face.rotation.x = -Math.PI / 2;
    face.castShadow = false;
    return card;
  }

  const cardBackTexture = makeCanvasTexture(256, 368, (context, canvas) => {
    context.fillStyle = "#d6cebe";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#b83342";
    context.fillRect(15, 15, canvas.width - 30, canvas.height - 30);
    context.strokeStyle = "rgba(255,235,205,0.7)";
    context.lineWidth = 3;
    for (let offset = -canvas.height; offset < canvas.width + canvas.height; offset += 24) {
      context.beginPath();
      context.moveTo(offset, 15);
      context.lineTo(offset - canvas.height, canvas.height - 15);
      context.stroke();
      context.beginPath();
      context.moveTo(offset, 15);
      context.lineTo(offset + canvas.height, canvas.height - 15);
      context.stroke();
    }
    context.strokeStyle = "#fff0d0";
    context.lineWidth = 8;
    context.strokeRect(26, 26, canvas.width - 52, canvas.height - 52);
  });
  const drawDeck = new THREE.Group();
  drawDeck.position.set(0.49, tableSurfaceY + 0.023, -0.21);
  drawDeck.rotation.y = 0.08;
  gamesTable.add(drawDeck);
  box(drawDeck, [0.11, 0.045, 0.16], [0, 0, 0], mattePaperMaterial);
  const deckBack = addMesh(
    drawDeck,
    new THREE.PlaneGeometry(0.104, 0.152),
    new THREE.MeshStandardMaterial({ map: cardBackTexture, roughness: 0.85, metalness: 0 }),
    [0, 0.023, 0],
  );
  deckBack.rotation.x = -Math.PI / 2;
  deckBack.castShadow = false;
  const discard = playingCard("K", "♥");
  discard.position.set(0.3, tableSurfaceY + 0.008, -0.15);
  discard.rotation.y = -0.19;
  gamesTable.add(discard);

  const ginHand = [["7", "♥"], ["8", "♥"], ["9", "♥"], ["Q", "♠"], ["Q", "♦"], ["Q", "♣"], ["A", "♠"]];
  ginHand.forEach(([rank, suit], index) => {
    const card = playingCard(rank, suit);
    card.position.set(0.015 + index * 0.081, tableSurfaceY + 0.006 + index * 0.0008, 0.18 + Math.abs(index - 3) * 0.008);
    card.rotation.y = (index - 3) * 0.13;
    gamesTable.add(card);
  });

  const ginSlip = new THREE.Group();
  ginSlip.position.set(0.16, tableSurfaceY + 0.009, -0.275);
  ginSlip.rotation.y = 0.08;
  gamesTable.add(ginSlip);
  box(ginSlip, [0.24, 0.009, 0.11], [0, 0, 0], tealMaterial);
  const ginSlipTexture = makeCanvasTexture(420, 190, (context, canvas) => {
    context.fillStyle = "#d6cebe";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#c8554f";
    context.lineWidth = 8;
    context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    context.fillStyle = "#174d46";
    context.textAlign = "center";
    context.font = "700 48px sans-serif";
    context.fillText("GIN RUMMY", canvas.width / 2, 108);
  });
  const ginSlipFace = addMesh(
    ginSlip,
    new THREE.PlaneGeometry(0.226, 0.096),
    new THREE.MeshStandardMaterial({ map: ginSlipTexture, roughness: 0.85, metalness: 0 }),
    [0, 0.005, 0],
  );
  ginSlipFace.rotation.x = -Math.PI / 2;
  ginSlipFace.castShadow = false;

  const fishingCorner = new THREE.Group();
  fishingCorner.name = "fishing-gear-corner";
  fishingCorner.position.set(CENTER_X + 2.35, 0.25, 0.85);
  hut.add(fishingCorner);
  const fishingRod = new THREE.Group();
  fishingRod.rotation.set(-0.08, 0, 0.22);
  fishingCorner.add(fishingRod);
  const rodBlankMaterial = standard("#28566b", 0.34, 0.42);
  addMesh(fishingRod, new THREE.CylinderGeometry(0.006, 0.024, 2.35, 10), rodBlankMaterial, [0, 1.275, 0]);
  const corkMaterial = standard("#bd9360", 0.94);
  addMesh(fishingRod, new THREE.CylinderGeometry(0.041, 0.052, 0.43, 12), corkMaterial, [0, 0.235, 0]);
  for (const y of [0.07, 0.15, 0.23, 0.31, 0.39]) {
    const corkRing = addMesh(fishingRod, new THREE.TorusGeometry(0.044, 0.0035, 5, 14), bambooDarkMaterial, [0, y, 0]);
    corkRing.rotation.x = Math.PI / 2;
  }
  addMesh(fishingRod, new THREE.CylinderGeometry(0.029, 0.033, 0.22, 10), blackMaterial, [0, 0.5, 0]);
  addMesh(fishingRod, new THREE.CylinderGeometry(0.054, 0.046, 0.045, 12), blackMaterial, [0, 0.025, 0]);

  const spinningReel = new THREE.Group();
  spinningReel.position.set(0, 0.52, 0.115);
  fishingRod.add(spinningReel);
  const reelBody = addMesh(spinningReel, new THREE.SphereGeometry(0.064, 14, 10), blackMaterial, [0, -0.035, -0.025]);
  reelBody.scale.set(0.9, 1.15, 0.8);
  const spool = addMesh(spinningReel, new THREE.CylinderGeometry(0.071, 0.071, 0.085, 20), silverMaterial, [0, 0, 0.025]);
  spool.rotation.x = Math.PI / 2;
  const spoolCore = addMesh(spinningReel, new THREE.CylinderGeometry(0.047, 0.047, 0.092, 18), blackMaterial, [0, 0, 0.025]);
  spoolCore.rotation.x = Math.PI / 2;
  addMesh(spinningReel, new THREE.TorusGeometry(0.094, 0.007, 6, 28), silverMaterial, [0, 0, 0.07]);
  cylinderBetween(
    spinningReel,
    new THREE.Vector3(0.058, -0.035, 0.065),
    new THREE.Vector3(0.145, -0.105, 0.09),
    0.01,
    silverMaterial,
    7,
  );
  addMesh(spinningReel, new THREE.SphereGeometry(0.026, 10, 8), blackMaterial, [0.15, -0.11, 0.092]);

  for (let index = 0; index < 5; index += 1) {
    const y = 0.79 + index * 0.375;
    const radius = 0.027 - index * 0.0025;
    addMesh(fishingRod, new THREE.TorusGeometry(radius, 0.0035, 5, 14), silverMaterial, [0, y, 0.035]);
  }
  const fishingLineMaterial = new THREE.MeshBasicMaterial({
    color: "#e2f2e9",
    transparent: true,
    opacity: 0.76,
  });
  const rodLine = cylinderBetween(
    fishingRod,
    new THREE.Vector3(0, 0.55, 0.18),
    new THREE.Vector3(0, 2.44, 0.04),
    0.0018,
    fishingLineMaterial,
    5,
  );
  rodLine.castShadow = false;
  const fishingSway = new THREE.Group();
  fishingSway.position.set(0, 2.44, 0.04);
  fishingRod.add(fishingSway);
  const danglingLine = cylinderBetween(
    fishingSway,
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, -0.56, 0),
    0.0022,
    fishingLineMaterial,
    5,
  );
  danglingLine.castShadow = false;
  const bobberTop = addMesh(
    fishingSway,
    new THREE.SphereGeometry(0.05, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    coralMaterial,
    [0, -0.45, 0],
  );
  bobberTop.scale.y = 0.9;
  const bobberBottom = addMesh(
    fishingSway,
    new THREE.SphereGeometry(0.05, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    creamMaterial,
    [0, -0.45, 0],
  );
  bobberBottom.scale.y = 0.9;
  const spoonLure = addMesh(fishingSway, new THREE.SphereGeometry(0.038, 14, 10), silverMaterial, [0, -0.58, 0]);
  spoonLure.scale.set(0.58, 1.45, 0.2);
  spoonLure.rotation.z = 0.34;
  const lureHook = addMesh(fishingSway, new THREE.TorusGeometry(0.023, 0.0035, 5, 14, Math.PI * 1.45), silverMaterial, [0, -0.63, 0]);
  lureHook.rotation.z = -0.45;

  const tackleBox = new THREE.Group();
  tackleBox.name = "open-tackle-box";
  tackleBox.position.set(-11.88, 0.25, 0.42);
  tackleBox.rotation.y = -0.12;
  hut.add(tackleBox);
  const tackleGreenMaterial = standard("#315c48", 0.66);
  box(tackleBox, [0.48, 0.18, 0.3], [0, 0.09, 0], tackleGreenMaterial);
  box(tackleBox, [0.42, 0.015, 0.24], [0, 0.185, 0], blackMaterial);
  box(tackleBox, [0.44, 0.025, 0.26], [0, 0.205, 0], bambooLightMaterial);
  for (const x of [-0.215, 0.215]) {
    box(tackleBox, [0.018, 0.055, 0.26], [x, 0.225, 0], mattePaperMaterial);
  }
  for (const z of [-0.125, 0.125]) {
    box(tackleBox, [0.44, 0.055, 0.018], [0, 0.225, z], mattePaperMaterial);
  }
  const tackleLid = new THREE.Group();
  tackleLid.position.set(0, 0.245, -0.15);
  tackleLid.rotation.x = 0.34;
  tackleBox.add(tackleLid);
  box(tackleLid, [0.48, 0.035, 0.3], [0, 0, 0.15], tackleGreenMaterial);
  const carryingHandle = addMesh(tackleLid, new THREE.TorusGeometry(0.105, 0.012, 6, 22, Math.PI), blackMaterial, [0, 0.026, 0.15]);
  carryingHandle.rotation.x = -Math.PI / 2;
  for (const x of [-0.14, 0.14]) {
    box(tackleBox, [0.045, 0.075, 0.018], [x, 0.15, 0.158], silverMaterial);
  }
  const lureColors = ["#ef6f61", "#c9da45", "#20a9a2", "#f2b843"];
  lureColors.forEach((color, index) => {
    const x = -0.145 + (index % 2) * 0.25;
    const z = -0.055 + Math.floor(index / 2) * 0.12;
    const lure = addMesh(tackleBox, new THREE.SphereGeometry(0.038, 12, 8), standard(color, 0.36, 0.08), [x, 0.245, z]);
    lure.scale.set(1.55, 0.42, 0.62);
    lure.rotation.y = -0.45 + index * 0.38;
    const hook = addMesh(tackleBox, new THREE.TorusGeometry(0.019, 0.003, 5, 12, Math.PI * 1.4), silverMaterial, [x + 0.055, 0.24, z]);
    hook.rotation.x = Math.PI / 2;
  });

  const baitBucket = new THREE.Group();
  baitBucket.name = "galvanized-bait-bucket";
  baitBucket.position.set(-11.42, 0.25, 1.32);
  hut.add(baitBucket);
  addMesh(baitBucket, new THREE.CylinderGeometry(0.17, 0.135, 0.28, 24, 1, true), silverMaterial, [0, 0.14, 0]);
  addMesh(baitBucket, new THREE.CylinderGeometry(0.135, 0.135, 0.015, 24), silverMaterial, [0, 0.008, 0]);
  const bucketRim = addMesh(baitBucket, new THREE.TorusGeometry(0.17, 0.011, 7, 28), silverMaterial, [0, 0.28, 0]);
  bucketRim.rotation.x = Math.PI / 2;
  const bucketInterior = addMesh(baitBucket, new THREE.CircleGeometry(0.155, 24), blackMaterial, [0, 0.265, 0]);
  bucketInterior.rotation.x = -Math.PI / 2;
  const bailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.17, 0.24, 0),
    new THREE.Vector3(-0.15, 0.43, 0),
    new THREE.Vector3(0, 0.53, 0),
    new THREE.Vector3(0.15, 0.43, 0),
    new THREE.Vector3(0.17, 0.24, 0),
  ]);
  addMesh(baitBucket, new THREE.TubeGeometry(bailCurve, 28, 0.007, 6, false), silverMaterial, [0, 0, 0]);
  cylinderBetween(
    baitBucket,
    new THREE.Vector3(-0.055, 0.515, 0),
    new THREE.Vector3(0.055, 0.515, 0),
    0.016,
    darkTeakMaterial,
    9,
  );

  const lineSpool = new THREE.Group();
  lineSpool.name = "coiled-fishing-line-spool";
  lineSpool.position.set(-11.12, 0.25, 1.2);
  hut.add(lineSpool);
  addMesh(lineSpool, new THREE.CylinderGeometry(0.095, 0.095, 0.018, 20), creamMaterial, [0, 0.009, 0]);
  addMesh(lineSpool, new THREE.CylinderGeometry(0.095, 0.095, 0.018, 20), creamMaterial, [0, 0.122, 0]);
  addMesh(lineSpool, new THREE.CylinderGeometry(0.071, 0.071, 0.105, 20), fishingLineMaterial, [0, 0.065, 0]);
  for (let index = 0; index < 6; index += 1) {
    const coil = addMesh(lineSpool, new THREE.TorusGeometry(0.073, 0.0035, 5, 24), fishingLineMaterial, [0, 0.035 + index * 0.014, 0]);
    coil.rotation.x = Math.PI / 2;
  }

  function setDoorProgress(t: number): void {
    const progress = THREE.MathUtils.clamp(t, 0, 1);
    const eased = progress * progress * (3 - 2 * progress);
    leftDoor.rotation.y = -eased * 1.42;
    rightDoor.rotation.y = eased * 1.42;
  }

  function setDoorHovered(hovered: boolean): void {
    doorHovered = hovered;
    doorMaterial.emissiveIntensity = hovered ? 0.62 : 0.08;
  }

  function setLightingMode(mode: LightingMode, blend: number): void {
    const amount = THREE.MathUtils.clamp(blend, 0, 1);
    nightAmount = mode === "night" ? amount : 1 - amount;
    glowMaterials.forEach(({ material, day, night }) => {
      material.emissiveIntensity = THREE.MathUtils.lerp(day, night, nightAmount);
    });
    interiorLights.forEach((light) => {
      light.intensity = THREE.MathUtils.lerp(
        light.userData.dayIntensity as number,
        light.userData.nightIntensity as number,
        nightAmount,
      );
    });
  }

  function setActiveLights(active: boolean): void {
    lightsActive = active;
    interiorLights.forEach((light) => {
      light.visible = active;
    });
  }

  setLightingMode("night", 1);

  return {
    group,
    doorHitMeshes,
    exteriorEasterEggHitMeshes,
    interiorEasterEggHitMeshes,
    handles,
    triggerEasterEgg: (id: EasterEggId) => {
      if (id === "lantern") {
        lanternPulse = 1;
        return LANTERN_MESSAGE;
      }
      if (id === "surfboard") {
        surfboardPulse = 1;
        return SURFBOARD_MESSAGE;
      }
      return "";
    },
    setDoorProgress,
    setDoorHovered,
    setLightingMode,
    setActiveLights,
    update: (elapsed, dt) => {
      palms.forEach(({ crown, fronds, phase }) => {
        crown.rotation.z = Math.sin(elapsed * 0.55 + phase) * 0.035;
        crown.rotation.x = Math.cos(elapsed * 0.43 + phase) * 0.025;
        fronds.forEach((frond, index) => {
          frond.rotation.z = (frond.userData.baseZ as number)
            + Math.sin(elapsed * 0.9 + phase + index * 0.67) * 0.045;
          frond.rotation.x = Math.cos(elapsed * 0.72 + phase + index) * 0.025;
        });
      });
      eaveLanterns.forEach((lantern, index) => {
        lantern.rotation.z = Math.sin(elapsed * 0.8 + index * 0.72) * 0.045;
      });
      lanternPulse = Math.max(0, lanternPulse - dt * 0.32);
      entranceLantern.group.rotation.z = Math.sin(elapsed * 1.05) * 0.055
        + Math.sin(elapsed * 7.5) * lanternPulse * 0.14;
      entranceLantern.body.material.emissiveIntensity = 0.58 + nightAmount * 0.38
        + (Math.sin(elapsed * 2.2) * 0.5 + 0.5) * 0.25 + lanternPulse * 1.5;
      surfboardPulse = Math.max(0, surfboardPulse - dt * 0.5);
      surfboard.rotation.z = -0.1 + Math.sin(elapsed * 8.2) * surfboardPulse * 0.19;
      surfboard.rotation.y = Math.cos(elapsed * 6.4) * surfboardPulse * 0.1;
      fishingSway.rotation.z = Math.sin(elapsed * 1.35) * 0.06;
      fishingSway.rotation.x = Math.cos(elapsed * 1.08) * 0.035;
      spoonLure.rotation.y = Math.sin(elapsed * 1.7) * 0.45;
      steamWisps.forEach(({ mesh, baseY, phase }) => {
        const cycle = (elapsed * 0.22 + phase * 0.13) % 1;
        mesh.position.y = baseY + cycle * 0.19;
        mesh.position.x = Math.sin(elapsed * 0.75 + phase) * 0.035;
        mesh.scale.setScalar(0.82 + cycle * 0.35);
        mesh.material.opacity = Math.sin(cycle * Math.PI) * 0.25;
      });
      hammock.rotation.x = Math.sin(elapsed * 0.62) * 0.012;
      water.position.y = 0.015 + Math.sin(elapsed * 0.7) * 0.006;
      doorMaterial.emissiveIntensity = (doorHovered ? 0.56 : 0.06) + nightAmount * 0.06;
      if (!lightsActive) interiorLights.forEach((light) => { light.visible = false; });
      handles.forEach((handle) => handle.update(elapsed, dt));
    },
    dispose: () => {
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
      handles.clear();
      group.parent?.remove(group);
    },
  };
}

function createSandTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("A 2D canvas context is required to build Sam's Beach.");
  context.fillStyle = "#dcb978";
  context.fillRect(0, 0, 512, 512);
  let seed = 918273;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let index = 0; index < 11500; index += 1) {
    const value = Math.floor(135 + random() * 95);
    context.fillStyle = `rgba(${value + 12},${value},${Math.floor(value * 0.66)},${0.08 + random() * 0.16})`;
    const size = random() * 1.8 + 0.3;
    context.fillRect(random() * 512, random() * 512, size, size);
  }
  context.strokeStyle = "rgba(255,239,188,0.12)";
  context.lineWidth = 2;
  for (let index = 0; index < 14; index += 1) {
    const y = index * 39 + random() * 15;
    context.beginPath();
    context.moveTo(0, y);
    context.bezierCurveTo(130, y + 12, 370, y - 12, 512, y + 3);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.anisotropy = 4;
  return texture;
}
