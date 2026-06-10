// ServiceFormRenderer.tsx

import React from 'react';

import CNOForm from './CNOForm';
import AntibiotherapyInfusionForm from './AntibiotherapyInfusionForm';
import ArtificialNutritionForm from './ArtificialNutritionForm';
import FreePrescriptionForm from './FreePrescriptionForm';
import MedicalOxygen from './MedicalOxygen';
import PcaForm from './PcaForm';
import PersonalHygieneCare from './PersonalHygieneCare';
import WoundCareForm from './WoundCareForm';
import HydrationInfusionForm from './HydrationInfusion';
import { STRING } from '../../../constant';

interface Props {
  serviceId: string;
  ref?: any;
  formRef?: any;
  initialData?: any;
  patient?: any;
  readOnly?: boolean;
}

const ServiceFormRenderer = ({
  serviceId,
  formRef,
  initialData,
  patient,
  readOnly = false,
}: Props) => {
  const commonProps = {
    ref: formRef,
    serviceId: serviceId || '',
    initialData,
    patient,
    readOnly,
  };

  switch (serviceId) {
    // CNO
    case '69ef3589d1c1c4252d4b8d45':
    case '69ef359fd1c1c4252d4b8d4d':
      return <CNOForm {...commonProps} />;

    // Antibiotherapy Infusion
    case '69ef359fd1c1c4252d4b8d4f':
      return <AntibiotherapyInfusionForm {...commonProps} />;

    // Artificial Nutrition
    case '69ef3557d1c1c4252d4b8d2c':
      return <ArtificialNutritionForm {...commonProps} />;

    // Free Prescription
    case '69eb112a056b86c571c1a44f':
      return <FreePrescriptionForm {...commonProps} />;

    // Hydration Infusion
    case '69ef3592d1c1c4252d4b8d4a':
      return <HydrationInfusionForm {...commonProps} />;

    // IV Therapy Prescription
    case '69ef353fd1c1c4252d4b8d22':
      return (
        <HydrationInfusionForm
          {...commonProps}
          title={STRING.ivTherapyPrescriptionForm}
        />
      );

    // Medical Oxygen
    case '69ef354cd1c1c4252d4b8d27':
      return <MedicalOxygen {...commonProps} />;

    // PCA Form
    case '69ef356cd1c1c4252d4b8d36':
      return <PcaForm {...commonProps} />;

    // Parenteral Nutrition
    case '69ef357cd1c1c4252d4b8d40':
      return (
        <HydrationInfusionForm
          {...commonProps}
          title={STRING.parenteralNutritionCentralLinePrescriptionForm}
        />
      );

    // Personal Hygiene Care
    case '69ef3563d1c1c4252d4b8d31':
      return <PersonalHygieneCare {...commonProps} />;

    // Wound Care
    case '69ef3534d1c1c4252d4b8d1d':
      return <WoundCareForm {...commonProps} />;

    // Pregnancy Related Care
    case '69ef3575d1c1c4252d4b8d3b':
      return (
        <HydrationInfusionForm
          {...commonProps}
          title={STRING.pregnancyRelatedCarePrescriptionForm}
        />
      );

    default:
      return null;
  }
};

export default ServiceFormRenderer;
