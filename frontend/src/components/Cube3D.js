import React, { Suspense, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ArcballControls } from '@react-three/drei';
import * as THREE from 'three';
import LoadingSpinner from './LoadingSpinner';

// Real-life Rubik's Cube colors
const colorMap = {
  W: '#FFFFFF', // Up
  Y: '#FFD500', // Down
  R: '#C41E3A', // Left (Red)
  O: '#FF5800', // Right (Orange)
  B: '#0051BA', // Front (Blue)
  G: '#009E60', // Back (Green)
};

const FACE = { U: 0, R: 1, F: 2, D: 3, L: 4, B: 5 };

const FACE_INDICES = {
  U: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  R: [9, 10, 11, 12, 13, 14, 15, 16, 17],
  F: [18, 19, 20, 21, 22, 23, 24, 25, 26],
  D: [27, 28, 29, 30, 31, 32, 33, 34, 35],
  L: [36, 37, 38, 39, 40, 41, 42, 43, 44],
  B: [45, 46, 47, 48, 49, 50, 51, 52, 53],
};

const PERMUTATIONS = {
  U: {
    face: [0, 1, 2, 5, 8, 7, 6, 3], // Face rotation indices (corners & edges)
    sides: [
      [18, 19, 20], // F top row
      [36, 37, 38], // L top row
      [45, 46, 47], // B top row
      [9, 10, 11],  // R top row
    ]
  },
  D: {
    face: [27, 28, 29, 32, 35, 34, 33, 30],
    sides: [
      [24, 25, 26], // F bottom row
      [15, 16, 17], // R bottom row
      [51, 52, 53], // B bottom row
      [42, 43, 44], // L bottom row
    ]
  },
  L: {
    face: [36, 37, 38, 41, 44, 43, 42, 39],
    sides: [
      [0, 3, 6],   // U left col
      [18, 21, 24], // F left col
      [27, 30, 33], // D left col
      [53, 50, 47], // B right col (inverted)
    ]
  },
  R: {
    face: [9, 10, 11, 14, 17, 16, 15, 12],
    sides: [
      [8, 5, 2],   // U right col (inverted order for cycle)
      [45, 48, 51], // B left col
      [35, 32, 29], // D right col (inverted)
      [26, 23, 20], // F right col (inverted)
    ]
  },
  F: {
    face: [18, 19, 20, 23, 26, 25, 24, 21],
    sides: [
      [6, 7, 8],   // U bottom row
      [9, 12, 15], // R left col
      [29, 28, 27], // D top row (inverted)
      [44, 41, 38], // L right col (inverted)
    ]
  },
  B: {
    face: [45, 46, 47, 50, 53, 52, 51, 48],
    sides: [
      [2, 1, 0],   // U top row (inverted)
      [36, 39, 42], // L left col
      [33, 34, 35], // D bottom row
      [17, 14, 11], // R right col (inverted)
    ]
  }
};

