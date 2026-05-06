import { API } from '../api';

export const getPatientsService = async (page: number, size: number, search: string) => {
  return await API.Instance.get(API.API_ROUTES.getPatients, {
    params: { page, size, search },
  });
};

export const getPatientDetailsService = async (id: string) => {
  return await API.Instance.get(`${API.API_ROUTES.getPatientDetails}/${id}`);
};

export const updatePatientService = async (id: string, data: any) => {
  return await API.Instance.put(`${API.API_ROUTES.addPatient}/${id}`, data);
};

