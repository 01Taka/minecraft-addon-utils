import { Block, Direction, type Vector3 } from "@minecraft/server";

/**
 * 判定面に対するレイの定義情報
 */
export interface FaceRayDefinition {
  readonly name: string;
  readonly startLocation: Vector3;
  readonly direction: Vector3;
  readonly maxDistance: number;
}

/**
 * 指定した面の隣接ブロックを取得します。
 */
export function getAdjacentBlock(
  block: Block,
  face: Direction,
): Block | undefined {
  switch (face) {
    case Direction.Up:
      return block.above();
    case Direction.Down:
      return block.below();
    case Direction.North:
      return block.north();
    case Direction.South:
      return block.south();
    case Direction.East:
      return block.east();
    case Direction.West:
      return block.west();
    default:
      return undefined;
  }
}

/**
 * 方向（Direction）に対応する単位ベクトルを取得します。
 */
export function directionToVector(face: Direction): Vector3 {
  switch (face) {
    case Direction.Up:
      return { x: 0, y: 1, z: 0 };
    case Direction.Down:
      return { x: 0, y: -1, z: 0 };
    case Direction.North:
      return { x: 0, y: 0, z: -1 };
    case Direction.South:
      return { x: 0, y: 0, z: 1 };
    case Direction.East:
      return { x: 1, y: 0, z: 0 };
    case Direction.West:
      return { x: -1, y: 0, z: 0 };
    default:
      return { x: 0, y: 0, z: 0 };
  }
}

/**
 * 指定した面の反対面を取得します。
 */
export function getOppositeFace(face: Direction): Direction {
  switch (face) {
    case Direction.Up:
      return Direction.Down;
    case Direction.Down:
      return Direction.Up;
    case Direction.North:
      return Direction.South;
    case Direction.South:
      return Direction.North;
    case Direction.East:
      return Direction.West;
    case Direction.West:
      return Direction.East;
    default:
      return face;
  }
}

/**
 * 指定した面に対する照射レイ定義（中央1本、または4つ角4本）を生成します。
 *
 * @param block 対象ブロック
 * @param face レイを照射する面
 * @param isCornerMode 四つ角4本モードにするか（falseの場合は中央1本）
 */
