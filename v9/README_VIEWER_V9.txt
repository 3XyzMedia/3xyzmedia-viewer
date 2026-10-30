3XyzMedia RGB Bridge™ — PUBLIC VIEWER v9 / PLAY CONTINUITY FIX
2026-10-30

Basis: public VIEWER v8, which retains STUDIO v72 star field/Star Flight and the repaired FX ON/OFF switch.

Fixed:
- Manual dragging, mouse/pointer/touch on a model no longer turns off autoplay PLAY or switches STOP to PLAY.
- While dragging, auto-yaw is temporarily suspended so the drag can be smooth. Once pointer is released, auto-yaw resumes immediately without a jump.
- HOME restores saved camera/pan/distance but does not disable autoplay. STOP remains STOP while autoplay is running.
- Explicit STOP button still stops autoplay; TOUR still takes precedence and can be canceled by manual gestures/HOME.
- Mouse wheel continues to zoom without stopping PLAY.

Unchanged:
- STUDIO v72, all 20K/MORPH/FX, binary, shader, star animations, music/video, mobile UI, model parameters.
- Existing /v8/ and all older public links remain available.
- No authoring tools included in the public viewer.

Tests: node --check all JS; Chromium tests compare v8 regression and v9, including pointer, touch, wheel, HOME, STOP. Real-browser GPU visual verification still required.

Viewer: https://3xyzmedia.github.io/3xyzmedia-viewer/v9/
