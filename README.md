# addon-utils

Minecraft Bedrock Script API 開発用 汎用ユーティリティ & クラスパッケージ。

各アドオンで頻出するボイラープレートを排除し、純粋関数および単一責任の原則（SRP）に基づいて設計されています。

---

## 目次

- [導入方法](#導入方法)
- [1. Item / Equipment (`addon-utils/item`)](#1-item--equipment-addon-utilsitem)
- [2. Block / Direction (`addon-utils/block`)](#2-block--direction-addon-utilsblock)
- [3. State Management (`addon-utils/state`)](#3-state-management-addon-utilsstate)
- [4. Player / Input (`addon-utils/player`)](#4-player--input-addon-utilsplayer)
- [5. Math / Geometry (`addon-utils/math`)](#5-math--geometry-addon-utilsmath)
- [6. Physics (`addon-utils/physics`)](#6-physics-addon-utilsphysics)

---

## 導入方法

各アドオンの `package.json` にて、Git タグやコミットハッシュを指定してインストールします。

```json
{
  "dependencies": {
    "addon-utils": "git+file:../addon-utils#v0.1.0"
  }
}
```

ルートまたはサブパスからインポート可能です：

```typescript
import {
  getMainhandItem,
  PlayerStateManager,
  PlayerDirectionResolver,
  calculateVelocityImpulse,
  MINECRAFT_GRAVITY,
  MINECRAFT_DRAG,
} from "addon-utils";
```

---

## 1. Item / Equipment (`addon-utils/item`)

### 型定義

#### `interface ItemDurability`
アイテムの耐久度情報。
- `damage: number`: 現在の消耗・被ダメージ値（耐久度の減り具合）。
- `maxDurability: number`: 最大耐久値。

---

### 関数

#### `getEquippableComponent(player: Player): EntityEquippableComponent | undefined`
プレイヤーの装備コンポーネント（`minecraft:equippable`）を取得します。
- **引数**:
  - `player: Player`: 対象のプレイヤー
- **戻り値**: 装備コンポーネント（プレイヤーが無効な場合や取得失敗時は `undefined`）

#### `getEquipmentItem(player: Player, slot: EquipmentSlot): ItemStack | undefined`
指定した装備スロットのアイテムを取得します。
- **引数**:
  - `player: Player`: 対象のプレイヤー
  - `slot: EquipmentSlot`: 取得対象の装備スロット (例: `EquipmentSlot.Mainhand`, `EquipmentSlot.Offhand`)
- **戻り値**: 装備されている `ItemStack`（未装備またはスロットが空の場合は `undefined`）

#### `getMainhandItem(player: Player): ItemStack | undefined`
プレイヤーのメインハンド（利き手）に装備されているアイテムを取得します。
- **引数**:
  - `player: Player`: 対象のプレイヤー
- **戻り値**: メインハンドの `ItemStack`（何も持っていない場合は `undefined`）

#### `getOffhandItem(player: Player): ItemStack | undefined`
プレイヤーのオフハンド（逆の手）に装備されているアイテムを取得します。
- **引数**:
  - `player: Player`: 対象のプレイヤー
- **戻り値**: オフハンドの `ItemStack`（何も持っていない場合は `undefined`）

#### `isHoldingItem(player: Player, itemTypeId: string, slot?: EquipmentSlot): boolean`
プレイヤーが指定したアイテム種別（typeId）を所持しているか判定します。
- **引数**:
  - `player: Player`: 対象のプレイヤー
  - `itemTypeId: string`: 判定したいアイテムの識別子 (例: `"minecraft:diamond_sword"`)
  - `slot?: EquipmentSlot`: 判定対象のスロット。省略した場合はメインハンドまたはオフハンドのいずれかに所持していれば `true` を返します
- **戻り値**: 指定されたスロット（または両手）に対象アイテムを所持している場合は `true`、それ以外は `false`

#### `getEnchantmentLevel(item: ItemStack | undefined, enchantment: string | EnchantmentType): number`
アイテムに付与されている指定エンチャントのレベルを取得します。
- **引数**:
  - `item: ItemStack | undefined`: 対象のアイテム（`undefined` の場合は `0` を返します）
  - `enchantment: string | EnchantmentType`: 取得したいエンチャントのIDまたは `EnchantmentType` (例: `"unbreaking"`, `"sharpness"`)
- **戻り値**: エンチャントのレベル (1以上の整数)。エンチャントが付与されていない、無効、またはアイテムが `undefined` の場合は `0`

#### `getItemDurability(item: ItemStack | undefined): ItemDurability | null`
アイテムの耐久度情報（現在の消耗値と最大耐久値）を取得します。
- **引数**:
  - `item: ItemStack | undefined`: 対象のアイテム（`undefined` の場合は `null` を返します）
- **戻り値**: 耐久度情報 `{ damage, maxDurability }`。耐久度を持たないアイテム、無効なアイテム、または `undefined` の場合は `null`

---

## 2. Block / Direction (`addon-utils/block`)

### 関数

#### `getAdjacentBlock(block: Block, direction: Direction): Block | undefined`
基準ブロックの指定した面に隣接するブロックを取得します。
- **引数**:
  - `block: Block`: 基準となるブロック
  - `direction: Direction`: 隣接面を調べる方向 (`Direction.Up`, `Direction.Down`, etc.)
- **戻り値**: 隣接する `Block` オブジェクト。ワールド境界外や未ロードチャンクなど取得不能な場合は `undefined`

#### `getDirectionVector(direction: Direction): Vector3`
Minecraft の方向列挙値（`Direction`）に対応する単位ベクトル（長さ1の `Vector3`）を取得します。
- **引数**:
  - `direction: Direction`: 変換する方向
- **戻り値**: 各軸の単位ベクトル `{ x, y, z }`。未知の方向の場合は `{ x: 0, y: 0, z: 0 }`

#### `getOppositeDirection(direction: Direction): Direction`
指定した方向と正反対の方向（`Direction`）を取得します。
- **引数**:
  - `direction: Direction`: 基準となる方向
- **戻り値**: 反対向きの `Direction` (例: `Up` -> `Down`, `North` -> `South`)

---

## 3. State Management (`addon-utils/state`)

### クラス: `PlayerStateManager`
プレイヤー単位のインメモリ状態管理マネージャー。
プレイヤー切断（`world.afterEvents.playerLeave`）時の自動クリーンアップ機能を備え、アドオンの一時データやキャッシュによるメモリリークを防止します。

#### メソッド

- **`static set<T>(playerId: string, key: string, value: T): void`**
  - 指定したプレイヤーの状態データを保存します。
- **`static get<T>(playerId: string, key: string, defaultValue: T): T`**
  - 指定したプレイヤーの状態データを取得します。データが存在しない場合は `defaultValue` を返します。
- **`static has(playerId: string, key: string): boolean`**
  - 指定したプレイヤーに特定のキーが保存されているか確認します。
- **`static delete(playerId: string, key: string): boolean`**
  - 指定したプレイヤーの特定のキーのデータを削除します。成功時は `true` を返します。
- **`static clearPlayer(playerId: string): boolean`**
  - 指定したプレイヤーのすべての状態データをメモリから削除します。
- **`static clearAll(): void`**
  - 全プレイヤーの全状態データをメモリから完全に削除します。
- **`static registerAutoCleanup(): void`**
  - プレイヤー退出（切断）時に自動でそのプレイヤーのメモリを解放するイベントリスナーを登録します。起動時に1度呼び出してください（二重登録は自動防止されます）。

---

## 4. Player / Input (`addon-utils/player`)

### 型定義

#### `interface IsPlayerAdminOptions`
プレイヤー管理者判定のカスタマイズオプション。
- `adminTags?: readonly string[]`: 管理者とみなすタグの配列 (デフォルト: `["admin", "op"]`)
- `allowTagCheck?: boolean`: タグの保持による権限判定を行うか (デフォルト: `true`)
- `minPermissionLevel?: CommandPermissionLevel`: 管理者とみなす最小のコマンド権限レベル (デフォルト: `CommandPermissionLevel.Any` より大きいレベル)

#### `interface DirectionData`
解決された方向ベクトルおよび正規化情報。
- `vector: Vector3`: 元の3次元ベクトル
- `normalizedXZ: Vector3`: XZ平面（水平方向）で正規化された単位ベクトル (yは常に0、長さは1。水平長が0の場合は `{ x: 0, y: 0, z: 0 }`)
- `horizontalLength: number`: 水平方向(XZ平面)の長さ・ノルム (`Math.hypot(x, z)`)

---

### 関数

#### `isPlayerAdmin(player: Player, options?: IsPlayerAdminOptions): boolean`
プレイヤーが管理者権限（OP権限、または指定された管理者タグ）を保持しているかを判定します。
- **引数**:
  - `player: Player`: 判定対象のプレイヤー
  - `options?: IsPlayerAdminOptions`: オプション設定（判定対象タグや権限レベルのカスタマイズ）
- **戻り値**: 管理者権限を保持している場合は `true`、一般プレイヤーまたは無効な場合は `false`

#### `isInputButtonPressed(player: Player, buttonName: string): boolean`
プレイヤーの物理ボタン入力状態を判定します。
- **引数**:
  - `player: Player`: 対象のプレイヤー
  - `buttonName: string`: 判定したいボタン名 (例: `"Sneak"`, `"Jump"`, `"Sprint"`)
- **戻り値**: 物理キーが押下されている場合は `true`、それ以外は `false`

#### `isSneakButtonPressed(player: Player): boolean`
プレイヤーが物理的にスニーク（シフト）キーを押下しているかを判定します。
1ブロック隙間への進入時や匍匐（クロール）時におけるゲームエンジンの自動スニークによる誤検知を防止します。
- **引数**:
  - `player: Player`: 対象のプレイヤー
- **戻り値**: プレイヤー自身がスニークボタンを押している場合は `true`、それ以外は `false`

#### `getMovementInputAngle(playerOrVector: Player | Vector2): number | null`
プレイヤーの移動入力が正面（前進方向）に対して何ラジアン傾いているかを返します。
- **引数**:
  - `playerOrVector: Player | Vector2`: Player オブジェクト、または Vector2 (`{ x, y }`)
- **戻り値**: 前進方向を 0 とし、右回りを正(+)、左回りを負(-)としたラジアン値 (`-π` 〜 `+π`)。入力がない（静止状態）の場合は `null`

#### `getPlayerAABB(player: Player): AABB`
プレイヤーの現在のワールド座標系 AABB（バウンディングボックス）を取得します。
スニーク、水泳、エリトラ滑空などの姿勢変化に伴うヒットボックスの伸縮に対応しています。
- **引数**:
  - `player: Player`: 対象のプレイヤー
- **戻り値**: 最小座標 (min) と最大座標 (max) を含む `AABB`

---

### クラス: `PlayerDirectionResolver`
プレイヤーの移動方向・入力方向・視線方向を解決し、同一Tick内での重複計算をキャッシュするマネージャー。
プレイヤー切断（`world.afterEvents.playerLeave`）時の自動メモリ解放にも対応しています。

#### 静的メソッド
- **`static get(player: Player): PlayerDirectionResolver`**
  - プレイヤーに対応するリゾルバーインスタンスを取得（または新規生成）します。

#### プロパティ（ゲッター）
- **`movement: DirectionData`**:
  物理的な移動速度（Velocity）情報。同一Tick内ではキャッシュ値を返します。
- **`input: DirectionData`**:
  プレイヤー自身のローカル座標系におけるキー入力方向（一般的な3D系: x=右(+)/左(-), z=前(+)/後(-)）。同一Tick内ではキャッシュ値を返します。
- **`worldInput: DirectionData`**:
  プレイヤーの向いている水平角（Yaw）とキー入力を合成した、実際のワールド空間での進行希望方向。入力がない場合はゼロベクトルを返します。同一Tick内ではキャッシュ値を返します。
- **`view: DirectionData`**:
  プレイヤーの視線方向（ViewDirection）のベクトル情報。同一Tick内ではキャッシュ値を返します。

---

## 5. Math / Geometry (`addon-utils/math`)

### 型定義

#### `type VectorXZ = { x: number; z: number }`
XZ平面（水平方向）の2次元ベクトル。

#### `interface AABB2D`
2次元AABB (XZ平面バウンディングボックス)。
- `min: VectorXZ`: 最小点 (minX, minZ)
- `max: VectorXZ`: 最大点 (maxX, maxZ)

#### `interface AABB`
3次元AABB (直方体バウンディングボックス)。
- `min: Vector3`: 最小点 (minX, minY, minZ)
- `max: Vector3`: 最大点 (maxX, maxY, maxZ)

#### `interface AABBDistanceResult`
AABBとの最短距離および各軸の距離詳細。
- `horizontal: number`: XZ平面（水平方向）におけるAABBとの最短距離 (ブロック内側の場合は 0)
- `vertical: number`: Y軸（垂直方向）におけるAABBとの最短距離 (AABBの高さの内側にある場合は 0)
- `distance: number`: 3次元空間におけるAABBとの最短直線ユークリッド距離
- `delta: { dx: number; dy: number; dz: number }`: 各軸におけるAABB外側へのはみ出し距離（内側にある軸は 0）
- `verticalTop: number`: AABB上面（maxY）を基準とした符号付き垂直距離 (`point.y - maxY`)。正=上面より上, 負=上面より下, 0=上面と一致
- `verticalBottom: number`: AABB下面（minY）を基準とした符号付き垂直距離 (`point.y - minY`)。正=下面より上, 負=下面より下, 0=下面と一致

---

### 関数

#### `calculatePointToAABBDistance(point: Vector3, aabb: AABB): AABBDistanceResult`
3次元空間の任意の点とAABBバウンディングボックス間の最短距離を計算します。
- **引数**:
  - `point: Vector3`: 測定対象の点（プレイヤー位置など）
  - `aabb: AABB`: 測定対象のAABB `{ min, max }`
- **戻り値**: 水平最短距離、垂直最短距離、3D直線最短距離、上面/下面からの垂直距離を含む `AABBDistanceResult`

#### `getNearestFaceDirectionVector(vectorXZ: VectorXZ): Vector3`
水平ベクトルから最も近い面方向（東西南北）の単位ベクトル（`Vector3`）を返します。
- **引数**:
  - `vectorXZ: VectorXZ`: 水平方向ベクトル (x, z)
- **戻り値**: 最も近い面方向の単位 `Vector3`（East: `{1,0,0}`, West: `{-1,0,0}`, South: `{0,0,1}`, North: `{0,0,-1}`）。入力がゼロベクトルの場合は `{0,0,0}`。X成分とZ成分の絶対値が等しい場合はX軸成分を優先します

---

## 6. Physics (`addon-utils/physics`)

### 定数

#### `MINECRAFT_GRAVITY: number = 0.08`
標準の自由落下重力加速度 (blocks/tick)。

#### `MINECRAFT_DRAG`
各環境における速度維持率 (抗力係数)。
- `air`: `{ y: 0.98, xz: 0.91 }` (通常空中)
- `water`: `{ y: 0.8, xz: 0.8 }` (水中)
- `lava`: `{ y: 0.5, xz: 0.5 }` (溶岩)
- `cobweb`: `{ y: 0.05, xz: 0.25 }` (クモの巣)
- `honey`: `{ y: 0.2, xz: 0.2 }` (ハチミツ壁)
- `ground`: `{ y: 0.98, xz: 0.546 }` (地上摩擦 実効保持率: 0.6 * 0.91)
- `none`: `{ y: 1.0, xz: 1.0 }` (抵抗なし)

---

### 型定義

#### `interface CalculateVelocityImpulseParams`
目標速度インパルス計算の入力パラメータ。
- `targetVelocity: { x?: number | null; y?: number | null; z?: number | null }`: 目標とする速度ベクトル (blocks/tick)。`null` または `undefined` の軸は外力制御を行わず現在の慣性・加速度を維持
- `currentVelocity: Vector3`: 現在のエンティティ速度 (`player.getVelocity()`)
- `dragY: number`: Y軸の速度維持率 (抗力係数: 0.0〜1.0)
- `dragXZ: number`: XZ軸の速度維持率 (抗力係数: 0.0〜1.0)
- `gravity: number`: 1Tickあたりの落下重力加速度 (相殺する場合は正の数値、相殺しない場合は 0)
- `deltaTimeTick?: number`: 経過時間（Tick単位。デフォルト: 1.0）
- `stiffness?: number | null`: 追従の鋭さ。`null` の場合は 1Tick 内で即座に到達（blend = 1.0）。正の数値を指定すると指数減衰補間で滑らかに追従
- `maxAcceleration?: number`: 1Tickあたりに加算できる最大速度変化量（リミッター）

#### `interface LiftPhysicsEnvironment`
垂直浮上物理の計算に必要な環境パラメータ。
- `gravity: number`: 1Tickあたりの自由落下重力加速度 (blocks/tick。通常 0.08)
- `dragY: number`: Y軸の速度維持率 (抗力係数。空中は通常 0.98)

#### `interface LiftImpulseResult`
浮上インパルス計算の結果。
- `impulse: Vector3`: `entity.applyImpulse()` に直接渡すインパルスベクトル (X, Z は 0)
- `ticksToApex: number`: 最高到達点（目標高度）に達するまでの経過Tick数 (整数)
- `timeToApexSeconds: number`: 最高到達点に達するまでの所要秒数 (`ticksToApex / 20`)
- `initialVelocityY: number`: 逆算された垂直初速度 v0 (blocks/tick)

---

### 関数

#### `calculateVelocityImpulse(params: CalculateVelocityImpulseParams): Vector3`
環境の物理特性（抗力・重力）を逆算し、目標速度に到達するためにエンティティへ加えるべきインパルスベクトルを計算します。
外部の定数やデフォルト値には一切依存せず、引数として渡された数値のみに基づいて計算する純粋関数です。
- **引数**:
  - `params: CalculateVelocityImpulseParams`: 速度目標、現在速度、環境物理定数（dragY, dragXZ, gravity）を含む計算パラメータ
- **戻り値**: `entity.applyImpulse()` に渡すためのインパルスベクトル (`Vector3`)

#### `calculateLiftImpulse(targetHeight: number, currentVelocity: Vector3, environment: LiftPhysicsEnvironment): LiftImpulseResult`
指定したブロック数分浮き上がるのに必要な垂直インパルスと、最高点到達までの所要時間を精密に計算します。
ゲームエンジンの離散物理（重力と抗力）を二分探索シミュレーションで逆算するため、非線形な減衰下でも目標高度ピッタリで静止・降下に転じます。
- **引数**:
  - `targetHeight: number`: 浮き上がりたいブロック数・高度差 (H > 0)
  - `currentVelocity: Vector3`: 現在のエンティティのベロシティ (`player.getVelocity()`)
  - `environment: LiftPhysicsEnvironment`: 物理環境設定 (`gravity`, `dragY`)
- **戻り値**: `applyImpulse` に渡すインパルスおよび最高点到達Tick数を含む `LiftImpulseResult`
