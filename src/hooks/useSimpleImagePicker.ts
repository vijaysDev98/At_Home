import { useCallback } from 'react';
import { ImagePickerResponse } from 'react-native-image-picker';
import { openGallery, openCamera } from '../utils/simpleImagePicker';

interface UseSimpleImagePickerOptions {
  onImageSelected?: (
    uri: string,
    type: string,
    fileName: string,
  ) => void;
  onError?: (error: string) => void;
}

export const useSimpleImagePicker = (
  options: UseSimpleImagePickerOptions = {},
) => {
  const onImageGalleryClick = useCallback(() => {
    const pickerOptions = {
      selectionLimit: 1,
      mediaType: 'photo' as const,
    };

    try {
      openGallery(pickerOptions, (res: ImagePickerResponse) => {
        console.log('Gallery Response:', JSON.stringify(res));

        if (res.didCancel) {
          console.log('Gallery cancelled');
          return;
        }

        if (res.errorCode) {
          console.log('Gallery Error:', res.errorMessage);
          options.onError?.(res.errorMessage || 'Gallery error');
          return;
        }

        const asset = res.assets?.[0];

        if (!asset) {
          options.onError?.('No image selected');
          return;
        }

        console.log('Selected Gallery Asset:', asset);

        if (asset.uri && asset.type) {
          options.onImageSelected?.(
            asset.uri,
            asset.type,
            asset.fileName || `gallery_${Date.now()}.jpg`,
          );
        } else {
          options.onError?.('Invalid image data');
        }
      });
    } catch (error: any) {
      console.log('Gallery Picker Crash:', error);
      options.onError?.(error?.message || 'Gallery error');
    }
  }, [options]);

  const onCameraPress = useCallback(() => {
    const pickerOptions = {
      saveToPhotos: false,
      mediaType: 'photo' as const,
    };

    try {
      openCamera(pickerOptions, (res: ImagePickerResponse) => {
        console.log('Camera Response:', JSON.stringify(res));

        if (res.didCancel) {
          console.log('Camera cancelled');
          return;
        }

        if (res.errorCode) {
          console.log('Camera Error:', res.errorMessage);
          options.onError?.(res.errorMessage || 'Camera error');
          return;
        }

        const asset = res.assets?.[0];

        if (!asset) {
          options.onError?.('No image captured');
          return;
        }

        console.log('Captured Camera Asset:', asset);

        if (asset.uri && asset.type) {
          options.onImageSelected?.(
            asset.uri,
            asset.type,
            asset.fileName || `camera_${Date.now()}.jpg`,
          );
        } else {
          options.onError?.('Invalid image data');
        }
      });
    } catch (error: any) {
      console.log('Camera Picker Crash:', error);
      options.onError?.(error?.message || 'Camera error');
    }
  }, [options]);

  const showImagePickerOptions = useCallback(() => {
    // handled by ImagePickerSheet component
  }, []);

  return {
    onImageGalleryClick,
    onCameraPress,
    showImagePickerOptions,
  };
};