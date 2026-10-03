import { world } from "@minecraft/server";

/**
 * プレイヤー単位のインメモリ状態管理マネージャー。
 * プレイヤー切断（world.afterEvents.playerLeave）時の自動クリーンアップ機能を備え、
 * アドオンの一時データやキャッシュによるメモリリークを防止します。
 */
export class PlayerStateManager {
  // playerId -> (key -> value)
  private static readonly state: Map<string, Map<string, any>> = new Map();
  private static isCleanupRegistered: boolean = false;

  /**
   * 指定したプレイヤーの状態データを保存します。
   *
   * @param playerId 対象プレイヤーのID (player.id)
   * @param key 管理キー名
   * @param value 保存する任意の値
   */
  public static set<T>(playerId: string, key: string, value: T): void {
    let playerMap = this.state.get(playerId);
    if (!playerMap) {
      playerMap = new Map<string, any>();
      this.state.set(playerId, playerMap);
    }
    playerMap.set(key, value);
  }

  /**
   * 指定したプレイヤーの状態データを取得します。データが存在しない場合は defaultValue を返します。
   *
   * @param playerId 対象プレイヤーのID (player.id)
   * @param key 管理キー名
   * @param defaultValue キーが存在しない、またはプレイヤーが未登録の場合に返すデフォルト値
   * @returns 保存されている値、または defaultValue
   */
  public static get<T>(playerId: string, key: string, defaultValue: T): T {
    const playerMap = this.state.get(playerId);
    if (!playerMap || !playerMap.has(key)) {
      return defaultValue;
    }
    return playerMap.get(key) as T;
  }

  /**
   * 指定したプレイヤーに特定のキーが保存されているか確認します。
   *
   * @param playerId 対象プレイヤーのID (player.id)
   * @param key 確認するキー名
   * @returns キーが存在する場合は true、それ以外は false
   */
  public static has(playerId: string, key: string): boolean {
    return this.state.get(playerId)?.has(key) ?? false;
  }

  /**
   * 指定したプレイヤーの特定のキーのデータを削除します。
   *
   * @param playerId 対象プレイヤーのID (player.id)
   * @param key 削除するキー名
   * @returns データが存在し削除に成功した場合は true、キーが存在しなかった場合は false
   */
  public static delete(playerId: string, key: string): boolean {
    const playerMap = this.state.get(playerId);
    if (!playerMap) return false;
    return playerMap.delete(key);
  }

  /**
   * 指定したプレイヤーのすべての状態データをメモリから削除します。
   *
   * @param playerId 対象プレイヤーのID (player.id)
   * @returns プレイヤーのマップが存在し削除された場合は true、存在しなかった場合は false
   */
  public static clearPlayer(playerId: string): boolean {
    return this.state.delete(playerId);
  }

  /**
   * 全プレイヤーの全状態データをメモリから完全に削除します。
   */
  public static clearAll(): void {
    this.state.clear();
  }

  /**
   * プレイヤー退出（切断）時に自動でそのプレイヤーのメモリを解放するイベントリスナーを登録します。
   * アプリケーション起動時に一度だけ呼び出してください。二重登録は自動的に防止されます。
   */
  public static registerAutoCleanup(): void {
    if (this.isCleanupRegistered) return;
    this.isCleanupRegistered = true;

    try {
      world.afterEvents.playerLeave.subscribe((event) => {
        this.clearPlayer(event.playerId);
      });
    } catch (e) {
      console.warn("[PlayerStateManager] Failed to register playerLeave listener:", e);
    }
  }
}
