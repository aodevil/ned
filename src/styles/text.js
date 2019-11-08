import {StyleSheet} from 'react-native';
import colors from "./colors";

export const CSSText = StyleSheet.create({
    title: {
        fontSize: 17,
        textAlign: 'center',
        fontWeight: 'bold',
        color: colors.primary
    },
    smaller:{
        fontSize:12
    },
    fontSm:{
        fontSize:15
    },
    fontMd:{
        fontSize:17
    },
    center:{
        textAlign:"center"
    },
    left:{
        textAlign:"left"
    },
    bold:{
        fontWeight:"bold"
    },
    normal: {
        fontWeight:"normal"
    },
    white: {
        color: colors.white,
    },
    light:{
        color:colors.light
    },
    primary:{
        color:colors.primary
    },
    secondary:{
        color:colors.secondary
    },
    dark:{
        color:colors.dark
    },
    placeholder:{
        color:colors.placeholder
    },
    danger:{
        color:colors.danger
    },
    success:{
        color:colors.success
    }
});