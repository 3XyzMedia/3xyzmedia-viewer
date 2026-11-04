# 3XyzMedia — загрузка моделей, музыки, видео и BIN

Для новых файлов используйте этот репозиторий, а в STUDIO вставляйте **полную прямую HTTPS-ссылку**.

| Файл | Папка в корне репозитория | Адрес для STUDIO |
|---|---|---|
| PLY | `model/` | `https://3xyzmedia.github.io/3xyzmedia-viewer/model/NAME.ply` |
| MP3 | `assets/music/` | `https://3xyzmedia.github.io/3xyzmedia-viewer/assets/music/NAME.mp3` |
| MP4 | `assets/video/` | `https://3xyzmedia.github.io/3xyzmedia-viewer/assets/video/NAME.mp4` |
| BIN | `assets/morph-targets/` | `https://3xyzmedia.github.io/3xyzmedia-viewer/assets/morph-targets/NAME.xyzrgb.bin` |

**Текущую Emely переносить не нужно.** Её адрес:

```text
https://3xyzmedia.github.io/3xyzmedia-viewer/model/Emely.ply
```

Короткое имя `SOY2.ply` в Viewer v12/v13/v14/v15 по-прежнему ищется в старом хранилище `3XyzMedia/3d-models/model/`. Для файлов в этом репозитории используйте полный URL. Старые модели переносить не требуется.

Ссылки GitHub с `/blob/main/` не являются прямыми адресами модели. В URL пробел заменяется на `%20`; для новых имён удобнее подчёркивания.

После загрузки: **Commit changes → успешная публикация Pages → полный URL в STUDIO → загрузить модель → настроить → создать новую SHARE-ссылку**.

[Подробная инструкция](assets/README_UPLOADS_RU.txt)

Публичный Viewer: [v15](https://3xyzmedia.github.io/3xyzmedia-viewer/v15/). Для передачи огня и ограничений дистанции используйте личную STUDIO v72 FIX16 и создайте новую SHARE-ссылку на `/v15/`.
Авторскую STUDIO и исходники личных инструментов сюда не загружать. Старый репозиторий VIEWER закрыт; его адреса не использовать для новых ресурсов.

## Огонь модели и LOD (FIX16 / v15)

Новый режим «Горит сама модель» создаёт пламя из её Gaussian splats; высота, доля точек, скорость и накал передаются в SHARE. Режим экспериментальный, вид на телефоне нужно оценить отдельно.

Для Emely.ply доступны уровни **200034 / 50008 / 12502** сплата. AUTO выбирает по экранному размеру и FPS, есть ручные FULL/MEDIUM/LOW. Переключение дискретное, с возможной паузой; во время MORPH/20K оно приостановлено.

После загрузки нового `.ply` в корневую `model/` workflow **Build Gaussian LOD** создаёт рядом `.lod.json` и файлы в `model/lod/NAME/`, затем запрашивает пересборку Pages. Дождитесь успешной сборки. Исходный PLY сохраняется. Без манифеста модель работает как раньше, без LOD.
