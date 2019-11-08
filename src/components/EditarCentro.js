//LIB
import React, {Component} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
//ELEMENTS
import {ScrollView, View, TouchableOpacity, SafeAreaView, Alert} from 'react-native';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { TextInput } from '../user-controls/TextInput';
import { Icon } from '../user-controls/IconComponent';
import { Label } from '../user-controls/Label';
import { ListGroupHeader } from '../user-controls/ListGroupHeader';
import { Select } from '../user-controls/Select';
import { TimePicker } from '../user-controls/TimePicker';
import Toast from 'react-native-root-toast';
//STYLES
import { CSSView } from '../styles/view';
import colors from '../styles/colors.json';
//MODEL
import errors from '../services/errors';
import routes from '../providers/routes';
import { Centro, CentroHorario } from '../model/Centro';
import shorId from 'shortid';
import { compareValues, scrollTo, componentDidMountDelay } from '../services/functions';
import { DIAS, CENTROSHORARIOS, ALERTS, ACTIONS } from '../services/constants';
import { post, ROUTES } from '../services/post';
import isEmail from "validator/lib/isEmail";
import { rawStr } from '../services/functions';

class Telefono extends Component {
    
    constructor(props){
        super(props);
        this.didLayout = false;
        this.state = {
            number:props.number
        };
    }

    shouldComponentUpdate(props,state){
        return !(state.number === this.state.number);
    }

    _setState = (prop,value)=>{
        this.setState({
            [prop]:value
        },()=>{
            this.props.onUpdate(this.props.ID,value);
        });
    }

    _removePhone = ()=>{
        this.props.onRemove(this.props.ID);
    }

    _onLayout = (e) => {
        if (!this.didLayout) {
            const { onLayout } = this.props;
            onLayout(e);
            this.didLayout = true;
        }
    }

    render(){
        let {number} = this.state;
        return (
            <View style={[CSSView.row,CSSView.justify,CSSView.align]} onLayout={this._onLayout}>
                <View style={CSSView.flex}>
                    <TextInput noMargin  value={number} onChangeText={this._setState.bind(this,"number")} placeholder="Teléfono" isLast/>
                </View>
                <TouchableOpacity style={CSSView.noGrow} onPress={this._removePhone}>
                    <Icon name="remove-circle" size={20} color={colors.danger}/>
                </TouchableOpacity>
            </View>
        );
    }
}

class Horario extends Component {
    constructor(props){
        super(props);
        this.didLayout = false;
        let {defaultValue} = props;
        this.state = {
            horario:{...defaultValue}
        };
    }

    shouldComponentUpdate(props,state){
        if(
            compareValues(state.horario, this.state.horario) &&
            props.index === this.props.index
        )return false;
        return true;
    }

    _filterDidChange = (prop,value)=>{
        let horario = new CentroHorario(this.state.horario);
        horario[prop] = value;
        this.setState({
            horario
        },()=>{
            if(this.props.onUpdate){
                this.props.onUpdate(horario);
            }
        });
    }

    _remove = ()=>{
        this.props.onRemove(this.props.ID);
    }

    _onLayout = (e) => {
        if (!this.didLayout) {
            const { onLayout } = this.props;
            onLayout(e);
            this.didLayout = true;
        }
    }

    render(){
        let {index} = this.props;
        let {horario:{de_dia, hasta_dia, de_hora, hasta_hora}} = this.state;
        return (
            <View style={[CSSView.row,{alignItems:"flex-start", paddingBottom:20, backgroundColor:index%2!==0?colors.clear:colors.white}]} onLayout={this._onLayout}>
                <View style={[CSSView.flex]}>
                    <View style={CSSView.row}>
                        <View style={CSSView.flex}>
                            <Label style={CSSView.flex}>De</Label>
                            <Select 
                                defaultValue={de_dia}
                                name="de_dia"
                                label="Día" 
                                options={DIAS}
                                onChange={this._filterDidChange}
                            />
                        </View>
                        <View style={{flex:1,maxWidth:15}}/>
                        <View style={CSSView.flex}>
                            <Label style={CSSView.flex}>a</Label>
                            <Select 
                                defaultValue={hasta_dia}
                                name="hasta_dia"
                                label="Día" 
                                options={DIAS}
                                onChange={this._filterDidChange}
                            />
                        </View>
                    </View>
                    <View style={CSSView.flex}>
                        <TimePicker
                            label="Desde las"
                            defaultValue={de_hora}
                            name="de_hora"
                            onValueChange={this._filterDidChange}
                        />
                        <TimePicker
                            label="hasta las"
                            name="hasta_hora"
                            defaultValue={hasta_hora}
                            onValueChange={this._filterDidChange}
                        />
                    </View>
                </View>
                <TouchableOpacity style={[CSSView.noGrow,{marginTop:8}]} onPress={this._remove}>
                    <Icon name="remove-circle" size={20} color={colors.danger}/>
                </TouchableOpacity>
            </View>
        );
    }
}

