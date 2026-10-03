import {
  Player,
  EquipmentSlot,
  ItemStack,
  EnchantmentType,
  ItemComponentTypes,
  ItemDurabilityComponent,
  EntityEquippableComponent,
} from "@minecraft/server";

/**
 * アイテムの耐久度情報
 */
export interface ItemDurability {
  /** 現在の消耗・被ダメージ値 */
  damage: number;
  /** 最大耐久値 */
  maxDurability: number;
}

/**
 * プレイヤーの装備コンポーネント（minecraft:equippable）を取得します。
 */
export function getEquippableComponent(
  player: Player,
): EntityEquippableComponent | undefined {
  try {
    return player.getComponent("minecraft:equippable") as
      | EntityEquippableComponent
      | undefined;
  } catch {
    return undefined;
  }
}

/**
 * 指定した装備スロットのアイテムを取得します。
 */
export function getEquipmentItem(
  player: Player,
  slot: EquipmentSlot,
): ItemStack | undefined {
  const equippable = getEquippableComponent(player);
  return equippable?.getEquipment(slot);
}

/**
 * プレイヤーのメインハンド（利き手）のアイテムを取得します。
 */
export function getMainhandItem(player: Player): ItemStack | undefined {
  return getEquipmentItem(player, EquipmentSlot.Mainhand);
}

/**
 * プレイヤーのオフハンド（逆の手）のアイテムを取得します。
 */
export function getOffhandItem(player: Player): ItemStack | undefined {
  return getEquipmentItem(player, EquipmentSlot.Offhand);
}

/**
 * プレイヤーが指定したアイテム種別（typeId）を所持しているか判定します。
 * slot を指定しない場合、メインハンドまたはオフハンドのいずれかに所持していれば true を返します。
 *
 * @param player 対象プレイヤー
 * @param itemTypeId アイテムの識別子 (例: "minecraft:iron_sword")
 * @param slot 判定対象の装備スロット (省略時はメインハンドまたはオフハンド)
 */
export function isHoldingItem(
  player: Player,
  itemTypeId: string,
  slot?: EquipmentSlot,
): boolean {
  if (slot !== undefined) {
    return getEquipmentItem(player, slot)?.typeId === itemTypeId;
  }
  return (
    getMainhandItem(player)?.typeId === itemTypeId ||
    getOffhandItem(player)?.typeId === itemTypeId
  );
}

/**
 * アイテムの指定したエンチャントのレベルを取得します。
 *
 * @param item 対象アイテム
 * @param enchantment 取得したいエンチャントIDまたはEnchantmentType (例: "unbreaking", "fortune")
 * @returns エンチャントレベル（未付与または無効時は 0）
 */
export function getEnchantmentLevel(
  item: ItemStack | undefined,
  enchantment: string | EnchantmentType,
): number {
  if (!item) return 0;

  try {
    const enchantable = item.getComponent(ItemComponentTypes.Enchantable);
    if (!enchantable) return 0;

    const result = enchantable.getEnchantment(enchantment);
    return result ? result.level : 0;
  } catch {
    return 0;
  }
}

/**
 * アイテムの耐久度情報を取得します。耐久度を持たないアイテムの場合は null を返します。
 */
export function getItemDurability(
  item: ItemStack | undefined,
): ItemDurability | null {
  if (!item) return null;

  try {
    const durability = item.getComponent(
      ItemComponentTypes.Durability,
    ) as ItemDurabilityComponent | undefined;
    if (!durability) return null;

    return {
      damage: durability.damage,
      maxDurability: durability.maxDurability,
    };
  } catch {
    return null;
  }
}
