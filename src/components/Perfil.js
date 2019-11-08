//LIB
import React, {Component} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import isEmail from "validator/lib/isEmail";
import isMobilePhone from "validator/lib/isMobilePhone";
import moment from 'moment';
//ELEMENTS
import {View, Alert, TouchableOpacity} from 'react-native';
import {List, ListItem, Badge} from "react-native-elements";
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { TextInput, keyboardTypes } from '../user-controls/TextInput';
import { Label } from '../user-controls/Label';
import { ListGroupHeader } from '../user-controls/ListGroupHeader';
import {Icon} from "../user-controls/IconComponent";
import Toast from 'react-native-root-toast';
import { RefreshView } from '../user-controls/RefreshView';
import { SegmentedButtons } from '../user-controls/SegmentedButtons';
//STYLES
import { CSSView } from '../styles/view';
import { CSSList } from '../styles/list';
import colors from '../styles/colors.json';
import { CSSText } from '../styles/text';
//MODEL
import routes from '../providers/routes';
import { post, ROUTES } from '../services/post';
import { rawStr, scrollTo } from '../services/functions';
import { Usuario } from '../model/Usuario';
import { ALERTS, ACTIONS, USUARIOS, SEXOS, ROLES } from '../services/constants';
import errors from '../services/errors';

class PerfilComponent extends Component{

    //INIT

    constructor(props){
        super(props);
        this.init(props);
    }

    init(props){
        
        props.navigation.setParams({
            onSave:this._save
        });
        this.state = {
            mounted:false,
            ...props.usuario,
            toggleContrasena:false,
            contrasena:"",
            nuevaContrasena:"",
            confContrasena:"",
            focusedInput:0
        };
    }

    componentDidMount() {
        const { usuario } = this.props;
        const tipo = usuario.tipo || 0;
        let keys = Object.keys(ROUTES);
        this.route = tipo > 0 ? ROUTES[keys[tipo]] : '';
    }

    //ACTIONS
    load = (resolve)=>{
        let {network,token, usuario} = this.props;

        if (this.route) {
            Usuario.fetch(network, this.route, ACTIONS.login,{
                token:usuario.token
            },token,(response)=>{
                if(response){
                    let {error, data} = response;
                    if(!error){
                        let c = new Usuario(data);
                        this.props.onLogin(c,()=>{
                            this.setState({
                                ...c,
                                contrasena:"",
                                nuevaContrasena:"",
                                confContrasena:""
                            },resolve);
                        });
                    }else{
                        resolve();
                        Alert.alert(null,error);
                    }
                }else
                    resolve();
            });
        } else {
            Toast.show(errors.session,{shadow:false});
        }
    }

    _refresh = (resolve)=>{
        this.load(resolve);
    }

    _focusNextInput = (pos)=>{
        this.setState({
            focusedInput:pos
        });
    }

    _toggleContrasena = ()=>{
        this.setState({
            toggleContrasena:!this.state.toggleContrasena
        },this._scroll);
    }

    _scroll = (e)=>{
        scrollTo(this.scroll, e, -80, 200)
    }

    _setState = (prop,value)=>{
        this.setState({
            [prop]:value
        });
    }

    _userHelp = ()=>{
        Alert.alert(
            ALERTS.help.title,
            ALERTS.help.text.nombreUsuario
        )
    }