function applyMoveFacelets(state, move) {
  if (!move) return state;
  let s = [...state];
  const faceChar = move[0];
  const prime = move.includes("'");
  const twice = move.includes("2");

  // 1 = 90deg CW, 2 = 180deg, 3 = 90deg CCW
  const count = twice ? 2 : (prime ? 3 : 1);

  if (!PERMUTATIONS[faceChar]) return s;
  const p = PERMUTATIONS[faceChar];

  for (let k = 0; k < count; k++) {
    const prev = [...s];

    // Rotate the face itself (corners cycle, edges cycle)
    // Indices: 0->2->8->6->0 (corners), 1->5->7->3->1 (edges)
    // We use a simplified mapping based on the 'face' array in definitions
    // face array is [c1, e1, c2, e2, c3, e3, c4, e4] logic roughly
    // Actual logic: 
    // Corners: 0->2, 2->8, 8->6, 6->0
    // Edges:   1->5, 5->7, 7->3, 3->1
    // We'll use absolute indices from p.face. 
    // p.face is ordered: TL, T, TR, R, BR, B, BL, L
    const f = p.face;
    s[f[2]] = prev[f[0]]; // TR <- TL
    s[f[4]] = prev[f[2]]; // BR <- TR
    s[f[6]] = prev[f[4]]; // BL <- BR
    s[f[0]] = prev[f[6]]; // TL <- BL

    s[f[3]] = prev[f[1]]; // R <- T
    s[f[5]] = prev[f[3]]; // B <- R
    s[f[7]] = prev[f[5]]; // L <- B
    s[f[1]] = prev[f[7]]; // T <- L

    // Rotate the ring of sides
    // p.sides has 4 arrays (one for each adjacent face's affected stickers)
    // Cycle: 0 -> 1 -> 2 -> 3 -> 0
    // But logic depends on standard orientation. Let's strictly follow standard cycle.
    // U move: F -> L -> B -> R -> F ? No, U (CW) moves F to L.
    // WAIT: R-handed rule thumb up. Fingers curl.
    // U (CW): F facelets move to L? No.
    // Imagine looking from top. CW.
    // Front facelets go to Left? No, Front goes to Left means F stickers become L stickers. Let's check.
    // U axis is +Y. CW rotation. X (Right) goes to -Z (Back)? 
    // Let's use standard replacement logic verified:
    // f -> s[idx] = prev[src_idx]

    const sideA = p.sides[0]; // Target 1
    const sideB = p.sides[1]; // Target 2
    const sideC = p.sides[2]; // Target 3
    const sideD = p.sides[3]; // Target 4

    // U Move: F(0) -> L(1) -> B(2) -> R(3) -> F(0) is WRONG.
    // U Move (CW): Front(top) moves to Left(top).
    // So s[L_top] = prev[F_top].
    // Let's verify PERMUTATIONS['U'].sides order.
    // sides: [F_row, L_row, B_row, R_row]
    // s[L] = p[F] -> s[sideB] = prev[sideA] ?
    // Let's standard cycle: A->B->C->D->A
    // s[sideB] = prev[sideA]
    // s[sideC] = prev[sideB]
    // s[sideD] = prev[sideC]
    // s[sideA] = prev[sideD]

    // Let's re-verify specific moves logic.
    // U move: F -> L -> B -> R -> F
    // s[L] = F  => s[36,37,38] = prev[18,19,20] which is s[sideB] = prev[sideA]
    // s[B] = L  => s[45,46,47] = prev[36,37,38] which is s[sideC] = prev[sideB]
    // s[R] = B  => s[9,10,11]  = prev[45,46,47] which is s[sideD] = prev[sideC]
    // s[F] = R  => s[18,19,20] = prev[9,10,11]  which is s[sideA] = prev[sideD]

    // Apply this Cycle A->B->C->D->A
    // Careful with loop.
    for (let i = 0; i < 3; i++) {
      s[sideB[i]] = prev[sideA[i]];
      s[sideC[i]] = prev[sideB[i]];
      s[sideD[i]] = prev[sideC[i]];
      s[sideA[i]] = prev[sideD[i]];
    }
  }
  return s;
}

function getCubieFaceMapping(x, y, z) {
  const faces = [];
  if (y === 1) { const row = z + 1; const col = x + 1; faces.push({ faceIndex: FACE.U, faceletIndex: row * 3 + col }); }
  if (y === -1) { const row = 1 - z; const col = x + 1; faces.push({ faceIndex: FACE.D, faceletIndex: row * 3 + col }); }
  if (z === 1) { const row = 1 - y; const col = x + 1; faces.push({ faceIndex: FACE.F, faceletIndex: row * 3 + col }); }
  if (z === -1) { const row = 1 - y; const col = 1 - x; faces.push({ faceIndex: FACE.B, faceletIndex: row * 3 + col }); }
  if (x === 1) { const row = 1 - y; const col = 1 - z; faces.push({ faceIndex: FACE.R, faceletIndex: row * 3 + col }); }
  if (x === -1) { const row = 1 - y; const col = z + 1; faces.push({ faceIndex: FACE.L, faceletIndex: row * 3 + col }); }
  return faces;
}

const Sticker = ({ position, rotation, color, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={position}
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <planeGeometry args={[0.9, 0.9]} />
      <meshPhysicalMaterial
        color={colorMap[color] || '#222'}
        roughness={0.15}
        metalness={0.2}
        clearcoat={1.0}
        clearcoatRoughness={0.05}
        reflectivity={0.8}
        emissive={colorMap[color]}
        emissiveIntensity={hovered ? 0.4 : 0.05}
      />
    </mesh>
  );
};

