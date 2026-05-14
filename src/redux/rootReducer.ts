import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../actions/auth/authSlice';
import profileReducer from '../actions/profile/profileSlice';
import commonReducer from '../actions/common/commonSlice';
import patientReducer from '../actions/patient/patientSlice';

const appReducer = combineReducers({
  login: authReducer,
  profile: profileReducer,
  common: commonReducer,
  patient: patientReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'USER_LOGOUT') {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
