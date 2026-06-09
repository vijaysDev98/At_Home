import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import { ActionSheetRef } from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';

import {
  AppCheckBox,
  AppText,
  Input,
  FormPatientSection,
  FormPrescriberSection,
  AppLoader,
} from '../../../components';

import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';
import FormSignature from '../../../components/FormSignature';

import { RootState } from '../../../redux/store';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { setLoading } from '../../../actions/common/commonSlice';
import { SHOW_TOAST, SHOW_SUCCESS_TOAST, STRING } from '../../../constant';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import {
  PatientInfo,
  ServiceRequestDetail,
} from '../../../services/serviceRequestListApi';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import {
  handleFormSubmit,
  handleSaveAsDraft,
  handleUpdateAndSign,
  handleSaveProgress,
  handleSubmitForReview,
  handleEditForm,
} from './formActionHandlers';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export interface WoundCareFormProps {
  serviceId?: string;
  initialData?: ServiceRequestDetail | null;
  patient?: PatientInfo;
  readOnly?: boolean;
}

const WOUND_TYPE_OPTIONS = [
  'Acute',
  'Chronic',
  'Ulcer',
  'Pressure ulcer',
  'Postoperative wound',
  'Cavity wound',
  'Wound with fibrin',
  'Other',
];

const DRESSING_TYPE_OPTIONS = [
  'Hyperabsorbent',
  'Post-op',
  'Debridement and healing dressing',
  'Hydrocolloid',
  'Packing',
];

const WOUND_DETAILS_OPTIONS = [
  { key: 'exudate', title: 'Exudate', stringKey: 'exudate' },
  { key: 'cavity', title: 'Cavity', stringKey: 'cavity' },
  { key: 'septic_wound', title: 'Septic wound', stringKey: 'septicWound' },
];

export interface WoundCareFormRef {
  validateAndSubmit: () => Promise<void>;
  saveAsDraft: () => Promise<void>;
  updateAndSign: () => Promise<{ success: boolean; error?: string }>;
  saveProgress: () => Promise<{ success: boolean; error?: string }>;
  getFormData: () => any;
}

