# Replacing the demo GIF

`vscode-demo.gif` is the animation shown at the top of the extension README on the
VS Code Marketplace. It currently holds a **placeholder title card** — replace it
with a real screen recording.

## Record it (Recordly)

Use **Recordly** (<https://github.com/webadderallorg/Recordly>):

1. Record the VS Code / Cursor window at **1280×720** (16:9).
2. Walk through one clean flow, ~15–30s:
   - Open the MDPilot sidebar → **Settings** tab → key already configured.
   - Switch to **Chat** → type `generate agents` → show `AGENTS.md` appearing.
3. Turn on **auto-zoom on cursor** so detail stays legible at README width.
4. Export as **GIF**, ~12 fps, **≤ 6 MB**, named exactly `vscode-demo.gif`.

## Drop it in

Overwrite `packages/vscode/assets/vscode-demo.gif`, then republish:

```bash
cd packages/vscode
npx vsce publish
```

The README already references `assets/vscode-demo.gif`, so no markdown change is
needed — the new recording shows on the Marketplace after the next publish.
