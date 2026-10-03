import type { Vector3 } from "@minecraft/server";

/**
 * XZ平面（水平方向）の2次元ベクトル
 */
export type VectorXZ = { x: number; z: number };

/** 2次元AABB (XZ平面バウンディングボックス) */
export interface AABB2D {
  /** 最小点 (minX, minZ) */
  min: VectorXZ;
  /** 最大点 (maxX, maxZ) */
  max: VectorXZ;
}

/** 3次元AABB (直方体バウンディングボックス) */
export interface AABB {
  /** 最小点 (minX, minY, minZ) */
  min: Vector3;
  /** 最大点 (maxX, maxY, maxZ) */
  max: Vector3;
}

/** AABBとの最短距離および各軸の距離詳細 */
export interface AABBDistanceResult {
  /** XZ平面（水平方向）におけるAABBとの最短距離 (ブロック内側の場合は 0) */
  horizontal: number;
  /** Y軸（垂直方向）におけるAABBとの最短距離 (AABBの高さの内側にある場合は 0) */
  vertical: number;
  /** 3次元空間におけるAABBとの最短直線ユークリッド距離 */
  distance: number;
  /** 各軸におけるAABB外側へのはみ出し距離（内側にある軸は 0） */
  delta: {
    dx: number;
    dy: number;
    dz: number;
  };
  /**
   * AABB上面（maxY）を基準とした符号付き垂直距離 (point.y - maxY):
   * - 正: 上面より上
   * - 負: 上面より下 (AABB内部含む)
   * - 0: 上面と完全に一致
   */
  verticalTop: number;
  /**
   * AABB下面（minY）を基準とした符号付き垂直距離 (point.y - minY):
   * - 正: 下面より上 (AABB内部含む)
   * - 負: 下面より下
   * - 0: 下面と完全に一致
   */
  verticalBottom: number;
}

/**
 * 3次元空間の任意の点とAABBバウンディングボックス間の最短距離を計算します。
 *
 * @param point 測定対象の点（プレイヤー位置など）
 * @param aabb 測定対象のAABB { min, max }
 * @returns 水平最短距離、垂直最短距離、3D直線最短距離、上面/下面からの垂直距離を含む AABBDistanceResult
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
 * 水平ベクトルから最も近い面方向（東西南北）の単位ベクトル（Vector3）を返します。
 *
 * @param vectorXZ 水平方向ベクトル (x, z)
 * @returns 最も近い面方向の単位Vector3（East: {1,0,0}, West: {-1,0,0}, South: {0,0,1}, North: {0,0,-1}）。入力がゼロベクトルの場合は {0,0,0}。X成分とZ成分の絶対値が等しい場合はX軸成分を優先します
 */
export function getNearestFaceDirectionVector(vectorXZ: VectorXZ): Vector3 {
  const absX = Math.abs(vectorXZ.x);
  const absZ = Math.abs(vectorXZ.z);

  if (absX === 0 && absZ === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  if (absX >= absZ) {
    return { x: Math.sign(vectorXZ.x), y: 0, z: 0 };
  } else {
    return { x: 0, y: 0, z: Math.sign(vectorXZ.z) };
  }
}
