import { SHOW_TOAST } from '../constant';
import {
  toAbsoluteUploadUrl,
  uploadFileViaMultipart,
  uploadPrescriptionDirectToS3,
} from './uploadService';

export type ChatUploadedAttachment = {
  url: string;
  fileName: string;
  mimeType: string;
  kind: 'image' | 'file';
};

const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']);
const PRESIGNED_FILE_EXT = new Set(['pdf', 'doc', 'docx', 'txt']);

const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
};

export const isChatImageAttachment = (
  mimeType?: string | null,
  fileName?: string | null,
): boolean => {
  const mime = (mimeType || '').toLowerCase();
  if (mime.startsWith('image/')) {
    return true;
  }
  const name = (fileName || '').toLowerCase();
  return IMAGE_EXT.has(name.split('.').pop() || '');
};

const detectExtension = (
  uri: string,
  fileName?: string | null,
  mimeType?: string | null,
): string => {
  const fromName = (fileName || '').split('.').pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) {
    return fromName === 'jpeg' ? 'jpg' : fromName;
  }
  const mime = (mimeType || '').toLowerCase();
  if (mime.includes('jpeg')) return 'jpg';
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('heic')) return 'heic';
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('wordprocessingml')) return 'docx';
  if (mime.includes('msword')) return 'doc';
  if (mime.includes('plain')) return 'txt';
  const clean = decodeURIComponent(uri.split('?')[0].toLowerCase());
  const ext = clean.split('.').pop();
  if (ext && ext.length <= 5) {
    return ext === 'jpeg' ? 'jpg' : ext;
  }
  return 'jpg';
};

export const uploadChatAttachment = async (
  uri: string,
  fileName?: string | null,
  mimeType?: string | null,
): Promise<ChatUploadedAttachment> => {
  if (!uri) {
    throw new Error('Invalid file');
  }

  const ext = detectExtension(uri, fileName, mimeType);
  const resolvedMime = mimeType || MIME_MAP[ext] || 'application/octet-stream';
  const resolvedName = fileName || `chat_${Date.now()}.${ext}`;
  const kind: 'image' | 'file' = isChatImageAttachment(resolvedMime, resolvedName)
    ? 'image'
    : 'file';

  try {
    const filePath = await uploadFileViaMultipart(
      uri,
      resolvedName,
      resolvedMime,
      'chat',
    );
    return {
      url: toAbsoluteUploadUrl(filePath),
      fileName: resolvedName,
      mimeType: resolvedMime,
      kind,
    };
  } catch {
    // Multipart is primary (local storage). Presigned S3 is optional fallback.
  }

  try {
    if (IMAGE_EXT.has(ext) || ext === 'pdf' || PRESIGNED_FILE_EXT.has(ext)) {
      const { fileUrl } = await uploadPrescriptionDirectToS3(uri, ext, 'chat');
      return {
        url: toAbsoluteUploadUrl(fileUrl),
        fileName: resolvedName,
        mimeType: resolvedMime,
        kind,
      };
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to upload attachment';
    SHOW_TOAST(errorMessage, 'error');
    throw error;
  }

  const errorMessage = 'Failed to upload attachment';
  SHOW_TOAST(errorMessage, 'error');
  throw new Error(errorMessage);
};

export const CHAT_MAX_PENDING_ATTACHMENTS = 5;
