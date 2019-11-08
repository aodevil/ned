//LIB
import React, { Component, PureComponent } from 'react';
import { connect } from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
//ELEMENTS
import { ScrollView, View, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { TextInput, keyboardTypes } from '../user-controls/TextInput';
import { Icon } from '../user-controls/IconComponent';
import { Label } from '../user-controls/Label';
import { ListGroupHeader } from '../user-controls/ListGroupHeader';
import { TimePicker } from '../user-controls/TimePicker';
import { Badge } from 'react-native-elements';
import { SegmentedButtons } from '../user-controls/SegmentedButtons';
import { CheckButtonGroup } from '../user-controls/CheckButtonGroup';
import { DisciplineSelector } from '../user-controls/DisciplineSelector';
import { LocationSelector } from '../user-controls/LocationSelector';
import Toast from 'react-native-root-toast';
//STYLES
import { CSSView } from '../styles/view';
import { CSSText } from '../styles/text';
import colors from '../styles/colors.json';
//MODEL
import errors from '../services/errors';
import routes from '../providers/routes';
import { DIAS, ACTIVIDADES, SEXOS, ALERTS, ACTIONS } from '../services/constants';
import { scrollTo, compareValues, rawStr, componentDidMountDelay } from '../services/functions';
import { Actividad, ActividadDetails, ActividadHorario } from '../model/Actividad';
import { ROUTES, post } from '../services/post';
import { CSSForms } from '../styles/forms';


class ActividadDetailsComponent extends PureComponent {
    
    didLayout = false;

    //VIEW

    _onLayout = (e) => {
        if (!this.didLayout) {
            const { onLayout } = this.props;
            onLayout(e);
            this.didLayout = true;
        }
    }

    render () {
        const { onChange, onRemove, index, name, item: { ID, concepto, valor } } = this.props;
        return (
            <View style={[CSSView.row, {alignItems:"flex-start", paddingBottom:20, backgroundColor:index%2!==0?colors.clear:colors.white}]} onLayout={this._onLayout}>
                <View style={CSSView.flex}>
                    <Label>Concepto</Label>
                    <TextInput pos={-1} noMargin value={concepto} onChangeText={onChange('concepto',index)} placeholder="Descripción" isLast />
                </View>
                <View style={{flex:1,maxWidth:15}}></View>
                <View style={CSSView.flex}>
                    <Label>Valor</Label>
                    <TextInput pos={-1} noMargin value={`${valor}`} onChangeText={onChange('valor',index)} placeholder="0.00" keyboardType={keyboardTypes.number} isLast />
                </View>
                <TouchableOpacity style={[CSSView.noGrow,{marginTop:8}]} onPress={onRemove(ID, name)}>
                    <Icon name="remove-circle" size={20} color={colors.danger}/>
                </TouchableOpacity>
            </View>
        );
    }
}

const sexOptions = [ ...SEXOS, 'Mixto' ];

class ActividadHorarioComponent extends Component {
    
    constructor(props){
        super(props);
        this.top = 0;
        this.didLayout = props.index === 0;
    }

    shouldComponentUpdate(props, state) {
        const {
            index: prevIndex,
            horario: prevHorario
        } = this.props;
        const {
            index: nextIndex,
            horario: nextHorario
        } = props;
        if(
            prevIndex === nextIndex &&
            compareValues(prevHorario, nextHorario)
        ) return false;
        return true;
    }

    //ACTIONS

    _onChange = (prop) => (value)=>{
        const { horario: state, index, onUpdate } = this.props;
        const horario = JSON.parse(JSON.stringify(state));
        horario[prop] = value;
        onUpdate(horario, index);
    }

    _updateDiasHorarios = (labels, indexes) => {
        const { horario: state, index, onUpdate } = this.props;
        const horario = JSON.parse(JSON.stringify(state));
        horario.dias = indexes;
        onUpdate(horario, index);
    }

    _horaDidChange = (prop, value) => {
        const { horario: state, index, onUpdate } = this.props;
        const horario = JSON.parse(JSON.stringify(state));
        horario[prop] = value;
        onUpdate(horario, index);
    }

    _addDetailsItem = (prop) => () => {
        const { horario: state, index, onUpdate } = this.props;
        const horario = JSON.parse(JSON.stringify(state));
        const details = new ActividadDetails();
        details.setTipo(prop);
        horario[prop] = [ ...horario[prop], details ];
        onUpdate(horario, index);
    }

    _removeDetailsItem = (ID, prop) => () => {
        const { horario: state, index, onUpdate } = this.props;
        const horario = JSON.parse(JSON.stringify(state));
        horario[prop] = horario[prop].filter(x => x.ID !== ID);
        onUpdate(horario, index);
    }

    _setCosto = (prop, i) => (value) =>{
        const { horario: state, index, onUpdate } = this.props;
        const horario = JSON.parse(JSON.stringify(state));
        horario.costos[i][prop] = value;
        onUpdate(horario, index);
    }

    _setRequisito = (prop, i) => (value) =>{
        const { horario: state, index, onUpdate } = this.props;
        const horario = JSON.parse(JSON.stringify(state));
        horario.requisitos[i][prop] = value;
        onUpdate(horario, index);
    }

    //VIEW

    _onLayout = (e) => {
        if (!this.didLayout) {
            const { onLayout } = this.props;
            if (e && e.nativeEvent) {
                this.top = e.nativeEvent.layout.y;
                onLayout(e);
                this.didLayout = true;
            }
        }
    }

    _onChildLayout = (e) => {
        const { nativeEvent } = e;
        if (nativeEvent) {
            const { onLayout, index } = this.props;
            const { layout: { y } } = nativeEvent;
            onLayout(e, index === 0 ? 0 : this.top - 80);
        }
    }

    _mapCostos = (x, i) => {
        const { onLayout, horario: { ID } } = this.props;
        return (
            <ActividadDetailsComponent
                key={`horario-costo-${ID}-${x.ID}`} 
                name="costos"
                index={i}
                item={x}
                onChange={this._setCosto}
                onRemove={this._removeDetailsItem}
                onLayout={this._onChildLayout}
            />
        );
    }

    _mapRequisitos = (x, i) => {
        const { onLayout, horario: { ID } } = this.props;
        return (
            <ActividadDetailsComponent
                key={`horario-requisito-${ID}-${x.ID}`} 
                name="requisitos"
                index={i}
                item={x}
                onChange={this._setRequisito}
                onRemove={this._removeDetailsItem}
                onLayout={this._onChildLayout}
            />
        );
    }

    render () {
        const { horario: {ID, sexo, edad_min, edad_max, dias, de_hora, hasta_hora, requisitos, costos}, index, onAdd, onRemove } = this.props;
        const buttons = [];
        if (index !== 0) {
            buttons.push({
                icon: 'remove-circle',
                color: colors.danger,
                onPress: onRemove(ID)
            });
        }
        buttons.push({
            icon: 'add-circle',
            onPress: onAdd
        });
        return (
            <View onLayout={this._onLayout}>
                <ListGroupHeader style={CSSView.separateTop} title="Horario" toUpperCase={false} buttons={buttons}/>

                <Label style={CSSView.separateSm}>Días que se imparte</Label>
                <CheckButtonGroup
                    name="dias_que_se_imparte"
                    options={DIAS}
                    defaultActive={dias}
                    onChange={ this._updateDiasHorarios }
                    noMargin
                />

                <View style={CSSView.flex}>
                    <TimePicker
                        label="Desde las"
                        defaultValue={de_hora}
                        name="de_hora"
                        onValueChange={this._horaDidChange}
                        nullable
                    />
                    <TimePicker
                        label="hasta las"
                        name="hasta_hora"
                        defaultValue={hasta_hora}
                        onValueChange={this._horaDidChange}
                        nullable
                    />
                </View>
                
                <View style={CSSView.row}>
                    <View style={CSSView.flex}>
                        <Label>Edad mínima</Label>
                        <TextInput noMargin value={`${edad_min}`} onChangeText={this._onChange('edad_min')} isLast placeholder="Mínima" keyboardType={keyboardTypes.number} />
                    </View>
                    <View style={{flex:1,maxWidth:15}}></View>
                    <View style={CSSView.flex}>
                        <Label>Edad máxima</Label>
                        <TextInput noMargin value={`${edad_max}`} onChangeText={this._onChange('edad_max')} isLast placeholder="Máxima" keyboardType={keyboardTypes.number} />
                    </View>
                </View>

                <View style={CSSView.separateTop}>
                    <SegmentedButtons index={sexo} buttons={sexOptions} onChange={this._onChange('sexo')} />
                </View>

                <ListGroupHeader secondary style={CSSView.separate} title="Costos" toUpperCase={false} buttons={[
                    {
                        icon: 'add-circle',
                        onPress: this._addDetailsItem('costos')
                    }
                ]}/>
                {
                    costos.map(this._mapCostos)
                }

                <ListGroupHeader secondary style={CSSView.separate} title="Requisitos de inscripción" toUpperCase={false} buttons={[
                    {
                        icon: 'add-circle',
                        onPress: this._addDetailsItem('requisitos')
                    }
                ]}/>
                {
                    requisitos.map(this._mapRequisitos)
                }
            </View>
        );
    }
}

class EditarActividadComponent extends Component {

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
        const item = new Actividad(i);
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
        const { mounted } = this.state;
        if (!mounted) return;
        this.setState({
            disciplina,
            nombre
        });
    }

    _centroDidChange = ({centro, lugar})=>{
        const { mounted } = this.state;
        if (!mounted) return;
        const { centro: c } = this.state;
        this.setState({
            centro: (centro ? centro : (!lugar ? '' : c)),
            lugar
        });
    }

    _addHorario = () => {
        const { horarios: items } = this.state;
        const horarios = JSON.parse(JSON.stringify(items));
        this.setState({
            horarios: [ ...horarios, new ActividadHorario() ],
        });
    }

    _removeHorario = (ID) => () => {
        const { horarios: items } = this.state;
        const horarios = JSON.parse(JSON.stringify(items));
        this.setState({
            horarios: horarios.filter(x => x.ID !== ID),
        });
    }

    _updateHorarios = (horario, index)=>{
        const { horarios: items } = this.state;
        const horarios = JSON.parse(JSON.stringify(items));
        horarios[index] = new ActividadHorario(horario);
        this.setState({
            horarios,
        });
    }

    _save = ()=>{
        let { network, token, onLoading, onUpdateActividad, usuario: { activo } } = this.props;

        if(!network){
            Toast.show(ALERTS.response.text.network,{shadow:false});
            return;
        }

        if(!activo){
            Alert.alert("", errors.auth);
            return;
        }

        let item = new Actividad(this.state);

        let { nombre, lugar } = item;

        if(
            !rawStr(nombre) ||
            !rawStr(lugar)
        ){
            Toast.show(ALERTS.form.text.required,{shadow:false});
            return;
        }

        onLoading(true, async (resolve) => {
            let response = await post(ROUTES.ACTIVIDADES, { action:ACTIONS.insert, item } , token);
            if (response) {
                let { error, data } = response;
                if (!error && data) {
                    onUpdateActividad(item, () => {
                        Toast.show(ALERTS.response.text.saved, { shadow: false });
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

    _mapHorarios = (x, i) => {
        const { source } = this.state;
        return (
            <ActividadHorarioComponent
                key={`actividad-horario-${x.ID}`}
                index={i}
                source={source}
                onUpdate={this._updateHorarios}
                onAdd={this._addHorario}
                onRemove={this._removeHorario}
                onLayout={this._scroll}
                horario={x}
            />
        )
    }

    render(){
        const { 
            disciplina,
            lugar,
            nombre,
            descripcion,
            tipo,
            horarios,
            defaultLocation,
        } = this.state;
        return(
            <SafeAreaView style={CSSView.main}>
                <ScrollView style={CSSView.main} ref={this._scrollRef}>
                    <View style={[CSSView.container,{paddingBottom:20}]}>
                        <Badge value={ACTIVIDADES.tipos[tipo]} textStyle={CSSText.dark} containerStyle={{backgroundColor:colors.clear}} />

                        <Label valid={!!nombre}>{ tipo === 0 ? 'Actividad' : 'Nombre' }</Label>
                        {tipo === 0 ? (
                            <DisciplineSelector 
                                defaultValue={disciplina}
                                onChange={this._disciplinaDidChange}
                            />
                        ) : (
                            <View style={CSSView.flex}>
                                <TextInput noMargin value={nombre} onChangeText={this._setState('nombre')} placeholder="Nombre de la actividad" isLast/>
                            </View>
                        )}

                        <Label valid={!!lugar}>Lugar</Label>
                        <LocationSelector
                            defaultValue={defaultLocation}
                            value={lugar}
                            onChange={this._centroDidChange}
                            mountDelay={800}
                        />

                        <Label>Descripción</Label>
                        <TextInput multiline styles={[CSSForms.textArea]} returnKeyType="default" noMargin value={descripcion} onChangeText={this._setState('descripcion')} placeholder="Descripción"/>
                        {
                            horarios.map(this._mapHorarios)
                        }

                    </View>
                </ScrollView>
            </SafeAreaView> 
        );
    }
}
EditarActividadComponent.navigationOptions = setHeaderComponent({
    title:routes.ActividadesRouter.child.EditarActividad.title,
    secondary:true,
    root:false
});

export const EditarActividad = connect(mapStateToProps,mapDispatchToProps)(EditarActividadComponent);