import { AppDispatch } from '../../redux/store';
import { setProfileData } from './profileSlice';
import { API } from '../../api';
import { SHOW_TOAST, Storage } from '../../constant';
import { setLoading } from '../common/commonSlice';

export const fetchProfile = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));

    // As requested: "just pass token"
    const token = await Storage.get(Storage.USER_TOKEN);
    let data = {
      token: token,
    };

    const response: any = await API.Instance.get(API.API_ROUTES.getProfile, {
      params: data,
    });
    console.log('fetch profile response', JSON.stringify(response));

    if (response?.status && response?.code === 200) {
      dispatch(setProfileData(response?.data?.data ?? null));
    } else {
      SHOW_TOAST(
        response?.data?.message ||
          response?.message ||
          'Failed to fetch profile',
        'error',
      );
    }
  } catch (e: any) {
    console.log('Fetch Profile Error', e);
    SHOW_TOAST('Something went wrong while fetching profile', 'error');
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateProfile =
  (profileData: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      console.log('profileData for upload', profileData);

      let data = {
        fullName: profileData.fullName,
        specialty: profileData.specialty,
        profileImg: profileData.profileImg || '',
        businessAddress: profileData.businessAddress,
        practiceType: profileData.practiceType,
      };

      const response: any = await API.Instance.put(
        API.API_ROUTES.updateProfile,
        data,
      );
      console.log('update profile response', JSON.stringify(response));

      if (response?.status && response?.code === 200) {
        SHOW_TOAST('Profile updated successfully', 'success');
        // Refetch profile to get updated data
        dispatch(fetchProfile());
        return true;
      } else if (response?.code === 400) {
        SHOW_TOAST(response.message, 'error');
      } else {
        SHOW_TOAST(response?.message || 'Failed to update profile', 'error');
      }
      return false;
    } catch (e: any) {
      console.log('Update Profile Error', e);
      if (e.response?.code === 400) {
        SHOW_TOAST(
          'Validation error - RPPS and FINESS cannot be modified',
          'error',
        );
      } else {
        SHOW_TOAST('Something went wrong while updating profile', 'error');
      }
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };
