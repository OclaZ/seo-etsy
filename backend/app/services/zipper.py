import io
import os
import zipfile


def create_zip(folder_path: str) -> io.BytesIO:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for filename in sorted(os.listdir(folder_path)):
            filepath = os.path.join(folder_path, filename)
            if os.path.isfile(filepath):
                zf.write(filepath, filename)
    buffer.seek(0)
    return buffer
