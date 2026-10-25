'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { shouldUse3DVisualization } from '../lib/performance-budget.js';
import type { VerificationResult } from '../lib/verifier.js';

interface ResultsVisualizerProps {
  result: VerificationResult;
}

export function ResultsVisualizer({ result }: ResultsVisualizerProps): React.JSX.Element {
  const [is3DMode, setIs3DMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const { verdict, riskScore, ruleHits } = result.report;

  // Detect capability on mount
  useEffect(() => {
    const canUse3D = shouldUse3DVisualization();
    setIs3DMode(canUse3D);
  }, []);

  const getThemeColor = () => {
    switch (verdict) {
      case 'CREDIBLE':
        return { hex: '#10b981', r: 16, g: 185, b: 129 };
      case 'VAGUE':
        return { hex: '#f59e0b', r: 245, g: 158, b: 11 };
      case 'LIKELY_MISLEADING':
        return { hex: '#f43f5e', r: 244, g: 63, b: 94 };
      default:
        return { hex: '#64748b', r: 100, g: 116, b: 139 };
    }
  };

  const theme = getThemeColor();

  // 3D Canvas Wireframe Animation
  useEffect(() => {
    if (!is3DMode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rotationX = 0;
    let rotationY = 0;
    const points: Array<[number, number, number]> = [];
    const count = 48;
    const radius = 70;

    // Generate points on a sphere
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      points.push([
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi),
      ]);
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      rotationX += 0.008;
      rotationY += 0.012;

      // Project and draw 3D points
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (!p) continue;
        const [x, y, z] = p;

        // Rotate Y
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;

        // Rotate X
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        // Perspective projection
        const fov = 200;
        const scale = fov / (fov + z2 + 100);
        const projX = centerX + x1 * scale;
        const projY = centerY + y2 * scale;
        const alpha = Math.max(0.15, (z2 + radius) / (radius * 2));

        ctx.beginPath();
        ctx.arc(projX, projY, Math.max(1, 2.5 * scale), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${theme.r}, ${theme.g}, ${theme.b}, ${alpha})`;
        ctx.fill();
      }

      // Draw central risk core
      ctx.beginPath();
      ctx.arc(centerX, centerY, 18, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${theme.r}, ${theme.g}, ${theme.b}, 0.25)`;
      ctx.fill();
      ctx.strokeStyle = theme.hex;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [is3DMode, theme]);

  return (
    <div
      aria-label="Compliance and Risk Visualization"
      className="glass-panel"
      style={{
        padding: '1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-dim)',
          }}
        >
          Compliance Risk Geometry
        </span>

        {/* View Mode Toggle */}
        <button
          type="button"
          onClick={() => setIs3DMode(!is3DMode)}
          style={{
            fontSize: '0.75rem',
            padding: '0.25rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          {is3DMode ? 'Switch to 2D Accessible View' : 'Switch to 3D Sphere View'}
        </button>
      </div>

      {is3DMode ? (
        /* 3D Wireframe Canvas Mode */
        <div style={{ position: 'relative', width: '220px', height: '200px' }}>
          <canvas
            ref={canvasRef}
            width={220}
            height={200}
            style={{ width: '220px', height: '200px', display: 'block' }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {riskScore.score}
            </div>
            <div
              style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}
            >
              Index
            </div>
          </div>
        </div>
      ) : (
        /* 2D Accessible SVG Gauge Fallback */
        <div style={{ width: '180px', height: '140px', position: 'relative' }}>
          <svg
            viewBox="0 0 180 120"
            role="img"
            aria-label={`Risk score ${riskScore.score} out of 100`}
            style={{ width: '100%', height: '100%' }}
          >
            <title>Risk Score Radial Gauge</title>
            {/* Background Arc */}
            <path
              d="M 20 100 A 70 70 0 0 1 160 100"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Active Value Arc */}
            <path
              d="M 20 100 A 70 70 0 0 1 160 100"
              fill="none"
              stroke={theme.hex}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="220"
              strokeDashoffset={Math.max(0, 220 - (riskScore.score / 100) * 220)}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: theme.hex }}>
              {riskScore.score}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginLeft: '3px' }}>
              / 100
            </span>
          </div>
        </div>
      )}

      {/* Evaluated Rules Satellite Breakdown */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '0.75rem',
        }}
      >
        {ruleHits.map((h) => {
          const isFlag = h.outcome === 'flag';
          const isPass = h.outcome === 'pass';
          const dotColor = isFlag
            ? 'var(--verdict-misleading)'
            : isPass
              ? 'var(--verdict-credible)'
              : 'var(--text-dim)';
          return (
            <span
              key={h.rule_id}
              title={`${h.rule_id}: ${h.reason ?? h.outcome}`}
              style={{
                fontSize: '0.72rem',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${dotColor}44`,
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: dotColor,
                }}
              />
              {h.rule_id}
            </span>
          );
        })}
      </div>
    </div>
  );
}
