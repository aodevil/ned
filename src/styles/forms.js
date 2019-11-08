import {StyleSheet} from 'react-native';
import * as colors from "./colors";
import * as sizes from "./sizes";

export const CSSForms = StyleSheet.create({
    input:{
        height:50,
        width:"100%",
        borderRadius:0,
        backgroundColor:colors.none,
        fontSize:sizes.font.md,
        borderBottomWidth:1,
        borderBottomColor:colors.light,
        color:colors.dark
    },
    textArea: {
        marginTop:8,
        minHeight: 40,
        height: 'auto',
        maxHeight: 120
    },
    inputFocus:{
        borderBottomColor:colors.primary
    },
    button:{
        fontSize:sizes.font.md,
        paddingTop:12,
        paddingBottom:12,
        backgroundColor:"transparent"
    },
    roundButton:{
        fontSize:sizes.font.md,
        paddingTop:12,
        paddingBottom:12,
        borderRadius:50,
        backgroundColor:"transparent"
    },
    circleButton: {
        backgroundColor: colors.primary,
        width: 35,
        height: 35,
        padding: 0,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    primaryButton: {
        backgroundColor: colors.primary
    },
    secondaryButton: {
        backgroundColor: colors.secondary
    },
    dangerButton: {
        backgroundColor: colors.danger
    },
    disabledButton: {
        backgroundColor: colors.clear
    },
    borderButton:{
        borderWidth:2,
        borderColor:colors.dark
    },
    separate:{
        marginBottom:25
    },
    separateTop:{
        marginTop:25
    }
});