//LIB
import React, {Component} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
//ELEMENTS
import {View, SectionList, Text, Dimensions, Alert } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { ItemLeftText } from '../user-controls/ItemLeftText';
import { ListGroupHeader } from '../user-controls/ListGroupHeader';
import { RefreshView } from '../user-controls/RefreshView';
import Popover, { Rect } from 'react-native-popover-view';
//STYLES
import { CSSView } from '../styles/view';
import { CSSText } from '../styles/text';
import { CSSList } from '../styles/list';
//MODEL
import routes from '../providers/routes';
import { ACTIVIDADES, USUARIOS } from '../services/constants';
import { Actividad } from '../model/Actividad';
import { Evento } from '../model/Evento';
import { stringToDate } from '../services/functions';
import { Usuario } from '../model/Usuario';

const buttons = [
    ACTIVIDADES.actividades.name,ACTIVIDADES.eventos.name
];

class ActividadesCentroComponent extends Component{

    //INIT

    constructor(props){
        super(props);
        const { navigation } = props;
        this.ID = navigation.getParam("id");
        this.isAdmin = Usuario.isAdmin(props, [USUARIOS.coordinador]);

        if (this.isAdmin) {
            navigation.setParams({
                custom: [
                    {
                        icon: 'add',
                        onPress: this._togglePopover
                    }
                ]
            });
        }

        let {actividades, eventos} = this._setItems(props);
        this.state = {
            listSource:0,
            actividades,
            eventos,
            popOver: false
        };
    }

    _setItems = (props)=>{
        let actividades = Actividad.getItemsWithCenter(this.ID,props.actividades);
        let eventos = Evento.getItemsWithCenter(this.ID,props.eventos);
        return {
            actividades,
            eventos
        };
    }

    //ACTIONS
    _load = (resolve) => {
        let { network, token, onLoadActividades, onLoadEventos } = this.props;
        const { listSource } = this.state;

        if (listSource === ACTIVIDADES.actividades.type) {
            Actividad.fetch(network, token, null, (response)=>{
                let {error,data} = response;
                onLoadActividades(data,()=>{
                    if(error){
                        Alert.alert(null,error);
                    } else {
                        this._onItemUpdated();
                    }
                    resolve();
                });
            });
        } else {
            Evento.fetch(network, token, null, (response)=>{
                let {error,data} = response;
                onLoadEventos(data,()=>{
                    if(error){
                        Alert.alert(null,error);
                    } else {
                        this._onItemUpdated();
                    }
                    resolve();
                });
            });
        }
    }


    _onItemUpdated = () => {
        let {actividades, eventos} = this._setItems(this.props);
        this.setState({
            actividades,
            eventos,
        });
    }

    _togglePopover = () => {
        this.setState(({ popOver }) => {
            return {
                popOver: !popOver,
            };
        });
    }

    _navigate = (e,i)=>{
        if(!e || !e.ID)return;
        this.props.navigation.navigate(`${routes.CentrosRouter.prefix}${routes.ActividadesRouter.child.DetallesActividad.name}`,{
            title:e.nombre,
            item:e,
            type:e.tipo,
            source:buttons[this.state.listSource],
            onUpdate: this._onItemUpdated
        });
    }

    _add = (type) => () => {
        this.setState({
            popOver: false,
        }, () => {
            const { ID } = this;
            const { listSource } = this.state;
            const { navigation: { navigate } } = this.props;

            const path = (listSource === ACTIVIDADES.actividades.type ? `${routes.CentrosRouter.prefix}${routes.ActividadesRouter.child.EditarActividad.name}` : `${routes.CentrosRouter.prefix}${routes.ActividadesRouter.child.EditarEvento.name}`);
            const source = (listSource === ACTIVIDADES.actividades.type ? ACTIVIDADES.actividades.name : ACTIVIDADES.eventos.name);
            navigate(path, {
                type,
                source,
                centro: ID,
                onUpdate: this._onItemUpdated
            });
        });
    }

    _updateListSource = (listSource) => {
        this.setState({listSource},() => {
            if(listSource === 1){
                this.setState({
                    eventos:Evento.getItemsWithCenter(this.ID,this.props.eventos)
                });
            }
        });
    }

    _eventMonthChanged = (y,m) => {
        this.setState({
            eventos:Evento.getItemsWithCenter(this.ID,this.props.eventos, new Date(y,m))
        });
    }

    _eventYearChanged = (y,m) => {
        this.setState({
            eventos:Evento.getItemsWithCenter(this.ID,this.props.eventos, new Date(y,m))
        });
    }

    //VIEW

    _renderRow = ({ item,index }) => {
        if(this.state.listSource === ACTIVIDADES.actividades.type){
            return <ListItem title={item.nombre} onPress={this._navigate.bind(this,item,index)}/>;
        }else{
            let fecha = stringToDate(item.fecha);
            return (
                <ListItem 
                    title={item.nombre} subtitle={item.nombreDisciplina || null}
                    avatar={
                        <ItemLeftText title={fecha.getDate()} subtitle="Día"/>
                    }
                    onPress={this._navigate.bind(this,item,index)}
                />
            );
        }
    }

    _renderHeader = ({section: {title}}) => (<ListGroupHeader title={title}/>);

    _keyExtractor = (x,i)=>{
        return `item-${buttons[this.state.listSource]}-${i}`;
    }
    
    render(){
        let {listSource, actividades, eventos, popOver} = this.state;
        let items = listSource === 0 ? actividades : eventos;
        let width = Dimensions.get('window').width;
        let popOverWidth = Math.floor(width / 2);
        return(
            <RefreshView onRefresh={this._load}>
                <View style={[CSSView.container]}>
                    <Popover
                        isVisible={popOver}
                        fromRect={new Rect(width, 80, -30, 0)}
                        placement="bottom"
                        onRequestClose={this._togglePopover}
                    >
                        <List containerStyle={[CSSList.noLines, {width: popOverWidth}]}>
                            <ListItem title="Alto rendimiento" onPress={this._add(ACTIVIDADES.AR)} />
                            <ListItem title="Nutrición" onPress={this._add(ACTIVIDADES.NUT)} />
                            <ListItem title="Actividad física" onPress={this._add(ACTIVIDADES.AF)} />
                        </List>
                    </Popover>
                    {/* <SegmentedButtons index={listSource} buttons={buttons} onChange={this._updateListSource}/> */}
                    {/* {listSource === 1 && (
                        <YearAndMonthPicker
                            onMonthChange={this._eventMonthChanged}
                            onYearChange={this._eventYearChanged}
                        />
                    )} */}
                    {(items && items.length > 0)?(
                        <List containerStyle={CSSView.main}>
                            <SectionList
                                sections={items}
                                renderItem={this._renderRow}
                                renderSectionHeader={this._renderHeader}
                                keyExtractor={this._keyExtractor}
                            />
                        </List>
                    ):(
                        <Text style={[CSSView.separate,CSSText.center]}>No hay {buttons[listSource].toLowerCase()} para mostrar.</Text>
                    )}
                </View>
            </RefreshView>
        );
    }
}
ActividadesCentroComponent.navigationOptions = setHeaderComponent({
    secondary:true,
    root:false
});

export const ActividadesCentro = connect(mapStateToProps,mapDispatchToProps)(ActividadesCentroComponent);
