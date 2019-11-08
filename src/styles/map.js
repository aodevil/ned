import {StyleSheet} from 'react-native';
import colors from "./colors";

export const CSSMap = StyleSheet.create({
    view:{
        flex:1
    },
    annotationContainer: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 15,
    },
    annotationFill: {
        width: 30,
        height: 30,
        borderRadius: 15,
        transform: [{ scale: 0.6 }],
    },
    annotationSaved:{
        backgroundColor: colors.primary,
    },
    annotationUnsaved:{
        backgroundColor: colors.dark,
    }
});