/**
 * アイテムの耐久度情報
 */
export interface ItemDurability {
  /** 現在の消耗・被ダメージ値（耐久度の減り具合） */
  damage: number;
  /** 最大耐久値 */
  maxDurability: number;
}
