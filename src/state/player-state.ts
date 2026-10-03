import { world } from "@minecraft/server";

/**
 * プレイヤー単位のインメモリ状態管理マネージャー
 * プレイヤー切断（Leave）時の自動クリーンアップ機能を備え、メモリリークを防止します。
 */
export class PlayerStateManager {
  // playerId -> (key -> value)
  private static readonly state: Map<string, Map<string, any>> = new Map();
  private static isCleanupRegistered: boolean = false;

  /**
   * プレイヤーの状態を設定・保存します。
   *
   * @param playerId プレイヤーID (player.id)
   * @param key 管理キー名
   * @param value 保存する値
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
   * プレイヤーの状態を取得します。未設定の場合はデフォルト値（fallback）を返します。
   *
   * @param playerId プレイヤーID (player.id)
   * @param key 管理キー名
   * @param fallback 値が存在しない場合のデフォルト値
   */
  public static get<T>(playerId: string, key: string, fallback: T): T {
    const playerMap = this.state.get(playerId);
    if (!playerMap || !playerMap.has(key)) {
      return fallback;
    }
    return playerMap.get(key) as T;
  }

  /**
   * 指定したキーが登録されているか確認します。
   */
  public static has(playerId: string, key: string): boolean {
    return this.state.get(playerId)?.has(key) ?? false;
  }

  /**
   * 特定のキーのデータを削除します。
   */
  public static delete(playerId: string, key: string): boolean {
    const playerMap = this.state.get(playerId);
    if (!playerMap) return false;
    return playerMap.delete(key);
  }

  /**
   * 指定したプレイヤーの全状態を削除します。
   */
  public static clearPlayer(playerId: string): boolean {
    return this.state.delete(playerId);
  }

  /**
   * 全プレイヤーの全状態をクリアします。
   */
  public static clearAll(): void {
    this.state.clear();
  }

  /**
   * プレイヤー退出時に自動でメモリを解放するリスナーを登録します。
   * 二重登録は自動的に防止されます。
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