const WoundCareForm = forwardRef<WoundCareFormRef, WoundCareFormProps>(
  ({ serviceId, initialData, patient, readOnly = false }, ref) => {
    const dispatch = useDispatch();
    const locale = useSelector((state: any) => state.language.currentLanguage);
    const { t } = useTranslation();
    const reduxPatient = useSelector(
      (state: RootState) => state.patient.selectedPatient,
    );
    const selectedPatient = initialData ? patient : reduxPatient;
    const profileData = useSelector(
      (state: RootState) => state.profile.profileData,
    );


    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(new Date());
    const [pickerType, setPickerType] = useState<{
      type: string;
    } | null>(null);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const lastFirstErrorKey = useRef<string | null>(null);

    const [state, setState] = useState({
      // Physician Information
      prescriber_last_name: profileData?.lName || '',
      prescriber_first_name: profileData?.fName || '',
      rpps_id: profileData?.rppsNumber || '',
      prescriber_finess: profileData?.finessNumber || '',

      // Patient Information
      patient_last_name: selectedPatient?.lName || '',
      patient_first_name: selectedPatient?.fName || '',
      dob: selectedPatient?.dateOfBirth
        ? moment(selectedPatient.dateOfBirth).format('DD/MM/YYYY')
        : '',

      // Condition
      condition_type: '', // ald_related, ald_not_related
      date: moment().format('DD/MM/YYYY'), // From schema Condition section
      prescription_date: '', // Top-level date

      // Type of Wound
      wound_type: [] as string[],
      wound_size: '',
      wound_type_other: '',

      // Desired Dressing Type
      dressing_type: [] as string[],
      postop_dressing_detail: '',
      debridement_dressing_detail: '',
      hydrocolloid_dressing_detail: '',
      packing_detail_1: '',
      packing_detail_2: '',
      packing_detail_3: '',

      // Wound Details
      exudate: null,
      cavity: null,
      septic_wound: null,

      // Required Materials and Protocol
      dressing_kits_per_day: '',
      bandage_per_day: '',
      cleaning_with: '',
      disinfection_with: '',
      first_layer: '',
      second_layer: '',
      treatment_duration: '',
      until_healed: false,
      physician_signature: '',
    });

    useEffect(() => {
      if (initialData) {
        setState(prev => ({
          ...prev,
          ...(initialData?.formData as any),
        }));
      }
    }, [initialData]);

    // Wrapper setter that clears errors for changed top-level keys
    const setFormState = (updaterOrPartial: any) => {
      if (typeof updaterOrPartial === 'function') {
        setState(prev => {
          const next = updaterOrPartial(prev);
          try {
            const changedKeys = Object.keys(next).filter(
              k => (prev as any)[k] !== (next as any)[k],
            );
            if (changedKeys.length) {
              setErrors(prevErrs => {
                const ne = { ...prevErrs } as any;
                changedKeys.forEach(k => {
                  if (k === 'patient_last_name' && ne.patientLastName)
                    delete ne.patientLastName;
                  if (k === 'patient_first_name' && ne.patientFirstName)
                    delete ne.patientFirstName;
                  if (k === 'prescriber_last_name' && ne.physicianLastName)
                    delete ne.physicianLastName;
                  if (k === 'prescriber_first_name' && ne.physicianFirstName)
                    delete ne.physicianFirstName;
                  if (k === 'prescription_date' && ne.prescriptionDate)
                    delete ne.prescriptionDate;
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
                if (k === 'patient_last_name' && ne.patientLastName)
                  delete ne.patientLastName;
                if (k === 'patient_first_name' && ne.patientFirstName)
                  delete ne.patientFirstName;
                if (k === 'prescriber_last_name' && ne.physicianLastName)
                  delete ne.physicianLastName;
                if (k === 'prescriber_first_name' && ne.physicianFirstName)
                  delete ne.physicianFirstName;
                if (k === 'prescription_date' && ne.prescriptionDate)
                  delete ne.prescriptionDate;
              });
              return ne;
            });
          }
          return next;
        });
      }
    };

    const validateForm = (): {
      ok: boolean;
      errors: { [key: string]: string };
    } => {
      const newErrors: { [key: string]: string } = {};

      // Required: patient info
      if (!state?.patient_last_name || !state.patient_last_name.trim()) {
        newErrors.patientLastName = t(STRING.lNameRequired);
      }
      if (!state?.patient_first_name || !state.patient_first_name.trim()) {
        newErrors.patientFirstName = t(STRING.fNameRequired);
      }

      // Required: prescription date
      if (!state?.date) {
        newErrors.date = t(STRING.dateRequired);
      }

      setErrors(newErrors);
      lastFirstErrorKey.current = Object.keys(newErrors)[0] || null;
      return { ok: Object.keys(newErrors).length === 0, errors: newErrors };
    };

    // Handle form submission (using centralized handler)
    const validateAndSubmit = async () => {
      await handleFormSubmit({
        dispatch,
        state,
        initialData,
        serviceId: serviceId || '',
        selectedPatient,
        validateForm: () => validateForm().ok,
        lastFirstErrorKey,
        errors,
      });
    };

    // Handle save as draft (using centralized handler)
    const saveAsDraft = async () => {
      await handleSaveAsDraft({
        dispatch,
        state,
        initialData,
        serviceId: serviceId || '',
        selectedPatient,
        validateForm: () => validateForm().ok,
        lastFirstErrorKey,
        errors,
      });
    };

    // Handle update & sign (using centralized handler)
    const updateAndSign = async (): Promise<{
      success: boolean;
      error?: string;
    }> => {
      return await handleUpdateAndSign({
        dispatch,
        state,
        initialData,
        validateForm: () => validateForm().ok,
        lastFirstErrorKey,
        errors,
      });
    };

    // Handle save progress (using centralized handler)
    const saveProgress = async (): Promise<{
      success: boolean;
      error?: string;
    }> => {
      return await handleSaveProgress({
        dispatch,
        state,
        initialData,
        validateForm: () => validateForm().ok,
        lastFirstErrorKey,
        errors,
      });
    };

    // Handle submit for review (using centralized handler)
    const submitForReview = async (): Promise<{
      success: boolean;
      error?: string;
    }> => {
      return await handleSubmitForReview({
        dispatch,
        state,
        initialData,
        validateForm: () => validateForm().ok,
        lastFirstErrorKey,
        errors,
      });
    };

    // Handle edit form (using centralized handler - no navigation)
    const editForm = async (): Promise<{
      success: boolean;
      error?: string;
    }> => {
      return await handleEditForm({
        dispatch,
        state,
        initialData,
        validateForm: () => validateForm().ok,
        lastFirstErrorKey,
        errors,
      });
    };

    useImperativeHandle(ref, () => ({
      validateAndSubmit,
      saveAsDraft,
      updateAndSign,
      editForm,
      saveProgress,
      submitForReview,
      getFormData: () => {
        return state;
      },
    }));

    const renderSectionHeader = (title: string) => (
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
        <KeyboardAwareScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          enableAutomaticScroll={true}
        >
          <View style={styles.headerTextContainer}>
            <AppText
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {t(STRING.woundDressingPrescriptionSupportForm)}
            </AppText>
          </View>

          {/* <FormPrescriptionDetails
            state={state}
            setState={setFormState}
            errors={errors}
          /> */}

          <FormPrescriberSection
            state={state}
            setState={setFormState}
            title={t(STRING.physicianInformation)}
            showFiness={true}
          />

          <FormPatientSection
            readOnly={readOnly}
            state={state}
            setState={setFormState}
            showDate={false}
            showNALD={false}
            showWeight={false}
            showALD={false}
            showNIR={false}
            errors={errors}
          />

          {/* CONDITION */}
          <View style={styles.card}>
            {renderSectionHeader(t(STRING.condition))}

            <View style={styles.checkboxGroup}>
              <AppCheckBox
                disabled={readOnly}
                value={state.condition_type === 'ald_related'}
                onValueChange={value =>
                  setFormState({ condition_type: value ? 'ald_related' : '' })
                }
                label={t(STRING.careRelatedToLongTermConditionAld)}
              />
              <AppCheckBox
                disabled={readOnly}
                value={state.condition_type === 'ald_not_related'}
                onValueChange={value =>
                  setFormState({
                    condition_type: value ? 'ald_not_related' : '',
                  })
                }
                label={t(STRING.notRelatedToLongTermConditionAld)}
              />
            </View>

            <Input
              isLocked={readOnly}
              onPress={() => {
                if (readOnly) return;
                setPickerType({ type: 'date' });
                setOpen(true);
              }}
              editable={false}
              label={t(STRING.date)}
              placeholder={t(STRING.ddmmyyyy)}
              value={state.date}
              style={styles.inputField}
              pointerEvents="none"
            />
          </View>

          {/* TYPE OF WOUND */}
          <View style={styles.card}>
            {renderSectionHeader(t(STRING.typeOfWound))}

            <Input
              isLocked={readOnly}
              label={t(STRING.woundSize)}
              placeholder={t(STRING.example5x5cm)}
              value={state.wound_size}
              onChangeText={value => setFormState({ wound_size: value })}
              style={styles.inputField}
            />

            <View style={styles.checkboxGroup}>
              {WOUND_TYPE_OPTIONS.map(item => (
                <AppCheckBox
                  disabled={readOnly}
                  key={item}
                  value={(state.wound_type || []).includes(item)}
                  onValueChange={value => {
                    const current = [...(state.wound_type || [])];
                    if (value) {
                      current.push(item);
                    } else {
                      const idx = current.indexOf(item);
                      if (idx > -1) current.splice(idx, 1);
                    }
                    setFormState({ wound_type: current });
                  }}
                  label={item}
                />
              ))}
            </View>

            {(state.wound_type || []).includes('Other') && (
              <Input
                isLocked={readOnly}
                label={t(STRING.otherWoundType)}
                placeholder={t(STRING.enterOtherWoundType)}
                value={state.wound_type_other}
                onChangeText={value => setFormState({ wound_type_other: value })}
                style={styles.inputField}
              />
            )}
          </View>

          {/* DESIRED DRESSING TYPE */}
          <View style={styles.card}>
            {renderSectionHeader(t(STRING.desiredDressingType))}

            <View style={styles.checkboxGroup}>
              {DRESSING_TYPE_OPTIONS.map(item => (
                <AppCheckBox
                  disabled={readOnly}
                  key={item}
                  value={(state.dressing_type || []).includes(item)}
                  onValueChange={value => {
                    const current = [...(state.dressing_type || [])];
                    if (value) {
                      current.push(item);
                    } else {
                      const idx = current.indexOf(item);
                      if (idx > -1) current.splice(idx, 1);
                    }
                    setFormState({ dressing_type: current });
                  }}
                  label={item}
                />
              ))}
            </View>

            {(state.dressing_type || []).includes('Post-op') && (
              <Input
                isLocked={readOnly}
                label={t(STRING.postopDressingDetail)}
                placeholder={t(STRING.enterPostopDressingDetails)}
                value={state.postop_dressing_detail}
                onChangeText={value => setFormState({ postop_dressing_detail: value })}
                style={styles.inputField}
              />
            )}

            {(state.dressing_type || []).includes('Debridement and healing dressing') && (
              <Input
                isLocked={readOnly}
                label={t(STRING.debridementDressingDetail)}
                placeholder={t(STRING.enterDebridementDressingDetails)}
                value={state.debridement_dressing_detail}
                onChangeText={value => setFormState({ debridement_dressing_detail: value })}
                style={styles.inputField}
              />
            )}

            {(state.dressing_type || []).includes('Hydrocolloid') && (
              <View>
                <Input
                  isLocked={readOnly}
                  label={t(STRING.hydrocolloidDressingDetail)}
                  placeholder={t(STRING.enterHydrocolloidDressingDetails)}
                  value={state.hydrocolloid_dressing_detail}
                  onChangeText={value => setFormState({ hydrocolloid_dressing_detail: value })}
                  style={styles.inputField}
                />
                <View style={[styles.staticTextContainer, { marginTop: getScaleSize(12) }]}>
                  <AppText size={getScaleSize(13)} color={COLORS._6B7280} style={styles.staticText}>
                    {t(STRING.hydrocolloidNote)}
                  </AppText>
                </View>
              </View>
            )}

            {(state.dressing_type || []).includes('Packing') && (
              <View>
                <Input
                  isLocked={readOnly}
                  label={t(STRING.packingDetail1)}
                  placeholder={t(STRING.enterPackingDetail1)}
                  value={state.packing_detail_1}
                  onChangeText={value => setFormState({ packing_detail_1: value })}
                  style={styles.inputField}
                />
                <Input
                  isLocked={readOnly}
                  label={t(STRING.packingDetail2)}
                  placeholder={t(STRING.enterPackingDetail2)}
                  value={state.packing_detail_2}
                  onChangeText={value => setFormState({ packing_detail_2: value })}
                  style={styles.inputField}
                />
                <Input
                  isLocked={readOnly}
                  label={t(STRING.packingDetail3)}
                  placeholder={t(STRING.enterPackingDetail3)}
                  value={state.packing_detail_3}
                  onChangeText={value => setFormState({ packing_detail_3: value })}
                  style={styles.inputField}
                />
                <View style={[styles.staticTextContainer, { marginTop: getScaleSize(12) }]}>
                  <AppText size={getScaleSize(13)} color={COLORS._6B7280} style={styles.staticText}>
                    {t(STRING.packingNote)}
                  </AppText>
                </View>
              </View>
            )}
          </View>

          {/* WOUND DETAILS */}
          <View style={styles.card}>
            {renderSectionHeader(t(STRING.woundDetails))}

            {WOUND_DETAILS_OPTIONS.map(item => (
              <View key={item.key} style={styles.statusRow}>
                <AppText size={getScaleSize(13)} font={FONTS.Inter.SemiBold}>
                  {t((STRING as any)[item.stringKey])}
                </AppText>

                <View style={styles.checkboxRow}>
                  <AppCheckBox
                    disabled={readOnly}
                    value={(state as any)[item.key] === true}
                    onValueChange={() => setFormState({ [item.key]: true })}
                    label={t(STRING.yes)}
                  />

                  <AppCheckBox
                    disabled={readOnly}
                    value={(state as any)[item.key] === false}
                    onValueChange={() => setFormState({ [item.key]: false })}
                    label={t(STRING.no)}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* REQUIRED MATERIALS AND PROTOCOL */}
          <View style={styles.card}>
            {renderSectionHeader(t(STRING.requiredMaterialsAndProtocol))}

            <View style={styles.inputRow}>
              <Input
                isLocked={readOnly}
                label={t(STRING.dressingKitsPerDay)}
                value={state.dressing_kits_per_day}
                onChangeText={value =>
                  setFormState({ dressing_kits_per_day: value })
                }
                placeholder="0"
                keyboardType="numeric"
                style={styles.halfWidthInput}
              />

              <Input
                isLocked={readOnly}
                label={t(STRING.bandagePerDay)}
                value={state.bandage_per_day}
                onChangeText={value => setFormState({ bandage_per_day: value })}
                placeholder="0"
                keyboardType="numeric"
                style={styles.halfWidthInput}
              />
            </View>

            {/* <View style={styles.inputRow}> */}
            <Input
              isLocked={readOnly}
              label={t(STRING.cleaningWith)}
              value={state.cleaning_with}
              onChangeText={value => setFormState({ cleaning_with: value })}
              placeholder={t(STRING.enterProduct)}
              style={styles.halfWidthInput}
            />

            <Input
              isLocked={readOnly}
              label={t(STRING.disinfectionWith)}
              value={state.disinfection_with}
              onChangeText={value =>
                setFormState({ disinfection_with: value })
              }
              placeholder={t(STRING.enterProduct)}
              style={styles.halfWidthInput}
            />
            {/* </View> */}

            <View style={styles.inputRow}>
              <Input
                isLocked={readOnly}
                label={t(STRING.layer1)}
                value={state.first_layer}
                onChangeText={value => setFormState({ first_layer: value })}
                placeholder=""
                style={styles.halfWidthInput}
              />

              <Input
                isLocked={readOnly}
                label={t(STRING.layer2)}
                value={state.second_layer}
                onChangeText={value => setFormState({ second_layer: value })}
                placeholder=""
                style={styles.halfWidthInput}
              />
            </View>

            <Input
              isLocked={readOnly}
              label={t(STRING.treatmentDuration)}
              value={state.treatment_duration}
              onChangeText={value =>
                setFormState({
                  treatment_duration: value,
                  until_healed: false,
                })
              }
              placeholder={t(STRING.eg15days)}
              style={styles.inputField}
            />

            <AppCheckBox
              disabled={readOnly}
              value={state.until_healed}
              onValueChange={value =>
                setFormState({
                  until_healed: value,
                  treatment_duration: value ? '' : state.treatment_duration,
                })
              }
              label={t(STRING.untilHealed)}
            />
          </View>

          {/* <FormSignature
            readOnly={readOnly}
            signature={state.physician_signature}
            onSignatureChange={val =>
              setFormState({ physician_signature: val })
            }
          /> */}
        </KeyboardAwareScrollView>

        <DatePicker
          locale={locale}
          title={t(STRING.selectDate)}
          cancelText={t(STRING.cancel)}
          confirmText={t(STRING.confirm)}
          modal
          theme='light'
          open={open}
          date={date}
          mode="date"
          // minimumDate={new Date()}
          onConfirm={selectedDate => {
            setOpen(false);
            setDate(selectedDate);

            if (pickerType) {
              const formattedDate = moment(selectedDate).format('DD/MM/YYYY');
              setFormState({ [pickerType.type]: formattedDate });
            }
          }}
          onCancel={() => {
            setOpen(false);
          }}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: getScaleSize(20),
    gap: getScaleSize(12),
    marginHorizontal: getScaleSize(16),
  },

  headerTextContainer: {
    marginBottom: getScaleSize(4),
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
    gap: getScaleSize(12),
    marginBottom: getScaleSize(16),
  },

  sectionIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    resizeMode: 'contain',
  },

  inputField: {
    marginVertical: getScaleSize(12),
    paddingHorizontal: 0,
  },

  checkboxGroup: {
    // gap: getScaleSize(10),
  },

  checkboxRow: {
    flexDirection: 'row',
    gap: getScaleSize(16),
    flexWrap: 'wrap',
    marginBottom: getScaleSize(10),
  },

  nestedCheckbox: {
    marginLeft: getScaleSize(18),
    marginTop: getScaleSize(8),
    gap: getScaleSize(8),
  },

  statusRow: {
    // marginBottom:
    //   getScaleSize(12),
    gap: getScaleSize(8),
  },

  protocolContainer: {
    // gap: getScaleSize(18),
  },

  protocolRow: {
    flexDirection: 'row',
    alignItems: "flex-end",
    flexWrap: 'wrap',
    // gap: getScaleSize(8),
  },

  protocolTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
    // marginLeft:
    //   getScaleSize(36),
    flexWrap: 'wrap',
  },

  blankInputWrapper: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._BFC8D0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    minHeight: getScaleSize(34),
    paddingHorizontal: 0,
  },

  blankInputText: {
    paddingVertical: 0,
    textAlign: 'center',
    fontSize: getScaleSize(13),
    color: COLORS._1A1D1F,
    fontFamily: FONTS.Inter.Medium,
  },

  blankInputSmall: {
    width: getScaleSize(70),
    paddingHorizontal: 0,
    marginBottom: 0,
  },

  blankInputMedium: {
    width: getScaleSize(120),
    paddingHorizontal: 0,
    marginBottom: 0,
  },

  blankInputLarge: {
    width: getScaleSize(180),
    paddingHorizontal: 0,
    marginBottom: 0,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: getScaleSize(12),
  },

  halfWidthInput: {
    flex: 1,
    paddingHorizontal: 0,
    marginBottom: getScaleSize(12),
  },

  staticTextContainer: {
    backgroundColor: '#F9FAFB',
    padding: getScaleSize(12),
    borderRadius: getScaleSize(8),
    borderLeftWidth: 3,
    borderLeftColor: COLORS._3B82F6,
  },

  staticText: {
    lineHeight: getScaleSize(18),
  },
});

export default WoundCareForm;
