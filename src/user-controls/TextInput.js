import React, {Component} from 'react';
import {TextInput as Input, Platform} from 'react-native';
import { CSSForms } from '../styles/forms';
import colors from '../styles/colors';

export const keyboardTypes = {
    default: "default",
    number: "number-pad",
    decimal: "decimal-pad",
    math: Platform.OS === 'ios' ? "numbers-and-punctuation" : "numeric",
    numeric: "numeric",
    email: "email-address",
    phone: "phone-pad"
};

export class TextInput extends Component{
    constructor(props){
        super(props);
        this.state = {
            focus:false
        }
    }

    shouldComponentUpdate(props,state){
        let update = false;
        
        let propsKeys = Object.keys(this.props);

        propsKeys.forEach(k => {
            if(
                k === "onChangeText" ||
                k === "onBlur" ||
                k === "onFocus" ||
                k === "onSubmitEditing" ||
                k === "styles"
            )return;
            if(this.props[k] !== props[k]){
                update = true;
            }
        });
        if(update)return update;

        let stateKeys = Object.keys(this.state);
        
        stateKeys.forEach(k => {
            if(this.state[k] !== state[k]){
                update = true;
            }
        });
        
        return update;
    }

    UNSAFE_componentWillReceiveProps(props){
        let {pos,focusState} = props;
        if(pos === focusState && this.refInput){
            this.refInput.focus();
        }
    }

    _focus = ()=>{
        this.setState({
            focus:true
        },()=>{
            if(this.props.onFocusNext){
                this.props.onFocusNext(this.props.pos);
            }
        });
    }

    _blur = ()=>{
        this.setState({
            focus:false
        },()=>{
            if(this.props.onFocusNext){
                this.props.onFocusNext(-1);
            }
        });
    }

    _submitEditing = ()=>{
        if(this.props.returnKeyType === "next"){
            if(this.props.onFocusNext){
                this.props.onFocusNext(this.props.pos+1);
            }
        }
    }

    _ref = (x)=>{
        this.refInput = x;
    }

    render(){
        let { value, placeholder, onChangeText, autoCorrect, blurOnSubmit, returnKeyType, secureTextEntry, autoCapitalize, styles:stylesProps, noMargin, isLast, keyboardType, readOnly, multiline, numberOfLines, alterValue, selectTextOnFocus, scrollEnabled } = this.props;
        let {focus} = this.state;
        const val = value ? value.toString() : alterValue;
        let styles = [CSSForms.input, ...stylesProps, focus && CSSForms.inputFocus, !noMargin && CSSForms.separate, readOnly && {color:colors.placeholder}];
        return(
            <Input
                selectTextOnFocus={selectTextOnFocus}
                secureTextEntry={secureTextEntry}
                autoCapitalize={autoCapitalize}
                autoCorrect={autoCorrect} 
                style={[...styles]} 
                value={val} 
                placeholder={placeholder}
                onChangeText={onChangeText} 
                onFocus={this._focus} 
                onBlur={this._blur} 
                blurOnSubmit={blurOnSubmit || isLast}
                onSubmitEditing={this._submitEditing}
                ref={this._ref}
                returnKeyType={isLast? "done" : returnKeyType }
                keyboardType={keyboardType}
                editable={!readOnly}
                multiline={multiline}
                numberOfLines={numberOfLines}
                textAlignVertical="top"
                scrollEnabled={scrollEnabled}
            />
        )
    }
}
TextInput.defaultProps = {
    selectTextOnFocus: false,
    autoCorrect:false,
    blurOnSubmit:false,
    returnKeyType:"next",
    secureTextEntry:false,
    autoCapitalize:"none",
    styles:[],
    placeholder:"",
    noMargin:false,
    isLast:false,
    keyboardType:"default",
    readOnly:false,
    pos: -1,
    multiline: false,
    numberOfLines: 1,
    alterValue: '',
    scrollEnabled: true
};