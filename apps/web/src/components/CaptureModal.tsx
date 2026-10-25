'use client';

import type React from 'react';
import { useRef, useState } from 'react';
import { performOcr } from '../lib/ocr.js';

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTextExtracted: (text: string) => void;
}

export function CaptureModal({
  isOpen,
  onClose,
  onTextExtracted,
}: CaptureModalProps): React.JSX.Element {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  if (!isOpen) return <></>;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await processImage(file);
  };

  const processImage = async (imageSource: Blob | File) => {
    setIsProcessing(true);
    setProgressPercent(0);
    setProgressStatus('Starting OCR...');

    try {
      const result = await performOcr(imageSource, {
        onProgress: (pct, status) => {
          setProgressPercent(Math.round(pct * 100));
          setProgressStatus(status);
        },
      });

      setExtractedText(result.text);
      if (mediaStreamRef.current) {
        stopCamera();
      }
    } catch (err) {
      setProgressStatus('OCR Error: Could not read text clearly');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setIsCameraActive(false);
      setProgressStatus('Camera access denied or unavailable');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      for (const track of mediaStreamRef.current.getTracks()) {
        track.stop();
      }
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          processImage(blob);
        }
      }, 'image/jpeg');
    }
  };

  const handleApply = () => {
    if (extractedText.trim()) {
      onTextExtracted(extractedText.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setExtractedText('');
    setProgressStatus('');
    onClose();
  };

  return (
    <dialog
      open
      aria-labelledby="capture-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        border: 'none',
        zIndex: 1000,
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '540px',
          padding: '2rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <h3
          id="capture-modal-title"
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '0.5rem',
          }}
        >
          📷 Packaging Photo OCR
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Capture or upload product packaging photos to extract claims in-browser without sending
          images to any server.
        </p>

        {/* Live Camera View */}
        {isCameraActive ? (
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                maxHeight: '260px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#000',
                objectFit: 'cover',
              }}
            >
              <track kind="captions" />
            </video>
            <div
              style={{
                marginTop: '0.75rem',
                display: 'flex',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={captureFrame}
                disabled={isProcessing}
              >
                📸 Snap & Read Text
              </button>
              <button type="button" className="btn btn-secondary" onClick={stopCamera}>
                Close Camera
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={startCamera}
              style={{ flex: 1, fontSize: '0.875rem' }}
            >
              🎥 Use Camera
            </button>
            <label
              className="btn btn-primary"
              style={{ flex: 1, fontSize: '0.875rem', cursor: 'pointer', textAlign: 'center' }}
            >
              📁 Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={isProcessing}
              />
            </label>
          </div>
        )}

        {/* Progress Display */}
        {isProcessing && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--accent-emerald)',
                marginBottom: '0.35rem',
              }}
            >
              {progressStatus} ({progressPercent}%)
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  backgroundColor: 'var(--accent-emerald)',
                  borderRadius: '3px',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Extracted text preview */}
        {extractedText && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="extracted-claim-textarea"
              style={{
                display: 'block',
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
                marginBottom: '0.35rem',
              }}
            >
              Recognized Packaging Claim (Edit if needed):
            </label>
            <textarea
              id="extracted-claim-textarea"
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          {extractedText && (
            <button
              type="button"
              id="apply-ocr-text-button"
              className="btn btn-primary"
              onClick={handleApply}
            >
              Verify Extracted Claim
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
