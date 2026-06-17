import axios from 'axios';
import { SHOW_SUCCESS_TOAST, SHOW_TOAST, Storage } from '../constant';
import { jwtDecode } from 'jwt-decode';
import { API } from '.';

// Types
interface TokenDetail {
  exp: number;
  [key: string]: any;
}

export function isTokenExpire(accessToken: string): boolean {
  try {
    const tokenDetail = jwtDecode<TokenDetail>(accessToken);
    let currentDate = new Date();
    if (tokenDetail.exp && tokenDetail.exp * 1000 < currentDate.getTime()) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return true;
  }
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<string | null> {
  try {
    // Show toast when attempting token refresh

    const params = {
      refreshToken: refreshToken,
    };
    const result = await axios.post(
      API.API_BASE_URL + API.API_ROUTES.getRefreshToken,
      params,
      {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer ' + refreshToken,
        },
      },
    );

    if (result.status == 200) {
      const refreshResponse = result?.data?.data; // 👈 new access token data
      if (!refreshResponse?.accessToken) return null;
      // SHOW_SUCCESS_TOAST('Session refreshed successfully');
      await Storage.save(Storage.USER_TOKEN, refreshResponse.accessToken);

      // If the backend also returns a new refresh token, save it too
      if (refreshResponse.refreshToken) {
        await Storage.save(Storage.REFRESH_TOKEN, refreshResponse.refreshToken);
      }

      return refreshResponse.accessToken;
    } else {
      return null;
    }
  } catch (error: any) {
    console.log('Token refresh failed:', error);
    return null;
  }
}
