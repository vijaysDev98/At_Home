import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import {
  AppBottomSheet,
  AppLoader,
  AppSafeAreaView,
  Header,
  Input,
  PrimaryButton,
} from '../../../components';

import { ImagePickerContent } from '../../../components/ImagePickerContent';

import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';

import { RootState, AppDispatch } from '../../../redux/store';
import { updateProfile } from '../../../actions/profile/profileAction';

import { useSimpleImagePicker } from '../../../hooks/useSimpleImagePicker';
import { uploadImageToS3 } from '../../../services/uploadService';

import { IMAGE_BASE_URL } from '../../../api/apiRoutes';
import { SHOW_TOAST, STRING } from '../../../constant';
import { useTranslation } from 'react-i18next';

const EditProviderProfile: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const { isLoading } = useSelector((state: RootState) => state.common);

  const profileData = useSelector(
    (state: RootState) => state.profile.profileData,
  );

  const [providerName, setProviderName] = useState(
    profileData?.providerName || '',
  );
  const [phoneNumber, setPhoneNumber] = useState(
    profileData?.phoneNumber || '',
  );
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    profileData?.country?.length && profileData?.country?.length > 3
      ? profileData?.country?.slice(0, 2).toUpperCase()
      : profileData?.country || 'US',
  );

  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});

  const [userAvatar, setUserAvatar] = useState<string | null>(
    profileData?.profileImg || null,
  );

  const [pendingImage, setPendingImage] = useState<{
    uri: string;
    type: string;
    fileName: string;
  } | null>(null);

  const [hasImageChanged, setHasImageChanged] = useState(false);

  const imagePickerSheetRef = useRef<any>(null);

  const { onImageGalleryClick, onCameraPress } = useSimpleImagePicker({
    onImageSelected: async (uri: string, type: string, fileName: string) => {
      setUserAvatar(uri);
      setPendingImage({
        uri,
        type,
        fileName,
      });
      setHasImageChanged(true);
    },
    onError: (error: string) => {
      SHOW_TOAST(error, 'error');
    },
  });

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!providerName.trim()) {
      newErrors.providerName = t(STRING.providerNameRequired);
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return !!providerName.trim();
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    let profileImageUrl = profileData?.profileImg || '';

    if (hasImageChanged && pendingImage) {
      try {
        const uploadResponse = await uploadImageToS3(
          pendingImage.uri,
          pendingImage.type,
          pendingImage.fileName,
        );

        profileImageUrl = uploadResponse.data.filePath;
      } catch (error) {
        return;
      }
    }

    const payload = {
      providerName: providerName.trim(),
      profileImg: profileImageUrl,
      country: selectedCountryCode,
      phoneNumber: phoneNumber.trim(),
    };

    const isSuccess = await dispatch(updateProfile(payload, true));

    if (isSuccess) {
      navigation.goBack();
    }
  };

  return (
    <AppSafeAreaView style={styles.container}>
      <AppLoader visible={isLoading} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? undefined : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Header
            style={{
              marginHorizontal: getScaleSize(16),
              marginBottom: getScaleSize(10),
            }}
            isBack={true}
            title={t(STRING.editProfile)}
            subTitle={t(STRING.updateProviderProfileDetails)}
          />

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image
                source={
                  userAvatar
                    ? userAvatar.startsWith('file://') ||
                      userAvatar.startsWith('content://') ||
                      userAvatar.startsWith('data:')
                      ? { uri: userAvatar }
                      : { uri: IMAGE_BASE_URL + userAvatar }
                    : IMAGES.person
                }
                style={[
                  styles.avatar,
                  ...(!userAvatar ? [{ resizeMode: 'center' }] : []),
                ]}
              />
              <TouchableOpacity
                style={styles.cameraBtn}
                activeOpacity={0.8}
                onPress={() => imagePickerSheetRef.current?.show()}
              >
                <Image source={IMAGES.ic_edit} style={styles.cameraIcon} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Provider Name */}
          <Input
            label={t(STRING.providerName)}
            isMandatory
            placeholder={t(STRING.enterProviderName)}
            value={providerName}
            leftIcon={IMAGES.person}
            error={errors.providerName}
            style={{
              marginBottom: getScaleSize(errors.providerName ? 4 : 20),
            }}
            onChangeText={(text: string) => {
              setProviderName(text);

              setErrors(prev => ({
                ...prev,
                providerName: '',
              }));
            }}
          />

          <Input
            label={t(STRING.phoneNumber)}
            isMandatory
            placeholder={t(STRING.enterPhoneNumber)}
            value={phoneNumber}
            keyboardType="number-pad"
            isCountryCode
            countryCode={selectedCountryCode}
            onCountryCodeSelect={(code: string) => setSelectedCountryCode(code)}
            leftIcon={IMAGES.phone}
            error={errors.phoneNumber}
            style={{
              marginBottom: getScaleSize(errors.phoneNumber ? 4 : 20),
            }}
            onChangeText={(text: string) => {
              setPhoneNumber(text);

              setErrors(prev => ({
                ...prev,
                phoneNumber: '',
              }));
            }}
          />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.cancelBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelText}>{t(STRING.cancel)}</Text>
            </TouchableOpacity>

            <PrimaryButton
              title={t(STRING.saveChanges)}
              onPress={handleSubmit}
              disabled={!isFormValid()}
              style={styles.saveBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      <AppBottomSheet ref={imagePickerSheetRef}>
        <ImagePickerContent
          onCameraPress={onCameraPress}
          onGalleryPress={onImageGalleryClick}
          onHide={() => imagePickerSheetRef.current?.hide()}
        />
      </AppBottomSheet>
    </AppSafeAreaView>
  );
};

export default EditProviderProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },

  scrollContent: {
    paddingBottom: getScaleSize(120),
  },

  header: {
    paddingHorizontal: getScaleSize(24),
    marginBottom: getScaleSize(32),
  },

  title: {
    fontSize: getScaleSize(20),
    fontFamily: FONTS.Inter.Bold,
    color: COLORS.slate900,
    marginTop: getScaleSize(8),
  },

  subtitle: {
    fontSize: getScaleSize(14),
    fontFamily: FONTS.Inter.Regular,
    color: COLORS.slate700,
    marginTop: getScaleSize(4),
  },

  avatarSection: {
    alignItems: 'center',
    marginBottom: getScaleSize(32),
  },

  avatarWrapper: {
    width: getScaleSize(110),
    height: getScaleSize(110),
    borderRadius: getScaleSize(55),
    backgroundColor: COLORS.slate200,
    borderWidth: 4,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: getScaleSize(55),
  },

  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: getScaleSize(34),
    height: getScaleSize(34),
    borderRadius: getScaleSize(17),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  cameraIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
    tintColor: COLORS.white,
  },

  avatarTip: {
    marginTop: getScaleSize(12),
    fontSize: getScaleSize(12),
    fontFamily: FONTS.Inter.Medium,
    color: COLORS.slate400,
  },

  footer: {
    paddingTop: getScaleSize(16),
    paddingBottom: getScaleSize(16),
    paddingHorizontal: getScaleSize(24),
    backgroundColor: COLORS._F9FAFB,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
  },

  cancelBtn: {
    flex: 1,
    height: getScaleSize(56),
    borderRadius: getScaleSize(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.slate200,
  },

  cancelText: {
    fontSize: getScaleSize(16),
    fontFamily: FONTS.Inter.SemiBold,
    color: COLORS.slate600,
  },

  saveBtn: {
    flex: 2,
  },
});
