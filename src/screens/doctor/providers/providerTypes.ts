export interface Provider {
  id: string;
  _id?: string;
  fName?: string;
  lName?: string;
  fullName?: string;
  providerName?: string;
  email?: string;
  phoneNumber?: string;
  specialty?: string;
  profileImg?: string;
  roles?: string[];
  status?: string;
  operatingDepartments?: string[];
  assignedServices?: string[];
  serviceDetails?: Array<{ serviceName?: string; name?: string } | string>;
}

export const providerForNavigation = (provider: Provider): Provider => ({
  id: provider.id || String(provider._id || ''),
  _id: provider._id,
  fName: provider.fName,
  lName: provider.lName,
  fullName: provider.fullName,
  providerName: provider.providerName,
  email: provider.email,
  phoneNumber: provider.phoneNumber,
  specialty: provider.specialty,
  profileImg: provider.profileImg,
  roles: provider.roles,
  status: provider.status,
  operatingDepartments: provider.operatingDepartments,
  assignedServices: provider.assignedServices,
  serviceDetails: provider.serviceDetails,
});
