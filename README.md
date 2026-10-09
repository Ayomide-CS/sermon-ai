# Sermon AI 🎙️

Sermon AI is a Next.js application that turns YouTube sermons into structured Bible study notes. It uses a **fully deterministic transcription pipeline** — no third-party API keys or vendor lock-in required.

## Features

- **Deterministic YouTube Transcription** — Scrapes transcripts directly from YouTube pages using `youtube-transcript-plus`. No API keys, no paid services.
- **Local Whisper.cpp Fallback** — When a video has no YouTube transcript (disabled by uploader), the app falls back to local speech-to-text using [whisper.cpp](https://github.com/ggerganov/whisper.cpp) on your machine.
- **Structured Note Generation** — AI-powered extraction of main points, key lessons, practical applications, prayer points, and more.
- **Dashboard & Library** — Browse sermons, manage notes, and track your study progress.

## Architecture

```
YouTube URL Input
        │
        ▼
┌──────────────────────────────┐
│ 1. youtube-transcript-plus    │  ← Scrapes YouTube page directly
│    (deterministic, no vendor) │     No API keys needed!
└──────────────┬───────────────┘
               │ AVAILABLE? ────YES──→ Return transcript
               │ NO / DISABLED
               ▼
┌──────────────────────────────┐
│ 2. whisper.cpp (local)        │  ← Runs on your Linux machine
│    a) yt-dlp downloads audio   │     Uses ggml-large-v3-turbo model
│    b) whisper-cli transcribes  │     Fully offline after setup
│    c) Clean up temp files      │
└──────────────┬───────────────┘
               │ AVAILABLE? ────YES──→ Return transcript
               │ NO / ERROR
               ▼
         Return error to user
```

## Requirements

### System Dependencies

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 22.18+ | Runtime |
| pnpm | 9+ | Package manager |
| PostgreSQL | 15+ | Database |
| yt-dlp | Latest | Audio extraction from YouTube |
| ffmpeg | 5.0+ | Audio format conversion |
| whisper.cpp | Built locally | Local speech-to-text fallback |

### Prerequisites Setup (Linux)

```bash
# Install system dependencies
sudo apt update && sudo apt install -y yt-dlp ffmpeg

# Clone and build whisper.cpp (if not already done)
git clone https://github.com/ggerganov/whisper.cpp.git ~/whisper.cpp
cd ~/whisper.cpp
git checkout v1.7.2  # or latest stable
cmake -B build
cmake --build build --config Release -j$(nproc)

# Download a model (large-v3-turbo recommended for accuracy/speed balance)
./models/download-ggml-model.sh large-v3-turbo
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd sermon-ai
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   
   Copy `.env` and update with your values:
   ```bash
   cp .env.example .env  # if you have an example file
   # Or edit .env directly (it's gitignored)
   ```

   Required `.env` configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/sermon_ai"

   # Whisper.cpp paths (adjust if installed elsewhere)
   WHISPER_CPP_ROOT="/home/angelis/whisper.cpp"
   WHISPER_MODEL_PATH="${WHISPER_CPP_ROOT}/models/ggml-large-v3-turbo-q5_0.bin"
   WHISPER_CLI_PATH="${WHISPER_CPP_ROOT}/build/bin/whisper-cli"

   # Audio staging directory (gitignored)
   AUDIO_TMP_DIR="tmp/audio"
   ```

4. **Set up the database**
   
   Prisma 8 uses a contract-based approach:
   ```bash
   # Emit TypeScript types from the Prisma contract
   npx prisma contract emit

   # Preview and apply migrations
   npx prisma db init --dry-run  # review changes first
   npx prisma db init            # apply to database
   ```

## Running the App

### Development Mode

```bash
pnpm dev
```

The app will start at `http://localhost:3000`.

### Production Build

```bash
# Build for production
pnpm build

# Start the production server
pnpm start
```

## Project Structure

```
sermon-ai/
├── app/
│   ├── api/sermons/route.ts    # Sermon ingestion API (transcription pipeline)
│   ├── components/              # React components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── SermonNote/          # Structured note components
│   ├── lib/
│   │   ├── transcript.ts        # YouTube transcript fetching (deterministic)
│   │   ├── whisper.ts           # Local whisper.cpp transcription
│   │   ├── youtube.ts           # YouTube metadata extraction
│   │   └── ai.ts                # AI note generation utilities
│   ├── dashboard/               # User dashboard pages
│   ├── sermons/page.tsx         # Sermon library
│   └── page.tsx                 # Home page with ingest form
├── src/prisma/
│   ├── contract.prisma          # Prisma 8 database contract
│   ├── db.ts                    # Database client setup
│   └── contract.d.ts            # Generated types (commit after changes)
├── .env                         # Environment variables (gitignored)
├── tmp/                         # Audio staging directory (gitignored)
└── package.json
```

## API Endpoints

### POST `/api/sermons`

Ingests a YouTube sermon URL and returns structured data.

**Request:**
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response (Success):**
```json
{
  "message": "Sermon ready for analysis.",
  "metadata": {
    "videoId": "...",
    "title": "Sermon Title",
    "speaker": "Speaker Name",
    "thumbnail": "...",
    "duration": "45:30"
  },
  "transcript": {
    "text": "Full transcript text...",
    "segments": [...]
  },
  "transcriptionMethod": "DETERMINISTIC"  // or "LOCAL_WHISPER"
}
```

**Response (Transcript Disabled + Whisper Fallback):**
```json
{
  "message": "Sermon ready for analysis.",
  "metadata": { ... },
  "transcript": { "text": "...", "segments": [...] },
  "transcriptionMethod": "LOCAL_WHISPER"
}
```

**Error Responses:**
- `422 TRANSCRIPT_NOT_AVAILABLE` — No transcript from YouTube or whisper.cpp
- `422 TRANSCRIPT_DISABLED` — Transcripts disabled by uploader (and whisper failed)
- `502 TRANSCRIPTION_FAILED` — Whisper.cpp error (missing CLI, model, or processing failure)

## Transcription Pipeline Details

### Method 1: Deterministic YouTube Scraping

The app first attempts to fetch the transcript directly from YouTube's web page using [`youtube-transcript-plus`](https://github.com/mkazmierzak/youtube-transcript-plus). This method:
- Requires **no API keys** or authentication
- Works for videos with captions enabled by the uploader
- Is fully deterministic (same input → same output)

### Method 2: Local Whisper.cpp Fallback

If YouTube has no transcript available, the app falls back to local speech-to-text:

1. **Audio Extraction**: `yt-dlp` downloads the best audio stream from YouTube
2. **Transcription**: `whisper-cli` processes the audio using a GGML model (e.g., `ggml-large-v3-turbo-q5_0.bin`)
3. **Cleanup**: Temporary files are automatically removed after processing

**Performance Notes:**
- First transcription loads the model into memory (~2-4 GB for large models)
- Subsequent transcriptions benefit from model caching
- Processing time: ~1-2x real-time on modern CPUs (faster with GPU support)

## Future Enhancements

### Cloud Deployment

The whisper.cpp fallback is designed to be cloud-ready:

1. **Containerization**: Package whisper.cpp in a Docker image with the model baked in
2. **Horizontal Scaling**: Each container handles one transcription at a time; scale horizontally for concurrency
3. **Job Queue**: Integrate BullMQ or similar to queue transcriptions and return results asynchronously
4. **GPU Support**: Use NVIDIA CUDA builds of whisper.cpp for faster processing

Example Dockerfile:
```dockerfile
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y ffmpeg
COPY whisper.cpp/build/bin/whisper-cli /usr/local/bin/
COPY models/ggml-large-v3-turbo.bin /models/
CMD ["whisper-cli", "-m", "/models/ggml-large-v3-turbo.bin", "-f", "audio.wav"]
```

### Additional Features

- Multi-language support (whisper.cpp handles 99+ languages)
- Speaker diarization (identify different speakers in a sermon)
- Timestamped segments for navigation
- Export to PDF, Markdown, or SRT subtitle format

## Troubleshooting

### "Transcript unavailable" when captions exist

This can happen if:
1. The video uses auto-generated captions that aren't accessible via the API
2. YouTube's page structure changed (library may need updates)
3. Network issues preventing access to YouTube pages

**Solution**: Ensure whisper.cpp is properly installed and configured as a fallback.

### Whisper.cpp errors

| Error | Cause | Solution |
|-------|-------|----------|
| `CLI not found` | `WHISPER_CLI_PATH` incorrect or build missing | Verify path in `.env`, rebuild with `cmake --build build` |
| `Model not found` | Model file doesn't exist at specified path | Download model: `./models/download-ggml-model.sh large-v3-turbo` |
| Timeout after 10 min | Very long video or slow CPU | Check system resources, consider smaller model (e.g., `medium.en`) |

### yt-dlp fails to download audio

- Ensure you have the latest version: `pip install -U yt-dlp`
- Some videos may be region-restricted or unavailable
- Check ffmpeg is installed and in PATH

## License

[Add your license here]

## Contributing

Contributions welcome! Please open an issue or submit a pull request.
