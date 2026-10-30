3XyzMedia RGB Bridge™ — PUBLIC VIEWER v10 (mobile UI)
2026-10-30

Baseline: live v9. ONLY mobile UI / brand click handler changed.
- The mobile toolbar container now fits the width of visible buttons, without empty dark trailing bar.
- The expanded brand/LABEL frame is 236px wide (225px on very small phones).
- On phones (<=600 CSS px), the lower ✨ FX action is hidden and routed to the brand/LABEL when no playable MORPH is selected. If MORPH is selected, tapping the brand starts MORPH as in v72. If 20K is unavailable on phone, an explicitly shared FX can play instead.
- The top FX ON/OFF master remains visible and functional.
- Phone bottom hint is a two-line instruction and sits to the right of the i button: "☝️ Вращение · ✌️ Масштаб и перемещение"; and a custom SVG monitor + slightly angled oval mouse with wire, followed by "Полную версию смотрите на ПК".
- Desktop appearance and behavior unchanged. Model, camera, krpano XML, BIN, FX shaders, Star Flight, music, 20K and TOUR reused exactly from v9.

Verified with Chromium DOM mobile layouts 390/320 px, desktop 1280 px, and brand-event tests. Actual mobile WebGL review by the owner remains necessary. v9 remains available.
