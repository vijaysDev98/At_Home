// toastConfig.tsx
import React from 'react';
import { BaseToast, ErrorToast, BaseToastProps } from 'react-native-toast-message';
import { FONTS } from '../utils';

const baseStyle = {
    height: 'auto' as const,
    minHeight: 60,
    paddingVertical: 10,
};

export const toastConfig = {
    success: (props: BaseToastProps) => (
        <BaseToast
            {...props}
            style={[baseStyle, { borderLeftColor: '#2ecc71' }]}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{ fontSize: 13, fontFamily: FONTS.Inter.SemiBold }}
            text2Style={{ fontSize: 13 }}
            text1NumberOfLines={0}
            text2NumberOfLines={0}
        />
    ),
    error: (props: BaseToastProps) => (
        <ErrorToast
            {...props}
            style={[baseStyle, { borderLeftColor: '#e74c3c' }]}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{ fontSize: 13, fontFamily: FONTS.Inter.SemiBold }}
            text2Style={{ fontSize: 13 }}
            text1NumberOfLines={0}
            text2NumberOfLines={0}
        />
    ),
    info: (props: BaseToastProps) => (
        <BaseToast
            {...props}
            style={[baseStyle, { borderLeftColor: '#3498db' }]}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{ fontSize: 13, fontFamily: FONTS.Inter.SemiBold }}
            text2Style={{ fontSize: 13 }}
            text1NumberOfLines={0}
            text2NumberOfLines={0}
        />
    ),
};