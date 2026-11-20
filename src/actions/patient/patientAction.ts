import { SHOW_TOAST } from '../../constant';
import { Storage } from '../../constant/storage';
import { AppDispatch } from '../../redux/store';
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
  setLastProcessedPatient,
} from './patientSlice';

export const saveLastProcessedPatient =
  (patient: { id: string; name: string }) => async (dispatch: AppDispatch) => {
    try {
      if (!patient?.id) return;
      const data = {
        id: patient.id,
        name: patient.name || '',
        timestamp: Date.now(),
      };
      await Storage.save(Storage.LAST_VIEWED_PATIENT, JSON.stringify(data));
      dispatch(setLastProcessedPatient(data));
    } catch (e) {
      console.log('Error saving last processed patient:', e);
    }
  };

export const loadLastProcessedPatient = () => async (dispatch: AppDispatch) => {
  try {
    const raw = await Storage.get(Storage.LAST_VIEWED_PATIENT);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id) {
        dispatch(setLastProcessedPatient(parsed));
        return parsed;
      }
    }
  } catch (e) {
    console.log('Error loading last processed patient:', e);
  }
  return null;
};

export const fetchPatients =
  (p: number = 1, s: string = '', f?: string) =>
  async (dispatch: AppDispatch) => {
    try {
      const response: any = await getPatientsService(p, 10, s, f);

      if (response?.status && response?.code === 200) {
        const { patients, pagination } = response.data.data;
        if (p === 1) {
          dispatch(setPatients({ patients, pagination }));
        } else {
          dispatch(appendPatients({ patients, pagination }));
        }
      } else {
        SHOW_TOAST(response?.data?.message || response?.message, 'error');
      }
    } catch (e: any) {
      console.log('Fetch Patients Error', e);
      SHOW_TOAST(e?.message, 'error');
    }
  };

export const fetchPatientDetails =
  (id: string) => async (dispatch: AppDispatch) => {
    try {
      const response: any = await getPatientDetailsService(id);

      if (response?.status && response?.code === 200) {
        const patientData = response.data.data;
        dispatch(setSelectedPatient(patientData));
        if (patientData?.id || patientData?._id) {
          const patientName = `${patientData.fName || ''} ${patientData.lName || ''}`.trim() || patientData.name || '';
          dispatch(
            saveLastProcessedPatient({
              id: String(patientData.id || patientData._id),
              name: patientName,
            }),
          );
        }
      } else {
        SHOW_TOAST(response?.data?.message || response?.message, 'error');
      }
    } catch (e: any) {
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
        const newPatient = response.data.data;
        dispatch(addPatientToList(newPatient));
        if (newPatient?.id || newPatient?._id) {
          const patientName = `${newPatient.fName || ''} ${newPatient.lName || ''}`.trim() || newPatient.name || '';
          dispatch(
            saveLastProcessedPatient({
              id: String(newPatient.id || newPatient._id),
              name: patientName,
            }),
          );
        }
      }
      NavigationService.goBack();
    } else if (response?.code === 400 || response?.code === 409) {
      console.log('add patient response error', response);

      SHOW_TOAST(
        response?.data?.message || response?.message || response?.data?.message,
        'error',
      );
    } else {
      SHOW_TOAST(
        response?.data?.message || response?.message || response?.data?.message,
        'error',
      );
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
      console.log('dataaaaa', id, data);

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
          if (updatedPatient?.id || updatedPatient?._id) {
            const patientName = `${updatedPatient.fName || ''} ${updatedPatient.lName || ''}`.trim() || updatedPatient.name || '';
            dispatch(
              saveLastProcessedPatient({
                id: String(updatedPatient.id || updatedPatient._id),
                name: patientName,
              }),
            );
          }
        }

        NavigationService.goBack();
      } else if (response?.code === 400 || response?.code === 409) {
        SHOW_TOAST(
          response?.data?.message ||
            response?.message ||
            response?.data?.message,
          'error',
        );
      } else {
        SHOW_TOAST(
          response?.data?.message ||
            response?.message ||
            response?.data?.message,
          'error',
        );
      }
    } catch (e: any) {
      dispatch(setLoading(false));
      console.log('Update Patient Error', e);
      SHOW_TOAST(e?.message, 'error');
    }
  };
