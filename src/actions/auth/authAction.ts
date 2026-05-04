import { Platform } from "react-native";
import { SHOW_TOAST, Storage } from "../../constant";
import { AppDispatch } from "../../redux/store";
import { setLoading } from "./authSlice";
import { API } from "../../api";

export const userLogin =
  (data: any) => async (dispatch: AppDispatch) => {
    try {
      data['fcm_token'] =
        (await Storage.get(Storage.FCM_TOKEN_KEY)) ?? 'no token found';
      dispatch(setLoading(true));
      const response: any = await API.Instance.post(API.API_ROUTES.login, data);

      if (response?.success) {
        await Storage.save(
          Storage.USER_TOKEN,
          response?.data?.access_token,
        );
        // dispatch(getUserProfile());
      } else {
        SHOW_TOAST(response?.message || 'Something went wrong', 'error');
      }
    } catch (e) {
     console.log("login Error",e)
      SHOW_TOAST('Something went wrong', 'error');
      dispatch(setLoading(false));
    }
  };