import { API } from '../api';

export const getPatientsService = async (
  page: number,
  size: number,
  search: string,
  filter?: string,
) => {
  const params: any = { page, size, search };
  if (filter) {
    params.filter = filter;
  }
  return await API.Instance.get(API.API_ROUTES.getPatients, {
    params,
  });
};

export const getPatientDetailsService = async (id: string) => {
  return await API.Instance.get(`${API.API_ROUTES.getPatientDetails}/${id}`);
};

export const updatePatientService = async (id: string, data: any) => {
  return await API.Instance.put(`${API.API_ROUTES.addPatient}/${id}`, data);
};

export const getServicesService = async (page: number, size: number) => {
  return await API.Instance.get(API.API_ROUTES.getServices, {
    params: { page, size },
  });
};
