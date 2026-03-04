import { useEffect, useState } from 'react';
import '../styles/TractorLoader.css';

/**
 * Full-screen loading overlay with an animated tractor driving across a farm scene.
 *
 * Props:
 *   message  – text shown below the tractor (default "Cargando…")
 *   onFinish – callback fired after the exit animation ends (optional)
 *   visible  – controls mount/unmount with exit animation
 */
export default function TractorLoader({ message = 'Cargando…', onFinish, visible = true }) {
  const [phase, setPhase] = useState('enter'); // enter | exit | done

  useEffect(() => {
    if (!visible && phase === 'enter') {
      setPhase('exit');
      const t = setTimeout(() => {
        setPhase('done');
        onFinish?.();
      }, 600); // matches CSS exit duration
      return () => clearTimeout(t);
    }
  }, [visible, phase, onFinish]);

  if (phase === 'done') return null;

  return (
    <div className={`tractor-loader ${phase === 'exit' ? 'tractor-loader--exit' : ''}`}>
      {/* Sky */}
      <div className="tractor-sky">
        <div className="tractor-cloud tractor-cloud--1" />
        <div className="tractor-cloud tractor-cloud--2" />
        <div className="tractor-cloud tractor-cloud--3" />
        <div className="tractor-sun" />
      </div>

      {/* Ground */}
      <div className="tractor-ground">
        <div className="tractor-ground-dirt" />
        {/* Crop rows */}
        <div className="tractor-crops">
          <div className="tractor-crop-row" />
          <div className="tractor-crop-row" />
          <div className="tractor-crop-row" />
          <div className="tractor-crop-row" />
          <div className="tractor-crop-row" />
        </div>
      </div>

      {/* Tractor */}
      <div className="tractor-vehicle">
        {/* Exhaust smoke */}
        <div className="tractor-smoke">
          <span /><span /><span />
        </div>
        {/* Body */}
        <div className="tractor-body">
          <div className="tractor-cabin">
            <div className="tractor-window" />
          </div>
          <div className="tractor-engine" />
          <div className="tractor-exhaust-pipe" />
        </div>
        {/* Wheels */}
        <div className="tractor-wheel tractor-wheel--back">
          <div className="tractor-wheel-hub" />
        </div>
        <div className="tractor-wheel tractor-wheel--front">
          <div className="tractor-wheel-hub" />
        </div>
        {/* Dust trail */}
        <div className="tractor-dust">
          <span /><span /><span /><span />
        </div>
      </div>

      {/* Message */}
      <p className="tractor-message">{message}</p>
    </div>
  );
}
