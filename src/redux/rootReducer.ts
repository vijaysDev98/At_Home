import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../actions/auth/authSlice';

const rootReducer = combineReducers({
login:authReducer,

});

export default rootReducer;
