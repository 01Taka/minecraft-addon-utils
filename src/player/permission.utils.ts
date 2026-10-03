import { Player, CommandPermissionLevel } from "@minecraft/server";

/**
 * プレイヤーが管理者権限（OP権限、または "admin" / "op" タグ）を保持しているかを判定します。
 * 個人プレイ・マルチプレイ共通で安全に判定します。
 */
export function isPlayerAdmin(player: Player): boolean {
  if (!player.isValid) return false;

  try {
    if (
      typeof player.commandPermissionLevel === "number" &&
      player.commandPermissionLevel > CommandPermissionLevel.Any
    ) {
      return true;
    }
  } catch {}

  try {
    if (typeof (player as any).isOp === "function" && (player as any).isOp()) {
      return true;
    }
  } catch {}

  try {
    if (player.hasTag("admin") || player.hasTag("op")) {
      return true;
    }
  } catch {}

  return false;
}
