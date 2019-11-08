//LIB
import React, {Component} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import {withNavigation} from "react-navigation";
import moment from 'moment';
//ELEMENTS
import { Button } from '../user-controls/Button';
import {View, FlatList, Alert, Text, Dimensions, Modal, SafeAreaView, ActivityIndicator, TouchableOpacity} from 'react-native';
import { List, ListItem, SearchBar } from 'react-native-elements';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { RefreshView } from '../user-controls/RefreshView';
import SwipeOut from "react-native-swipeout";
import Toast from 'react-native-root-toast';
import { Loader } from '../user-controls/Loader';
//STYLES
import { CSSView } from '../styles/view';
import { CSSText } from '../styles/text';
import { CSSList } from '../styles/list';
import colors from '../styles/colors';
//MODEL
import errors from '../services/errors';
import routes from '../providers/routes';
import { rawStr, componentDidMountDelay, monthNameWithIndex } from '../services/functions';
import { Usuario } from '../model/Usuario';
import { ACTIONS, USUARIOS, ALERTS, ROLES } from '../services/constants';
import { ROUTES, post } from '../services/post';
import { getStorage, storageKeys, setStorage } from '../services/storage';
import { Icon } from '../user-controls/IconComponent';
import { CSSForms } from '../styles/forms';
import { AnimatedFooter } from '../user-controls/AnimatedFooter';

class FindUserModalComponent extends Component{

    //INIT

    constructor(props){
        super(props);
        this.mounted = false;
        this.state = { items: [], filtering: false, attemps: false };
        this.timeout = null;
        this.fetching = false;
    }

    componentDidMount() { this.mounted = true; }

    componentWillUnmount() { this.mounted = false; }

    //ACTIONS

    _onSearch = (value) => {
        clearTimeout(this.timeout);
        if (!this.mounted) return;
        if(!rawStr(value) || this.fetching) {
            this.setState({ filtering: false });
            return;
        }
        this.setState({
            filtering: true,
        }, () => {
            this.timeout = setTimeout(() => {
                if (!this.mounted) return;
                this.fetching = true;
                let { network, token, usuario, onUpdate } = this.props;
                Usuario.fetch(network, ROUTES.ALUMNO, ACTIONS.select, {
                    evaluador: usuario.ID,
                    source: parseInt(usuario.rol) === ROLES.entrenador ? 'pruebas' : 'mediciones',
                    userName: rawStr(value) 
                }, token, (response) => {
                    if (!this.mounted) return;
                    let { error, data } = response;
                    this.setState({
                        filtering: false,
                        attemps: true,
                        items: data ? [ {...data} ] : []
                    }, () => {
                        if(error){
                            Toast.show(error, {shadow: false, zIndex: 200});
                        } else {
                            onUpdate(data);
                        }
                        setTimeout(() => {
                            this.fetching = false;
                        }, 530);
                    });
                });
            }, 2000);
        });
    }

    //RENDER

    _keyExtractor = (x,i)=>{
        return `item-alumno-${x.ID}`;
    }

    _renderItem = ({ item, index })=>(
        <ListItem 
            title={`${item.nombres} ${item.apellidos}`}
            subtitle={`Usuario: ${item.usuario}`} 
            rightTitle={(item.activo?` `:`Inactivo`)}
            rightTitleStyle={CSSText.danger}
            onPress={this.props.onItemSelected(item, index)}
        />
    );

