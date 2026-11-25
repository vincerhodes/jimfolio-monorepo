import * as THREE from "three";
import type { BuildingId, DriveBoundsBox, LightingMode, VehicleId } from "../types";

export interface DriveInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
}

export interface DriveState {
  x: number;
  z: number;
  heading: number;
  speed: number;
  nearBuilding: BuildingId | null;
  vehicle: VehicleId;
}

export interface VehicleController {
  group: THREE.Group;
  setVisible: (visible: boolean) => void;
  setVehicle: (id: VehicleId) => void;
  getVehicle: () => VehicleId;
  placeAtBuilding: (building: BuildingId) => void;
  getState: () => DriveState;
  getChaseCamera: (outPos: THREE.Vector3, outTarget: THREE.Vector3) => void;
  triggerHornEffect: () => void;
  setLightingMode: (mode: LightingMode, blend: number) => void;
  update: (elapsed: number, dt: number, input: DriveInput, obstacles: DriveBoundsBox[], bounds: DriveBoundsBox) => DriveState;
  dispose: () => void;
}

type WheelRig = { steering: THREE.Group; spinner: THREE.Group; radius: number; front: boolean };
type SmokePuff = { mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>; offset: number };
type VehicleModel = { group: THREE.Group; wheels: WheelRig[] };

const BUILDING_ANCHORS: Record<BuildingId, { x: number; z: number }> = {
  nordy: { x: -28, z: 10.2 },
  sam: { x: -14, z: 10.2 },
  jim: { x: 0, z: 10.2 },
  matt: { x: 12.8, z: 10.2 },
};

function mesh(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}

function box(
  parent: THREE.Object3D,
  material: THREE.Material,
  size: [number, number, number],
  position: [number, number, number],
): THREE.Mesh {
  return mesh(parent, new THREE.BoxGeometry(...size), material, ...position);
}

function cylinder(
  parent: THREE.Object3D,
  material: THREE.Material,
  radiusTop: number,
  radiusBottom: number,
  height: number,
  position: [number, number, number],
  segments = 12,
): THREE.Mesh {
  return mesh(parent, new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material, ...position);
}

function createWheel(
  parent: THREE.Group,
  x: number,
  y: number,
  z: number,
  radius: number,
  width: number,
  front: boolean,
  rubber: THREE.Material,
  rim: THREE.Material,
  treaded: boolean,
): WheelRig {
  const steering = new THREE.Group();
  steering.position.set(x, y, z);
  parent.add(steering);
  const spinner = new THREE.Group();
  steering.add(spinner);
  const tireGeometry = new THREE.CylinderGeometry(radius, radius, width, 18, 1);
  tireGeometry.rotateZ(Math.PI / 2);
  mesh(spinner, tireGeometry, rubber, 0, 0, 0);
  const rimGeometry = new THREE.CylinderGeometry(radius * 0.53, radius * 0.53, width + 0.025, 14, 1);
  rimGeometry.rotateZ(Math.PI / 2);
  mesh(spinner, rimGeometry, rim, 0, 0, 0);
  const hubGeometry = new THREE.CylinderGeometry(radius * 0.16, radius * 0.16, width + 0.06, 10);
  hubGeometry.rotateZ(Math.PI / 2);
  mesh(spinner, hubGeometry, rim, 0, 0, 0);
  if (treaded) {
    for (let index = 0; index < 14; index += 1) {
      const angle = (index / 14) * Math.PI * 2;
      const tread = box(
        spinner,
        rubber,
        [width + 0.08, radius * 0.14, radius * 0.3],
        [0, Math.sin(angle) * radius, Math.cos(angle) * radius],
      );
      tread.rotation.x = -angle;
      tread.rotation.z = index % 2 === 0 ? 0.12 : -0.12;
    }
  }
  return { steering, spinner, radius, front };
}

