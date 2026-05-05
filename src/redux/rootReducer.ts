import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../actions/auth/authSlice';
import profileReducer from '../actions/profile/profileSlice';

const rootReducer = combineReducers({
  login: authReducer,
  profile: profileReducer,
});

export default rootReducer;
