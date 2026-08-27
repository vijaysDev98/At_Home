import { AppDispatch } from '../../redux/store';
import { setProfileData } from './profileSlice';
import { API } from '../../api';
import { SHOW_TOAST, Storage } from '../../constant';
import { setLoading } from '../common/commonSlice';

export const fetchProfile = () => async (dispatch: AppDispatch) => {
  try {
    // dispatch(setLoading(true));

    // As requested: "just pass token"
    const token = await Storage.get(Storage.USER_TOKEN);
    let data = {
      token: token,
    };

    const response: any = await API.Instance.get(
      API.API_ROUTES.getProfile,
      //   , {
      //   params: data,
      // }
    );

    if (response?.status && response?.code === 200) {
      dispatch(setProfileData(response?.data?.data ?? null));
    } else {
      SHOW_TOAST(response?.data?.message || response?.message, 'error');
    }
  } catch (e: any) {
    console.log('Fetch Profile Error', e);
    SHOW_TOAST(undefined, 'error');
  } finally {
    // dispatch(setLoading(false));
  }
};
export const updateProfile =
  (profileData: any, fromProvider = false) =>
  async (dispatch: AppDispatch) => {
    try {
      const {
        fName,
        lName,
        phoneNumber,
        specialty,
        providerName = '',
        facilityName,
        profileImg = '',
        businessAddress,
        practiceType,
        country,
      } = profileData;

      const [firstName = '', lastName = ''] = providerName.trim().split(' ');

      const payload = fromProvider
        ? {
            providerName,
            // fName: firstName,
            // lName: lastName,
            profileImg,
            phoneNumber,
            country: country,
          }
        : {
            fName,
            lName,
            phoneNumber,
            specialty,
            providerName,
            facilityName,
            profileImg,
            businessAddress,
            practiceType,
          };

      const response: any = await API.Instance.put(
        API.API_ROUTES.updateProfile,
        payload,
      );

      if (response?.status && response?.code === 200) {
        SHOW_TOAST(response?.data?.message || response?.message, 'success');

        dispatch(fetchProfile());
        return true;
      }

      SHOW_TOAST(response?.data?.message || response?.message, 'error');
      return false;
    } catch (e: any) {
      console.log('Update Profile Error', e);

      SHOW_TOAST(
        e?.response?.code === 400
          ? 'Validation error - RPPS and FINESS cannot be modified'
          : undefined,
        'error',
      );

      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };
