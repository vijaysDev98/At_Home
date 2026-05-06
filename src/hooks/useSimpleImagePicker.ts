import { useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { ImagePickerResponse } from 'react-native-image-picker';
import { openGallery, openCamera } from '../utils/simpleImagePicker';

interface UseSimpleImagePickerOptions {
  onImageSelected?: (uri: string, type: string, fileName: string) => void;
  onError?: (error: string) => void;
}

export const useSimpleImagePicker = (options: UseSimpleImagePickerOptions = {}) => {
  const onImageGalleryClick = useCallback(() => {
    const pickerOptions = {
      selectionLimit: 1,
      mediaType: 'photo' as const,
      includeBase64: true
    };

    openGallery(pickerOptions, (res: ImagePickerResponse) => {
      if (res.didCancel) {
        console.log('User cancelled');
      } else if (res.errorCode) {
        console.log('ImagePickerError: ', res.errorMessage);
        options.onError?.(res.errorMessage || 'Gallery error');
      } else {
        console.log('response from image' ,res );
        const asset = res.assets?.[0];
        if (asset?.base64 && asset.type) {
          options.onImageSelected?.(asset.uri , asset.type, asset.fileName);
        }
      }
    });
  }, [options.onImageSelected, options.onError]);

  const onCameraPress = useCallback(() => {
    const pickerOptions = {
      saveToPhotos: false,
      mediaType: 'photo' as const,
      includeBase64: true,
    };
    
    openCamera(pickerOptions, (res: ImagePickerResponse) => {
      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.errorCode) {
        console.log('ImagePicker Error: ', res.errorMessage);
        options.onError?.(res.errorMessage || 'Camera error');
      } else {
        const asset = res.assets?.[0];
        if (asset?.uri && asset.type) {
          options.onImageSelected?.(asset.uri, asset.type, asset.fileName || `camera_${Date.now()}.jpg`);
        }
      }
    });
  }, [options.onImageSelected, options.onError]);

  const showImagePickerOptions = useCallback(() => {
    // This will be handled by the ImagePickerSheet component
    // The component will be shown from the screen that uses this hook
  }, [onCameraPress, onImageGalleryClick]);

  return {
    onImageGalleryClick,
    onCameraPress,
    showImagePickerOptions,
  };
};
