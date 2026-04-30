// import React, { useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
// import { View, StyleSheet } from 'react-native';
// import BottomSheet from '@gorhom/bottom-sheet';
// import AppButton from '../AppButton';
// import AppText from '../AppText';

// const DiscardBottomSheet = forwardRef((props: any, ref) => {
//   const sheetRef = useRef<BottomSheet>(null);

//   const snapPoints = useMemo(() => ['30%'], []);

//   useImperativeHandle(ref, () => ({
//     open: () => sheetRef.current?.expand(),
//     close: () => sheetRef.current?.close(),
//   }));

//   return (
//     <BottomSheet
//       ref={sheetRef}
//       index={-1}
//       snapPoints={snapPoints}
//       enablePanDownToClose
//       backgroundStyle={styles.sheetBackground}
//       handleIndicatorStyle={styles.handle}
//     >
//       <View style={styles.container}>
//         <AppText style={styles.title}>Discard changes?</AppText>

//         <View style={styles.buttonRow}>
//           <AppButton
//             title="No"
//             onPress={() => sheetRef.current?.close()}
//             style={styles.noButton}
//             textColor="#333"
//             backgroundColor="transparent"
//             textSize={16}
//           />

//           <AppButton
//             title="Yes"
//             onPress={() => {
//               sheetRef.current?.close();
//               props.onConfirm?.();
//             }}
//             style={styles.yesButton}
//             textColor="#fff"
//             backgroundColor="#5A6D7C"
//             textSize={16}
//           />
//         </View>
//       </View>
//     </BottomSheet>
//   );
// });

// export default DiscardBottomSheet;



import React, { useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import AppButton from '../AppButton';
import AppText from '../AppText';

const DiscardBottomSheet = forwardRef((props: any, ref) => {
  const sheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['30%'], []);

  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.present(),
    close: () => sheetRef.current?.dismiss(),
  }));

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handle}
    >
      <View style={styles.container}>
        <AppText style={styles.title}>Discard changes?</AppText>

        <View style={styles.buttonRow}>
          <AppButton
            title="No"
            onPress={() => sheetRef.current?.dismiss()}
            style={styles.noButton}
            textColor="#333"
            backgroundColor="transparent"
            textSize={16}
          />

          <AppButton
            title="Yes"
            onPress={() => {
              sheetRef.current?.dismiss();
              props.onConfirm?.();
            }}
            style={styles.yesButton}
            textColor="#fff"
            backgroundColor="#5A6D7C"
            textSize={16}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
});

export default DiscardBottomSheet;


const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    backgroundColor: '#ccc',
    width: 40,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  noButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  yesButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#5A6D7C',
    alignItems: 'center',
  },
  });