    _save = async ()=>{

        let { network, usuario: { activo } } = this.props;

        if (!network) {
            Toast.show(ALERTS.response.text.network,{shadow:false});
            return;
        }

        if(!activo){
            Alert.alert("", errors.auth);
            return;
        }

        if (!this.route) {
            Toast.show(errors.session,{shadow:false});
            return;
        }

        let { contrasena, nuevaContrasena, confContrasena } = this.state;
        if (!rawStr(contrasena)) {
            Toast.show(ALERTS.form.text.contrasena,{shadow:false});
            return;
        }

        let aPass = rawStr(nuevaContrasena);
        let bPass = rawStr(confContrasena);
        if(aPass && (aPass!==bPass)){
            Toast.show(ALERTS.form.text.confContrasena,{shadow:false});
            return;
        }

        let a = new Usuario(this.state);
        let b = new Usuario(this.props.usuario);

        if(!aPass && a.equals(b)){
            Toast.show(ALERTS.response.text.noChanges,{shadow:false});
            return;
        }

        if(!rawStr(a.usuario) || rawStr(a.usuario).length < 6 || !rawStr(a.email) || !isEmail(a.email) || !rawStr(a.nombres)){
            Toast.show(ALERTS.form.text.invalidCredentials,{shadow:false});
            return;
        }

        this.props.onLoading(true,async (resolve)=>{
            let response = await post(this.route,{action:ACTIONS.update, usuario:a, contrasena:this.state.contrasena, nuevaContrasena, self:true}, this.props.token);

            if(response){
                let {error, data, active} = response;

                if(data && data.token && !error){
                    Usuario.deactivate(active, b, this.props.onLogin, ()=>{
                        this.props.onSetToken(data.token,()=>{
                            let c = new Usuario(data || b);
                            c.activo = active;
                            this.props.onLogin(c,()=>{
                                Toast.show(ALERTS.response.text.saved, {shadow:false});
                                this.setState({
                                    ...c,
                                    contrasena:nuevaContrasena||contrasena,
                                    nuevaContrasena:"",
                                    confContrasena:""
                                },resolve);
                            });
                        });
                    });
                }
                else{
                    resolve();
                    if(error)
                        Alert.alert(
                            null,
                            error
                        );
                }
            }else
                resolve();
        });
    }

    _checkActiveState = async ()=>{
        if(!this.props.usuario.activo)
        this.props.onLoading(true,async (resolve)=>{
            let response = await post(ROUTES.ACTIVO,null, this.props.token);

            if(response){
                let {active} = response;
                let usuario = new Usuario(this.props.usuario);
                Usuario.deactivate(active, usuario, this.props.onLogin, resolve);
            }else
                resolve();
        });
    }

    _setSex = (sexo)=>{
        this.setState({sexo});
    }
    
    //RENDER

    _scrollRef = (x)=>{
        this.scroll = x;
    }

    render(){
        let {focusedInput, contrasena, nuevaContrasena, confContrasena, toggleContrasena, usuario, nombres, apellidos, email, master, tipo, sexo, telefono, rol, centro, nacimiento} = this.state;
        let { usuario: { activo } } = this.props;
        return (
            <RefreshView onRefresh={this._refresh} scrollRef={this._scrollRef}>
                <View style={[CSSView.container, {marginBottom:15}]}>
                    { tipo != USUARIOS.alumno ? (
                        <>
                            {master && <Badge value="Cuenta maestra" textStyle={CSSText.dark} containerStyle={{backgroundColor:colors.clear}} />}
                            <View style={[CSSView.row]}>
                                <Label style={CSSView.flex} valid={rawStr(usuario).length >= 6}>Nombre de usuario</Label>
                                <TouchableOpacity onPress={this._userHelp}><Icon name="help-circle" color={colors.gray} size={17}/></TouchableOpacity>
                            </View>
                            <TextInput pos={1} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"usuario")} onFocusNext={this._focusNextInput} placeholder="Código único de usuario" value={usuario} readOnly/>

                            <Label valid={rawStr(nombres) !== ""}>Nombre(s)</Label>
                            <TextInput autoCapitalize="words" pos={2} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"nombres")} onFocusNext={this._focusNextInput} placeholder="Escribe tu(s) nombre(s)" value={nombres}/>

