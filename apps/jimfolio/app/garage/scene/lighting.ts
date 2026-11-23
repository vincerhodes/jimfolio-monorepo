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
  const background = new THREE.Color("#0b0d12");
  const fog = new THREE.Fog("#0b0d12", 8, 22);
  scene.background = background;
  scene.fog = fog;

  const nightBackground = new THREE.Color("#0b0d12");
  const dayBackground = new THREE.Color("#dbeafe");
  const nightSky = new THREE.Color("#1f2b44");
  const daySky = new THREE.Color("#e2ecf7");
  const nightGround = new THREE.Color("#11151d");
  const dayGround = new THREE.Color("#a7b7c8");
  const nightSun = new THREE.Color("#7891b8");
  const daySun = new THREE.Color("#fff3dc");

  const hemisphere = new THREE.HemisphereLight("#1f2b44", "#11151d", 0.75);
  group.add(hemisphere);

  const ambient = new THREE.AmbientLight("#1f2b44", 0.42);
  group.add(ambient);

  const overhead = new THREE.SpotLight("#ffb463", 72, 13, 0.79, 0.72, 2);
  overhead.position.set(0, 3.72, -0.8);
  overhead.target.position.set(0, 0.15, -1.35);
  overhead.castShadow = true;
  overhead.shadow.mapSize.set(1024, 1024);
  overhead.shadow.camera.near = 0.25;
  overhead.shadow.camera.far = 14;
  overhead.shadow.bias = -0.00035;
  overhead.shadow.normalBias = 0.025;
  group.add(overhead, overhead.target);

  const sunlight = new THREE.DirectionalLight("#fff3dc", 0.025);
  sunlight.position.set(2.8, 7.5, 8.5);
  sunlight.target.position.set(-1.2, 0, -2.2);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  sunlight.shadow.camera.left = -7;
  sunlight.shadow.camera.right = 7;
  sunlight.shadow.camera.top = 7;
  sunlight.shadow.camera.bottom = -7;
  sunlight.shadow.camera.near = 0.5;
  sunlight.shadow.camera.far = 24;
  sunlight.shadow.bias = -0.00025;
  sunlight.shadow.normalBias = 0.018;
  group.add(sunlight, sunlight.target);

  const leftRim = new THREE.PointLight("#6ea8c9", 4.5, 5.5, 2);
  leftRim.position.set(-4.4, 1.65, -2.6);
  const rightRim = new THREE.PointLight("#ff9e55", 5.5, 5.5, 2);
  rightRim.position.set(4.35, 1.55, -2.25);
  const backRim = new THREE.PointLight("#4f79a6", 3.2, 4.5, 2);
  backRim.position.set(0, 2.2, -4.55);
  group.add(leftRim, rightRim, backRim);

  const bulbGeometry = new THREE.SphereGeometry(0.075, 16, 12);
  const bulbMaterial = new THREE.MeshStandardMaterial({
    color: "#ffe0ae",
    emissive: "#ff9d45",
    emissiveIntensity: 5,
    roughness: 0.25,
  });
  const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
  bulb.position.set(0, 3.49, -0.8);
  group.add(bulb);

  const filament = new THREE.PointLight("#ffad5c", 2.8, 2.2, 2);
  filament.position.copy(bulb.position);
  group.add(filament);

  let blend = 0;
  let overheadBase = 72;
  let bulbBase = 5;
  let filamentBase = 2.8;

  const setBlend = (dayBlend: number) => {
    const t = THREE.MathUtils.clamp(dayBlend, 0, 1);
    const smooth = t * t * (3 - 2 * t);
    blend = smooth;

    background.copy(nightBackground).lerp(dayBackground, smooth);
    fog.color.copy(background);
    fog.near = THREE.MathUtils.lerp(8, 13, smooth);
    fog.far = THREE.MathUtils.lerp(22, 34, smooth);

    hemisphere.color.copy(nightSky).lerp(daySky, smooth);
    hemisphere.groundColor.copy(nightGround).lerp(dayGround, smooth);
    hemisphere.intensity = THREE.MathUtils.lerp(0.75, 2.6, smooth);
    ambient.color.copy(nightSky).lerp(daySky, smooth);
    ambient.intensity = THREE.MathUtils.lerp(0.42, 0.85, smooth);

    overheadBase = THREE.MathUtils.lerp(72, 8, smooth);
    overhead.intensity = overheadBase;
    sunlight.color.copy(nightSun).lerp(daySun, smooth);
    sunlight.intensity = THREE.MathUtils.lerp(0.025, 4.2, smooth);

    leftRim.intensity = THREE.MathUtils.lerp(4.5, 2.8, smooth);
    rightRim.intensity = THREE.MathUtils.lerp(5.5, 3.2, smooth);
    backRim.intensity = THREE.MathUtils.lerp(3.2, 2, smooth);
    bulbBase = THREE.MathUtils.lerp(5, 0.65, smooth);
    bulbMaterial.emissiveIntensity = bulbBase;
    filamentBase = THREE.MathUtils.lerp(2.8, 0.15, smooth);
    filament.intensity = filamentBase;
  };

  const update = (elapsed: number) => {
    const nightAmount = 1 - blend;
    const flicker = 1 + nightAmount * (Math.sin(elapsed * 7.3) * 0.008 + Math.sin(elapsed * 17.1) * 0.004);
    overhead.intensity = overheadBase * flicker;
    bulbMaterial.emissiveIntensity = bulbBase * flicker;
    filament.intensity = filamentBase * flicker;
  };

  const dispose = () => {
    scene.remove(group);
    if (scene.background === background) scene.background = previousBackground;
    if (scene.fog === fog) scene.fog = previousFog;
    overhead.shadow.dispose();
    sunlight.shadow.dispose();
    bulbGeometry.dispose();
    bulbMaterial.dispose();
    group.clear();
  };

  setBlend(0);

  return { group, setBlend, update, dispose };
}
