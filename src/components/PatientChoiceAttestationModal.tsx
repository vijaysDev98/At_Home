import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import moment from 'moment';

import AppText from './AppText';
import PrimaryButton from './PrimaryButton';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';
import { IMAGES } from '../assets/images';
import { STRING } from '../constant';
import { RootState } from '../redux/store';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface PatientChoiceAttestationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  requestData?: any;
  patientData?: any;
}

export const PatientChoiceAttestationModal: React.FC<
  PatientChoiceAttestationModalProps
> = ({ visible, onClose, onConfirm, requestData, patientData }) => {
  const { t, i18n } = useTranslation();
  const { currentLanguage } = useSelector((state: RootState) => state.language);
  const profileData = useSelector(
    (state: RootState) => state.profile.profileData,
  );

  const isFrench = (currentLanguage || i18n.language || 'fr').startsWith('fr');
  const [isDeclarationChecked, setIsDeclarationChecked] = useState(false);
  const [showNeedToTick, setShowNeedToTick] = useState(false);

  // Reset checkbox when modal opens
  useEffect(() => {
    if (visible) {
      setIsDeclarationChecked(false);
      setShowNeedToTick(false);
    }
  }, [visible]);

  const toggleCheckbox = () => {
    setIsDeclarationChecked(prev => {
      const next = !prev;
      setShowNeedToTick(false);
      return next;
    });
  };

  const handleConfirmPress = () => {
    if (!isDeclarationChecked) {
      setShowNeedToTick(true);
      return;
    }
    onConfirm();
  };

  // Dynamic Patient Info
  const formData = requestData?.formData || {};
  const resolvedPatient =
    patientData ||
    requestData?.patientId ||
    requestData?.patient ||
    {};

  const patientFullName = useMemo(() => {
    if (resolvedPatient?.fullName) return resolvedPatient.fullName;
    if (resolvedPatient?.fName && resolvedPatient?.lName) {
      return `${resolvedPatient.fName} ${resolvedPatient.lName}`.trim();
    }
    if (resolvedPatient?.firstName && resolvedPatient?.lastName) {
      return `${resolvedPatient.firstName} ${resolvedPatient.lastName}`.trim();
    }
    if (formData?.patient_first_name && formData?.patient_last_name) {
      return `${formData.patient_first_name} ${formData.patient_last_name}`.trim();
    }
    if (formData?.patient_last_name) {
      return `${formData.patient_last_name}`.trim();
    }
    if (resolvedPatient?.name) return resolvedPatient.name;
    return '—';
  }, [resolvedPatient, formData]);

  const patientIdentifier = useMemo(() => {
    const rawId =
      resolvedPatient?.patientId ||
      resolvedPatient?.nir ||
      formData?.nir ||
      resolvedPatient?.id ||
      resolvedPatient?._id ||
      (typeof requestData?.patientId === 'string' ? requestData.patientId : null);
    return rawId ? String(rawId).trim() : null;
  }, [resolvedPatient, formData, requestData]);

  // Dynamic Doctor / Prescriber Info
  const doctorObj: any =
    requestData?.doctorId ||
    requestData?.doctor ||
    requestData?.createdBy ||
    profileData ||
    {};

  const doctorFullName = useMemo(() => {
    const rawName =
      doctorObj?.fullName ||
      (doctorObj?.fName && doctorObj?.lName
        ? `${doctorObj.fName} ${doctorObj.lName}`.trim()
        : '') ||
      (doctorObj?.firstName && doctorObj?.lastName
        ? `${doctorObj.firstName} ${doctorObj.lastName}`.trim()
        : '') ||
      (formData?.prescriber_first_name && formData?.prescriber_last_name
        ? `${formData.prescriber_first_name} ${formData.prescriber_last_name}`.trim()
        : '') ||
      (formData?.prescriber_last_name
        ? String(formData.prescriber_last_name).trim()
        : '') ||
      (profileData?.fName && profileData?.lName
        ? `${profileData.fName} ${profileData.lName}`.trim()
        : '') ||
      (profileData as any)?.fullName ||
      doctorObj?.name ||
      '';

    if (!rawName) return isFrench ? 'Médecin prescripteur' : 'Prescribing Physician';
    const trimmed = rawName.trim();
    if (/^dr\.?/i.test(trimmed)) {
      return trimmed;
    }
    return `Dr. ${trimmed}`;
  }, [doctorObj, formData, profileData, isFrench]);

  const rppsNumber =
    doctorObj?.rppsNumber ||
    doctorObj?.rpps ||
    doctorObj?.rpps_id ||
    formData?.rpps_id ||
    formData?.rppsNumber ||
    profileData?.rppsNumber;

  const finessNumber =
    doctorObj?.finessNumber ||
    formData?.finess_number ||
    profileData?.finessNumber;

  const doctorSubDetail = useMemo(() => {
    if (rppsNumber) return `RPPS: ${rppsNumber}`;
    if (finessNumber) return `FINESS: ${finessNumber}`;
    if (doctorObj?.specialty) return doctorObj.specialty;
    if (doctorObj?.email) return doctorObj.email;
    return isFrench ? 'Médecin prescripteur' : 'Prescribing Physician';
  }, [rppsNumber, finessNumber, doctorObj, isFrench]);

  // Dynamic Provider Info (Optional - only shown if exists)
  const providerObj =
    requestData?.assignedProvider ||
    requestData?.assignedProviderId ||
    requestData?.providerId ||
    requestData?.provider ||
    requestData?.providerFormData;

  const providerName = useMemo(() => {
    if (!providerObj) return null;
    if (typeof providerObj === 'object') {
      const name =
        providerObj?.companyName ||
        providerObj?.businessName ||
        providerObj?.providerName ||
        providerObj?.fullName ||
        (providerObj?.fName && providerObj?.lName
          ? `${providerObj.fName} ${providerObj.lName}`.trim()
          : '') ||
        providerObj?.name ||
        providerObj?.user?.companyName ||
        providerObj?.user?.name;
      return name && String(name).trim().length > 0 ? String(name).trim() : null;
    }
    if (typeof providerObj === 'string' && providerObj.trim().length > 0) {
      return providerObj.trim();
    }
    return null;
  }, [providerObj]);

  // Dynamic Timestamp: Date (e.g. 10 Oct 2026) and Time (e.g. hh:mm am/pm)
  const { declarationDatePart, declarationTimePart, declarationDateFormatted } =
    useMemo(() => {
      const dateSource =
        requestData?.requestedDate ||
        requestData?.createdAt ||
        requestData?.formData?.prescription_date;
      const dateMoment =
        dateSource && moment(dateSource).isValid() ? moment(dateSource) : moment();
      const currentMoment = moment();

      const dateStr = dateMoment.format('DD MMM YYYY');
      const timeStr =
        requestData?.requestedTime && typeof requestData.requestedTime === 'string'
          ? moment(
              requestData.requestedTime,
              ['HH:mm', 'hh:mm a', 'YYYY-MM-DDTHH:mm:ssZ'],
            ).format('hh:mm a')
          : dateMoment.format('hh:mm a');

      const validationDateStr = currentMoment.format('DD MMM YYYY');
      const validationTimeStr = currentMoment.format('hh:mm a');

      return {
        declarationDatePart: dateStr,
        declarationTimePart: timeStr,
        declarationDateFormatted: `${validationDateStr}, ${validationTimeStr}`,
      };
    }, [requestData, visible]);

  // Traceability Identifier directly connected to the request
  const traceabilityId = useMemo(() => {
    return (
      requestData?.requestId ||
      requestData?.id ||
      requestData?._id ||
      requestData?.formData?.requestId ||
      ''
    );
  }, [requestData]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerBadge}>
                <Image
                  source={IMAGES.securityIcon}
                  style={styles.headerBadgeIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.headerTextGroup}>
                <AppText
                  size={getScaleSize(14.5)}
                  font={FONTS.Inter.Bold}
                  color={COLORS._1A1D1F}
                  numberOfLines={2}
                >
                  {isFrench
                    ? 'Attestation du Choix du Patient'
                    : 'Patient Choice Recording'}
                </AppText>
                <AppText
                  size={getScaleSize(11)}
                  font={FONTS.Inter.Medium}
                  color={COLORS.primaryMuted}
                >
                  {traceabilityId ? `ATHOME • ${traceabilityId}` : 'ATHOME'}
                </AppText>
              </View>
            </View>

            {/* TOP RIGHT: CLOSE */}
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                style={styles.closeBtn}
                accessibilityLabel={t(STRING.close)}
              >
                <AppText
                  size={getScaleSize(15)}
                  font={FONTS.Inter.Bold}
                  color={COLORS._6B7280}
                >
                  ✕
                </AppText>
              </TouchableOpacity>
            </View>
          </View>

          {/* SCROLLABLE DOCUMENT BODY */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            nestedScrollEnabled={true}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            {/* DYNAMIC METADATA GRID */}
            <View style={styles.metaContainer}>
              {/* PATIENT */}
              <View
                style={[
                  styles.metaRow,
                  !patientIdentifier && styles.metaRowSingleLine,
                ]}
              >
                <View style={styles.metaLabelContainer}>
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._1A1D1F}
                    align="left"
                    style={styles.metaLabel}
                  >
                    {isFrench ? 'Patient :' : 'Patient:'}
                  </AppText>
                </View>
                <View style={styles.metaValueContainer}>
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.SemiBold}
                    color={COLORS._1A1D1F}
                    align="right"
                    style={styles.metaValuePrimary}
                  >
                    {patientFullName}
                  </AppText>
                  {!!patientIdentifier && (
                    <AppText
                      size={getScaleSize(11)}
                      font={FONTS.Inter.Regular}
                      color={COLORS._6B7280}
                      align="right"
                      style={styles.metaValueSecondary}
                    >
                      {String(patientIdentifier).startsWith('ID') ||
                      String(patientIdentifier).startsWith('NIR')
                        ? patientIdentifier
                        : `ID: ${patientIdentifier}`}
                    </AppText>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              {/* PRESCRIBING PHYSICIAN */}
              <View style={styles.metaRow}>
                <View style={styles.metaLabelContainer}>
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._1A1D1F}
                    align="left"
                    style={styles.metaLabel}
                  >
                    {isFrench ? 'Médecin prescripteur :' : 'Prescribing physician:'}
                  </AppText>
                </View>
                <View style={styles.metaValueContainer}>
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.SemiBold}
                    color={COLORS._1A1D1F}
                    align="right"
                    style={styles.metaValuePrimary}
                  >
                    {doctorFullName}
                  </AppText>
                  <AppText
                    size={getScaleSize(11)}
                    font={FONTS.Inter.Regular}
                    color={COLORS._6B7280}
                    align="right"
                    style={styles.metaValueSecondary}
                  >
                    {doctorSubDetail}
                  </AppText>
                </View>
              </View>

              {/* SELECTED PROVIDER (OPTIONAL - ONLY IF EXISTS) */}
              {!!providerName && (
                <>
                  <View style={styles.divider} />
                  <View style={[styles.metaRow, styles.metaRowSingleLine]}>
                    <View style={styles.metaLabelContainer}>
                      <AppText
                        size={getScaleSize(12)}
                        font={FONTS.Inter.Bold}
                        color={COLORS._1A1D1F}
                        align="left"
                        style={styles.metaLabel}
                      >
                        {isFrench ? 'Prestataire choisi :' : 'Selected provider:'}
                      </AppText>
                    </View>
                    <View style={styles.metaValueContainer}>
                      <AppText
                        size={getScaleSize(12)}
                        font={FONTS.Inter.SemiBold}
                        color={COLORS._1A1D1F}
                        align="right"
                        style={styles.metaValuePrimary}
                      >
                        {providerName}
                      </AppText>
                    </View>
                  </View>
                </>
              )}

              <View style={styles.divider} />

              {/* DATE */}
              <View style={styles.metaRow}>
                <View style={styles.metaLabelContainer}>
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._1A1D1F}
                    align="left"
                    style={styles.metaLabel}
                  >
                    {isFrench ? 'Date de la déclaration :' : 'Date of declaration:'}
                  </AppText>
                </View>
                <View style={styles.metaValueContainer}>
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.SemiBold}
                    color={COLORS._1A1D1F}
                    align="right"
                    style={styles.metaValuePrimary}
                  >
                    {declarationDatePart}
                  </AppText>
                  <AppText
                    size={getScaleSize(11)}
                    font={FONTS.Inter.Regular}
                    color={COLORS._6B7280}
                    align="right"
                    style={styles.metaValueSecondary}
                  >
                    {declarationTimePart}
                  </AppText>
                </View>
              </View>
            </View>

            {/* DECLARATION PREAMBLE */}
            <AppText
              size={getScaleSize(12.5)}
              font={FONTS.Inter.SemiBold}
              color={COLORS._1A1D1F}
              style={styles.preambleText}
            >
              {isFrench
                ? 'Je soussigné(e), médecin prescripteur, déclare :'
                : 'I, the undersigned prescribing physician, hereby declare that:'}
            </AppText>

            {/* 4 OFFICIAL BULLET COMMITMENTS */}
            <View style={styles.commitmentsCard}>
              <View style={styles.bulletItem}>
                <View style={styles.bulletDot} />
                <AppText
                  size={getScaleSize(12)}
                  font={FONTS.Inter.Regular}
                  color={COLORS._1A1D1F}
                  style={styles.bulletText}
                >
                  {isFrench
                    ? 'Que le patient m’a personnellement exprimé oralement son choix du prestataire mentionné ci-dessus.'
                    : 'The patient personally expressed their choice of the service provider mentioned above to me verbally.'}
                </AppText>
              </View>

              <View style={styles.bulletItem}>
                <View style={styles.bulletDot} />
                <AppText
                  size={getScaleSize(12)}
                  font={FONTS.Inter.Regular}
                  color={COLORS._1A1D1F}
                  style={styles.bulletText}
                >
                  {isFrench
                    ? 'Que j’ai retranscrit fidèlement ce choix dans l’application ATHOME.'
                    : 'I have accurately recorded this choice in the ATHOME application.'}
                </AppText>
              </View>

              <View style={styles.bulletItem}>
                <View style={styles.bulletDot} />
                <AppText
                  size={getScaleSize(12)}
                  font={FONTS.Inter.Regular}
                  color={COLORS._1A1D1F}
                  style={styles.bulletText}
                >
                  {isFrench
                    ? 'Que j’ai informé le patient de sa liberté de choisir un autre prestataire, y compris en dehors d’ATHOME.'
                    : 'I have informed the patient of their freedom to choose another service provider, including one outside ATHOME.'}
                </AppText>
              </View>

              <View style={styles.bulletItem}>
                <View style={styles.bulletDot} />
                <AppText
                  size={getScaleSize(12)}
                  font={FONTS.Inter.Regular}
                  color={COLORS._1A1D1F}
                  style={styles.bulletText}
                >
                  {isFrench
                    ? 'Que je n’ai pas imposé le prestataire désigné au patient.'
                    : 'I have not imposed the designated service provider on the patient.'}
                </AppText>
              </View>
            </View>

            {/* LEGAL ACKNOWLEDGMENT PARAGRAPHS */}
            <View style={styles.legalBox}>
              <AppText
                size={getScaleSize(11.5)}
                font={FONTS.Inter.Regular}
                color={COLORS._526674}
                style={styles.legalParagraph}
              >
                {isFrench
                  ? 'Je reconnais que cette déclaration porte exclusivement sur la retranscription du choix du patient et ne constitue pas une garantie de qualité, de disponibilité ou de bonne exécution des prestations du professionnel désigné.'
                  : 'I acknowledge that this declaration relates exclusively to the recording of the patient’s choice and does not constitute a guarantee of the quality, availability, or proper performance of the services provided by the designated professional.'}
              </AppText>

              <AppText
                size={getScaleSize(11.5)}
                font={FONTS.Inter.Regular}
                color={COLORS._526674}
                style={[styles.legalParagraph, { marginBottom: 0 }]}
              >
                {isFrench
                  ? 'Cette déclaration ne vaut pas consentement au partage des données médicales lorsque celui-ci est légalement requis.'
                  : 'This declaration does not constitute consent to the sharing of medical data where such consent is legally required.'}
              </AppText>
            </View>

            {/* ELECTRONIC VALIDATION CHECKBOX & TRACEABILITY */}
            <View
              style={[
                styles.validationCard,
                isDeclarationChecked && styles.validationCardChecked,
                showNeedToTick && !isDeclarationChecked && styles.validationCardError,
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={toggleCheckbox}
                style={styles.checkboxRow}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    isDeclarationChecked && styles.checkboxBoxChecked,
                    showNeedToTick && !isDeclarationChecked && styles.checkboxBoxError,
                  ]}
                >
                  {isDeclarationChecked && (
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.Bold}
                      color={COLORS.white}
                    >
                      ✓
                    </AppText>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.SemiBold}
                    color={COLORS._1A1D1F}
                  >
                    {isFrench
                      ? 'Validation électronique du médecin :'
                      : 'Electronic Validation by the Physician:'}
                  </AppText>
                  <AppText
                    size={getScaleSize(11.5)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._6B7280}
                    style={{ marginTop: getScaleSize(2) }}
                  >
                    {isFrench
                      ? '[Je certifie sur l’honneur]'
                      : '[I certify on my honor]'}
                  </AppText>
                </View>
              </TouchableOpacity>

              <View style={styles.traceabilitySubRow}>
                <AppText
                  size={getScaleSize(11)}
                  font={FONTS.Inter.Medium}
                  color={COLORS._6B7280}
                >
                  {isFrench ? 'Date et heure :' : 'Date and time :'}
                </AppText>
                <AppText
                  size={getScaleSize(11)}
                  font={FONTS.Inter.SemiBold}
                  color={COLORS._1A1D1F}
                >
                  {declarationDateFormatted}
                </AppText>
              </View>

              {!!traceabilityId && (
                <View style={styles.traceabilitySubRow}>
                  <AppText
                    size={getScaleSize(11)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._6B7280}
                  >
                    {isFrench
                      ? 'Identifiant de traçabilité :'
                      : 'Traceability Identifier:'}
                  </AppText>
                  <AppText
                    size={getScaleSize(11)}
                    font={FONTS.Inter.SemiBold}
                    color={COLORS._1A1D1F}
                  >
                    {traceabilityId}
                  </AppText>
                </View>
              )}
            </View>

            {/* BUTTON INSIDE SCROLLVIEW AT BOTTOM */}
            <PrimaryButton
              title={isFrench ? "Valider l'attestation" : "Validate Attestation"}
              onPress={handleConfirmPress}
              style={[
                styles.confirmButton,
                !isDeclarationChecked && styles.confirmButtonDisabled,
              ]}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.cancelTextButton}
            >
              <AppText
                size={getScaleSize(13.5)}
                font={FONTS.Inter.Medium}
                color={COLORS._6B7280}
                align="center"
              >
                {isFrench ? 'Annuler' : 'Cancel'}
              </AppText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PatientChoiceAttestationModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(24),
  },
  modalCard: {
    width: '100%',
    maxWidth: getScaleSize(460),
    height: SCREEN_HEIGHT * 0.82,
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(20),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(14),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: COLORS.white,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerBadge: {
    width: getScaleSize(34),
    height: getScaleSize(34),
    borderRadius: getScaleSize(17),
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getScaleSize(10),
  },
  headerBadgeIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    tintColor: COLORS.primary,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
  },

  closeBtn: {
    width: getScaleSize(30),
    height: getScaleSize(30),
    borderRadius: getScaleSize(15),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: getScaleSize(16),
    paddingBottom: getScaleSize(28),
    flexGrow: 1,
  },
  metaContainer: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(14),
    padding: getScaleSize(14),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: getScaleSize(14),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: getScaleSize(4),
    minHeight: getScaleSize(44),
  },
  metaRowSingleLine: {
    alignItems: 'center',
    minHeight: getScaleSize(44),
  },
  metaLabelContainer: {
    flex: 1,
    paddingRight: getScaleSize(8),
  },
  metaLabel: {
    lineHeight: getScaleSize(18),
  },
  metaValueContainer: {
    flex: 1.25,
    alignItems: 'flex-end',
  },
  metaValuePrimary: {
    lineHeight: getScaleSize(18),
    textAlign: 'right',
  },
  metaValueSecondary: {
    lineHeight: getScaleSize(16),
    textAlign: 'right',
    marginTop: getScaleSize(2),
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: getScaleSize(6),
  },
  preambleText: {
    marginBottom: getScaleSize(10),
    paddingHorizontal: getScaleSize(2),
  },
  commitmentsCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(14),
    padding: getScaleSize(14),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: getScaleSize(14),
    gap: getScaleSize(10),
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: getScaleSize(6),
    height: getScaleSize(6),
    borderRadius: getScaleSize(3),
    backgroundColor: COLORS.primary,
    marginTop: getScaleSize(6),
    marginRight: getScaleSize(10),
  },
  bulletText: {
    flex: 1,
    lineHeight: getScaleSize(18),
  },
  legalBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: getScaleSize(12),
    padding: getScaleSize(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: getScaleSize(14),
  },
  legalParagraph: {
    lineHeight: getScaleSize(17),
    marginBottom: getScaleSize(8),
  },
  validationCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(14),
    padding: getScaleSize(14),
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: getScaleSize(10),
  },
  validationCardChecked: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  validationCardError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: getScaleSize(10),
  },
  checkboxBox: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    borderRadius: getScaleSize(6),
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getScaleSize(10),
    marginTop: getScaleSize(1),
  },
  checkboxBoxChecked: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  checkboxBoxError: {
    borderColor: '#EF4444',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  traceabilitySubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: getScaleSize(6),
  },
  confirmButton: {
    width: '100%',
    marginTop: getScaleSize(14),
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.slate400,
    shadowOpacity: 0.05,
    elevation: 0,
  },
  cancelTextButton: {
    marginTop: getScaleSize(10),
    marginBottom: getScaleSize(8),
    paddingVertical: getScaleSize(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
