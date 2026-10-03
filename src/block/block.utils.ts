import { Block, Direction, type Vector3 } from "@minecraft/server";

/**
 * 指定した面の隣接ブロックを取得します。
 *
 * @param block 基準ブロック
 * @param direction 取得する隣接面の方向
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
 * 指定した方向（Direction）に対応する単位ベクトルを取得します。
 *
 * @param direction 面の方向
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
 * 指定した方向の反対方向を取得します。
 *
 * @param direction 元の方向
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
