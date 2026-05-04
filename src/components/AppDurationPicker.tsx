import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import AppText from './AppText';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';

const ITEM_HEIGHT = getScaleSize(50);
const VISIBLE_ITEMS = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface AppDurationPickerProps {
  onConfirm: (hours: string, minutes: string) => void;
  title?: string;
}

export interface AppDurationPickerRef {
  show: (currentHours?: string, currentMinutes?: string) => void;
  hide: () => void;
}

const AppDurationPicker = forwardRef<
  AppDurationPickerRef,
  AppDurationPickerProps
>(({ onConfirm, title = 'Select time' }, ref) => {
  const [visible, setVisible] = useState(false);
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('00');

  const hourOptions = [
    '',
    ...Array.from({ length: 24 }, (_, i) => i.toString()),
    '',
  ];
  const minuteOptions = [
    '',
    ...Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')),
    '',
  ];

  const hoursListRef = useRef<FlatList>(null);
  const minutesListRef = useRef<FlatList>(null);

  useImperativeHandle(ref, () => ({
    show: (currentHours?: string, currentMinutes?: string) => {
      setHours(currentHours || '0');
      setMinutes(currentMinutes || '00');
      setVisible(true);
    },
    hide: () => setVisible(false),
  }));

  useEffect(() => {
    if (visible) {
      // Scroll to initial values after a short delay to ensure FlatList is ready
      setTimeout(() => {
        const hIndex = parseInt(hours) || 0;
        const mIndex = parseInt(minutes) || 0;
        hoursListRef.current?.scrollToOffset({
          offset: hIndex * ITEM_HEIGHT,
          animated: false,
        });
        minutesListRef.current?.scrollToOffset({
          offset: mIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 100);
    }
  }, [visible]);

  const handleConfirm = () => {
    onConfirm(hours, minutes);
    setVisible(false);
  };

  const onScroll =
    (type: 'hours' | 'minutes') =>
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.y;
      const index = Math.round(offset / ITEM_HEIGHT);
      if (type === 'hours') {
        const val = hourOptions[index + 1];
        if (val !== '') setHours(val);
      } else {
        const val = minuteOptions[index + 1];
        if (val !== '') setMinutes(val);
      }
    };

  const renderItem = ({ item }: { item: string }) => (
    <View style={styles.item}>
      <AppText
        size={getScaleSize(22)}
        font={FONTS.Inter.Medium}
        color={item === '' ? 'transparent' : COLORS._1A1D1F}
      >
        {item}
      </AppText>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <AppText
              size={getScaleSize(22)}
              font={FONTS.Inter.SemiBold}
              color={COLORS._1A1D1F}
            >
              {title}
            </AppText>
          </View>

          <View style={styles.pickerWrapper}>
            <View style={styles.pickerContainer}>
              {/* Hours */}
              <View style={styles.columnWrapper}>
                <View style={styles.highlightBar} />
                <FlatList
                  ref={hoursListRef}
                  data={hourOptions}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => `hour-${index}`}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  onMomentumScrollEnd={onScroll('hours')}
                  getItemLayout={(_, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                  })}
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
                />
              </View>

              {/* Minutes */}
              <View style={styles.columnWrapper}>
                <View style={styles.highlightBar} />
                <FlatList
                  ref={minutesListRef}
                  data={minuteOptions}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => `minute-${index}`}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  onMomentumScrollEnd={onScroll('minutes')}
                  getItemLayout={(_, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                  })}
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
                />
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={styles.button}
            >
              <AppText
                size={getScaleSize(16)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                Cancel
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.button}>
              <AppText
                size={getScaleSize(16)}
                font={FONTS.Inter.Bold}
                color={COLORS.primary}
              >
                Confirm
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(24),
    padding: getScaleSize(24),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    marginBottom: getScaleSize(30),
  },
  pickerWrapper: {
    height: PICKER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getScaleSize(30),
  },
  pickerContainer: {
    flexDirection: 'row',
    width: '100%',
    height: PICKER_HEIGHT,
    gap: getScaleSize(12),
  },
  columnWrapper: {
    flex: 1,
    height: PICKER_HEIGHT,
  },
  list: {
    flex: 1,
  },
  listContent: {
    // paddingVertical: ITEM_HEIGHT, // Already handled by empty strings at start/end
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightBar: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    width: '70%',
    alignSelf: 'center',
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS._1A1D1F,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: getScaleSize(24),
  },
  button: {
    paddingVertical: getScaleSize(8),
    paddingHorizontal: getScaleSize(4),
  },
});

export default AppDurationPicker;
