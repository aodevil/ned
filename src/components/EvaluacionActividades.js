//LIB
import React, { Component } from 'react';
import moment from 'moment';
//ELEMENTS
import { View, FlatList, Dimensions, Text } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import { SegmentedButtons } from '../user-controls/SegmentedButtons';
import Popover, { Rect } from 'react-native-popover-view';
//STYLES
import { CSSView } from '../styles/view';
import { CSSList } from '../styles/list';
import { CSSText } from '../styles/text';
//MODEL
import routes from '../providers/routes';
import { ACTIVIDADES } from '../services/constants';
import { Usuario } from '../model/Usuario';
import { ActividadHorario } from '../model/Actividad';

const buttons = [
    ACTIVIDADES.actividades.name, ACTIVIDADES.eventos.name
];

export class ActividadesAlumno extends Component{
    constructor(props) {
        super(props);
        const { alumno } = props;
        this.state = {
            listSource: 0,
            popover: false,
            alumno
        }
        let width = Dimensions.get('window').width;
        this.popoverWidth = Math.floor(width / 2);
        this.popoverRect = new Rect(width, 80, -30, 0);
    }

    componentDidMount() {
        const { navigation } = this.props;
        navigation.setParams({
            onSave: null,
            custom: [
                {
                    icon: 'add',
                    onPress: this._togglePopover
                }
            ]
        });
    }

    //ACTIONS
    
    _togglePopover = () => {
        this.setState(({ popover }) => {
            return {
                popover: !popover,
            };
        });
    }

    _add = (type) => () => {
        this.setState({
            popover: false,
        }, () => {
            const { listSource, alumno } = this.state;
            const { navigation: { navigate } } = this.props;
            const prefix = routes.EvaluadoresRouter.prefix;
            const path = `${prefix}${routes.ActividadesRouter.child.ListaActividades.name}`;
            const source = (listSource === ACTIVIDADES.actividades.type ? ACTIVIDADES.actividades.name : ACTIVIDADES.eventos.name);
            navigate(path, {
                type,
                prefix,
                source,
                alumno: alumno.ID,
                title: ACTIVIDADES.tipos[type],
                onUpdate: this._onItemUpdated
            });
        });
    }

    _details = (item) => () => {
        const { navigation: { navigate } } = this.props;
        const { listSource, alumno } = this.state;
        const source = buttons[listSource];
        const prefix = routes.EvaluadoresRouter.prefix;
        navigate(`${prefix}${routes.ActividadesRouter.child.DetallesActividad.name}`, { 
            alumno: alumno.ID, 
            prefix, 
            item, 
            type: item.tipo, 
            source, 
            title: item.nombre,
            onUpdate: this._onItemUpdated
        });
    }

    _updateListSource = (listSource)=>{
        this.setState({ listSource });
    }

    _onItemUpdated = (alumno) => {
        const { onUpdate } = this.props;
        this.setState({
            alumno: new Usuario(alumno)
        }, () => onUpdate(alumno));
    }

    //RENDER

    _renderRow = ({ item, index }) => {
        const { listSource } = this.state;
        const source = buttons[listSource];
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

    render(){
        const { listSource, popover, alumno } = this.state;
        const source = buttons[listSource].toLocaleLowerCase();
        const data = alumno[source];
        return(
            <>
                <View style={[CSSView.main, CSSView.padding]}>
                    <SegmentedButtons index={listSource} buttons={buttons} onChange={this._updateListSource}/>
                    <List containerStyle={[CSSView.flex, CSSList.noMargin, CSSList.noLines]}>
                        <FlatList
                            data={data}
                            renderItem={this._renderRow}
                            keyExtractor={this._keyExtractor}
                            ListEmptyComponent={(
                                <View style={CSSView.padding}>
                                    <Text style={CSSText.center}>No hay {source} para mostrar.</Text>
                                </View>
                            )}
                        />
                    </List>
                </View>
                <Popover
                    isVisible={popover}
                    fromRect={this.popoverRect}
                    placement="bottom"
                    onRequestClose={this._togglePopover}
                >
                    <List containerStyle={[CSSList.noLines, {width: this.popoverWidth}]}>
                        <ListItem title="Alto rendimiento" onPress={this._add(ACTIVIDADES.AR)} />
                        <ListItem title="Nutrición" onPress={this._add(ACTIVIDADES.NUT)} />
                        <ListItem title="Actividad física" onPress={this._add(ACTIVIDADES.AF)} />
                    </List>
                </Popover>
            </>
        );
    }
}