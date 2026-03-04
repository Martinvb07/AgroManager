import { useEffect, useState } from 'react';
import '../styles/TractorLoader.css';

/**
 * Full-screen loading overlay with a minimalist B&W tractor + trailer animation.
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
      }, 600);
      return () => clearTimeout(t);
    }
  }, [visible, phase, onFinish]);

  if (phase === 'done') return null;

  return (
    <div className={`tractor-loader ${phase === 'exit' ? 'tractor-loader--exit' : ''}`}>
      {/* Ground line */}
      <div className="tractor-groundline" />

      {/* Tractor + Trailer group – drives across screen */}
      <div className="tractor-rig">
        {/* Smoke */}
        <div className="tractor-smoke">
          <span /><span /><span />
        </div>

        {/* Tractor */}
        <div className="tractor-body">
          {/* Cabin */}
          <div className="tractor-cabin">
            <div className="tractor-window" />
          </div>
          {/* Hood */}
          <div className="tractor-hood" />
          {/* Exhaust pipe */}
          <div className="tractor-exhaust" />
          {/* Back wheel */}
          <div className="tractor-wheel tractor-wheel--back">
            <div className="tractor-wheel-hub" />
          </div>
          {/* Front wheel */}
          <div className="tractor-wheel tractor-wheel--front">
            <div className="tractor-wheel-hub" />
          </div>
        </div>

        {/* Hitch bar */}
        <div className="tractor-hitch" />

        {/* Trailer */}
        <div className="tractor-trailer">
          <div className="tractor-trailer-bed" />
          <div className="tractor-wheel tractor-wheel--trailer">
            <div className="tractor-wheel-hub" />
          </div>
        </div>
      </div>

      {/* Message */}
      <p className="tractor-message">{message}</p>
    </div>
  );
}
