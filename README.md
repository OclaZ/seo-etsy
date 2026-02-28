<p align="center">
  <img src="frontend/public/imgs/Logotipo_Carrito_de_Compras_de_Supermercado_Minimalista_Naranja_y_Rojo-removebg-preview.png" alt="SEO Image Toolkit Logo" width="400" />
</p>

# SEO-Image-Toolkit

**By Aamir El Amiri**

A full-stack web application that optimizes your Etsy product images for SEO. It renames image files with keyword-rich names and injects SEO keywords directly into image metadata (EXIF & PNG) — helping your listings rank higher in Etsy search.

---

## Features

| Feature | Description |
|---------|-------------|
| SEO Image Renaming | Renames files like `IMG_001.jpg` to `Leather-laptop-backpack.jpg` with live preview |
| EXIF Metadata Injection | Writes to 4 JPEG fields: Title, Subject, Tags/Keywords, Comments |
| PNG Metadata Injection | Adds Keywords, Title, Subject, Comment text chunks to PNG files |
| Per-Field SEO Control | Toggle each metadata field on/off, choose between auto-keywords or custom text per field |
| Image Selector with Thumbnails | Visual grid with thumbnail previews to select which images to optimize |
| Default Keywords for Unselected Images | Images not selected for custom SEO still get all uploaded keywords injected into all 4 metadata fields |
| Metadata Inspector | Standalone tool to upload any image and view all its embedded metadata (EXIF, XP tags, GPS, PNG chunks) |
| Image Scraper | Enter any website URL to extract and download all images — with Cloudflare bypass support |
| Image Converter | Convert images between formats (JPG, PNG, JPEG) — supports BMP, TIFF, GIF, WEBP, AVIF, HEIC, SVG input |
| Bulk Processing | Process up to 50 images at once |
| Dynamic ZIP Download | Download all optimized images as a ZIP with unique filename (`aamir-{count}images-{random}.zip`) |
| Interactive Tutorial Page | Built-in "How to Use" page with video walkthrough and 5-step illustrated guide |
| Dark / Light Mode | Toggle between dark and light themes |
| Keyword Upload | Upload keywords from `.txt` file or type them manually |
| Session Management | Auto-cleanup of expired sessions after 60 minutes |

---

## How Metadata Injection Works

The app injects SEO keywords into image metadata fields that are visible in file properties (right-click > Properties > Details on Windows):

### JPEG Images
| Metadata Field | EXIF Tag | Windows Property |
|----------------|----------|-----------------|
| Title | XPTitle (0x9C9B) | Titre / Title |
| Subject | XPSubject (0x9C9F) | Objet / Subject |
| Tags/Keywords | XPKeywords (0x9C9E) | Mots cles / Tags |
| Comments | XPComment (0x9C9C) | Commentaires / Comments |

### PNG Images
Injected as text chunks: `Keywords`, `Title`, `Subject`, `Comment`.

### Per-Field Control
Each field can be individually:
- **Enabled / Disabled** — toggle on or off
- **Auto mode** — uses your uploaded keywords
- **Custom mode** — set a custom value (e.g., a specific title or subject)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.13, FastAPI, Uvicorn, Pillow, piexif, httpx, BeautifulSoup4, cloudscraper |
| Frontend | React 18, Vite, Tailwind CSS, Axios, React Dropzone |
| Containerization | Docker, Docker Compose |

---

## Project Structure

