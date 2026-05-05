import { AppDispatch } from '../../redux/store';
import { setProfileLoading, setProfileData } from './profileSlice';
import { API } from '../../api';
import { SHOW_TOAST, Storage } from '../../constant';

export const fetchProfile = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setProfileLoading(true));
    
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
      SHOW_TOAST(response?.data?.message || response?.message || 'Failed to fetch profile', 'error');
    }
  } catch (e: any) {
    console.log('Fetch Profile Error', e);
    SHOW_TOAST('Something went wrong while fetching profile', 'error');
  } finally {
    dispatch(setProfileLoading(false));
  }
};
