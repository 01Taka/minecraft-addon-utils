import { Player, type Vector2 } from "@minecraft/server";
import type { AABB } from "../math/geometry.utils";

/**
 * プレイヤーの物理ボタン入力状態を判定します。
 *
 * @param player 対象プレイヤー
 * @param buttonName 判定したいボタン名 (例: "Sneak", "Jump", "Sprint")
 * @returns 物理キーが押下されているか
 */
export function isInputButtonPressed(
  player: Player,
  buttonName: string,
): boolean {
  if (!player.isValid) return false;

  try {
    const input = (player as any).inputInfo;
    if (input && typeof input.getButtonState === "function") {
      const state = input.getButtonState(buttonName);
      if (state === "Pressed" || state === 1) {
        return true;
      }
    }
  } catch {}

  // "Sneak" の場合のフォールバック判定
  if (buttonName === "Sneak") {
    return player.isSneaking;
  }

  return false;
}

/**
 * プレイヤーが物理的にスニーク（シフト）キーを押下しているかを判定します。
 * 低所や匍匐（クロール）状態での自動スニークによる誤検知を防止します。
 */
export function isSneakButtonPressed(player: Player): boolean {
  return isInputButtonPressed(player, "Sneak");
}

/**
 * プレイヤーの移動入力が正面に対して何ラジアン傾いているかを返します。
 *
 * @param target Player オブジェクト、または Vector2 ({ x, y })
 * @returns 前方を 0 としたラジアン値（-π 〜 +π）。入力がない（静止状態）の場合は null。
 */
export function getMovementInputAngle(target: Player | Vector2): number | null {
  const vec: Vector2 =
    target instanceof Player ? target.inputInfo.getMovementVector() : target;

  if (vec.x === 0 && vec.y === 0) {
    return null;
  }

  // Minecraft の raw.x は左が正(+)、右が負(-)のため、-vec.x で反転して「右を正(+)、左を負(-)」として計算
  return Math.atan2(-vec.x, vec.y);
}

/**
 * プレイヤーのワールド座標系 AABB（境界ボックス）を取得します。
 * スニーク、泳ぎ、エリトラ滑空などの姿勢変化に対応します。
 */
export function getPlayerAABB(player: Player): AABB {
  const rawAABB = player.getAABB();
  const { center, extent } = rawAABB;
  return {
    min: {
      x: center.x - extent.x,
      y: center.y - extent.y,
      z: center.z - extent.z,
    },
    max: {
      x: center.x + extent.x,
      y: center.y + extent.y,
      z: center.z + extent.z,
    },
  };
}