const Cubie = React.memo(({ x, y, z, facelets, onStickerClick, lockCenters, onCenterBlocked, groupRef }) => {
  const faces = useMemo(() => getCubieFaceMapping(x, y, z), [x, y, z]);
  const stickers = faces.map((f, i) => {
    let pos; let rot = [0, 0, 0];
    const offset = 0.51;
    switch (f.faceIndex) {
      case FACE.U: pos = [0, offset, 0]; rot = [-Math.PI / 2, 0, 0]; break;
      case FACE.R: pos = [offset, 0, 0]; rot = [0, Math.PI / 2, 0]; break;
      case FACE.F: pos = [0, 0, offset]; rot = [0, 0, 0]; break;
      case FACE.D: pos = [0, -offset, 0]; rot = [Math.PI / 2, 0, 0]; break;
      case FACE.L: pos = [-offset, 0, 0]; rot = [0, -Math.PI / 2, 0]; break;
      case FACE.B: pos = [0, 0, -offset]; rot = [0, Math.PI, 0]; break;
      default: pos = [0, 0, 0];
    }
    const color = facelets[f.faceIndex * 9 + f.faceletIndex];
    const handleClick = () => {
      if (f.faceletIndex === 4 && lockCenters) { onCenterBlocked && onCenterBlocked(); return; }
      onStickerClick && onStickerClick(f.faceIndex, f.faceletIndex);
    };
    return <Sticker key={i} position={pos} rotation={rot} color={color} onClick={handleClick} />;
  });
  return (
    <group position={[x, y, z]} ref={groupRef}>
      <mesh>
        <boxGeometry args={[0.985, 0.985, 0.985]} />
        <meshStandardMaterial
          color="#000000"
          roughness={0.05}
          metalness={0.8}
        />
      </mesh>
      {stickers}
    </group>
  );
});

function getMoveParams(move) {
  if (!move) return null;
  const face = move[0];
  const prime = move.includes("'");
  const twice = move.includes('2');
  const angle = twice ? Math.PI : Math.PI / 2;
  const axis = new THREE.Vector3();
  let layer = 0; let normalSign = 1;
  switch (face) {
    case 'U': axis.set(0, 1, 0); layer = 1; normalSign = 1; break;
    case 'D': axis.set(0, -1, 0); layer = -1; normalSign = -1; break;
    case 'R': axis.set(1, 0, 0); layer = 1; normalSign = 1; break;
    case 'L': axis.set(-1, 0, 0); layer = -1; normalSign = -1; break;
    case 'F': axis.set(0, 0, 1); layer = 1; normalSign = 1; break;
    case 'B': axis.set(0, 0, -1); layer = -1; normalSign = -1; break;
    default: return null;
  }
  return { axis, layer, clockwise: !prime, angle, normalSign };
}

