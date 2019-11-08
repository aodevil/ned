//LIB
import React, { Component } from 'react';
import { connect } from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
//ELEMENTS
import { ScrollView, View, TouchableOpacity, SafeAreaView, Alert, Platform, DatePickerIOS, DatePickerAndroid } from 'react-native';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { TextInput } from '../user-controls/TextInput';
import { Icon } from '../user-controls/IconComponent';
import { Label } from '../user-controls/Label';
import { ListGroupHeader } from '../user-controls/ListGroupHeader';
import { TimePicker } from '../user-controls/TimePicker';
import { Badge, ListItem } from 'react-native-elements';
import { DisciplineSelector } from '../user-controls/DisciplineSelector';
import { LocationSelector } from '../user-controls/LocationSelector';
import Toast from 'react-native-root-toast';
//STYLES
import { CSSView } from '../styles/view';
import { CSSText } from '../styles/text';
import { CSSForms } from '../styles/forms';
import colors from '../styles/colors.json';
//MODEL
import errors from '../services/errors';
import routes from '../providers/routes';
import { ACTIVIDADES, ALERTS, ACTIONS } from '../services/constants';
import { scrollTo, rawStr, componentDidMountDelay, shortDateString } from '../services/functions';
import { Evento, EventoEnlace } from '../model/Evento';
import { ROUTES, post } from '../services/post';

class EventoEnlaceComponent extends Component {
    didLayout = false;

    _onLayout = (e) => {
        if (!this.didLayout) {
            const { onLayout } = this.props;
            onLayout(e, -80);
            this.didLayout = true;
        }
    }

    _setState = (prop) => (value) => {
        const { item, onChange, index } = this.props;
        const enlace = new EventoEnlace(item);
        enlace[prop] = value;
        onChange(enlace, index);
    }

    _remove = () => {
        const { onRemove, item } = this.props;
        onRemove(item.ID);
    }

    render () {
        const { item: { titulo, url }, index } = this.props;
        return (
            <View onLayout={this._onLayout} style={[CSSView.row, CSSView.justify, CSSView.padding, { alignItems: 'flex-start', backgroundColor: index % 2 === 0 ? colors.white : colors.clear }]}>
                <View style={CSSView.flex}>
                    <Label valid={!!titulo}>Texto del enlace</Label>
                    <TextInput noMargin value={titulo} onChangeText={this._setState('titulo')} placeholder="Texto del enalce" isLast/>
                    <Label valid={!!url}>Enlace</Label>
                    <TextInput noMargin value={url} onChangeText={this._setState('url')} placeholder="http://dominio.com/recursos" isLast/>
                </View>
                <TouchableOpacity style={CSSView.noGrow} onPress={this._remove}>
                    <Icon name="remove-circle" size={20} color={colors.danger}/>
                </TouchableOpacity>
            </View>
        );
    }
}

class EditarEventoComponent extends Component {

    //INIT

    constructor(props){
        super(props);
        this.init(props);
    }

    init(props){
        this.canScroll = false;
        props.navigation.setParams({
            onSave:this._save
        });
        const type = props.navigation.getParam("type");
        const source = props.navigation.getParam("source");
        const i = props.navigation.getParam("item");
        this._onItemUpdate = props.navigation.getParam("onUpdate");
        const defaultLocation = props.navigation.getParam("centro");
        const item = new Evento(i);
        item.tipo = type;
        this.state = {
            mounted:false,
            ...item,
            source,
            focusedInput:0,
            defaultLocation
        };
        this._setTitle();
    }

    componentDidMount () {
        componentDidMountDelay(this, () => {
            this.canScroll = true;
        }, 800);
    }

    //ACTIONS

    _setState = (prop) => (value)=>{
        this.setState({
            [prop]:value
        });
    }

    _disciplinaDidChange = ({disciplina, nombre})=>{
        this.setState({
            disciplina,
            nombreDisciplina: nombre
        });
    }

    _centroDidChange = ({centro, lugar})=>{
        const { centro: c } = this.state;
        this.setState({
            centro: (centro ? centro : (!lugar ? '' : c)),
            lugar
        });
    }

    _setDate = (fecha)=>{
        this.setState({fecha});
    }

    _androidSetDate = async ()=>{
        try {
            let { fecha } = this.state;
            let { action, year, month, day } = await DatePickerAndroid.open({
                date: fecha ? new Date(fecha) : new Date(),
                mode:"spinner"
            });
            if (action !== DatePickerAndroid.dismissedAction) {
                let _fecha = new Date(year, month, day);
                this.setState({
                    fecha: _fecha
                });
            }
        } catch ({ code, message }) {
            Toast.show(ALERTS.form.text.cantOpenPicker, { shadow:false });
        }
    }

    _horaDidChange = (prop, value) => {
        this.setState({
            [prop]: { ...value }
        });
    }

    _linkChange = (item, index) => {
        const { enlaces } = this.state;
        const items = JSON.parse(JSON.stringify(enlaces));
        items[index] = item;
        this.setState({
            enlaces: items
        });
    }

    _addLink = () => {
        const { enlaces } = this.state;
        this.setState({
            enlaces: [...enlaces, new EventoEnlace() ],
        });
    }

