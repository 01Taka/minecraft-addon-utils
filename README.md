# addon-utils

Minecraft Bedrock アドオン共通のユーティリティおよびクラスパッケージ。

## 利用方法

各アドオンの `package.json` でGitリポジトリ（およびタグ/コミットハッシュ）を指定して導入します。

```json
{
  "dependencies": {
    "addon-utils": "git+https://github.com/<username>/addon-utils.git#v0.1.0"
  }
}
```