function addRoundLamp(
  parent: THREE.Group,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
  radius: number,
  rear = false,
): THREE.Mesh {
  const geometry = new THREE.CylinderGeometry(radius, radius, 0.075, 16);
  geometry.rotateX(Math.PI / 2);
  const lamp = mesh(parent, geometry, material, x, y, z);
  if (rear) lamp.rotation.y = Math.PI;
  return lamp;
}

function buildRover(
  rubber: THREE.Material,
  cream: THREE.Material,
  chrome: THREE.Material,
  glass: THREE.Material,
  headlight: THREE.Material,
  brakeLight: THREE.Material,
): VehicleModel {
  const group = new THREE.Group();
  group.name = "workshop-defender";
  const body = new THREE.MeshStandardMaterial({ color: 0x596653, roughness: 0.72, metalness: 0.16 });
  const darkBody = new THREE.MeshStandardMaterial({ color: 0x3e493e, roughness: 0.8 });
  box(group, darkBody, [1.75, 0.28, 3.55], [0, 0.63, 0]);
  box(group, body, [1.82, 0.65, 3.25], [0, 0.93, 0]);
  box(group, body, [1.76, 0.48, 1.18], [0, 1.25, 1.12]);
  box(group, body, [1.72, 1.12, 1.75], [0, 1.58, -0.55]);
  box(group, cream, [1.88, 0.15, 1.98], [0, 2.2, -0.52]);
  box(group, glass, [1.5, 0.55, 0.055], [0, 1.78, 0.35]);
  box(group, glass, [0.055, 0.52, 1.12], [-0.875, 1.78, -0.55]);
  box(group, glass, [0.055, 0.52, 1.12], [0.875, 1.78, -0.55]);
  box(group, glass, [1.45, 0.5, 0.055], [0, 1.78, -1.46]);
  box(group, darkBody, [1.84, 0.15, 0.18], [0, 0.65, 1.78]);
  box(group, chrome, [1.2, 0.34, 0.055], [0, 1.08, 1.642]);
  for (let index = -3; index <= 3; index += 1) {
    box(group, darkBody, [0.055, 0.29, 0.065], [index * 0.15, 1.08, 1.68]);
  }
  addRoundLamp(group, headlight, -0.63, 1.28, 1.65, 0.19);
  addRoundLamp(group, headlight, 0.63, 1.28, 1.65, 0.19);
  addRoundLamp(group, brakeLight, -0.65, 1.03, -1.65, 0.11, true);
  addRoundLamp(group, brakeLight, 0.65, 1.03, -1.65, 0.11, true);

  const rack = new THREE.Group();
  rack.position.set(0, 2.37, -0.52);
  group.add(rack);
  [-0.82, 0.82].forEach((x) => box(rack, chrome, [0.055, 0.16, 2.05], [x, 0, 0]));
  [-0.92, -0.3, 0.3, 0.92].forEach((z) => box(rack, chrome, [1.7, 0.06, 0.055], [0, 0.07, z]));
  const spare = new THREE.Group();
  spare.position.set(0, 1.35, -1.76);
  spare.rotation.z = Math.PI / 2;
  group.add(spare);
  const spareGeometry = new THREE.CylinderGeometry(0.48, 0.48, 0.28, 18);
  spareGeometry.rotateX(Math.PI / 2);
  mesh(spare, spareGeometry, rubber, 0, 0, 0);
  const spareRim = new THREE.CylinderGeometry(0.23, 0.23, 0.3, 14);
  spareRim.rotateX(Math.PI / 2);
  mesh(spare, spareRim, cream, 0, 0, 0);

  const wheels = [
    createWheel(group, -1.0, 0.56, 1.18, 0.53, 0.34, true, rubber, cream, true),
    createWheel(group, 1.0, 0.56, 1.18, 0.53, 0.34, true, rubber, cream, true),
    createWheel(group, -1.0, 0.56, -1.18, 0.53, 0.34, false, rubber, cream, true),
    createWheel(group, 1.0, 0.56, -1.18, 0.53, 0.34, false, rubber, cream, true),
  ];
  return { group, wheels };
}

