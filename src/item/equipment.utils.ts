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
 * プレイヤーの装備コンポーネント（minecraft:equippable）を取得します。
 */
export function getEquippable(
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
 * 指定したスロットの装備アイテムを取得します。
 */
export function getEquipmentItem(
  player: Player,
  slot: EquipmentSlot,
): ItemStack | undefined {
  const equippable = getEquippable(player);
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
 * プレイヤーが指定したIDのアイテムを持っているか判定します。
 * slotを指定しない場合、メインハンドまたはオフハンドのどちらかに持っていればtrueを返します。
 */
export function isHoldingItem(
  player: Player,
  itemId: string,
  slot?: EquipmentSlot,
): boolean {
  if (slot !== undefined) {
    return getEquipmentItem(player, slot)?.typeId === itemId;
  }
  return (
    getMainhandItem(player)?.typeId === itemId ||
    getOffhandItem(player)?.typeId === itemId
  );
}

/**
 * アイテムの指定したエンチャントのレベルを取得します。
 * @param item 対象アイテム
 * @param enchantment 取得したいエンチャントIDまたはEnchantmentType (例: "unbreaking", "fortune", "efficiency")
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
 * アイテムの耐久度情報を取得します。
 */
export function getItemDurability(item: ItemStack | undefined): {
  damage: number;
  maxDurability: number;
} | null {
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

/**
 * メインハンド装備および主要なエンチャント・耐久値情報をまとめて取得します。
 */
export function getMainHandItemInfo(player: Player) {
  const equippable = getEquippable(player);
  if (!equippable) return null;

  const mainhandItem = equippable.getEquipment(EquipmentSlot.Mainhand);
  if (!mainhandItem) return null;

  const durability = getItemDurability(mainhandItem);
  const unbreaking = getEnchantmentLevel(mainhandItem, "unbreaking");
  const fortune = getEnchantmentLevel(mainhandItem, "fortune");
  const silkTouch = getEnchantmentLevel(mainhandItem, "silk_touch");

  return {
    equippable,
    mainhandItem,
    durability,
    enchant: {
      unbreaking,
      fortune,
      silkTouch,
    },
  };
}
