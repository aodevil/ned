import React from "react";
import {Text} from "react-native";
import { CSSText } from '../styles/text';
import colors from "../styles/colors";

export const Label = ({children, noMargin, style, valid})=>{
    let validState = (!valid?{color:colors.danger}:null);
    return(
        <Text style={[CSSText.smaller, {marginTop:(noMargin)?0:11}, {...style}, validState]}>{children}</Text>
    );
}
Label.defaultProps = {
    style:{
        color:colors.dark
    },
    noMargin:false,
    valid:true
};