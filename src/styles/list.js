import {StyleSheet, Dimensions} from 'react-native';
import colors from "./colors";
import { CSSText } from './text';

export const CSSList = StyleSheet.create({
    noLines:{
        borderTopWidth: 0, borderBottomWidth: 0
    },
    noMargin:{
        marginTop:0, paddingTop:0
    },
    itemBorder: {
        borderBottomColor: colors.light,
        borderBottomWidth: 1
    },
    fullWidth: {
        width: Dimensions.get('window').width
    },
    title: {
        ...CSSText.fontMd,
        ...CSSText.dark
    },
    subtitle: {
        ...CSSText.fontSm,
        ...CSSText.placeholder
    }
});