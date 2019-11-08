import React, {Component} from "react";
import {Switch as S, Text, View} from "react-native";
import colors from '../styles/colors.json';
import { CSSView } from "../styles/view.js";
import { CSSText } from "../styles/text.js";

export class Switch extends Component{

    render(){
        let {onValueChange, value, label, style, disabled} = this.props;
        return(
            <View style={[CSSView.row,style]}>
                <S
                    ref={this._ref}
                    trackColor={{ true: colors.success}} 
                    thumbColor={ { true: colors.white}}
                    value={value}
                    onValueChange={onValueChange}
                    disabled={disabled}
                />
                <Text style={[CSSView.flex,CSSText.fontMd, CSSText.dark, {paddingLeft:11}]}>
                    {label}
                </Text>
            </View>
        )
    }
}
Switch.defaultProps = {
    label:"",
    value:false,
    style:CSSView.paddingView,
    disabled:false
};