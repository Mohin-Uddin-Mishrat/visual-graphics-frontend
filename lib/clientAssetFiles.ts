export const CLIENT_ASSET_ACCEPT = 'image/*,.gif,.zip,application/zip,application/x-zip-compressed';
export const CLIENT_ASSET_ZIP_PREVIEW = '/assets/zip.webp';

const MIME_TO_EXTENSION: Record<string, string> = {
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
};

export function isImageFile(file: File | null) {
  return Boolean(file?.type?.startsWith('image/'));
}

export function isZipAssetUrl(url: string) {
  const normalized = url.toLowerCase();
  return normalized.includes('.zip') || normalized.includes('/zip/') || normalized.includes('\\zip\\');
}

export function getClientAssetPreviewSrc(url: string) {
  return isZipAssetUrl(url) ? CLIENT_ASSET_ZIP_PREVIEW : url;
}

export function getAssetFileName(imageUrl: string): string {
  try {
    const pathname = new URL(imageUrl).pathname;
    return pathname.split('/').filter(Boolean).pop() ?? '';
  } catch {
    return imageUrl.split('/').filter(Boolean).pop() ?? '';
  }
}

export function getClientAssetShareUrl(origin: string, imageUrl: string) {
  const fileName = getAssetFileName(imageUrl);
  return `${origin}/${encodeURIComponent(fileName)}`;
}

export function getClientAssetDownloadName(id: number, blob: Blob, prefix = 'client-asset') {
  const extension = MIME_TO_EXTENSION[blob.type] ?? 'bin';
  return `${prefix}-${id}.${extension}`;
}
