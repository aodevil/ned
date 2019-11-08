//LIB
import React, {Component, Fragment, useState } from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import validator from 'validator';
//ELEMENTS
import {ScrollView, View, Text, FlatList, StyleSheet, SafeAreaView, Alert, Modal, TouchableOpacity, Platform, KeyboardAvoidingView} from 'react-native';
import { List, ListItem } from 'react-native-elements';
import { ListGroupHeader } from '../user-controls/ListGroupHeader';
import { Loader} from '../user-controls/Loader';
import { Link } from '../user-controls/Link';
import { Button } from '../user-controls/Button';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import Toast from 'react-native-root-toast';
import { MapComponent } from '../user-controls/Map';
import { Icon } from '../user-controls/IconComponent';
import Card from '../user-controls/Card';
import { TextInput } from '../user-controls/TextInput';
//STYLES
import { CSSView } from '../styles/view';
import { CSSList } from '../styles/list';
import { CSSForms } from '../styles/forms';
import { CSSText } from '../styles/text';
import colors from '../styles/colors.json';
import sizes from '../styles/sizes.json';
//MODEL
import errors from '../services/errors';
import routes from '../providers/routes';
import { componentDidMountDelay, shortDateString, stringToDate } from '../services/functions';
import { ACTIVIDADES, ALERTS, ACTIONS, USUARIOS, ROLES } from '../services/constants';
import { ActividadHorario, Actividad } from "../model/Actividad";
import { Evento } from "../model/Evento";
import { Usuario } from '../model/Usuario';
import { ROUTES, post } from '../services/post';
import { Recomendacion } from '../model/Recomendacion';
import { RefreshView } from '../user-controls/RefreshView';

const styles = StyleSheet.create({
    innerItem:{
        borderBottomColor:colors.light,
        borderBottomWidth:1,
        paddingTop:8, 
        paddingBottom:8
    },
    innerSeparate:{
        paddingTop:7,
        paddingBottom:15
    },
    rightTitle: {
        fontSize: sizes.font.md,
        color: colors.dark
    },
    textarea: {
        minHeight: 60,
        maxHeight: 'auto'
    },
    indicator: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 25,
        height: 25
    }
});

const _keyExtractor = (x, i) => {
    return `item-${x.ID}`;
}

const _renderDetails = ({ item: x, index: i }) => {
    if (!x.concepto) return null;
    return (
        <ListItem 
            title={<Text style={[CSSView.paddingViewSm, CSSText.fontMd, CSSText.dark]}>{x.concepto}</Text>}  
            rightTitle={x.valor ? `$${x.valor}` : ' '}
            rightTitleStyle={styles.rightTitle} 
            hideChevron 
        />
    );
}

const Horario = ({ item, index, buttons }) => {
    const sexo = item.sexo === 0 ? 'Varonil' : item.sexo === 1 ? 'Femenil' : 'Mixta';
    return (
        <View style={CSSView.separate}>
            <ListGroupHeader title={`${ActividadHorario.daysToString(item.dias)}`} buttons={buttons} />
            <ListGroupHeader secondary title={`Horario ${ActividadHorario.hoursFromToString(item.de_hora, item.hasta_hora)}`} toUpperCase={false} />
            <List containerStyle={[CSSList.noLines, CSSList.noMargin]}>
                <ListItem hideChevron title="Rama" rightTitle={sexo} rightTitleStyle={styles.rightTitle}/>
                {item.edad_min > 0 && <ListItem hideChevron title="Edad mínima" rightTitle={`${item.edad_min} años`} rightTitleStyle={styles.rightTitle}/>}
                {item.edad_max > 0 && <ListItem hideChevron title="Edad máxima" rightTitle={`${item.edad_max} años`} rightTitleStyle={styles.rightTitle}/>}
            </List>
            {(item.costos && item.costos.length > 0) && (
                <Fragment>
                    <ListGroupHeader secondary title="Precios" toUpperCase={false} />
                    <List containerStyle={[CSSList.noLines, CSSList.noMargin]}>
                        <FlatList data={item.costos}
                            keyExtractor={_keyExtractor}
                            renderItem={_renderDetails}
                        />
                    </List>
                </Fragment>
            )}
            {(item.requisitos && item.requisitos.length > 0) && (
                <Fragment>
                    <ListGroupHeader secondary title="Otros requisitos" toUpperCase={false} />
                    <List containerStyle={[CSSList.noLines, CSSList.noMargin]}>
                        <FlatList data={item.requisitos}
                            keyExtractor={_keyExtractor}
                            renderItem={_renderDetails}
                        />
                    </List>
                </Fragment>
            )}
        </View>
    );
}

