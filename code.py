import os
import glob
import time
import sys

# ANSI colors
ORANGE = '\033[38;5;208m'
WHITE = '\033[97m'
RESET = '\033[0m'

ASCII_BANNER_LINES = [
" /$$$$$$  /$$$$$$$$  /$$$$$$        /$$$$$$ /$$      /$$  /$$$$$$   /$$$$$$  /$$$$$$$$        /$$$$$$  /$$$$$$$  /$$$$$$$$ /$$$$$$ /$$      /$$ /$$$$$$ /$$$$$$$$ /$$$$$$$$ /$$$$$$$ ",
" /$$__  $$| $$_____/ /$$__  $$      |_  $$_/| $$$    /$$$ /$$__  $$ /$$__  $$| $$_____/       /$$__  $$| $$__  $$|__  $$__/|_  $$_/| $$$    /$$$|_  $$_/|_____ $$ | $$_____/| $$__  $$",
"| $$  \\__/| $$      | $$  \\ $$        | $$  | $$$$  /$$$$| $$  \\ $$| $$  \\__/| $$            | $$  \\ $$| $$  \\ $$   | $$     | $$  | $$$$  /$$$$  | $$       /$$/ | $$      | $$  \\ $$",
"|  $$$$$$ | $$$$$   | $$  | $$        | $$  | $$ $$/$$ $$| $$$$$$$$| $$ /$$$$| $$$$$         | $$  | $$| $$$$$$$/   | $$     | $$  | $$ $$/$$ $$  | $$      /$$/  | $$$$$   | $$$$$$$/",
" \\____  $$| $$__/   | $$  | $$        | $$  | $$  $$$| $$| $$__  $$| $$|_  $$| $$__/         | $$  | $$| $$____/    | $$     | $$  | $$  $$$| $$  | $$     /$$/   | $$__/   | $$__  $$",
" /$$  \\ $$| $$      | $$  | $$        | $$  | $$\\  $ | $$| $$  | $$| $$  \\ $$| $$            | $$  | $$| $$         | $$     | $$  | $$\\  $ | $$  | $$    /$$/    | $$      | $$  \\ $$",
"|  $$$$$$/| $$$$$$$$|  $$$$$$/       /$$$$$$| $$ \\/  | $$| $$  | $$|  $$$$$$/| $$$$$$$$      |  $$$$$$/| $$         | $$    /$$$$$$| $$ \\/  | $$ /$$$$$$ /$$$$$$$$| $$$$$$$$| $$  | $$",
" \\______/ |________/ \\______/       |______/|__/     |__/|__/  |__/ \\______/ |________/       \\______/ |__/         |__/   |______/|__/     |__/|______/|________/|________/|__/  |__/"
]

def animate_ascii_banner():
    for line in ASCII_BANNER_LINES:
        for i in range(len(line) + 1):
            colored = ORANGE + line[:i] + RESET + WHITE + line[i:] + RESET
            sys.stdout.write(colored + '\r')
            sys.stdout.flush()
            time.sleep(0.002)
        print()

def print_team_name():
    team_name = "Team Crazy SEO Rank"
    for _ in range(6):
        sys.stdout.write(f"{ORANGE}{team_name}{RESET}\r")
        sys.stdout.flush()
        time.sleep(0.3)
        sys.stdout.write(f"{WHITE}{team_name}{RESET}\r")
        sys.stdout.flush()
        time.sleep(0.3)
    print(f"{ORANGE}{team_name}{RESET}")

def rename_images(folder_path, base_name):
    image_files = []
    for ext in ("*.png", "*.jpeg", "*.jpg"):
        image_files.extend(glob.glob(os.path.join(folder_path, ext)))
    image_files.sort()

    for i, old_path in enumerate(image_files, 1):
        ext = os.path.splitext(old_path)[1].lower()
        new_filename = f"{base_name}{ext}" if i == 1 else f"{base_name}-{i}{ext}"
        new_path = os.path.join(folder_path, new_filename)
        try:
            os.rename(old_path, new_path)
            print(f"Renamed: {os.path.basename(old_path)} -> {new_filename}")
        except Exception as e:
            print(f"Error renaming {old_path}: {e}")

if __name__ == "__main__":
    animate_ascii_banner()
    print_team_name()
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_name_input = input("\nEnter the main keyword for the images (e.g., Buy-leather-bags): ").strip()
    
    if not base_name_input:
        print("No base name provided. Exiting.")
    else:
        rename_images(current_dir, base_name_input)
        print("Optimization complete!")
