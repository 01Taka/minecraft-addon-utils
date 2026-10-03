# addon-utils

Minecraft Bedrock Script API 開発用 汎用ユーティリティ & クラスパッケージ。

各アドオンで頻出するボイラープレートを排除し、純粋関数および単一責任の原則（SRP）に基づいて設計されています。

---

## バージョン別 API リファレンス

本パッケージの外部公開されているすべての型・関数・クラス・定数の詳細仕様（シグネチャ、引数、戻り値）は、バージョンごとに `docs/` 配下にまとめられています。

- [**docs/v0.1.0.md**](file:///c:/ai/projects/under-development/minecraft-addons/addon-utils/docs/v0.1.0.md): 初期安定版（アイテム、ブロック面、状態管理、プレイヤー入力/方向リゾルバー、幾何計算、物理インパルス逆算）

---

## 導入方法

各アドオンの `package.json` にて、Git タグを指定してインストールします。

```json
{
  "dependencies": {
    "addon-utils": "git+file:../addon-utils#v0.1.0"
  }
}
```

パッケージルートからインポートして利用します：

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
 
> **Note**: 本パッケージは内部構造の変更による破壊的変更を防ぐため、サブパス（`addon-utils/item` 等）はカプセル化されており、パッケージルート（`"addon-utils"`）からのみインポート可能です。

詳細な各モジュールの利用方法や仕様は、該当バージョンのドキュメント（[docs/v0.1.0.md](file:///c:/ai/projects/under-development/minecraft-addons/addon-utils/docs/v0.1.0.md)）をご参照ください。