const RecomendacionComponent = ({ item: x, index: i, isLast, type, onAdd, onRemove, onSave, sender }) => {
    const [titulo, _titulo] = useState(x.titulo);
    const [texto, _texto] = useState(x.texto);
    const [focusedInput, _focusedInput] = useState(-1);
    const tituloChanges = !(titulo === x.titulo);
    const textoChanges = !(texto === x.texto);
    const disabled = !tituloChanges && !textoChanges;
    const owner = x.envia === sender;
    const readOnly = type == USUARIOS.alumno;
    const icon = x.rol === ROLES.entrenador ? 'body' : 'nutrition';
    const footer = x.rol === ROLES.entrenador ? 'Actividad física' : 'Nutrición';
    return (
        <>
            <Card>
                <>
                    <View style={[CSSForms.circleButton, owner ? CSSForms.primaryButton : CSSForms.secondaryButton, styles.indicator]}>
                        <Icon name={icon} color={colors.white} size={20} />
                    </View>
                    {readOnly ? (
                        <View style={CSSView.separateSm}>
                            <Text style={[CSSText.bold, CSSText.fontMd, CSSText.dark]} >{titulo}</Text>
                        </View>
                    ): (
                        <TextInput noMargin placeholder="Título" value={titulo} onChangeText={_titulo} pos={0} focusState={focusedInput} onFocusNext={_focusedInput}/>
                    )}
                    {readOnly ? (
                        <Text style={[CSSText.fontMd, CSSText.dark]} >{texto}</Text>
                    ): (
                        <TextInput multiline styles={[CSSForms.textArea, styles.textarea]} returnKeyType="default" noMargin placeholder="Escribe una recomendación pública para esta actividad." value={texto} onChangeText={_texto} pos={1} focusState={focusedInput} onFocusNext={_focusedInput} scrollEnabled={false}/>
                    )}
                    {(owner && !readOnly) ? (
                        <View style={CSSView.row}>
                            <TouchableOpacity style={CSSForms.button} onPress={onRemove(i, x.ID)}>
                                <Text style={CSSText.danger}>Borrar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={CSSForms.button} disabled={disabled} onPress={onSave({...x, texto, titulo}, i)}>
                                <Text style={disabled ? CSSText.light : CSSText.secondary}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={CSSView.paddingSm}>
                            <Text style={[CSSText.center, CSSText.light]}>
                                {readOnly ? footer : 'Enviado por otro evaluador'}
                            </Text>
                        </View>
                    )}
                </>
            </Card>
            {(isLast && !readOnly) && (
                <View style={[CSSView.center, CSSView.padding]}>
                    <TouchableOpacity style={[CSSView.center, CSSForms.circleButton]} onPress={onAdd}>
                        <Icon name="add" size={25} color={colors.white} />
                    </TouchableOpacity>
                </View>
            )}
        </>
    )
}

