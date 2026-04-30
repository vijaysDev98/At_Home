// import React, { useMemo, useState } from 'react';
// import {
//   Image,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../../navigation';
// import { AppSafeAreaView, AppText, Input } from '../../components';
// import { getScaleSize } from '../../utils/scaleSize';
// import { COLORS, FONTS, REGEX } from '../../utils';
// import { IMAGES } from '../../assets/images';

// const LOGO_URI = 'https://storage.googleapis.com/uxpilot-auth.appspot.com/b8dc346b0e-dacb1354ad85e642c274.png';

// export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

// const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState({
//     email: '',
//     password: '',
//   });
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);

//   const isDisabled = useMemo(() => email.trim() === '' || password.trim() === '', [email, password]);
// console.log("isDisabled",isDisabled)
//   const onSubmit = () => {
//     // const isValidPassword = password === 'correctpass';
//     // if (!isValidPassword) {
//     //   setError('Incorrect password. Please try again.');
//     //   return;
//     // }

//     if(!email){
//       setError((prev)=>({
//         ...prev,
//         email: 'Email is required',
//       }));
//       return;
//     }
//     else if(!password){
//       setError((prev)=>({
//         ...prev,
//         password: 'Password is required',
//       }));
//       return;
//     }
//      else if (!REGEX.EMAIL_RE.test(email)) {
//       console.log("asbcdjvjsd")
//       setError((prev)=>({
//         ...prev,
//         email: 'Please enter a valid email',
//       }));
//       return;
//     }

//     // setError('');
//     // navigation.replace('DoctorBottomTabs');
//     // navigation.navigate('ProviderBottomTabs')
//   };

//   console.log("error",error)
//   return (

//     <AppSafeAreaView
//     style={{backgroundColor:COLORS._E5E7EB,paddingHorizontal:getScaleSize(16)}}
//     >
//         <View style={styles.hero}>
//             <Image
//                      source={IMAGES.logo}
//                      style={styles.logo}
//                      resizeMode='cover'
//                    />
//           <AppText
//           size={getScaleSize(24)}
//           font={FONTS.Inter.Bold}
//           color={COLORS.primary}
//           >
//             Welcome Back
//           </AppText>
//           <AppText
//           size={getScaleSize(14)}
//           font={FONTS.Inter.SemiBold}
//           color={COLORS.primaryMuted}
//           style={{marginTop:getScaleSize(16)}}
//           >
//             Sign in to your At-Home account
//           </AppText>
//         </View>

//         <View style={styles.card}>

//          <Input
//               value={email}
//               onChangeText={setEmail}
//               onFocus={()=>setError((prev)=>({...prev, email: ''}))}
//               placeholder="name@example.com"
//               keyboardType="email-address"
//               autoCapitalize="none"
//               autoCorrect={false}
//              label={"Email Address"}
//               style={styles.inputInner}
//               error={error?.email || ''}
//             />
//  <View style={styles.labelRow}>
//               <AppText style={styles.fieldLabel} weight="700" size={13} color={COLORS.slate900}>
//                 Password
//               </AppText>
//               <TouchableOpacity
//               onPress={()=>{
//                 navigation.navigate("ForgotPassword")
//               }}
//               activeOpacity={0.7}>
//                 <AppText style={styles.forgot} weight="700" size={13} color={COLORS.primaryMuted}>
//                   Forgot?
//                 </AppText>
//               </TouchableOpacity>
//             </View>
//        <Input
//               value={password}
//               onChangeText={setPassword}
//               placeholder={"enter your password"}
//              error={error?.password || ''}
//               isPasswordVisible={!isPasswordVisible}
//               secureTextEntry={true}
//               handlePasswordVisibility={()=>{
//                 setIsPasswordVisible(!isPasswordVisible)
//               }}
//             />
//           <TouchableOpacity
//             disabled={isDisabled}
//             onPress={onSubmit}
//             activeOpacity={0.85}
//             style={[styles.button,
//               isDisabled && styles.buttonDisabled
//             ]}
//           >
//             <AppText
//             size={getScaleSize(16)}
//             color={COLORS.white}
//             >
//               Login
//             </AppText>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.securityRow}>
//           <AppText style={styles.securityIcon}>🛡️</AppText>
//           <AppText style={styles.securityText} size={12} color={COLORS.slate600} weight="600">
//             Secure, encrypted connection
//           </AppText>
//         </View>