    _removeLink = (ID) => {
        const { enlaces } = this.state;
        this.setState({
            enlaces: enlaces.filter(x => x.ID !== ID),
        });
    }

    _save = ()=>{
        let { network, token, onLoading, onUpdateEvento, usuario: { activo } } = this.props;

        if(!network){
            Toast.show(ALERTS.response.text.network,{shadow:false});
            return;
        }

        if(!activo){
            Alert.alert("", errors.auth);
            return;
        }

        let item = new Evento(this.state);

        let { nombre, lugar, disciplina, tipo } = item;
        if(
            !rawStr(nombre) ||
            !rawStr(lugar) ||
            (tipo === ACTIVIDADES.AR && !rawStr(disciplina))
        ){
            Toast.show(ALERTS.form.text.required,{shadow:false});
            return;
        }

        const request = new Evento(this.state);
        request.fecha = (item.fecha)  ? item.fecha.getTime(): 0

        onLoading(true, async (resolve) => {
            let response = await post(ROUTES.EVENTOS, { action:ACTIONS.insert, item: request } , token);

            if (response) {
                let { error, data } = response;
                if (!error && data) {
                    onUpdateEvento(item, () => {
                        Toast.show(ALERTS.response.text.saved);
                        if (this._onItemUpdate) this._onItemUpdate(item);
                        resolve();
                    });
                } else{
                    resolve();
                    Alert.alert(null,error || ALERTS.response.text.noChanges);
                }
            } else
                resolve();
        });
    }
    
    //VIEW

    _setTitle = () => {
        const { navigation } = this.props;
        const { source } = this.state;
        navigation.setParams({
            title: `Datos de${ source === ACTIVIDADES.actividades.name ? ' la actividad' : 'l evento'}`,
        })
    };

    _focusNextInput = (pos)=>{
        this.setState({
            focusedInput:pos
        });
    }

    _scroll = (e, offset)=>{
        if (this.canScroll) {
            scrollTo(this.scroll, e, offset);
        }
    }

    _scrollRef = (x)=>{
        this.scroll = x;
    }

    _mapEnlaces = (x, i) => {
        return (
            <EventoEnlaceComponent
                key={`enlace-${x.ID}`} 
                onLayout={this._scroll}
                onChange={this._linkChange}
                onRemove={this._removeLink}
                index={i}
                item={x}
            />
        )
    }

    render(){
        const { 
            focusedInput,
            nombre,
            fecha,
            hora,
            lugar,
            tipo,
            descripcion,
            disciplina,
            enlaces,
            defaultLocation
        } = this.state;
        return(
            <SafeAreaView style={CSSView.main}>
                <ScrollView style={CSSView.main} ref={this._scrollRef}>
                    <View style={[CSSView.container,{paddingBottom:20}]}>
                        <Badge value={ACTIVIDADES.tipos[tipo]} textStyle={CSSText.dark} containerStyle={{backgroundColor:colors.clear}} />

                        <Label valid={!!nombre}>{ 'Nombre del evento' }</Label>
                        <TextInput noMargin value={nombre} onChangeText={this._setState('nombre')} placeholder="Nombre del evento" isLast/>
                        
                        {tipo === 0 && (
                            <>
                            <Label valid={!!disciplina}>{ 'Disciplina' }</Label>
                            <DisciplineSelector 
                                defaultValue={disciplina}
                                onChange={this._disciplinaDidChange}
                            />
                            </>
                        )}

                        <Label valid={!!lugar}>Lugar</Label>
                        <LocationSelector 
                            defaultValue={defaultLocation}
                            value={lugar}
                            onChange={this._centroDidChange}
                        />

                        <Label>Descripción</Label>
                        <TextInput multiline value={descripcion} onChangeText={this._setState('descripcion')}  placeholder="Descripción" styles={[CSSForms.textArea]} returnKeyType="default"/>

                        <Label>Fecha del evento</Label>
                        {Platform.OS === "ios"?(
                        <DatePickerIOS
                            mode="date"
                            date={fecha}
                            onDateChange={this._setDate}
                        />
                        ):(
                            <ListItem
                                title={shortDateString(fecha)}
                                hideChevron
                                onPress={this._androidSetDate}
                            />
                        )}

                        <TimePicker
                            label="Hora del evento"
                            defaultValue={hora}
                            name="hora"
                            onValueChange={this._horaDidChange}
                            nullable
                        />

                        <ListGroupHeader style={CSSView.separateTop} secondary title="Enlaces a recursos adicionales" toUpperCase={false} buttons={[
                            {
                                icon: 'add',
                                onPress: this._addLink
                            }
                        ]}/>
                        {
                            enlaces.map(this._mapEnlaces)
                        }
                    </View>
                </ScrollView>
            </SafeAreaView> 
        );
    }
}
EditarEventoComponent.navigationOptions = setHeaderComponent({
    title:routes.ActividadesRouter.child.EditarEvento.title,
    secondary:true,
    root:false
});

export const EditarEvento = connect(mapStateToProps,mapDispatchToProps)(EditarEventoComponent);