const Recomendaciones = ({ data, onAdd, onRemove, onUpdate, sender, type, onRefresh }) => {
    let list = null;
    const _list = (x) =>  { list = x; }

    const _add = () => {
        const ref = list;
        onAdd((index) => {
            if (ref) ref.scrollToEnd({ animated: true });
        });
    }

    const _update = (x, i) => () => {
        onUpdate(x, i);
    }

    const renderItem = (x, i) => {
        return (
            <RecomendacionComponent
                key={`recommendation-${x.fecha}`}
                item={x}
                index={i}
                isLast={i >= data.length - 1}
                onAdd={_add}
                onRemove={onRemove}
                onSave={_update}
                sender={sender}
                type={type}
            />
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={CSSView.main} enabled>
        <RefreshView onRefresh={onRefresh} scrollRef={_list}>
            {(data && data.length) ? (
                <View style={CSSView.container}>
                    {data.map(renderItem)}
                </View>
            ) : (
                <View style={CSSView.container}>
                    <>
                        <Text style={[CSSText.center, CSSText.bold]}>Aún no hay recomendaciones</Text>
                        {type == USUARIOS.evaluador && (
                            <TouchableOpacity style={styles.refreshButton} onPress={_add}>
                                <View style={[CSSView.row, CSSView.center]}>
                                    <Icon name="add" size={15} />
                                    <Text style={CSSView.paddingSm}>Agregar recomendación pública</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </>
                </View>
            )}
        </RefreshView>
        </KeyboardAvoidingView>
    );
}

class DetallesActividadComponent extends Component{

    //INIT

    constructor(props){
        super(props);
        this.init(props);
    }

    init(props){
        const { navigation, alumnos, usuario } = props;
        this.type = navigation.getParam("type");
        this.source = navigation.getParam("source");
        this.prefix = navigation.getParam("prefix") || (usuario.tipo == USUARIOS.alumno ? routes.prefix.Alumno : '');

        const alumnoID = navigation.getParam('alumno') || null;
        if (!!alumnoID) {
            if (typeof alumnoID === 'string') {
                this.alumno = alumnos.find(x => x.ID === alumnoID);
            } else if (typeof alumnoID === 'object') {
                this.alumno = alumnoID;
            }
        }
        this._onItemUpdate = (usuario.tipo == USUARIOS.alumno) ? this.onItemUpdate : navigation.getParam("onUpdate");
        const item = navigation.getParam("item");
        
        if(!this.prefix && (Usuario.isAdmin(props, [USUARIOS.coordinador]) || (this.source === ACTIVIDADES.eventos.name && Usuario.isAdmin(props)))) {
            navigation.setParams({
                onEdit:this._edit,
                custom: [
                    {
                        icon: 'trash',
                        onPress: this._delete
                    }
                ]
            });
        }

        if(Usuario.isAdmin(props, [USUARIOS.evaluador, USUARIOS.alumno]) && this.source === ACTIVIDADES.actividades.name)  {
            navigation.setParams({
                custom: [
                    {
                        icon: 'clipboard',
                        onPress: this._toggleRecommendationsModal
                    }
                ]
            });
        }

        this.state = {
            modal:false,
            recommendationsModal: false,
            horario:null,
            mounted:false,
            item,
            centro: null,
            recomendaciones: [ ],
            loading: false
        };
    }

    componentDidMount(){
        componentDidMountDelay(this,()=>{
            const { navigation, centros } = this.props;
            const { item } = this.state;
            if(!item) navigation.goBack();
            else if (navigation.state.routeName.indexOf(routes.CentrosRouter.prefix) < 0) {
                const centro = centros.find(x => x.ID === item.centro);
                if (centro) {
                    this.setState({
                        centro,
                    });
                }
            }
            this._loadRecomendaciones();
        });
    }

    loadRecomendaciones = (background, resolve) => {
        const { item } = this.state;
        const { network, usuario, token } = this.props;
        Actividad.fetch(network, token, { envia: usuario.ID, ID: item.ID }, (response) => {
            if (response.error) {
                if (!background) {
                    Alert.alert(null, response.error);
                }
                resolve();
                return;
            }
            this.setState({
                recomendaciones: [ ...response.data ]
            }, resolve);
        }, ROUTES.ACTIVIDADES, ACTIONS.select+'recomendaciones');
    }

    _loadRecomendaciones = (background = true) => {
        const { item } = this.state;
        if (!item.ID) return;
        const { network, onLoading } = this.props;
        if (!network) {
            if (!background) {
                Toast.show(ALERTS.response.text.network, { shadow:false });
            }
            return;
        }
        
        onLoading(true, (resolve) => {
            this.loadRecomendaciones(background, resolve);
        });
    }

    _refreshRecomendaciones = (resolve) => {
        const { item } = this.state;
        const { network } = this.props;
        if (!item.ID) {
            resolve();
            return;
        }
        if (!network) {
            Alert.alert(null, ALERTS.response.text.network);
            resolve();
            return;
        }
        this.loadRecomendaciones(false, resolve);
    }

    onItemUpdate = (alumno) => {
        const { onLogin, usuario } = this.props;
        const u = new Usuario(usuario);
        u.actividades = alumno.actividades || [];
        u.eventos = alumno.eventos || [];
        onLogin(u);
    }

    //RENDER

    _mapActividadHorarios = (x, i) => {
        let buttons = null;
        if (!!this.prefix && this.prefix !== routes.prefix.Alumno && this.alumno) {
            const { item } = this.state;
            let icon = 'add-circle';
            const prop = this.source.toLowerCase();
            if (this.alumno[prop].indexOf(`${item.ID} ${x.ID}`) >= 0) icon = 'remove-circle';
           buttons = [
                {
                    icon,
                    onPress: this._put(x.ID)
                }
            ];
        }
        return (
            <Horario
                key={`${x.concepto}-${i}`}
                item={x}
                index={i}
                buttons={buttons}
            />
        );
    }

    _mapEnlaces = (x,i)=>{
        return <View key={`enlaces-evento-${i}`} style={{borderBottomColor:colors.light, borderBottomWidth:1}}><Link title={x.titulo} url={x.url}/></View>
    }

    //ACTIONS

    _put = (horario) => () => {
        const { item } = this.state;
        const { onUpdateAlumno, network, token, onLoading, usuario: { activo } } = this.props;
        
        if (!network) {
            Toast.show(ALERTS.response.text.network, { shadow:false });
            return;
        }

        if(!activo){
            Alert.alert("", errors.auth);
            return;
        }

        const alumno = new Usuario(this.alumno);
        let action = ACTIONS.insert;
        const ID = horario ? `${item.ID} ${horario}` : item.ID;
        const prop = this.source.toLowerCase();
        if (alumno[prop].indexOf(ID) < 0) {
            // insert
            alumno[prop].push(ID);
        } else {
            // delete
            alumno[prop] = alumno[prop].filter(x => x !== ID);
            action = ACTIONS.delete;
        }
        onLoading(true, (resolve) => {
            Usuario.fetch(network, ROUTES.ALUMNO, `${ACTIONS.update}actividades`, { item: alumno }, token, (response) => {
                if (response.error) {
                    Toast.show(response.error, { shadow: false });
                    resolve();
                } else {
                    onUpdateAlumno(alumno, () => {
                        this.alumno = new Usuario(alumno);
                        Toast.show(ALERTS.subscribe.text[action], { shadow: false });
                        if (this._onItemUpdate) this._onItemUpdate(alumno);
                        resolve();
                    });
                }
            });
        });
    }

    _onItemUpdated = (item) => {
        const { nombre } = this.state;
        this.setState({
            item
        }, () => {
            if (item.nombre !== nombre) {
                const { navigation } = this.props;
                navigation.setParams({
                    title: item.nombre,
                });
            }
            if (this._onItemUpdate) this._onItemUpdate();
        });
    }

    _edit = () => {
        const { type, source } = this;
        const { navigation: { navigate, state }, usuario: { activo } } = this.props;
        const { item } = this.state;

        if(!activo){
            Alert.alert("", errors.auth);
            return;
        }

        const sourcePath = source === ACTIVIDADES.actividades.name ? routes.ActividadesRouter.child.EditarActividad.name : routes.ActividadesRouter.child.EditarEvento.name;

        const path = state.routeName.indexOf(routes.CentrosRouter.prefix) >= 0 ? `${routes.CentrosRouter.prefix}${sourcePath}` : sourcePath;
        navigate(path, {
            type,
            source,
            onUpdate: this._onItemUpdated,
            item: JSON.parse(JSON.stringify(item)),
        });
    }

    _delete = () => {
        const { navigation, onRemoveActividad, onRemoveEvento } = this.props;
        Alert.alert(ALERTS.remove.title, ALERTS.remove.text.confirm, [
            { text: ALERTS.remove.text.cancel, onPress: void 0 },
            { text: ALERTS.remove.text.accept, onPress: () => {
                let { network, token, onLoading, usuario: { activo } } = this.props;
                if (!network) {
                    Toast.show(ALERTS.response.text.network,{shadow:false});
                    return;
                }

                if(!activo){
                    Alert.alert("", errors.auth);
                    return;
                }

                const { item } = this.state;
                onLoading(true, async (resolve) => {

                    const processDidEnd = () => {
                        Toast.show(ALERTS.response.text.done);
                        if (this._onItemUpdate) this._onItemUpdate();
                        resolve();
                        navigation.goBack();
                    }

                    let response = await post(ROUTES[this.source.toUpperCase()], { action:ACTIONS.delete, ID: item.ID } , token);

                    if (response) {
                        let { error, data } = response;
                        if (!error && data) {
                            if (this.source === ACTIVIDADES.actividades.name) {
                                onRemoveActividad(item, () => {
                                    processDidEnd();
                                });
                            } else {
                                onRemoveEvento(item, () => {
                                    processDidEnd();
                                });
                            }
                        } else{
                            resolve();
                            Alert.alert(null,error || ALERTS.response.text.noChanges);
                        }
                    } else
                        resolve();
                });
            }}
        ]);
    }

    _navigateToMap = () => {
        const { navigation: { navigate } } = this.props;
        const { item } = this.state;
        navigate({
            routeName: routes.CentrosRouter.child.Centros.name, 
            key: routes.ActividadesRouter.prefix,    
            params: {
                centro: item.centro
            }
        });
    }

    _toggleMapModal = () => {
        this.setState(({ modal }) => {
            return {
                modal: !modal,
            };
        });
    }

    _toggleRecommendationsModal = () => {
        this.setState(({ recommendationsModal }) => {
            return {
                recommendationsModal: !recommendationsModal,
            };
        });
    }

    _void = () => null;
    
    _addRecomendacion = (callback) => {
        const { usuario } = this.props;
        const item = new Recomendacion({
            ID: -1,
            envia: usuario.ID,
            nombres: usuario.nombres,
            rol: usuario.rol,
            tipo: Recomendacion.LEVEL.grupo
        });
        const { recomendaciones } = this.state;
        this.setState({
            recomendaciones: [ ...recomendaciones, item ]
        }, () => {
            setTimeout(() => {
                try {
                    callback(recomendaciones.length);
                } catch (error) {}
            }, 350);
        });
    }

    _updateRecomendacion = (x, i) => {
        const { onLoading, network, token } = this.props;
        const { recomendaciones: state, item: { ID } } = this.state;
        if (!network) {
            Toast.show(ALERTS.response.text.network, { shadow:false });
            return;
        }
        if (validator.isEmpty(x.texto) || validator.isEmpty(x.titulo)) return;
        
        const recomendaciones = JSON.parse(JSON.stringify(state));
        onLoading(true, (resolve) => {
            Actividad.fetch(network, token, { item: { ...x, recibe: ID } }, (response) => {
                if (response.error) {
                    Toast.show(response.error, { shadow: false });
                    resolve();
                } else {
                    const itemID = x.ID >= 0 ? x.ID : response.data;
                    recomendaciones[i] = new Recomendacion({ ...x, ID: itemID });
                    this.setState({ recomendaciones }, resolve);
                }
            }, ROUTES.ACTIVIDADES, ACTIONS.insert+'recomendaciones' );
        });
    }

    _removeRecomendacion = (i, ID) => () => {
        const { onLoading, network, token } = this.props;
        if (!network) {
            Alert.alert(null, ALERTS.response.text.network);
            return;
        }

        onLoading(true, (resolve) => {
            Actividad.fetch(network, token, { ID }, (response) => {
                if (response.error) {
                    Alert.alert(null, response.error);
                    resolve();
                    return;
                }
                const { recomendaciones: state } = this.state;
                const recomendaciones = JSON.parse(JSON.stringify(state)); 
                recomendaciones.splice(i, 1);
                
                this.setState({
                    recomendaciones
                }, resolve);
            }, ROUTES.ACTIVIDADES, ACTIONS.delete + 'recomendaciones');
        });
    }

    render(){
        const { usuario } = this.props;
        let { mounted, item, modal, centro, recommendationsModal, recomendaciones } = this.state;
        const secondary = !!item.nombreDisciplina;
        const locationButton = centro ? [
            {
                icon: 'pin',
                onPress: this._toggleMapModal
            }
        ] : null;
        let subscribeButton = null;
        if (this.source === ACTIVIDADES.eventos.name && (!!this.prefix && this.alumno)) {
            let icon = 'add-circle';
            if (this.alumno.eventos.indexOf(item.ID) >= 0) icon = 'remove-circle';
            subscribeButton = [
                {
                    icon,
                    onPress: this._put('')
                }
            ];  
        }
        return(
            <SafeAreaView style={CSSView.main}>
                <ScrollView>
                    {
                        mounted && (
                            (this.source === ACTIVIDADES.actividades.name)?(
                                <View style={CSSView.container}>
                                
                                    { (item.descripcion)?(
                                        <View style={CSSView.separate}>
                                            <Text style={[CSSText.fontMd, CSSText.dark]}>{item.descripcion}</Text>
                                        </View>
                                    ):null}

                                    <ListGroupHeader title="Lugar" buttons={locationButton}/>
                                    <View style={CSSView.separate}>
                                        <Text style={[CSSText.fontMd, CSSText.dark]}>{item.lugar}</Text>
                                    </View>

                                    {(item.horarios && item.horarios.length > 0) ? item.horarios.map(this._mapActividadHorarios) : null }
                                </View>
                            ):(
                                <View style={CSSView.container}>
                                
                                    { (item.nombreDisciplina)?(
                                        <View style={CSSView.separateSm}>
                                            <ListGroupHeader title={item.nombreDisciplina}/>
                                        </View>
                                    ):null}

                                    { (item.descripcion)?(
                                        <View style={CSSView.separate}>
                                            <Text style={[CSSText.fontMd, CSSText.dark]}>{item.descripcion}</Text>
                                        </View>
                                    ):null}

                                    <ListGroupHeader title="Lugar" toUpperCase={false} secondary={secondary}  buttons={locationButton}/>
                                    <View style={CSSView.separate}>
                                        <Text style={[CSSText.fontMd, CSSText.dark]}>{item.lugar}</Text>
                                    </View>

                                    <ListGroupHeader title="Fecha" toUpperCase={false} secondary={secondary} buttons={subscribeButton}/>
                                    <View style={CSSView.separate}>
                                        <Text>{shortDateString(stringToDate(item.fecha), true)} {Evento.hoursToString(item.hora, true)}</Text>
                                    </View>

                                    { (item.enlaces && item.enlaces.length > 0) && (
                                        <View>
                                            <ListGroupHeader title="Enlaces adicionales" toUpperCase={false} secondary={secondary}/>
                                            <View style={CSSView.separate}>
                                                {
                                                    item.enlaces.map(this._mapEnlaces)
                                                }
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )
                        )
                    }
                </ScrollView>
                
                {(locationButton && centro) && (
                    <Modal animationType="slide" visible={modal} onRequestClose={this._void}>
                        <SafeAreaView style={[CSSView.main,{backgroundColor:colors.secondary}]}>
                        <View style={[CSSView.row,{justifyContent:"flex-start",backgroundColor:colors.secondary}]}>
                            <View style={CSSView.flex}>
                                <Text style={{padding:15, color: colors.white }}>{item.lugar}</Text>
                            </View>
                            <View style={[CSSView.noGrow, {marginRight:20}]}>
                                <Button 
                                    iconOnly
                                    noMargin
                                    color={colors.primary}
                                    icon="arrow-down"
                                    onPress={this._toggleMapModal}
                                />
                            </View>
                        </View>
                            <MapComponent
                                centros={[centro]}
                                center={[centro.long, centro.lat]}
                            />
                        </SafeAreaView>
                    </Modal>
                )}

                <Modal animationType="slide" visible={recommendationsModal} onRequestClose={this._void}>
                    <SafeAreaView style={[CSSView.main,{backgroundColor:colors.secondary}]}>
                        <View style={[CSSView.row,{justifyContent:"flex-start",backgroundColor:colors.secondary}]}>
                            <View style={CSSView.flex}>
                                <Text style={[CSSText.white, CSSView.paddingSm, CSSView.paddingView, CSSText.bold, CSSText.fontMd]}>Recomendaciones generales</Text>
                            </View>
                            <View style={[CSSView.noGrow, {marginRight:20}]}>
                                <Button 
                                    iconOnly
                                    noMargin
                                    color={colors.primary}
                                    icon="arrow-down"
                                    onPress={this._toggleRecommendationsModal}
                                />
                            </View>
                        </View>
                        <Recomendaciones
                            type={usuario.tipo}
                            sender={usuario.ID}
                            data={recomendaciones}
                            onAdd={this._addRecomendacion}
                            onUpdate={this._updateRecomendacion}
                            onRemove={this._removeRecomendacion}
                            onRefresh={this._refreshRecomendaciones}
                        />
                    </SafeAreaView>
                </Modal>
                <Loader show={!mounted}/>
            </SafeAreaView>
        );
    }
}
DetallesActividadComponent.navigationOptions = setHeaderComponent({
    secondary:true,
    root:false
});

export const DetallesActividad = connect(mapStateToProps,mapDispatchToProps)(DetallesActividadComponent);