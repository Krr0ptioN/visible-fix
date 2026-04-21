# Research Report: shadcn/ui for React Native & Nx Monorepo Integration

**Date:** April 6, 2026  
**Topic:** Cross-platform UI components and Nx monorepo setup with shadcn philosophy

---

## 1. shadcn/ui for React Native — Is There a Port?

### Short Answer

**No official shadcn-ui library exists for React Native.** The original shadcn/ui is web-specific (built on Radix UI + Tailwind CSS). However, several community projects have emerged to bring the "shadcn philosophy" (copy-paste ownership, customizable, accessible) to React Native/Expo.

---

### Community Ports & Alternatives

| Project | Approach | Status | Key Features |
|---------|----------|--------|---------------|
| **[React Native Reusables](https://reactnativereusables.com/)** | NativeWind + RN Primitives | **Active** | Most mature; CLI tool; copy-paste philosophy |
| **[NativeWind](https://www.nativewind.dev/)** | Tailwind CSS for RN (styling engine only) | Active | Foundation for most shadcn-like libs |
| **Gluestack UI v2** | NativeWind + copy-paste | Active | Tailwind-first; accessibility-focused |
| **[NativeCN](https://nativecn.xyz/)** | NativeWind-first | New (2025) | RN components inspired by shadcn/ui |
| **shadcn-native** | Unofficial port | Beta | Niche; varies in maintenance |

### Recommendation

**Use React Native Reusables** — it is the most established project that replicates the shadcn developer experience:
- Copy-paste components into your codebase
- NativeWind for Tailwind-compatible styling
- RN Primitives (universal Radix UI port) for accessibility
- CLI mirroring shadcn CLI patterns

### Caveats

- No 1:1 port exists; expect differences (e.g., no DOM portals — use `PortalHost` for modals/menus)
- All are community-driven, not affiliated with official shadcn/ui
- Maintenance varies — check GitHub activity before production use

---

## 2. Integrating shadcn/ui with Tailwind CSS in Nx Monorepo

### Recommended Setup (2025 Best Practice)

1. **Initialize with monorepo flag:**
   ```bash
   npx shadcn@latest init --monorepo
   ```

2. **Create shared UI library:**
   ```bash
   # In apps/ or libs/, e.g., libs/ui
   npx shadcn@latest add button -y
   ```

3. **Directory structure:**
   ```
   apps/
     web/ (Next.js)
   libs/
     ui/  (shared shadcn components)
   ```

4. **Configure Tailwind content paths** (in both `apps/web` and `libs/ui`):
   ```javascript
   // tailwind.config.js
   module.exports = {
     content: [
       "./apps/**/*.{ts,tsx,html}",
       "./libs/ui/**/*.{ts,tsx,html}"
     ],
     // ... rest of config
   }
   ```

5. **Handle globals.css:**
   - Place `globals.css` (with Tailwind directives + CSS variables) in the shared UI lib
   - Import it in each consuming app's root layout

6. **Manage dependencies:**
   - Install shared deps (`clsx`, `tailwind-merge`, `radix-ui/*`) at workspace root or in the UI lib's `package.json`
   - Avoid duplicate installations

### Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Styles not applying | Verify `globals.css` is imported in consuming app; check `content` paths |
| Missing peer deps | Install `zod`, `sonner`, etc. at workspace root |
| Path alias errors | Ensure `components.json` has correct `path` aliases |

---

## 3. Boilerplate Templates: Nx + Next.js + React Native + shadcn + Drizzle

### Top Recommendations

| Template | Stack | Notes |
|----------|-------|-------|
| **[TimurBas/expo-nextjs-monorepo](https://github.com/TimurBas/expo-nextjs-monorepo)** | Expo 53, Next.js 15, better-auth, NativeWind, shadcn/ui, Tailwind, Turborepo | **Closest match** to your requirements; active development |
| **[T3 Turbo](https://create.t3.gg/)** | Next.js, Expo, Tailwind, tRPC, Drizzle | Production-tested; uses Turborepo (Nx alternative) |
| **[TurboStarter](https://www.turbostarter.dev/stacks/nextjs-drizzle-boilerplate)** | Next.js 16, Drizzle, Tailwind | Web + mobile + extension support |
| **[gmickel/turborepo-shadcn-nextjs](https://github.com/gmickel/turborepo-shadcn-nextjs)** | Next.js, shadcn/ui, Storybook, Bun | Shared shadcn package; Bun + Biome |

### Note on Nx vs. Turborepo

- **Nx:** More features, enterprise-oriented, steeper learning curve
- **Turborepo:** Lighter, popular with Vercel/Expo ecosystems, often used in modern React stacks

Both work; many templates (including shadcn-compatible ones) default to Turborepo. If Nx is a hard requirement, you may need to adapt a Turborepo template or build from scratch using the patterns above.

---

## Summary: Package Recommendations

| Use Case | Package | Install/Use |
|----------|---------|-------------|
| RN shadcn-style | React Native Reusables | `npx react-native-reusables init` |
| RN styling | NativeWind | `npm install nativewind` |
| Nx + Next.js + shadcn | Official CLI | `npx shadcn@latest init --monorepo` |
| ORM | Drizzle ORM | `npm install drizzle-orm` |
| Template (closest match) | TimurBas/expo-nextjs-monorepo | Clone from GitHub |

---

## Sources

- React Native Reusables: https://reactnativereusables.com/
- NativeWind: https://www.nativewind.dev/
- shadcn/ui docs: https://ui.shadcn.com/
- Nx docs: https://nx.dev/
- TimurBas/expo-nextjs-monorepo: https://github.com/TimurBas/expo-nextjs-monorepo
- TurboStarter: https://www.turbostarter.dev/
- Reddit discussions on shadcn RN ports (2024-2025)
- Gürsel Çakar monorepo guide: https://www.gurselcakar.com/monorepo

---

*Report generated: April 6, 2026*