function buildVespa(
  rubber: THREE.Material,
  cream: THREE.Material,
  chrome: THREE.Material,
  leather: THREE.Material,
  headlight: THREE.Material,
  brakeLight: THREE.Material,
): VehicleModel {
  const group = new THREE.Group();
  group.name = "coastal-vespa";
  const paint = new THREE.MeshStandardMaterial({ color: 0x66bdb2, roughness: 0.42, metalness: 0.2 });
  const paintDark = new THREE.MeshStandardMaterial({ color: 0x3e938d, roughness: 0.5, metalness: 0.15 });
  box(group, paintDark, [0.62, 0.16, 1.55], [0, 0.48, 0.03]);
  const rearCowl = mesh(group, new THREE.SphereGeometry(0.72, 18, 12), paint, 0, 0.91, -0.62);
  rearCowl.scale.set(0.85, 0.76, 1.13);
  const shield = mesh(group, new THREE.SphereGeometry(0.72, 18, 12), paint, 0, 1.13, 0.6);
  shield.scale.set(0.86, 1.25, 0.25);
  shield.rotation.x = -0.12;
  const seat = mesh(group, new THREE.SphereGeometry(0.55, 16, 10), leather, 0, 1.42, -0.52);
  seat.scale.set(0.82, 0.25, 1.15);
  box(group, chrome, [0.065, 0.85, 0.065], [0, 1.34, 0.79]).rotation.x = -0.22;
  const handlebar = cylinder(group, chrome, 0.045, 0.045, 1.05, [0, 1.8, 0.72], 10);
  handlebar.rotation.z = Math.PI / 2;
  [-0.49, 0.49].forEach((x) => {
    const grip = cylinder(group, rubber, 0.07, 0.07, 0.25, [x, 1.8, 0.72], 10);
    grip.rotation.z = Math.PI / 2;
  });
  addRoundLamp(group, headlight, 0, 1.8, 0.85, 0.23);
  addRoundLamp(group, brakeLight, 0, 1.03, -1.36, 0.12, true);
  box(group, chrome, [0.74, 0.045, 0.52], [0, 1.36, -1.03]);
  [-0.34, 0.34].forEach((x) => box(group, chrome, [0.035, 0.16, 0.55], [x, 1.43, -1.03]));
  const frontFork = box(group, chrome, [0.08, 0.82, 0.08], [0, 0.77, 1.04]);
  frontFork.rotation.x = -0.18;
  const wheels = [
    createWheel(group, 0, 0.43, 1.08, 0.4, 0.2, true, rubber, cream, false),
    createWheel(group, 0, 0.43, -0.92, 0.4, 0.22, false, rubber, cream, false),
  ];
  return { group, wheels };
}

