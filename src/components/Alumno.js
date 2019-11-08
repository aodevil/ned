//LIB
import React, { Component } from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import isEmail from "validator/lib/isEmail";
import isMobilePhone from "validator/lib/isMobilePhone";
import isAlphanumeric from "validator/lib/isAlphanumeric";
import { setStorage, storageKeys, getStorage } from '../services/storage';
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
import { AnimatedFooter } from '../user-controls/AnimatedFooter';
//STYLES
import { CSSView } from '../styles/view';
import colors from '../styles/colors.json';
import { CSSText } from '../styles/text';
import { CSSList } from '../styles/list';
//MODEL
import routes from '../providers/routes';
import { post, ROUTES } from '../services/post';
import { rawStr, shortDateString, componentDidMountDelay } from '../services/functions';
import { Usuario } from '../model/Usuario';
import { ALERTS, ACTIONS, USUARIOS, SEXOS } from '../services/constants';
import errors from '../services/errors';

class AlumnoComponent extends Component{

    //INIT

    constructor(props){
        super(props);
        this.init(props);
    }

    init(props){
        let { navigation: n, usuario } = props;
        this.item = new Usuario(n.getParam('item'));
        this.onItemUpdated = n.getParam('onUpdate');
        this.onItemSelected = n.getParam('onItemSelected');
        this.item.tipo = USUARIOS.alumno;
        if (!this.item.registrante) this.item.registrante = usuario.ID;
        n.setParams({
            onSave: this._save,
            title: this.item ? this.item.nombre : null
        });

        this.state = {
            mounted:false,
            collapseFooter: true,
            ...new Usuario(this.item),
            contrasena: '',
            changes:0,
            confContrasena: '',
            focusedInput:0
        };
    }

    componentDidMount() {
        componentDidMountDelay(this, async () => {
            
            let contrasena = '';
            
            let storage = await getStorage(storageKeys.alumnos_tmp);
            
            if (storage && this.item) {
                storage = JSON.parse(storage);
                const alumno = storage.find(x => x.ID === this.item.ID);
                if (alumno) {
                    contrasena = alumno.contrasena;
                }
            }

            this.setState({
                collapseFooter: this.item.usuario && this.item.activo ? false : true,
                contrasena,
                confContrasena: contrasena
            });
        });
    }

    //ACTIONS
    _focusNextInput = (pos)=>{
        this.setState({
            focusedInput:pos,
        });
    }

