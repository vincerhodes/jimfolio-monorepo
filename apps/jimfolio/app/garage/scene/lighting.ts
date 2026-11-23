import * as THREE from "three";

export interface LightingRig {
  group: THREE.Group;
  setBlend: (dayBlend: number) => void;
  update: (elapsed: number) => void;
  dispose: () => void;
}

export function createLightingRig(scene: THREE.Scene): LightingRig {
  const group = new THREE.Group();
  group.name = "workshop-lighting";
  scene.add(group);

  const previousBackground = scene.background;
  const previousFog = scene.fog;
  const background = new THREE.Color("#080a10");
  const fog = new THREE.Fog("#080a10", 7, 21);
  scene.background = background;
  scene.fog = fog;

  const nightBackground = new THREE.Color("#080a10");
  const dayBackground = new THREE.Color("#cfe7ff");
  const nightFog = new THREE.Color("#080a10");
  const dayFog = new THREE.Color("#dbeafe");
  const nightSky = new THREE.Color("#28364f");
  const daySky = new THREE.Color("#f8fbff");
  const nightGround = new THREE.Color("#090b12");
  const dayGround = new THREE.Color("#94a3b8");

  const hemisphere = new THREE.HemisphereLight(nightSky, nightGround, 0.26);
  group.add(hemisphere);

  const ambient = new THREE.AmbientLight("#33415b", 0.055);
  group.add(ambient);

  const overhead = new THREE.SpotLight("#ffad57", 28, 14, 0.82, 0.66, 2);
  overhead.position.set(0, 3.62, -0.8);
  overhead.target.position.set(0, 0.1, -1.3);
  overhead.castShadow = true;
  overhead.shadow.mapSize.set(2048, 2048);
  overhead.shadow.camera.near = 0.2;
  overhead.shadow.camera.far = 15;
  overhead.shadow.bias = -0.0004;
  overhead.shadow.normalBias = 0.02;
  group.add(overhead, overhead.target);

  const sunlight = new THREE.DirectionalLight("#fff8e8", 0);
  sunlight.position.set(4.5, 6.5, 11);
  sunlight.target.position.set(0, 0.5, -2.5);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  sunlight.shadow.camera.left = -7;
  sunlight.shadow.camera.right = 7;
  sunlight.shadow.camera.top = 7;
  sunlight.shadow.camera.bottom = -7;
  sunlight.shadow.camera.near = 0.5;
  sunlight.shadow.camera.far = 26;
  sunlight.shadow.bias = -0.00025;
  sunlight.shadow.normalBias = 0.018;
  group.add(sunlight, sunlight.target);

  const fluorescentFill = new THREE.DirectionalLight("#f0f7ff", 0);
  fluorescentFill.position.set(-1.5, 4.1, -0.6);
  fluorescentFill.target.position.set(0, 0, -1.8);
  group.add(fluorescentFill, fluorescentFill.target);

  const neonBounce = new THREE.PointLight("#ff923f", 4.8, 5.2, 2);
  neonBounce.position.set(0, 3.12, -4.35);
  const leftBenchFill = new THREE.PointLight("#7fb7ff", 4.2, 5.4, 2);
  leftBenchFill.position.set(-4.25, 1.85, -1.85);
  const rightBenchFill = new THREE.PointLight("#ffc07a", 4.8, 5.4, 2);
  rightBenchFill.position.set(4.2, 1.75, -2.05);
  const galleryFill = new THREE.SpotLight("#ffd7a3", 8.5, 5.5, 0.88, 0.75, 2);
  galleryFill.position.set(4.98, 3.38, -1.8);
  galleryFill.target.position.set(5.32, 2.35, -1.8);
  group.add(neonBounce, leftBenchFill, rightBenchFill, galleryFill, galleryFill.target);

  let blend = 0;
  let overheadBase = 28;
  let neonBase = 4.8;

  const setBlend = (dayBlend: number) => {
    const t = THREE.MathUtils.clamp(dayBlend, 0, 1);
    const smooth = t * t * (3 - 2 * t);
    blend = smooth;

    background.copy(nightBackground).lerp(dayBackground, smooth);
    fog.color.copy(nightFog).lerp(dayFog, smooth);
    fog.near = THREE.MathUtils.lerp(7, 15, smooth);
    fog.far = THREE.MathUtils.lerp(21, 42, smooth);

    hemisphere.color.copy(nightSky).lerp(daySky, smooth);
    hemisphere.groundColor.copy(nightGround).lerp(dayGround, smooth);
    hemisphere.intensity = THREE.MathUtils.lerp(0.26, 2, smooth);
    ambient.color.copy(nightSky).lerp(daySky, smooth);
    ambient.intensity = THREE.MathUtils.lerp(0.055, 0.18, smooth);

    overheadBase = THREE.MathUtils.lerp(28, 0.45, smooth);
    overhead.intensity = overheadBase;
    sunlight.intensity = THREE.MathUtils.lerp(0, 3.5, smooth);
    fluorescentFill.intensity = THREE.MathUtils.lerp(0, 1.6, smooth);

    neonBase = THREE.MathUtils.lerp(4.8, 0.35, smooth);
    neonBounce.intensity = neonBase;
    leftBenchFill.intensity = THREE.MathUtils.lerp(4.2, 0.5, smooth);
    rightBenchFill.intensity = THREE.MathUtils.lerp(4.8, 0.55, smooth);
    galleryFill.intensity = THREE.MathUtils.lerp(8.5, 0.8, smooth);
  };

  const update = (elapsed: number) => {
    const nightAmount = 1 - blend;
    const flicker = 1 + nightAmount * (Math.sin(elapsed * 7.3) * 0.006 + Math.sin(elapsed * 17.1) * 0.003);
    overhead.intensity = overheadBase * flicker;
    neonBounce.intensity = neonBase * (1 + nightAmount * Math.sin(elapsed * 2.1) * 0.008);
  };

  const dispose = () => {
    scene.remove(group);
    if (scene.background === background) scene.background = previousBackground;
    if (scene.fog === fog) scene.fog = previousFog;
    overhead.shadow.dispose();
    sunlight.shadow.dispose();
    group.clear();
  };

  setBlend(0);

  return { group, setBlend, update, dispose };
}
