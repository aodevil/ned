import React from "react";
import {View, Text} from "react-native";
import { CSSText } from '../styles/text';
import colors from '../styles/colors.json';

export const ItemLeftText = ({title,subtitle})=>{
    return(
        <View style={{width:50}}>
            <Text style={[CSSText.center, {fontSize:11,color:colors.dark}]}>{subtitle}</Text>
            <Text style={[CSSText.center, CSSText.bold, {fontSize:20,color:colors.dark}]}>{title}</Text>
        </View>
    );
}