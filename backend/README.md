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
dart run bin/server.dart
```

Environment variables:
- `PORT` (optional, default `8081`)

Frontend production builds must set `REACT_APP_API_URL` to the deployed backend URL.
For example:

```bash
cd ../frontend
REACT_APP_API_URL=https://your-backend.example.com npm run build
```

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
  -d '{"colors":["W","W","W","W","W","W","W","W","W","O","O","O","O","O","O","O","O","O","B","B","B","B","B","B","B","B","B","Y","Y","Y","Y","Y","Y","Y","Y","Y","R","R","R","R","R","R","R","R","R","G","G","G","G","G","G","G","G","G"],"mode":"beginner"}'
```

## Smoke test
Use this after every backend restart or deploy. It sends a valid unsolved cube and should return a successful one-move solution.

```bash
curl -s -X POST http://localhost:8081/api/solve \
  -H "Content-Type: application/json" \
  -d '{"colors":["W","W","W","W","W","W","W","W","W","G","G","G","O","O","O","O","O","O","O","O","O","B","B","B","B","B","B","Y","Y","Y","Y","Y","Y","Y","Y","Y","B","B","B","R","R","R","R","R","R","R","R","R","G","G","G","G","G","G"],"mode":"beginner"}'
```

## Notes
- Python solver script: `backend/solver.py`
- The server resolves `solver.py` robustly and logs the path probes on first call to `/api/solve`.
- Docker and local production-style runs use `bin/server.dart`.
- The frontend must be built with the deployed backend URL; localhost only works for local development.
- In production, restrict CORS and reduce logging.

## Troubleshooting
- Port in use: `lsof -ti:8081 | xargs kill -9`
- Python not found: ensure `python3` is installed and `kociemba` is available.
- Path issues: restart the backend after code changes and confirm the smoke test above returns `"success":true`.
