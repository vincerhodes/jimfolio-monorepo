'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GARAGE_STATIONS } from '../apps';
import { buildGarageRoom } from '../garage/scene/buildRoom';
import { buildProjectStations } from '../garage/scene/buildProps';
import {
  CAMERA_POSES,
  type CameraPose,
  type GarageStage,
  type LightingMode,
  type ProjectedLabel,
  type RoomHandle,
  type StationId,
} from '../garage/types';
import BenchListView from './BenchListView';
import GarageHUD from './GarageHUD';
import ProjectDrawer from './ProjectDrawer';

const DOOR_STORAGE_KEY = 'jimsgarage-door-open';
const DOOR_DURATION = 1100;
const CAMERA_DURATION = 1000;

type MotionKind = 'door-open' | 'door-close' | 'inspect' | 'return';

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

export default function GarageCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<GarageControls | null>(null);
  const stageRef = useRef<GarageStage>('exterior');
  const lightingModeRef = useRef<LightingMode>('night');
  const benchListOpenRef = useRef(false);
  const [stage, setStage] = useState<GarageStage>('exterior');
  const [lightingMode, setLightingMode] = useState<LightingMode>('night');
  const [isBenchListOpen, setIsBenchListOpen] = useState(false);
  const [hoveredStationId, setHoveredStationId] = useState<StationId | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<StationId | null>(null);
  const [projectedLabels, setProjectedLabels] = useState<ProjectedLabel[]>([]);
  const [webglFailed, setWebglFailed] = useState(false);

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
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let room: RoomHandle | null = null;
    let stationScene: ReturnType<typeof buildProjectStations> | null = null;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, 1, 0.05, 80);
    const currentTarget = new THREE.Vector3();
    const nightBackground = new THREE.Color('#0b0d12');
    const dayBackground = new THREE.Color('#202a30');
    const background = nightBackground.clone();
    scene.background = background;
    scene.fog = new THREE.Fog(nightBackground, 13, 32);

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
        "Interactive 3D Jim's Garage workshop",
      );
      container.prepend(renderer.domElement);

      room = buildGarageRoom(scene);
      stationScene = buildProjectStations(GARAGE_STATIONS);
      scene.add(stationScene.root);
    } catch {
      setWebglFailed(true);
      return () => {
        stationScene?.dispose();
        room?.dispose();
        renderer?.dispose();
        renderer?.domElement.remove();
      };
    }

    const activeRenderer = renderer;
    const activeRoom = room;
    const activeStations = stationScene;
    const stationConfigs = new Map(
      GARAGE_STATIONS.map((station) => [station.id, station]),
    );
    const stationMeshes = Array.from(activeStations.handles.values()).flatMap(
      (handle) => handle.hitMeshes,
    );

    const ambient = new THREE.AmbientLight('#b9c9e8', 0.35);
    const hemisphere = new THREE.HemisphereLight('#b9d7ff', '#30271e', 0.55);
    const sunlight = new THREE.DirectionalLight('#fff0d2', 0.35);
    sunlight.position.set(3.5, 7.5, 6);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.set(1024, 1024);
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
    workLight.shadow.mapSize.set(1024, 1024);
    workLight.shadow.bias = -0.0005;
    scene.add(ambient, hemisphere, sunlight, workLight, workLight.target);

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const pointerGoal = new THREE.Vector2();
    const pointerCurrent = new THREE.Vector2();
    const desiredPosition = new THREE.Vector3();
    const desiredTarget = new THREE.Vector3();
    const projectedAnchor = new THREE.Vector3();
    let motion: CameraMotion | null = null;
    let doorProgress = 0;
    let dayBlend = 0;
    let hoveredId: StationId | null = null;
    let selectedId: StationId | null = null;
    let lastProjectedLabel: ProjectedLabel | null = null;
    let animationFrame = 0;
    let disposed = false;
    let lastFrameAt = performance.now();

    const changeStage = (next: GarageStage) => {
      stageRef.current = next;
      setStage(next);
    };

    const updateCursor = () => {
      activeRenderer.domElement.style.cursor = hoveredId ? 'pointer' : 'default';
    };

    const clearHover = () => {
      if (hoveredId) {
        activeStations.handles.get(hoveredId)?.setHovered(false);
        hoveredId = null;
        setHoveredStationId(null);
      }
      activeRoom.setDoorHovered(false);
      activeRoom.setSwitchHovered(false);
      lastProjectedLabel = null;
      setProjectedLabels([]);
      updateCursor();
    };

    const setHoveredStation = (id: StationId | null) => {
      if (hoveredId === id) return;
      if (hoveredId) activeStations.handles.get(hoveredId)?.setHovered(false);
      hoveredId = id;
      if (id) activeStations.handles.get(id)?.setHovered(true);
      setHoveredStationId(id);
      if (!id) {
        lastProjectedLabel = null;
        setProjectedLabels([]);
      }
      updateCursor();
    };

    const clearSelection = () => {
      if (selectedId) activeStations.handles.get(selectedId)?.setSelected(false);
      selectedId = null;
      setSelectedStationId(null);
    };

    const beginMotion = (
      kind: MotionKind,
      pose: CameraPose,
      duration: number,
      toDoor = doorProgress,
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
        fromDoor: doorProgress,
        toDoor,
      };
    };

    const startDoorMotion = (open: boolean) => {
      clearHover();
      clearSelection();
      pointerGoal.set(0, 0);
      changeStage('opening');
      beginMotion(
        open ? 'door-open' : 'door-close',
        open ? CAMERA_POSES.interior : CAMERA_POSES.exterior,
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
    };

    const inspectStation = (id: StationId) => {
      if (stageRef.current !== 'interior') return;
      const station = stationConfigs.get(id);
      if (!station) return;
      clearHover();
      clearSelection();
      selectedId = id;
      activeStations.handles.get(id)?.setSelected(true);
      setSelectedStationId(id);
      changeStage('inspecting');
      beginMotion('inspect', station.inspectCamera, CAMERA_DURATION);
    };

    const stepBack = () => {
      if (stageRef.current !== 'inspecting' || motion?.kind === 'return') return;
      clearSelection();
      pointerGoal.set(0, 0);
      beginMotion('return', CAMERA_POSES.interior, CAMERA_DURATION);
    };

    controlsRef.current = {
      openDoor: openGarage,
      closeDoor: closeGarage,
      toggleLighting: toggleGarageLighting,
      selectStation: inspectStation,
      dismissInspection: stepBack,
    };

    let restoreInterior = false;
    try {
      restoreInterior = window.sessionStorage.getItem(DOOR_STORAGE_KEY) === '1';
    } catch {
      restoreInterior = false;
    }
    const initialPose = restoreInterior
      ? CAMERA_POSES.interior
      : CAMERA_POSES.exterior;
    camera.position.fromArray(initialPose.position);
    currentTarget.fromArray(initialPose.target);
    camera.lookAt(currentTarget);
    doorProgress = restoreInterior ? 1 : 0;
    activeRoom.setDoorProgress(doorProgress);
    changeStage(restoreInterior ? 'interior' : 'exterior');

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      activeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      activeRenderer.setSize(width, height, false);
    };

    const raycastFromEvent = (event: PointerEvent | MouseEvent) => {
      const bounds = activeRenderer.domElement.getBoundingClientRect();
      pointerNdc.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointerNdc, camera);
    };

    const onPointerMove = (event: PointerEvent) => {
      raycastFromEvent(event);
      pointerGoal.copy(pointerNdc);
      if (stageRef.current === 'exterior') {
        const overDoor =
          raycaster.intersectObjects(activeRoom.doorHitMeshes, false).length > 0;
        activeRoom.setDoorHovered(overDoor);
        activeRenderer.domElement.style.cursor = overDoor ? 'pointer' : 'default';
        return;
      }
      if (stageRef.current !== 'interior') return;

      const overSwitch =
        raycaster.intersectObjects(activeRoom.switchHitMeshes, false).length > 0;
      activeRoom.setSwitchHovered(overSwitch);
      if (overSwitch) {
        setHoveredStation(null);
        activeRenderer.domElement.style.cursor = 'pointer';
        return;
      }
      const stationHit = raycaster.intersectObjects(stationMeshes, false)[0];
      const id = stationHit?.object.userData.stationId as StationId | undefined;
      setHoveredStation(id ?? null);
      updateCursor();
    };

    const onPointerLeave = () => {
      pointerGoal.set(0, 0);
      clearHover();
    };

    const onCanvasClick = (event: MouseEvent) => {
      raycastFromEvent(event);
      if (stageRef.current === 'exterior') {
        if (raycaster.intersectObjects(activeRoom.doorHitMeshes, false).length > 0) {
          openGarage();
        }
        return;
      }
      if (stageRef.current === 'interior') {
        if (raycaster.intersectObjects(activeRoom.switchHitMeshes, false).length > 0) {
          toggleGarageLighting();
          return;
        }
        const stationHit = raycaster.intersectObjects(stationMeshes, false)[0];
        const id = stationHit?.object.userData.stationId as StationId | undefined;
        if (id) inspectStation(id);
        return;
      }
      if (stageRef.current === 'inspecting') stepBack();
    };

    const onWheel = (event: WheelEvent) => {
      if (stageRef.current === 'exterior' && event.deltaY > 0) {
        event.preventDefault();
        openGarage();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (benchListOpenRef.current) {
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

      if (event.key.toLowerCase() === 'l') {
        if (!event.repeat) {
          const next = !benchListOpenRef.current;
          benchListOpenRef.current = next;
          setIsBenchListOpen(next);
        }
        return;
      }
      if (event.key.toLowerCase() === 't') {
        if (!event.repeat) toggleGarageLighting();
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

    const animate = (now: number) => {
      if (disposed) return;
      const dt = Math.min(Math.max((now - lastFrameAt) / 1000, 0), 0.05);
      lastFrameAt = now;
      const elapsed = now / 1000;

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
          doorProgress = THREE.MathUtils.lerp(
            motion.fromDoor,
            motion.toDoor,
            eased,
          );
          activeRoom.setDoorProgress(doorProgress);
        }
        if (progress === 1) {
          const completedMotion = motion.kind;
          motion = null;
          if (completedMotion === 'door-open') {
            changeStage('interior');
            try {
              window.sessionStorage.setItem(DOOR_STORAGE_KEY, '1');
            } catch {
            }
          } else if (completedMotion === 'door-close') {
            changeStage('exterior');
            try {
              window.sessionStorage.removeItem(DOOR_STORAGE_KEY);
            } catch {
            }
          } else if (completedMotion === 'return') {
            changeStage('interior');
          }
        }
      } else if (stageRef.current === 'interior') {
        const damping = 1 - Math.exp(-5 * dt);
        pointerCurrent.lerp(pointerGoal, damping);
        desiredPosition.fromArray(CAMERA_POSES.interior.position);
        desiredTarget.fromArray(CAMERA_POSES.interior.target);
        desiredTarget.x += pointerCurrent.x * 0.65;
        desiredTarget.y += pointerCurrent.y * 0.22;
        camera.position.lerp(desiredPosition, damping);
        currentTarget.lerp(desiredTarget, damping);
      }
      camera.lookAt(currentTarget);

      const blendDamping = 1 - Math.exp(-5.5 * dt);
      const targetBlend = lightingModeRef.current === 'day' ? 1 : 0;
      dayBlend = THREE.MathUtils.lerp(dayBlend, targetBlend, blendDamping);
      activeRoom.setLightingMode(lightingModeRef.current, dayBlend);
      ambient.intensity = THREE.MathUtils.lerp(0.35, 0.8, dayBlend);
      hemisphere.intensity = THREE.MathUtils.lerp(0.55, 1.25, dayBlend);
      sunlight.intensity = THREE.MathUtils.lerp(0.35, 2.1, dayBlend);
      workLight.intensity = THREE.MathUtils.lerp(42, 15, dayBlend);
      background.lerpColors(nightBackground, dayBackground, dayBlend);
      if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(background);

      activeRoom.update(elapsed, dt);
      activeStations.handles.forEach((handle) => handle.update(elapsed, dt));
      activeRenderer.render(scene, camera);

      if (hoveredId && stageRef.current === 'interior') {
        const station = stationConfigs.get(hoveredId);
        const handle = activeStations.handles.get(hoveredId);
        if (station && handle) {
          handle.group.getWorldPosition(projectedAnchor);
          projectedAnchor.project(camera);
          const label: ProjectedLabel = {
            id: station.id,
            name: station.name,
            tag: station.tag,
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

      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', onKeyDown);
    activeRenderer.domElement.addEventListener('pointermove', onPointerMove);
    activeRenderer.domElement.addEventListener('pointerleave', onPointerLeave);
    activeRenderer.domElement.addEventListener('click', onCanvasClick);
    activeRenderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      activeRenderer.domElement.removeEventListener('pointermove', onPointerMove);
      activeRenderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      activeRenderer.domElement.removeEventListener('click', onCanvasClick);
      activeRenderer.domElement.removeEventListener('wheel', onWheel);
      controlsRef.current = null;
      activeStations.dispose();
      activeRoom.dispose();
      scene.remove(activeStations.root);
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
    return <BenchListView stations={GARAGE_STATIONS} isOpen isWebGLFallback />;
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
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
      />
      <ProjectDrawer station={selectedStation} onClose={dismissInspection} />
      <BenchListView
        stations={GARAGE_STATIONS}
        isOpen={isBenchListOpen}
        onClose={closeBenchList}
      />
    </div>
  );
}
