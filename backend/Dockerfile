# Stage 1: Build the Dart backend
FROM dart:stable AS build
WORKDIR /app

# Copy pubspec and resolve dependencies
COPY pubspec.yaml ./
RUN dart pub get

# Copy source code and compile
COPY . .
RUN dart compile exe bin/server.dart -o bin/server

# Stage 2: Runtime image with Python and the compiled Dart binary
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies + Build tools for Python C-extensions (needed for kociemba)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    gcc \
    python3-dev \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python solver dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the compiled Dart binary from the build stage
COPY --from=build /app/bin/server ./server
# Copy the Python solver script
COPY solver.py ./solver.py

# Ensure the binary is executable
RUN chmod +x ./server

ENV PORT=8081
EXPOSE 8081

# Start the server
CMD ["./server"]
