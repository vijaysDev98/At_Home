import React, { useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { ActionSheetRef } from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

import {
  AppText,
  Input,
  WarningSheet,
  FormPatientSection,
  FormPrescriberSection,
  FormFacilitySection,
  AppCheckBox,
} from '../../../components';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { STRING } from '../../../constant';
import { IMAGES } from '../../../assets/images';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';
import FormSignature from '../../../components/FormSignature';

export interface CNOFormProps {
  onSubmit?: (data: any) => void;
  serviceId?: string;
}

const CNOForm = forwardRef<any, CNOFormProps>(({
  onSubmit,
  serviceId,
}, ref) => {
  const selectedPatient = useSelector(
    (state: RootState) => state.patient.selectedPatient,
  );
  const profileData = useSelector(
    (state: RootState) => state.profile.profileData,
  );

  console.log("selectedPatient", selectedPatient);


  const warningSheetRef = useRef<ActionSheetRef>(null);
  const scrollRef = useRef<ScrollView>(null);
  const productPositions = useRef<{ [index: number]: number }>({}).current;
  const lastFirstErrorKey = useRef<string | null>(null);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [pickerType, setPickerType] = useState<{
    type: string;
    index?: number;
  } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [state, setState] = useState({
    // Prescription Context
    prescription_place: '',
    prescription_date: moment().format('DD/MM/YYYY'),
    prescription_type: '', // 'outside_ald' or 'ald'

    // Patient
    patient_last_name: selectedPatient?.lastName || '',
    patient_first_name: selectedPatient?.fullName || '',
    dob: moment(selectedPatient?.dateOfBirth).format('DD/MM/YYYY'),
    weight: '',
    nir: '',
    ald_condition: false,

    // Patient Condition
    patient_age: '',
    patient_weight_confirm: '',

    // Prescriber
    prescriber_last_name: profileData?.fullName?.split(' ').slice(-1)[0] || '',
    prescriber_first_name: profileData?.fullName?.split(' ')[0] || '',
    prescriber_phone: profileData?.phoneNumber || '',
    rpps_id: profileData?.rppsNumber || '',

    // Facility
    hospital_name: profileData?.businessAddress || '',
    hospital_address: '',
    finess_number: profileData?.finessNumber || '',

    // Nutrition Products (repeatable)
    nutrition_products: [
      { category: '', product_type: '', quantity_per_day: '' },
      { category: '', product_type: '', quantity_per_day: '' },
      { category: '', product_type: '', quantity_per_day: '' },
    ],

    // Other Nutrition
    other_nutrition: '',

    // Instructions
    texture: '',

    // Reassessment
    reassessment_after_month: '1',
    renewal_months: '',
    reassessment_criteria: [] as string[],

    // Signature
    physician_signature: '',
  });

  // Wrapper setter that clears errors immediately on any change
  const setFormState = (updaterOrPartial: any): void => {
    if (typeof updaterOrPartial === 'function') {
      setState(prev => {
        const next = updaterOrPartial(prev);
        try {
          const changedKeys = Object.keys(next).filter(k => (prev as any)[k] !== (next as any)[k]);
          if (changedKeys.length) {
            setErrors(prevErrs => {
              const ne = { ...prevErrs } as any;
              changedKeys.forEach(k => {
                if (ne[k]) delete ne[k];
                // Map snake_case to camelCase for error clearing
                if (k === 'patient_first_name' && ne.patientFirstName) delete ne.patientFirstName;
                if (k === 'patient_last_name' && ne.patientLastName) delete ne.patientLastName;
                if (k === 'prescription_date' && ne.prescriptionDate) delete ne.prescriptionDate;
                if (k === 'patient_age' && ne.patient_age) delete ne.patient_age;
                if (k === 'patient_weight_confirm' && ne.patient_weight_confirm) delete ne.patient_weight_confirm;
                if (k === 'reassessment_after_month' && ne.reassessment_after_month) delete ne.reassessment_after_month;
                if (k === 'renewal_months' && ne.renewal_months) delete ne.renewal_months;
              });
              return ne;
            });
          }
        } catch { }
        return next;
      });
    } else {
      const partial = updaterOrPartial || {};
      setState(prev => {
        const next = { ...prev, ...partial } as any;
        const changedKeys = Object.keys(partial);
        if (changedKeys.length) {
          setErrors(prevErrs => {
            const ne = { ...prevErrs } as any;
            changedKeys.forEach(k => {
              if (ne[k]) delete ne[k];
              // Map snake_case to camelCase for error clearing
              if (k === 'patient_first_name' && ne.patientFirstName) delete ne.patientFirstName;
              if (k === 'patient_last_name' && ne.patientLastName) delete ne.patientLastName;
              if (k === 'prescription_date' && ne.prescriptionDate) delete ne.prescriptionDate;
              if (k === 'patient_age' && ne.patient_age) delete ne.patient_age;
              if (k === 'patient_weight_confirm' && ne.patient_weight_confirm) delete ne.patient_weight_confirm;
              if (k === 'reassessment_after_month' && ne.reassessment_after_month) delete ne.reassessment_after_month;
              if (k === 'renewal_months' && ne.renewal_months) delete ne.renewal_months;
            });
            return ne;
          });
        }
        return next;
      });
    }
  };

  const updateProduct = (index: number, field: string, value: any) => {
    setState(prev => ({
      ...prev,
      nutrition_products: prev.nutrition_products.map((product, i) =>
        i === index ? { ...product, [field]: value } : product,
      ),
    }));
    // Clear error immediately when user starts typing
    const errKey = `nutrition_products[${index}].${field}`;
    if (errors[errKey]) {
      setErrors(prev => {
        const ne = { ...prev } as any;
        delete ne[errKey];
        return ne;
      });
    }
  };

  const checkedBoxesCount = useMemo(() => {
    return state.reassessment_criteria.length;
  }, [state]);

  // Validation function (aligned with schema required fields)
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Patient Information - Required fields
    if (!state.patient_last_name.trim()) {
      newErrors.patientLastName = 'Last name is required';
    }
    if (!state.patient_first_name.trim()) {
      newErrors.patientFirstName = 'First name is required';
    }

    // Prescription Context - Required fields
    if (!state.prescription_date) {
      newErrors.prescriptionDate = 'Prescription date is required';
    }

    // Nutrition Products validation - at least 1 product must be filled
    const filledProducts = state.nutrition_products.filter(p => p.product_type.trim().length > 0);
    if (filledProducts.length === 0) {
      newErrors.nutrition_products = 'At least one nutrition product must be selected';
    }

    // Validate numeric fields for filled products
    state.nutrition_products.forEach((product, index) => {
      if (product.product_type.trim()) {
        const val = product.quantity_per_day;
        if (val !== '' && val !== undefined && val !== null && isNaN(Number(val))) {
          newErrors[`nutrition_products[${index}].quantity_per_day`] = 'Quantity must be a number';
        }
      }
    });

    // Patient Condition - Numeric validation
    if (state.patient_age !== '' && isNaN(Number(state.patient_age))) {
      newErrors.patient_age = 'Age must be a number';
    }
    if (state.patient_weight_confirm !== '' && isNaN(Number(state.patient_weight_confirm))) {
      newErrors.patient_weight_confirm = 'Weight must be a number';
    }

    // Reassessment - Numeric validation
    if (state.reassessment_after_month !== '' && isNaN(Number(state.reassessment_after_month))) {
      newErrors.reassessment_after_month = 'Must be a number';
    }
    if (state.renewal_months !== '' && isNaN(Number(state.renewal_months))) {
      newErrors.renewal_months = 'Must be a number';
    }

    setErrors(newErrors);
    lastFirstErrorKey.current = Object.keys(newErrors)[0] || null;
    return Object.keys(newErrors).length === 0;
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    validateAndSubmit: () => {
      const ok = validateForm();
      if (!ok) {
        Alert.alert('Validation Error', 'Please fill in all required fields');
        const key = lastFirstErrorKey.current || '';
        const match = key.match(/nutrition_products\[(\d+)\]/);
        if (match) {
          const idx = Number(match[1]);
          const y = productPositions[idx] ?? 0;
          setTimeout(() => {
            scrollRef.current?.scrollTo({ y: Math.max(y - 20, 0), animated: true });
          }, 50);
        } else {
          setTimeout(() => {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          }, 50);
        }
      }
      return ok;
    },
    getFormData: () => state,
  }));

  const renderSectionHeader = (title: string, icon?: any) => (
    <View style={styles.sectionHeader}>
      <AppText
        size={getScaleSize(15)}
        font={FONTS.Inter.Bold}
        color={COLORS._1A1D1F}
      >
        {title}
      </AppText>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerTextContainer}>
          <AppText
            size={getScaleSize(16)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            {STRING.cnoForm}
          </AppText>
        </View>

        {/* PRESCRIPTION DETAILS */}
        <FormPrescriptionDetails
          state={state}
          setState={(updates: any) => {
            const mapped: any = {};
            if ('prescriptionDate' in updates) mapped.prescription_date = updates.prescriptionDate;
            if ('therapyType' in updates) mapped.prescription_type = updates.therapyType;
            setFormState(mapped);
          }}
          errors={errors}
        />

        {/* PATIENT INFORMATION */}
        <FormPatientSection
          state={state}
          setState={(updates) => {
            setFormState(updates);
          }}
          errors={errors}
        />

        {/* PRESCRIBER IDENTIFICATION */}
        <FormPrescriberSection
          state={state}
          setState={(updates) => {
            const mapped: any = {};
            if ('prescriberLastName' in updates) mapped.prescriber_last_name = updates.prescriberLastName;
            if ('prescriberFirstName' in updates) mapped.prescriber_first_name = updates.prescriberFirstName;
            if ('prescriberPhone' in updates) mapped.prescriber_phone = updates.prescriberPhone;
            if ('prescriberRPPS' in updates) mapped.rpps_id = updates.prescriberRPPS;
            setFormState(mapped);
          }}
        />

        {/* FACILITY INFORMATION */}
        <FormFacilitySection
          state={state}
          setState={(updates) => {
            const mapped: any = {};
            if ('hospitalName' in updates) mapped.hospital_name = updates.hospitalName;
            if ('hospitalAddress' in updates) mapped.hospital_address = updates.hospitalAddress;
            if ('finessNo' in updates) mapped.finess_number = updates.finessNo;
            setFormState(mapped);
          }}
        />

        {/* PATIENT CONDITION */}
        <View style={styles.card}>
          {renderSectionHeader('Patient Condition')}
          <View style={styles.row}>
            <Input
              label="Age"
              value={state.patient_age}
              onChangeText={(value) => setFormState({ patient_age: value })}
              placeholder="Years"
              style={styles.rowInput}
              keyboardType="numeric"
            />
            <Input
              label="Weight (kg)"
              value={state.patient_weight_confirm}
              onChangeText={(value) => setFormState({ patient_weight_confirm: value })}
              placeholder="kg"
              style={styles.rowInput}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* NUTRITION PRODUCTS */}
        <AppText
          size={getScaleSize(15)}
          font={FONTS.Inter.Bold}
        >
          Nutrition Products
        </AppText>
        {errors.nutrition_products && (
          <View style={styles.productErrorRow}>
            <Image source={IMAGES.error_icon} style={{ width: 11, height: 11 }} />
            <AppText
              size={getScaleSize(12)}
              color="#ef4444"
              style={styles.productErrorText}
            >
              {errors.nutrition_products}
            </AppText>
          </View>
        )}
        <View style={styles.card}>
          {state.nutrition_products.map((product, index) => (
            <View key={index} style={styles.productBoxRow} onLayout={(e) => {
              productPositions[index] = e.nativeEvent.layout.y;
            }}>
              <AppText
                size={getScaleSize(13)}
                color={COLORS._1A1D1F}
                font={FONTS.Inter.SemiBold}
                style={styles.productIndex}
              >
                {index + 1}.
              </AppText>
              <Input
                value={product.category}
                onChangeText={(value) => updateProduct(index, 'category', value)}
                style={styles.productInputRoot}
                inputWrapperStyle={styles.productNameBox}
                placeholder="Category"
                placeholderTextColor={COLORS._6F767E}
              />
              <Input
                value={product.product_type}
                onChangeText={(value) => updateProduct(index, 'product_type', value)}
                style={styles.productInputRoot}
                inputWrapperStyle={styles.productNameBox}
                placeholder="Product type"
                placeholderTextColor={COLORS._6F767E}
                error={errors[`nutrition_products[${index}].product_type`]}
              />
              <View style={styles.productBottomRow}>
                <Input
                  value={product.quantity_per_day}
                  onChangeText={(value) => updateProduct(index, 'quantity_per_day', value)}
                  keyboardType="numeric"
                  style={styles.productSmallInputRoot}
                  inputWrapperStyle={styles.productSmallBox}
                  inputStyle={styles.productSmallText}
                  placeholder="qty"
                  placeholderTextColor={COLORS._6F767E}
                  error={errors[`nutrition_products[${index}].quantity_per_day`]}
                />
                <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
                  per day
                </AppText>
              </View>
            </View>
          ))}
        </View>

        {/* OTHER NUTRITION */}
        <View style={styles.card}>
          {renderSectionHeader('Other Nutrition')}
          <Input
            label="Other Nutrition"
            value={state.other_nutrition}
            onChangeText={(value) => setFormState({ other_nutrition: value })}
            placeholder="Enter other nutrition details"
            multiline
            numberOfLines={4}
            style={styles.inputField}
          />
        </View>

        {/* INSTRUCTIONS */}
        <View style={styles.card}>
          {renderSectionHeader('Instructions')}
          <AppText size={getScaleSize(12)} color={COLORS._6F767E} style={{ marginBottom: getScaleSize(12) }}>
            Consume at least 2 hours before or after meals for 1 month
          </AppText>
          <Input
            label="Texture"
            value={state.texture}
            onChangeText={(value) => setFormState({ texture: value })}
            placeholder="Enter texture details"
            style={styles.inputField}
          />
        </View>

        {/* REASSESSMENT */}
        <View style={styles.card}>
          {renderSectionHeader('Reassessment')}
          <View style={styles.row}>
            <Input
              label="Reassessment After (months)"
              value={state.reassessment_after_month}
              onChangeText={(value) => setFormState({ reassessment_after_month: value })}
              placeholder="1"
              style={styles.rowInput}
              keyboardType="numeric"
            />
            <Input
              label="Renewal (months)"
              value={state.renewal_months}
              onChangeText={(value) => setFormState({ renewal_months: value })}
              placeholder="Months"
              style={styles.rowInput}
              keyboardType="numeric"
            />
          </View>
          <AppText size={getScaleSize(13)} font={FONTS.Inter.SemiBold} style={{ marginTop: getScaleSize(12), marginBottom: getScaleSize(8) }}>
            Reassessment Criteria ({checkedBoxesCount} selected)
          </AppText>
          {['Weight', 'Nutritional status', 'Pathology progression', 'Oral intake level', 'ONS tolerance', 'Compliance with ONS'].map((criterion) => (
            <AppCheckBox
              key={criterion}
              value={state.reassessment_criteria.includes(criterion)}
              onValueChange={(val) => {
                const updated = val
                  ? [...state.reassessment_criteria, criterion]
                  : state.reassessment_criteria.filter(c => c !== criterion);
                setFormState({ reassessment_criteria: updated });
              }}
              label={criterion}
            />
          ))}
        </View>

        {/* SIGNATURE */}
        <FormSignature title="Physician Signature" showDate={true} />

        <WarningSheet ref={warningSheetRef} />
      </ScrollView>
    </View>
  );
});

