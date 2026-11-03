# 3XyzMedia — загрузка моделей, музыки, видео и BIN

Для новых файлов используйте этот репозиторий, а в STUDIO вставляйте **полную прямую HTTPS-ссылку**.

| Файл | Папка в корне репозитория | Адрес для STUDIO |
|---|---|---|
| PLY | `model/` | `https://3xyzmedia.github.io/3xyzmedia-viewer/model/NAME.ply` |
| MP3 | `assets/music/` | `https://3xyzmedia.github.io/3xyzmedia-viewer/assets/music/NAME.mp3` |
| MP4 | `assets/video/` | `https://3xyzmedia.github.io/3xyzmedia-viewer/assets/video/NAME.mp4` |
| BIN | `assets/morph-targets/` | `https://3xyzmedia.github.io/3xyzmedia-viewer/assets/morph-targets/NAME.xyzrgb.bin` |

**Уже загруженную EMELYA переносить не нужно.** Её адрес:

```text
https://3xyzmedia.github.io/3xyzmedia-viewer/model/EMELYA%20IN%20THE%20FIRE.ply
```

Короткое имя `SOY2.ply` в Viewer v12/v13 по-прежнему ищется в старом хранилище `3XyzMedia/3d-models/model/`. Для файлов в этом репозитории используйте полный URL. Старые модели переносить не требуется.

Ссылки GitHub с `/blob/main/` не являются прямыми адресами модели. В URL пробел заменяется на `%20`; для новых имён удобнее подчёркивания.

После загрузки: **Commit changes → успешная публикация Pages → полный URL в STUDIO → загрузить модель → настроить → создать новую SHARE-ссылку**.

[Подробная инструкция](assets/README_UPLOADS_RU.txt)

Публичный Viewer: [v13](https://3xyzmedia.github.io/3xyzmedia-viewer/v13/). Для передачи огня и ограничений дистанции используйте личную STUDIO v72 FIX14 и создайте новую SHARE-ссылку на `/v13/`.
Авторскую STUDIO и исходники личных инструментов сюда не загружать. Старый репозиторий VIEWER закрыт; его адреса не использовать для новых ресурсов.
