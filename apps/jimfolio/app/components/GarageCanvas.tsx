'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {
  FARM_STATIONS,
  GARAGE_STATIONS,
  NORDY_STATIONS,
  SAM_STATIONS,
} from '../apps';
import { createWorkshopAudio, type WorkshopAudio } from '../garage/audio';
import { buildMattsFarm } from '../garage/scene/buildMattsFarm';
import { buildNordysBar } from '../garage/scene/buildNordysBar';
import { buildGarageRoom } from '../garage/scene/buildRoom';
import { buildSamsBeach } from '../garage/scene/buildSamsBeach';
import { buildProjectStations } from '../garage/scene/buildProps';
import { buildVillageWorld } from '../garage/scene/buildVillageWorld';
import { createWorkshopTextures } from '../garage/scene/materials';
import {
  createVehicleController,
  type DriveInput,
} from '../garage/scene/vehicles';
import {
  BUILDING_ORDER,
  type BuildingId,
  CAMERA_POSES,
  type CameraPose,
  type EasterEggId,
  FARM_CAMERA_POSES,
  type FarmHandle,
  type GarageStage,
  type GarageStation,
  type LightingMode,
  NORDY_CAMERA_POSES,
  type PlotHandle,
  type ProjectedLabel,
  type RoomHandle,
  SAM_CAMERA_POSES,
  type StationHandle,
  type StationId,
  type VehicleId,
  type ViewPreset,
} from '../garage/types';
import BenchListView from './BenchListView';
import GarageHUD from './GarageHUD';
import ProjectDrawer from './ProjectDrawer';

const DOOR_STORAGE_KEY = 'jimsgarage-door-open';
const DOOR_DURATION = 1100;
const CAMERA_DURATION = 1000;
const BUILDING_SWITCH_DURATION = 1050;
const TOAST_DURATION = 3200;
const JIM_STATIONS = GARAGE_STATIONS.filter(
  (station) => station.category === 'experiment' || station.category === 'shipped',
);
const EASTER_EGG_HINTS: Record<EasterEggId, string> = {
  wrench: 'Spanner Wrench',
  vise: 'Bench Vise',
  clock: 'Workshop Clock',
  tractor: 'Vintage Tractor',
  bell: 'Barn Dinner Bell',
  chicken: 'Barn Chicken',
  'old-shed': 'Old Potting Shed',
  lantern: 'Hội An Lantern',
  surfboard: 'Surfboard',
  grill: 'Smash Burger Grill',
  tap: 'Beer Tap',
};

type MotionKind =
  | 'door-open'
  | 'door-close'
  | 'inspect'
  | 'return'
  | 'building-switch'
  | 'drive-start'
  | 'drive-stop';

interface CameraMotion {
  kind: MotionKind;
  startedAt: number;
  duration: number;
  fromPosition: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toPosition: THREE.Vector3;
  toTarget: THREE.Vector3;
  fromDoor: number;
  toDoor: number;
}

