import * as THREE from "three";

export interface ProceduralPBRSet {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap?: THREE.CanvasTexture;
  dispose: () => void;
}

export interface WorkshopTextures {
  concrete: ProceduralPBRSet;
  butcherBlock: ProceduralPBRSet;
  brick: ProceduralPBRSet;
  brushedMetal: ProceduralPBRSet;
  leather: ProceduralPBRSet;
  pegboard: ProceduralPBRSet;
  disposeAll: () => void;
}

type Pixel = [number, number, number];
type CanvasPainter = (context: CanvasRenderingContext2D, seed: number) => void;
type PixelPainter = (x: number, y: number) => Pixel;
type Knot = { x: number; y: number; rx: number; ry: number };

const TEXTURE_SIZE = 512;

function seededRandom(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function hash01(x: number, y: number, seed: number): number {
  let value = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
  value = ((value ^ (value >>> 13)) * 1274126177) | 0;
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function signedHash(x: number, y: number, seed: number): number {
  return hash01(x, y, seed) * 2 - 1;
}

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

function mix(a: number, b: number, amount: number): number {
  return a + (b - a) * amount;
}

function noise(x: number, y: number, scaleX: number, scaleY: number, seed: number): number {
  const px = x / scaleX;
  const py = y / scaleY;
  const x0 = Math.floor(px);
  const y0 = Math.floor(py);
  const tx = smoothstep(px - x0);
  const ty = smoothstep(py - y0);
  const top = mix(hash01(x0, y0, seed), hash01(x0 + 1, y0, seed), tx);
  const bottom = mix(hash01(x0, y0 + 1, seed), hash01(x0 + 1, y0 + 1, seed), tx);
  return mix(top, bottom, ty);
}

function channel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function paintPixels(context: CanvasRenderingContext2D, painter: PixelPainter): void {
  const image = context.createImageData(TEXTURE_SIZE, TEXTURE_SIZE);
  for (let y = 0; y < TEXTURE_SIZE; y += 1) {
    for (let x = 0; x < TEXTURE_SIZE; x += 1) {
      const index = (y * TEXTURE_SIZE + x) * 4;
      const pixel = painter(x, y);
      image.data[index] = channel(pixel[0]);
      image.data[index + 1] = channel(pixel[1]);
      image.data[index + 2] = channel(pixel[2]);
      image.data[index + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
}

function paintCanvas(seed: number, painter: CanvasPainter): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("A 2D canvas context is required to create workshop textures.");
  }
  const random = seededRandom(seed);
  painter(context, Math.floor(random() * 2147483647));
  return canvas;
}

function canvasTexture(canvas: HTMLCanvasElement, srgb: boolean): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function createSet(
  seed: number,
  mapPainter: CanvasPainter,
  bumpPainter: CanvasPainter,
  roughnessPainter?: CanvasPainter,
): ProceduralPBRSet {
  const map = canvasTexture(paintCanvas(seed, mapPainter), true);
  const bumpMap = canvasTexture(paintCanvas(seed, bumpPainter), false);
  const roughnessMap = roughnessPainter
    ? canvasTexture(paintCanvas(seed, roughnessPainter), false)
    : undefined;
  let disposed = false;
  return {
    map,
    bumpMap,
    roughnessMap,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      map.dispose();
      bumpMap.dispose();
      roughnessMap?.dispose();
    },
  };
}

function concreteJoint(x: number, y: number): number {
  const distance = Math.min(Math.abs(x - 256), Math.abs(y - 256));
  if (distance < 1.25) return 1;
  if (distance < 3.25) return ((3.25 - distance) / 2) * 0.32;
  return 0;
}

function createConcrete(seed: number): ProceduralPBRSet {
  return createSet(
    seed,
    (context, textureSeed) => {
      paintPixels(context, (x, y) => {
        const broad = noise(x, y, 96, 96, textureSeed);
        const medium = noise(x, y, 17, 17, textureSeed + 1);
        const grain = signedHash(x, y, textureSeed + 2);
        const aggregate = hash01(x, y, textureSeed + 3) > 0.982
          ? signedHash(x, y, textureSeed + 4) * 30
          : 0;
        const oil = Math.min(1, Math.max(0, noise(x, y, 118, 82, textureSeed + 5) - 0.55) * 3.4);
        const joint = concreteJoint(x, y);
        const value = 112 + (broad - 0.5) * 26 + (medium - 0.5) * 15 + grain * 6
          + aggregate - oil * 27 - joint * 34;
        return [value + 4, value + 2, value - 3 - oil * 3];
      });
    },
    (context, textureSeed) => {
      paintPixels(context, (x, y) => {
        const grain = signedHash(x, y, textureSeed + 2);
        const aggregate = hash01(x, y, textureSeed + 3) > 0.982
          ? signedHash(x, y, textureSeed + 4) * 46
          : 0;
        const trowel = noise(x, y, 72, 25, textureSeed + 6);
        const value = 132 + grain * 13 + aggregate + (trowel - 0.5) * 18
          - concreteJoint(x, y) * 62;
        return [value, value, value];
      });
    },
    (context, textureSeed) => {
      paintPixels(context, (x, y) => {
        const medium = noise(x, y, 17, 17, textureSeed + 1);
        const oil = Math.min(1, Math.max(0, noise(x, y, 118, 82, textureSeed + 5) - 0.55) * 3.4);
        const grain = signedHash(x, y, textureSeed + 7);
        const value = 220 + (medium - 0.5) * 26 + grain * 9 - oil * 92
          + concreteJoint(x, y) * 13;
        return [value, value, value];
      });
    },
  );
}

function createKnots(seed: number): Knot[] {
  const random = seededRandom(seed);
  const knots: Knot[] = [];
  for (let index = 0; index < 5; index += 1) {
    knots.push({
      x: 35 + random() * 442,
      y: 20 + random() * 472,
      rx: 13 + random() * 22,
      ry: 4 + random() * 7,
    });
  }
  return knots;
}

function knotDistance(x: number, y: number, knots: Knot[]): number {
  let nearest = 10;
  for (let index = 0; index < knots.length; index += 1) {
    const knot = knots[index];
    const dx = (x - knot.x) / knot.rx;
    const dy = (y - knot.y) / knot.ry;
    nearest = Math.min(nearest, Math.sqrt(dx * dx + dy * dy));
  }
  return nearest;
}

function createButcherBlock(seed: number): ProceduralPBRSet {
  return createSet(
    seed,
    (context, textureSeed) => {
      const knots = createKnots(textureSeed);
      paintPixels(context, (x, y) => {
        const stave = Math.floor(y / 64);
        const localY = y % 64;
        const staveTone = signedHash(0, stave, textureSeed) * 15;
        const walnut = hash01(1, stave, textureSeed) > 0.73;
        const warp = noise(x, y, 92, 9, textureSeed + stave) * 8;
        const fiber = Math.sin(y * 2.25 + warp + stave * 1.7) * 4
          + (noise(x, y, 74, 2.2, textureSeed + 11) - 0.5) * 24;
        const pore = signedHash(x, y, textureSeed + 12) * 2.5;
        const knot = knotDistance(x, y, knots);
        const knotDark = knot < 1.35
          ? Math.max(0, 1 - knot / 1.35) * 52 + Math.sin(knot * 27) * 4
          : 0;
        const seam = localY < 2 ? 42 - localY * 13 : localY < 4 ? -7 : 0;
        const base = (walnut ? 116 : 164) + staveTone + fiber + pore - knotDark - seam;
        return walnut
          ? [base + 8, base * 0.68, base * 0.43]
          : [base + 15, base * 0.76, base * 0.47];
      });
    },
    (context, textureSeed) => {
      const knots = createKnots(textureSeed);
      paintPixels(context, (x, y) => {
        const stave = Math.floor(y / 64);
        const localY = y % 64;
        const warp = noise(x, y, 92, 9, textureSeed + stave) * 8;
        const fiber = Math.sin(y * 2.25 + warp + stave * 1.7) * 8
          + (noise(x, y, 74, 2.2, textureSeed + 11) - 0.5) * 25;
        const knot = knotDistance(x, y, knots);
        const knotGrain = knot < 1.35 ? Math.sin(knot * 27) * 17 : 0;
        const seam = localY < 2 ? 58 : localY < 4 ? -9 : 0;
        const value = 135 + fiber + knotGrain - seam + signedHash(x, y, textureSeed + 12) * 4;
        return [value, value, value];
      });
    },
    (context, textureSeed) => {
      paintPixels(context, (x, y) => {
        const stave = Math.floor(y / 64);
        const grain = noise(x, y, 74, 2.2, textureSeed + 11);
        const handWear = noise(x, y, 130, 100, textureSeed + 20);
        const value = 157 + grain * 33 + handWear * 24 + signedHash(x, y, textureSeed + 21) * 5
          + (y % 64 < 2 ? 25 : 0) + (stave % 2) * 3;
        return [value, value, value];
      });
    },
  );
}

function brickCoordinates(x: number, y: number): { row: number; column: number; bx: number; by: number } {
  const row = Math.floor(y / 64);
  const shiftedX = (x + (row % 2) * 64) % 512;
  return { row, column: Math.floor(shiftedX / 128), bx: shiftedX % 128, by: y % 64 };
}

function createBrick(seed: number): ProceduralPBRSet {
  return createSet(
    seed,
    (context, textureSeed) => {
      paintPixels(context, (x, y) => {
        const brick = brickCoordinates(x, y);
        const mortar = brick.bx < 6 || brick.by < 6;
        const grain = signedHash(x, y, textureSeed + 1);
        const cloud = noise(x, y, 34, 23, textureSeed + 2) - 0.5;
        if (mortar) {
          const mortarValue = 119 + cloud * 19 + grain * 10;
          return [mortarValue + 5, mortarValue + 2, mortarValue - 4];
        }
        const brickTone = signedHash(brick.column, brick.row, textureSeed + 3) * 20;
        const edgeDistance = Math.min(brick.bx - 6, 127 - brick.bx, brick.by - 6, 63 - brick.by);
        const edgeWear = Math.max(0, 1 - edgeDistance / 7) * 17;
        const pit = hash01(x, y, textureSeed + 4) > 0.974 ? 27 : 0;
        const value = 128 + brickTone + cloud * 31 + grain * 8 - edgeWear - pit;
        return [value + 30, value * 0.69, value * 0.51];
      });
    },
    (context, textureSeed) => {
      paintPixels(context, (x, y) => {
        const brick = brickCoordinates(x, y);
        const mortar = brick.bx < 6 || brick.by < 6;
        const grain = signedHash(x, y, textureSeed + 1);
        if (mortar) {
          const value = 67 + grain * 12 + noise(x, y, 12, 12, textureSeed + 5) * 18;
          return [value, value, value];
        }
        const pit = hash01(x, y, textureSeed + 4) > 0.974 ? 62 : 0;
        const value = 148 + grain * 18 + (noise(x, y, 18, 12, textureSeed + 6) - 0.5) * 31 - pit;
        return [value, value, value];
      });
    },
    (context, textureSeed) => {
      paintPixels(context, (x, y) => {
        const brick = brickCoordinates(x, y);
        const mortar = brick.bx < 6 || brick.by < 6;
        const value = (mortar ? 237 : 202) + signedHash(x, y, textureSeed + 7) * 16
          + noise(x, y, 24, 20, textureSeed + 8) * 15;
        return [value, value, value];
      });
    },
  );
}

function createBrushedMetal(seed: number): ProceduralPBRSet {
  return createSet(
    seed,
    (context, textureSeed) => {
      paintPixels(context, (x, y) => {
        const line = signedHash(0, y, textureSeed) * 15;
        const hairline = signedHash(x, y, textureSeed + 1) * 5;
        const longGrain = (noise(x, y, 110, 1.5, textureSeed + 2) - 0.5) * 23;
        const scratch = hash01(0, y, textureSeed + 3) > 0.987 ? 22 : 0;
        const value = 164 + line + hairline + longGrain + scratch;
        return [value - 3, value, value + 4];
      });
    },
    (context, textureSeed) => {
      paintPixels(context, (x, y) => {
        const line = signedHash(0, y, textureSeed) * 24;
        const hairline = signedHash(x, y, textureSeed + 1) * 9;
        const value = 128 + line + hairline
          + (noise(x, y, 110, 1.5, textureSeed + 2) - 0.5) * 26;
        return [value, value, value];
      });
    },
    (context, textureSeed) => {
      paintPixels(context, (x, y) => {
        const line = signedHash(0, y, textureSeed + 4) * 23;
        const value = 103 + line + signedHash(x, y, textureSeed + 5) * 8
          + noise(x, y, 90, 2, textureSeed + 6) * 31;
        return [value, value, value];
      });
    },
  );
}

function pebbleDistance(x: number, y: number, seed: number): number {
  const cellX = Math.floor(x / 13);
  const cellY = Math.floor(y / 13);
  let nearest = 1000;
  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      const gridX = cellX + offsetX;
      const gridY = cellY + offsetY;
      const centerX = (gridX + 0.15 + hash01(gridX, gridY, seed) * 0.7) * 13;
      const centerY = (gridY + 0.15 + hash01(gridX, gridY, seed + 1) * 0.7) * 13;
      const dx = x - centerX;
      const dy = y - centerY;
      nearest = Math.min(nearest, Math.sqrt(dx * dx + dy * dy));
    }
  }
  return Math.min(1, nearest / 8.5);
}

