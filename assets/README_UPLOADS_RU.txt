3XyzMedia RGB Bridge — PUBLIC MEDIA STORAGE
Этот репозиторий публичный, но НЕ содержит авторскую STUDIO.
Всё загруженное в assets доступно всем зрителям.

Модель PLY:
  GitHub 3XyzMedia/3d-models -> model/ -> Add file -> Upload files.
  В STUDIO поле модели: SOY2.ply (для файлов в model/) или абсолютная HTTPS-ссылка.
  Пример https://raw.githubusercontent.com/3XyzMedia/3d-models/main/model/SOY2.ply

Музыка MP3:
  3XyzMedia/3xyzmedia-viewer -> assets/music/ -> Add file -> Upload files.
  После загрузки вставь в STUDIO -> Музыка -> Путь к MP3:
  https://3xyzmedia.github.io/3xyzmedia-viewer/assets/music/MY_TRACK.mp3
  Затем нажми «Применить MP3».

Видео MP4:
  3XyzMedia/3xyzmedia-viewer -> assets/video/ -> Add file -> Upload files.
  В STUDIO -> Видео -> Путь к видео:
  https://3xyzmedia.github.io/3xyzmedia-viewer/assets/video/MY_CLIP.mp4
  Включи передачу видео по SHARE, если нужно.

BIN (MORPH 20K):
  3XyzMedia/3xyzmedia-viewer -> assets/morph-targets/ -> Add file -> Upload files.
  Нужен 20000 * 6 * 4 = 480000 байт float32 little endian (XYZ RGB).
  В STUDIO -> 20K -> Целевая фигура вставляй ПОЛНЫЙ HTTPS URL:
  https://3xyzmedia.github.io/3xyzmedia-viewer/assets/morph-targets/MY_LABEL.xyzrgb.bin
  Имя файла без ссылки в Viewer v12 читается из /v12/morph-targets/,
  поэтому для общей папки assets/morph-targets нужен полный URL.
  На смартфонах 20K отключен в целях стабильности.

Примеры выше — ШАБЛОНЫ адресов. Пока файлы фактически не загружены, эти ссылки вернут 404.
Размер web-upload GitHub обычно до 25 MiB на файл. Файлы должны быть законно доступны для публикации.
После загрузки нажми Commit changes и дождись зелёной сборки Pages.
Создай новый SHARE из PRIVАTE STUDIO v72 FIX12. Ссылка должна вести на /v12/.
Никогда не загружай studio.html или исходники частных инструментов в публичный репозиторий.

Текущий локальный редактор: STUDIO v72 FIX12; публичный Viewer: v12.
