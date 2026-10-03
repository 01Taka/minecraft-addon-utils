import { Player, type Vector2 } from "@minecraft/server";

/**
 * プレイヤーが物理的にスニーク（シフト）キーを押下しているかを判定します。
 * 低所や匍匐（クロール）状態での自動スニークによる誤検知を防止します。
 */
export function isSneakButtonPressed(player: Player): boolean {
  if (!player.isValid) return false;

  try {
    const input = (player as any).inputInfo;
    if (input && typeof input.getButtonState === "function") {
      const state = input.getButtonState("Sneak");
      if (state === "Pressed" || state === 1) {
        return true;
      }
    }
  } catch {}

  return player.isSneaking;
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
