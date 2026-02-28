import os
import glob
import sys
import time
from PIL import Image, PngImagePlugin
import piexif
from piexif import helper

# ANSI colors
RED = "\033[91m"
WHITE = "\033[97m"
RESET = "\033[0m"

ASCII_ART = r"""
 /$$$$$$  /$$$$$$$$  /$$$$$$        /$$$$$$ /$$      /$$  /$$$$$$   /$$$$$$  /$$$$$$$$       /$$$$$$ /$$   /$$    /$$$$$ /$$$$$$$$  /$$$$$$  /$$$$$$$$ /$$$$$$  /$$$$$$$ 
 /$$__  $$| $$_____/ /$$__  $$      |_  $$_/| $$$    /$$$ /$$__  $$ /$$__  $$| $$_____/      |_  $$_/| $$$ | $$   |__  $$| $$_____/ /$$__  $$|__  $$__//$$__  $$| $$__  $$
| $$  \__/| $$      | $$  \ $$        | $$  | $$$$  /$$$$| $$  \ $$| $$  \__/| $$              | $$  | $$$$| $$      | $$| $$      | $$  \__/   | $$  | $$  \ $$| $$  \ $$
|  $$$$$$ | $$$$$   | $$  | $$        | $$  | $$ $$/$$ $$| $$$$$$$$| $$ /$$$$| $$$$$           | $$  | $$ $$ $$      | $$| $$$$$   | $$         | $$  | $$  | $$| $$$$$$$/
 \____  $$| $$__/   | $$  | $$        | $$  | $$  $$$| $$| $$__  $$| $$|_  $$| $$__/           | $$  | $$  $$$$ /$$  | $$| $$__/   | $$         | $$  | $$  | $$| $$__  $$
 /$$  \ $$| $$      | $$  | $$        | $$  | $$\  $ | $$| $$  | $$| $$  \ $$| $$              | $$  | $$\  $$$| $$  | $$| $$      | $$    $$   | $$  | $$  | $$| $$  \ $$
|  $$$$$$/| $$$$$$$$|  $$$$$$/       /$$$$$$| $$ \/  | $$| $$  | $$|  $$$$$$/| $$$$$$$$       /$$$$$$| $$ \  $$|  $$$$$$/| $$$$$$$$|  $$$$$$/   | $$  |  $$$$$$/| $$  | $$
 \______/ |________/ \______/       |______/|__/     |__/|__/  |__/ \______/ |________/      |______/|__/  \__/ \______/ |________/ \______/    |__/   \______/ |__/  |__/
"""

def print_ascii_effect(text, delay=0.03):
    lines = text.split('\n')
    width = max(len(line) for line in lines)
    padded_lines = [line.ljust(width) for line in lines]

    for col in range(width + 10):
        os.system('cls' if os.name == 'nt' else 'clear')
        for line in padded_lines:
            colored_line = ""
            for i, char in enumerate(line):
                colored_line += RED + char + RESET if i == col else char
            print(colored_line)
        time.sleep(delay)

def print_team_name():
    team_name = "Team Crazy SEO Rank"
    for _ in range(6):
        sys.stdout.write(f"{RED}{team_name}{RESET}\r")
        sys.stdout.flush()
        time.sleep(0.3)
        sys.stdout.write(f"{WHITE}{team_name}{RESET}\r")
        sys.stdout.flush()
        time.sleep(0.3)
    print(f"{RED}{team_name}{RESET}")

def add_keywords_to_image(image_path, keywords):
    keywords_str = ", ".join(keywords)
    ext = os.path.splitext(image_path)[1].lower()

    img = Image.open(image_path)

    if ext in [".jpg", ".jpeg"]:
        try:
            exif_dict = piexif.load(img.info.get('exif', b''))
        except Exception:
            exif_dict = {"0th": {}, "Exif": {}, "GPS": {}, "Interop": {}, "1st": {}, "thumbnail": None}

        user_comment = helper.UserComment.dump(keywords_str)
        exif_dict["Exif"][piexif.ExifIFD.UserComment] = user_comment
        exif_dict["0th"][piexif.ImageIFD.ImageDescription] = keywords_str.encode("utf-8")
        try:
            exif_dict["0th"][piexif.ImageIFD.XPKeywords] = keywords_str.encode("utf-16le")
        except:
            safe_keywords = ", ".join([k for k in keywords if all(ord(c) < 128 for c in k)])
            exif_dict["0th"][piexif.ImageIFD.XPKeywords] = safe_keywords.encode("utf-16le")

        exif_bytes = piexif.dump(exif_dict)
        img.save(image_path, "jpeg", exif=exif_bytes, quality=95)
        print(f"✅ Keywords added to JPEG: {os.path.basename(image_path)}")

    elif ext == ".png":
        png_info = PngImagePlugin.PngInfo()
        for k, v in img.info.items():
            if isinstance(v, str):
                png_info.add_text(k, v)
        png_info.add_text("Keywords", keywords_str)
        img.save(image_path, "png", pnginfo=png_info)
        print(f"✅ Keywords added to PNG: {os.path.basename(image_path)}")

    else:
        print(f"⚠️ Unsupported image format: {image_path}")

    img.close()

def add_keywords_to_images(folder_path, keywords):
    image_files = []
    for ext in ("*.jpg", "*.jpeg", "*.png"):
        image_files.extend(glob.glob(os.path.join(folder_path, ext)))

    if not image_files:
        print("❌ No supported images (JPG, JPEG, PNG) found.")
        return

    for image_path in image_files:
        try:
            add_keywords_to_image(image_path, keywords)
        except Exception as e:
            print(f"❌ Error processing {image_path}: {e}")

if __name__ == "__main__":
    print_ascii_effect(ASCII_ART)
    print_team_name()

    file_path = input("📂 Enter the path to your keywords text file (one keyword per line): ").strip()
    if not os.path.isfile(file_path):
        print(f"❌ File not found: {file_path}")
        sys.exit(1)

    with open(file_path, "r", encoding="utf-8") as f:
        keywords = [line.strip() for line in f if line.strip()]

    if not keywords:
        print("❌ No keywords found in the file.")
        sys.exit(1)

    current_dir = os.path.dirname(os.path.abspath(__file__))
    add_keywords_to_images(current_dir, keywords)

    print("🎉 Finished adding multilingual keywords to all images!")
