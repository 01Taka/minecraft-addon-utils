import { Block, Direction, type Vector3 } from "@minecraft/server";

/**
 * 基準ブロックの指定した面に隣接するブロックを取得します。
 *
 * @param block 基準となるブロック
 * @param direction 隣接面を調べる方向 (Direction.Up, Direction.Down, etc.)
 * @returns 隣接する Block オブジェクト。ワールド境界外や未ロードチャンクなど取得不能な場合は undefined
 */
export function getAdjacentBlock(
  block: Block,
  direction: Direction,
): Block | undefined {
  switch (direction) {
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
 * Minecraft の方向列挙値（Direction）に対応する単位ベクトル（長さ1の Vector3）を取得します。
 *
 * @param direction 変換する方向
 * @returns 各軸の単位ベクトル { x, y, z }。未知の方向の場合は { x: 0, y: 0, z: 0 }
 */
export function getDirectionVector(direction: Direction): Vector3 {
  switch (direction) {
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
 * 指定した方向と正反対の方向（Direction）を取得します。
 *
 * @param direction 基準となる方向
 * @returns 反対向きの Direction (例: Up -> Down, North -> South)
 */
export function getOppositeDirection(direction: Direction): Direction {
  switch (direction) {
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
      return direction;
  }
}