interface GarageControls {
  openDoor: () => void;
  closeDoor: () => void;
  toggleLighting: () => void;
  selectStation: (id: StationId) => void;
  dismissInspection: () => void;
  panToView: (preset: ViewPreset) => void;
  switchBuilding: (target: BuildingId) => void;
  startDriving: () => void;
  stopDriving: (target?: BuildingId) => void;
  selectVehicle: (vehicle: VehicleId) => void;
  honkHorn: () => void;
  driveTouchInput: (
    control: keyof DriveInput,
    pressed: boolean,
  ) => void;
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function motionPose(pose: CameraPose) {
  return {
    position: new THREE.Vector3().fromArray(pose.position),
    target: new THREE.Vector3().fromArray(pose.target),
  };
}

function getAdaptiveFov(aspect: number) {
  return THREE.MathUtils.clamp(62 + (1.15 - aspect) * 18, 62, 74);
}

function getExteriorPose(aspect: number, fov: number): CameraPose {
  const tanHalfH = aspect * Math.tan(THREE.MathUtils.degToRad(fov / 2));
  const dz = Math.max(7.4, 4.75 / tanHalfH);
  return {
    position: [0, aspect < 0.85 ? 2.15 : 2.05, 4.0 + dz],
    target: [0, aspect < 0.85 ? 1.55 : 1.72, 4.0],
  };
}

function getInspectPose(
  station: GarageStation,
  aspect: number,
  isMobileWidth: boolean,
): CameraPose {
  if (!isMobileWidth && aspect >= 0.85) return station.inspectCamera;

  const target = new THREE.Vector3().fromArray(station.inspectCamera.target);
  const position = new THREE.Vector3()
    .fromArray(station.inspectCamera.position)
    .sub(target)
    .multiplyScalar(1.38)
    .add(target);
  target.y -= 0.48;
  position.y += 0.08;
  return {
    position: [position.x, position.y, position.z],
    target: [target.x, target.y, target.z],
  };
}

export default function GarageCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<GarageControls | null>(null);
  const audioRef = useRef<WorkshopAudio | null>(null);
  const stageRef = useRef<GarageStage>('exterior');
  const activeBuildingRef = useRef<BuildingId>('jim');
  const lightingModeRef = useRef<LightingMode>('night');
  const benchListOpenRef = useRef(false);
  const isTouchDeviceRef = useRef(false);
  const nearBuildingRef = useRef<BuildingId | null>(null);
  const [stage, setStage] = useState<GarageStage>('exterior');
  const [activeBuilding, setActiveBuilding] = useState<BuildingId>('jim');
  const [lightingMode, setLightingMode] = useState<LightingMode>('night');
  const [isBenchListOpen, setIsBenchListOpen] = useState(false);
  const [hoveredStationId, setHoveredStationId] = useState<StationId | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<StationId | null>(null);
  const [projectedLabels, setProjectedLabels] = useState<ProjectedLabel[]>([]);
  const [activeViewPreset, setActiveViewPreset] = useState<ViewPreset>('center');
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoverHint, setHoverHint] = useState<string | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const [activeVehicle, setActiveVehicle] = useState<VehicleId>('rover');
  const [nearBuilding, setNearBuilding] = useState<BuildingId | null>(null);
  const [driveSpeed, setDriveSpeed] = useState(0);

  const openDoor = useCallback(() => controlsRef.current?.openDoor(), []);
  const closeDoor = useCallback(() => controlsRef.current?.closeDoor(), []);
  const toggleLighting = useCallback(() => controlsRef.current?.toggleLighting(), []);
  const selectStation = useCallback(
    (id: StationId) => controlsRef.current?.selectStation(id),
    [],
  );
  const dismissInspection = useCallback(
    () => controlsRef.current?.dismissInspection(),
    [],
  );
  const panToView = useCallback(
    (preset: ViewPreset) => controlsRef.current?.panToView(preset),
    [],
  );
  const switchBuilding = useCallback(
    (target: BuildingId) => controlsRef.current?.switchBuilding(target),
    [],
  );
  const startDriving = useCallback(() => controlsRef.current?.startDriving(), []);
  const stopDriving = useCallback(
    (target?: BuildingId) => controlsRef.current?.stopDriving(target),
    [],
  );
  const selectVehicle = useCallback(
    (vehicle: VehicleId) => controlsRef.current?.selectVehicle(vehicle),
    [],
  );
  const honkHorn = useCallback(() => controlsRef.current?.honkHorn(), []);
  const driveTouchInput = useCallback(
    (control: keyof DriveInput, pressed: boolean) =>
      controlsRef.current?.driveTouchInput(control, pressed),
    [],
  );
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !audio.isMuted();
    audio.setMuted(next);
    setIsMuted(next);
  }, []);
  const toggleBenchList = useCallback(() => {
    const next = !benchListOpenRef.current;
    benchListOpenRef.current = next;
    setIsBenchListOpen(next);
  }, []);
  const closeBenchList = useCallback(() => {
    benchListOpenRef.current = false;
    setIsBenchListOpen(false);
  }, []);

  useEffect(() => {
    const coarsePointer = window.matchMedia('(pointer: coarse)');
    const updateTouchDevice = () => {
      const next =
        coarsePointer.matches ||
        (navigator.maxTouchPoints > 0 && window.innerWidth < 1024);
      isTouchDeviceRef.current = next;
      setIsTouchDevice(next);
    };
    updateTouchDevice();
    coarsePointer.addEventListener('change', updateTouchDevice);
    window.addEventListener('resize', updateTouchDevice);
    return () => {
      coarsePointer.removeEventListener('change', updateTouchDevice);
      window.removeEventListener('resize', updateTouchDevice);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const audio = createWorkshopAudio();
    audioRef.current = audio;

    let renderer: THREE.WebGLRenderer | null = null;
    let world: ReturnType<typeof buildVillageWorld> | null = null;
    let vehicles: ReturnType<typeof createVehicleController> | null = null;
    let room: RoomHandle | null = null;
    let farm: FarmHandle | null = null;
    let samBeach: PlotHandle | null = null;
    let nordyBar: PlotHandle | null = null;
    let stationScene: ReturnType<typeof buildProjectStations> | null = null;
    let textures: ReturnType<typeof createWorkshopTextures> | null = null;
    let pmremGenerator: THREE.PMREMGenerator | null = null;
    let envRT: THREE.WebGLRenderTarget | null = null;
    let composer: EffectComposer | null = null;
    let renderPass: RenderPass | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    let outputPass: OutputPass | null = null;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 160);
    const currentTarget = new THREE.Vector3();

    const disposeComposer = () => {
      composer?.dispose();
      renderPass?.dispose();
      bloomPass?.dispose();
      outputPass?.dispose();
      composer = null;
      renderPass = null;
      bloomPass = null;
      outputPass = null;
    };

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.inset = '0';
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.touchAction = 'none';
      renderer.domElement.setAttribute(
        'aria-label',
        "Interactive drivable village with Jim's Garage, Matt's Farm, Sam's Beach, and Nordy's Bar",
      );
      container.prepend(renderer.domElement);

      pmremGenerator = new THREE.PMREMGenerator(renderer);
      const environmentScene = new RoomEnvironment();
      envRT = pmremGenerator.fromScene(environmentScene, 0.04);
      environmentScene.dispose();
      scene.environment = envRT.texture;
      scene.environmentIntensity = 0.38;

      textures = createWorkshopTextures();
      world = buildVillageWorld(scene, textures);
      vehicles = createVehicleController(scene);
      vehicles.setVisible(false);
      room = buildGarageRoom(scene, textures);
      stationScene = buildProjectStations(JIM_STATIONS, textures);
      scene.add(stationScene.root);
      farm = buildMattsFarm(scene, FARM_STATIONS, textures);
      samBeach = buildSamsBeach(scene, SAM_STATIONS, textures);
      nordyBar = buildNordysBar(scene, NORDY_STATIONS, textures);
    } catch {
      queueMicrotask(() => setWebglFailed(true));
      return () => {
        disposeComposer();
        stationScene?.dispose();
        room?.dispose();
        farm?.dispose();
        samBeach?.dispose();
        nordyBar?.dispose();
        vehicles?.dispose();
        world?.dispose();
        textures?.disposeAll();
        scene.environment = null;
        envRT?.dispose();
        pmremGenerator?.dispose();
        audio.dispose();
        audioRef.current = null;
        renderer?.dispose();
        renderer?.domElement.remove();
      };
    }

    const activeRenderer = renderer;
    const activeWorld = world;
    const activeVehicles = vehicles;
    const activeRoom = room;
    const activeFarm = farm;
    const activeSamBeach = samBeach;
    const activeNordyBar = nordyBar;
    const activeStations = stationScene;
    const activeTextures = textures;
    const stationLifecycle = activeStations as typeof activeStations & {
      update?: (elapsed: number, dt: number) => void;
      setLightingMode?: (mode: LightingMode, blend: number) => void;
    };
    const stationConfigs = new Map(
      GARAGE_STATIONS.map((station) => [station.id, station]),
    );
    const stationHandles = new Map<StationId, StationHandle>(
      activeStations.handles,
    );
    const plotHandles = [activeFarm, activeSamBeach, activeNordyBar];
    plotHandles.forEach((plot) => {
      plot.handles.forEach((handle, id) => stationHandles.set(id, handle));
    });
    const jimStationMeshes = Array.from(activeStations.handles.values()).flatMap(
      (handle) => handle.hitMeshes,
    );
    const farmStationMeshes = Array.from(activeFarm.handles.values()).flatMap(
      (handle) => handle.hitMeshes,
    );
    const samStationMeshes = Array.from(activeSamBeach.handles.values()).flatMap(
      (handle) => handle.hitMeshes,
    );
    const nordyStationMeshes = Array.from(activeNordyBar.handles.values()).flatMap(
      (handle) => handle.hitMeshes,
    );
    const stationMeshes: Record<BuildingId, THREE.Object3D[]> = {
      jim: jimStationMeshes,
      matt: farmStationMeshes,
      sam: samStationMeshes,
      nordy: nordyStationMeshes,
    };
    const buildingStations: Record<BuildingId, GarageStation[]> = {
      jim: JIM_STATIONS,
      matt: FARM_STATIONS,
      sam: SAM_STATIONS,
      nordy: NORDY_STATIONS,
    };

    try {
      composer = new EffectComposer(activeRenderer);
      renderPass = new RenderPass(scene, camera);
      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(
          Math.max(container.clientWidth, 1),
          Math.max(container.clientHeight, 1),
        ),
        0.36,
        0.45,
        0.84,
      );
      outputPass = new OutputPass();
      composer.addPass(renderPass);
      composer.addPass(bloomPass);
      composer.addPass(outputPass);
    } catch {
      disposeComposer();
    }

    const ambient = new THREE.AmbientLight('#b9c9e8', 0.35);
    const hemisphere = new THREE.HemisphereLight('#b9d7ff', '#30271e', 0.55);
    const sunlight = new THREE.DirectionalLight('#fff0d2', 0.35);
    sunlight.position.set(3.5, 7.5, 6);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.set(2048, 2048);
    sunlight.shadow.camera.left = -8;
    sunlight.shadow.camera.right = 8;
    sunlight.shadow.camera.top = 8;
    sunlight.shadow.camera.bottom = -8;
    sunlight.shadow.camera.near = 0.5;
    sunlight.shadow.camera.far = 25;
    sunlight.shadow.bias = -0.0004;
    const workLight = new THREE.SpotLight('#ffd09a', 42, 13, 0.82, 0.65, 1.6);
    workLight.position.set(0, 3.45, -0.8);
    workLight.target.position.set(0, 0.6, -1.6);
    workLight.castShadow = true;
    workLight.shadow.mapSize.set(2048, 2048);
    workLight.shadow.bias = -0.0005;
    scene.add(ambient, hemisphere, sunlight, workLight, workLight.target);

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const pointerGoal = new THREE.Vector2();
    const pointerCurrent = new THREE.Vector2();
    const lookGoal = new THREE.Vector2();
    const lookCurrent = new THREE.Vector2();
    const desiredPosition = new THREE.Vector3();
    const desiredTarget = new THREE.Vector3();
    const projectedAnchor = new THREE.Vector3();
    let motion: CameraMotion | null = null;
    let doorProgress = 0;
    let farmDoorProgress = 0;
    let samDoorProgress = 0;
    let nordyDoorProgress = 0;
    let dayBlend = 0;
    let hoveredId: StationId | null = null;
    let hoveredEasterEggId: EasterEggId | null = null;
    let hoveredSwitch = false;
    let hoveredDoor = false;
    let selectedId: StationId | null = null;
    let lastProjectedLabel: ProjectedLabel | null = null;
    let lastTouchProjectedLabels: ProjectedLabel[] | null = null;
    let lastTouchProjectionAt = -Infinity;
    let lastDriveSpeedUpdate = -Infinity;
    let currentViewPreset: ViewPreset = 'center';
    let animationFrame = 0;
    let disposed = false;
    let lastFrameAt = performance.now();
    let pointerDown = false;
    let dragPointerId: number | null = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragLastX = 0;
    let dragLastY = 0;
    let dragDistance = 0;
    let dragging = false;
    let exteriorSwipePointerId: number | null = null;
    let exteriorSwipeStartX = 0;
    let exteriorSwipeStartY = 0;
    let toastTimeout: number | null = null;
    const driveInput: DriveInput = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false,
    };
    const idleDriveInput: DriveInput = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false,
    };

    const getPlot = (building: BuildingId): PlotHandle | FarmHandle | null => {
      if (building === 'matt') return activeFarm;
      if (building === 'sam') return activeSamBeach;
      if (building === 'nordy') return activeNordyBar;
      return null;
    };

    const getBuildingPose = (
      building: BuildingId,
      interior = false,
    ): CameraPose => {
      if (building === 'matt') {
        return interior ? FARM_CAMERA_POSES.interior : FARM_CAMERA_POSES.exterior;
      }
      if (building === 'sam') {
        return interior ? SAM_CAMERA_POSES.interior : SAM_CAMERA_POSES.exterior;
      }
      if (building === 'nordy') {
        return interior ? NORDY_CAMERA_POSES.interior : NORDY_CAMERA_POSES.exterior;
      }
      return interior
        ? CAMERA_POSES.interior
        : getExteriorPose(camera.aspect, camera.fov);
    };

    const getDoorProgress = (building: BuildingId) => {
      if (building === 'matt') return farmDoorProgress;
      if (building === 'sam') return samDoorProgress;
      if (building === 'nordy') return nordyDoorProgress;
      return doorProgress;
    };

    const setDoorProgress = (building: BuildingId, progress: number) => {
      if (building === 'matt') farmDoorProgress = progress;
      else if (building === 'sam') samDoorProgress = progress;
      else if (building === 'nordy') nordyDoorProgress = progress;
      else doorProgress = progress;
      getPlot(building)?.setDoorProgress(progress);
      if (building === 'jim') activeRoom.setDoorProgress(progress);
    };

    const closeAllDoors = () => {
      BUILDING_ORDER.forEach((building) => setDoorProgress(building, 0));
    };

    const playDoorAudio = (building: BuildingId, opening: boolean) => {
      if (building === 'matt') audio.playBarnDoor(opening);
      else if (building === 'sam') audio.playBeachHutDoor(opening);
      else if (building === 'nordy') audio.playBarHatch(opening);
      else audio.playDoor(opening);
    };

    const clearDriveInput = () => {
      (Object.keys(driveInput) as (keyof DriveInput)[]).forEach((control) => {
        driveInput[control] = false;
      });
    };

    const changeStage = (next: GarageStage) => {
      stageRef.current = next;
      setStage(next);
    };

    const updateCursor = () => {
      if (dragging) {
        activeRenderer.domElement.style.cursor = 'grabbing';
      } else if (hoveredId || hoveredEasterEggId || hoveredSwitch || hoveredDoor) {
        activeRenderer.domElement.style.cursor = 'pointer';
      } else if (stageRef.current === 'interior') {
        activeRenderer.domElement.style.cursor = pointerDown ? 'grabbing' : 'grab';
      } else {
        activeRenderer.domElement.style.cursor = 'default';
      }
    };

    const clearHover = () => {
      if (hoveredId) {
        stationHandles.get(hoveredId)?.setHovered(false);
        hoveredId = null;
        setHoveredStationId(null);
      }
      hoveredEasterEggId = null;
      hoveredSwitch = false;
      hoveredDoor = false;
      activeRoom.setDoorHovered(false);
      activeRoom.setSwitchHovered(false);
      activeFarm.setDoorHovered(false);
      activeSamBeach.setDoorHovered(false);
      activeNordyBar.setDoorHovered(false);
      lastProjectedLabel = null;
      lastTouchProjectedLabels = null;
      setProjectedLabels([]);
      setHoverHint(null);
      updateCursor();
    };

    const setHoveredStation = (id: StationId | null) => {
      if (hoveredId === id) return;
      if (hoveredId) stationHandles.get(hoveredId)?.setHovered(false);
      hoveredId = id;
      if (id) {
        stationHandles.get(id)?.setHovered(true);
        audio.playHover();
      }
      setHoveredStationId(id);
      if (!id && !isTouchDeviceRef.current) {
        lastProjectedLabel = null;
        setProjectedLabels([]);
      }
      updateCursor();
    };

    const clearSelection = () => {
      if (selectedId) stationHandles.get(selectedId)?.setSelected(false);
      selectedId = null;
      setSelectedStationId(null);
    };

    const resetLook = () => {
      pointerGoal.set(0, 0);
      lookGoal.set(0, 0);
    };

    const panToViewPreset = (preset: ViewPreset) => {
      if (preset === 'left') {
        lookGoal.set(-0.92, 0);
      } else if (preset === 'right') {
        lookGoal.set(0.92, 0.04);
      } else {
        lookGoal.set(0, 0);
      }
    };

    const updateActiveViewPreset = () => {
      const next =
        lookGoal.x < -0.45 ? 'left' : lookGoal.x > 0.45 ? 'right' : 'center';
      if (next !== currentViewPreset) {
        currentViewPreset = next;
        setActiveViewPreset(next);
      }
    };

    const beginMotion = (
      kind: MotionKind,
      pose: CameraPose,
      duration: number,
      toDoor = getDoorProgress(activeBuildingRef.current),
    ) => {
      const destination = motionPose(pose);
      motion = {
        kind,
        startedAt: performance.now(),
        duration,
        fromPosition: camera.position.clone(),
        fromTarget: currentTarget.clone(),
        toPosition: destination.position,
        toTarget: destination.target,
        fromDoor: getDoorProgress(activeBuildingRef.current),
        toDoor,
      };
    };

    const stepBuilding = (direction: -1 | 1) => {
      const index = BUILDING_ORDER.indexOf(activeBuildingRef.current);
      const next = BUILDING_ORDER[index + direction];
      if (next) switchBuilding(next);
    };

    const switchBuilding = (target: BuildingId) => {
      if (stageRef.current === 'driving') {
        stopDriving(target);
        return;
      }
      if (
        target === activeBuildingRef.current &&
        stageRef.current === 'exterior'
      ) {
        return;
      }
      clearHover();
      clearSelection();
      resetLook();
      pointerCurrent.set(0, 0);
      lookCurrent.set(0, 0);
      closeAllDoors();
      activeBuildingRef.current = target;
      setActiveBuilding(target);
      changeStage('opening');
      try {
        window.sessionStorage.removeItem(DOOR_STORAGE_KEY);
      } catch {
      }
      beginMotion(
        'building-switch',
        getBuildingPose(target),
        BUILDING_SWITCH_DURATION,
        0,
      );
    };

    const startDoorMotion = (open: boolean) => {
      const building = activeBuildingRef.current;
      clearHover();
      clearSelection();
      resetLook();
      playDoorAudio(building, open);
      changeStage('opening');
      beginMotion(
        open ? 'door-open' : 'door-close',
        getBuildingPose(building, open),
        DOOR_DURATION,
        open ? 1 : 0,
      );
    };

    const openGarage = () => {
      if (
        stageRef.current === 'exterior' ||
        (stageRef.current === 'opening' && motion?.kind === 'door-close')
      ) {
        startDoorMotion(true);
      }
    };

    const closeGarage = () => {
      if (
        stageRef.current === 'interior' ||
        stageRef.current === 'inspecting' ||
        (stageRef.current === 'opening' && motion?.kind === 'door-open')
      ) {
        startDoorMotion(false);
      }
    };

    const toggleGarageLighting = () => {
      const next = lightingModeRef.current === 'night' ? 'day' : 'night';
      lightingModeRef.current = next;
      setLightingMode(next);
      audio.playLightSwitch(next === 'day');
    };

    const toggleWorkshopMute = () => {
      const next = !audio.isMuted();
      audio.setMuted(next);
      setIsMuted(next);
    };

    const inspectStation = (id: StationId) => {
      if (stageRef.current !== 'interior') return;
      const station = stationConfigs.get(id);
      if (!station) return;
      clearHover();
      clearSelection();
      resetLook();
      selectedId = id;
      stationHandles.get(id)?.setSelected(true);
      setSelectedStationId(id);
      audio.playSelect();
      changeStage('inspecting');
      beginMotion(
        'inspect',
        getInspectPose(station, camera.aspect, window.innerWidth < 768),
        CAMERA_DURATION,
      );
    };

    const stepBack = () => {
      if (stageRef.current !== 'inspecting' || motion?.kind === 'return') return;
      clearSelection();
      resetLook();
      beginMotion(
        'return',
        getBuildingPose(activeBuildingRef.current, true),
        CAMERA_DURATION,
      );
    };

    function startDriving(): void {
      if (stageRef.current === 'driving') return;
      clearHover();
      clearSelection();
      resetLook();
      closeAllDoors();
      clearDriveInput();
      benchListOpenRef.current = false;
      setIsBenchListOpen(false);
      try {
        window.sessionStorage.removeItem(DOOR_STORAGE_KEY);
      } catch {
      }
      const building = activeBuildingRef.current;
      activeVehicles.placeAtBuilding(building);
      activeVehicles.setVisible(true);
      setActiveVehicle(activeVehicles.getVehicle());
      nearBuildingRef.current = building;
      setNearBuilding(building);
      setDriveSpeed(0);
      lastDriveSpeedUpdate = -Infinity;
      changeStage('driving');
      activeVehicles.getChaseCamera(desiredPosition, desiredTarget);
      beginMotion(
        'drive-start',
        {
          position: desiredPosition.toArray() as [number, number, number],
          target: desiredTarget.toArray() as [number, number, number],
        },
        700,
        0,
      );
    }

    function stopDriving(targetBuilding?: BuildingId): void {
      if (stageRef.current !== 'driving') return;
      const target =
        targetBuilding ?? nearBuildingRef.current ?? activeBuildingRef.current;
      clearDriveInput();
      clearHover();
      clearSelection();
      resetLook();
      activeVehicles.setVisible(false);
      nearBuildingRef.current = null;
      setNearBuilding(null);
      setDriveSpeed(0);
      activeBuildingRef.current = target;
      setActiveBuilding(target);
      changeStage('opening');
      beginMotion(
        'drive-stop',
        getBuildingPose(target),
        BUILDING_SWITCH_DURATION,
        0,
      );
    }

    const honkHorn = () => {
      if (stageRef.current !== 'driving') return;
      activeVehicles.triggerHornEffect();
      audio.playHorn(activeVehicles.getVehicle());
    };

    const showToast = (message: string) => {
      if (toastTimeout !== null) window.clearTimeout(toastTimeout);
      setToastMessage(message);
      toastTimeout = window.setTimeout(() => {
        setToastMessage(null);
        toastTimeout = null;
      }, TOAST_DURATION);
    };

    controlsRef.current = {
      openDoor: openGarage,
      closeDoor: closeGarage,
      toggleLighting: toggleGarageLighting,
      selectStation: inspectStation,
      dismissInspection: stepBack,
      panToView: panToViewPreset,
      switchBuilding,
      startDriving,
      stopDriving,
      selectVehicle: (vehicle) => {
        activeVehicles.setVehicle(vehicle);
        setActiveVehicle(vehicle);
      },
      honkHorn,
      driveTouchInput: (control, pressed) => {
        driveInput[control] = pressed;
      },
    };

    let restoreInterior = false;
    try {
      restoreInterior = window.sessionStorage.getItem(DOOR_STORAGE_KEY) === '1';
    } catch {
      restoreInterior = false;
    }
    const initialAspect =
      Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1);
    const initialPose = restoreInterior
      ? CAMERA_POSES.interior
      : getExteriorPose(initialAspect, getAdaptiveFov(initialAspect));
    camera.position.fromArray(initialPose.position);
    currentTarget.fromArray(initialPose.target);
    camera.lookAt(currentTarget);
    closeAllDoors();
    setDoorProgress('jim', restoreInterior ? 1 : 0);
    changeStage(restoreInterior ? 'interior' : 'exterior');

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      camera.aspect = width / height;
      camera.fov = getAdaptiveFov(camera.aspect);
      camera.updateProjectionMatrix();
      const yawLimit = camera.aspect < 0.9 ? 1.08 : 0.55;
      lookGoal.x = THREE.MathUtils.clamp(lookGoal.x, -yawLimit, yawLimit);
      if (
        (stageRef.current === 'exterior' || stageRef.current === 'interior') &&
        motion === null
      ) {
        const pose = getBuildingPose(
          activeBuildingRef.current,
          stageRef.current === 'interior',
        );
        camera.position.fromArray(pose.position);
        currentTarget.fromArray(pose.target);
        camera.lookAt(currentTarget);
      }
      activeRenderer.setPixelRatio(pixelRatio);
      activeRenderer.setSize(width, height, false);
      if (composer) {
        composer.setPixelRatio(pixelRatio);
        composer.setSize(width, height);
        bloomPass?.setSize(width, height);
      }
    };

    const raycastFromEvent = (event: PointerEvent) => {
      const bounds = activeRenderer.domElement.getBoundingClientRect();
      pointerNdc.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointerNdc, camera);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (stageRef.current === 'exterior') {
        if (event.pointerType === 'touch' && exteriorSwipePointerId === null) {
          exteriorSwipePointerId = event.pointerId;
          exteriorSwipeStartX = event.clientX;
          exteriorSwipeStartY = event.clientY;
          try {
            activeRenderer.domElement.setPointerCapture(event.pointerId);
          } catch {
          }
        }
        return;
      }
      if (stageRef.current !== 'interior') return;
      pointerDown = true;
      dragPointerId = event.pointerId;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragLastX = event.clientX;
      dragLastY = event.clientY;
      dragDistance = 0;
      dragging = false;
      pointerGoal.set(0, 0);
      try {
        activeRenderer.domElement.setPointerCapture(event.pointerId);
      } catch {
      }
      updateCursor();
    };

    const onPointerMove = (event: PointerEvent) => {
      raycastFromEvent(event);
      if (!pointerDown) pointerGoal.copy(pointerNdc);

      if (pointerDown && event.pointerId === dragPointerId) {
        const dx = event.clientX - dragLastX;
        const dy = event.clientY - dragLastY;
        dragLastX = event.clientX;
        dragLastY = event.clientY;
        dragDistance = Math.hypot(
          event.clientX - dragStartX,
          event.clientY - dragStartY,
        );
        if (dragDistance > 6) {
          if (!dragging) {
            dragging = true;
            clearHover();
          }
          const yawLimit = camera.aspect < 0.9 ? 1.08 : 0.55;
          const dragSensitivity = isTouchDeviceRef.current ? 0.0055 : 0.004;
          lookGoal.x = THREE.MathUtils.clamp(
            lookGoal.x - dx * dragSensitivity,
            -yawLimit,
            yawLimit,
          );
          lookGoal.y = THREE.MathUtils.clamp(
            lookGoal.y - dy * 0.003,
            -0.18,
            0.18,
          );
          updateCursor();
          return;
        }
      }

      if (
        event.pointerId === exteriorSwipePointerId &&
        Math.hypot(
          event.clientX - exteriorSwipeStartX,
          event.clientY - exteriorSwipeStartY,
        ) > 6
      ) {
        if (hoveredDoor) clearHover();
        return;
      }

      if (stageRef.current === 'exterior') {
        const building = activeBuildingRef.current;
        const plot = getPlot(building);
        const easterEggHit = raycaster.intersectObjects(
          plot?.exteriorEasterEggHitMeshes ?? [],
          false,
        )[0];
        const easterEggId = easterEggHit?.object.userData.easterEggId as
          | EasterEggId
          | undefined;
        if (easterEggId) {
          if (hoveredEasterEggId !== easterEggId) audio.playHover();
          hoveredEasterEggId = easterEggId;
          hoveredDoor = false;
          activeRoom.setDoorHovered(false);
          activeFarm.setDoorHovered(false);
          activeSamBeach.setDoorHovered(false);
          activeNordyBar.setDoorHovered(false);
          setHoverHint(EASTER_EGG_HINTS[easterEggId]);
          updateCursor();
          return;
        }
        hoveredEasterEggId = null;
        setHoverHint(null);
        const overDoor =
          raycaster.intersectObjects(
            plot?.doorHitMeshes ?? activeRoom.doorHitMeshes,
            false,
          ).length > 0;
        if (overDoor && !hoveredDoor) audio.playHover();
        hoveredDoor = overDoor;
        activeRoom.setDoorHovered(overDoor && building === 'jim');
        activeFarm.setDoorHovered(overDoor && building === 'matt');
        activeSamBeach.setDoorHovered(overDoor && building === 'sam');
        activeNordyBar.setDoorHovered(overDoor && building === 'nordy');
        updateCursor();
        return;
      }
      if (stageRef.current !== 'interior') return;

      const building = activeBuildingRef.current;
      const plot = getPlot(building);
      const overSwitch =
        building === 'jim' &&
        raycaster.intersectObjects(activeRoom.switchHitMeshes, false).length > 0;
      if (overSwitch) {
        setHoveredStation(null);
        hoveredEasterEggId = null;
        if (!hoveredSwitch) audio.playHover();
        hoveredSwitch = true;
        activeRoom.setSwitchHovered(true);
        setHoverHint('Light Switch (T)');
        updateCursor();
        return;
      }
      hoveredSwitch = false;
      activeRoom.setSwitchHovered(false);

      const easterEggHit = raycaster.intersectObjects(
        plot?.interiorEasterEggHitMeshes ?? activeRoom.easterEggHitMeshes,
        false,
      )[0];
      const easterEggId = easterEggHit?.object.userData.easterEggId as
        | EasterEggId
        | undefined;
      if (easterEggId) {
        setHoveredStation(null);
        if (hoveredEasterEggId !== easterEggId) audio.playHover();
        hoveredEasterEggId = easterEggId;
        setHoverHint(EASTER_EGG_HINTS[easterEggId]);
        updateCursor();
        return;
      }
      hoveredEasterEggId = null;

      const stationHit = raycaster.intersectObjects(
        stationMeshes[building],
        false,
      )[0];
      const id = stationHit?.object.userData.stationId as StationId | undefined;
      setHoveredStation(id ?? null);
      setHoverHint(null);
      updateCursor();
    };

    const onPointerUp = (event: PointerEvent) => {
      const wasExteriorSwipe = event.pointerId === exteriorSwipePointerId;
      if (wasExteriorSwipe) {
        const dx = event.clientX - exteriorSwipeStartX;
        const dy = event.clientY - exteriorSwipeStartY;
        exteriorSwipePointerId = null;
        try {
          activeRenderer.domElement.releasePointerCapture(event.pointerId);
        } catch {
        }
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) {
          if (stageRef.current === 'exterior' && motion === null) {
            stepBuilding(dx < 0 ? 1 : -1);
          }
          dragDistance = 0;
          updateCursor();
          return;
        }
      }

      const wasInteriorDrag =
        pointerDown && event.pointerId === dragPointerId;
      const suppressSelection = wasInteriorDrag && dragDistance > 6;
      if (wasInteriorDrag) {
        pointerDown = false;
        dragPointerId = null;
        dragging = false;
        try {
          activeRenderer.domElement.releasePointerCapture(event.pointerId);
        } catch {
        }
      }

      raycastFromEvent(event);
      if (!suppressSelection) {
        const building = activeBuildingRef.current;
        const plot = getPlot(building);
        if (stageRef.current === 'exterior') {
          const easterEggHit = raycaster.intersectObjects(
            plot?.exteriorEasterEggHitMeshes ?? [],
            false,
          )[0];
          const easterEggId = easterEggHit?.object.userData.easterEggId as
            | EasterEggId
            | undefined;
          if (easterEggId) {
            const message = plot?.triggerEasterEgg(easterEggId) ?? '';
            audio.playEasterEgg(easterEggId);
            if (message) showToast(message);
          } else if (
            raycaster.intersectObjects(
              plot?.doorHitMeshes ?? activeRoom.doorHitMeshes,
              false,
            ).length > 0
          ) {
            openGarage();
          }
        } else if (stageRef.current === 'interior') {
          if (
            building === 'jim' &&
            raycaster.intersectObjects(activeRoom.switchHitMeshes, false).length > 0
          ) {
            toggleGarageLighting();
          } else {
            const easterEggHit = raycaster.intersectObjects(
              plot?.interiorEasterEggHitMeshes ?? activeRoom.easterEggHitMeshes,
              false,
            )[0];
            const easterEggId = easterEggHit?.object.userData.easterEggId as
              | EasterEggId
              | undefined;
            if (easterEggId) {
              const message = plot
                ? plot.triggerEasterEgg(easterEggId)
                : activeRoom.triggerEasterEgg(easterEggId);
              audio.playEasterEgg(easterEggId);
              if (message) showToast(message);
            } else {
              const stationHit = raycaster.intersectObjects(
                stationMeshes[building],
                false,
              )[0];
              const id = stationHit?.object.userData.stationId as
                | StationId
                | undefined;
              if (id) inspectStation(id);
            }
          }
        } else if (stageRef.current === 'inspecting') {
          stepBack();
        }
      }
      dragDistance = 0;
      updateCursor();
    };

    const endPointerDrag = () => {
      pointerDown = false;
      dragPointerId = null;
      exteriorSwipePointerId = null;
      dragDistance = 0;
      dragging = false;
      pointerGoal.set(0, 0);
      clearHover();
    };

    const onPointerLeave = () => {
      pointerGoal.set(0, 0);
      if (!pointerDown) clearHover();
    };

    const onWheel = (event: WheelEvent) => {
      if (stageRef.current !== 'exterior' || motion !== null) return;
      if (
        Math.abs(event.deltaX) > Math.abs(event.deltaY) &&
        Math.abs(event.deltaX) > 12
      ) {
        event.preventDefault();
        stepBuilding(event.deltaX > 0 ? 1 : -1);
        return;
      }
      if (event.deltaY > 25 && activeBuildingRef.current === 'jim') {
        event.preventDefault();
        openGarage();
      }
    };

    const getDriveControl = (key: string): keyof DriveInput | null => {
      if (key === 'w' || key === 'arrowup') return 'forward';
      if (key === 's' || key === 'arrowdown') return 'backward';
      if (key === 'a' || key === 'arrowleft') return 'left';
      if (key === 'd' || key === 'arrowright') return 'right';
      return null;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (stageRef.current === 'driving') {
          stopDriving();
        } else if (benchListOpenRef.current) {
          benchListOpenRef.current = false;
          setIsBenchListOpen(false);
        } else {
          stepBack();
        }
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      if (stageRef.current === 'driving') {
        const control = getDriveControl(key);
        if (control) {
          event.preventDefault();
          driveInput[control] = true;
          return;
        }
        if (key === ' ') {
          event.preventDefault();
          if (!event.repeat) honkHorn();
          return;
        }
        if (key === 'e') {
          event.preventDefault();
          if (!event.repeat && nearBuildingRef.current) {
            stopDriving(nearBuildingRef.current);
          }
          return;
        }
      } else if (key === 'd') {
        event.preventDefault();
        if (!event.repeat) startDriving();
        return;
      }

      if (key === 'm') {
        if (!event.repeat) toggleWorkshopMute();
        return;
      }
      if (key === 'l') {
        if (!event.repeat) {
          const next = !benchListOpenRef.current;
          benchListOpenRef.current = next;
          setIsBenchListOpen(next);
        }
        return;
      }
      if (key === 't') {
        if (!event.repeat) toggleGarageLighting();
        return;
      }
      if (
        stageRef.current === 'exterior' &&
        (event.key === 'ArrowRight' || event.key === 'ArrowLeft')
      ) {
        event.preventDefault();
        if (!event.repeat && motion === null) {
          stepBuilding(event.key === 'ArrowRight' ? 1 : -1);
        }
        return;
      }
      if (
        stageRef.current === 'exterior' &&
        (event.key === 'Enter' || event.key === ' ')
      ) {
        event.preventDefault();
        if (!event.repeat) openGarage();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const control = getDriveControl(event.key.toLowerCase());
      if (control) {
        driveInput[control] = false;
        if (stageRef.current === 'driving') event.preventDefault();
      }
    };

    const onWindowBlur = () => {
      clearDriveInput();
      endPointerDrag();
    };

    const animate = (now: number) => {
      if (disposed) return;
      const dt = Math.min(Math.max((now - lastFrameAt) / 1000, 0), 0.05);
      lastFrameAt = now;
      const elapsed = now / 1000;
      const isDriving = stageRef.current === 'driving';
      const driveState = activeVehicles.update(
        elapsed,
        dt,
        isDriving ? driveInput : idleDriveInput,
        activeWorld.obstacles,
        activeWorld.worldBounds,
      );
      if (isDriving) {
        if (nearBuildingRef.current !== driveState.nearBuilding) {
          nearBuildingRef.current = driveState.nearBuilding;
          setNearBuilding(driveState.nearBuilding);
        }
        if (now - lastDriveSpeedUpdate >= 125) {
          lastDriveSpeedUpdate = now;
          setDriveSpeed(driveState.speed * 3.6);
        }
      }

      if (motion) {
        const progress = THREE.MathUtils.clamp(
          (now - motion.startedAt) / motion.duration,
          0,
          1,
        );
        const eased = easeInOutCubic(progress);
        camera.position.lerpVectors(motion.fromPosition, motion.toPosition, eased);
        currentTarget.lerpVectors(motion.fromTarget, motion.toTarget, eased);
        if (motion.kind === 'door-open' || motion.kind === 'door-close') {
          const nextDoorProgress = THREE.MathUtils.lerp(
            motion.fromDoor,
            motion.toDoor,
            eased,
          );
          setDoorProgress(activeBuildingRef.current, nextDoorProgress);
        }
        if (progress === 1) {
          const completedMotion = motion.kind;
          motion = null;
          if (completedMotion === 'door-open') {
            changeStage('interior');
            if (activeBuildingRef.current === 'jim') {
              try {
                window.sessionStorage.setItem(DOOR_STORAGE_KEY, '1');
              } catch {
              }
            }
          } else if (completedMotion === 'door-close') {
            changeStage('exterior');
            try {
              window.sessionStorage.removeItem(DOOR_STORAGE_KEY);
            } catch {
            }
          } else if (completedMotion === 'return') {
            changeStage('interior');
          } else if (
            completedMotion === 'building-switch' ||
            completedMotion === 'drive-stop'
          ) {
            changeStage('exterior');
          }
        }
      } else if (stageRef.current === 'driving') {
        activeVehicles.getChaseCamera(desiredPosition, desiredTarget);
        const damping = 1 - Math.exp(-6.5 * dt);
        camera.position.lerp(desiredPosition, damping);
        currentTarget.lerp(desiredTarget, damping);
      } else if (stageRef.current === 'interior') {
        const damping = 1 - Math.exp(-7 * dt);
        pointerCurrent.lerp(pointerGoal, damping);
        lookCurrent.lerp(lookGoal, damping);
        const building = activeBuildingRef.current;
        const interiorPose = getBuildingPose(building, true);
        const lookDistance = building === 'jim' ? 6.35 : 4.55;
        const yawLimit = camera.aspect < 0.9 ? 1.08 : 0.55;
        const baseYaw =
          building === 'jim' && camera.aspect < 0.9
            ? 0
            : Math.atan2(
                interiorPose.target[0] - interiorPose.position[0],
                interiorPose.position[2] - interiorPose.target[2],
              );
        const yaw =
          baseYaw +
          THREE.MathUtils.clamp(
            lookCurrent.x + pointerCurrent.x * 0.045,
            -yawLimit,
            yawLimit,
          );
        const pitch = THREE.MathUtils.clamp(
          lookCurrent.y + pointerCurrent.y * 0.025,
          -0.18,
          0.18,
        );
        desiredPosition.fromArray(interiorPose.position);
        desiredPosition.x += pointerCurrent.x * 0.035;
        desiredPosition.y += pointerCurrent.y * 0.02;
        desiredTarget.set(
          desiredPosition.x + Math.sin(yaw) * lookDistance,
          interiorPose.target[1] + Math.sin(pitch) * 4.5,
          desiredPosition.z - Math.cos(yaw) * lookDistance,
        );
        camera.position.lerp(desiredPosition, damping);
        currentTarget.lerp(desiredTarget, damping);
      }
      updateActiveViewPreset();
      camera.lookAt(currentTarget);

      const focusX = isDriving ? driveState.x : camera.position.x;
      const insideBuilding =
        stageRef.current === 'interior' || stageRef.current === 'inspecting';
      activeFarm.setActiveLights?.(
        Math.abs(focusX - 12.8) <= 20 ||
          (insideBuilding && activeBuildingRef.current === 'matt'),
      );
      activeSamBeach.setActiveLights?.(
        Math.abs(focusX + 14) <= 20 ||
          (insideBuilding && activeBuildingRef.current === 'sam'),
      );
      activeNordyBar.setActiveLights?.(
        Math.abs(focusX + 28) <= 20 ||
          (insideBuilding && activeBuildingRef.current === 'nordy'),
      );

      const blendDamping = 1 - Math.exp(-5.5 * dt);
      const targetBlend = lightingModeRef.current === 'day' ? 1 : 0;
      dayBlend = THREE.MathUtils.lerp(dayBlend, targetBlend, blendDamping);
      activeWorld.setLightingMode(lightingModeRef.current, dayBlend);
      activeVehicles.setLightingMode(lightingModeRef.current, dayBlend);
      activeRoom.setLightingMode(lightingModeRef.current, dayBlend);
      activeFarm.setLightingMode(lightingModeRef.current, dayBlend);
      activeSamBeach.setLightingMode(lightingModeRef.current, dayBlend);
      activeNordyBar.setLightingMode(lightingModeRef.current, dayBlend);
      stationLifecycle.setLightingMode?.(lightingModeRef.current, dayBlend);
      scene.environmentIntensity = THREE.MathUtils.lerp(0.38, 0.95, dayBlend);
      if (bloomPass) {
        bloomPass.strength = THREE.MathUtils.lerp(0.36, 0.18, dayBlend);
      }
      ambient.intensity = THREE.MathUtils.lerp(0.12, 0.45, dayBlend);
      hemisphere.intensity = THREE.MathUtils.lerp(0.2, 0.75, dayBlend);
      sunlight.intensity = THREE.MathUtils.lerp(0.15, 1.4, dayBlend);
      workLight.intensity = THREE.MathUtils.lerp(18, 6, dayBlend);

      activeWorld.update(elapsed, dt);
      activeRoom.update(elapsed, dt);
      activeFarm.update(elapsed, dt);
      activeSamBeach.update(elapsed, dt);
      activeNordyBar.update(elapsed, dt);
      if (stationLifecycle.update) {
        stationLifecycle.update(elapsed, dt);
      } else {
        activeStations.handles.forEach((handle) => handle.update(elapsed, dt));
      }
      if (composer) {
        composer.render();
      } else {
        activeRenderer.render(scene, camera);
      }

      if (isTouchDeviceRef.current && stageRef.current === 'interior') {
        lastProjectedLabel = null;
        if (now - lastTouchProjectionAt >= 1000 / 15) {
          lastTouchProjectionAt = now;
          const labels: ProjectedLabel[] = [];
          const visibleStations = buildingStations[activeBuildingRef.current];
          visibleStations.forEach((station) => {
            const handle = stationHandles.get(station.id);
            if (!handle) return;
            handle.group.getWorldPosition(projectedAnchor);
            projectedAnchor.project(camera);
            labels.push({
              id: station.id,
              name: station.name,
              tag: station.tag,
              category: station.category,
              x: (projectedAnchor.x * 0.5 + 0.5) * container.clientWidth,
              y: (-projectedAnchor.y * 0.5 + 0.5) * container.clientHeight,
              visible:
                projectedAnchor.z >= -1 &&
                projectedAnchor.z <= 1 &&
                Math.abs(projectedAnchor.x) <= 1 &&
                Math.abs(projectedAnchor.y) <= 1,
            });
          });
          const previousLabels = lastTouchProjectedLabels;
          const visibilityChanged =
            !previousLabels ||
            previousLabels.length !== labels.length ||
            labels.some((label, index) => {
              const previous = previousLabels[index];
              return (
                !previous ||
                previous.id !== label.id ||
                previous.visible !== label.visible
              );
            });
          const visibleLabelMoved = labels.some((label) => {
            if (!label.visible) return false;
            const previous = previousLabels?.find((item) => item.id === label.id);
            return (
              previous?.visible &&
              (Math.abs(previous.x - label.x) > 2 ||
                Math.abs(previous.y - label.y) > 2)
            );
          });
          if (visibilityChanged || visibleLabelMoved) {
            lastTouchProjectedLabels = labels;
            setProjectedLabels(labels);
          }
        }
      } else {
        if (lastTouchProjectedLabels) {
          lastTouchProjectedLabels = null;
          setProjectedLabels([]);
        }
        if (
          !isTouchDeviceRef.current &&
          hoveredId &&
          stageRef.current === 'interior'
        ) {
          const station = stationConfigs.get(hoveredId);
          const handle = stationHandles.get(hoveredId);
          if (station && handle) {
            handle.group.getWorldPosition(projectedAnchor);
            projectedAnchor.project(camera);
            const label: ProjectedLabel = {
              id: station.id,
              name: station.name,
              tag: station.tag,
              category: station.category,
              x: (projectedAnchor.x * 0.5 + 0.5) * container.clientWidth,
              y: (-projectedAnchor.y * 0.5 + 0.5) * container.clientHeight,
              visible:
                projectedAnchor.z >= -1 &&
                projectedAnchor.z <= 1 &&
                Math.abs(projectedAnchor.x) <= 1 &&
                Math.abs(projectedAnchor.y) <= 1,
            };
            if (
              !lastProjectedLabel ||
              lastProjectedLabel.id !== label.id ||
              lastProjectedLabel.visible !== label.visible ||
              Math.abs(lastProjectedLabel.x - label.x) > 0.25 ||
              Math.abs(lastProjectedLabel.y - label.y) > 0.25
            ) {
              lastProjectedLabel = label;
              setProjectedLabels([label]);
            }
          }
        }
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    updateCursor();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onWindowBlur);
    activeRenderer.domElement.addEventListener('pointerdown', onPointerDown);
    activeRenderer.domElement.addEventListener('pointermove', onPointerMove);
    activeRenderer.domElement.addEventListener('pointerup', onPointerUp);
    activeRenderer.domElement.addEventListener('pointercancel', endPointerDrag);
    activeRenderer.domElement.addEventListener('pointerleave', onPointerLeave);
    activeRenderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      if (toastTimeout !== null) window.clearTimeout(toastTimeout);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onWindowBlur);
      activeRenderer.domElement.removeEventListener('pointerdown', onPointerDown);
      activeRenderer.domElement.removeEventListener('pointermove', onPointerMove);
      activeRenderer.domElement.removeEventListener('pointerup', onPointerUp);
      activeRenderer.domElement.removeEventListener('pointercancel', endPointerDrag);
      activeRenderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      activeRenderer.domElement.removeEventListener('wheel', onWheel);
      controlsRef.current = null;
      audioRef.current = null;
      nearBuildingRef.current = null;
      audio.dispose();
      activeStations.dispose();
      activeRoom.dispose();
      activeFarm.dispose();
      activeSamBeach.dispose();
      activeNordyBar.dispose();
      activeVehicles.dispose();
      activeWorld.dispose();
      activeTextures.disposeAll();
      scene.remove(activeStations.root);
      scene.environment = null;
      envRT?.dispose();
      pmremGenerator?.dispose();
      disposeComposer();
      sunlight.shadow.dispose();
      workLight.shadow.dispose();
      activeRenderer.dispose();
      activeRenderer.domElement.remove();
    };
  }, []);

  const selectedStation = selectedStationId
    ? GARAGE_STATIONS.find((station) => station.id === selectedStationId) ?? null
    : null;

  if (webglFailed) {
    return (
      <BenchListView
        stations={GARAGE_STATIONS}
        isOpen
        isWebGLFallback
        isTouchDevice={isTouchDevice}
      />
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {stage === 'exterior' && hoverHint && (
        <div
          role="status"
          className="pointer-events-none absolute bottom-40 left-1/2 z-40 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full border border-white/10 bg-zinc-950/80 px-3 py-1.5 text-center text-[11px] font-medium text-zinc-200 shadow-lg shadow-black/20 backdrop-blur-md"
        >
          {hoverHint}
        </div>
      )}
      <GarageHUD
        stage={stage}
        lightingMode={lightingMode}
        isBenchListOpen={isBenchListOpen}
        hoveredStationId={hoveredStationId}
        selectedStationId={selectedStationId}
        projectedLabels={projectedLabels}
        onOpenDoor={openDoor}
        onCloseDoor={closeDoor}
        onToggleLighting={toggleLighting}
        onToggleBenchList={toggleBenchList}
        onSelectStation={selectStation}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        toastMessage={toastMessage}
        hoverHint={hoverHint}
        isTouchDevice={isTouchDevice}
        activeViewPreset={activeViewPreset}
        onPanView={panToView}
        activeBuilding={activeBuilding}
        onSwitchBuilding={switchBuilding}
        activeVehicle={activeVehicle}
        nearBuilding={nearBuilding}
        driveSpeed={driveSpeed}
        onStartDriving={startDriving}
        onStopDriving={stopDriving}
        onSelectVehicle={selectVehicle}
        onHonkHorn={honkHorn}
        onDriveTouchInput={driveTouchInput}
      />
      <ProjectDrawer
        station={selectedStation}
        onClose={dismissInspection}
        isTouchDevice={isTouchDevice}
      />
      <BenchListView
        stations={GARAGE_STATIONS}
        isOpen={isBenchListOpen}
        onClose={closeBenchList}
        isTouchDevice={isTouchDevice}
      />
    </div>
  );
}
