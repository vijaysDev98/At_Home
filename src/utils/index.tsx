import FONTS from "./fonts";
import COLORS from "./colors";

export { FONTS, COLORS };


export const REGEX = {
  PASSWORD_RE: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
  PHONE_RE: /^(?=.*[0-9]).{10,10}$/,
  ZIP_RE: /^(?=.*[0-9]).{5,8}$/,
  EMAIL_RE: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  CLEANED_EMAI: /(\.com)\1/,
  phoneRegex: /^\d+$/,
};