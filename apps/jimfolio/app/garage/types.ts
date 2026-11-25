import type * as THREE from "three";

export type BuildingId = "nordy" | "sam" | "jim" | "matt";
export type StationId =
  | "predictr" | "plannr" | "crema" | "pantry" | "chinahols"
  | "preppr" | "book-adventure" | "rocketsfc"
  | "browzr" | "kickoff-hq" | "rovr" | "preparingforai" | "rightcourtsc"
  | "matt-preparingforai" | "matt-descartwright" | "matt-germanya" | "matt-digitaldetox"
  | "sam-browzr" | "sam-vietnam" | "nordy-burgers" | "nordy-patio" | "nordy-kickoff-tv";
export type StationCategory = "experiment" | "shipped" | "farm" | "beach" | "bar";
export type GarageStage = "exterior" | "opening" | "interior" | "inspecting" | "driving";
export type LightingMode = "night" | "day";
export type ViewPreset = "left" | "center" | "right";
export type EasterEggId =
  | "wrench" | "vise" | "clock" | "tractor" | "bell" | "chicken"
  | "old-shed" | "lantern" | "surfboard" | "grill" | "tap";
export type VehicleId = "rover" | "vespa" | "tractor";
export type Vec3Tuple = [number, number, number];

export interface CameraPose {
  position: Vec3Tuple;
  target: Vec3Tuple;
}

export interface GarageStation {
  id: StationId;
  category: StationCategory;
  name: string;
  slug: string;
  url: string;
  domainLabel?: string;
  tag: string;
  tagline: string;
  description: string;
  tech: string[];
  accentHex: string;
  chipClass: string;
  badgeNote?: string;
  privateAuth?: boolean;
  status404?: boolean;
  isHangout?: boolean;
  propLabel: string;
  anchorPosition: Vec3Tuple;
  inspectCamera: CameraPose;
}

export interface ProjectedLabel {
  id: StationId;
  name: string;
  tag: string;
  category?: StationCategory;
  x: number;
  y: number;
  visible: boolean;
}

export interface StationHandle {
  id: StationId;
  group: THREE.Group;
  hitMeshes: THREE.Object3D[];
  setHovered: (hovered: boolean) => void;
  setSelected: (selected: boolean) => void;
  update: (elapsed: number, dt: number) => void;
}

export interface RoomHandle {
  group: THREE.Group;
  doorHitMeshes: THREE.Object3D[];
  switchHitMeshes: THREE.Object3D[];
  easterEggHitMeshes: THREE.Object3D[];
  triggerEasterEgg: (id: EasterEggId) => string;
  setDoorProgress: (t: number) => void;
  setSwitchHovered: (hovered: boolean) => void;
  setDoorHovered: (hovered: boolean) => void;
  setLightingMode: (mode: LightingMode, blend: number) => void;
  update: (elapsed: number, dt: number) => void;
  dispose: () => void;
}

export interface FarmHandle {
  group: THREE.Group;
  doorHitMeshes: THREE.Object3D[];
  exteriorEasterEggHitMeshes: THREE.Object3D[];
  interiorEasterEggHitMeshes: THREE.Object3D[];
  handles: Map<StationId, StationHandle>;
  triggerEasterEgg: (id: EasterEggId) => string;
  setDoorProgress: (t: number) => void;
  setDoorHovered: (hovered: boolean) => void;
  setLightingMode: (mode: LightingMode, blend: number) => void;
  setActiveLights?: (active: boolean) => void;
  update: (elapsed: number, dt: number) => void;
  dispose: () => void;
}

export interface PlotHandle {
  group: THREE.Group;
  doorHitMeshes: THREE.Object3D[];
  exteriorEasterEggHitMeshes: THREE.Object3D[];
  interiorEasterEggHitMeshes: THREE.Object3D[];
  handles: Map<StationId, StationHandle>;
  triggerEasterEgg: (id: EasterEggId) => string;
  setDoorProgress: (t: number) => void;
  setDoorHovered: (hovered: boolean) => void;
  setLightingMode: (mode: LightingMode, blend: number) => void;
  setActiveLights?: (active: boolean) => void;
  update: (elapsed: number, dt: number) => void;
  dispose: () => void;
}

export interface DriveBoundsBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const CAMERA_POSES: { exterior: CameraPose; interior: CameraPose } = {
  exterior: { position: [0, 2.05, 11.4], target: [0, 1.72, 4.0] },
  interior: { position: [-0.25, 2.24, 4.45], target: [0.55, 1.42, -2.5] },
};

export const FARM_CAMERA_POSES: { exterior: CameraPose; interior: CameraPose } = {
  exterior: { position: [12.4, 2.35, 12.2], target: [12.4, 1.75, 3.6] },
  interior: { position: [12.8, 2.25, 3.25], target: [12.8, 1.38, -2.2] },
};

export const SAM_CAMERA_POSES: { exterior: CameraPose; interior: CameraPose } = {
  exterior: { position: [-14.0, 2.25, 11.4], target: [-14.0, 1.55, 3.2] },
  interior: { position: [-14.0, 2.05, 3.2], target: [-14.0, 1.25, -1.8] },
};

export const NORDY_CAMERA_POSES: { exterior: CameraPose; interior: CameraPose } = {
  exterior: { position: [-28.0, 2.35, 11.8], target: [-28.0, 1.55, 3.4] },
  interior: { position: [-27.4, 2.02, 5.35], target: [-27.4, 1.48, 0.35] },
};

export const BUILDING_ORDER: BuildingId[] = ["nordy", "sam", "jim", "matt"];
