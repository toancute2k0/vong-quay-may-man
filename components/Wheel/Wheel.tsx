'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './Wheel.module.css';

interface Option {
  id: string;
  label: string;
  color: string;
  textColor: string;
}

interface WheelProps {
  options: Option[];
  onSpinEnd: (winner: Option) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  winnerIndex: number | null; // Pre-calculated winner index
}

export default function Wheel({ options, onSpinEnd, isSpinning, setIsSpinning, winnerIndex }: WheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);

  const numOptions = options.length;
  const segmentAngle = 360 / numOptions;

  useEffect(() => {
    if (isSpinning && winnerIndex !== null) {
        // Calculate target rotation to land on the winner
        // Winner index 0 is at 0 degrees (right side usually in CSS logic, need to adjust)
        // Standard CSS rotation starts at 3 o'clock. 
        // Let's assume index 0 is at -90deg (top).
        
        // Random extra spins (fast!)
        const spinRounds = 50 + Math.random() * 20; 
        const extraDegrees = spinRounds * 360;

        // Calculate angle to land on winner
        // If we want index `i` to be at the pointer (top, -90deg or 270deg):
        // The wheel rotates. Pointer is fixed at top.
        // Current Angle + Delta = Target.
        // Target needs to be such that (Target % 360) places Winner under Pointer.
        
        // Let's simplify: 
        // Segment `i` is at `i * segmentAngle`.
        // To place `i` at top (270deg), we need Rotation such that:
        // (Rotation + i * segmentAngle) % 360 == 270.
        // Rotation = 270 - i * segmentAngle. 
        // Add extra spins.
        
        const targetAngleInWheel = winnerIndex * segmentAngle;
        // Adjust for pointer position (top center = 270 degrees in standard circle or -90)
        // Let's say options start drawing at 0deg (3 o'clock).
        // If Pointer is at Top (-90deg), and we want option 0 there.
        // We need 0 to rotate to -90. So rotation is -90.
        
        const pointerOffset = 270; // 270 degrees is top
        const baseTarget = pointerOffset - targetAngleInWheel;
        
        // Add randomization within the segment to avoid landing on lines
        const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.8); // 80% safe zone
        
        const totalRotation = rotation + extraDegrees + (baseTarget - (rotation % 360)) + randomOffset;
        
        // Ensure strictly increasing magnitude to spin right way? 
        // Actually simple addition is fine.
        
        setRotation(totalRotation);
    }
  }, [isSpinning, winnerIndex, options.length]);

  const handleTransitionEnd = () => {
    if (isSpinning) {
      setIsSpinning(false);
      if (winnerIndex !== null) {
        onSpinEnd(options[winnerIndex]);
      }
    }
  };

  // Conic Gradient for background
  const backgroundGradient = `conic-gradient(
    ${options.map((opt, i) => `${opt.color} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`).join(', ')}
  )`;

  return (
    <div className={styles.wheelContainer}>
      <div className={styles.pointer} />
      <div 
        className={styles.wheelCanvas}
        ref={wheelRef}
        style={{
          background: options.length > 0 ? backgroundGradient : '#ccc',
          transform: `rotate(${rotation}deg)`
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {options.map((option, index) => (
          <div
            key={option.id}
            className={styles.segmentLabel}
            style={{
              transform: `rotate(${index * segmentAngle + segmentAngle / 2}deg)`,
              color: option.textColor,
            }}
          >
            <span>{option.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.centerKnob}>
        <span style={{ fontSize: '24px' }}>🧧</span>
      </div>
    </div>
  );
}
