import React from 'react';

const colorHex = {
  W: '#FFFFFF',
  Y: '#FFD500',
  O: '#FF5800',
  R: '#C41E3A',
  B: '#0051BA',
  G: '#009E60',
};

// Premium Sticker Component - Optimized for visibility & One-View
const StickerTile = ({ color, onClick, isCenter, lockCenters, onCenterBlocked }) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (lockCenters && isCenter) {
          onCenterBlocked && onCenterBlocked();
          return;
        }
        onClick && onClick();
      }}
      className={`
        relative w-[18px] h-[18px] rounded-[3px] 
        transition-all duration-300 active:scale-90 select-none
        ${lockCenters && isCenter ? 'cursor-default' : 'cursor-pointer hover:brightness-110'}
        shadow-[0_1px_2px_rgba(0,0,0,0.4),_inset_0_1px_1px_rgba(255,255,255,0.4)]
      `}
      style={{ backgroundColor: colorHex[color] || '#1E293B', flexShrink: 0 }}
    >
      <div className="absolute inset-[1px] rounded-[2px] border-t border-white/20 pointer-events-none" />
      {lockCenters && isCenter && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[3px] h-[3px] rounded-full bg-black/20 backdrop-blur-sm border border-white/10 shadow-inner" />
        </div>
      )}
    </div>
  );
};

// Individual Cube Face Container
const FaceContainer = ({ faceIndex, cubeState, onCellClick, lockCenters, onCenterBlocked, label, badgeColor }) => {
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      {/* Small Dynamic Badge */}
      <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
        <span className={`text-[9px] font-black tracking-[0.1em] uppercase ${badgeColor || 'text-slate-400'}`}>{label}</span>
      </div>

      {/* Face Tray */}
      <div className="p-1.5 bg-[#0F0F1A]/90 backdrop-blur-2xl rounded-[0.8rem] shadow-[0_10px_25px_rgba(0,0,0,0.5)] border border-white/5 ring-1 ring-white/10 text-center">
        <div className="grid grid-cols-3 gap-[3px]">
          {Array.from({ length: 9 }, (_, i) => (
            <StickerTile
              key={i}
              color={cubeState[faceIndex * 9 + i]}
              isCenter={i === 4}
              lockCenters={lockCenters}
              onCenterBlocked={onCenterBlocked}
              onClick={() => onCellClick(faceIndex, i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const CubeNet2D = ({ cubeState, onCellClick, lockCenters = true, onCenterBlocked }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center select-none px-2 py-2">
      {/* 
        Compact Cross Pattern - Phone Optimized
        Row 1: Top (Centered)
        Row 2: Left - Front - Right - Back (Horizontal)
        Row 3: Bottom (Centered)
      */}
      <div className="flex flex-col items-center gap-1 w-full max-w-fit mx-auto">

        {/* ROW 1: TOP */}
        <div className="flex justify-center w-full">
          <FaceContainer
            faceIndex={0}
            cubeState={cubeState}
            onCellClick={onCellClick}
            lockCenters={lockCenters}
            onCenterBlocked={onCenterBlocked}
            label="Top"
            badgeColor="text-blue-400"
          />
        </div>

        {/* ROW 2: LEFT - FRONT - RIGHT - BACK */}
        <div className="flex items-center gap-1">
          <FaceContainer faceIndex={4} label="Left" cubeState={cubeState} onCellClick={onCellClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} />
          <FaceContainer faceIndex={2} label="Front" cubeState={cubeState} onCellClick={onCellClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} badgeColor="text-indigo-400" />
          <FaceContainer faceIndex={1} label="Right" cubeState={cubeState} onCellClick={onCellClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} />
          <FaceContainer faceIndex={5} label="Back" cubeState={cubeState} onCellClick={onCellClick} lockCenters={lockCenters} onCenterBlocked={onCenterBlocked} />
        </div>

        {/* ROW 3: BOTTOM */}
        <div className="flex justify-center w-full">
          <FaceContainer
            faceIndex={3}
            cubeState={cubeState}
            onCellClick={onCellClick}
            lockCenters={lockCenters}
            onCenterBlocked={onCenterBlocked}
            label="Bottom"
            badgeColor="text-purple-400"
          />
        </div>

      </div>
    </div>
  );
};

export default CubeNet2D;
