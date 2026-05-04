
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

      // 1️⃣ Get old stored user data
      const userDetails = await Storage.get(Storage.USER_DETAILS);
      const userData = JSON.parse(userDetails ?? '{}');
      if (!userData) return "";

      // 2️⃣ Replace access token only
      const updatedUserDetails = {
        ...userData,
        access_token: refreshResponse.access_token,
        access_token_expire: refreshResponse.access_token_expire,
      };
      // 3️⃣ Save back to AsyncStorage
      await Storage.save(Storage.USER_DETAILS, JSON.stringify(updatedUserDetails));
      return updatedUserDetails?.access_token;
    } else {
      return "";
    }
  } catch (error: any) {
    return "";
  }
}
