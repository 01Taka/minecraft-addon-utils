import type { Vector3 } from "@minecraft/server";

/**
 * 目標速度インパルス計算の入力パラメータ
 */
export interface CalculateVelocityImpulseParams {
  /**
   * 目標とする速度ベクトル (blocks/tick)。
   * 各軸で null または undefined を指定した場合は、その軸の外力制御を行わず現在の慣性・加速度を維持します。
   */
  targetVelocity: { x?: number | null; y?: number | null; z?: number | null };

  /**
   * 現在のエンティティ速度 (player.getVelocity())
   */
  currentVelocity: Vector3;

  /**
   * Y軸の速度維持率 (抗力係数: 0.0〜1.0。例: 通常空中 0.98)
   */
  dragY: number;

  /**
   * XZ軸の速度維持率 (抗力係数: 0.0〜1.0。例: 通常空中 0.91)
   */
  dragXZ: number;

  /**
   * 1Tickあたりの落下重力加速度 (blocks/tick)。
   * 重力による落下を相殺して水平/上昇制御したい場合は正の数値（通常 0.08）を指定します。相殺しない場合は 0 を指定します。
   */
  gravity: number;

  /**
   * 経過時間（Tick単位。デフォルト: 1.0）
   */
  deltaTimeTick?: number;

  /**
   * 追従の鋭さ・スプリング剛性。
   * null または未指定の場合は 1Tick 内で即座に目標速度へ到達（blend = 1.0）します。
   * 正の数値を指定すると、指数減衰補間により滑らかに加速・追従します。
   */
  stiffness?: number | null;

  /**
   * 1Tickあたりに加算できる最大速度変化量（リミッター）。
   * 急激な加速や過度な吹っ飛びを防ぎたい場合に指定します。
   */
  maxAcceleration?: number;
}

/**
 * 垂直浮上物理の計算に必要な環境パラメータ
 */
export interface LiftPhysicsEnvironment {
  /** 1Tickあたりの自由落下重力加速度 (blocks/tick。Vanilla 通常は 0.08) */
  gravity: number;
  /** Y軸の速度維持率 (抗力係数。Vanilla 空中は通常 0.98) */
  dragY: number;
}

/**
 * 浮上インパルス計算の結果
 */
export interface LiftImpulseResult {
  /** entity.applyImpulse() に直接渡すインパルスベクトル (X, Z は 0) */
  impulse: Vector3;
  /** 最高到達点（目標高度）に達するまでの経過Tick数 (整数) */
  ticksToApex: number;
  /** 最高到達点に達するまでの所要秒数 (ticksToApex / 20) */
  timeToApexSeconds: number;
  /** 逆算された垂直初速度 v0 (blocks/tick) */
  initialVelocityY: number;
}
