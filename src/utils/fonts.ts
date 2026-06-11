import { Platform } from 'react-native';

const FONTS = {
    Inter: {
        // Font family name (same for both platforms)
        Family: 'Inter',
        // Platform-specific font weights - use the actual font file names
        Bold: Platform.OS === 'ios' ? 'Inter_18pt-Bold' : 'Inter_18pt-Bold',
        Medium: Platform.OS === 'ios' ? 'Inter_18pt-Medium' : 'Inter_18pt-Medium',
        SemiBold: Platform.OS === 'ios' ? 'Inter_18pt-SemiBold' : 'Inter_18pt-SemiBold',
        Regular: Platform.OS === 'ios' ? 'Inter_18pt-Regular' : 'Inter_18pt-Regular',
        // Font weight values for iOS
        Weights: {
            Bold: '700' as const,
            Medium: '500' as const,
            SemiBold: '600' as const,
            Regular: '400' as const,
        }
    },
}

export default FONTS;