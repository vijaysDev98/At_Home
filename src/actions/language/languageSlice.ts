import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LanguageState {
  currentLanguage: string;
  isLoading: boolean;
}

const initialState: LanguageState = {
  currentLanguage: 'en',
  isLoading: false,
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.currentLanguage = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetLanguage: () => initialState,
  },
});

export const { setLanguage, setLoading, resetLanguage } = languageSlice.actions;
export default languageSlice.reducer;
