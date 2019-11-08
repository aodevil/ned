//LIB
import React, {Component} from 'react';
import shortId from "shortid";
//ELEMENTS
import {View, Picker, Platform} from 'react-native';
import { ListItem } from 'react-native-elements';
import { OverlayModal } from './OverlayModal';
//STYLES
import { CSSView } from '../styles/view';
import colors from "../styles/colors";
import sizes from "../styles/sizes";
import { compareValues } from '../services/functions';


export class Select extends Component{

    constructor(props){
        super(props);
        this.prefix = shortId.generate();
        this.state = {
            modal:false,
            value:props.defaultValue
        };
    }

    shouldComponentUpdate(props,state){
        if(
            this.state.modal === state.modal &&
            this.state.value === state.value &&
            props.defaultValue === this.state.value &&
            compareValues(props.options, this.props.options)
        )return false;
        return true;
    }

    componentDidUpdate(props, state) {
        if (Platform.OS === 'ios' && props.defaultValue !== this.props.defaultValue) {
            this.setState({
                value: -1
            });
        }
    }

    //ACTIONS

    _toggleModal = ()=>{
        clearInterval(this.dateInterval);
        this.setState({
            modal:!this.state.modal
        });
    }

    _setState = (value)=>{
        this.setState({
            value
        },()=>{
            if(Platform.OS === "android" && this.props.onChange){
                this.props.onChange(this.props.name,value);
            }
        });
    }

    _onSubmit = ()=>{
        if(Platform.OS === "ios"){
            let {value} = this.state;
            if(this.props.onChange) { 
                this.props.onChange(this.props.name,(value<0?0:value));
            }
            this._toggleModal();
        }
    }

    //RENDER

    _mapOptions = (x,i)=>{
        let value = Platform.OS === "ios"?i:i-1;
        return <Picker.Item key={`${this.prefix}-picker-${i}`} label={x} value={value} />;
    };

    render(){
        let {modal, value} = this.state;
        let {options, label, defaultValue, marginTop} = this.props;
        return (
            <View>
                {
                    (Platform.OS === "ios")?(
                        <View style={{marginTop}}><ListItem rightIcon={{name:"arrow-drop-down"}} title={defaultValue >= 0?options[defaultValue]:label} onPress={this._toggleModal} wrapperStyle={{marginLeft:0}} titleStyle={{fontSize: sizes.font.md, marginLeft:0,color: defaultValue < 0 ? colors.light : colors.dark}}/></View>
                    ):(
                        <View style={[CSSView.row,{marginTop,borderBottomColor:colors.light,borderBottomWidth:1}]}>
                            <Picker
                                placeholder={label}
                                selectedValue={value}
                                style={{ flex:1, padding:0, margin:0 }}
                                onValueChange={this._setState}>
                                {
                                    [label,...options].map(this._mapOptions)
                                }
                            </Picker>
                        </View>
                    )
                }

                {Platform.OS === "ios" &&(
                    <OverlayModal visible={modal} dismiss={this._toggleModal} submit={this._onSubmit} dismissColor={colors.dark}>
                        <View style={CSSView.row}>
                            <Picker
                                selectedValue={value}
                                style={{ flex:1, padding:0, margin:0 }}
                                onValueChange={this._setState}>
                                {
                                    options.map(this._mapOptions)
                                }
                            </Picker>
                        </View>
                    </OverlayModal>
                )}
            </View>
        );
    }
}
Select.defaultProps = {
    label:"",
    options:[],
    defaultValue:0,
    value:null,
    marginTop: 11
};