export function getFaceRayDefinitions(
  block: Block,
  face: Direction,
  isCornerMode: boolean = false,
): FaceRayDefinition[] {
  const { x, y, z } = block.location;
  const OFFSET = 0.05;
  const C_MIN = 0.15;
  const C_MAX = 0.85;
  const MAX_DIST = 1.1;

  switch (face) {
    case Direction.Up: {
      const dir: Vector3 = { x: 0, y: -1, z: 0 };
      const startY = y + 1.0 + OFFSET;
      if (!isCornerMode) {
        return [
          {
            name: "Center",
            startLocation: { x: x + 0.5, y: startY, z: z + 0.5 },
            direction: dir,
            maxDistance: MAX_DIST,
          },
        ];
      }
      return [
        {
          name: "Top-NW",
          startLocation: { x: x + C_MIN, y: startY, z: z + C_MIN },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "Top-NE",
          startLocation: { x: x + C_MAX, y: startY, z: z + C_MIN },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "Top-SW",
          startLocation: { x: x + C_MIN, y: startY, z: z + C_MAX },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "Top-SE",
          startLocation: { x: x + C_MAX, y: startY, z: z + C_MAX },
          direction: dir,
          maxDistance: MAX_DIST,
        },
      ];
    }

    case Direction.Down: {
      const dir: Vector3 = { x: 0, y: 1, z: 0 };
      const startY = y - OFFSET;
      if (!isCornerMode) {
        return [
          {
            name: "Center",
            startLocation: { x: x + 0.5, y: startY, z: z + 0.5 },
            direction: dir,
            maxDistance: MAX_DIST,
          },
        ];
      }
      return [
        {
          name: "Bottom-NW",
          startLocation: { x: x + C_MIN, y: startY, z: z + C_MIN },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "Bottom-NE",
          startLocation: { x: x + C_MAX, y: startY, z: z + C_MIN },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "Bottom-SW",
          startLocation: { x: x + C_MIN, y: startY, z: z + C_MAX },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "Bottom-SE",
          startLocation: { x: x + C_MAX, y: startY, z: z + C_MAX },
          direction: dir,
          maxDistance: MAX_DIST,
        },
      ];
    }

    case Direction.North: {
      const dir: Vector3 = { x: 0, y: 0, z: 1 };
      const startZ = z - OFFSET;
      if (!isCornerMode) {
        return [
          {
            name: "Center",
            startLocation: { x: x + 0.5, y: y + 0.5, z: startZ },
            direction: dir,
            maxDistance: MAX_DIST,
          },
        ];
      }
      return [
        {
          name: "North-TL",
          startLocation: { x: x + C_MIN, y: y + C_MAX, z: startZ },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "North-TR",
          startLocation: { x: x + C_MAX, y: y + C_MAX, z: startZ },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "North-BL",
          startLocation: { x: x + C_MIN, y: y + C_MIN, z: startZ },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "North-BR",
          startLocation: { x: x + C_MAX, y: y + C_MIN, z: startZ },
          direction: dir,
          maxDistance: MAX_DIST,
        },
      ];
    }

    case Direction.South: {
      const dir: Vector3 = { x: 0, y: 0, z: -1 };
      const startZ = z + 1.0 + OFFSET;
      if (!isCornerMode) {
        return [
          {
            name: "Center",
            startLocation: { x: x + 0.5, y: y + 0.5, z: startZ },
            direction: dir,
            maxDistance: MAX_DIST,
          },
        ];
      }
      return [
        {
          name: "South-TL",
          startLocation: { x: x + C_MIN, y: y + C_MAX, z: startZ },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "South-TR",
          startLocation: { x: x + C_MAX, y: y + C_MAX, z: startZ },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "South-BL",
          startLocation: { x: x + C_MIN, y: y + C_MIN, z: startZ },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "South-BR",
          startLocation: { x: x + C_MAX, y: y + C_MIN, z: startZ },
          direction: dir,
          maxDistance: MAX_DIST,
        },
      ];
    }

    case Direction.West: {
      const dir: Vector3 = { x: 1, y: 0, z: 0 };
      const startX = x - OFFSET;
      if (!isCornerMode) {
        return [
          {
            name: "Center",
            startLocation: { x: startX, y: y + 0.5, z: z + 0.5 },
            direction: dir,
            maxDistance: MAX_DIST,
          },
        ];
      }
      return [
        {
          name: "West-TL",
          startLocation: { x: startX, y: y + C_MAX, z: z + C_MIN },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "West-TR",
          startLocation: { x: startX, y: y + C_MAX, z: z + C_MAX },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "West-BL",
          startLocation: { x: startX, y: y + C_MIN, z: z + C_MIN },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "West-BR",
          startLocation: { x: startX, y: y + C_MIN, z: z + C_MAX },
          direction: dir,
          maxDistance: MAX_DIST,
        },
      ];
    }

    case Direction.East: {
      const dir: Vector3 = { x: -1, y: 0, z: 0 };
      const startX = x + 1.0 + OFFSET;
      if (!isCornerMode) {
        return [
          {
            name: "Center",
            startLocation: { x: startX, y: y + 0.5, z: z + 0.5 },
            direction: dir,
            maxDistance: MAX_DIST,
          },
        ];
      }
      return [
        {
          name: "East-TL",
          startLocation: { x: startX, y: y + C_MAX, z: z + C_MIN },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "East-TR",
          startLocation: { x: startX, y: y + C_MAX, z: z + C_MAX },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "East-BL",
          startLocation: { x: startX, y: y + C_MIN, z: z + C_MIN },
          direction: dir,
          maxDistance: MAX_DIST,
        },
        {
          name: "East-BR",
          startLocation: { x: startX, y: y + C_MIN, z: z + C_MAX },
          direction: dir,
          maxDistance: MAX_DIST,
        },
      ];
    }

    default:
      return [];
  }
}
