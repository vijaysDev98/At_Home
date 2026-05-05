import Toast from 'react-native-toast-message'


export async function SHOW_TOAST(message: string | null | undefined, type: any) {

    Toast.show({
        type: type ? type : 'error',
        text1: message ? message : 'Something went wrong',
        position: 'top'
    })

}

export function SHOW_SUCCESS_TOAST(message: string) {
    Toast.show({
        type: 'success',
        text1: message,
        position: 'top'
    })
}