import {
  Player,
  EquipmentSlot,
  ItemStack,
  EnchantmentType,
  ItemComponentTypes,
  ItemDurabilityComponent,
  EntityEquippableComponent,
} from "@minecraft/server";
import type { ItemDurability } from "./equipment.types";

export type { ItemDurability };

/**
 * プレイヤーの装備コンポーネント（minecraft:equippable）を取得します。
 *
 * @param player 対象のプレイヤー
 * @returns 装備コンポーネント（プレイヤーが無効な場合や取得失敗時は undefined）
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
 *
 * @param player 対象のプレイヤー
 * @param slot 取得対象の装備スロット (例: EquipmentSlot.Mainhand, EquipmentSlot.Offhand)
 * @returns 装備されている ItemStack（未装備またはスロットが空の場合は undefined）
 */
export function getEquipmentItem(
  player: Player,
  slot: EquipmentSlot,
): ItemStack | undefined {
  const equippable = getEquippableComponent(player);
  return equippable?.getEquipment(slot);
}

/**
 * プレイヤーのメインハンド（利き手）に装備されているアイテムを取得します。
 *
 * @param player 対象のプレイヤー
 * @returns メインハンドの ItemStack（何も持っていない場合は undefined）
 */
export function getMainhandItem(player: Player): ItemStack | undefined {
  return getEquipmentItem(player, EquipmentSlot.Mainhand);
}

/**
 * プレイヤーのオフハンド（逆の手）に装備されているアイテムを取得します。
 *
 * @param player 対象のプレイヤー
 * @returns オフハンドの ItemStack（何も持っていない場合は undefined）
 */
export function getOffhandItem(player: Player): ItemStack | undefined {
  return getEquipmentItem(player, EquipmentSlot.Offhand);
}

/**
 * プレイヤーが指定したアイテム種別（typeId）を所持しているか判定します。
 *
 * @param player 対象のプレイヤー
 * @param itemTypeId 判定したいアイテムの識別子 (例: "minecraft:diamond_sword")
 * @param slot 判定対象のスロット。省略した場合はメインハンドまたはオフハンドのいずれかに所持していれば true を返します
 * @returns 指定されたスロット（または両手）に対象アイテムを所持している場合は true、それ以外は false
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
 * アイテムに付与されている指定エンチャントのレベルを取得します。
 *
 * @param item 対象のアイテム（undefined の場合は 0 を返します）
 * @param enchantment 取得したいエンチャントのIDまたは EnchantmentType (例: "unbreaking", "sharpness")
 * @returns エンチャントレベル (1以上の整数)。エンチャントが付与されていない、無効、またはアイテムが undefined の場合は 0
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
 * アイテムの耐久度情報（現在の消耗値と最大耐久値）を取得します。
 *
 * @param item 対象のアイテム（undefined の場合は null を返します）
 * @returns 耐久度情報 { damage, maxDurability }。耐久度を持たないアイテム、無効なアイテム、または undefined の場合は null
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
