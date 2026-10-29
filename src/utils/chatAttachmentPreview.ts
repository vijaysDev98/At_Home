import i18next from 'i18next';

import { STRING } from '../constant';
import {
  getDisplayFileName,
  isDocumentFile,
} from './documentPickerHelper';
import { toAbsoluteUploadUrl } from '../services/uploadService';

export type ChatAttachmentOpenPayload = {
  url: string;
  fileName?: string;
  mimeType?: string;
  kind?: 'image' | 'file' | string;
};

export type ChatAttachmentOpenContext = {
  attachment: ChatAttachmentOpenPayload;
  /** All image attachments in the same message (for gallery preview). */
  messageImages?: ChatAttachmentOpenPayload[];
  imageIndex?: number;
};

const IMAGE_MIME_PREFIX = 'image/';
const IMAGE_EXT = /\.(jpg|jpeg|png|webp|heic|heif|gif)(\?|$)/i;

export const isChatAttachmentImage = (file: ChatAttachmentOpenPayload): boolean => {
  const mime = (file.mimeType || '').toLowerCase();
  if (mime.startsWith(IMAGE_MIME_PREFIX)) {
    return true;
  }
  if (file.kind === 'image') {
    return true;
  }
  if (file.kind === 'file') {
    return false;
  }
  const url = toAbsoluteUploadUrl(file.url);
  if (isDocumentFile(url)) {
    return false;
  }
  return IMAGE_EXT.test(url);
};

export const isChatAttachmentDocument = (
  file: ChatAttachmentOpenPayload,
): boolean => !isChatAttachmentImage(file);

export const getChatAttachmentAbsoluteUrl = (
  file: ChatAttachmentOpenPayload,
): string => toAbsoluteUploadUrl(file.url);

export const getChatAttachmentDisplayName = (
  file: ChatAttachmentOpenPayload,
): string =>
  getDisplayFileName(
    getChatAttachmentAbsoluteUrl(file),
    file.fileName || i18next.t(STRING.chatDefaultDocument),
  );