class EditarCentroComponent extends Component{

    //INIT

    constructor(props){
        super(props);
        this.init(props);
    }

    init(props){
        this.canScroll = false;
        this._onItemUpdate = props.navigation.getParam('onUpdate');
        props.navigation.setParams({
            onSave:this._save
        });
        let centro = new Centro(props.navigation.getParam("item"));
        if(!centro.ID)centro.setID();
        this.state = {
            mounted:false,
            ...centro,
            focusedInput:0
        };
    }

    componentDidMount() {
        componentDidMountDelay(this, () => {
            this.canScroll = true;
        }, 800);
    }

    //ACTIONS

    _longLatHelp = ()=>{
        Alert.alert(ALERTS.geo.title, ALERTS.geo.text.longLat);
    }

    _scroll = (e)=>{
        if(this.canScroll) {
            scrollTo(this.scroll, e, -80);
        }
    }

    _setState = (prop,value)=>{
        this.setState({
            [prop]:value
        });
    }

    _save = ()=>{

        let {network, usuario: { activo }} = this.props;

        if(!network){
            Toast.show(ALERTS.response.text.network,{shadow:false});
            return;
        }

        if(!activo){
            Alert.alert("", errors.auth);
            return;
        }
        
        let centro = new Centro(this.state);
        centro.setDefaultLongLat();
        let { nombre, domicilio, long, lat, email } = centro;

        if(
            !rawStr(nombre) ||
            (!rawStr(email) || !isEmail(email)) || 
            !rawStr(domicilio) ||
            !rawStr(long) ||
            !rawStr(lat)
        ){
            Toast.show(ALERTS.form.text.required,{shadow:false});
            return;
        }

        this.props.onLoading(true,async (resolve)=>{
            let response = await post(ROUTES.CENTRO,{action:ACTIONS.insert, centro}, this.props.token);

            if(response){
                let {error, data} = response;
                if(!error && data){
                    this.props.onUpdateCentro(centro,()=>{
                        Toast.show(ALERTS.response.text.saved);
                        if (this._onItemUpdate) this._onItemUpdate(centro);
                        resolve();
                    });
                }else{
                    resolve();
                    Alert.alert(null,error || ALERTS.response.text.noChanges);
                }
            }else
                resolve();
        });
    }
    
    _addPhone = ()=>{
        let ID = shorId.generate();
        this.setState({
            telefonos:[...this.state.telefonos,{ID,num:""}]
        });
    }

    _addHour = (tipo)=>{
        let horario = new CentroHorario();
        horario.tipo = tipo;
        this.setState({
            horarios:[...this.state.horarios,horario]
        });
    }

    _removePhone = (ID)=>{
        this.setState({
            telefonos:this.state.telefonos.filter((x)=>(x.ID !== ID))
        });
    }

    _removeHour = (ID)=>{
        this.setState({
            horarios:this.state.horarios.filter((x)=>(x.ID !== ID))
        });
    }

    _setPhoneNumber = (ID,value)=>{
        let telefonos = [...this.state.telefonos];
        let found = false;
        for(let i = 0; i < telefonos.length; i++){
            if(telefonos[i].ID === ID){
                telefonos[i].num = value;
                found = true;
                break;
            }
        }
        if(found){
            this.setState({
                telefonos
            });
        }
    }

    _setHour = (hour)=>{
        let horarios = [...this.state.horarios];
        let found = false;
        for(let i = 0; i < horarios.length; i++){
            if(horarios[i].ID === hour.ID){
                horarios[i] = new CentroHorario(hour);
                found = true;
                break;
            }
        }
        if(found){
            this.setState({
                horarios
            });
        }
    }

    _focusNextInput = (pos)=>{
        this.setState({
            focusedInput:pos
        });
    }
    
    //RENDER

    _mapPhoneNumbers = (x,i)=>{
        return (
            <Telefono 
                key={`phone-number-${x.ID}`} 
                number={x.num}
                ID={x.ID}
                onUpdate={this._setPhoneNumber}
                onRemove={this._removePhone}
                onLayout={this._scroll}
            />
        );
    }

    _mapHours = (x,i)=>{
        return (
            <Horario 
                key={`hour-${x.ID}`} 
                defaultValue={x}
                index={i}
                ID={x.ID}
                onUpdate={this._setHour}
                onRemove={this._removeHour}
                onLayout={this._scroll}
            />
        );
    }

    _scrollRef = (x)=>{
        this.scroll = x;
    }

