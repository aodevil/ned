import {StyleSheet} from 'react-native';
import * as colors from "./colors";

export const CSSDrawer = StyleSheet.create({
    logo:{
        width:120,
        height:70,
        resizeMode:"center"
    },
    logoContainer:{
        paddingTop:15,
        paddingBottom:15
    },
    item:{
        height:50,
        borderBottomWidth:1,
        borderBottomColor:colors.white,
        justifyContent:"flex-start",
        alignItems:"center",
        flexDirection:"row"
    },
    label:{
        fontSize:16,
        fontWeight:"normal",
        margin:0,
        paddingLeft:8,
        paddingRight:8
    }
});