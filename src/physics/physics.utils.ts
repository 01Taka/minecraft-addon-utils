import { type Vector3 } from "@minecraft/server";
import type {
  CalculateVelocityImpulseParams,
  LiftPhysicsEnvironment,
  LiftImpulseResult,
} from "./physics.types";

export type {
  CalculateVelocityImpulseParams,
  LiftPhysicsEnvironment,
  LiftImpulseResult,
};

/**
 * 環境の物理特性（抗力・重力）を逆算し、目標速度に到達するためにエンティティへ加えるべきインパルスベクトルを計算します。
 * 外部の定数やデフォルト値には一切依存せず、引数として渡された数値のみに基づいて計算する純粋関数です。
 *
 * @param params 速度目標、現在速度、環境物理定数（dragY, dragXZ, gravity）を含む計算パラメータ
 * @returns entity.applyImpulse() に渡すためのインパルスベクトル (Vector3)
 */
export function calculateVelocityImpulse({
  targetVelocity,
  currentVelocity,
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
    targetVelocity.x !== null && targetVelocity.x !== undefined
      ? targetVelocity.x / finalDragXZ
      : null;
  let adjustedTargetY =
    targetVelocity.y !== null && targetVelocity.y !== undefined
      ? targetVelocity.y / finalDragY + gravity
      : null;
  let adjustedTargetZ =
    targetVelocity.z !== null && targetVelocity.z !== undefined
      ? targetVelocity.z / finalDragXZ
      : null;

  // deltaTime を考慮した追従率（指数減衰補間）。stiffness が null の場合は 1.0（即座に到達）
  const blend =
    stiffness === null
      ? 1.0
      : 1.0 - Math.exp(-stiffness * (deltaTimeTick / 20.0));

  // 各軸の差分に追従率を乗算
  let impulseX =
    (adjustedTargetX !== null ? adjustedTargetX - currentVelocity.x : 0) * blend;
  let impulseY =
    (adjustedTargetY !== null ? adjustedTargetY - currentVelocity.y : 0) * blend;
  let impulseZ =
    (adjustedTargetZ !== null ? adjustedTargetZ - currentVelocity.z : 0) * blend;

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
 * 指定したブロック数分浮き上がるのに必要な垂直インパルスと、最高点到達までの所要時間を精密に計算します。
 * ゲームエンジンの離散物理（重力と抗力）を二分探索シミュレーションで逆算するため、非線形な減衰下でも目標高度ピッタリで静止・降下に転じます。
 *
 * @param targetHeight 浮き上がりたいブロック数・高度差 (H > 0)
 * @param currentVelocity 現在のエンティティのベロシティ (player.getVelocity())
 * @param environment 物理環境設定 (gravity, dragY)
 * @returns applyImpulse に渡すインパルスおよび最高点到達Tick数を含む LiftImpulseResult
 */
export function calculateLiftImpulse(
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
