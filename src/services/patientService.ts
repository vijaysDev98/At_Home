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

export const getServicesService = async (
  page: number,
  size: number,
  serviceIDs?: string[],
) => {
  const params: any = { page, size };

  if (serviceIDs?.length) {
    params.serviceIds = serviceIDs.join(',');
  }

  return API.Instance.get(API.API_ROUTES.getServices, {
    params,
  });
};

export const getDoctorsService = async (
  page: number,
  size: number,
  search?: string,
  specialty?: string,
) => {
  const params: any = { page, size };

  if (search) {
    params.search = search;
  }

  if (specialty) {
    params.specialty = specialty;
  }

  return API.Instance.get(API.API_ROUTES.getDoctors, {
    params,
  });
};

export const getProvidersService = async (
  page: number,
  size: number,
  search?: string,
  lang?: string,
  serviceId?: string,
) => {
  const params: any = { page, size };

  if (search && search.trim()) {
    params.search = search.trim();
  }

  if (lang) {
    params.lang = lang;
  }

  if (serviceId) {
    params.serviceId = serviceId;
  }

  return API.Instance.get(API.API_ROUTES.getProviders, {
    params,
  });
};
