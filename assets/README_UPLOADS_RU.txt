3XyzMedia — КУДА ЗАГРУЖАТЬ ФАЙЛЫ
Актуальная инструкция от 03.11.2026

Для НОВЫХ загрузок используйте публичный репозиторий 3XyzMedia/3xyzmedia-viewer:
PLY модели: model/
MP3 музыка: assets/music/
MP4 видео: assets/video/
BIN цели MORPH 20K: assets/morph-targets/

В STUDIO вставляйте ПОЛНУЮ прямую HTTPS-ссылку на файл:
PLY: https://3xyzmedia.github.io/3xyzmedia-viewer/model/NAME.ply
MP3: https://3xyzmedia.github.io/3xyzmedia-viewer/assets/music/NAME.mp3
MP4: https://3xyzmedia.github.io/3xyzmedia-viewer/assets/video/NAME.mp4
BIN: https://3xyzmedia.github.io/3xyzmedia-viewer/assets/morph-targets/NAME.xyzrgb.bin

Уже загруженная модель:
https://3xyzmedia.github.io/3xyzmedia-viewer/model/EMELYA%20IN%20THE%20FIRE.ply
Вставьте этот адрес целиком в поле модели STUDIO и нажмите загрузку.
Переносить модель в другой репозиторий НЕ требуется.

ВАЖНО:
- Ссылки github.com/.../blob/main/... открывают страницу GitHub, а не прямой файл.
- Пробел в адресе заменяется на %20. Для новых файлов удобны имена EMELYA_IN_THE_FIRE.ply.
- В публичном Viewer v12 короткое имя вроде SOY2.ply ищется в ДРУГОМ репозитории:
  https://raw.githubusercontent.com/3XyzMedia/3d-models/main/model/SOY2.ply
  Эта старая схема сохранена для совместимости. Она НЕ ищет в 3xyzmedia-viewer/model/.
  Для новой общей схемы всегда используйте полный HTTPS URL.
- Старые модели в 3d-models/model/ остаются на своих местах. Дублировать их не нужно.
- После Upload files нажмите Commit changes, дождитесь успешной публикации Pages.
- Затем загрузите модель в STUDIO, настройте сцену и создайте НОВУЮ SHARE-ссылку на /v12/.
- Загрузка файла в GitHub сама по себе не переключает модель в STUDIO.
- Папка model/ внутри v12 — не место новых общих загрузок. Используйте model/ в КОРНЕ репозитория.
- Старый VIEWER закрыт (PRIVATE). Его Pages/RAW адреса не использовать для новых ресурсов.
- Не загружайте авторскую STUDIO и исходники личных инструментов в публичный репозиторий.

BIN MORPH20K: 20000 записей XYZRGB, float32 little-endian, без заголовка, ровно 480000 байт.
BIN — цель эффекта, не основная PLY-модель. На смартфонах GPU20K отключён.

Рабочая музыка:
https://3xyzmedia.github.io/3xyzmedia-viewer/assets/music/peremen.mp3
Видео:
https://3xyzmedia.github.io/3xyzmedia-viewer/assets/video/G_1.mp4

Размер браузерной загрузки GitHub обычно до 25 MiB на файл.
Для более крупных файлов требуется отдельный способ загрузки; инструкции выше не снимают лимиты GitHub.
