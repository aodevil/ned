//LIB
import React, {Component, PureComponent} from 'react';
import moment from 'moment';
//ELEMENTS
import { View, FlatList, Dimensions, Keyboard, StyleSheet, TouchableWithoutFeedback, TouchableOpacity, Text } from 'react-native';
import { List } from 'react-native-elements';
import { TextInput } from '../user-controls/TextInput';
import { Icon } from '../user-controls/IconComponent';
import { AnimatedFooter } from '../user-controls/AnimatedFooter';
import Toast from 'react-native-root-toast';
//STYLES
import colors from '../styles/colors.json';
import { CSSView } from '../styles/view';
import { CSSList } from '../styles/list';
import { CSSForms } from '../styles/forms';
import { CSSText } from '../styles/text';
//MODEL
import errors from '../services/errors';
import { rawStr } from '../services/functions';
import { Recomendacion } from '../model/Recomendacion';
import { ROLES, ALERTS, ACTIONS, USUARIOS } from '../services/constants';
import { RefreshView } from '../user-controls/RefreshView';

const styles = StyleSheet.create({
    textarea: {
        height:'auto',
        width: 'auto',
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        bottom: 20
    },
    submit: {
        alignSelf: 'flex-end',
        marginRight: 20,
        marginBottom: 20
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: 10,
        paddingBottom: 10
    },
    listItemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1
    },
    listItemTitle: {
        paddingRight: 15,
    },
    listItemBadge: {
        backgroundColor:colors.clear,
        borderRadius: 25,
        width:  25,
        height: 25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 15
    },
    redBadge: {
        backgroundColor: colors.danger,
    },
    refreshButton: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: colors.light
    },
    indicator: {
        width: 25,
        height: 25
    }
});

class TextArea extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            text: ''
        };
    }

    _setState = (prop) => (value) => {
        this.setState({
            text: value,
        });
    }

    _send = () => {
        const { text } = this.state;
        const { onSubmit, network } = this.props;
        if(!rawStr(text)) return;
        if (!network) {
            Toast.show(ALERTS.response.text.network, { shadow: false });
            return;
        }
        this.setState({
            text: ''
        }, () => {
            onSubmit(text);
        });
    }

    render () {
        const { text } = this.state;
        return (
            <>
                <View style={[CSSView.flex, CSSView.relative]}>
                    <TextInput multiline styles={[CSSForms.text, styles.textarea]} returnKeyType="default" noMargin value={text} onChangeText={this._setState('text')} placeholder="Escribe una recomendación para el alumno." />
                </View>
                <TouchableOpacity style={[CSSForms.circleButton, styles.submit]} onPress={this._send}>
                    <Icon name="send" color={colors.white} size={20}/>
                </TouchableOpacity>
            </>
        );
    }
}

class ListItem extends PureComponent {
    state = {
        collapse: true,
    };

    _toggle = () => {
        this.setState(({ collapse }) => { 
            return {
                collapse: !collapse 
            };
        }, () => {
            const { collapse } = this.state;
            if (!collapse) {
                const { onToggle, index } = this.props;
                onToggle(index);
            }
        });
    }

    _remove = () => {
        const { item, onRemove } = this.props;
        onRemove(item.ID);
    }

