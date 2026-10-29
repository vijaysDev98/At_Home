import React from 'react';
import {
  Image,
  ImageResizeMode,
  ImageStyle,
  StyleProp,
} from 'react-native';
import FastImage, { ResizeMode } from 'react-native-fast-image';

type Props = {
  uri: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ResizeMode;
  onError?: () => void;
};

/** FastImage for remote URLs; RN Image for local file/content URIs (stable on iOS). */
export const ChatAttachmentImageView: React.FC<Props> = ({
  uri,
  style,
  resizeMode = FastImage.resizeMode.cover,
  onError,
}) => {
  const trimmed = uri?.trim() || '';
  if (!trimmed) {
    return null;
  }

  const isRemote = /^https?:\/\//i.test(trimmed);
  if (isRemote) {
    return (
      <FastImage
        source={{
          uri: trimmed,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        }}
        style={style}
        resizeMode={resizeMode}
        onError={onError}
      />
    );
  }

  const rnResize: ImageResizeMode =
    resizeMode === FastImage.resizeMode.contain ? 'contain' : 'cover';

  return (
    <Image
      source={{ uri: trimmed }}
      style={style}
      resizeMode={rnResize}
      onError={onError}
    />
  );
};