//         <View style={styles.registerRow}>
//           <AppText style={styles.registerText} size={14} color={COLORS.primaryMuted}>
//             Don't have an account?
//           </AppText>
//           <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Register')}>
//             <AppText style={styles.registerLink} size={14} color={COLORS.primary} weight="700">
//               Register here
//             </AppText>
//           </TouchableOpacity>
//         </View>
//       {/* </ScrollView> */}
//     </AppSafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   root: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   scrollContent: {
//     paddingTop: 64,
//     paddingHorizontal: 28,
//     paddingBottom: 48,
//   },
//   hero: {
//     alignItems: 'center',
//     marginBottom: 28,
//   },
//   logoCircle: {
//     width: 92,
//     height: 92,
//     borderRadius: 46,
//     backgroundColor: COLORS.slate200,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: COLORS.shadow,
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   logo: {
//     width: 192,
//     height: 192,
//   },
//   heading: {
//     fontSize: 24,
//     fontWeight: '800',
//     color: COLORS.primary,
//   },
//   subHeading: {
//     fontSize: 14,
//     color: COLORS.primaryMuted,
//     textAlign: 'center',
//   },
//   card: {
//     backgroundColor: COLORS.white,
//     borderRadius: 16,
//     padding: 24,
//     borderWidth: 1,
//     borderColor: COLORS.slate200,
//     shadowColor: COLORS.shadow,
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 3,
//     gap: 18,
//   },
//   fieldBlock: {
//     gap: 8,
//   },
//   labelRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     // marginBottom: 8,
//   },
//   forgot: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: COLORS.primaryMuted,
//   },
//   fieldLabel: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: COLORS.slate900,
//   },

//   errorRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginTop: 6,
//   },
//   errorText: {
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   button: {
//     height: 52,
//     borderRadius: 12,
//     backgroundColor: COLORS.primary,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 4,
//   },
//   buttonDisabled: {
//     opacity:0.75,
//   },

//   securityRow: {
//     marginTop: 24,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//   },
//   securityIcon: {
//     fontSize: 13,
//   },
//   securityText: {
//     fontSize: 12,
//     color: COLORS.slate600,
//     fontWeight: '600',
//   },
//   registerRow: {
//     marginTop: 32,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 6,
//   },
//   registerText: {
//     fontSize: 14,
//     color: COLORS.primaryMuted,
//   },
//   registerLink: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '700',
//   },
// });

// export default LoginScreen;

import React, { useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import {
  AppSafeAreaView,
  AppText,
  Input,
  PrimaryButton,
} from '../../components';
import { getScaleSize } from '../../utils/scaleSize';
import { COLORS, FONTS, REGEX } from '../../utils';
import { IMAGES } from '../../assets/images';
import { STRING } from '../../constant/strings';
import NavigationService from '../../navigation/NavigationService';
import { SCREENS } from '../../navigation/routes';

export type LoginScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Login'
>;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState({
    email: '',
    password: '',
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isDisabled = useMemo(
    () => email.trim() === '' || password.trim() === '',
    [email, password],
  );

  const onSubmit = () => {
    NavigationService.reset(SCREENS.PROVIDER_BOTTOM_TABS);
    return;
    // 🔥 Reset errors
    setError({ email: '', password: '' });

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    let isValid = true;

    // ✅ Email validation
    if (!trimmedEmail) {
      setError(prev => ({ ...prev, email: STRING.emailRequired }));
      isValid = false;
    } else if (!REGEX.EMAIL_RE.test(trimmedEmail)) {
      setError(prev => ({ ...prev, email: STRING.invalidEmail }));
      isValid = false;
    }

    // ✅ Password validation
    if (!trimmedPassword) {
      setError(prev => ({ ...prev, password: STRING.passwordRequired }));
      isValid = false;
    }

    if (!isValid) return;

    // ✅ Static credentials check for demonstration
    // if (
    //   trimmedEmail.toLocaleLowerCase() === 'test@gmail.com' &&
    //   trimmedPassword === 'Test@123'
    // ) {
    //   // navigation.replace('DoctorBottomTabs');
    //   NavigationService.navigate('DoctorBottomTabs');
    //   return;
    // }

    // ✅ Mock failure for demonstration (matching the reference image error)
    setError(prev => ({
      ...prev,
      password: STRING.incorrectPassword,
    }));
  };

  return (
    <AppSafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.hero}>
          <Image
            source={IMAGES.logo}
            style={styles.logo}
            resizeMode="contain"
          />

          <AppText
            size={getScaleSize(32)}
            font={FONTS.Inter.Bold}
            color={COLORS.primary}
            align="center"
          >
            {STRING.welcomeBack}
          </AppText>

          <AppText
            size={getScaleSize(15)}
            font={FONTS.Inter.Regular}
            color={COLORS.primaryMuted}
            style={{ marginTop: getScaleSize(12) }}
            align="center"
          >
            {STRING.welcomeBackMessage}{' '}
          </AppText>
        </View>

        {/* FORM CARD */}
        <View style={styles.card}>
          {/* EMAIL */}
          <Input
            value={email}
            onChangeText={text => {
              setEmail(text);
              setError(prev => ({ ...prev, email: '' }));
            }}
            placeholder={STRING.enterEmailAddress}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            label={STRING.emailAddress}
            error={error?.email || ''}
            style={styles.field}
            containerBackgroundColor={COLORS._F8F9FA}
          />

          {/* PASSWORD */}
          <Input
            value={password}
            onChangeText={text => {
              setPassword(text);
              setError(prev => ({ ...prev, password: '' }));
            }}
            placeholder={STRING.enterPassword}
            label={STRING.password}
            labelRight={
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                activeOpacity={0.7}
              >
                <AppText
                  size={getScaleSize(13)}
                  color={COLORS.primary}
                  font={FONTS.Inter.SemiBold}
                >
                  {STRING.forgotQuestion}
                </AppText>
              </TouchableOpacity>
            }
            containerBackgroundColor={COLORS._F8F9FA}
            error={error?.password || ''}
            secureTextEntry={true}
            isPasswordVisible={isPasswordVisible}
            handlePasswordVisibility={() => setIsPasswordVisible(prev => !prev)}
            style={styles.field}
          />

          {/* LOGIN BUTTON */}
          <PrimaryButton
            title={STRING.login}
            onPress={onSubmit}
            // disabled={isDisabled}
            style={{ marginTop: getScaleSize(12) }}
          />

          {/* SECURITY ROW */}
          <View style={styles.securityRow}>
            <Image
              source={IMAGES.securityIcon}
              style={{ width: 14, height: 14, tintColor: COLORS.primaryMuted }}
            />
            <AppText
              size={getScaleSize(13)}
              color={COLORS.primaryMuted}
              font={FONTS.Inter.Medium}
            >
              {STRING.secureEncryptedConnection}
            </AppText>
          </View>
        </View>

        {/* REGISTER FOOTER */}
        <View style={styles.footer}>
          <View style={styles.registerRow}>
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Regular}
              color={COLORS.primaryMuted}
            >
              {STRING.dontHaveAnAccount}{' '}
            </AppText>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Register')}
            >
              <AppText
                size={getScaleSize(15)}
                color={COLORS.primary}
                font={FONTS.Inter.SemiBold}
              >
                {STRING.registerHere}
              </AppText>
            </TouchableOpacity>
          </View>

          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.Medium}
            color={COLORS.primaryMuted}
            align="center"
            style={styles.adminNote}
          >
            {STRING.logInMessage}
          </AppText>
        </View>
      </ScrollView>
    </AppSafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  scrollContent: {
    paddingBottom: getScaleSize(40),
  },
  hero: {
    alignItems: 'center',
    marginTop: getScaleSize(60),
    marginBottom: getScaleSize(32),
    paddingHorizontal: getScaleSize(24),
  },
  logo: {
    width: getScaleSize(96),
    height: getScaleSize(96),
    marginBottom: getScaleSize(24),
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(24),
    padding: getScaleSize(25),
    marginHorizontal: getScaleSize(24),
    borderWidth: 1,
    borderColor: '#e2e8f0', // Very light border like in screenshot
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  field: {
    paddingHorizontal: 0,
    marginBottom: getScaleSize(20),
  },
  securityRow: {
    marginTop: getScaleSize(20),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    marginTop: getScaleSize(40),
    paddingHorizontal: getScaleSize(24),
    alignItems: 'center',
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getScaleSize(12),
  },
  adminNote: {
    lineHeight: 20,
    width: '80%',
  },
});
