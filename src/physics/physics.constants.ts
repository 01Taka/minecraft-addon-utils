/**
 * Minecraft Bedrock 標準の物理定数リファレンス (Vanilla Reference Values)
 * バージョンや環境に応じて変更される可能性があるため、関数側のデフォルト値としては使用せず、
 * 利用側が呼び出し時に引数として渡すための参照定数として定義しています。
 */

/** 標準の自由落下重力加速度 (blocks/tick) */
export const MINECRAFT_GRAVITY = 0.08;

/** 各環境における速度維持率 (抗力係数) */
export const MINECRAFT_DRAG = {
  /** 通常空中 */
  air: { y: 0.98, xz: 0.91 },
  /** 水中 */
  water: { y: 0.8, xz: 0.8 },
  /** 溶岩 */
  lava: { y: 0.5, xz: 0.5 },
  /** クモの巣 */
  cobweb: { y: 0.05, xz: 0.25 },
  /** ハチミツ壁 */
  honey: { y: 0.2, xz: 0.2 },
  /** 地上摩擦 (実効保持率: 0.6 * 0.91) */
  ground: { y: 0.98, xz: 0.546 },
  /** 抵抗なし */
  none: { y: 1.0, xz: 1.0 },
} as const;
