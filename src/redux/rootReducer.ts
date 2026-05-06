import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../actions/auth/authSlice';
import profileReducer from '../actions/profile/profileSlice';
import commonReducer from '../actions/common/commonSlice';
import patientReducer from '../actions/patient/patientSlice';

const rootReducer = combineReducers({
  login: authReducer,
  profile: profileReducer,
  common: commonReducer,
  patient: patientReducer,
});

export default rootReducer;
