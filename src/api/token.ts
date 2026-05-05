
import axios from 'axios';
import { Storage } from '../constant';
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
  refresh_token: string,
): Promise<string | null> {
  try {
    const params = {
      refresh_token: refresh_token,
    }
    const result = await axios.post(API.API_BASE_URL + API.API_ROUTES.getRefreshToken, params, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + refresh_token,
      }
    });
    if (result.status) {

      const refreshResponse = result?.data?.data; // 👈 new access token data
      if (!refreshResponse?.access_token) return "";

      await Storage.save(Storage.USER_TOKEN, refreshResponse.access_token);
      
      // If the backend also returns a new refresh token, save it too
      if (refreshResponse.refresh_token) {
        await Storage.save(Storage.REFRESH_TOKEN, refreshResponse.refresh_token);
      }
      
      return refreshResponse.access_token;
    } else {
      return "";
    }
  } catch (error: any) {
    return "";
  }
}
