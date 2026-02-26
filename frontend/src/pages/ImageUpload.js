import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, Play, AlertCircle, Image as ImageIcon, Palette, ArrowLeft } from 'lucide-react';
import { cubeAPI, validateCentersAndCounts, generateSolvedCube } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import CubeNet2D from '../components/CubeNet2D';

const faceLabels = [
  { key: 'U', name: 'Up (White)' },
  { key: 'R', name: 'Right (Orange)' },
  { key: 'F', name: 'Front (Blue)' },
  { key: 'D', name: 'Down (Yellow)' },
  { key: 'L', name: 'Left (Red)' },
  { key: 'B', name: 'Back (Green)' },
];

const colorOptions = [
  { code: 'W', name: 'White', hex: '#FFFFFF' },
  { code: 'Y', name: 'Yellow', hex: '#FFD500' },
  { code: 'O', name: 'Orange', hex: '#FF5800' },
  { code: 'R', name: 'Red', hex: '#C41E3A' },
  { code: 'B', name: 'Blue', hex: '#0051BA' },
  { code: 'G', name: 'Green', hex: '#009E60' },
];

const ImageUpload = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Mode toggle: six faces vs single 2D net image
  const [uploadMode, setUploadMode] = useState('faces'); // 'faces' | 'net2d'

  // Six-face upload state
  const [files, setFiles] = useState({ U: null, R: null, F: null, D: null, L: null, B: null });

  // 2D net image state
  const [netImage, setNetImage] = useState(null);
  const netImageURL = useMemo(() => (netImage ? URL.createObjectURL(netImage) : null), [netImage]);
  const [paintColors, setPaintColors] = useState(generateSolvedCube());
  const [selectedColor, setSelectedColor] = useState('W');

  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState(null);
  const [error, setError] = useState('');
  const [detectedColors, setDetectedColors] = useState(null);

  const handleFaceSelect = (faceKey, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select valid image files');
      return;
    }
    setFiles(prev => ({ ...prev, [faceKey]: file }));
    setError('');
  };

  const handleNetImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image');
      return;
    }
    setNetImage(file);
    setError('');
  };

  const allFacesSelected = () => faceLabels.every(f => files[f.key] instanceof File);

  const handleProcessFaces = async () => {
    if (!allFacesSelected()) {
      setError('Please select images for all 6 faces (U, R, F, D, L, B).');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await cubeAPI.uploadImage(files);
      if (result.success) {
        const colors = result.colors || Array(54).fill('W');
        console.log('Detected facelets (6 faces):', colors);
        setDetectedColors(colors);
        const centersOk = validateCentersAndCounts(colors);
        if (!centersOk.ok) {
          setError(`Invalid cube: ${centersOk.error}`);
          showError(`Invalid cube: ${centersOk.error}`);
          setIsLoading(false);
          return;
        }
        const solveResult = await cubeAPI.solveCube(colors, 'fast');
        if (solveResult.success) {
          setSolution(solveResult.solution);
          showSuccess('Images processed and cube solved successfully!');
        } else {
          setError('Failed to solve cube: ' + (solveResult.error || 'Unknown error'));
          showError('Failed to solve cube: ' + (solveResult.error || 'Unknown error'));
        }
      } else {
        setError('Failed to process images: ' + (result.error || 'Unknown error'));
        showError('Failed to process images: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Process error:', error);
      setError('Error processing images: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessNet2D = async () => {
    // Use the painted grid as detected colors
    const colors = paintColors;
    console.log('Detected facelets (2D net):', colors);
    setDetectedColors(colors);

    const centersOk = validateCentersAndCounts(colors);
    if (!centersOk.ok) {
      setError(`Invalid cube: ${centersOk.error}`);
      showError(`Invalid cube: ${centersOk.error}`);
      return;
    }
    setIsLoading(true);
    try {
      const solveResult = await cubeAPI.solveCube(colors, 'fast');
      if (solveResult.success) {
        setSolution(solveResult.solution);
        showSuccess('Net colors accepted and cube solved successfully!');
      } else {
        setError('Failed to solve cube: ' + (solveResult.error || 'Unknown error'));
        showError('Failed to solve cube: ' + (solveResult.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Solve error:', error);
      setError('Error solving cube: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaintCell = (faceIndex, cellIndex) => {
    const next = [...paintColors];
    next[faceIndex * 9 + cellIndex] = selectedColor;
    setPaintColors(next);
  };

  const viewSolution = () => {
    if (solution) {
      navigate(`/solution/${Date.now()}`, { state: { solution, cubeState: detectedColors || paintColors } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Arrow Button - Mobile Style */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 border border-gray-200 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Upload Cube Images</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">Choose a method to provide your cube state</p>
        </div>

        {/* Mode toggle */}
        <div className="mb-6 flex items-center gap-4 sm:gap-6 justify-center">
          <label className="flex items-center gap-2">
            <input type="radio" name="mode" value="faces" checked={uploadMode==='faces'} onChange={()=>setUploadMode('faces')} />
            <span>Six Face Photos</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="mode" value="net2d" checked={uploadMode==='net2d'} onChange={()=>setUploadMode('net2d')} />
            <span>Single 2D Net Image</span>
          </label>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left panel */}
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{uploadMode==='faces' ? 'Upload 6 Faces' : 'Upload 2D Net Image'}</h2>

            {uploadMode==='faces' ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {faceLabels.map(face => (
                    <label key={face.key} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 active:border-blue-500 transition-colors cursor-pointer">
                      <input type="file" accept="image/*" onChange={(e)=>handleFaceSelect(face.key, e.target.files[0])} className="hidden" />
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-sm font-semibold text-gray-800">{face.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[140px]">{files[face.key] ? files[face.key].name : 'Choose image'}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-4 bg-blue-50 rounded-lg p-3 sm:p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📸 Tips:</h3>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Ensure good lighting and flat colors (avoid glare).</li>
                    <li>• Keep each face centered and oriented consistently.</li>
                    <li>• Upload all six faces: U, R, F, D, L, B.</li>
                  </ul>
                </div>
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-800 text-sm">{error}</span>
                  </div>
                )}
                <button onClick={handleProcessFaces} disabled={!allFacesSelected() || isLoading} className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.99]">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload className="w-5 h-5" />}
                  {isLoading ? 'Processing...' : 'Process Images'}
                </button>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 active:border-blue-500 transition-colors cursor-pointer block">
                    <input type="file" accept="image/*" onChange={(e)=>handleNetImageSelect(e.target.files[0])} className="hidden" />
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{netImage ? netImage.name : 'Choose 2D net image'}</div>
                    </div>
                  </label>
                  {netImageURL && (
                    <div className="rounded-lg overflow-hidden bg-gray-100">
                      <img src={netImageURL} alt="2D Net" className="w-full object-contain max-h-56 sm:max-h-64" />
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2 text-gray-800"><Palette className="w-4 h-4" /> Pick color and click squares</div>
                    <div className="flex gap-2 flex-wrap">
                      {colorOptions.map(c => (
                        <button key={c.code} onClick={()=>setSelectedColor(c.code)} className={`w-8 h-8 rounded border ${selectedColor===c.code ? 'ring-2 ring-blue-500' : ''}`} style={{ background: c.hex, borderColor: '#000' }} title={c.name} />
                      ))}
                    </div>
                  </div>
                  <div className="w-full aspect-[12/9] rounded-lg overflow-hidden bg-gray-200">
                    <CubeNet2D cubeState={paintColors} onCellClick={handlePaintCell} lockCenters={false} />
                  </div>
                </div>
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-800 text-sm">{error}</span>
                  </div>
                )}
                <button onClick={handleProcessNet2D} disabled={isLoading} className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.99]">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload className="w-5 h-5" />}
                  {isLoading ? 'Processing...' : 'Use Net Colors'}
                </button>
              </>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Results</h2>

            {/* 2D Preview */}
            {(detectedColors || (uploadMode==='net2d' && paintColors)) && (
              <div className="mb-4 sm:mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Detected Colors Preview</h4>
                <div className="w-full aspect-[12/9] rounded-lg overflow-hidden bg-gray-200">
                  <CubeNet2D cubeState={detectedColors || paintColors} onCellClick={null} />
                </div>
              </div>
            )}

            {solution ? (
              <div>
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Solution Found!</h3>
                  <p className="text-green-700">{solution.moves.length} moves • Estimated time: {solution.estimatedTime} seconds</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Moves:</h4>
                  <div className="flex flex-wrap gap-2">
                    {solution.moves.map((move, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium" title={move.description}>
                        {index + 1}. {move.notation}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={viewSolution} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors active:scale-[0.99]">
                  <Play className="w-4 h-4" />
                  View 3D Solution
                </button>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <p>{uploadMode==='faces' ? 'Upload six face images to get started' : 'Upload your 2D net image, paint colors, then use net colors'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload; 