```
SEO-Image-Toolkit/
├── backend/                    # FastAPI REST API
│   ├── main.py                 # App entry point
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Template for .env
│   ├── Dockerfile
│   └── app/
│       ├── config.py           # Settings loaded from .env
│       ├── routers/
│       │   ├── images.py       # Upload, rename, inject, download
│       │   ├── keywords.py     # Keyword file/text upload
│       │   ├── metadata.py     # Metadata inspector endpoint
│       │   ├── scraper.py      # Image scraper & download endpoints
│       │   └── converter.py   # Image format converter endpoint
│       ├── services/
│       │   ├── renamer.py      # Image rename logic
│       │   ├── injector.py     # EXIF/PNG keyword injection (piexif.insert)
│       │   ├── session_manager.py  # Session lifecycle & cleanup
│       │   └── zipper.py       # ZIP creation with dynamic naming
│       ├── models/
│       │   └── schemas.py      # Pydantic request/response models
│       └── utils/
│           └── file_utils.py   # Validation helpers
│
├── frontend/                   # React + Tailwind UI
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   ├── Dockerfile
│   └── src/
│       ├── App.jsx             # Main app with 4-step wizard + page routing
│       ├── main.jsx            # Entry point
│       ├── index.css           # Tailwind styles + animations
│       ├── api/
│       │   ├── client.js       # Axios instance
│       │   └── endpoints.js    # API call functions
│       ├── components/
│       │   ├── layout/         # Header, Footer, StepIndicator
│       │   ├── upload/         # ImageDropzone, ImagePreviewGrid, KeywordUploader
│       │   ├── configure/      # BaseNameInput, RenamePreview, SeoMetadataSettings, ImageSelector
│       │   ├── process/        # ProcessButton, ProgressBar, ProcessingOverlay
│       │   ├── results/        # ResultsSummary, DownloadButton
│       │   ├── scraper/        # ImageScraperPage
│       │   ├── converter/      # ImageConverterPage
│       │   ├── howtouse/       # HowToUsePage, VideoSection, StepGuide
│       │   ├── metadata/       # MetadataCheckerPage
│       │   └── ui/             # Toast notifications, ThemeToggle
│       ├── context/
│       │   └── AppContext.jsx  # Global state (useReducer)
│       └── hooks/
│           └── useTheme.js     # Dark/light mode hook
│
├── legacy/                     # Original CLI scripts (reference)
│   ├── code.py
│   ├── injector.py
│   └── keywords.txt
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Prerequisites

Before you start, make sure you have these installed:

### 1. Python (version 3.10 or higher)

Download from: https://www.python.org/downloads/

```bash
python --version
```

### 2. Node.js (version 18 or higher)

Download from: https://nodejs.org/

```bash
node --version
npm --version
```

### 3. Git (optional, for cloning)

Download from: https://git-scm.com/downloads

---

## Installation

### Step 1: Get the project

```bash
git clone https://github.com/ISTIFANO/SEO-Image-Toolkit.git
cd SEO-Image-Toolkit
```

### Step 2: Set up the backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
```

### Step 3: Set up the frontend

Open a **new terminal**:

```bash
cd frontend
npm install
cp .env.example .env
```

---

## Running the App

You need **two terminals** — one for the backend, one for the frontend.

### Terminal 1 — Start the Backend

