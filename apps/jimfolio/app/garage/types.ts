import type * as THREE from "three";

export type BuildingId = "jim" | "matt";
export type StationId =
  | "predictr" | "plannr" | "crema" | "pantry" | "chinahols"
  | "preppr" | "book-adventure" | "rocketsfc"
  | "browzr" | "kickoff-hq" | "rovr" | "preparingforai" | "rightcourtsc"
  | "matt-preparingforai";
export type StationCategory = "experiment" | "shipped" | "shed";
export type GarageStage = "exterior" | "opening" | "interior" | "inspecting";
export type LightingMode = "night" | "day";
export type ViewPreset = "left" | "center" | "right";
export type EasterEggId = "wrench" | "vise" | "clock" | "bucket" | "flowerpot" | "tbd-box";
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

export interface ShedHandle {
  group: THREE.Group;
  doorHitMeshes: THREE.Object3D[];
  easterEggHitMeshes: THREE.Object3D[];
  stationHandle: StationHandle;
  triggerEasterEgg: (id: EasterEggId) => string;
  setDoorProgress: (t: number) => void;
  setDoorHovered: (hovered: boolean) => void;
  setLightingMode: (mode: LightingMode, blend: number) => void;
  update: (elapsed: number, dt: number) => void;
  dispose: () => void;
}

export const CAMERA_POSES: { exterior: CameraPose; interior: CameraPose } = {
  exterior: { position: [0, 2.05, 11.4], target: [0, 1.72, 4.0] },
  interior: { position: [-0.25, 2.24, 4.45], target: [0.55, 1.42, -2.5] },
};

export const SHED_CAMERA_POSES: { exterior: CameraPose; interior: CameraPose } = {
  exterior: { position: [12.6, 1.95, 10.6], target: [12.6, 1.55, 3.4] },
  interior: { position: [12.6, 1.95, 2.55], target: [12.6, 1.25, -2.0] },
};
