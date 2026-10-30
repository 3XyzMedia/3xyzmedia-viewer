3XyzMedia RGB Bridge™ — Viewer v12 / compact mobile tooltip fix
Date: 2026-10-30

v12 is based exactly on public v11. The reported mobile bug is fixed:
- Single-line help bar is content-width, not a full-width space-between flex layout.
- Monitor, oval slanted wired mouse, and 'Full' are one inseparable group, never aligned at opposite ends.
- Responsive short Russian labels for narrow phone widths.
- Desktop hint no longer says "Колесо — зум"; desktop help is "ЛКМ — вращение · ПКМ — перемещение · Shift+ЛКМ — наклон".
- STUDIO v72 FIX10 remains owner-only; no change required for checking v12.

Changed in viewer: index.html, viewer.css, README only. ALL JS/FX/MORPH/20K/Tour/music code, shaders, model pivot and BIN are byte-identical to public v11.

New test link: https://3xyzmedia.github.io/3xyzmedia-viewer/v12/?model=SOY2.ply

Caveat: HTML/CSS tested with Chromium at phone widths, but actual 3D WebGL on phone still requires owner testing.
