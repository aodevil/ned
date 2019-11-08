//LIB
import React, {Component} from 'react';
import shortId from "shortid";
//ELEMENTS
import {View, Text, Picker, Platform} from 'react-native';
import { ListItem } from 'react-native-elements';
import { OverlayModal } from '../user-controls/OverlayModal';
import { Icon } from '../user-controls/IconComponent';
//STYLES
import { CSSView } from '../styles/view';
import { CSSText } from '../styles/text';
import colors from "../styles/colors";
//MODEL
import { MESES } from '../services/constants';

export class YearAndMonthPicker extends Component{

    constructor(props){
        super(props);
        this.date = new Date();
        this.prefix = shortId.generate();
        this.year = props.initialYear || this.date.getFullYear();
        this.month = props.initialMonth || this.date.getMonth();
        this.dateInterval = null;
        this.fYear = -1;
        this.fMonth = -1;
        this.state = {
            modal:false,
            y:props.nullable?-1: this.year,
            m:props.nullable?-1: this.month
        };
    }

    shouldComponentUpdate(props,state){
        if(
            this.state.modal === state.modal &&
            this.state.y === state.y &&
            this.state.m === state.m &&
            this.props.annotation === props.annotation &&
            this.props.annotationColor === props.annotationColor
        )return false;
        return true;
    }

    //ACTIONS

    _onMonthChange = (value,index)=>{
        clearInterval(this.dateInterval);
        let {y:year} = this.state;
        let y = year < 0 ? this.date.getFullYear():year;
        this.setState({
            m:value,
            y
        },()=>{
            if(this.props.onMonthChange)this.props.onMonthChange(y,value);
            if(Platform.OS === "ios")
            this.dateInterval = setTimeout(() => {
                this._toggleModal();
            }, 3000);
        });
    }

    _onYearChange = (value,index)=>{
        clearInterval(this.dateInterval);
        let year = (this.props.nullable && index === 0)?-1:this.year + index;
        let {m:month} = this.state;
        let m = month < 0 ? this.date.getMonth():month;
        this.setState({
            y:year,
            m
        },()=>{
            if(this.props.onYearChange)this.props.onYearChange(year,m);
            if(Platform.OS === "ios")
            this.dateInterval = setTimeout(() => {
                this._toggleModal();
            }, 3000);
        });
    }

    _toggleModal = ()=>{
        clearInterval(this.dateInterval);
        this.setState({
            modal:!this.state.modal
        });
    }

    _submit = ()=>{
        let {y,m} = this.state;
        if(this.props.nullable && (y<0 || m<0)){
            let year = y<0?this.fYear:y;
            let month = m<0?this.fMonth:m;
            this.setState({
                y:year,
                m:month
            },()=>{
                if(this.props.onYearChange)this.props.onYearChange(year,month);
                this._toggleModal();
            });
        }else{
            this._toggleModal();
        }
    }

    _clear = ()=>{
        this.setState({
            y:-1,
            m:-1
        },()=>{
            if(this.props.onYearChange)this.props.onYearChange(-1,-1);
            if(Platform.OS === "ios")
            this._toggleModal();
        });
    }

    //RENDER

    _mapMeses = (x,i)=>{
        if(i===0)this.fMonth = i;
        return <Picker.Item key={`${this.prefix}-month-picker-${i}`} label={x} value={i} />
    };

    _mapNullableMeses = (x,i)=>{
        return <Picker.Item key={`${this.prefix}-month-picker-${i}`} label={x} value={i-1} />
    };

    _mapAnios = (x,i)=>{
        let value = (this.year + i);
        if(i===0)this.fYear = value;
        return <Picker.Item key={`${this.prefix}-year-picker-${i}`} label={`${value}`} value={value} />;
    }

    _mapNullableAnios = (x,i)=>{
        let value = i===0?"Año":(this.year + i);
        return <Picker.Item key={`${this.prefix}-year-picker-${i}`} label={`${value}`} value={i===0?-1:value} />;
    }

    render(){
        let {year} = this;
        let {modal, m, y} = this.state;
        let {annotation, annotationColor, nullable, yearRange, icon, abbr} = this.props;
        return (
            <View>
                {
                    (Platform.OS === "ios")?(
                        <View style={{marginTop:11}}><ListItem avatar={icon ? <Icon name="calendar" color={colors.dark} size={25} />: null} rightIcon={{name:"arrow-drop-down"}} title={`${m<0?"Mes": (abbr ? MESES[m].substring(0,3) : MESES[m])}, ${y<0?"Año":y}`} onPress={this._toggleModal}/></View>
                    ):(
                        <View style={[CSSView.row,{marginTop:11,borderBottomColor:colors.light,borderBottomWidth:1}]}>
                            {icon && <Icon name="calendar" color={colors.dark} size={25} />}
                            <Picker
                                placeholder="Mes"
                                selectedValue={m}
                                style={{ flex:1, padding:0, margin:0 }}
                                onValueChange={this._onMonthChange}>
                                {
                                    nullable?["Mes",...MESES].map(this._mapNullableMeses):MESES.map(this._mapMeses)
                                }
                            </Picker>
                            <Picker
                                placeholder="Año"
                                selectedValue={y}
                                style={{ flex:1, padding:0, margin:0 }}
                                onValueChange={this._onYearChange}>
                                {
                                    nullable?Array.apply(year,Array(yearRange + 1)).map(this._mapNullableAnios):Array.apply(year,Array(yearRange)).map(this._mapAnios)
                                }
                            </Picker>
                        </View>
                    )
                }

                {Platform.OS === "ios" &&(
                    <OverlayModal visible={modal} dismiss={this._toggleModal} submit={nullable?this._submit:null} dismissColor={colors.dark} cancel={nullable?this._clear:null}>
                        <View style={CSSView.row}>
                            <Picker
                                selectedValue={m}
                                style={{ flex:1, padding:0, margin:0 }}
                                onValueChange={this._onMonthChange}>
                                {
                                    MESES.map(this._mapMeses)
                                }
                            </Picker>
                            <Picker
                                selectedValue={y}
                                style={{ flex:1, padding:0, margin:0 }}
                                onValueChange={this._onYearChange}>
                                {
                                    Array.apply(year,Array(yearRange)).map(this._mapAnios)
                                }
                            </Picker>
                        </View>
                        {!!annotation && <Text style={[CSSText.bold, CSSText.center, {color:annotationColor}]}>{annotation}</Text>}
                    </OverlayModal>
                )}
            </View>
        );
    }
}
YearAndMonthPicker.defaultProps = {
    annotation:"",
    annotationColor:colors.light,
    yearRange:5,
    icon: true,
    abbr: false
};