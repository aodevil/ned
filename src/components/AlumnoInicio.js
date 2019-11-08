//LIB
import React, {Component} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import moment from 'moment';
//ELEMENTS
import {View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { Icon } from '../user-controls/IconComponent';
import { List, ListItem } from 'react-native-elements';
import { RefreshView } from '../user-controls/RefreshView';
import { Label } from '../user-controls/Label';
import { SegmentedButtons } from '../user-controls/SegmentedButtons';
//STYLES
import { CSSView } from '../styles/view';
import { CSSText } from '../styles/text';
import { CSSList } from '../styles/list';
import colors from '../styles/colors';
//MODEL
import routes from '../providers/routes';
import { ActividadHorario } from '../model/Actividad';
import { SEXO, ACTIVIDADES, ACTIONS } from '../services/constants';
import { Usuario } from '../model/Usuario';
import { CSSForms } from '../styles/forms';
import { ROUTES } from '../services/post';

const styles = StyleSheet.create({
    label: {
        ...CSSText.center,
        ...CSSText.placeholder
    },
    title: {
        ...CSSText.title,
        color: colors.dark,
        ...CSSView.paddingHeightSm
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: colors.light,
        borderTopWidth: 1,
        borderTopColor: colors.light,
    },
    footerListButton: {
        ...CSSForms.borderButton,
        ...CSSView.round,
        borderColor: colors.placeholder,
        borderWidth: 1,
        padding: 5,
        width: 250,
        alignSelf: 'center',
        marginTop: 10
    }
});

class Actividades  extends Component {
    constructor(props) {
        super(props);
        this.segments = ['Mis actividades', 'Mis eventos'];
        this.state = {
            segment: 0,
            source: ACTIVIDADES.actividades.name
        }
    }

    //  ACTIONS

    _segment = (segment)=>{
        this.setState({ segment, source: segment === 0 ? ACTIVIDADES.actividades.name : ACTIVIDADES.eventos.name });
    }

    _details = (item) => () => {
        const { onSelect } = this.props;
        const { source } = this.state;
        onSelect(item, source);
    }

    _goToListaDeActividades = () => {
        const { goToListaDeActividades } = this.props;
        const { segment } = this.state;
        goToListaDeActividades(segment);
    }

    //  RENDER

    _renderRow = ({ item, index }) => {
        const { source } = this.state;
        const items = this.props[source.toLowerCase()];
        if (!items) return null;
        const actividad = source === ACTIVIDADES.actividades.name ? item.split(/\s/, 2) : null;
        const ID = actividad ? actividad[0] : item;
        const data = items.find(x => x.ID === ID);
        if (!data) return null;
        let datetime = ' '; 
        if (source === ACTIVIDADES.eventos.name) {
            datetime = moment(data.fecha).hour(data.hora.h).minute(data.hora.m).format('DD/MM/YYYY h:mm a');
        } else {
            const horario = data.horarios.find(x => x.ID === actividad[1]);
            if (!horario) return null;
            datetime = <View style={CSSView.paddingViewSm}><Text style={[CSSText.placeholder, CSSText.fontSm]}>{`${ActividadHorario.daysToString(horario.dias)}`}</Text><Text style={[CSSText.placeholder, CSSText.fontSm]}>{`${ActividadHorario.hoursToString(horario.de_hora)}`}</Text></View>;
        }
        return (
            <ListItem
                title={data.nombre}
                subtitle={datetime}
                subtitleStyle={[CSSText.placeholder, CSSText.fontSm, CSSText.normal]}
                onPress={this._details(data)}
            />
        );
    }

    _keyExtractor = (x,i)=>{
        return `evaluacion-actividad-${x}`;
    }

    render () {
        const { segment, source } = this.state;
        const { usuario } = this.props;
        const data = segment === 0 ? usuario.actividades : usuario.eventos;
        return (
            <View style={CSSView.main}>
                <SegmentedButtons
                    index={segment}
                    buttons={this.segments}
                    onChange={this._segment}
                />
                <List containerStyle={[CSSView.flex, CSSList.noMargin, CSSList.noLines]}>
                    <FlatList
                        data={data}
                        renderItem={this._renderRow}
                        keyExtractor={this._keyExtractor}
                        ListEmptyComponent={(
                            <View style={CSSView.padding}>
                                <Text style={CSSText.center}>No te has suscrito a {source.toLocaleLowerCase()}.</Text>
                            </View>
                        )}
                        ListFooterComponent={(
                            <TouchableOpacity style={styles.footerListButton} onPress={this._goToListaDeActividades}>
                                <Text style={[CSSText.center, CSSText.placeholder]}>Ver {source.toLocaleLowerCase()} disponibles</Text>
                            </TouchableOpacity>
                        )}
                    />
                </List>
            </View>
        );
    }
}

class AlumnoInicioComponent extends Component{

    load = (resolve) => {
        const { network, token, onLogin, usuario: state } = this.props;

        if (!network) return;

        try {
            Usuario.fetch(network, ROUTES.ALUMNO, ACTIONS.select + 'actividades', {
                item: state
            }, token, (response) => {
                let { error, data } = response;
                if (error) {
                    resolve();
                    return;
                }
                const usuario = new Usuario(state);
                usuario.actividades = data.actividades || [];
                usuario.eventos = data.eventos || [];
                onLogin(usuario, resolve);
            });   
        } catch (error) {
            resolve();
        }
    }

    _refresh = (resolve) => {
        this.load(resolve);
    }

    _onSelectEvent = (item, source) => {
        const { navigation: { navigate }, usuario } = this.props;
        const prefix = routes.InicioRouter.prefix;
        navigate(`${prefix}${routes.ActividadesRouter.child.DetallesActividad.name}`, { 
            alumno: source === ACTIVIDADES.eventos.name ? usuario : null,
            prefix, 
            item, 
            type: item.tipo, 
            source, 
            title: item.nombre
        });
    }

    _goToListaDeActividades = (source) => {
        const { navigation, usuario } = this.props;
        navigation.navigate(`${routes.ActividadesRouter.child.Actividades.name}`, {
            listSource: source,
            alumno: usuario
        });
    }

    _openSection = (section) => () => {
        const { navigation: { navigate } } = this.props;
        navigate(routes.InicioRouter.child[section].name, {
            
        });
    }

    //RENDER

    render(){
        const { usuario, actividades, eventos } = this.props;
        if (!usuario) return <></>
        const { sexo, nombres, apellidos } = usuario;
        const label = sexo == SEXO.M ? 'Bienvenido' : 'Bienvenida';
        return(
            <RefreshView onRefresh={this._refresh}>
                <View style={CSSView.container}>
                    <Label style={styles.label}>{label}</Label>
                    <Text style={styles.title}>{`${nombres} ${apellidos}`}</Text>
                    <View style={[CSSView.paddingHeightSm, CSSView.row, styles.separator]}>
                        <TouchableOpacity style={CSSView.center} onPress={this._openSection('AlumnoInicioHistorial')}>
                            <Icon name="stats" color={colors.primary} size={35} />
                            <Label>Mi progreso</Label>
                        </TouchableOpacity>
                        <TouchableOpacity style={CSSView.center} onPress={this._openSection('AlumnoInicioRecomendaciones')}>
                            <Icon name="clipboard" color={colors.primary} size={35} />
                            <Label>Recomendaciones</Label>
                        </TouchableOpacity>
                        <TouchableOpacity style={CSSView.center} onPress={this._openSection('AlumnoInicioCalificaciones')}>
                            <Icon name="star" color={colors.primary} size={35} />
                            <Label>Califica</Label>
                        </TouchableOpacity>
                    </View>
                    <View style={CSSView.paddingHeightSm}>
                        <Actividades
                            usuario={usuario}
                            actividades={actividades}
                            eventos={eventos}
                            goToListaDeActividades={this._goToListaDeActividades}
                            onSelect={this._onSelectEvent}
                        />
                    </View>
                </View>
            </RefreshView>
        );
    }
}
AlumnoInicioComponent.navigationOptions = setHeaderComponent({
    title: routes.InicioRouter.child.AlumnoInicio.title
});

export const AlumnoInicio = connect(mapStateToProps,mapDispatchToProps)(AlumnoInicioComponent);