```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Terminal 2 — Start the Frontend

```bash
cd frontend
npm run dev
```

### Open the App

Open your browser and go to: **http://localhost:5173**

---

## How to Use

> The app has a built-in **"How to Use"** page with a video tutorial and illustrated step-by-step guide. Click the **"How to Use"** button in the navbar to access it.

### 1. Upload Your Images & Keywords (Step 1)
- Drag & drop your product images (JPG, JPEG, PNG — up to 10 MB each, max 50) into the upload zone
- Upload a keyword file (`.txt`, one keyword per line) or type keywords manually

### 2. Configure SEO Settings (Step 2)
- **Select images**: use the thumbnail grid to pick which images get custom metadata
- **Base name**: enter a keyword-rich base name for file renaming (e.g., `Leather-laptop-backpack`) — live preview updates as you type
- **SEO Metadata Settings**: expand to configure each metadata field individually:
  - Toggle fields on/off (Title, Subject, Tags, Comments)
  - Choose "Use keywords" (auto) or "Custom value" per field
  - Use "Enable All" / "Disable All" for quick control
- **Unselected images** automatically get all uploaded keywords injected into all 4 metadata fields

### 3. Process & Optimize (Step 3)
- Review summary: selected images count, keywords count, base name
- Click **"Optimize Images"** to rename files and inject metadata
- Keywords are injected into EXIF metadata fields automatically for both selected and unselected images

### 4. Download Results (Step 4)
- See results summary (renamed files, injected metadata, any errors)
- Click **"Download Optimized Images (.zip)"** — each download gets a unique filename (`aamir-{count}images-{random}.zip`)
- Click **"Start Over"** for a new batch

### 5. Verify the Result
- Right-click any optimized image → **Properties** → **Details** tab
- You'll see your keywords in: Title, Subject, Tags, Comments
- Or use the built-in **"Check Metadata"** tool in the navbar to inspect any image
- Etsy reads these metadata fields for search ranking

### Image Scraper (Standalone Tool)
- Click **"Image Scraper"** in the navbar
- Paste any public website URL and click **"Scrape Images"**
- The tool extracts all images from the page (`<img>`, `<picture>`, CSS backgrounds, OpenGraph)
- Select/deselect individual images or use **Select All / Deselect All**
- Click **"Download X Images (.zip)"** to download selected images as a ZIP
- Supports Cloudflare-protected sites via automatic bypass (cloudscraper fallback)

### Image Converter (Standalone Tool)
- Click **"Converter"** in the navbar
- Drag & drop or browse to upload multiple images in any format:
  - **Supported input formats:** JPG, JPEG, PNG, BMP, TIFF, GIF, WEBP, AVIF, SVG, ICO, HEIC, HEIF
- Each uploaded image shows a thumbnail preview with a color-coded format badge and file size
- Remove individual images with the X button, or use **"Clear All"** to start over
- Choose your target format by clicking one of the 3 format cards:
  - **JPG** — Best for photos & web images
  - **PNG** — Supports transparency
  - **JPEG** — Same as JPG, full extension
- Click **"Convert X Images to FORMAT"** to start conversion
- Animated spinner shows progress during conversion
- Once complete, click **"Download Converted Images (.zip)"** to get all converted images as a ZIP
- Click **"Convert More"** to reset and convert another batch
- Handles RGBA/transparent images gracefully — converts to white background for JPG/JPEG output
- Up to 50 images, 20 MB each

---

## Running with Docker

```bash
docker-compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:5173

```bash
docker-compose down
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload-images` | Upload image files |
| POST | `/api/upload-keyword-file` | Upload .txt keyword file |
| POST | `/api/upload-keywords-text` | Submit keywords as text |
| GET | `/api/rename-preview` | Preview renamed filenames |
| POST | `/api/rename-images` | Execute bulk rename |
| POST | `/api/inject-keywords` | Inject keywords into metadata (with per-field SEO settings) |
| GET | `/api/download-results` | Download processed images as ZIP |
| POST | `/api/check-metadata` | Upload an image and get all its metadata (EXIF, XP tags, GPS, PNG chunks) |
| POST | `/api/scrape-images` | Extract all image URLs from a website (with Cloudflare bypass) |
| POST | `/api/download-scraped` | Download selected scraped images as a ZIP file |
| POST | `/api/convert-images` | Convert uploaded images to a target format (jpg/jpeg/png) and download as ZIP |
| GET | `/api/health` | Health check |

Full interactive API docs: http://localhost:8000/docs

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `127.0.0.1` | Server host |
| `PORT` | `8000` | Server port |
| `LOG_LEVEL` | `info` | Logging level |
| `MAX_FILE_SIZE_MB` | `10` | Max upload file size in MB |
| `MAX_FILES_PER_UPLOAD` | `50` | Max files per upload |
| `SESSION_EXPIRY_MINUTES` | `60` | Session cleanup time |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000/api` | Backend API URL |

---

## Troubleshooting

### "Port 8000 already in use"

```bash
# Windows
netstat -ano | findstr :8000
taskkill /F /PID <PID_NUMBER>

# Mac/Linux
lsof -i :8000
kill -9 <PID>
```

### "Module not found" errors (backend)

```bash
cd backend
pip install -r requirements.txt
```

### "npm ERR!" errors (frontend)

```bash
cd frontend
rm -rf node_modules
npm install
```

---

## Author

**Aamir El Amiri** — aamirelamiri3@gmail.com

- GitHub: [github.com/ISTIFANO](https://github.com/ISTIFANO)
- Instagram: [instagram.com/aamir_el_amiri](https://www.instagram.com/aamir_el_amiri/)
- Discord: `aamirelamiri202`

---

## License

This project is proprietary software by **Aamir El Amiri**.
