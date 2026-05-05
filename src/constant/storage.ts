import AsyncStorage from '@react-native-async-storage/async-storage';

const Storage = {
    FCM_TOKEN_KEY:'FCM_TOKEN_KEY',
    USER_TOKEN:'USER_TOKEN',
    REFRESH_TOKEN: 'REFRESH_TOKEN',
    USER_ROLE: 'USER_ROLE',
    async save(key: string, value: string): Promise<boolean> {
        try {
            const res = await AsyncStorage.setItem(key, value ?? '');
            return true
        } catch (error) {
            console.log('error', error)
            return false
        }
    },
    async get(key: string): Promise<string | null> {
        try {
            const result = await AsyncStorage.getItem(key);
            return result
        } catch (error) {
            console.log('error', error)
            return null
        }
    },
    async clear() {
        const result = await AsyncStorage.clear()
        return result
    },
}

export {
    Storage,
}