    render () {
        const { collapse } = this.state;
        const { item, owner, type } = this.props;
        const { texto, fecha, rol } = item;
        const today = moment();
        const time = moment(fecha);
        const raw = !!texto ? texto.replace(/\r/gi, ' ').replace(/\n/gi, ' ') : '';
        let dateStr = '';
        const isEvaluator = type != USUARIOS.alumno;
        if (today.clone().startOf('day').isSame(time.clone().startOf('day'))) dateStr = time.format('h:mm a')
        else dateStr = time.format('DD/MM/YYYY');
        return (
            <View style={[CSSView.flex, CSSList.itemBorder]}>
                <View style={styles.listItem}>
                    <TouchableOpacity style={styles.listItemRow} onPress={this._toggle}>
                        <View style={[CSSView.flex, styles.listItemTitle]}>
                            <Text numberOfLines={collapse ? 1 : null}>{collapse ? raw : texto}</Text>
                            {!isEvaluator && (
                                <View style={!collapse && CSSView.separateTop}>
                                    <Text style={CSSText.placeholder}>
                                        { (rol == ROLES.entrenador ? 'Actividad física' : 'Nutrición') }
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.listItemTitle}>
                            <Text>{dateStr}</Text>
                        </View>
                        <View style={[CSSForms.circleButton, owner ? CSSForms.primaryButton : CSSForms.secondaryButton, styles.indicator]}>
                            <Icon name={(rol == ROLES.entrenador ? 'body' : 'nutrition')} color={colors.white} size={20} />
                        </View>
                    </TouchableOpacity>
                    {(!collapse && owner) && (
                        <TouchableOpacity onPress={this._remove} style={[styles.listItemBadge, styles.redBadge]}>
                            <Text style={[CSSText.white, CSSText.smaller]}>
                                <Icon name="trash" color={colors.white} size={13}/>
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }
}

export class Recomendaciones extends Component{
    constructor(props) {
        super(props);
        const { recomendaciones } = props;
        let height = Dimensions.get('window').height;
        this.modalHeight = Math.floor(height / 5) * 2;
        this.state = {
            modal: false,
            recomendaciones: JSON.parse(JSON.stringify(recomendaciones))
        };
    }

    componentDidMount() {
        const { navigation, usuario } = this.props;
        navigation.setParams({
            onSave: null,
            custom: usuario.tipo == USUARIOS.alumno ? null : [
                {
                    icon: 'add',
                    onPress: this._toggleMessageModal
                }
            ]
        });
        this.getStorage();
    }

    getStorage = () => {
        const { recomendaciones } = this.state;
        const { fetchOnLoad } = this.props;
        if (fetchOnLoad && (!recomendaciones || recomendaciones.length <= 0)) {
            this._load(false)();
        }
    }

    load = (resolve, toast = true)=>{
        let { network, token, alumno, onFetch, onUpdate } = this.props;
        Recomendacion.fetch(network, token, {
            alumno: alumno.ID
        }, (response) => {
            let { error, data } = response;
            if (error) {
                if (toast) Toast.show(error, { shadow: false });
                onFetch(false);
                resolve();
                return;
            }
            this.setState({
                recomendaciones: data
            }, () => {
                const { recomendaciones } = this.state;
                onUpdate(recomendaciones);
                resolve();
            });
        });
    }

    //ACTIONS
    
    _load = (toast) => () => {
        this.props.onLoading(true,(resolve)=>{
            this.load(resolve, toast);
        });
    }

    _refresh = (resolve) => {
       this.load(resolve);
    }
    
    _scrollToItemAtIndex = (index) => {
        if (this.list) {
            this.list.scrollToIndex({animated: true, index, viewOffset: 20 });
        }
    }

    _toggleMessageModal = () => {
        const { network } = this.props;
        this.setState(({ modal }) => {
            if (!network) Toast.show(ALERTS.response.text.network, { show: false });
            return {
                modal: network ? !modal : false,
            };
        }, Keyboard.dismiss);
    }

    _addRecommendation = (texto) => {
        const { onUpdate, usuario, network, token, onLoading, alumno } = this.props;
        const { recomendaciones } = this.state;
        const item = new Recomendacion({
            envia: usuario.ID,
            nombres: usuario.nombres,
            rol: usuario.rol,
            texto
        });

        onLoading (true, (resolve) => {
            Recomendacion.fetch(network, token, {
                item, alumno: alumno.ID
            }, (response) => {
                if(response.error || !response.data) {
                    Toast.show(response.error || errors.connection, { shadow: false });
                    this.setState({
                        modal: false
                    }, resolve);
                    Keyboard.dismiss();
                    return;
                }
                item.ID = response.data;
                this.setState({
                    modal: false,
                    recomendaciones: [
                        item, ...recomendaciones]
                }, () => {
                    Keyboard.dismiss();
                    const { recomendaciones } = this.state;
                    onUpdate(recomendaciones);
                    resolve();
                });
            }, ACTIONS.insert);
        });
    }

    _removeRecommendation = (ID) => {
        const { onUpdate, network, onLoading, token } = this.props;
        if (!network) {
            Toast.show(ALERTS.response.text.network, { shadow: false });
            return;
        }

        onLoading (true, (resolve) => {
            Recomendacion.fetch(network, token, {
                ID
            }, (response) => {
                if(response.error || !response.data) {
                    Toast.show(response.error || errors.connection, { shadow: false });
                    resolve();
                    return;
                }
                const { recomendaciones } = this.state;
                this.setState({
                    recomendaciones: recomendaciones.filter(x => x.ID !== ID)
                }, () => {
                    const { recomendaciones } = this.state;
                    onUpdate(recomendaciones);
                    resolve();
                });     
            }, ACTIONS.delete);
        });
    }

    //RENDER
    _refList = (x) => {
        this.list = x;
    }

    _renderRow = ({ item, index }) => {
        const { usuario } = this.props;
       return (
        <ListItem
            item={item}
            index={index}
            type={usuario.tipo}
            owner={item.envia === usuario.ID}
            onToggle={this._scrollToItemAtIndex}
            onRemove={this._removeRecommendation}
        />
       );
    }

    _keyExtractor = (x,i)=>{
        return `recomendacion-item-${x.ID}`;
    }

    render(){
        const { modal, recomendaciones } = this.state;
        const { network, loading, usuario } = this.props;
        return(
            <>
                <RefreshView safeAreaView={false} onRefresh={this._refresh} contentContainerStyle={CSSView.flex}>
                    <View style={[CSSView.main, CSSView.padding]}>
                        {recomendaciones.length > 0 ? (
                            <List containerStyle={[CSSList.noLines, CSSView.flex, CSSList.noMargin]}>
                                <FlatList
                                    ref={this._refList}
                                    data={recomendaciones}
                                    renderItem={this._renderRow}
                                    keyExtractor={this._keyExtractor}
                                />
                            </List>
                        ) : (
                            <View>
                                {
                                    !network ? (
                                        <>
                                            <Text style={[CSSText.center, CSSText.bold]}>No hay conexión para poder descargar la lista de recomendaciones</Text>
                                            <TouchableOpacity style={styles.refreshButton} onPress={this._load(true)}>
                                                <View style={[CSSView.row, CSSView.center]}>
                                                    <Icon name="refresh" size={15} />
                                                    <Text style={CSSView.paddingSm}>Volver a intentar</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        loading ? (
                                            <>
                                                <Text style={[CSSText.center, CSSText.bold]}>Cargando ...</Text>
                                            </>
                                        ) :
                                        (
                                            <>
                                                <Text style={[CSSText.center, CSSText.bold]}>Aún no hay recomendaciones</Text>
                                                {usuario.tipo != USUARIOS.alumno && (
                                                    <TouchableOpacity style={styles.refreshButton} onPress={this._toggleMessageModal}>
                                                        <View style={[CSSView.row, CSSView.center]}>
                                                            <Icon name="add" size={15} />
                                                            <Text style={CSSView.paddingSm}>Escribir recomendación</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                )}
                                            </>
                                        )
                                    )
                                }
                            </View>
                        )}

                        {modal && (
                            <View style={CSSView.absolute}>
                                <TouchableWithoutFeedback onPress={this._toggleMessageModal}><View style={CSSView.flex} /></TouchableWithoutFeedback>
                            </View>
                        )}
                    </View>
                </RefreshView>
                <AnimatedFooter height={this.modalHeight} collapse={!modal}>
                    <TextArea
                        network={network}
                        onSubmit={this._addRecommendation}
                    />
                </AnimatedFooter>
            </>
        );
    }
}