import { CommandPermissionLevel } from "@minecraft/server";

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
