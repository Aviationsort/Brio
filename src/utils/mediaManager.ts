/**
 * Media Pipeline Utility
 * - Convert files/data URLs to persistent base64
 * - Generate image/video thumbnails
 * - Blob URL cleanup
 */

export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const dataUrlToBase64 = (dataUrl: string): string => {
  return dataUrl.split(',')[1] || dataUrl;
};

export const base64ToDataUrl = (base64: string, mimeType: string): string => {
  return `data:${mimeType};base64,${base64}`;
};

export const generateThumbnail = (file: File, maxSize = 200): Promise<string> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for thumbnail'));
    };
    img.src = url;
  });
};

export const revokeBlobUrl = (url: string) => {
  if (url.startsWith('blob:')) URL.revokeObjectURL(url);
};

export const extractLinkPreview = async (url: string): Promise<{ title?: string; description?: string; imageUrl?: string }> => {
  try {
    const response = await fetch(url, { mode: 'no-cors' });
    return {};
  } catch {
    return {};
  }
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};