    _setState = (prop,value)=>{
        this.setState({
            [prop]: value,
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

    _userHelp = ()=>{
        Alert.alert(
            ALERTS.help.title,
            `${ALERTS.help.text.nombreUsuario}\r\n\r\nIndica un nombre, mínimo de 6 caracteres, que el alumno pueda recordar fácilmente. Por ejemplo, sus iniciales más los últimos 4 dígitos de su número telefónico (ej., XX1234). Sólo se permiten números y letras, sin acentos, espacios ni caracteres especiales.`
        )
    }

    updateLocalStorage = async (alumno, callback) => {
        const { ID } = alumno;
        let alumnos = [];
        const storage = await getStorage(storageKeys.alumnos_tmp);
        if (storage) {
            alumnos = JSON.parse(storage).filter(x => x.ID !== ID);
            setStorage(storageKeys.alumnos_tmp, JSON.stringify(alumnos))
            .then(callback)
            .catch(callback);
        } else {
            if (callback) callback();
        }
    }

    setLocalStorage = async (alumno, contrasena, callback, resolve, toast = ALERTS.storage.text.tmp) => {
        Alert.alert(
            ALERTS.storage.title,
            ALERTS.storage.text.userName,
            [
                {
                    text: ALERTS.storage.text.cancel,
                    onPress: resolve
                },
                {
                    text: ALERTS.storage.text.accept,
                    onPress: async () => {
                        const item = Usuario.reduce(alumno, contrasena, !this.item.usuario);
        
                        let alumnos = [ ];

                        const storage = await getStorage(storageKeys.alumnos_tmp);

                        if (storage) {
                            alumnos = [ ...JSON.parse(storage).filter(x => x.ID !== item.ID), item ];
                        } else {
                            alumnos.push(item);
                        }

                        if (alumnos.length >= 50) {
                            Alert.alert(ALERTS.storage.title, ALERTS.storage.text.limit);
                            return;
                        }

                        setStorage(storageKeys.alumnos_tmp, JSON.stringify(alumnos))
                        .then(()=>{ 
                            Toast.show(toast, { shadow: false, duration: 3000 });
                            if(callback) callback(item.usuario); 
                        })
                        .catch(()=>{ 
                            Alert.alert(ALERTS.storage.title, ALERTS.storage.text.error);
                        });
                    }
                }
            ]
        );
    }

    _onUpdateAlumno = (item, usuario, resolve) => {
        let { onUpdateAlumno } = this.props;
        item.usuario = usuario;
        onUpdateAlumno(item,()=>{
            this.item.copy(item);
            this.setState({
                usuario,
                contrasena:"",
                confContrasena:"",
                collapseFooter: !this.item.activo,
                changes:0
            }, resolve);
        });
    }

    _save = async ()=>{

        let { usuario: { centro, activo, ID }, network, token, onLoading } = this.props;

        if(!activo){
            Alert.alert("", errors.auth);
            return;
        }

        let { contrasena, confContrasena, changes } = this.state;

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
            !rawStr(a.usuario) ||
            rawStr(a.usuario).length < 6 ||
            !isAlphanumeric(a.usuario) ||
            !rawStr(a.nombres) ||
            (!rawStr(a.email) || !isEmail(a.email)) || 
            (!rawStr(a.telefono) || !isMobilePhone(a.telefono)) ||
            !a.nacimiento
        ){
            Toast.show(ALERTS.form.text.invalidCredentials,{shadow:false});
            return;
        }

        if (!network) {
            this.setLocalStorage(a, contrasena, (user) => {
                this._onUpdateAlumno(a, user, ()=>{
                    if (this.onItemUpdated) this.onItemUpdated('');
                });
            });
            return;
        }

        onLoading(true, async (resolve)=>{
            let response = await post(ROUTES.ALUMNO,{action:ACTIONS.update, ID, insert: !this.item.usuario || this.item.usuario !== a.usuario, usuario:{...a, centro: (!this.item.centro) ? centro.ID : this.item.centro.ID }, contrasena, self:false}, token);
            if(response){
                let {error, data} = response;
                if(!error && data){
                    
                    this._onUpdateAlumno(a, data, ()=>{
                        
                        this.updateLocalStorage(a, () => {
                            if (this.onItemUpdated) this.onItemUpdated('');
                            Toast.show(ALERTS.response.text.saved, { shadow:false });
                            if (resolve) resolve();
                        });

                    });
                }else{
                    Alert.alert(null, error || ALERTS.response.text.noChanges);
                    resolve();
                }
            } else {
                resolve();
            }
        });
    }
    
    _select = () => {
        this.onItemSelected(new Usuario(this.state), -1)();
    }
    //RENDER

    render(){
        let { focusedInput, contrasena, confContrasena, usuario, nombres, apellidos, email, activo, sexo, nacimiento, telefono, collapseFooter : _collapseFooter } = this.state;
        let requirePass = !this.item.usuario;
        let _nacimiento = nacimiento ? new Date(nacimiento) : new Date();
        const { network } = this.props;
        const lockUserName = (!network && this.item.usuario);
        const collapseFooter = !network ? true : _collapseFooter;
        return(
            <>
                <SafeAreaView style={CSSView.main}>
                    <ScrollView>
                        <View style={[CSSView.container, {marginBottom:collapseFooter ? 15 : 80}]}>

                            <View style={[CSSView.row]}>
                                <Label style={CSSView.flex} valid={rawStr(usuario).length >= 6}>Nombre de usuario</Label>
                                <TouchableOpacity onPress={this._userHelp}><Icon name="help-circle" color={colors.gray} size={17}/></TouchableOpacity>
                            </View>
                            <TextInput pos={1} autoCapitalize="characters" noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"usuario")} onFocusNext={this._focusNextInput} placeholder="Código único de usuario" value={usuario} readOnly={lockUserName}/>

                            <Label valid={rawStr(nombres) !== ""}>Nombre(s)</Label>
                            <TextInput pos={2} autoCapitalize="words" noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"nombres")} onFocusNext={this._focusNextInput} placeholder="Nombre(s) del alumno" value={nombres}/>

                            <Label>Apellidos</Label>
                            <TextInput pos={3} autoCapitalize="words" noMargin focusState={focusedInput} onChangeText={this._setState.bind(this,"apellidos")} onFocusNext={this._focusNextInput} placeholder="Apellidos del alumno" value={apellidos}/>

                            <View style={CSSView.separate}>
                                <SegmentedButtons index={sexo} buttons={SEXOS} onChange={this._setSex}/>
                            </View>

                            <Label valid={nacimiento}>Fecha de nacimiento</Label>
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
                <AnimatedFooter collapse={collapseFooter} height={70} background={colors.dark} safeAreaView>
                    <ListItem
                        title="Realizar evaluaciones"
                        containerStyle={CSSList.noLines}
                        titleStyle={CSSText.white}
                        onPress={this._select}
                    />
                </AnimatedFooter>
            </>
        );
    }
}
AlumnoComponent.navigationOptions = setHeaderComponent({
    root:false,
    secondary:true,
    title:routes.AlumnosRouter.child.Alumno.title
});

export const Alumno = connect(mapStateToProps,mapDispatchToProps)(AlumnoComponent);