    render(){
        let {focusedInput, nombre, domicilio, ciudad, estado, cp, pais, long:longitud, lat:latitud, email, telefonos, horarios} = this.state;
        let long = longitud?longitud.toString():"";
        let lat = latitud?latitud.toString():"";
        let horariosInstalacion = horarios.filter(x=>x.tipo === CENTROSHORARIOS.instalacion);
        let horariosInformes = horarios.filter((x)=>x.tipo === CENTROSHORARIOS.informes);

        return(
            <SafeAreaView style={CSSView.main}>
            <ScrollView style={CSSView.main} ref={this._scrollRef}>
                <View style={[CSSView.container,{paddingBottom:20}]}>
                    <Label valid={!!nombre}>Nombre</Label>
                    <TextInput pos={1} noMargin focusState={focusedInput} value={nombre} onChangeText={this._setState.bind(this,"nombre")} onFocusNext={this._focusNextInput} placeholder="Nombre del centro"/>

                    <Label valid={!!domicilio}>Domicilio</Label>
                    <TextInput pos={2} noMargin focusState={focusedInput} value={domicilio} onChangeText={this._setState.bind(this,"domicilio")} onFocusNext={this._focusNextInput} placeholder="Domicilio (calle, núm. ext - int, colonia"/>

                    <Label>Ciudad / Municipio</Label>
                    <TextInput pos={3} noMargin focusState={focusedInput} value={ciudad} onChangeText={this._setState.bind(this,"ciudad")} onFocusNext={this._focusNextInput} placeholder="Ciudad o municipio"/>

                    <Label>Estado</Label>
                    <TextInput pos={4} noMargin focusState={focusedInput} value={estado} onChangeText={this._setState.bind(this,"estado")} onFocusNext={this._focusNextInput} placeholder="Estado"/>

                    <View style={CSSView.row}>
                        <View style={CSSView.flex}>
                            <Label>Código postal</Label>
                            <TextInput pos={5} noMargin focusState={focusedInput} value={cp} onChangeText={this._setState.bind(this,"cp")} onFocusNext={this._focusNextInput} placeholder="Código postal"/>
                        </View>
                        <View style={{flex:1,maxWidth:15}}></View>
                        <View style={CSSView.flex}>
                            <Label>País</Label>
                            <TextInput pos={6} noMargin focusState={focusedInput} value={pais} onChangeText={this._setState.bind(this,"pais")} onFocusNext={this._focusNextInput} placeholder="País"/>
                        </View>
                    </View>

                    <View style={CSSView.row}>
                        <View style={CSSView.flex}>
                            <Label valid={!!long}>Longitud</Label>
                            <TextInput pos={7} noMargin focusState={focusedInput} value={long} onChangeText={this._setState.bind(this,"long")} onFocusNext={this._focusNextInput} placeholder="Long."/>
                        </View>
                        <View style={{flex:1,maxWidth:15}}></View>
                        <View style={CSSView.flex}>
                            <View style={[CSSView.row]}>
                                <Label style={CSSView.flex} valid={!!lat}>Latitud</Label>
                                <TouchableOpacity onPress={this._longLatHelp}><Icon name="help-circle" color={colors.gray} size={17}/></TouchableOpacity>
                            </View>
                            <TextInput pos={8} noMargin focusState={focusedInput} value={lat} onChangeText={this._setState.bind(this,"lat")} onFocusNext={this._focusNextInput} placeholder="Lat."/>
                        </View>
                    </View>

                    <Label valid={!!email && isEmail(email)}>Correo electrónico</Label>
                    <TextInput pos={9} noMargin focusState={focusedInput} value={email} onChangeText={this._setState.bind(this,"email")} onFocusNext={this._focusNextInput} placeholder="usuario@dominio.com" isLast/>
                    
                    <View style={CSSView.separate}/>
                    <ListGroupHeader title="Teléfonos" toUpperCase={false} buttons={[
                        {
                            icon:"add-circle",
                            onPress:this._addPhone
                        }
                    ]}/>
                    {
                        telefonos.map(this._mapPhoneNumbers)
                    }

                    <View style={CSSView.separate}/>
                    <ListGroupHeader title="Horarios de la instalación" toUpperCase={false} buttons={[
                        {
                            icon:"add-circle",
                            onPress:this._addHour.bind(this,CENTROSHORARIOS.instalacion)
                        }
                    ]}/>
                    {
                        horariosInstalacion.map(this._mapHours)
                    }

                    <View style={CSSView.separate}/>

                    <ListGroupHeader title="Horarios de informes" toUpperCase={false} buttons={[
                        {
                            icon:"add-circle",
                            onPress:this._addHour.bind(this,CENTROSHORARIOS.informes)
                        }
                    ]}/>
                    {
                        horariosInformes.map(this._mapHours)
                    }

                </View>
            </ScrollView>
            </SafeAreaView> 
        );
    }
}
EditarCentroComponent.navigationOptions = setHeaderComponent({
    title:routes.CentrosRouter.child.EditarCentro.title,
    secondary:true,
    root:false
});

export const EditarCentro = connect(mapStateToProps,mapDispatchToProps)(EditarCentroComponent);