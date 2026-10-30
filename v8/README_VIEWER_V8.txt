3XyzMedia RGB Bridge™ — PUBLIC VIEWER v8, 30.10.2026

Viewer v8 is cloned from v7. All original v72 starfield, Sky Flight, Gaussian shaders, BIN, krpano and model resources are unchanged.

Fix: top FX ON/OFF button now works even when the author sets fxui=0 in SHARE. Previously fxui=0 left the top button visible but without a click handler. The fxui switch continues to gate author/guest effect panels, not the global effects power switch.

Javascript cache version incremented to 8. User's exact decoded state (zt=1, sk=flight, zb=85, zd=75, sc=1, fs=1.5, fc=130) was tested in Chromium with two original v72 canvases: ON -> OFF -> ON passes.

Warning: full render fidelity and 20K requires visual test on target hardware. Original public v6, v7 and private STUDIO remain untouched.
