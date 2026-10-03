import { world, system, Player, type Vector3 } from "@minecraft/server";

/**
 * 解決された方向ベクトルおよび正規化情報
 */
export interface DirectionData {
  /** 元の3次元ベクトル */
  vector: Vector3;
  /** XZ平面（水平方向）で正規化された単位ベクトル (yは常に0、長さは1。水平長が0の場合は { x: 0, y: 0, z: 0 }) */
  normalizedXZ: Vector3;
  /** 水平方向(XZ平面)の長さ・ノルム (Math.hypot(x, z)) */
  horizontalLength: number;
}

function createDirectionData(vector: Vector3): DirectionData {
  const horizontalLength = Math.hypot(vector.x, vector.z);
  return {
    vector,
    normalizedXZ:
      horizontalLength > 1e-9
        ? { x: vector.x / horizontalLength, y: 0, z: vector.z / horizontalLength }
        : { x: 0, y: 0, z: 0 },
    horizontalLength,
  };
}

/**
 * プレイヤーの移動方向・入力方向・視線方向を解決し、同一Tick内での重複計算をキャッシュするマネージャー。
 * プレイヤー切断（world.afterEvents.playerLeave）時の自動メモリ解放にも対応しています。
 */
export class PlayerDirectionResolver {
  // --------------------------------------------------
  // クラス内部でのプレイヤー管理 (static)
  // --------------------------------------------------
  private static readonly instances = new Map<string, PlayerDirectionResolver>();

  static {
    // プレイヤー退出時に自動でMapから削除（メモリリーク防止）
    try {
      world.afterEvents.playerLeave.subscribe((event) => {
        PlayerDirectionResolver.instances.delete(event.playerId);
      });
    } catch (e) {
      console.warn("[PlayerDirectionResolver] Failed to register playerLeave listener:", e);
    }
  }

  /**
   * プレイヤーに対応するリゾルバーインスタンスを取得（または新規生成）します。
   *
   * @param player 対象のプレイヤー
   * @returns 該当プレイヤーの PlayerDirectionResolver インスタンス
   */
  public static get(player: Player): PlayerDirectionResolver {
    let resolver = this.instances.get(player.id);
    if (!resolver) {
      resolver = new PlayerDirectionResolver(player);
      this.instances.set(player.id, resolver);
    } else {
      resolver.player = player;
    }
    return resolver;
  }

  // --------------------------------------------------
  // インスタンスメンバー
  // --------------------------------------------------
  private player: Player;
  private lastTick: number = -1;

  private _movement: DirectionData | null = null;
  private _input: DirectionData | null = null;
  private _worldInput: DirectionData | null = null;
  private _view: DirectionData | null = null;

  private constructor(player: Player) {
    this.player = player;
  }

  /**
   * 現在のゲームTickを検査し、Tickが進行していればキャッシュを破棄します。
   */
  private checkTick(): void {
    const currentTick = system.currentTick;
    if (this.lastTick !== currentTick) {
      this.lastTick = currentTick;
      this._movement = null;
      this._input = null;
      this._worldInput = null;
      this._view = null;
    }
  }

  /**
   * 物理的な移動速度（Velocity）情報。同一Tick内ではキャッシュ値を返します。
   */
  public get movement(): DirectionData {
    this.checkTick();
    if (!this._movement) {
      this._movement = createDirectionData(this.player.getVelocity());
    }
    return this._movement;
  }

  /**
   * プレイヤー自身のローカル座標系におけるキー入力方向（一般的な3D系: x=右(+)/左(-), z=前(+)/後(-)）。
   * 同一Tick内ではキャッシュ値を返します。
   */
  public get input(): DirectionData {
    this.checkTick();
    if (!this._input) {
      const raw = this.player.inputInfo.getMovementVector();
      // Minecraft の raw.x は「左が正(+)」のため、反転して「右を正(+)」にする
      this._input = createDirectionData({ x: -raw.x, y: 0, z: raw.y });
    }
    return this._input;
  }

  /**
   * プレイヤーの向いている水平角（Yaw）とキー入力を合成した、実際のワールド空間での進行希望方向。
   * 入力がない場合はゼロベクトルを返します。同一Tick内ではキャッシュ値を返します。
   */
  public get worldInput(): DirectionData {
    this.checkTick();
    if (!this._worldInput) {
      const raw = this.player.inputInfo.getMovementVector();

      // 入力がない場合はゼロベクトル
      if (Math.abs(raw.x) < 1e-5 && Math.abs(raw.y) < 1e-5) {
        this._worldInput = createDirectionData({ x: 0, y: 0, z: 0 });
      } else {
        // プレイヤーの水平角度 (Yaw) からワールドの前方・右方単位ベクトルを算出
        const yawRad = (this.player.getRotation().y * Math.PI) / 180;
        const forwardX = -Math.sin(yawRad);
        const forwardZ = Math.cos(yawRad);

        // 右方向は前方から時計回りに90度回転した向き
        const rightX = -forwardZ;
        const rightZ = forwardX;

        // Minecraft の raw.x は「左が正(+)、右が負(-)」のため、反転して「右を正(+)」にする
        const strafeRight = -raw.x;

        // 前後入力(raw.y) と 左右入力(strafeRight) をワールド空間で合成
        const worldX = forwardX * raw.y + rightX * strafeRight;
        const worldZ = forwardZ * raw.y + rightZ * strafeRight;

        this._worldInput = createDirectionData({ x: worldX, y: 0, z: worldZ });
      }
    }
    return this._worldInput;
  }

  /**
   * プレイヤーの視線方向（ViewDirection）のベクトル情報。同一Tick内ではキャッシュ値を返します。
   */
  public get view(): DirectionData {
    this.checkTick();
    if (!this._view) {
      this._view = createDirectionData(this.player.getViewDirection());
    }
    return this._view;
  }
}
