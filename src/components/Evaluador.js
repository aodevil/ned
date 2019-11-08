//LIB
import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
//ELEMENTS
import {View, Alert, TouchableOpacity, SafeAreaView, ScrollView, DatePickerIOS, DatePickerAndroid, Platform} from 'react-native';
import {ListItem} from "react-native-elements";
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { TextInput, keyboardTypes } from '../user-controls/TextInput';
import { Label } from '../user-controls/Label';
import {Icon} from "../user-controls/IconComponent";
import Toast from 'react-native-root-toast';
import {Switch} from "../user-controls/Switch"; 
import { SegmentedButtons } from '../user-controls/SegmentedButtons';
import { Select } from '../user-controls/Select';
//STYLES
import { CSSView } from '../styles/view';
import colors from '../styles/colors.json';
//MODEL
import routes from '../providers/routes';
import { post, ROUTES } from '../services/post';
import { rawStr, shortDateString } from '../services/functions';
import { Usuario } from '../model/Usuario';
import { Centro } from '../model/Centro';
import { ALERTS, ACTIONS, USUARIOS, SEXOS, ROLES, SEXO } from '../services/constants';
import errors from '../services/errors';
import isEmail from "validator/lib/isEmail";
import isMobilePhone from "validator/lib/isMobilePhone";
import { LocationSelector } from '../user-controls/LocationSelector';

const maleRoles = [
    "Entrenador",
    "Nutriólogo"
];

const femaleRoles = [
    "Entrenadora",
    "Nutrióloga"
]

class EvaluadorComponent extends Component{

    //INIT

    constructor(props){
        super(props);
        this.init(props);
    }

    init(props){
        let {navigation:n, centros} = props;
        this.centros = Centro.getRawList(centros);
        this.item = new Usuario(n.getParam("item"));
        this.item.tipo = USUARIOS.evaluador;
        this.item.rol = this.item.rol?this.item.rol:ROLES.entrenador;
        n.setParams({
            onSave: this._save,
            title:this.item?this.item.nombre:null
        });

        let rol_index = (this.item.rol == ROLES.entrenador)?0:1;

        this.state = {
            mounted:false,
            ...new Usuario(this.item),
            contrasena:"",
            rol_index,
            changes:0,
            confContrasena:"",
            focusedInput:0
        };
    }

    //ACTIONS
    _focusNextInput = (pos)=>{
        this.setState({
            focusedInput:pos
        });
    }

    _setState = (prop,value)=>{
        this.setState({
            [prop]:value
        });
    }

    _setActiveState = (activo)=>{
        this.setState({activo});
    }

    _setSex = (sexo)=>{
        this.setState({sexo});
    }

    _setBirthDay = (nacimiento)=>{
        this.setState({nacimiento: nacimiento.getTime()});
    }

    _androidSetBirthDay = async ()=>{
        try {
            let {nacimiento} = this.state;
            let {action, year, month, day} = await DatePickerAndroid.open({
                date: nacimiento?new Date(nacimiento):new Date(),
                mode:"spinner"
            });
            if (action !== DatePickerAndroid.dismissedAction) {
                let _nacimiento = new Date(year,month,day);
                this.setState({
                    nacimiento:_nacimiento.getTime()
                });
            }
        } catch ({code, message}) {
            Toast.show(ALERTS.form.text.cantOpenPicker,{shadow:false});
        }
    }

    _setLocation = ({ centro, lugar })=>{
        if (!centro) return;
        this.setState(({ changes }) => {
            return {
                centro: {
                    ID: centro,
                    nombre: lugar
                },
                changes:changes+1
            };
        });
    }

    _setRol = (prop,value)=>{
        this.setState({
            [prop]:value,
            rol:value%2 == 0?ROLES.entrenador:ROLES.nutriologo,
            changes:this.state.changes +1
        });
    }

    _userHelp = ()=>{
        Alert.alert(
            ALERTS.help.title,
            ALERTS.help.text.nombreUsuario
        )
    }

    _save = async ()=>{

        let {usuario:{activo, ID}, network} = this.props;

        if(!network){
            Toast.show(ALERTS.response.text.network,{shadow:false});
            return;
        }

        if(!activo){
            Alert.alert("",errors.auth);
            return;
        }

        let {contrasena, confContrasena, changes} = this.state;

        let aPass = rawStr(contrasena);
        let bPass = rawStr(confContrasena);

        if(!this.item.usuario && !aPass){
            Toast.show(ALERTS.form.text.required,{shadow:false});
            return;
        }

        if(aPass && (aPass!==bPass)){
            Toast.show(ALERTS.form.text.confContrasena,{shadow:false});
            return;
        }

        let a = new Usuario(this.state);
        let b = new Usuario(this.item);

        if(!aPass && a.equals(b) && changes <= 0){
            Toast.show(ALERTS.response.text.noChanges,{shadow:false});
            return;
        }

        if(
            !rawStr(a.nombres) ||
            !rawStr(a.centro) ||
            (!rawStr(a.email) || !isEmail(a.email)) || 
            (!rawStr(a.telefono) || !isMobilePhone(a.telefono)) ||
            a.rol <= 0
        ){
            Toast.show(ALERTS.form.text.invalidCredentials,{shadow:false});
            return;
        }

        this.props.onLoading(true,async (resolve)=>{
            
            let response = await post(ROUTES.EVALUADOR,{action:ACTIONS.update, ID, usuario:{...a, centro: a.centro.ID}, contrasena:this.state.contrasena, self:false}, this.props.token);

            if(response){
                let {error, data} = response;
                if(!error && data){
                    a.usuario = data;
                    this.props.onUpdateEvaluador(a,()=>{
                        this.item.copy(a);
                        this.setState({
                            usuario:data,
                            contrasena:"",
                            confContrasena:"",
                            changes:0
                        },()=>{
                            let {navigation:n} = this.props;
                            n.state.params.onUpdate("")
                            Toast.show(ALERTS.response.text.saved,{shadow:false});
                            resolve();
                        });
                    });
                }else{
                    resolve();
                    Alert.alert(null,error || ALERTS.response.text.noChanges);
                }
            }else
                resolve();
        });
    }
    