function buildTractor(
  rubber: THREE.Material,
  cream: THREE.Material,
  chrome: THREE.Material,
  leather: THREE.Material,
  headlight: THREE.Material,
  brakeLight: THREE.Material,
): { model: VehicleModel; smoke: SmokePuff[] } {
  const group = new THREE.Group();
  group.name = "matts-vintage-tractor";
  const red = new THREE.MeshStandardMaterial({ color: 0xa6382f, roughness: 0.58, metalness: 0.18 });
  const redDark = new THREE.MeshStandardMaterial({ color: 0x6e2825, roughness: 0.72, metalness: 0.12 });
  box(group, redDark, [1.05, 0.25, 2.75], [0, 0.73, 0]);
  box(group, red, [1.08, 0.88, 1.48], [0, 1.23, 0.72]);
  const hoodTop = box(group, red, [1.0, 0.16, 1.42], [0, 1.75, 0.72]);
  hoodTop.rotation.x = -0.025;
  box(group, chrome, [0.82, 0.68, 0.06], [0, 1.24, 1.485]);
  for (let index = -3; index <= 3; index += 1) {
    box(group, redDark, [0.045, 0.58, 0.07], [index * 0.105, 1.24, 1.525]);
  }
  addRoundLamp(group, headlight, -0.58, 1.54, 1.42, 0.16);
  addRoundLamp(group, headlight, 0.58, 1.54, 1.42, 0.16);
  addRoundLamp(group, brakeLight, -0.55, 1.15, -1.3, 0.1, true);
  addRoundLamp(group, brakeLight, 0.55, 1.15, -1.3, 0.1, true);
  box(group, red, [0.22, 0.16, 1.3], [-0.86, 1.25, -0.63]);
  box(group, red, [0.22, 0.16, 1.3], [0.86, 1.25, -0.63]);
  cylinder(group, leather, 0.37, 0.37, 0.18, [0, 1.27, -0.72], 14);
  const seatBack = box(group, leather, [0.68, 0.58, 0.14], [0, 1.55, -1.0]);
  seatBack.rotation.x = -0.15;
  cylinder(group, chrome, 0.035, 0.035, 0.58, [0, 1.45, -0.15], 8).rotation.x = -0.38;
  const steeringWheel = mesh(group, new THREE.TorusGeometry(0.27, 0.035, 7, 16), rubber, 0, 1.72, -0.02);
  steeringWheel.rotation.x = Math.PI / 2 - 0.38;
  cylinder(group, chrome, 0.075, 0.09, 1.25, [-0.36, 2.12, 0.56], 10);
  cylinder(group, redDark, 0.13, 0.13, 0.08, [-0.36, 2.77, 0.56], 10);
  const wheels = [
    createWheel(group, -0.62, 0.42, 1.03, 0.4, 0.25, true, rubber, cream, true),
    createWheel(group, 0.62, 0.42, 1.03, 0.4, 0.25, true, rubber, cream, true),
    createWheel(group, -0.91, 0.77, -0.78, 0.75, 0.4, false, rubber, cream, true),
    createWheel(group, 0.91, 0.77, -0.78, 0.75, 0.4, false, rubber, cream, true),
  ];
  const smoke: SmokePuff[] = [];
  for (let index = 0; index < 8; index += 1) {
    const material = new THREE.MeshBasicMaterial({ color: 0xb7b8ad, transparent: true, opacity: 0, depthWrite: false });
    const puff = mesh(group, new THREE.SphereGeometry(0.11, 7, 5), material, -0.36, 2.8, 0.56) as THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
    puff.castShadow = false;
    smoke.push({ mesh: puff, offset: index / 8 });
  }
  return { model: { group, wheels }, smoke };
}

function overlaps(x: number, z: number, radius: number, obstacle: DriveBoundsBox): boolean {
  return x + radius > obstacle.minX && x - radius < obstacle.maxX
    && z + radius > obstacle.minZ && z - radius < obstacle.maxZ;
}