function createLeather(seed: number): ProceduralPBRSet {
  return createSet(
    seed,
    (context, textureSeed) => {
      paintPixels(context, (x, y) => {
        const pebble = pebbleDistance(x, y, textureSeed);
        const mottling = noise(x, y, 70, 70, textureSeed + 2) - 0.5;
        const pore = signedHash(x, y, textureSeed + 3) * 2;
        const value = 47 + pebble * 22 + mottling * 17 + pore;
        return [value + 19, value * 0.68, value * 0.54];
      });
    },
    (context, textureSeed) => {
      paintPixels(context, (x, y) => {
        const pebble = pebbleDistance(x, y, textureSeed);
        const value = 67 + pebble * 119 + signedHash(x, y, textureSeed + 3) * 7;
        return [value, value, value];
      });
    },
    (context, textureSeed) => {
      paintPixels(context, (x, y) => {
        const pebble = pebbleDistance(x, y, textureSeed);
        const value = 203 - pebble * 51 + noise(x, y, 70, 70, textureSeed + 2) * 24;
        return [value, value, value];
      });
    },
  );
}

function pegHole(x: number, y: number): number {
  const dx = (x % 64) - 32;
  const dy = (y % 64) - 32;
  return Math.sqrt(dx * dx + dy * dy);
}

