import { Dimensions } from "react-native";

const figmaWidth: number = 430
const figmaHeight: number = 932

const { width, height } = Dimensions.get('window');

export { width as screenWidth, height as screenHeight }

export function getScaleSize(size: number): number {
    const scaleWidth = width / figmaWidth;
    const scaleHeight = height / figmaHeight
    const scale = Math.min(scaleWidth, scaleHeight);
    const fontsize = Math.ceil((size * scale))
    return fontsize
}