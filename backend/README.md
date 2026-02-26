# Rubik's Cube Solver Backend

Dart backend with Python Kociemba solver integration.

## Requirements
- Dart SDK (>=3)
- Python 3
- Python packages:
  - Install with: `pip3 install -r requirements.txt`

## Run locally
```bash
cd backend
# Install Dart deps
dart pub get
# Install Python deps
pip3 install -r requirements.txt
# Start server (defaults to port 8081)
dart run lib/main.dart
```

Environment variables:
- `PORT` (optional, default `8081`)

## Endpoints
- `GET /` basic info
- `GET /api/health` health check
- `POST /api/solve` body: `{ "colors": [54 letters among 6 distinct] }`
- `POST /api/upload-image` stub (returns mock data)
- `GET /api/history` mock history

## Example request
```bash
curl -s -X POST http://localhost:8081/api/solve \
  -H "Content-Type: application/json" \
  -d '{"colors":["W","W","W","W","W","W","W","W","W","R","R","R","R","R","R","R","R","R","B","B","B","B","B","B","B","B","B","Y","Y","Y","Y","Y","Y","Y","Y","Y","O","O","O","O","O","O","O","O","O","G","G","G","G","G","G","G","G","G"]}'
```

## Notes
- Python solver script: `backend/solver.py`
- The server resolves `solver.py` robustly and logs the path probes on first call to `/api/solve`.
- In production, restrict CORS and reduce logging.

## Troubleshooting
- Port in use: `lsof -ti:8081 | xargs kill -9`
- Python not found: ensure `python3` is installed and `kociemba` is available.
- Path issues: start the server from `backend` directory.
