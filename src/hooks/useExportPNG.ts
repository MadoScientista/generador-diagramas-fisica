import { useCallback } from 'react';

function parseIntrinsicSize(svg: string): { width: number; height: number } | null {
  const viewBox = svg.match(/viewBox="([^"]+)"/);
  if (viewBox) {
    const parts = viewBox[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      const [, , w, h] = parts;
      if (w > 0 && h > 0) return { width: w, height: h };
    }
  }
  const widthMatch = svg.match(/\bwidth="(\d+(?:\.\d+)?)"/);
  const heightMatch = svg.match(/\bheight="(\d+(?:\.\d+)?)"/);
  if (widthMatch && heightMatch) {
    const w = Number(widthMatch[1]);
    const h = Number(heightMatch[1]);
    if (w > 0 && h > 0) return { width: w, height: h };
  }
  return null;
}

export function useExportPNG(svg: string | null, filename = 'diagrama.png', scale = 2) {
  const exportPNG = useCallback(() => {
    if (!svg) return;

    const size = parseIntrinsicSize(svg);
    if (!size) return;

    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const cleanup = () => URL.revokeObjectURL(url);

    const image = new Image();
    image.onload = () => {
      const width = size.width * scale;
      const height = size.height * scale;
      image.width = width;
      image.height = height;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        cleanup();
        return;
      }
      ctx.drawImage(image, 0, 0, width, height);

      canvas.toBlob((blob) => {
        cleanup();
        if (!blob) return;
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 'image/png');
    };

    image.onerror = cleanup;

    document.fonts.ready.then(() => {
      image.src = url;
    });
  }, [svg, filename, scale]);

  return { exportPNG, isReady: svg !== null };
}
