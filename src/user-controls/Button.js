import React, {Component} from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import { Icon } from '../user-controls/IconComponent';
import { CSSForms } from '../styles/forms';
import { CSSText } from '../styles/text';
import * as colors from "../styles/colors";

export class Button extends Component{

    shouldComponentUpdate(props){
        let keys = Object.keys(this.props);
        let update = false;
        keys.forEach(k => {
            if(
                k === "onPress" ||
                k === "children" ||
                k === "styles"
            )return;
            if(this.props[k] !== props[k]){
                update = true;
            }
        });
        return update;
    }
    
    render(){
        let {color,border,background, styles, onPress, children, noMargin, icon, round} = this.props;
        return(
            <TouchableOpacity onPress={onPress} style={!noMargin && CSSForms.separate}>
                <View style={[round?CSSForms.roundButton:CSSForms.button,border?{...CSSForms.borderButton,borderColor:color}:{backgroundColor:background},...styles]}>
                    {
                        icon?(
                            <Icon size={25} name={icon} color={color} />
                        ):(
                            <Text style={[CSSText.center,CSSText.bold, {color}]}>{children}</Text>
                        )
                    }
                </View>
            </TouchableOpacity>
        );
    }
}
Button.defaultProps = {
    color:colors.dark,
    background:colors.none,
    border:false,
    styles:[],
    noMargin:false,
    icon:"",
    round:true
}