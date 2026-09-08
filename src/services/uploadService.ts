import { Platform } from 'react-native';
import { API } from '../api';
import { SHOW_TOAST } from '../constant';

export interface UploadResponse {
  status: number;
  data: {
    filePath: string;
  };
}

export const uploadImageToS3 = async (
  uri: string,
  type?: string,
  fileName?: string,
): Promise<UploadResponse> => {
  if (!uri) {
    SHOW_TOAST('Invalid image file', 'error');
    throw new Error('Invalid image file');
  }

  try {
    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      type: type || 'image/jpeg',
      name: fileName || `profile_${Date.now()}.jpg`,
    } as any);

    console.log('Uploading image to S3...', formData);

    const response = await API.Instance.post(
      API.API_ROUTES.uploadFile,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    console.log('Upload response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Image upload failed:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      'Failed to upload image';
    SHOW_TOAST(errorMessage, 'error');
    throw error;
  }
};

const AUDIO_MIME_MAP: Record<string, string> = {
  m4a: 'audio/m4a',
  mp4: 'audio/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
  oga: 'audio/ogg',
  flac: 'audio/flac',
  webm: 'audio/webm',
  '3gp': 'audio/3gpp',
  amr: 'audio/amr',
};

/**
 * Upload Audio Recording to S3 using Presigned URL
 * 1. Calls GET /common/file/getPresignedUrl?type=audios&extn=m4a&model=serviceRequest
 * 2. PUTs raw binary file directly to S3 upload_url
 * 3. Returns the public file_url (CloudFront/S3)
 */
export const uploadAudioDirectToS3 = async (
  fileUri: string,
  extn: string = 'm4a',
): Promise<{ fileUrl: string; uploadUrl?: string }> => {
  if (!fileUri) {
    SHOW_TOAST('Invalid audio file', 'error');
    throw new Error('Invalid audio file');
  }

  try {
    // 1. Detect audio extension and matching MIME type
    const cleanUri = fileUri.split('?')[0];
    const detectedExt = extn
      ? extn.replace('.', '').toLowerCase()
      : cleanUri.split('.').pop()?.toLowerCase() || 'm4a';
    const fileExt = detectedExt.length <= 5 ? detectedExt : 'm4a';
    const contentType = AUDIO_MIME_MAP[fileExt] || `audio/${fileExt}`;

    console.log('Fetching presigned URL for audio upload...', {
      fileUri,
      fileExt,
      contentType,
    });

    // 2. GET presigned URL from backend
    const presignedRes: any = await API.Instance.get(
      API.API_ROUTES.getPresignedUrl,
      {
        params: {
          type: 'audios',
          extn: fileExt,
          model: 'serviceRequest',
        },
      },
    );

    const payload = presignedRes?.data?.data || presignedRes?.data;
    const uploadUrl = payload?.upload_url;
    const fileUrl = payload?.file_url;

    if (!uploadUrl || !fileUrl) {
      throw new Error('Failed to obtain presigned upload URL from server');
    }

    // 3. PUT raw binary file directly to S3 using the presigned URL
    const cleanPath = fileUri.startsWith('file://')
      ? fileUri.replace('file://', '')
      : fileUri;

    // Use ReactNativeBlobUtil to stream the file to S3
    const ReactNativeBlobUtil = require('react-native-blob-util').default;
    const uploadRes = await ReactNativeBlobUtil.fetch(
      'PUT',
      uploadUrl,
      {
        'Content-Type': contentType,
      },
      ReactNativeBlobUtil.wrap(cleanPath),
    );

    const statusCode = uploadRes.info().status;
    console.log('AWS S3 audio upload status code:', statusCode);

    if (statusCode >= 200 && statusCode < 300) {
      console.log('✅ Audio uploaded to S3 successfully:', fileUrl);
      return { fileUrl, uploadUrl };
    } else {
      let respBody = '';
      try {
        respBody = await uploadRes.text();
      } catch (e) {}
      console.error('S3 upload error response body:', respBody);
      throw new Error(`AWS S3 upload failed with status ${statusCode}`);
    }
  } catch (error: any) {
    console.error('Audio upload to S3 failed:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      'Failed to upload audio recording';
    SHOW_TOAST(errorMessage, 'error');
    throw error;
  }
};

const PRESCRIPTION_MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  pdf: 'application/pdf',
};

