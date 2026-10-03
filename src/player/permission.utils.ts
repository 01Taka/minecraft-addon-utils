import { Player, CommandPermissionLevel } from "@minecraft/server";

/**
 * プレイヤー管理者判定のカスタマイズオプション
 */
export interface IsPlayerAdminOptions {
  /**
   * 管理者とみなすタグの配列 (デフォルト: ["admin", "op"])
   */
  adminTags?: readonly string[];
  /**
   * タグの保持による権限判定を行うか (デフォルト: true)
   */
  allowTagCheck?: boolean;
  /**
   * 管理者とみなす最小のコマンド権限レベル (デフォルト: CommandPermissionLevel.Any より大きいレベル)
   */
  minPermissionLevel?: CommandPermissionLevel;
}

/**
 * プレイヤーが管理者権限（OP権限、または指定された管理者タグ）を保持しているかを判定します。
 * 個人プレイ・マルチプレイ共通で安全に動作し、無効なプレイヤー（切断済み等）は常に false を返します。
 *
 * @param player 判定対象のプレイヤー
 * @param options オプション設定（判定対象タグや権限レベルのカスタマイズ）
 * @returns 管理者権限を保持している場合は true、一般プレイヤーまたは無効な場合は false
 */
export function isPlayerAdmin(
  player: Player,
  options?: IsPlayerAdminOptions,
): boolean {
  if (!player.isValid) return false;

  const minLevel = options?.minPermissionLevel ?? CommandPermissionLevel.Any;
  const allowTag = options?.allowTagCheck ?? true;
  const adminTags = options?.adminTags ?? ["admin", "op"];

  // 1. commandPermissionLevel 判定
  try {
    if (
      typeof player.commandPermissionLevel === "number" &&
      player.commandPermissionLevel > minLevel
    ) {
      return true;
    }
  } catch {}

  // 2. player.isOp() 判定（環境によって利用可能な場合）
  try {
    if (typeof (player as any).isOp === "function" && (player as any).isOp()) {
      return true;
    }
  } catch {}

  // 3. タグ判定
  if (allowTag && adminTags.length > 0) {
    for (const tag of adminTags) {
      if (player.hasTag(tag)) {
        return true;
      }
    }
  }

  return false;
}
