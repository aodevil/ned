import React from "react";
import {View,ActivityIndicator} from "react-native";
import { CSSView } from '../styles/view';
import colors from '../styles/colors.json';

export const Loader = ({show, transparent, opacity, dark})=>{
    if(!show)return null;
    return(
        <View style={[CSSView.main, CSSView.center, CSSView.absolute,{backgroundColor:colors.none}]}>
            <View style={[CSSView.main, CSSView.center, CSSView.absolute,{backgroundColor:transparent?colors.none:((dark)?colors.dark:colors.white), opacity}]}/>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
}
Loader.defaultProps = {
    transparent:true,
    opacity:1,
    dark:false
};