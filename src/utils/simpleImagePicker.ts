import { launchCamera, launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';

export interface SimpleImagePickerOptions {
  includeBase64?: boolean;
  saveToPhotos?: boolean;
  selectionLimit?: number;
  mediaType?: MediaType;
}

const defaultOptions = {
  selectionLimit: 1,
  mediaType: 'photo' as MediaType,
  includeBase64: true,
  saveToPhotos: false,
};

export const openGallery = (options: SimpleImagePickerOptions = {}, callback: (response: ImagePickerResponse) => void) => {
  const pickerOptions = { ...defaultOptions, ...options, mediaType: options.mediaType || 'photo' };
  launchImageLibrary(pickerOptions, callback);
};

export const openCamera = (options: SimpleImagePickerOptions = {}, callback: (response: ImagePickerResponse) => void) => {
  const pickerOptions = { ...defaultOptions, ...options, mediaType: options.mediaType || 'photo' };
  launchCamera(pickerOptions, callback);
};
