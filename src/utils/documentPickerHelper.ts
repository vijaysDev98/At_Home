import {
  pick,
  types,
  isErrorWithCode,
  errorCodes,
  DocumentPickerResponse,
} from '@react-native-documents/picker';
import { SHOW_TOAST } from '../constant';

export interface PickedPrescriptionFile {
  uri: string;
  name?: string | null;
  type?: string | null;
  isPdf: boolean;
  isDoc: boolean;
}

/**
 * Pick documents (PDFs, docs, and/or images) using native document picker.
 */
export const pickPrescriptionDocuments = async (
  options: { allowMultiSelection?: boolean } = { allowMultiSelection: true },
): Promise<PickedPrescriptionFile[]> => {
  try {
    const results = await pick({
      type: [types.pdf, types.images, types.doc, types.docx],
      allowMultiSelection: options.allowMultiSelection ?? true,
      mode: 'import',
    });

    if (!results || results.length === 0) return [];

    return results.map((doc: DocumentPickerResponse) => {
      const fileName = doc.name || '';
      const mimeType = (doc.type || '').toLowerCase();
      const isPdf =
        mimeType === 'application/pdf' ||
        fileName.toLowerCase().endsWith('.pdf') ||
        doc.uri.toLowerCase().endsWith('.pdf');

      const isDoc =
        isPdf ||
        mimeType.includes('document') ||
        mimeType.includes('msword') ||
        mimeType.includes('text') ||
        mimeType.includes('pdf') ||
        fileName.toLowerCase().endsWith('.doc') ||
        fileName.toLowerCase().endsWith('.docx') ||
        (!mimeType.startsWith('image/') && !fileName.match(/\.(jpg|jpeg|png|webp|heic)$/i));

      return {
        uri: doc.uri,
        name: doc.name,
        type: doc.type,
        isPdf,
        isDoc,
      };
    });
  } catch (err: any) {
    if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
      // User cancelled picker - do nothing
      return [];
    }
    console.warn('Document picker error:', err);
    SHOW_TOAST(err?.message || 'Error selecting document', 'error');
    return [];
  }
};

/**
 * Helper to check if a URI or URL points to a PDF
 */
export const isPdfDocument = (uriOrUrl: string): boolean => {
  if (!uriOrUrl) return false;
  const clean = decodeURIComponent(uriOrUrl.split('?')[0]).toLowerCase();
  return (
    clean.endsWith('.pdf') ||
    clean.includes('.pdf') ||
    clean.includes('type=documents')
  );
};

/**
 * Helper to check if a URI or URL points to any document (PDF, doc, etc.)
 */
export const isDocumentFile = (uriOrUrl: string): boolean => {
  if (!uriOrUrl) return false;
  const clean = decodeURIComponent(uriOrUrl.split('?')[0]).toLowerCase();
  return (
    isPdfDocument(uriOrUrl) ||
    clean.endsWith('.doc') ||
    clean.endsWith('.docx') ||
    clean.endsWith('.txt') ||
    clean.includes('/documents/')
  );
};

/**
 * Cleanly format file name for display on document cards
 */
export const getDisplayFileName = (
  uriOrUrl: string,
  fallbackName?: string,
): string => {
  if (fallbackName && fallbackName.trim()) {
    return fallbackName;
  }
  if (!uriOrUrl) return 'Prescription.pdf';
  const clean = decodeURIComponent(uriOrUrl.split('?')[0]);
  let fileName = clean.split('/').pop() || 'Prescription.pdf';
  // If S3 timestamp prefix like 1741349830201-filename.pdf, clean it up for display
  if (/^\d{13}-/.test(fileName)) {
    fileName = fileName.replace(/^\d{13}-/, '');
  }
  return fileName;
};
