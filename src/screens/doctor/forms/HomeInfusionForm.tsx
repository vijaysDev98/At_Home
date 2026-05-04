import React, { useState, useRef } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import moment from 'moment';

import { ActionSheetRef } from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker';
import {
  AppText,
  Input,
  WarningSheet,
  FormPatientSection,
  FormPrescriberSection,
  FormFacilitySection,
  AppDurationPicker,
  AppDurationPickerRef,
} from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';

const HomeInfusionForm: React.FC = () => {
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
        route: '', // central_cvp, peritoneal, peripheral, subcutaneous
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

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  React.useEffect(() => {
    setState(prevState => {
      const newProducts = prevState.products.map(product => {
        const a = parseInt(product.frequency) || 0;
        let M = 0;

        if (product.startDate && product.endDate) {
          const start = moment(product.startDate, 'DD/MM/YYYY');
          const end = moment(product.endDate, 'DD/MM/YYYY');
          if (start.isValid() && end.isValid()) {
            M = end.diff(start, 'days') + 1;
          }
        } else if (product.treatmentDuration) {

          M = parseInt(product.treatmentDuration) || 0;
        }

        const calculatedTNI = (M > 0 && a > 0 ? M * a : 0).toString();
        if (product.totalInfusions !== calculatedTNI) {
          return { ...product, totalInfusions: calculatedTNI };
        }
        return product;
      });

      if (JSON.stringify(prevState.products) !== JSON.stringify(newProducts)) {
        return { ...prevState, products: newProducts };
      }
      return prevState;
    });
  }, [state.products]);

  const updateProduct = (index: number, key: string, value: any) => {
    setState(prevState => {
      const newProducts = [...prevState.products];
      newProducts[index] = { ...newProducts[index], [key]: value };
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

  const renderProductSection = (index: number) => {
    const product = state.products[index];

    return (
      <View key={index} style={styles.card}>
        <View style={styles.productHeader}>
          <AppText
            size={getScaleSize(15)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            Infusion Product No. {index + 1}
          </AppText>
          {index > 0 && (
            <TouchableOpacity
              onPress={() => {
                const newProducts = state.products.filter(
                  (_, i) => i !== index,
                );
                setState({ ...state, products: newProducts });
              }}
            >
              <AppText color={COLORS.returned} size={getScaleSize(12)}>
                Remove
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.row}>
          <Input
            label="Product name"
            placeholder="Name"
            value={product.name}
            onChangeText={val => updateProduct(index, 'name', val)}
            style={{
              flex: 1,
              paddingHorizontal: getScaleSize(0),
              marginBottom: getScaleSize(10),
            }}
          />
          <Input
            label="Strength"
            placeholder="Strength"
            value={product.strength}
            onChangeText={val => updateProduct(index, 'strength', val)}
            style={{
              flex: 1,
              paddingHorizontal: getScaleSize(0),
              marginBottom: getScaleSize(10),
            }}
          />
        </View>

        <View style={[styles.row, { alignItems: 'center' }]}>
          <Input
            label="Diluent (ml)"
            placeholder="e.g. 100"
            value={product.diluent}
            onChangeText={val => updateProduct(index, 'diluent', val)}
            style={{
              flex: 1,
              paddingHorizontal: getScaleSize(0),
              marginBottom: getScaleSize(10),
            }}
            keyboardType="numeric"
          />
          <View
            style={[
              styles.checkboxItem,
              { flex: 1, paddingTop: getScaleSize(28) },
            ]}
          >
            <CheckBox
              boxType="square"
              value={product.withoutDiluent}
              onValueChange={val => updateProduct(index, 'withoutDiluent', val)}
              tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
            />

            <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
              Without Diluent
            </AppText>
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
              label="Duration (Hours)"
              placeholder="HH"
              value={product.durationHours}
              style={{
                flex: 1,
                paddingHorizontal: getScaleSize(0),
                marginBottom: getScaleSize(10),
              }}
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
              label="Duration (Minutes)"
              placeholder="MM"
              value={product.durationMinutes}
              style={{
                flex: 1,
                paddingHorizontal: getScaleSize(0),
                marginBottom: getScaleSize(10),
              }}
              pointerEvents="none"
            />
          </TouchableOpacity>
        </View>

        <Input
          label="Frequency of infusion(s) per day"
          placeholder="e.g. 3"
          value={product.frequency}
          onChangeText={val => updateProduct(index, 'frequency', val)}
          style={styles.inputField}
          keyboardType="numeric"
        />

        {/* Route of access */}
        <AppText
          size={getScaleSize(14)}
          font={FONTS.Inter.Bold}
          color={COLORS._1A1D1F}
          style={{ marginBottom: getScaleSize(8) }}
        >
          Route of access
        </AppText>
        <View style={styles.radioGroup}>
          <View style={styles.checkboxItem}>
            <CheckBox
              boxType="circle"
              value={product.route === 'central_cvp'}
              onValueChange={() => updateProduct(index, 'route', 'central_cvp')}
              tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
            />
            <AppText color={COLORS._1A1D1F}>Central venous (CVP)</AppText>
          </View>

          {product.route === 'central_cvp' && (
            <View style={styles.subOptions}>
              {['Implanted port', 'Central catheter', 'PICC'].map(type => (
                <View key={type} style={styles.checkboxItem}>
                  <CheckBox
                    boxType="circle"
                    value={product.centralType === type}
                    onValueChange={() =>
                      updateProduct(index, 'centralType', type)
                    }
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />
                  <AppText size={getScaleSize(13)} color={COLORS._6F767E}>
                    {type}
                  </AppText>
                </View>
              ))}
            </View>
          )}

          {['Peritoneal', 'Peripheral venous', 'Subcutaneous'].map(r => (
            <View key={r} style={styles.checkboxItem}>
              <CheckBox
                boxType="circle"
                value={product.route === r.toLowerCase()}
                onValueChange={() =>
                  updateProduct(index, 'route', r.toLowerCase())
                }
                tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
              />
              <AppText color={COLORS._1A1D1F}>{r}</AppText>
            </View>
          ))}
        </View>

        {/* Mode of administration */}
        <AppText
          size={getScaleSize(14)}
          font={FONTS.Inter.Bold}
          color={COLORS._1A1D1F}
          style={{ marginBottom: getScaleSize(8), marginTop: getScaleSize(12) }}
        >
          Mode of administration
        </AppText>
        <View style={styles.radioRow}>
          {[
            { label: 'Gravity', value: 'gravity' },
            { label: 'Elastomeric diffuser', value: 'elastomeric' },
            { label: 'Electric infusion pump', value: 'electric' },
          ].map(m => (
            <View key={m.value} style={styles.checkboxItem}>
              <CheckBox
                boxType="circle"
                value={product.mode === m.value}
                onValueChange={() => updateProduct(index, 'mode', m.value)}
                tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
              />
              <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
                {m.label}
              </AppText>
            </View>
          ))}
        </View>

        <View style={[styles.row, { marginTop: getScaleSize(12) }]}>
          <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
            The patient must remain ambulatory during treatment? :
          </AppText>
          <View style={styles.row}>
            <View style={styles.checkboxItem}>
              <CheckBox
                boxType="circle"
                value={product.ambulatory === 'yes'}
                onValueChange={() => updateProduct(index, 'ambulatory', 'yes')}
                tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
              />
              <AppText size={getScaleSize(13)}>yes</AppText>
            </View>
            <AppText size={getScaleSize(13)}>or</AppText>
            <View style={styles.checkboxItem}>
              <CheckBox
                boxType="circle"
                value={product.ambulatory === 'no'}
                onValueChange={() => updateProduct(index, 'ambulatory', 'no')}
                tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
              />
              <AppText size={getScaleSize(13)}>no</AppText>
            </View>
          </View>
        </View>

        <View
          style={[styles.checkboxItem, { marginVertical: getScaleSize(10) }]}
        >
          <CheckBox
            boxType="square"
            value={product.supervision}
            onValueChange={val => updateProduct(index, 'supervision', val)}
            tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
          />

          <AppText size={getScaleSize(13)} color={COLORS._6F767E}>
            If filled/prepared under the supervision of a healthcare facility,
            tick this box:
          </AppText>
        </View>

        {/* Dates */}
        <View style={styles.row}>
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
              label="Start date of treatment cycle"
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
              label="End date of treatment cycle"
              placeholder="DD/MM/YYYY"
              value={product.endDate}
              style={{ flex: 1, paddingHorizontal: 0 }}
              pointerEvents="none"
            />
          </TouchableOpacity>
        </View>
        <View style={[styles.row, { marginTop: getScaleSize(12) }]}>
          <Input
            label="or Treatment duration (days)"
            placeholder="days"
            value={product.treatmentDuration}
            onChangeText={val => updateProduct(index, 'treatmentDuration', val)}
            style={[styles.inputField, { flex: 1 }]}
            keyboardType="numeric"
          />
        </View>

        <View style={{ marginTop: getScaleSize(12) }}>
          <Input
            label="Total number of infusions (TNI):"
            placeholder="(Automatic)"
            value={product.totalInfusions}
            onChangeText={val => updateProduct(index, 'totalInfusions', val)}
            style={styles.inputField}
            keyboardType="numeric"
            editable={false}
          />
        </View>

        <View style={[styles.checkboxItem]}>
          <CheckBox
            boxType="square"
            value={product.infusedAlone}
            onValueChange={val => updateProduct(index, 'infusedAlone', val)}
            tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
          />

          <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
            If this treatment must be infused ALONE, tick this box
          </AppText>
        </View>
      </View>
    );
  };

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
              Home Infusion Prescription Form
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
            {renderSectionHeader('Prescription date', IMAGES.ic_calender)}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setPickerType('prescriptionDate');
                setOpen(true);
              }}
            >
              <Input
                editable={false}
                // label="Prescription date"
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
          <FormFacilitySection
            state={state}
            setState={setState}
          ></FormFacilitySection>

          {/* INFUSION PRODUCTS */}
          {state.products.map((_, i) => renderProductSection(i))}

          <TouchableOpacity style={styles.addProductBtn} onPress={addProduct}>
            <AppText
              color={COLORS.primary}
              font={FONTS.Inter.Bold}
              size={getScaleSize(14)}
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
    // marginTop: 16,
    // paddingHorizontal: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: getScaleSize(17),
    borderRadius: getScaleSize(16),
    // marginHorizontal: 16,
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
    marginBottom: getScaleSize(12),
    paddingHorizontal: getScaleSize(0),
  },
  row: {
    flexDirection: 'row',
    gap: getScaleSize(5),
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  radioRow: {
    flexDirection: 'row',
    gap: getScaleSize(15),
    alignItems: 'center',
    flexWrap: 'wrap',
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
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getScaleSize(16),
  },
  addProductBtn: {
    // marginHorizontal: getScaleSize(16),
    marginVertical: getScaleSize(12),
    padding: getScaleSize(16),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  radioGroup: {
    gap: getScaleSize(10),
  },
  subOptions: {
    marginLeft: getScaleSize(28),
    gap: getScaleSize(8),
    marginBottom: getScaleSize(4),
  },
});

export default HomeInfusionForm;