const RubiksCube = ({ facelets, onStickerClick, animateMove, onCommit, durationMs, lockCenters, onCenterBlocked }) => {
  const cubieRefs = useRef([]);
  const animationData = useRef({ progress: 0, activeMove: null, completed: false, committed: false });

  const allPos = useMemo(() => {
    const arr = [];
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++)
          if (!(x === 0 && y === 0 && z === 0)) arr.push({ x, y, z });
    return arr;
  }, []);

  // When facelets change, we reset the visual rotation.
  // This must be synchronous to prevent flashing old colors in rotated positions.
  React.useLayoutEffect(() => {
    allPos.forEach((pos, i) => {
      const ref = cubieRefs.current[i];
      if (ref) {
        ref.position.set(pos.x, pos.y, pos.z);
        ref.quaternion.set(0, 0, 0, 1);
      }
    });
    // Reset animation flags for the next move
    animationData.current.completed = false;
    animationData.current.committed = false;
    animationData.current.progress = 0;
    animationData.current.activeMove = null;
  }, [facelets, allPos]);

  useEffect(() => {
    if (animateMove && animateMove !== animationData.current.activeMove) {
      animationData.current = {
        progress: 0,
        activeMove: animateMove,
        completed: false,
        committed: false
      };
    }
  }, [animateMove]);

  useFrame((state, delta) => {
    const move = animationData.current.activeMove;
    if (!move || animationData.current.completed) return;

    const params = getMoveParams(move);
    if (!params) return;

    // Use a fixed minimum duration to prevent division by zero or teleporting
    const durationSeconds = Math.max(durationMs, 50) / 1000;
    const angularSpeed = params.angle / durationSeconds;

    animationData.current.progress += angularSpeed * delta;

    let progress = animationData.current.progress;
    if (progress >= params.angle) {
      progress = params.angle;
      animationData.current.completed = true;
    }

    // Standard notation: CW is -90deg about face normal (RHR)
    const rotationDir = params.clockwise ? -1 : 1;

    allPos.forEach((pos, i) => {
      const ref = cubieRefs.current[i];
      if (!ref) return;

      const isAffected = (params.axis.x !== 0 && Math.round(pos.x) === params.layer) ||
        (params.axis.y !== 0 && Math.round(pos.y) === params.layer) ||
        (params.axis.z !== 0 && Math.round(pos.z) === params.layer);

      if (isAffected) {
        const q = new THREE.Quaternion().setFromAxisAngle(params.axis, rotationDir * progress);
        const p = new THREE.Vector3(pos.x, pos.y, pos.z).applyQuaternion(q);
        ref.position.copy(p);
        ref.quaternion.setFromAxisAngle(params.axis, rotationDir * progress);
      }
    });

    if (animationData.current.completed && !animationData.current.committed) {
      animationData.current.committed = true;
      // We wrap this in a microtask to ensure the final frame is rendered before state changes
      // This prevents the "jump" where color changes before the rotation hits 90 degrees.
      setTimeout(onCommit, 0);
    }
  });

  return (
    <group>
      {allPos.map((pos, i) => (
        <Cubie
          key={`${pos.x}-${pos.y}-${pos.z}`}
          x={pos.x} y={pos.y} z={pos.z}
          facelets={facelets}
          onStickerClick={onStickerClick}
          lockCenters={lockCenters}
          onCenterBlocked={onCenterBlocked}
          groupRef={(v) => (cubieRefs.current[i] = v)}
        />
      ))}
    </group>
  );
};


const Cube3D = ({ cubeState, onStickerClick, animateMove, onMoveDone, durationMs = 800, lockCenters = false, autoRotate = false }) => {
  const [internalFacelets, setInternalFacelets] = useState(cubeState);
  const [lastExternalState, setLastExternalState] = useState(cubeState);

  useEffect(() => {
    if (cubeState !== lastExternalState) {
      setInternalFacelets(cubeState);
      setLastExternalState(cubeState);
    }
  }, [cubeState, lastExternalState]);

  const handleCommit = useCallback(() => {
    if (animateMove) {
      const next = applyMoveFacelets(internalFacelets, animateMove);
      setInternalFacelets(next); // Update internal state!
      onMoveDone && onMoveDone(next);
    }
  }, [animateMove, internalFacelets, onMoveDone]);

  return (
    <div className="w-full h-full min-h-[350px] flex items-center justify-center">
      <Suspense fallback={<LoadingSpinner size="md" text=" " />}>
        <Canvas
          camera={{ position: [6, 6, 6], fov: 40 }} // Adjusted camera to fit cube better
          gl={{
            powerPreference: 'high-performance',
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true, // Helps with some flickering
          }}
          dpr={[1, 2]} // Quality scaling
          style={{ background: 'transparent' }}
        >
          {/* Enhanced Lighting for Highlights/Reflections */}
          <ambientLight intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
          <pointLight position={[-10, 10, 10]} intensity={1.5} color="#4f46e5" />
          <pointLight position={[10, -10, -10]} intensity={1.5} color="#3b82f6" />
          <spotLight
            position={[0, 15, 0]}
            intensity={1.0}
            penumbra={1}
            angle={Math.PI / 4}
            color="#ffffff"
            castShadow
          />

          <RubiksCube
            facelets={internalFacelets}
            onStickerClick={onStickerClick}
            animateMove={animateMove}
            onCommit={handleCommit}
            durationMs={durationMs}
            lockCenters={lockCenters}
          />

          <ArcballControls
            enablePan={false}
            enableZoom={false}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={1.0}
            dampingFactor={0.05}
            rotateSpeed={0.8}
            enableDamping={true}
            makeDefault
          />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Cube3D;
