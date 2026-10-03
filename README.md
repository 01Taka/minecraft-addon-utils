# addon-utils

General-purpose utilities and classes for Minecraft Bedrock Script API addon development.

Designed to eliminate recurring boilerplate across addons, built strictly with pure functions and the Single Responsibility Principle (SRP).

---

## Language / 言語

- [日本語 (README.ja.md)](file:///c:/ai/projects/under-development/minecraft-addons/addon-utils/README.ja.md)
- [English (README.md)](file:///c:/ai/projects/under-development/minecraft-addons/addon-utils/README.md)

---

## Versioned API Reference

Detailed specifications (signatures, parameters, return types, edge cases, and code examples) for all externally available types, functions, classes, and constants are documented under `docs/` by version:

- [**docs/v0.1.0.md**](file:///c:/ai/projects/under-development/minecraft-addons/addon-utils/docs/v0.1.0.md): Initial Stable Release (Item/Equipment, Block/Direction, Player State Management, Player Input & Direction Resolver, Math/Geometry, Physics Impulse & Lift Solvers)
  - English: [docs/v0.1.0.md](file:///c:/ai/projects/under-development/minecraft-addons/addon-utils/docs/v0.1.0.md)
  - 日本語: [docs/v0.1.0.ja.md](file:///c:/ai/projects/under-development/minecraft-addons/addon-utils/docs/v0.1.0.ja.md)

---

## Installation

Install in your addon's `package.json` pointing to the GitHub repository and release tag:

```json
{
  "dependencies": {
    "addon-utils": "github:01Taka/minecraft-addon-utils#v0.1.0"
  }
}
```

Or using pnpm:

```bash
pnpm add github:01Taka/minecraft-addon-utils#v0.1.0
```

Import directly from the package root:

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

> **Note**: To prevent breaking changes when internal file layouts change, subpaths (such as `addon-utils/item`) are encapsulated. Always import directly from `"addon-utils"`.

For comprehensive usage and module specifications, please refer to the versioned reference ([docs/v0.1.0.md](file:///c:/ai/projects/under-development/minecraft-addons/addon-utils/docs/v0.1.0.md)).