export function createVehicleController(scene: THREE.Scene): VehicleController {
  const group = new THREE.Group();
  group.name = "drivable-vehicle";
  scene.add(group);
  const rubber = new THREE.MeshStandardMaterial({ color: 0x181b19, roughness: 0.93 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xe0d7b9, roughness: 0.65, metalness: 0.08 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xb9c1bd, roughness: 0.24, metalness: 0.85 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x6f939a, roughness: 0.18, metalness: 0.28, transparent: true, opacity: 0.78 });
  const leather = new THREE.MeshStandardMaterial({ color: 0x9a633c, roughness: 0.9 });
  const headlight = new THREE.MeshStandardMaterial({ color: 0xfff1c2, emissive: 0xffd889, emissiveIntensity: 0.35, roughness: 0.25 });
  const brakeLight = new THREE.MeshStandardMaterial({ color: 0x8e1916, emissive: 0xff1e12, emissiveIntensity: 0.25, roughness: 0.3 });

  const rover = buildRover(rubber, cream, chrome, glass, headlight, brakeLight);
  const vespa = buildVespa(rubber, cream, chrome, leather, headlight, brakeLight);
  const tractorBuild = buildTractor(rubber, cream, chrome, leather, headlight, brakeLight);
  const models: Record<VehicleId, VehicleModel> = { rover, vespa, tractor: tractorBuild.model };
  Object.values(models).forEach((model) => group.add(model.group));

  const beam = new THREE.SpotLight(0xffe4ac, 0, 17, Math.PI / 5.5, 0.55, 1.4);
  beam.position.set(0, 1.25, 1.25);
  beam.target.position.set(0, 0.2, 9);
  group.add(beam, beam.target);

  const hornRings: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>[] = [];
  for (let index = 0; index < 2; index += 1) {
    const material = new THREE.MeshBasicMaterial({ color: 0xffdc83, transparent: true, opacity: 0, depthWrite: false });
    const ring = mesh(group, new THREE.TorusGeometry(0.8, 0.025, 6, 36), material, 0, 0.25, 0) as THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
    ring.rotation.x = Math.PI / 2;
    ring.visible = false;
    ring.castShadow = false;
    hornRings.push(ring);
  }

  const state: DriveState = { x: 0, z: 10.2, heading: Math.PI / 2, speed: 0, nearBuilding: "jim", vehicle: "rover" };
  let steeringAngle = 0;
  let hornAge = 10;
  let nightAmount = 0;
  let disposed = false;

  const syncModelVisibility = (): void => {
    Object.entries(models).forEach(([id, model]) => { model.group.visible = id === state.vehicle; });
  };
  syncModelVisibility();
  group.position.set(state.x, 0.04, state.z);
  group.rotation.y = state.heading;

  const nearestBuilding = (): BuildingId | null => {
    let nearest: BuildingId | null = null;
    let nearestDistance = 7.5;
    (Object.keys(BUILDING_ANCHORS) as BuildingId[]).forEach((id) => {
      const anchor = BUILDING_ANCHORS[id];
      const distance = Math.hypot(state.x - anchor.x, state.z - anchor.z);
      if (distance <= nearestDistance) {
        nearest = id;
        nearestDistance = distance;
      }
    });
    return nearest;
  };

  const getState = (): DriveState => ({ ...state });

  return {
    group,
    setVisible: (visible) => { group.visible = visible; },
    setVehicle: (id) => {
      if (state.vehicle === id) return;
      state.vehicle = id;
      steeringAngle = 0;
      syncModelVisibility();
    },
    getVehicle: () => state.vehicle,
    placeAtBuilding: (building) => {
      const anchor = BUILDING_ANCHORS[building];
      state.x = anchor.x;
      state.z = anchor.z;
      state.heading = Math.PI / 2;
      state.speed = 0;
      state.nearBuilding = building;
      group.position.set(state.x, 0.04, state.z);
      group.rotation.y = state.heading;
    },
    getState,
    getChaseCamera: (outPos, outTarget) => {
      const forwardX = Math.sin(state.heading);
      const forwardZ = Math.cos(state.heading);
      outPos.set(state.x - forwardX * 7.2, 3.6, state.z - forwardZ * 7.2);
      outTarget.set(state.x + forwardX * 2.1, 1.0, state.z + forwardZ * 2.1);
    },
    triggerHornEffect: () => { hornAge = 0; },
    setLightingMode: (mode, blend) => {
      nightAmount = THREE.MathUtils.clamp(mode === "night" ? blend : 1 - blend, 0, 1);
      headlight.emissiveIntensity = 0.25 + nightAmount * 3.1;
      beam.intensity = nightAmount * 42;
    },
    update: (elapsed, dt, input, obstacles, bounds) => {
      const step = Math.min(Math.max(dt, 0), 0.05);
      const accelerating = input.forward && !input.backward;
      if (accelerating) {
        state.speed += (state.speed < 0 ? 14 : 8.2) * step;
      } else if (input.backward && !input.forward) {
        state.speed -= (state.speed > 0 ? 13 : 5.8) * step;
      } else {
        state.speed *= Math.exp(-1.45 * step);
        if (Math.abs(state.speed) < 0.015) state.speed = 0;
      }
      if (input.brake) {
        const deceleration = 18 * step;
        if (Math.abs(state.speed) <= deceleration) state.speed = 0;
        else state.speed -= Math.sign(state.speed) * deceleration;
      }
      state.speed = THREE.MathUtils.clamp(state.speed, -5.2, 11.5);

      const steeringInput = (input.left ? 1 : 0) - (input.right ? 1 : 0);
      const speedRatio = Math.min(Math.abs(state.speed) / 11.5, 1);
      const targetSteering = steeringInput * 0.48;
      steeringAngle = THREE.MathUtils.damp(steeringAngle, targetSteering, 10, step);
      if (Math.abs(state.speed) > 0.025) {
        const steeringRate = (0.32 + Math.min(Math.abs(state.speed) / 3.2, 1) * 0.68) * (1 - speedRatio * 0.28);
        state.heading += steeringInput * steeringRate * 1.75 * step * Math.sign(state.speed);
      }

      const radius = state.vehicle === "vespa" ? 0.43 : state.vehicle === "tractor" ? 0.82 : 0.88;
      const dx = Math.sin(state.heading) * state.speed * step;
      const dz = Math.cos(state.heading) * state.speed * step;
      let collided = false;
      const nextX = THREE.MathUtils.clamp(state.x + dx, bounds.minX + radius, bounds.maxX - radius);
      if (!obstacles.some((obstacle) => overlaps(nextX, state.z, radius, obstacle))) state.x = nextX;
      else collided = true;
      const nextZ = THREE.MathUtils.clamp(state.z + dz, bounds.minZ + radius, bounds.maxZ - radius);
      if (!obstacles.some((obstacle) => overlaps(state.x, nextZ, radius, obstacle))) state.z = nextZ;
      else collided = true;
      if (collided) state.speed *= Math.exp(-5 * step);
      state.nearBuilding = nearestBuilding();

      group.position.set(state.x, 0.04, state.z);
      group.rotation.y = state.heading;
      const activeModel = models[state.vehicle];
      activeModel.wheels.forEach((wheel) => {
        wheel.spinner.rotation.x -= (state.speed * step) / wheel.radius;
        if (wheel.front) wheel.steering.rotation.y = steeringAngle;
      });
      brakeLight.emissiveIntensity = input.brake || input.backward ? 3.2 : 0.25 + nightAmount * 0.35;
      brakeLight.color.setHex(input.brake || input.backward ? 0xff3b27 : 0x8e1916);

      tractorBuild.smoke.forEach((puff) => {
        const phase = (elapsed * (accelerating ? 1.3 : 0.55) + puff.offset) % 1;
        puff.mesh.position.set(-0.36 + Math.sin(phase * 5 + puff.offset * 9) * phase * 0.16, 2.82 + phase * 1.25, 0.56 - phase * 0.2);
        puff.mesh.scale.setScalar(0.55 + phase * 1.9);
        puff.mesh.material.opacity = state.vehicle === "tractor" ? (accelerating ? 0.32 : 0.1) * (1 - phase) : 0;
      });

      hornAge += step;
      hornRings.forEach((ring, index) => {
        const age = hornAge - index * 0.16;
        ring.visible = age >= 0 && age < 0.85;
        if (ring.visible) {
          ring.scale.setScalar(1 + age * 4.2);
          ring.material.opacity = (1 - age / 0.85) * 0.65;
        }
      });
      return getState();
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
    },
  };
}
