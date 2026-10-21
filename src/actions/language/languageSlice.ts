import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getDeviceLanguage } from '../../utils/deviceLanguage';

export interface LanguageState {
  currentLanguage: string;
  isLoading: boolean;
  isManualSelection: boolean;
}

const initialState: LanguageState = {
  currentLanguage: getDeviceLanguage(),
  isLoading: false,
  isManualSelection: false,
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.currentLanguage = action.payload;
    },
    setManualSelection: (state, action: PayloadAction<boolean>) => {
      state.isManualSelection = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetLanguage: () => ({
      currentLanguage: getDeviceLanguage(),
      isLoading: false,
      isManualSelection: false,
    }),
  },
});

export const { setLanguage, setManualSelection, setLoading, resetLanguage } =
  languageSlice.actions;
export default languageSlice.reducer;
