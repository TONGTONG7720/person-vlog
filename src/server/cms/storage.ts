const allowedImageContentTypes = new Set(['image/avif', 'image/jpeg', 'image/png', 'image/webp']);
const maximumMediaFileBytes = 4 * 1024 * 1024;

export function isCmsStorageConfigured(): boolean {
  return (process.env['BLOB_READ_WRITE_TOKEN']?.trim().length ?? 0) > 0;
}

export function isAcceptedCmsImage(file: File): boolean {
  return (
    allowedImageContentTypes.has(file.type) && file.size > 0 && file.size <= maximumMediaFileBytes
  );
}