CNOForm.displayName = 'CNOForm';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  headerTextContainer: {
    marginBottom: getScaleSize(4),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getScaleSize(190),
    gap: getScaleSize(12),
    marginHorizontal: getScaleSize(16),
  },
  card: {
    backgroundColor: COLORS.white,
    padding: getScaleSize(17),
    borderRadius: getScaleSize(16),
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getScaleSize(12),
  },
  inputField: {
    marginBottom: getScaleSize(12),
    paddingHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    alignItems: 'flex-end',
  },
  rowInput: {
    flex: 1,
    marginBottom: getScaleSize(12),
    paddingHorizontal: 0,
  },
  productBoxRow: {
    marginBottom: getScaleSize(16),
    paddingBottom: getScaleSize(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._E5E7EB,
  },
  productIndex: {
    marginBottom: getScaleSize(8),
  },
  productInputRoot: {
    paddingHorizontal: 0,
    marginBottom: getScaleSize(8),
  },
  productSmallInputRoot: {
    flex: 1,
    paddingHorizontal: 0,
  },
  productNameBox: {
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    borderRadius: getScaleSize(12),
    paddingHorizontal: getScaleSize(10),
    fontSize: getScaleSize(13),
    color: COLORS._1A1D1F,
    backgroundColor: COLORS.white,
  },
  productSmallBox: {
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    borderRadius: getScaleSize(12),
    paddingHorizontal: getScaleSize(10),
    fontSize: getScaleSize(13),
    color: COLORS._1A1D1F,
    backgroundColor: COLORS.white,
  },
  productSmallText: {
    fontSize: getScaleSize(13),
    textAlign: 'center',
  },
  productBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    marginTop: getScaleSize(8),
  },
  productErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(6),
    marginBottom: getScaleSize(8),
    marginHorizontal: getScaleSize(16),
  },
  productErrorText: {
    marginBottom: 0,
  },
});

export default CNOForm;