    render(){
        let { onDismiss, network } = this.props;
        let { items, filtering, attemps } = this.state;
        return(
            <SafeAreaView style={[CSSView.main,{backgroundColor:colors.secondary}]}>
                <View style={[CSSView.row, {justifyContent:"flex-start", backgroundColor:colors.secondary }]}>
                    <View style={CSSView.flex}>
                        <SearchBar 
                            inputStyle={{backgroundColor: colors.white }}
                            round
                            placeholder="Buscar nombre de usuario"
                            onChangeText={this._onSearch}
                            containerStyle={[CSSList.noLines,{backgroundColor:colors.secondary}]}
                        />
                    </View>
                    <View style={[CSSView.noGrow, {marginRight:20}]}>
                        <Button 
                            noMargin
                            color={colors.primary}
                            icon="arrow-down"
                            onPress={onDismiss}
                        />
                    </View>
                </View>
                <View style={[CSSView.main, CSSView.padding]}>
                    <Text>Encuentra a un alumno con su nombre de usuario (exacto). De esta manera podrás evaluarlo aunque no pertenezca al mismo centro deportivo o aunque tú no lo hayas dado de alta.</Text>
                    {filtering && (
                    <View style={[CSSView.row, CSSView.separateTop]}>
                        <View style={CSSView.noGrow}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                        <View style={[CSSView.flex, CSSView.paddingView]}>
                            <Text>{!network ? 'Se requiere conexión a internet.' : 'Buscando...'}</Text></View>
                        </View>
                    )}
                    {items.length > 0 && (
                    <List containerStyle={[CSSList.noLines,CSSView.main]}>
                        <FlatList 
                            data={items}
                            renderItem={this._renderItem}
                            keyExtractor={this._keyExtractor}
                        />
                    </List>
                    )}
                    {(attemps && items.length <= 0) && (
                        <View style={CSSView.separate}>
                            <Text>No se encontró al alumno.</Text>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        );
    }
}
const FindUserModal = withNavigation(FindUserModalComponent);

class StorageModal extends Component {

    //INIT

    constructor(props){
        super(props);
        this.mounted = false;
        this.state = { items: { evaluaciones: [], alumnos: [] }, loading: false };
    }

    async componentDidMount() { 
        this.mounted = true;
        const items = await this.getStorage();
        this.setState({
            items
        });
    }

    componentWillUnmount() { this.mounted = false; }

    getStorage = async () => {
        let items = {
            evaluaciones: [],
            alumnos: []
        };
        try {
            const evaluaciones = await getStorage(storageKeys.evaluaciones);
            if (evaluaciones) {
                const obj = JSON.parse(evaluaciones);
                if (obj.length > 0) items.evaluaciones = obj;
            }
            const alumnos = await getStorage(storageKeys.alumnos_tmp);
            if (alumnos) {
                const obj = JSON.parse(alumnos);
                if (obj.length > 0) items.alumnos = obj;
            }
        } catch (error) {
        } finally {
            return items;
        }
    }

    //ACTIONS
    _removeEvaluacion = (i) => async () => {
        const { items: state } = this.state;
        const items = JSON.parse(JSON.stringify(state));
        items.evaluaciones.splice(i,1);
        this.setState({
            items
        }, async () => {
            await setStorage(storageKeys.evaluaciones, JSON.stringify(items.evaluaciones));
        });
    }

    _removeAlumno = (i) => async () => {
        const { items: state } = this.state;
        const items = JSON.parse(JSON.stringify(state));
        const alumno = items.alumnos[i];
        items.evaluaciones = items.evaluaciones.filter(x => x.ID !== alumno.ID);
        items.alumnos.splice(i,1);
        this.setState({
            items
        }, async () => {
            const { onRemoveAlumno } = this.props;
            onRemoveAlumno(alumno, async () => {
                await setStorage(storageKeys.alumnos_tmp, JSON.stringify(items.alumnos));
                await setStorage(storageKeys.evaluaciones, JSON.stringify(items.evaluaciones));
            });
        });
    }

    _uploadEvaluaciones = async () => {
        const { network, usuario, token, alumnos } = this.props;
        let state = JSON.parse(JSON.stringify(this.state.items));

        if(!usuario.activo){
            Alert.alert(null, errors.auth);
            return;
        }

        if (!network) {
            Alert.alert(null, ALERTS.response.text.network);
            return;
        }

        this.setState({
            loading: true
        }, async () => {            
            const copy = JSON.parse(JSON.stringify(state.evaluaciones));
            for(let i = 0; i < copy.length; i++) {
                const { ID, evaluacion: { fecha, evaluaciones }} = copy[i];
                const alumno = alumnos.find(x => x.ID === ID);

                if (!alumno) {
                    state.evaluaciones = state.evaluaciones.filter(x => !(x.ID === ID && x.evaluacion.fecha === fecha));
                    continue;
                }

                const date = moment(fecha);
                const nacimiento = moment(alumno.nacimiento || +new Date()).startOf('day')
                const edad = date.clone().startOf('day').diff(nacimiento, 'years');
                const data = {
                    source: parseInt(usuario.rol) === ROLES.entrenador ? 'pruebas' : 'mediciones',
                    evaluaciones,
                    alumno: ID,
                    evaluador: usuario.ID,
                    evaluadorNombre: `${usuario.nombres} ${usuario.apellidos}`,
                    centro: usuario.centro ? usuario.centro.ID : null,
                    fecha: date.clone().startOf('day').valueOf(),
                    edad
                }

                let response = await post(ROUTES.ALUMNO, { action:ACTIONS.insert+'evaluaciones', self:false, data }, token);

                if(response && !response.error) {
                    state.evaluaciones = state.evaluaciones.filter(x => !(x.ID === ID && x.evaluacion.fecha === fecha));
                }
            }

            await this.setState({
                loading: false,
                items: state
            }, async () => {
                if (state.evaluaciones.length > 0) {
                    Alert.alert(null, 'No se enviaron todas las evaluaciones');
                }
                await setStorage(storageKeys.evaluaciones, JSON.stringify(state.evaluaciones));
            });
        });
    }

    _uploadAlumnos = async () => {
        const { network, usuario, token, alumnos } = this.props;
        let state = JSON.parse(JSON.stringify(this.state.items));
        if(!usuario.activo){
            Alert.alert(null, errors.auth);
            return;
        }

        if (!network) {
            Alert.alert(null, ALERTS.response.text.network);
            return;
        }

        this.setState({
            loading: true
        }, async () => {
            const copy = JSON.parse(JSON.stringify(state.alumnos));
            for(let i = 0; i < copy.length; i++) {
                const { ID } = copy[i];
                const alumno = alumnos.find(x => x.ID === ID);

                if (!alumno) {
                    state.alumnos = state.alumnos.filter(x => x.ID !== ID);
                    continue;
                }

                let response = await post(ROUTES.ALUMNO, {action:ACTIONS.update, ID: usuario.ID, insert: false, usuario:alumno , contrasena: copy[i].contrasena, self:false}, token);
                
                if(response && !response.error) {
                    state.alumnos = state.alumnos.filter(x => x.ID !== ID);
                }
            }

            await this.setState({
                loading: false,
                items: state
            }, async () => {
                if (state.alumnos.length > 0) {
                    Alert.alert(null, 'No se enviaron todos los alumnos');
                }
                await setStorage(storageKeys.alumnos_tmp, JSON.stringify(state.alumnos));
            });
        });
    }

    //RENDER

    _keyExtractorEvaluacion = (x,i)=>{
        return `evaluacion-${x.ID}-${x.evaluacion.fecha}`;
    }

    _renderItemEvaluacion = ({ item, index }) => {
        const { alumnos, usuario } = this.props;
        const alumno = alumnos.find(x => x.ID === item.ID);
        let title = '[No se econtró el alumno]';
        if (alumno) title = `${alumno.nombres} ${alumno.apellidos}`;
        const fecha = moment(item.evaluacion.fecha);
        const icon = usuario.rol == ROLES.entrenador ? 'body' : 'nutrition';
        return (
            <SwipeOut 
                right={[{
                    backgroundColor:colors.danger,
                    color:colors.white,
                    text:"Eliminar",
                    onPress:this._removeEvaluacion(index)
                }]} 
                autoClose 
                backgroundColor={colors.none}
            >
                <ListItem 
                    leftIcon={<View style={{paddingRight: 15}}><Icon name={icon} color={colors.secondary} /></View>}
                    hideChevron
                    title={title}
                    subtitle={`${fecha.format(`DD [de] [${monthNameWithIndex(fecha.month())}] [de] YYYY`)}`}
                />
            </SwipeOut>
        );
    }

    _keyExtractorAlumno = (x,i)=>{
        return `alumno-tmp-${x.ID}`;
    }

    _renderItemAlumno = ({ item, index }) => {
        return (
            <SwipeOut 
                right={[{
                    backgroundColor:colors.danger,
                    color:colors.white,
                    text:"Eliminar",
                    onPress:this._removeAlumno(index)
                }]} 
                autoClose 
                backgroundColor={colors.none}
            >
                <ListItem 
                    leftIcon={<View style={{paddingRight: 15}}><Icon name="person" color={colors.secondary} /></View>}
                    hideChevron
                    title={`${item.nombres} ${item.apellidos}`}
                    subtitle={`${item.usuario}`}
                />
            </SwipeOut>
        );
    }

    render(){
        let { onDismiss, network } = this.props;
        let { items, loading } = this.state;
        const source = items.alumnos.length > 0 ? 0 : 1;
        return(
            <SafeAreaView style={[CSSView.main,{backgroundColor:colors.secondary}]}>
                <View style={[CSSView.row, {justifyContent:"flex-start", backgroundColor:colors.secondary }]}>
                    <View style={[CSSView.flex, CSSView.paddingView, CSSView.paddingHeightSm]}>
                        <Text style={[CSSText.bold, CSSText.white]}>Lista de {source === 0 ? 'alumnos' : 'evaluaciones realizadas'} que aún no se envían a la nube.</Text>
                        {!network && <Text style={CSSText.white}>Se requiere conexión a internet.</Text>}
                    </View>
                    <View style={[CSSView.noGrow, {marginRight:20}]}>
                        <Button 
                            noMargin
                            color={colors.primary}
                            icon="arrow-down"
                            onPress={onDismiss}
                        />
                    </View>
                </View>

                {
                    source === 0 ? (
                        <View style={[CSSView.container, CSSView.padding]}>
                            <List containerStyle={[CSSList.noLines,CSSView.main, CSSList.noMargin]}>
                                <FlatList 
                                    data={items.alumnos}
                                    renderItem={this._renderItemAlumno}
                                    keyExtractor={this._keyExtractorAlumno}
                                />
                            </List>
                        </View>
                    ) : (
                        <View style={[CSSView.container, CSSView.padding]}>
                            {items.evaluaciones.length > 0 ? (
                            <List containerStyle={[CSSList.noLines,CSSView.main, CSSList.noMargin]}>
                                <FlatList 
                                    data={items.evaluaciones}
                                    renderItem={this._renderItemEvaluacion}
                                    keyExtractor={this._keyExtractorEvaluacion}
                                />
                            </List>
                            ) : (
                                <View style={CSSView.separate}>
                                    <Text>No hay evaluaciones pendientes por enviar.</Text>
                                </View>
                            )}
                        </View>
                    )
                }
                
                {source === 0 && <View style={CSSView.paddingHeightSm}><Button noMargin color={colors.white} onPress={this._uploadAlumnos}>Presiona aquí para subir todo</Button></View>}
                {source === 1 && <View style={CSSView.paddingHeightSm}><Button noMargin color={colors.white} onPress={this._uploadEvaluaciones}>Presiona aquí para subir todo</Button></View>}
                <Loader show={loading} transparent={false} opacity={0.3}/>
            </SafeAreaView>
        );
    }
}

class AlumnosComponent extends Component{

    constructor(props){
        super(props);
        this.rowWidth = Dimensions.get('screen').width - 22;
        this.footerHeight = Math.round(Dimensions.get('screen').height / 5) * 4;
        let {navigation} = props;
        let params = {
            onSearch:this._filter,
            custom:[
                {
                    icon: 'person',
                    onPress: this._toggleFindUserModal
                },
                {
                    icon:"add",
                    onPress: this._edit(null,null)
                }
            ]
        };
        navigation.setParams(params);
        this.navListener = navigation.addListener('didFocus', async () => {
            this._didFocus();
        });
        this.state = {
            mounted:false,
            filtering:true,
            search: '',
            alumnos: props.alumnos,
            cloudItems: [],
            findUserModal: false,
            storageModal: false,
            hasLocalStorage: false
        };
    }

    componentDidMount(){
        componentDidMountDelay(this,()=>{
            this._getStorage();
        });
    }

    componentWillUnmount () {
        this.navListener.remove();
    }

    //ACTIONS
    _void = () => null;

    _didFocus = async () => {
        try {
            const { cloudItems } = this.state;
            const { navigation, alumnos } = this.props;
            if (!alumnos || alumnos.length <= 0) return;
            let setParams = false;
            const evaluaciones = await getStorage(storageKeys.evaluaciones);
            const alumnos_tmp = await getStorage(storageKeys.alumnos_tmp);
            if (evaluaciones) {
                const obj = JSON.parse(evaluaciones);
                if (obj.length > 0) setParams = true;
            }
            if (alumnos_tmp) {
                const obj = JSON.parse(alumnos_tmp);
                if (obj.length > 0) setParams = true;
            }
            this.setState({
                hasLocalStorage: setParams,
                ...((cloudItems && cloudItems.length > 0) && { cloudItems: [] })
            }, () => {
                if (setParams) {
                    navigation.setParams({
                        onAlert: this._toggleStorageModal 
                    });
                } else {
                    navigation.setParams({
                        onAlert: null
                    });
                }
            });
        } catch (error) {
        }
    }

    _getStorage = ()=>{
        const { alumnos } = this.props;
        if(alumnos && alumnos.length > 0){
            this._filter("");
        }else{
            this._load();
        }
    }

    load = (resolve)=>{
        let { network, token, usuario } = this.props;
        Usuario.fetch(network, ROUTES.ALUMNO, ACTIONS.select, {
            tipo: USUARIOS.alumno,
            ID: usuario.ID,
            centro: usuario.centro ? usuario.centro.ID : '',
            source: parseInt(usuario.rol) === ROLES.entrenador ? 'pruebas' : 'mediciones'
        }, token, (response) => {
            let { error, data } = response;
            this.props.onLoadAlumnos(data,()=>{
                this._filter("");
                resolve();
                if(error){
                    Toast.show(error, { shadow: false });
                }
            });
        });
    }

    _refresh = (resolve)=>{
        const { hasLocalStorage } = this.state;
        if (hasLocalStorage) {
            Toast.show(ALERTS.storage.text.hasLocalStorage, { shadow: false, duration: 5000 });
            resolve();
            return;
        }
        this.load(resolve);
    }

    _load = ()=>{
        this.props.onLoading(true,(resolve)=>{
            this.load(resolve);
        });
    }

    _filter = (value)=>{
        let { alumnos } = this.props;
        let filter = alumnos.filter(i => {
            let { nombres, apellidos, usuario, telefono, email } = i;
            let itemData = `${rawStr(nombres)}${rawStr(apellidos)}${rawStr(usuario)}${rawStr(telefono)}${rawStr(email)}`;
            let search = rawStr(value);
            return itemData.indexOf(search) > -1;
        });
        this.setState({
            search: value,
            ...((this.state.cloudItems && this.state.cloudItems.length > 0) && { cloudItems: [] }),
            alumnos:filter,
            filtering:false
        });
    }

    _edit = (e, i) => () => {
        const { navigation } = this.props;
        navigation.navigate(routes.AlumnosRouter.child.Alumno.name, { item: e, index: i, onUpdate: this._filter, onItemSelected: this._navigate });
    }

    _navigate = (e, i) => async () => {
        const { navigation, onLoading } = this.props;
        const { findUserModal } = this.state;

        if (findUserModal) await this.setState({ findUserModal: false });
        onLoading(true, (resolve) => {
            navigation.navigate(routes.EvaluacionRouter.child.Evaluacion.name, { item: e.ID, index: i, title: `${e.nombres}`, resolve });
        });
    }

    _remove = (e) => () => {
        let { network } = this.props;
        const { hasLocalStorage } = this.state;
        const lock = hasLocalStorage && network;
        if (lock) {
            Toast.show(ALERTS.storage.text.hasLocalStorage, {shadow: false, duration: 5000});
            return;
        }
        Alert.alert(ALERTS.remove.title, ALERTS.remove.text.confirm, [
            { text: ALERTS.remove.text.cancel, onPress: void 0 },
            { text: ALERTS.remove.text.accept, onPress: () => {
                    let { usuario: { activo }, token, onLoading, onRemoveAlumno } = this.props;
                    if (!network) {
                        Toast.show(ALERTS.response.text.network,{shadow:false});
                        return;
                    }

                    if(!activo){
                        Alert.alert("", errors.auth);
                        return;
                    }

                    onLoading(true,(resolve)=>{
                        Usuario.fetch(network, ROUTES.ALUMNO, ACTIONS.delete, { ID: e.ID }, token, (response) => {
                            let {error} = response;
                            if(!error){
                                onRemoveAlumno(e, (state) => {
                                    this.setState({
                                        alumnos: [ ...state ]
                                    },resolve);
                                });
                            }else{
                                resolve();
                                Alert.alert(null,error);
                            }
                        });
                    });
                }
            }
        ]);
    }

    _removeTmp = (e, resolve) => {
        const { onRemoveAlumno } = this.props;
        onRemoveAlumno(e, (state) => {
            this.setState({
                alumnos: [ ...state ]
            }, resolve);
        });
    }

    _toggleFindUserModal = () => {
        this.setState(({ findUserModal }) => {
            return {
                findUserModal: !findUserModal,
            };
        });
    }

    _toggleStorageModal = () => {
        this.setState(({ storageModal }) => {
            return {
                storageModal: !storageModal,
            };
        }, () => {
            const { storageModal } = this.state;
            if (!storageModal) {
                this._didFocus();
            }
        });
    }

    _onForeignFound = (data) => {
        const { onUpdateAlumno } = this.props;
        onUpdateAlumno(data, () => this._filter(''));
    }

    _onCloudFound = (item, index) => () => {
        const { onUpdateAlumno } = this.props;
        onUpdateAlumno(item, () => {
            const { search } = this.state;
            this._filter(search);
            this._navigate(item, index)();
        });
    }

    _cloudSearch = () => {
        const { onLoading, network, token, usuario } = this.props;

        if (!network) {
            Alert.alert(null, ALERTS.response.text.network);
            return;
        }

        onLoading(true, (resolve) => {
            const { search } = this.state;
            Usuario.fetch(network, ROUTES.ALUMNO, ACTIONS.select, {
                tipo: USUARIOS.alumno,
                source: parseInt(usuario.rol) === ROLES.entrenador ? 'pruebas' : 'mediciones',
                centro: usuario.centro ? usuario.centro.ID : '',
                search
            }, token, (response) => {
                resolve();
                let { error, data } = response;
                if (error || !data || data.length <= 0) {
                    Toast.show(ALERTS.response.text.noData, { shadow: false });
                } else {
                    this.setState({
                        cloudItems: data
                    });
                }
            });
        });
    }

    _clearCloudSearch = () => {
        this.setState({
            cloudItems: []
        });
    }

    //RENDER
    _renderCloudItem = ({ item, index })=>(
        <ListItem 
            title={`${item.nombres} ${item.apellidos}`}
            titleContainerStyle={CSSList.fullWidth}
            subtitle={`Usuario: ${item.usuario}`} 
            rightTitle={(item.activo?` `:`Inactivo`)}
            rightTitleStyle={CSSText.danger}
            onPress={this._onCloudFound(item, index)}
        />
    );

    _renderRow = ({ item, index }) => {
        let { usuario } = this.props;

        let right = [
                {
                    backgroundColor:colors.danger,
                    color:colors.white,
                    text:"Eliminar",
                    onPress:this._remove(item)
                },
                {
                    backgroundColor:colors.success,
                    color:colors.white,
                    text:"Editar",
                    onPress:this._edit(item, index)
                }
            ];
        return (
            <SwipeOut 
                right={right} 
                autoClose 
                backgroundColor={colors.none}
                disabled={!usuario.activo}
            >
                <ListItem 
                    title={`${item.nombres} ${item.apellidos}`}
                    titleContainerStyle={CSSList.fullWidth}
                    subtitle={
                        <View style={{...CSSList.fullWidth, paddingLeft:11,paddingRight:11}}>
                            <Text style={[CSSText.fontSm,CSSText.placeholder]}>
                                {moment().diff(moment(item.nacimiento), 'year')} años
                            </Text>
                            <Text style={[CSSText.fontSm,CSSText.placeholder]}>
                                {`${item.usuario}`}
                            </Text>
                            <Text style={[CSSText.fontSm,CSSText.placeholder]}>
                                {
                                    (!!item.evaluacion && item.evaluacion.evaluaciones.length > 0) ? `Últ. Evaluación ${moment(item.evaluacion.fecha).format('DD/MM/YYYY')}` : `Sin evaluaciones`
                                }
                            </Text>
                        </View>
                    } 
                    rightTitle={(item.activo?` `:`Inactivo`)}
                    rightTitleStyle={CSSText.danger}
                    hideChevron={!item.activo}
                    {...(item.activo && { onPress: this._navigate(item, index) })}
                />
            </SwipeOut>
        );
    }

    _keyExtractor = (x,i)=>{
        return `item-alumno-${x.ID}`;
    }

    render(){
        const { alumnos, filtering, findUserModal, storageModal, search, cloudItems } = this.state;
        const { network, token, usuario } = this.props;
        return(
            <View style={CSSView.main}>
                <RefreshView onRefresh={this._refresh}>
                    <View style={[CSSView.container]}>
                        {
                            (alumnos.length <= 0 && !filtering) && (
                                <Text style={CSSText.center}>No hay alumnos en la lista.</Text>
                            )
                        }
                        <List containerStyle={CSSView.flex}>
                            <FlatList
                                data={alumnos}
                                renderItem={this._renderRow}
                                keyExtractor={this._keyExtractor}
                                ListFooterComponent={(!!rawStr(search) && !filtering) ? (
                                    <TouchableOpacity style={[CSSForms.button, CSSView.separateTop]} onPress={this._cloudSearch}>
                                        <Text style={[CSSText.center, CSSText.dark]}>¿No se encuentra el alumno que buscas?</Text>
                                        <Text style={[CSSText.center, CSSText.dark, CSSText.bold]}>Buscar en la nube</Text>
                                    </TouchableOpacity>
                                ) : null}
                            />
                        </List>
                    </View>
                </RefreshView>
                <Modal animationType="slide" visible={findUserModal} onRequestClose={this._void}>
                    <FindUserModal
                        onItemSelected={this._navigate}
                        onDismiss={this._toggleFindUserModal}
                        onUpdate={this._onForeignFound}
                        network={network}
                        token={token}
                        usuario={usuario}
                    />
                </Modal>
                <Modal animationType="slide" visible={storageModal} onRequestClose={this._void}>
                    <StorageModal
                        onDismiss={this._toggleStorageModal}
                        onRemoveAlumno={this._removeTmp}
                        network={network}
                        token={token}
                        usuario={usuario}
                        alumnos={alumnos}
                    />
                </Modal>
                <AnimatedFooter background={colors.clear} height={this.footerHeight} collapse={!cloudItems || cloudItems.length <= 0}>
                <FlatList
                            data={cloudItems}
                            renderItem={this._renderCloudItem}
                            keyExtractor={this._keyExtractor}
                            ListFooterComponent={(
                                <TouchableOpacity style={[CSSForms.button, CSSView.separateTop]} onPress={this._clearCloudSearch}>
                                    <Text style={[CSSText.center, CSSText.dark]}>¿No se encuentra el alumno que buscas? Intenta con nombres y apellidos, ID de usuario, correo ó teléfono</Text>
                                    <Text style={[CSSText.center, CSSText.dark, CSSText.bold]}>Cerrar esta lista</Text>
                                </TouchableOpacity>
                            )}
                        />
                </AnimatedFooter>
            </View>
        );
    }
}
AlumnosComponent.navigationOptions = setHeaderComponent({
    title:routes.AlumnosRouter.child.Alumnos.title
});

export const Alumnos = connect(mapStateToProps,mapDispatchToProps)(AlumnosComponent);
