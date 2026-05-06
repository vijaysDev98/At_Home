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
