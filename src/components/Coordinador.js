//LIB
import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
//ELEMENTS
import {View, Alert, TouchableOpacity, SafeAreaView, ScrollView} from 'react-native';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { TextInput, keyboardTypes } from '../user-controls/TextInput';
import { Label } from '../user-controls/Label';
import {Icon} from "../user-controls/IconComponent";
import Toast from 'react-native-root-toast';
import {Switch} from "../user-controls/Switch"; 
//STYLES
import { CSSView } from '../styles/view';
import colors from '../styles/colors.json';
//MODEL
import routes from '../providers/routes';
import { post, ROUTES } from '../services/post';
import { rawStr } from '../services/functions';
import { Usuario } from '../model/Usuario';
import { ALERTS, ACTIONS, USUARIOS } from '../services/constants';
import errors from '../services/errors';
import isEmail from "validator/lib/isEmail";

class CoordinadorComponent extends Component{

    //INIT

    constructor(props){
        super(props);
        this.init(props);
    }

    init(props){
        let {navigation:n, usuario:{master}} = props;
        this.item = new Usuario(n.getParam("item"));
        this.item.tipo = USUARIOS.coordinador;
        n.setParams({
            onSave:master?this._save:null,
            title:this.item?this.item.nombre:null
        });

        this.state = {
            mounted:false,
            ...new Usuario(this.item),
            contrasena:"",
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

        let {contrasena, confContrasena} = this.state;

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

        if(!aPass && a.equals(b)){
            Toast.show(ALERTS.response.text.noChanges,{shadow:false});
            return;
        }

        if(
            !rawStr(a.nombres) ||
            (!rawStr(a.email) || !isEmail(a.email))
        ){
            Toast.show(ALERTS.form.text.invalidCredentials,{shadow:false});
            return;
        }

        this.props.onLoading(true,async (resolve)=>{
            let response = await post(ROUTES.COORDINADOR,{action:ACTIONS.update, ID, usuario:a, contrasena:this.state.contrasena, self:false}, this.props.token);

            if(response){
                let {error, data} = response;
                if(!error && data){
                    a.usuario = data;
                    this.props.onUpdateCoordinador(a,()=>{
                        this.item.copy(a);
                        this.setState({
                            usuario:data,
                            contrasena:"",
                            confContrasena:""
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
        let {focusedInput, contrasena, confContrasena, usuario, nombres, apellidos, email, activo} = this.state;
        let {usuario:{master}} = this.props;
        let requirePass = !this.item.usuario;
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
                        <TextInput autoCapitalize="words" pos={2} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"nombres")} onFocusNext={this._focusNextInput} placeholder="Nombre(s) del coordinador" value={nombres}/>

                        <Label>Apellidos</Label>
                        <TextInput autoCapitalize="words" pos={3} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"apellidos")} onFocusNext={this._focusNextInput} placeholder="Apellidos del coordinador" value={apellidos}/>

                        <Label valid={isEmail(email)}>Correo electrónico</Label>
                        <TextInput pos={4} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"email")} onFocusNext={this._focusNextInput} placeholder="usuario@dominio.com" value={email} keyboardType={keyboardTypes.email}/>

                        <Label valid={!requirePass || (requirePass && rawStr(contrasena) !== "")}>Contraseña</Label>
                        <TextInput pos={5} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"contrasena")} onFocusNext={this._focusNextInput} placeholder="Contraseña" value={contrasena} secureTextEntry/>

                        <Label valid={!(rawStr(contrasena) !== "" && rawStr(confContrasena) === "")}>Confirmar contraseña</Label>
                        <TextInput pos={6} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"confContrasena")} onFocusNext={this._focusNextInput} placeholder="Confirmar contraseña" value={confContrasena} secureTextEntry isLast/>

                        <Switch
                            style={{paddingTop:20}}
                            label={activo?"Cuenta activa":"Cuenta inactiva"}
                            onValueChange={this._setActiveState}
                            value={activo}
                            disabled={!master}
                        />
                        
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}
CoordinadorComponent.navigationOptions = setHeaderComponent({
    root:false,
    secondary:true,
    title:routes.CoordinadoresRouter.child.Coordinador.title
});

export const Coordinador = connect(mapStateToProps,mapDispatchToProps)(CoordinadorComponent);