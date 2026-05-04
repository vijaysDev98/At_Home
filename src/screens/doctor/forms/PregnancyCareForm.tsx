import React, { useState, useRef } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { ActionSheetRef } from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

import {
  FormFacilitySection,
  AppDurationPicker,
  AppDurationPickerRef,
  Input,
  AppText,
  WarningSheet,
  FormPatientSection,
  FormPrescriberSection,
} from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';

const PregnancyCareForm: React.FC = () => {
  const warningSheetRef = useRef<ActionSheetRef>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [pickerType, setPickerType] = useState<string | null>(null);
  const [activeProductIndex, setActiveProductIndex] = useState<number | null>(
    null,
  );
  const durationPickerRef = useRef<AppDurationPickerRef>(null);

  const [state, setState] = useState({
    prescriptionDate: '',
    homeInfusionTherapy: false,
    renewalModification: false,

    patientLastName: '',
    patientFirstName: '',
    patientDOB: '',
    patientWeight: '',
    patientNIR: '',
    careRelatedToALD: false,

    prescriberLastName: 'Jenkins',
    prescriberFirstName: 'Sarah',
    prescriberPhone: '01 23 45 67 89',
    prescriberRPPS: '12345678901',

    hospitalName: '',
    hospitalAddress: '',
    finessNo: '1234567',
    formsFor: '',

    products: [
      {
        id: 1,
        name: '',
        strength: '',
        diluent: '',
        withoutDiluent: false,
        durationHours: '',
        durationMinutes: '',
        frequency: '',
        frequencyPer: '',
        route: '', // central_cv, perineural, peripheral, subcutaneous
        centralType: '', // implanted, catheter, picc
        mode: '', // gravity, elastomeric, electric
        ambulatory: '', // yes, no
        supervision: false,
        startDate: '',
        endDate: '',
        treatmentDuration: '',
        totalInfusions: '',
        infusedAlone: false,
      },
    ],
  });

  const updateProduct = (index: number, key: string, value: any) => {
    setState(prevState => {
      const newProducts = [...prevState.products];
      (newProducts[index] as any)[key] = value;
      return { ...prevState, products: newProducts };
    });
  };

  const addProduct = () => {
    setState({
      ...state,
      products: [
        ...state.products,
        {
          id: state.products.length + 1,
          name: '',
          strength: '',
          diluent: '',
          withoutDiluent: false,
          durationHours: '',
          durationMinutes: '',
          frequency: '',
          frequencyPer: '',
          route: '',
          centralType: '',
          mode: '',
          ambulatory: '',
          supervision: false,
          startDate: '',
          endDate: '',
          treatmentDuration: '',
          totalInfusions: '',
          infusedAlone: false,
        },
      ],
    });
  };

  const renderSectionHeader = (title: string, icon?: any) => (
    <View style={styles.sectionHeader}>
      {icon && <Image source={icon} style={styles.sectionIcon} />}
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
    <>
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
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
              Pregnancy Related Care
            </AppText>
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Medium}
              color={COLORS._6F767E}
              style={{ marginTop: getScaleSize(4) }}
            >
              Tick the appropriate boxes on the form
            </AppText>
          </View>

          {/* Prescription Date & Main Options */}
          <View style={styles.card}>
            {renderSectionHeader('Prescription date', IMAGES.person)}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setPickerType('prescriptionDate');
                setOpen(true);
              }}
            >
              <Input
                editable={false}
                label="Prescription date"
                placeholder="DD/MM/YYYY"
                value={state.prescriptionDate}
                style={styles.inputField}
                pointerEvents="none"
              />
            </TouchableOpacity>
            <DatePicker
              modal
              mode="date"
              open={open}
              date={date}
              onConfirm={d => {
                setOpen(false);
                setDate(d);

                if (pickerType === 'prescriptionDate') {
                  const formattedDate = moment(d).format('DD/MM/YYYY');
                  setState({ ...state, prescriptionDate: formattedDate });
                } else if (activeProductIndex !== null) {
                  if (pickerType === 'startDate' || pickerType === 'endDate') {
                    const formattedDate = moment(d).format('DD/MM/YYYY');
                    updateProduct(
                      activeProductIndex,
                      pickerType,
                      formattedDate,
                    );
                  }
                }

                setPickerType(null);
                setActiveProductIndex(null);
              }}
              onCancel={() => {
                setOpen(false);
                setPickerType(null);
                setActiveProductIndex(null);
              }}
            />

            <AppDurationPicker
              ref={durationPickerRef}
              onConfirm={(h, m) => {
                if (activeProductIndex !== null) {
                  updateProduct(activeProductIndex, 'durationHours', h);
                  updateProduct(activeProductIndex, 'durationMinutes', m);
                }
                setActiveProductIndex(null);
              }}
            />

            <View style={styles.checkboxGroup}>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.homeInfusionTherapy}
                  onValueChange={val =>
                    setState({ ...state, homeInfusionTherapy: val })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  Start of home infusion therapy
                </AppText>
              </View>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.renewalModification}
                  onValueChange={val =>
                    setState({ ...state, renewalModification: val })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  Renewal or modification
                </AppText>
              </View>
            </View>
          </View>

          {/* PATIENT SECTION */}
          <FormPatientSection state={state} setState={setState} />

          {/* PRESCRIBER IDENTIFICATION */}
          <FormPrescriberSection state={state} setState={setState} />

          {/* FACILITY SECTION */}
          <FormFacilitySection state={state} setState={setState} />

          {/* INFUSION PRODUCTS */}
          {state.products.map((product, index) => (
            <View key={product.id} style={styles.card}>
              {renderSectionHeader(`Infusion product No. ${index + 1}`)}

              <Input
                label="Product name"
                placeholder="Product name"
                value={product.name}
                onChangeText={t => updateProduct(index, 'name', t)}
                style={styles.inputField}
              />
              <Input
                label="Strength (concentration)"
                placeholder="Strength"
                value={product.strength}
                onChangeText={t => updateProduct(index, 'strength', t)}
                style={styles.inputField}
              />

              <View style={styles.row}>
                <Input
                  label="Diluent"
                  placeholder="ml"
                  value={product.diluent}
                  onChangeText={t => updateProduct(index, 'diluent', t)}
                  style={{ flex: 1, paddingHorizontal: 0 }}
                />
                <View
                  style={[styles.checkboxItem, { marginTop: getScaleSize(22) }]}
                >
                  <CheckBox
                    value={product.withoutDiluent}
                    onValueChange={v =>
                      updateProduct(index, 'withoutDiluent', v)
                    }
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />
                  <AppText size={getScaleSize(13)}>Without Diluent</AppText>
                </View>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{ flex: 1 }}
                  onPress={() => {
                    setActiveProductIndex(index);
                    durationPickerRef.current?.show(
                      product.durationHours,
                      product.durationMinutes,
                    );
                  }}
                >
                  <Input
                    editable={false}
                    label="Duration (hh)"
                    placeholder="hh"
                    value={product.durationHours}
                    style={{ flex: 1, paddingHorizontal: 0 }}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{ flex: 1 }}
                  onPress={() => {
                    setActiveProductIndex(index);
                    durationPickerRef.current?.show(
                      product.durationHours,
                      product.durationMinutes,
                    );
                  }}
                >
                  <Input
                    editable={false}
                    label="Duration (mm)"
                    placeholder="mm"
                    value={product.durationMinutes}
                    style={{ flex: 1, paddingHorizontal: 0 }}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <Input
                  label="Frequency"
                  placeholder="e.g. 1"
                  value={product.frequency}
                  onChangeText={t => updateProduct(index, 'frequency', t)}
                  style={{ flex: 1, paddingHorizontal: 0 }}
                  keyboardType="numeric"
                />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: getScaleSize(22),
                  }}
                >
                  <AppText size={getScaleSize(13)}>per</AppText>
                  <TextInput
                    placeholder="day"
                    value={product.frequencyPer}
                    onChangeText={t => updateProduct(index, 'frequencyPer', t)}
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: COLORS.primary,
                      width: getScaleSize(40),
                      textAlign: 'center',
                      padding: 0,
                      fontFamily: FONTS.Inter.Bold,
                      color: COLORS.primary,
                    }}
                  />
                </View>
              </View>

              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                style={{ marginTop: getScaleSize(16), marginBottom: 8 }}
              >
                Route of access
              </AppText>
              <View style={styles.checkboxGroup}>
                <View style={styles.checkboxItem}>
                  <CheckBox
                    boxType="circle"
                    value={product.route === 'central_cv'}
                    onValueChange={() =>
                      updateProduct(index, 'route', 'central_cv')
                    }
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />

                  <AppText size={getScaleSize(13)}>
                    Central venous (CV):
                  </AppText>
                </View>
                {product.route === 'central_cv' && (
                  <View style={{ marginLeft: 24, gap: 8 }}>
                    <View style={styles.checkboxItem}>
                      <CheckBox
                        boxType="circle"
                        value={product.centralType === 'implanted'}
                        onValueChange={() =>
                          updateProduct(index, 'centralType', 'implanted')
                        }
                        tintColors={{
                          true: COLORS.primary,
                          false: COLORS._6F767E,
                        }}
                      />

                      <AppText size={getScaleSize(13)}>implanted port</AppText>
                    </View>
                    <View style={styles.checkboxItem}>
                      <CheckBox
                        boxType="circle"
                        value={product.centralType === 'catheter'}
                        onValueChange={() =>
                          updateProduct(index, 'centralType', 'catheter')
                        }
                        tintColors={{
                          true: COLORS.primary,
                          false: COLORS._6F767E,
                        }}
                      />

                      <AppText size={getScaleSize(13)}>
                        central catheter
                      </AppText>
                    </View>
                    <View style={styles.checkboxItem}>
                      <CheckBox
                        boxType="circle"
                        value={product.centralType === 'picc'}
                        onValueChange={() =>
                          updateProduct(index, 'centralType', 'picc')
                        }
                        tintColors={{
                          true: COLORS.primary,
                          false: COLORS._6F767E,
                        }}
                      />

                      <AppText size={getScaleSize(13)}>PICC</AppText>
                    </View>
                  </View>
                )}
                <View style={styles.checkboxItem}>
                  <CheckBox
                    boxType="circle"
                    value={product.route === 'perineural'}
                    onValueChange={() =>
                      updateProduct(index, 'route', 'perineural')
                    }
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />

                  <AppText size={getScaleSize(13)}>Perineural</AppText>
                </View>
                <View style={styles.checkboxItem}>
                  <CheckBox
                    boxType="circle"
                    value={product.route === 'peripheral'}
                    onValueChange={() =>
                      updateProduct(index, 'route', 'peripheral')
                    }
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />

                  <AppText size={getScaleSize(13)}>Peripheral venous</AppText>
                </View>
                <View style={styles.checkboxItem}>
                  <CheckBox
                    boxType="circle"
                    value={product.route === 'subcutaneous'}
                    onValueChange={() =>
                      updateProduct(index, 'route', 'subcutaneous')
                    }
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />

                  <AppText size={getScaleSize(13)}>Subcutaneous</AppText>
                </View>
              </View>

              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                style={{ marginTop: getScaleSize(16), marginBottom: 8 }}
              >
                Mode of administration
              </AppText>
              <View
                style={{
                  flexDirection: 'row',
                  gap: getScaleSize(12),
                  flexWrap: 'wrap',
                }}
              >
                <View style={styles.checkboxItem}>
                  <CheckBox
                    boxType="circle"
                    value={product.mode === 'gravity'}
                    onValueChange={() =>
                      updateProduct(index, 'mode', 'gravity')
                    }
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />

                  <AppText size={getScaleSize(13)}>Gravity</AppText>
                </View>
                <View style={styles.checkboxItem}>
                  <CheckBox
                    boxType="circle"
                    value={product.mode === 'elastomeric'}
                    onValueChange={() =>
                      updateProduct(index, 'mode', 'elastomeric')
                    }
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />

                  <AppText size={getScaleSize(13)}>Elastomeric</AppText>
                </View>
                <View style={styles.checkboxItem}>
                  <CheckBox
                    boxType="circle"
                    value={product.mode === 'electric'}
                    onValueChange={() =>
                      updateProduct(index, 'mode', 'electric')
                    }
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />

                  <AppText size={getScaleSize(13)}>Electric pump</AppText>
                </View>
              </View>

              <View style={[styles.row, { marginTop: getScaleSize(12) }]}>
                <AppText size={getScaleSize(13)}>
                  Ambulatory during treatment?
                </AppText>
                <View style={styles.row}>
                  <View style={styles.checkboxItem}>
                    <CheckBox
                      boxType="circle"
                      value={product.ambulatory === 'yes'}
                      onValueChange={() =>
                        updateProduct(index, 'ambulatory', 'yes')
                      }
                      tintColors={{
                        true: COLORS.primary,
                        false: COLORS._6F767E,
                      }}
                    />

                    <AppText size={getScaleSize(13)}>yes</AppText>
                  </View>
                  <View style={styles.checkboxItem}>
                    <CheckBox
                      boxType="circle"
                      value={product.ambulatory === 'no'}
                      onValueChange={() =>
                        updateProduct(index, 'ambulatory', 'no')
                      }
                      tintColors={{
                        true: COLORS.primary,
                        false: COLORS._6F767E,
                      }}
                    />

                    <AppText size={getScaleSize(13)}>no</AppText>
                  </View>
                </View>
              </View>

              <View
                style={[styles.checkboxItem, { marginTop: getScaleSize(12) }]}
              >
                <CheckBox
                  boxType="square"
                  value={product.supervision}
                  onValueChange={v => updateProduct(index, 'supervision', v)}
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />
                <AppText size={getScaleSize(13)}>
                  If filled/prepared under supervision of a healthcare facility
                </AppText>
              </View>

              <View style={[styles.row, { marginTop: getScaleSize(12) }]}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{ flex: 1 }}
                  onPress={() => {
                    setPickerType('startDate');
                    setActiveProductIndex(index);
                    setOpen(true);
                  }}
                >
                  <Input
                    editable={false}
                    label="Start date"
                    placeholder="DD/MM/YYYY"
                    value={product.startDate}
                    style={{ flex: 1, paddingHorizontal: 0 }}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{ flex: 1 }}
                  onPress={() => {
                    setPickerType('endDate');
                    setActiveProductIndex(index);
                    setOpen(true);
                  }}
                >
                  <Input
                    editable={false}
                    label="End date"
                    placeholder="DD/MM/YYYY"
                    value={product.endDate}
                    style={{ flex: 1, paddingHorizontal: 0 }}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
              </View>
              <Input
                label="Treatment duration (days)"
                placeholder="days"
                value={product.treatmentDuration}
                onChangeText={t => updateProduct(index, 'treatmentDuration', t)}
                style={styles.inputField}
                keyboardType="numeric"
              />

              <View style={styles.row}>
                <AppText size={getScaleSize(13)}>
                  Total number of infusions (TNI):
                </AppText>
                <TextInput
                  placeholder="0"
                  value={product.totalInfusions}
                  onChangeText={t => updateProduct(index, 'totalInfusions', t)}
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.primary,
                    width: getScaleSize(40),
                    textAlign: 'center',
                    padding: 0,
                    fontFamily: FONTS.Inter.Bold,
                    color: COLORS.primary,
                  }}
                  keyboardType="numeric"
                />
              </View>

              <View
                style={[styles.checkboxItem, { marginTop: getScaleSize(12) }]}
              >
                <CheckBox
                  boxType="square"
                  value={product.infusedAlone}
                  onValueChange={v => updateProduct(index, 'infusedAlone', v)}
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />
                <AppText size={getScaleSize(13)}>
                  this treatment must be infused ALONE
                </AppText>
              </View>
            </View>
          ))}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={addProduct}
            style={styles.addButton}
          >
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.SemiBold}
              color={COLORS.primary}
            >
              + ADD a infusion Product
            </AppText>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <WarningSheet ref={warningSheetRef} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getScaleSize(100),
    gap: getScaleSize(12),
  },
  headerTextContainer: {
    marginBottom: getScaleSize(8),
    // marginTop: getScaleSize(16),
  },
  card: {
    backgroundColor: COLORS.white,
    padding: getScaleSize(17),
    borderRadius: getScaleSize(16),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
    marginBottom: getScaleSize(12),
  },
  sectionIcon: {
    height: getScaleSize(20),
    width: getScaleSize(20),
    resizeMode: 'contain',
  },
  inputField: {
    marginTop: getScaleSize(0),
    marginBottom: getScaleSize(10),
    paddingHorizontal: getScaleSize(0),
  },
  row: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    alignItems: 'center',
    marginBottom: getScaleSize(5),
  },
  checkboxGroup: {
    marginTop: getScaleSize(4),
    gap: getScaleSize(8),
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(4),
  },
  addButton: {
    paddingVertical: getScaleSize(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    marginTop: getScaleSize(8),
  },
});

export default PregnancyCareForm;
