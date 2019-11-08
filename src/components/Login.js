//LIB
import React, {Component, useState, useEffect} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
//ELEMENTS
import {Image, View, Text, ScrollView, StyleSheet, Alert, ActivityIndicator} from 'react-native';
import { TextInput } from '../user-controls/TextInput';
import { Button } from '../user-controls/Button';
import Toast from 'react-native-root-toast';
import { Label } from '../user-controls/Label';
import { OverlayModal } from '../user-controls/OverlayModal';
//STYLES
import {CSSView} from "../styles/view";
import { CSSText } from '../styles/text';
import colors from "../styles/colors";
//IMAGES
import BGLogin from "../assets/BG.jpg";
import LogoNED from "../assets/Logo-NED.png";
import LogoCODE from "../assets/Logo-CODE.png";
import LogoJalisco from "../assets/Logo-Jalisco.png";
//MODEL
import { post, ROUTES } from '../services/post';
import errors from '../services/errors';
import { Usuario } from '../model/Usuario';
import { ALERTS } from '../services/constants';
import { LoaderModule } from '../model/Loader';
import { rawStr } from '../services/functions';
import isEmail from 'validator/lib/isEmail';

const styles = StyleSheet.create({
    header:{
        flex:0,
        top:0,
        paddingTop:60
    },
    logo:{
        width:160,
        height:94,
        resizeMode:"center"
    },
    logoCODE:{
        width:62,
        height:110,
        resizeMode:"center"
    },
    logoJalisco:{
        width:85,
        height:85,
        resizeMode:"center"
    },
    container:{
        flex:1,
        justifyContent:"space-between",
        alignItems: 'center'
    },
    form: {
        paddingRight: 20
    },
    input:{
        backgroundColor:colors.white,
        borderBottomRightRadius:100,
        borderTopRightRadius:20,
        borderBottomWidth:0,
        paddingLeft:35,
        paddingRight:15,
        textAlign: 'center',
    },
    button: {
        borderRadius: 0,
        borderBottomRightRadius:100,
        borderTopRightRadius:20,
        borderLeftWidth: 0,
        paddingLeft: 20,
        height: 50
    },
    buttonClear: {
        marginLeft: 20
    },
    footer:{
        flex:0,
        paddingBottom:20,
        paddingLeft: 20,
        paddingRight: 20,
        bottom:0,
        alignItems:"center"
    }
});

const RecoveryPasswordComponent = ({ value, onChange }) => {
    const [isValid, _isValid] = useState(false);
    useEffect(() => {
        _isValid(isEmail(value) || rawStr(value).length >= 4);
    }, [ value ]);
    return (
        <>
            <Text style={[CSSText.fontMd, CSSText.bold, CSSText.center]}>Recupera tu contraseña</Text>
            <View style={CSSView.paddingHeightSm}>
                <Label style={CSSText.center} valid={isValid}>Correo o nombre de usuario</Label>
                <TextInput isLast placeholder="Escribe tu correo o usuario" styles={[CSSText.center]} onChangeText={onChange} value={value} noMargin />
            </View>
        </>
    );
}

export class LoginComponent extends Component{

    //MOUNT

    constructor(props){
        super(props);
        this.state = {
            mounted:false,
            user:'',
            pass:'',
            focusedInput:0,
            recoveryUser: '',
            passwordModal: false
        }
    }

    //UI

    _focusNextInput = (pos)=>{
        this.setState({
            focusedInput:pos
        });
    }

    //ACTIONS

    _setState = (prop,value)=>{
        this.setState({
            [prop]:value
        });
    }

    _login = async ()=>{

        let {user,pass} = this.state;
        let {network} = this.props;

        if(!network){
            Toast.show(ALERTS.response.text.network,{shadow:false});
            return;
        }

        if(!user.trim() || !pass.trim())return;

        this.props.onLoading(true,async (resolve)=>{
            let response = await post(ROUTES.LOGIN,{user,pass});

            if(response){
                let {error, data} = response;
                if(data && !error){
                    let {tipo, token} = data;
                    if(!(token)){
                        resolve();
                        Alert.alert(
                            null,
                            errors.auth
                        );
                    }else{
                        this.props.onSetToken(token,()=>{
                            this.props.onLogin(new Usuario(data),()=>{
                                const loader = new LoaderModule();
                                loader.putStorageIntoStore(this.props, () => {
                                    resolve();
                                    this._goTo(Usuario.routeForUser(tipo));
                                });
                            });
                        });
                    }
                }
                else if(error){
                    resolve();
                    Alert.alert(
                        null,
                        error
                    );
                }
            }else{
                resolve();
            }
        });
    }

