import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export interface OptimizeStaticOptions {
  exclude?: ReadonlyArray<THREE.Object3D | null | undefined>;
  minShadowSize?: number;
}

export interface OptimizeStaticStats {
  sourceMeshes: number;
  mergedMeshes: number;
  shadowCastersDisabled: number;
}

export function optimizeStaticMeshes(
  root: THREE.Object3D,
  options?: OptimizeStaticOptions,
): OptimizeStaticStats {
  const stats: OptimizeStaticStats = {
    sourceMeshes: 0,
    mergedMeshes: 0,
    shadowCastersDisabled: 0,
  };
  const excluded = new Set<THREE.Object3D>();
  for (const obj of options?.exclude ?? []) {
    if (obj) obj.traverse((descendant) => excluded.add(descendant));
  }

  root.updateMatrixWorld(true);
  const rootInverse = root.matrixWorld.clone().invert();
  const buckets = new Map<THREE.Material, Map<string, THREE.Mesh[]>>();
  const tmpVec = new THREE.Vector3();
  const minShadowSize = options?.minShadowSize ?? 0.55;

  root.traverse((obj) => {
    if (excluded.has(obj)) return;
    if (!(obj instanceof THREE.Mesh)) return;
    if (obj instanceof THREE.InstancedMesh || obj instanceof THREE.SkinnedMesh) return;
    if (!obj.visible || Array.isArray(obj.material)) return;
    if (obj.userData.dynamic || obj.userData.stationId || obj.userData.easterEggId || obj.userData.skipMerge) return;
    if (obj.material.transparent || !obj.geometry?.attributes.position || obj.children.length > 0) return;

    const size = new THREE.Box3().setFromObject(obj).getSize(tmpVec);
    if (obj.castShadow && Math.max(size.x, size.y, size.z) < minShadowSize) {
      obj.castShadow = false;
      stats.shadowCastersDisabled += 1;
    }

    let shadowBuckets = buckets.get(obj.material);
    if (!shadowBuckets) {
      shadowBuckets = new Map<string, THREE.Mesh[]>();
      buckets.set(obj.material, shadowBuckets);
    }
    const key = `${obj.castShadow}:${obj.receiveShadow}`;
    const meshes = shadowBuckets.get(key);
    if (meshes) meshes.push(obj);
    else shadowBuckets.set(key, [obj]);
  });

  buckets.forEach((shadowBuckets, material) => {
    shadowBuckets.forEach((meshes) => {
      if (meshes.length < 2) return;

      const hasUv = meshes.some((mesh) => Boolean(mesh.geometry.attributes.uv));
      const normalizedGeoms = meshes.map((mesh) => {
        const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
        const localMatrix = new THREE.Matrix4().multiplyMatrices(rootInverse, mesh.matrixWorld);
        geometry.applyMatrix4(localMatrix);
        if (!geometry.attributes.normal) geometry.computeVertexNormals();
        if (hasUv && !geometry.attributes.uv) {
          geometry.setAttribute(
            "uv",
            new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 2), 2),
          );
        }
        for (const name of Object.keys(geometry.attributes)) {
          if (name !== "position" && name !== "normal" && (!hasUv || name !== "uv")) {
            geometry.deleteAttribute(name);
          }
        }
        geometry.morphAttributes = {};
        geometry.groups = [];
        return geometry;
      });

      const merged = mergeGeometries(normalizedGeoms, false);
      normalizedGeoms.forEach((geometry) => geometry.dispose());
      if (!merged) return;

      const mergedMesh = new THREE.Mesh(merged, material);
      mergedMesh.castShadow = meshes[0].castShadow;
      mergedMesh.receiveShadow = meshes[0].receiveShadow;
      mergedMesh.name = "merged-static-batch";
      root.add(mergedMesh);

      const sourceGeometries = new Set<THREE.BufferGeometry>();
      for (const mesh of meshes) {
        sourceGeometries.add(mesh.geometry);
        mesh.parent?.remove(mesh);
      }
      const remainingGeometries = new Set<THREE.BufferGeometry>();
      root.traverse((obj) => {
        if (obj instanceof THREE.Mesh) remainingGeometries.add(obj.geometry);
      });
      sourceGeometries.forEach((geometry) => {
        if (!remainingGeometries.has(geometry)) geometry.dispose();
      });

      stats.mergedMeshes += 1;
      stats.sourceMeshes += meshes.length;
    });
  });

  return stats;
}
