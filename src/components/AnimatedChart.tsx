import React, { useEffect, useRef } from 'react';
import { AnimatedElement } from './AnimatedElement';

interface AnimatedChartProps {
  data: number[];
  labels?: string[];
  type?: 'line' | 'bar' | 'pie' | 'area';
  animation?: 'fadeIn' | 'slideInUp' | 'scaleIn' | 'bounce';
  duration?: number;
  className?: string;
  height?: number;
  width?: number;
  color?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
}

export const AnimatedChart: React.FC<AnimatedChartProps> = ({
  data,
  labels,
  type = 'line',
  animation = 'fadeIn',
  duration = 300,
  className = '',
  height = 300,
  width = 600,
  color = '#3B82F6',
  showGrid = true,
  showLegend = true,
  showTooltip = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawChart = (progress: number) => {
      ctx.clearRect(0, 0, width, height);

      // Draw grid
      if (showGrid) {
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        const gridSpacing = height / 5;
        for (let i = 0; i <= 5; i++) {
          const y = i * gridSpacing;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // Draw data
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;

      const maxValue = Math.max(...data);
      const minValue = Math.min(...data);
      const range = maxValue - minValue;
      const xStep = width / (data.length - 1);
      const yScale = height / range;

      switch (type) {
        case 'line':
          ctx.beginPath();
          data.forEach((value, index) => {
            const x = index * xStep;
            const y = height - (value - minValue) * yScale * progress;
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.stroke();
          break;

        case 'bar':
          data.forEach((value, index) => {
            const x = index * xStep;
            const barHeight = (value - minValue) * yScale * progress;
            ctx.fillRect(x, height - barHeight, xStep * 0.8, barHeight);
          });
          break;

        case 'area':
          ctx.beginPath();
          data.forEach((value, index) => {
            const x = index * xStep;
            const y = height - (value - minValue) * yScale * progress;
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.fillStyle = `${color}33`;
          ctx.fill();
          break;

        case 'pie':
          const centerX = width / 2;
          const centerY = height / 2;
          const radius = Math.min(width, height) / 2 * 0.8;
          const total = data.reduce((sum, value) => sum + value, 0);
          let startAngle = 0;

          data.forEach((value) => {
            const sliceAngle = (value / total) * 2 * Math.PI * progress;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();
            startAngle += sliceAngle;
          });
          break;
      }

      // Draw labels
      if (labels) {
        ctx.fillStyle = '#6B7280';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        labels.forEach((label, index) => {
          const x = index * xStep;
          ctx.fillText(label, x, height + 20);
        });
      }
    };

    const animate = (timestamp: number) => {
      const progress = Math.min((timestamp % duration) / duration, 1);
      drawChart(progress);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, labels, type, duration, height, width, color, showGrid]);

  return (
    <AnimatedElement
      show={true}
      animation={animation}
      duration={duration}
      className={className}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full"
      />
    </AnimatedElement>
  );
}; 