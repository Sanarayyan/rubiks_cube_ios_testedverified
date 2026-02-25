# Rubik's Cube Solver

A modern Rubik's Cube solver with **React frontend** and **Flutter backend**, featuring 3D visualization and advanced solving algorithms.

## 🚀 Features

- **3D Cube Visualization**: Interactive 3D cube using Three.js
- **Image Upload**: Upload photos of your cube for automatic color detection
- **Manual Input**: Set colors manually with an intuitive interface
- **Step-by-Step Solutions**: Clear instructions for each move
- **Mobile Responsive**: Works perfectly on all devices
- **Modern UI**: Beautiful, intuitive interface with Tailwind CSS

## 🏗️ Architecture

- **Frontend**: React with Three.js for 3D visualization
- **Backend**: Flutter server with Dart
- **API**: RESTful API for cube solving operations
- **Styling**: Tailwind CSS for modern design

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Flutter** (v3.0 or higher)
- **Dart** (v3.0 or higher)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rubiks_cube_solver
```

### 2. Setup Flutter Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
flutter pub get

# Run the backend server
flutter run lib/main.dart
```

The backend will start on `http://localhost:8081`

### 3. Setup React Frontend

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will start on `http://localhost:3000`

### 4. Verify Setup

1. **Backend Health Check**: Visit `http://localhost:8081/api/health`
2. **Frontend**: Visit `http://localhost:3000`
3. **API Documentation**: Visit `http://localhost:8081/`

## 🎯 Usage

### Upload Image
1. Navigate to "Upload Image" page
2. Take a photo of your cube
3. Upload the image
4. View the solution with 3D visualization

### Manual Input
1. Navigate to "Manual Input" page
2. Set colors for each face using the 3D interface
3. Submit to get the solution

### View History
1. Navigate to "History" page
2. Browse previously solved cubes
3. Replay solutions

## 🔧 API Endpoints

### Backend API (Flutter)

- `GET /` - API information
- `GET /api/health` - Health check
- `POST /api/solve` - Solve cube from color data
- `POST /api/upload-image` - Process uploaded image
- `GET /api/history` - Get solving history

### Request Format

```json
{
  "colors": ["W", "W", "W", ...] // 54 colors
}
```

### Response Format

```json
{
  "success": true,
  "solution": {
    "moves": [
      {
        "notation": "R",
        "description": "Rotate right face clockwise"
      }
    ],
    "totalMoves": 20,
    "estimatedTime": 40,
    "difficulty": "Beginner",
    "solvingMethod": "Layer by Layer"
  }
}
```

## 🏗️ Project Structure

```
rubiks_cube_solver/
├── backend/                 # Flutter backend
│   ├── lib/
│   │   ├── main.dart       # Server entry point
│   │   ├── models/         # Data models
│   │   └── services/       # Business logic
│   └── pubspec.yaml        # Dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.js          # Main app
│   └── package.json        # Dependencies
└── README.md
```

## 🧪 Development

### Backend Development

```bash
cd backend
flutter pub get
flutter run lib/main.dart
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

### Testing

```bash
# Backend tests
cd backend
flutter test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment

```bash
cd backend
flutter build web
# Deploy the build/web directory
```

### Frontend Deployment

```bash
cd frontend
npm run build
# Deploy the build directory
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify both backend and frontend are running
3. Check the API health endpoint
4. Open an issue with detailed information

## 🔮 Future Enhancements

- [ ] Real image processing with computer vision
- [ ] Advanced solving algorithms (Kociemba, etc.)
- [ ] User accounts and solution history
- [ ] Mobile app version
- [ ] Voice commands for solving
- [ ] Multi-language support