function createPegboard(seed: number): ProceduralPBRSet {
  return createSet(
    seed,
    (context, textureSeed) => {
      paintPixels(context, (x, y) => {
        const hole = pegHole(x, y);
        const fiber = (noise(x, y, 85, 2.5, textureSeed) - 0.5) * 24
          + signedHash(x, y, textureSeed + 1) * 4;
        if (hole < 6.8) {
          const depth = 24 + hole * 2 + fiber * 0.15;
          return [depth + 9, depth * 0.72, depth * 0.43];
        }
        const rim = hole < 9.2 ? (hole < 8 ? -23 : 15) : 0;
        const value = 137 + fiber + rim + noise(x, y, 55, 45, textureSeed + 2) * 15;
        return [value + 21, value * 0.73, value * 0.43];
      });
    },
    (context, textureSeed) => {
      paintPixels(context, (x, y) => {
        const hole = pegHole(x, y);
        const fiber = (noise(x, y, 85, 2.5, textureSeed) - 0.5) * 29
          + signedHash(x, y, textureSeed + 1) * 5;
        let value = 143 + fiber;
        if (hole < 6.8) value = 27 + hole * 2;
        else if (hole < 8) value = 82;
        else if (hole < 9.2) value = 174;
        return [value, value, value];
      });
    },
    (context, textureSeed) => {
      paintPixels(context, (x, y) => {
        const hole = pegHole(x, y);
        const value = 190 + noise(x, y, 85, 2.5, textureSeed) * 31
          + (hole < 6.8 ? 35 : 0);
        return [value, value, value];
      });
    },
  );
}

export function createWorkshopTextures(): WorkshopTextures {
  const concrete = createConcrete(0x1a2b3c4d);
  const butcherBlock = createButcherBlock(0x2b3c4d5e);
  const brick = createBrick(0x3c4d5e6f);
  const brushedMetal = createBrushedMetal(0x4d5e6f70);
  const leather = createLeather(0x5e6f7081);
  const pegboard = createPegboard(0x6f708192);
  const sets = [concrete, butcherBlock, brick, brushedMetal, leather, pegboard];
  let disposed = false;
  return {
    concrete,
    butcherBlock,
    brick,
    brushedMetal,
    leather,
    pegboard,
    disposeAll: () => {
      if (disposed) return;
      disposed = true;
      sets.forEach((set) => set.dispose());
    },
  };
}
