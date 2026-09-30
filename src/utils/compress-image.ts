interface CompressOptions {
  /** Longest edge in pixels after resizing. */
  maxDimension: number;
  /** WebP quality, 0–1. */
  quality?: number;
}

/**
 * Downscales a picked photo and re-encodes it as WebP in the browser before
 * it's uploaded — a 4–5MB phone photo typically lands at 150–400KB. That
 * shrinks the upload itself, Storage usage, and every later download of it.
 * Falls back to the original file if the browser can't decode/encode it, if
 * it's animated (GIF), or if re-encoding wouldn't actually make it smaller.
 */
export async function compressImage(
  file: File,
  { maxDimension, quality = 0.82 }: CompressOptions,
): Promise<File> {
  if (file.type === "image/gif" || typeof createImageBitmap !== "function") {
    return file;
  }

  try {
    // imageOrientation applies the EXIF rotation, so portrait phone shots stay upright.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );
    // Safari < 16 silently falls back to PNG for unsupported types.
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) {
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}
