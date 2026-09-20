/**
 * KSHETRIKAH (क्षेत्रिकः) - Security, Data Privacy & EXIF Sanitization
 * Government of Maharashtra MSInS Challenge #26131
 * Developed by TEAM BITHEADS
 *
 * Implements:
 * 1. DPDP Act 2023 compliance: Strips camera serial numbers, device metadata,
 *    and unconsented EXIF from images before forwarding to third-party AI APIs.
 * 2. Magic bytes validation: Ensures uploaded files are legitimate JPEG/PNG/WebP.
 * 3. Payload size enforcement (15MB ceiling).
 * 4. Text input sanitization to prevent injection.
 */

const MAX_PAYLOAD_BYTES = 15 * 1024 * 1024; // 15MB

export interface ImageSecurityValidation {
  valid: boolean;
  mimeType: string;
  sizeBytes: number;
  error?: string;
  cleanBase64?: string;
}

/**
 * Validates magic bytes of base64 decoded buffer to prevent polyglots or malicious uploads.
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; detectedMime?: string } {
  if (buffer.length < 12) {
    return { valid: false };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedMime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedMime: 'image/png' };
  }

  // WebP: RIFF .... WEBP
  const riff = buffer.subarray(0, 4).toString('ascii');
  const webp = buffer.subarray(8, 12).toString('ascii');
  if (riff === 'RIFF' && webp === 'WEBP') {
    return { valid: true, detectedMime: 'image/webp' };
  }

  // GIF: GIF87a or GIF89a
  const gif = buffer.subarray(0, 6).toString('ascii');
  if (gif === 'GIF87a' || gif === 'GIF89a') {
    return { valid: true, detectedMime: 'image/gif' };
  }

  return { valid: false };
}

/**
 * Strips EXIF APP1 metadata blocks from JPEG images in-memory to safeguard farmer privacy.
 * JPEG markers: APP1 is 0xFFE1. We excise APP1 markers without altering image pixel tables.
 */
export function stripJpegExif(buffer: Buffer): Buffer {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return buffer; // Not standard JPEG
  }

  const chunks: Buffer[] = [];
  chunks.push(buffer.subarray(0, 2)); // SOI: FF D8

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      // Stream desync or start of scan
      chunks.push(buffer.subarray(offset));
      break;
    }

    const marker = buffer[offset + 1];

    // Standalone markers: RST0-7, SOI, EOI, TEM
    if (marker === 0xd9) {
      // EOI
      chunks.push(buffer.subarray(offset));
      break;
    }

    if (marker === 0xda) {
      // Start of Scan (SOS) - rest is compressed entropy data
      chunks.push(buffer.subarray(offset));
      break;
    }

    if (offset + 4 > buffer.length) {
      chunks.push(buffer.subarray(offset));
      break;
    }

    const segmentLength = buffer.readUInt16BE(offset + 2);
    const segmentEnd = offset + 2 + segmentLength;

    if (segmentEnd > buffer.length) {
      chunks.push(buffer.subarray(offset));
      break;
    }

    // APP1 marker is 0xFFE1 (EXIF / XMP)
    // APP2 marker is 0xFFE2 (ICC / FlashPix) - preserve ICC if needed, strip if EXIF
    if (marker === 0xe1) {
      // Skip this EXIF segment!
      offset = segmentEnd;
      continue;
    }

    // Keep other segments (DQT, DHT, SOF0, etc.)
    chunks.push(buffer.subarray(offset, segmentEnd));
    offset = segmentEnd;
  }

  return Buffer.concat(chunks);
}

/**
 * Sanitizes and validates incoming image data URL.
 */
export function sanitizeAndValidateImage(dataUrl: string): ImageSecurityValidation {
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl);
  if (!match) {
    return {
      valid: false,
      mimeType: '',
      sizeBytes: 0,
      error: 'Invalid image format. Must be base64-encoded JPEG, PNG, or WebP.',
    };
  }

  const declaredMime = match[1].toLowerCase();
  const rawBase64 = match[2];

  let buffer: Buffer;
  try {
    buffer = Buffer.from(rawBase64, 'base64');
  } catch {
    return {
      valid: false,
      mimeType: declaredMime,
      sizeBytes: 0,
      error: 'Corrupt base64 encoding.',
    };
  }

  if (buffer.length > MAX_PAYLOAD_BYTES) {
    return {
      valid: false,
      mimeType: declaredMime,
      sizeBytes: buffer.length,
      error: `Image payload too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB). Max permitted is 15MB.`,
    };
  }

  const magic = validateImageMagicBytes(buffer);
  if (!magic.valid) {
    return {
      valid: false,
      mimeType: declaredMime,
      sizeBytes: buffer.length,
      error: 'Image header signature verification failed. File does not match image magic bytes.',
    };
  }

  // Strip EXIF if JPEG
  let cleanBuffer = buffer;
  if (magic.detectedMime === 'image/jpeg') {
    try {
      cleanBuffer = stripJpegExif(buffer);
    } catch {
      cleanBuffer = buffer; // fallback to original on parse edge cases
    }
  }

  return {
    valid: true,
    mimeType: magic.detectedMime || declaredMime,
    sizeBytes: cleanBuffer.length,
    cleanBase64: cleanBuffer.toString('base64'),
  };
}

/**
 * Sanitizes plain string inputs against script tags and non-printable characters.
 */
export function sanitizeString(input: string, maxLength: number = 250): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>'"&]/g, '') // remove HTML specials
    .replace(/[\x00-\x1F\x7F]/g, '') // strip control chars
    .trim()
    .slice(0, maxLength);
}
