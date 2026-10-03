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
