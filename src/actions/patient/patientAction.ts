import { SHOW_TOAST } from '../../constant';
import { AppDispatch, RootState } from '../../redux/store';
import { setLoading } from '../common/commonSlice';
import { API } from '../../api';
import NavigationService from '../../navigation/NavigationService';
import {
  getPatientDetailsService,
  getPatientsService,
  updatePatientService,
} from '../../services/patientService';
import {
  addPatientToList,
  appendPatients,
  setPatients,
  setSelectedPatient,
  updatePatientInList,
} from './patientSlice';

export const fetchPatients =
  (p: number = 1, s: string = '', f?: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const { patients } = getState().patient;
      // Only show loader on first page if list is empty
      if (p === 1 && patients.length === 0) dispatch(setLoading(true));
      const response: any = await getPatientsService(p, 10, s, f);
      console.log('patientssss', JSON.stringify(response));

      dispatch(setLoading(false));

      if (response?.status && response?.code === 200) {
        const { patients, pagination } = response.data.data;
        if (p === 1) {
          dispatch(setPatients({ patients, pagination }));
        } else {
          dispatch(appendPatients({ patients, pagination }));
        }
      } else {
        SHOW_TOAST(response?.message, 'error');
      }
    } catch (e: any) {
      dispatch(setLoading(false));
      console.log('Fetch Patients Error', e);
      SHOW_TOAST(e?.message, 'error');
    }
  };

export const fetchPatientDetails =
  (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const { selectedPatient } = getState().patient;
      // Only show loader if we don't have this patient or data is missing
      if (!selectedPatient || selectedPatient.id !== id) {
        dispatch(setLoading(true));
      }
      const response: any = await getPatientDetailsService(id);
      dispatch(setLoading(false));

      if (response?.status && response?.code === 200) {
        dispatch(setSelectedPatient(response.data.data));
      } else {
        SHOW_TOAST(response?.message, 'error');
      }
    } catch (e: any) {
      dispatch(setLoading(false));
      console.log('Fetch Patient Details Error', e);
      SHOW_TOAST(e?.message, 'error');
    }
  };

export const addPatient = (data: any) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const response: any = await API.Instance.post(
      API.API_ROUTES.addPatient,
      data,
    );
    dispatch(setLoading(false));

    if (response?.status && response?.code === 201) {
      SHOW_TOAST(
        response?.data?.message || 'Patient created successfully',
        'success',
      );
      if (response.data.data) {
        dispatch(addPatientToList(response.data.data));
      }
      NavigationService.goBack();
    } else if (response?.code === 400 || response?.code === 409) {
      console.log('add patient response error', response);

      SHOW_TOAST(response?.message || response?.data?.message, 'error');
    } else {
      SHOW_TOAST(response?.message || response?.data?.message, 'error');
    }
  } catch (e: any) {
    dispatch(setLoading(false));
    console.log('Add Patient Error', e);
    SHOW_TOAST(e?.message, 'error');
  }
};

export const updatePatient =
  (id: string, data: any) => async (dispatch: AppDispatch) => {
    try {
      console.log('dataaaaa', data);

      dispatch(setLoading(true));
      const response: any = await updatePatientService(id, data);
      dispatch(setLoading(false));

      if (response?.status && response?.code === 200) {
        SHOW_TOAST(
          response?.data?.message || 'Patient updated successfully',
          'success',
        );

        // Fetch latest patient details from API
        dispatch(setLoading(true));
        const detailsResponse: any = await getPatientDetailsService(id);
        dispatch(setLoading(false));

        if (detailsResponse?.status && detailsResponse?.code === 200) {
          const updatedPatient = detailsResponse.data.data;
          console.log('Updated patient from API:', updatedPatient);

          // Update both the patients list and selectedPatient with latest data
          dispatch(updatePatientInList(updatedPatient));
          dispatch(setSelectedPatient(updatedPatient));
        }

        NavigationService.goBack();
      } else if (response?.code === 400 || response?.code === 409) {
        SHOW_TOAST(response?.message || response?.data?.message, 'error');
      } else {
        SHOW_TOAST(response?.message || response?.data?.message, 'error');
      }
    } catch (e: any) {
      dispatch(setLoading(false));
      console.log('Update Patient Error', e);
      SHOW_TOAST(e?.message, 'error');
    }
  };
