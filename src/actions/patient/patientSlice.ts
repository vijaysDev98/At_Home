import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PatientState {
  patients: any[];
  pagination: any;
  selectedPatient: any;
}

const initialState: PatientState = {
  patients: [],
  pagination: null,
  selectedPatient: null,
};

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    /**
     * Sets the initial list of patients and pagination metadata.
     * Used for the first page of results or after a search/refresh.
     */
    setPatients: (
      state,
      action: PayloadAction<{ patients: any[]; pagination: any }>,
    ) => {
      state.patients = action.payload.patients;
      state.pagination = action.payload.pagination;
    },

    /**
     * Appends a new set of patients to the existing list.
     * Used for infinite scrolling (onEndReached).
     */
    appendPatients: (
      state,
      action: PayloadAction<{ patients: any[]; pagination: any }>,
    ) => {
      state.patients = [...state.patients, ...action.payload.patients];
      state.pagination = action.payload.pagination;
    },

    /**
     * Stores the details of a single selected patient.
     * Used by the PatientDetail screen to display comprehensive information.
     */
    setSelectedPatient: (state, action: PayloadAction<any>) => {
      state.selectedPatient = action.payload;
    },

    /**
     * Finds and updates a specific patient in the list and selection state.
     * Ensures UI consistency after an 'Edit Patient' operation.
     */
    updatePatientInList: (state, action: PayloadAction<any>) => {
      const updatedPatient = action.payload;
      const index = state.patients.findIndex(
        p => p.id === updatedPatient.id || p._id === updatedPatient.id || p.id === updatedPatient._id
      );

      if (index !== -1) {
        state.patients[index] = { ...state.patients[index], ...updatedPatient };
      }

      if (state.selectedPatient && (state.selectedPatient.id === updatedPatient.id || state.selectedPatient._id === updatedPatient.id)) {
        state.selectedPatient = { ...state.selectedPatient, ...updatedPatient };
      }
    },

    /**
     * Prepends a newly created patient to the top of the list.
     * Ensures immediate visibility after an 'Add Patient' operation.
     */
    addPatientToList: (state, action: PayloadAction<any>) => {
      state.patients = [action.payload, ...state.patients];
    },

    /**
     * Resets the selected patient state.
     * Used when leaving the detail screen or before fetching a new patient.
     */
    clearSelectedPatient: (state) => {
      state.selectedPatient = null;
    },

    /**
     * Resets the entire patient state to initial state.
     * Used on logout and account deletion.
     */
    resetPatient: () => initialState,
  },
});

export const {
  setPatients,
  appendPatients,
  setSelectedPatient,
  updatePatientInList,
  addPatientToList,
  clearSelectedPatient,
  resetPatient,
} = patientSlice.actions;

export default patientSlice.reducer;
