import AsyncStorage from '@react-native-async-storage/async-storage';

const Storage = {
    FCM_TOKEN_KEY:'FCM_TOKEN_KEY',
    USER_TOKEN:'USER_TOKEN',
    REFRESH_TOKEN: 'REFRESH_TOKEN',
    USER_ROLE: 'USER_ROLE',
    LANGUAGE_KEY: '@app_language',
    async save(key: string, value: string): Promise<boolean> {
        try {
            await AsyncStorage.setItem(key, value ?? '');
            return true;
        } catch (error) {
            console.log('error', error);
            return false;
        }
    },
    async get(key: string): Promise<string | null> {
        try {
            const result = await AsyncStorage.getItem(key);
            return result;
        } catch (error) {
            console.log('error', error);
            return null;
        }
    },
    async clear() {
        try {
            const savedLanguage = await AsyncStorage.getItem('@app_language');
            const result = await AsyncStorage.clear();
            if (savedLanguage) {
                await AsyncStorage.setItem('@app_language', savedLanguage);
            }
            return result;
        } catch (error) {
            console.log('error clearing storage', error);
            return null;
        }
    },
}

export {
    Storage,
}
