import { useCallback } from 'react';

export function useExportSVG(svg: string | null, filename = 'diagrama-mru.svg') {
  const exportSVG = useCallback(() => {
    if (!svg) return;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [svg, filename]);

  return { exportSVG, isReady: svg !== null };
}
