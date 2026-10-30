3XyzMedia RGB Bridge™ — PUBLIC VIEWER v7 STAR FX PARITY (30.10.2026)
Source: original STUDIO v72. Read-only spectator.

FIXED:
- Original v72 star-field algorithm (seeded 110-4600 multicolored twinkling stars, bright flares, halos, naturalistic clusters, source rs/zb/zd/sc flags) replaces inferior spectator dots.
- Original v72 Sky Flight algorithm (z-based colored star travel, size, twinkle, cross glints, speed fs, count fc) replaces simplified spectator visual.
- Both visual layers are independent and not re-drawn by the legacy generic experienceCanvas.
- FX OFF clears and stops both source-derived layers; FX ON recreates both.
- No changes to camera, SORT/AA, private STUDIO, music, other FX, MORPH or 20K. Existing viewer v1–v6 are intact.
- Public spectator contains no studio editor panels.
TESTS: node --check all 6 JS; XML parsed; Node VM simulated two separate active canvases, multi-thousand original-star draw calls, OFF stops and clears, ON restores.
NEEDS REAL BROWSER TEST: Pixel parity requires viewer share (v=j...) from Studio; other FX and 20K are not declared fixed by this update.
