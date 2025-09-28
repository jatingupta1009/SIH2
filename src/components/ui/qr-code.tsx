import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

const QRCode: React.FC<QRCodeProps> = ({ value, size = 128, className = "" }) => {
  // Generate a simple QR-like pattern for demo purposes
  const generateQRPattern = () => {
    const pattern = [];
    for (let i = 0; i < 25; i++) {
      const row = [];
      for (let j = 0; j < 25; j++) {
        // Create a pattern thha1at looks like a QR code
        const isCorner = (i < 7 && j < 7) || (i < 7 && j > 17) || (i > 17 && j < 7);
        const isData = Math.random() > 0.5;
        row.push(isCorner || isData ? 'black' : 'white');
      }
      pattern.push(row);
    }
    return pattern;
  };

  const pattern = generateQRPattern();

  return (
    <div 
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 25 25">
        {pattern.map((row, i) =>
          row.map((color, j) => (
            <rect
              key={`${i}-${j}`}
              x={j}
              y={i}
              width={1}
              height={1}
              fill={color}
            />
          ))
        )}
      </svg>
    </div>
  );
};

export default QRCode;
