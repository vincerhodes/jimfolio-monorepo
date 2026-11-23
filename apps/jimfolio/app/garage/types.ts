import type * as THREE from "three";

export type StationId = "predictr" | "crema" | "pantry" | "preppr" | "book-adventure";
export type GarageStage = "exterior" | "opening" | "interior" | "inspecting";
export type LightingMode = "night" | "day";
export type Vec3Tuple = [number, number, number];

export interface CameraPose {
  position: Vec3Tuple;
  target: Vec3Tuple;
}

export interface GarageStation {
  id: StationId;
  name: string;
  slug: string;
  url: string;
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
  setDoorProgress: (t: number) => void;
  setSwitchHovered: (hovered: boolean) => void;
  setDoorHovered: (hovered: boolean) => void;
  setLightingMode: (mode: LightingMode, blend: number) => void;
  update: (elapsed: number, dt: number) => void;
  dispose: () => void;
}

export const CAMERA_POSES: { exterior: CameraPose; interior: CameraPose } = {
  exterior: { position: [0, 2.05, 11.4], target: [0, 1.72, 4.0] },
  interior: { position: [0, 2.38, 3.85], target: [0, 1.28, -2.5] },
};
