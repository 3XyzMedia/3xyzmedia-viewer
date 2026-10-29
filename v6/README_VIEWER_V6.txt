3XyzMedia RGB Bridge(TM) — Viewer v6: safe splat sorting and onload parity, 30.10.2026

Public view-only code, NOT the authoring STUDIO.
Parent: Viewer v5. All model files/FX resources unchanged; only camera/render-init in viewer.js adjusted.

FIX 1. Reapply shared krpano model transform/AA/scale/sort mode/camera AFTER scene onloadcomplete.
FIX 2. Shared sortmode OFF (q=3) now maps to DISTANCE to avoid dark unsorted-splat artifacts. Source state remains intact. Compare with &sort=off or &sort=accurate if necessary. Tradeoff: distance sorting can increase GPU cost.
FIX 3. Private Studio FIX7 copies SHARE to /v6/, without rewriting the v= payload or model/FX parameters.

No changes to private v72 authoring algorithms. Legacy v1-v5 public files untouched.

KNOWN: Browser-level visual verification still required; no guarantee that all FX are pixel-identical to Studio. The 'krpano demo version' watermark is a license restriction.