                            <Label>Apellidos</Label>
                            <TextInput autoCapitalize="words" pos={3} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"apellidos")} onFocusNext={this._focusNextInput} placeholder="Escribe tus apellidos" value={apellidos}/>

                            <Label valid={isEmail(email)}>Correo electrónico</Label>
                            <TextInput pos={4} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"email")} onFocusNext={this._focusNextInput} placeholder="usuario@dominio.com" isLast={!toggleContrasena} value={email} keyboardType={keyboardTypes.email}/>

                            {(tipo == USUARIOS.evaluador) && (
                                <>
                                    <View style={CSSView.separateTop}>
                                        <SegmentedButtons index={sexo} buttons={SEXOS} onChange={this._setSex}/>
                                    </View>

                                    <Label valid={isMobilePhone(telefono)}>Teléfono</Label>
                                    <TextInput pos={5} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"telefono")} onFocusNext={this._focusNextInput} placeholder="## ## #### ##" isLast={!toggleContrasena} value={telefono} keyboardType={keyboardTypes.email}/>

                                    {tipo == USUARIOS.evaluador && (
                                        <>
                                            <Label>Rol</Label>
                                            <TextInput noMargin readOnly placeholder="Rol del evaluador" isLast value={ROLES.labels[rol]} />
                                        </>
                                    )}

                                    {!!centro && (
                                        <>
                                            <Label>Centro deportivo</Label>
                                            <TextInput noMargin readOnly placeholder="Centro deportivo donde labora" isLast value={centro.nombre} />
                                        </>
                                    )}

                                    <View style={CSSView.separate} />
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <List containerStyle={[CSSView.flex, CSSList.noLines, CSSView.separate]}>
                                <ListItem
                                    hideChevron
                                    title="Usuario"
                                    subtitle={usuario}
                                    titleStyle={CSSList.subtitle}
                                    subtitleStyle={CSSList.title}
                                />
                                <ListItem
                                    hideChevron
                                    title="Nombre"
                                    subtitle={`${nombres} ${apellidos}`}
                                    titleStyle={CSSList.subtitle}
                                    subtitleStyle={CSSList.title}
                                />
                                <ListItem
                                    hideChevron
                                    title="Correo"
                                    subtitle={email}
                                    titleStyle={CSSList.subtitle}
                                    subtitleStyle={CSSList.title}
                                />
                                <ListItem
                                    hideChevron
                                    title="Teléfono"
                                    subtitle={telefono}
                                    titleStyle={CSSList.subtitle}
                                    subtitleStyle={CSSList.title}
                                />
                                <ListItem
                                    hideChevron
                                    title="Sexo"
                                    subtitle={SEXOS[sexo]}
                                    titleStyle={CSSList.subtitle}
                                    subtitleStyle={CSSList.title}
                                />
                                {!!nacimiento && (
                                    <>
                                        <ListItem
                                            hideChevron
                                            title="Cumpleaños"
                                            subtitle={moment(nacimiento).format('DD/MM')}
                                            titleStyle={CSSList.subtitle}
                                            subtitleStyle={CSSList.title}
                                        />
                                        <ListItem
                                            hideChevron
                                            title="Edad"
                                            subtitle={`${moment().diff(moment(nacimiento), 'year')} años`}
                                            titleStyle={CSSList.subtitle}
                                            subtitleStyle={CSSList.title}
                                        />
                                    </>
                                )}
                                {!!centro && (
                                    <ListItem
                                        hideChevron
                                        title="Centro deportivo"
                                        subtitle={centro.nombre}
                                        titleStyle={CSSList.subtitle}
                                        subtitleStyle={CSSList.title}
                                    />
                                )}
                            </List>
                        </>
                    ) }

                    <ListGroupHeader secondary title="Cambiar contraseña" toUpperCase={false} buttons={[
                        {
                            icon:toggleContrasena?"arrow-dropup":"arrow-dropdown",
                            onPress:this._toggleContrasena
                        }
                    ]} onPress={this._toggleContrasena}/>

                    {toggleContrasena && (
                    <View onLayout={this._scroll}>

                        <Label>Nueva contraseña</Label>
                        <TextInput pos={6} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"nuevaContrasena")} onFocusNext={this._focusNextInput} placeholder="Nueva contraseña" value={nuevaContrasena} secureTextEntry/>

                        <Label>Confirmar nueva contraseña</Label>
                        <TextInput pos={7} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"confContrasena")} onFocusNext={this._focusNextInput} placeholder="Confirmar nueva contraseña" value={confContrasena} secureTextEntry/>

                    </View>
                    )}

                    <Label valid={rawStr(contrasena)}>Contraseña actual</Label>
                    <TextInput pos={8} noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"contrasena")} onFocusNext={this._focusNextInput} placeholder="Requerida para poder guardar" value={contrasena} secureTextEntry isLast/>

                    <ListItem
                        leftIcon={{name:activo?"check":"close",color:activo?colors.success:colors.danger}}
                        title={`Cuenta ${activo?"activa":"inactiva"}`}
                        hideChevron
                        containerStyle={CSSList.noLines}
                        rightTitle={activo?" ":"Comprobar"}
                        onPress={this._checkActiveState}
                    />
                    
                </View>
            </RefreshView>
        );
    }
}
PerfilComponent.navigationOptions = setHeaderComponent({
    title:routes.Perfil.title
});

export const Perfil = connect(mapStateToProps,mapDispatchToProps)(PerfilComponent);