import type { Vector3 } from "@minecraft/server";

/**
 * 解決された方向ベクトルおよび正規化情報
 */
export interface DirectionData {
  /** 元の3次元ベクトル */
  vector: Vector3;
  /** XZ平面（水平方向）で正規化された単位ベクトル (yは常に0、長さは1。水平長が0の場合は { x: 0, y: 0, z: 0 }) */
  normalizedXZ: Vector3;
  /** 水平方向(XZ平面)の長さ・ノルム (Math.hypot(x, z)) */
  horizontalLength: number;
}
