//LIB
import React, {Component} from 'react';
import shortId from "shortid";
//ELEMENTS
import {View, Picker, Platform} from 'react-native';
import { ListItem } from 'react-native-elements';
import { OverlayModal } from './OverlayModal';
import { Icon } from './IconComponent';
import { Label } from './Label';
//STYLES
import { CSSView } from '../styles/view';
import colors from "../styles/colors";

export class TimePicker extends Component{

    constructor(props){
        super(props);
        this.date = new Date();
        this.prefix = shortId.generate();
        let { defaultValue, nullable } = props;
        let h = defaultValue?defaultValue.h:(nullable ? '0': this.date.getHours());
        let m = defaultValue?defaultValue.m:(nullable ? '0' : this.date.getMinutes());
        this.state = {
            modal:false,
            h,
            m,
            iosh:h,
            iosm:m
        };
    }

    shouldComponentUpdate(props,state){
        if(
            this.state.modal === state.modal &&
            this.state.h === state.h &&
            this.state.m === state.m &&
            this.state.iosh === state.iosh &&
            this.state.iosm === state.iosm
        )return false;
        return true;
    }

    //ACTIONS

    _onMinutesChange = (value,index)=>{
        let proph = Platform.OS === "ios"?"iosh":"h";
        let propm = Platform.OS === "ios"?"iosm":"m";
        let {[proph]:hours} = this.state;
        let h = hours < 0 ? this.date.getHours():hours;
        let time = {
            [propm]:value,
            [proph]:h
        };
        this.setState({
            ...time
        },()=>{
            if(this.props.onValueChange && Platform.OS !== "ios")this.props.onValueChange(this.props.name,time);
        });
    }

    _onHoursChange = (value,index)=>{
        let proph = Platform.OS === "ios"?"iosh":"h";
        let propm = Platform.OS === "ios"?"iosm":"m";
        let {[propm]:mins,} = this.state;
        let m = mins < 0 ? this.date.getMinutes():mins;
        let time = {
            [proph]:value,
            [propm]:m
        };
        this.setState({
            ...time
        },()=>{
            if(this.props.onValueChange && Platform.OS !== "ios")
                this.props.onValueChange(this.props.name,time);
        });
    }

    _onSubmit = ()=>{
        let {iosm:mins, iosh:hours} = this.state;
        let h = hours < 0 ? this.date.getHours():hours;
        let m = mins < 0 ? this.date.getMinutes():mins;
        let time = {h,m};
        this.setState({
            ...time,
            modal:false
        },()=>{
            if(this.props.onValueChange)
                this.props.onValueChange(this.props.name,time);
        });
    }

    _toggleModal = ()=>{
        let {h,m} = this.state;
        this.setState({
            iosh:h,
            iosm:m,
            modal:!this.state.modal
        });
    }

    //RENDER

    _mapHours = (x,i)=>{
        let h = i;
        let label = h<=9?`0${h}`:h;
        return <Picker.Item key={`${this.prefix}-hour-picker-${i}`} label={`${label}`} value={h} />
    };

    _mapMinutes = (x,i)=>{
        let m = i;
        let label = m<=9?`0${m}`:m;
        return <Picker.Item key={`${this.prefix}-min-picker-${i}`} label={`${label}`} value={m} />;
    }

    render(){
        let {icon,label} = this.props;
        let {modal, m, h, iosm, iosh} = this.state;
        let ampm = (h>=12?"pm":"am");
        let title = (h<=9?`0${h}`:(h>12)?h-12:h)+":"+(m<=9?`0${m}`:m)+" "+ampm;
        const hours = Array.apply(0,Array(24)).map(this._mapHours);
        const minutes = Array.apply(0,Array(Platform.OS==="ios"?59:60)).map(this._mapMinutes);
        return (
            <View style={CSSView.flex}>
                <Label>{label}</Label>
                {
                    (Platform.OS === "ios")?(
                        <View style={{marginTop:11}}>
                            <ListItem avatar={icon?<Icon name="time" color={colors.dark} size={25} />:null} rightIcon={{name:"arrow-drop-down"}} title={title} onPress={this._toggleModal}/>
                        </View>
                    ):(
                        <View style={[CSSView.row,{marginTop:11,borderBottomColor:colors.light,borderBottomWidth:1}]}>
                            {icon && <Icon name="time" color={colors.dark} size={25} />}
                            <Picker
                                placeholder="Horas"
                                selectedValue={h}
                                style={{ flex:1, padding:0, margin:0 }}
                                onValueChange={this._onHoursChange}>
                                {
                                    hours
                                }
                            </Picker>
                            <Picker
                                placeholder="Minutos"
                                selectedValue={m}
                                style={{ flex:1, padding:0, margin:0 }}
                                onValueChange={this._onMinutesChange}>
                                {
                                    minutes
                                }
                            </Picker>
                            {/* <Text>{ampm}</Text> */}
                        </View>
                    )
                }

                {Platform.OS === "ios" &&(
                    <OverlayModal visible={modal} dismiss={this._toggleModal} dismissColor={colors.dark} submit={this._onSubmit}>
                        <View style={CSSView.row}>
                            <Picker
                                selectedValue={iosh}
                                style={{ flex:1, padding:0, margin:0 }}
                                onValueChange={this._onHoursChange}>
                                {
                                    Array.apply(0,Array(24)).map(this._mapHours)
                                }
                            </Picker>
                            <Picker
                                selectedValue={iosm}
                                style={{ flex:1, padding:0, margin:0 }}
                                onValueChange={this._onMinutesChange}>
                                {
                                    Array.apply(0,Array(60)).map(this._mapMinutes)
                                }
                            </Picker>
                        </View>
                    </OverlayModal>
                )}
            </View>
        );
    }
}
TimePicker.defaultProps = {
    icon:true
};