    _goTo = (route)=>{
        let {navigate} = this.props.navigation;
        navigate(route);
    }
    
    _togglePasswordModal = () => {
        this.setState(({ passwordModal }) => ({
            passwordModal: !passwordModal
        }));
    }

    _requestPasswordRecovery = async ()=>{

        let { recoveryUser } = this.state;
        let { network } = this.props;

        if (!network) {
            Toast.show(ALERTS.response.text.network,{shadow:false});
            return;
        }

        if(!(rawStr(recoveryUser).length >= 4 || isEmail(recoveryUser)))return;

        this.props.onLoading(true,async (resolve)=>{
            let response = await post(ROUTES.PASSWORD, {user: recoveryUser});

            if(response){
                let { error, data } = response;
                if (error) {
                    resolve();
                    Alert.alert(
                        null,
                        error
                    );
                    return;
                }
                if (!data) {
                    resolve();
                    Alert.alert(
                        null,
                        errors.userNotFound
                    );
                    return;
                }
                Alert.alert(
                    null,
                    `Se ha enviado un correo a ${data} con la nueva contraseña.`,
                    [
                        {
                            text: 'Aceptar',
                            onPress: () => {
                                this.setState({
                                    passwordModal: false
                                }, resolve);
                            }
                        }
                    ]
                );
            }else{
                resolve();
            }
        });
    }

    //RENDER

    render() {
        const { loading } = this.props;
        let { user, pass, focusedInput, passwordModal, recoveryUser } = this.state;
        let baseRoute = Usuario.routeForUser(0);
        return (
        <View style={CSSView.main}>
            <Image source={BGLogin} style={[CSSView.backgroundImage]}/>
            <ScrollView contentContainerStyle={CSSView.flex}>
            <View style={[styles.container]}>
                <View style={styles.header}>
                    <Image source={LogoNED} style={styles.logo}/>
                </View>
                <View style={[CSSView.fullWidth, styles.form]}>
                    <TextInput pos={1} focusState={focusedInput} value={user} onChangeText={this._setState.bind(this,"user")} onFocusNext={this._focusNextInput} styles={[styles.input]} placeholder="Nombre de usuario"/>
                    <TextInput pos={2} focusState={focusedInput} value={pass} placeholder="Contraseña" onChangeText={this._setState.bind(this,"pass")} onFocusNext={this._focusNextInput} isLast secureTextEntry={true} styles={[styles.input]} />
                    <Button color={colors.white} border onPress={this._login} styles={[styles.button]}>
                        INICAR SESIÓN
                    </Button>
                    <Button color={colors.white} onPress={this._togglePasswordModal} noMargin styles={[styles.buttonClear]}>
                        Recuperar contraseña
                    </Button>
                    <Button color={colors.primary} onPress={this._goTo.bind(this,baseRoute)} noMargin styles={[styles.buttonClear]}>
                        NO TENGO CUENTA{"\n"}Soy Visitante
                    </Button>
                </View>
                <View style={[styles.footer, CSSView.row]}>
                    <Image source={LogoCODE} style={styles.logoCODE}/>
                    <Image source={LogoJalisco} style={styles.logoJalisco}/>
                </View>
            </View>
            </ScrollView>
            <OverlayModal visible={passwordModal} cancel={this._togglePasswordModal} dismiss={this._togglePasswordModal} submit={this._requestPasswordRecovery} dismissColor={colors.secondary} dismissLabel='Enviar' divider={false} loading={loading}>
                <RecoveryPasswordComponent
                    value={recoveryUser}
                    onChange={this._setState.bind(this, 'recoveryUser')}
                />
            </OverlayModal>
        </View>
        );
    }
}

export const Login = connect(mapStateToProps,mapDispatchToProps)(LoginComponent);