/**
 * Upload Prescription Document (Image or PDF) to S3 using Presigned URL
 * 1. Calls GET /common/file/getPresignedUrl?type=images&extn=jpg&model=serviceRequest
 * 2. PUTs raw binary file directly to S3 upload_url
 * 3. Returns the public file_url (CloudFront/S3)
 */
export const uploadPrescriptionDirectToS3 = async (
  fileUri: string,
  extn?: string,
): Promise<{ fileUrl: string; uploadUrl?: string }> => {
  if (!fileUri) {
    SHOW_TOAST('Invalid prescription file', 'error');
    throw new Error('Invalid prescription file');
  }

  try {
    // 1. Detect file extension and matching MIME type
    const cleanUri = decodeURIComponent(fileUri.split('?')[0]);
    let detectedExt = extn ? extn.replace('.', '').toLowerCase() : '';
    if (!detectedExt) {
      if (cleanUri.toLowerCase().endsWith('.pdf') || cleanUri.toLowerCase().includes('.pdf')) {
        detectedExt = 'pdf';
      } else if (cleanUri.toLowerCase().endsWith('.png')) {
        detectedExt = 'png';
      } else if (cleanUri.toLowerCase().endsWith('.webp')) {
        detectedExt = 'webp';
      } else {
        const parts = cleanUri.split('.');
        if (parts.length > 1) {
          const possible = parts.pop()?.toLowerCase() || '';
          if (possible.length <= 5) detectedExt = possible;
        }
      }
    }
    const fileExt = detectedExt || 'jpg';
    const contentType =
      PRESCRIPTION_MIME_MAP[fileExt] ||
      (fileExt === 'pdf' ? 'application/pdf' : 'image/jpeg');

    const uploadType = fileExt === 'pdf' ? 'files' : 'images';

    console.log('Fetching presigned URL for prescription upload...', {
      fileUri,
      fileExt,
      contentType,
      uploadType,
    });

    // 2. GET presigned URL from backend
    const presignedRes: any = await API.Instance.get(
      API.API_ROUTES.getPresignedUrl,
      {
        params: {
          type: uploadType,
          extn: fileExt,
          model: 'serviceRequest',
        },
      },
    );
    console.log("presignedRes",presignedRes);
    

    const payload = presignedRes?.data?.data || presignedRes?.data;
    const uploadUrl = payload?.upload_url;
    const fileUrl = payload?.file_url;

    if (!uploadUrl || !fileUrl) {
      throw new Error('Failed to obtain presigned upload URL from server');
    }

    // 3. PUT raw binary file directly to S3 using the presigned URL
    let cleanPath = fileUri.startsWith('file://')
      ? fileUri.replace('file://', '')
      : fileUri;

    const ReactNativeBlobUtil = require('react-native-blob-util').default;

    // For Android content:// URIs, copy to a readable app cache file if needed
    if (Platform.OS === 'android' && fileUri.startsWith('content://')) {
      try {
        const tempCachePath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/prescription_${Date.now()}.${fileExt}`;
        await ReactNativeBlobUtil.fs.cp(fileUri, tempCachePath);
        cleanPath = tempCachePath;
      } catch (cpErr) {
        console.log('cp content URI to cache failed, using direct URI:', cpErr);
      }
    }

    const uploadRes = await ReactNativeBlobUtil.fetch(
      'PUT',
      uploadUrl,
      {
        'Content-Type': contentType,
      },
      ReactNativeBlobUtil.wrap(cleanPath),
    );

    const statusCode = uploadRes.info().status;
    console.log('AWS S3 prescription upload status code:', statusCode);

    if (statusCode >= 200 && statusCode < 300) {
      console.log('✅ Prescription uploaded to S3 successfully:', fileUrl);
      return { fileUrl, uploadUrl };
    } else {
      let respBody = '';
      try {
        respBody = await uploadRes.text();
      } catch (e) {}
      console.error('S3 prescription upload error body:', respBody);
      throw new Error(`AWS S3 upload failed with status ${statusCode}`);
    }
  } catch (error: any) {
    console.error('Prescription upload to S3 failed:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      'Failed to upload prescription document';
    SHOW_TOAST(errorMessage, 'error');
    throw error;
  }
};

