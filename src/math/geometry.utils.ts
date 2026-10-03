import type { Vector3 } from "@minecraft/server";

export type Vec2 = { x: number; z: number };

/** 2次元AABB (XZ平面) */
export interface AABB2D {
  /** 最小点 (minX, minZ) */
  min: Vec2;
  /** 最大点 (maxX, maxZ) */
  max: Vec2;
}

/** 3次元AABB */
export interface AABB {
  min: Vector3;
  max: Vector3;
}

/** AABBとの距離計算結果 */
export interface AABBDistanceResult {
  /** XZ平面（水平方向）のAABB最短距離 */
  horizontal: number;
  /** Y軸（垂直方向）のAABB最短距離 (内側にある場合は 0) */
  vertical: number;
  /** 3次元空間におけるAABB最短直線距離 */
  distance: number;
  /** 各軸の最短距離 (内側にある場合は 0) */
  delta: {
    dx: number;
    dy: number;
    dz: number;
  };
  /**
   * ブロック上面を基準とした垂直距離 (point.y - maxY):
   * - 正: 上面より上
   * - 負: 上面より下 (AABB範囲内含む)
   * - 0: 上面と一致
   */
  verticalTop: number;
  /**
   * ブロック下面を基準とした垂直距離 (point.y - minY):
   * - 正: 下面より上 (AABB範囲内含む)
   * - 負: 下面より下
   * - 0: 下面と一致
   */
  verticalBottom: number;
}

/**
 * 3次元空間の任意の点とAABBバウンディングボックス間の距離を計算します。
 *
 * @param point 測定対象の点
 * @param aabb 測定対象のAABB { min, max }
 * @returns 水平距離、垂直距離、直線距離を含む AABBDistanceResult
 */
export function calculatePointToAABBDistance(
  point: Vector3,
  aabb: AABB,
): AABBDistanceResult {
  const dx = Math.max(aabb.min.x - point.x, 0, point.x - aabb.max.x);
  const dy = Math.max(aabb.min.y - point.y, 0, point.y - aabb.max.y);
  const dz = Math.max(aabb.min.z - point.z, 0, point.z - aabb.max.z);

  const horizontal = Math.hypot(dx, dz);
  const vertical = dy;
  const distance = Math.hypot(dx, dy, dz);

  const verticalTop = point.y - aabb.max.y;
  const verticalBottom = point.y - aabb.min.y;

  return {
    horizontal,
    vertical,
    distance,
    delta: { dx, dy, dz },
    verticalTop,
    verticalBottom,
  };
}

/**
 * 水平ベクトルから最も近い面方向（東西南北）の単位ベクトルを返します。
 *
 * @param vec 水平方向ベクトル (x, z)
 * @returns 最も近い面方向の単位Vector3
 */
export function getNearestFaceDirection(vec: Vec2): Vector3 {
  const absX = Math.abs(vec.x);
  const absZ = Math.abs(vec.z);

  if (absX === 0 && absZ === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  if (absX >= absZ) {
    return { x: Math.sign(vec.x), y: 0, z: 0 };
  } else {
    return { x: 0, y: 0, z: Math.sign(vec.z) };
  }
}
