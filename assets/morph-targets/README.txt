ЦЕЛИ MORPH 20K BIN — загружать в 3xyzmedia-viewer/assets/morph-targets/

ПРАВИЛО АДРЕСА (NAME.xyzrgb.bin заменить точным именем своего файла):
https://3xyzmedia.github.io/3xyzmedia-viewer/assets/morph-targets/NAME.xyzrgb.bin

ПРИМЕР, а НЕ уже загруженный файл:
HEART_20000.xyzrgb.bin ->
https://3xyzmedia.github.io/3xyzmedia-viewer/assets/morph-targets/HEART_20000.xyzrgb.bin
Пока этот файл не загружен и не опубликован, пример даст 404.

В STUDIO -> 20K -> целевая фигура вставить ПОЛНЫЙ URL, не только имя.
Формат: 20000 записей XYZRGB, float32 little-endian, без заголовка, 480000 байт.
Это цель эффекта, не основная PLY-модель. GPU20K на смартфонах отключён.

КАК ЗАГРУЗИТЬ:
Add file -> Upload files -> Commit changes. Дождитесь успешной публикации Pages.
В STUDIO вставляйте полный прямой HTTPS-адрес, затем примените/загрузите файл.
Ссылка github.com/.../blob/main/... — страница GitHub, она не подходит.
В адресе пробел заменяется на %20. Регистр букв должен совпадать.
Для новых имён удобнее латиница и подчёркивания без пробелов.
После настройки создайте новую SHARE-ссылку.
