import { type Vector3 } from "@minecraft/server";

export interface CalculateVelocityImpulseParams {
  /** 目標とする速度 (null または undefined の軸は制御せず速度を維持) */
  target: { x?: number | null; y?: number | null; z?: number | null };
  /** 現在のエンティティ速度 (player.getVelocity()) */
  current: Vector3;

  /**
   * Y軸の速度維持率 (抗力係数: 0.0〜1.0)
   */
  dragY: number;

  /**
   * XZ軸の速度維持率 (抗力係数: 0.0〜1.0)
   */
  dragXZ: number;

  /**
   * 1Tickあたりの落下重力加速度 (相殺する場合の正の数値。重力相殺なしなら 0)
   */
  gravity: number;

  /** 経過時間（Tick単位。デフォルト: 1.0） */
  deltaTimeTick?: number;
  /** 追従の鋭さ。nullの場合は即座に目標速度に到達（blend = 1.0）。デフォルト: null */
  stiffness?: number | null;
  /** 1Tickあたりに加算できる最大速度変化量（リミッター） */
  maxAcceleration?: number;
}

/**
 * 環境の物理特性（抗力・重力）を逆算し、目標速度に到達するためのインパルスを計算する純粋関数。
 * 外部の定数やデフォルト値には一切依存せず、渡された数値のみに基づいて計算します。
 */
export function calculateVelocityImpulse({
  target,
  current,
  dragY,
  dragXZ,
  gravity,
  deltaTimeTick = 1.0,
  stiffness = null,
  maxAcceleration,
}: CalculateVelocityImpulseParams): Vector3 {
  const finalDragY = Math.max(0.0001, dragY);
  const finalDragXZ = Math.max(0.0001, dragXZ);

  // 物理エンジン適用後に目標速度ピッタリになるよう逆算
  let adjustedTargetX =
    target.x !== null && target.x !== undefined ? target.x / finalDragXZ : null;
  let adjustedTargetY =
    target.y !== null && target.y !== undefined
      ? target.y / finalDragY + gravity
      : null;
  let adjustedTargetZ =
    target.z !== null && target.z !== undefined ? target.z / finalDragXZ : null;

  // deltaTime を考慮した追従率（指数減衰補間）。stiffness が null の場合は 1.0（即座に到達）
  const blend =
    stiffness === null
      ? 1.0
      : 1.0 - Math.exp(-stiffness * (deltaTimeTick / 20.0));

  // 各軸の差分に追従率を乗算
  let impulseX =
    (adjustedTargetX !== null ? adjustedTargetX - current.x : 0) * blend;
  let impulseY =
    (adjustedTargetY !== null ? adjustedTargetY - current.y : 0) * blend;
  let impulseZ =
    (adjustedTargetZ !== null ? adjustedTargetZ - current.z : 0) * blend;

  // 最大加速度（リミッター）の適用
  if (maxAcceleration !== undefined && maxAcceleration > 0) {
    const length = Math.hypot(impulseX, impulseY, impulseZ);
    if (length > maxAcceleration) {
      const factor = maxAcceleration / length;
      impulseX *= factor;
      impulseY *= factor;
      impulseZ *= factor;
    }
  }

  return { x: impulseX, y: impulseY, z: impulseZ };
}

/**
 * 垂直浮上物理の計算に必要な環境パラメータ
 */
export interface LiftPhysicsEnvironment {
  /** 1Tickあたりの落下重力加速度 (例: 0.08) */
  gravity: number;
  /** Y軸の速度維持率 (例: 0.98) */
  dragY: number;
}

export interface LiftImpulseResult {
  /** applyImpulse に渡すインパルスベクトル */
  impulse: Vector3;
  /** 最高高度（目標高度）に達するまでの経過Tick数 (整数) */
  ticksToApex: number;
  /** 最高高度に達するまでの秒数 (ticks / 20) */
  timeToApexSeconds: number;
  /** 算出された垂直初速度 v0 (blocks/tick) */
  initialVelocityY: number;
}

/**
 * 指定した環境物理のもとで、目標高度に必要な初速度と最高点到達Tick数を二分探索シミュレーションで逆算します。
 */
function solveLiftPhysics(
  targetHeight: number,
  environment: LiftPhysicsEnvironment,
): { initialVy: number; ticks: number } {
  if (targetHeight <= 0) return { initialVy: 0, ticks: 0 };

  const { gravity, dragY } = environment;
  let low = 0;
  let high = targetHeight * 0.8 + 2.0;

  // 1. 初速度 v0 を二分探索で特定 (25回の反復でミリ単位未満の精度)
  for (let i = 0; i < 25; i++) {
    const mid = (low + high) / 2;
    let v = mid;
    let h = 0;

    while (true) {
      v -= gravity;
      if (v <= 0) break;
      h += v;
      v *= dragY;
    }

    if (h < targetHeight) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const initialVy = (low + high) / 2;

  // 2. 確定した初速度で実機パイプラインを1回走らせ、最高点までのTick数をカウント
  let v = initialVy;
  let ticks = 0;
  while (true) {
    v -= gravity;
    if (v <= 0) break; // 上昇が止まり落下に転じた瞬間
    ticks++;
    v *= dragY;
  }

  return { initialVy, ticks };
}

/**
 * 指定したブロック数分浮き上がるのに必要なインパルスと、最高点到達までの時間を精密に計算します。
 * 環境物理定数（gravity, dragY）は必須引数として明示的に受け取ります。
 *
 * @param targetHeight 浮き上がりたいブロック数 (H > 0)
 * @param currentVelocity 現在のエンティティのベロシティ (player.getVelocity())
 * @param environment 物理環境設定 (gravity, dragY)
 */
export function calculateLiftImpulseAccurate(
  targetHeight: number,
  currentVelocity: Vector3,
  environment: LiftPhysicsEnvironment,
): LiftImpulseResult {
  if (targetHeight <= 0) {
    return {
      impulse: { x: 0, y: 0, z: 0 },
      ticksToApex: 0,
      timeToApexSeconds: 0,
      initialVelocityY: 0,
    };
  }

  // 1. 初速度とTick数を計算
  const { initialVy, ticks } = solveLiftPhysics(targetHeight, environment);

  // 2. 現在の速度との差分をインパルスとする
  const impulseY = initialVy - currentVelocity.y;

  return {
    impulse: { x: 0, y: impulseY, z: 0 },
    ticksToApex: ticks,
    timeToApexSeconds: ticks / 20.0,
    initialVelocityY: initialVy,
  };
}

/**
 * nティックかけて指定した高さ(H)分上昇するのに必要な初速度(インパルス)を計算します。
 *
 * @param nTick 上昇にかけるTick数 (n >= 1)
 * @param targetHeight 上昇したいブロック数
 * @param environment 物理環境設定 (gravity, dragY)
 */
export function calculateImpulseForNTicks(
  nTick: number,
  targetHeight: number,
  environment: LiftPhysicsEnvironment,
): number {
  if (nTick <= 0) return 0;

  const { gravity, dragY } = environment;
  const decay = 1.0 - dragY;
  if (Math.abs(decay) < 1e-6) {
    return (targetHeight + 0.5 * gravity * nTick * nTick) / nTick;
  }

  const numerator = decay * targetHeight + gravity * nTick;
  const denominator = 1.0 - Math.pow(dragY, nTick);

  return numerator / denominator - gravity / decay;
}