    //RENDER

    render(){
        let { focusedInput, contrasena, confContrasena, usuario, nombres, apellidos, email, activo, sexo, nacimiento, telefono, rol_index, centro } = this.state;
        let requirePass = !this.item.usuario;
        let _nacimiento = nacimiento?new Date(nacimiento):new Date();
        const centroID = centro ? centro.ID : null;
        return(
            <SafeAreaView style={CSSView.main}>
                <ScrollView>
                    <View style={[CSSView.container, {marginBottom:15}]}>

                        {!!usuario && (
                        <Fragment>
                            <View style={[CSSView.row]}>
                                <Label style={CSSView.flex} valid={rawStr(usuario).length >= 6}>Nombre de usuario</Label>
                                <TouchableOpacity onPress={this._userHelp}><Icon name="help-circle" color={colors.gray} size={17}/></TouchableOpacity>
                            </View>
                            <TextInput pos={1} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"usuario")} onFocusNext={this._focusNextInput} placeholder="Código único de usuario" value={usuario} readOnly/>
                        </Fragment>
                        )}

                        <Label valid={rawStr(nombres) !== ""}>Nombre(s)</Label>
                        <TextInput autoCapitalize="words" pos={2} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"nombres")} onFocusNext={this._focusNextInput} placeholder="Nombre(s) del evaluador" value={nombres}/>

                        <Label>Apellidos</Label>
                        <TextInput autoCapitalize="words" pos={3} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"apellidos")} onFocusNext={this._focusNextInput} placeholder="Apellidos del evaluador" value={apellidos}/>

                        <View style={CSSView.separate}>
                            <SegmentedButtons index={sexo} buttons={SEXOS} onChange={this._setSex}/>
                        </View>

                        <Label>Fecha de nacimiento</Label>
                        {Platform.OS === "ios"?(
                        <DatePickerIOS
                            mode="date"
                            date={_nacimiento}
                            onDateChange={this._setBirthDay}
                        />
                        ):(
                            <ListItem
                                title={shortDateString(_nacimiento)}
                                hideChevron
                                onPress={this._androidSetBirthDay}
                            />
                        )}
                        

                        <Label valid={isEmail(email)}>Correo electrónico</Label>
                        <TextInput pos={4} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"email")} onFocusNext={this._focusNextInput} placeholder="usuario@dominio.com" value={email} keyboardType={keyboardTypes.email}/>

                        <View style={CSSView.separateSm}>
                            <Label valid={isMobilePhone(telefono)}>Teléfono</Label>
                            <TextInput pos={5} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"telefono")} onFocusNext={this._focusNextInput} placeholder="## ## #### ##" value={telefono} keyboardType={keyboardTypes.phone}/>
                        </View>

                        <View style={CSSView.separateSm}>
                            <Label style={CSSView.flex} valid={centroID}>Centro donde labora</Label>
                            <LocationSelector 
                                readOnly
                                nameOnly
                                subtitles={false}
                                placeholder="Centro donde labora"
                                value={(centro ? centro.nombre : '')}
                                onChange={this._setLocation}
                            />
                        </View>

                        <View style={CSSView.separateSm}>
                            <Label valid={rol_index >= 0}>Rol</Label>
                            <Select 
                                defaultValue={rol_index}
                                name="rol_index"
                                label="Elige un rol" 
                                options={sexo === SEXO.M ? maleRoles : femaleRoles}
                                onChange={this._setRol}
                            />
                        </View>

                        <Label valid={!requirePass || (requirePass && rawStr(contrasena) !== "")}>Contraseña</Label>
                        <TextInput pos={6} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"contrasena")} onFocusNext={this._focusNextInput} placeholder="Contraseña" value={contrasena} secureTextEntry/>

                        <Label valid={!(rawStr(contrasena) !== "" && rawStr(confContrasena) === "")}>Confirmar contraseña</Label>
                        <TextInput pos={7} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"confContrasena")} onFocusNext={this._focusNextInput} placeholder="Confirmar contraseña" value={confContrasena} secureTextEntry isLast/>

                        <Switch
                            style={{paddingTop:20}}
                            label={activo?"Cuenta activa":"Cuenta inactiva"}
                            onValueChange={this._setActiveState}
                            value={activo}
                        />
                        
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}
EvaluadorComponent.navigationOptions = setHeaderComponent({
    root:false,
    secondary:true,
    title:routes.EvaluadoresRouter.child.Evaluador.title
});

export const Evaluador = connect(mapStateToProps,mapDispatchToProps)(EvaluadorComponent);