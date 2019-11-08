//LIB
import React, {Component} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import moment from 'moment';
//ELEMENTS
import { View,Text, FlatList, SectionList } from 'react-native';
import { RefreshView } from '../user-controls/RefreshView';
import { List, ListItem } from 'react-native-elements';
import { Loader} from '../user-controls/Loader';
import { ListGroupHeader } from '../user-controls/ListGroupHeader';
import { ItemLeftText } from '../user-controls/ItemLeftText';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { YearAndMonthPicker } from '../user-controls/YearAndMonthPicker';
import Toast from 'react-native-root-toast';
//STYLES
import { CSSView } from '../styles/view';
import { CSSText } from '../styles/text';
import { CSSList } from '../styles/list';
//MODEL
import routes from '../providers/routes';
import { componentDidMountDelay, replaceDiacritics, stringToDate } from '../services/functions';
import { ACTIVIDADES, USUARIOS, SEXO } from '../services/constants';
import {Actividad} from "../model/Actividad";
import {Evento} from "../model/Evento";
import { Usuario } from '../model/Usuario';

class ListaActividadesComponent extends Component{

    //INIT

    constructor(props){
        super(props);
        const { navigation } = props;
        this.type = navigation.getParam("type");
        this.source = navigation.getParam("source");
        this.prefix = navigation.getParam("prefix") || '';
        this._onItemUpdate = navigation.getParam("onUpdate") || null;
        this.alumno = navigation.getParam('alumno') || null;
        this.items = [];
        let date = new Date();
        this.state = {
            search: props.navigation.getParam("search") || "",
            mounted: false,
            items: [],
            init: true,
            date: {
                y: date.getFullYear(),
                m: date.getMonth()
            },
        }
        
        let params = {
            onSearch: this._search
        };

        if (!this.prefix && (Usuario.isAdmin(props, [USUARIOS.coordinador]) || (this.source === ACTIVIDADES.eventos.name && Usuario.isAdmin(props)))) {
            params.custom = [
                {
                    icon: 'add',
                    onPress: this._add
                }
            ];
        }

        navigation.setParams(params);
    }

    componentDidMount(){
        componentDidMountDelay(this,()=>{
            this._getStorage();
        });
    }

    _getStorage = ()=>{
        const { actividades, eventos } = this.props;
        const items = (this.source === ACTIVIDADES.actividades.name) ? actividades : eventos;
        if (items && items.length > 0) {
            this._onItemUpdated(true);
        }else{
            this._load();
        }
    }

    load = (resolve)=>{
        let { network, token, onLoadActividades, onLoadEventos } = this.props;
        if (this.source === ACTIVIDADES.actividades.name) {
            Actividad.fetch(network, token, null, (response)=>{
                let {error,data} = response;
                onLoadActividades(data,()=>{
                    if(error){
                        Toast.show(error, { shadow: false });
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
                        Toast.show(error, { shadow: false });
                    } else {
                        this._onItemUpdated(true);
                    }
                    resolve();
                });
            });
        }
    }

    //RENDER

    _load = () => {
        const { onLoading } = this.props;
        onLoading(true, (resolve) => {
            this.load(resolve);
        });
    }

    _refresh = (resolve) => {
        this.setState({
            init: true
        }, () => this.load(() => {
            this.setState({
                init: false
            });
            resolve();
        }));
    }

    _onItemUpdated = () => {
        const { actividades, eventos } = this.props;
        const { search, date: d } = this.state;
        let date = { ...d };
        const items = this.source === ACTIVIDADES.actividades.name ? actividades.map(x=> new Actividad(x)) : eventos.map(x=> new Evento(x));
        this.items =  items.filter(x => x.tipo === this.type);
        const list = (this.type === ACTIVIDADES.AR) ? ((this.source === ACTIVIDADES.actividades.name) ? [...Actividad.getGroupsByName(this.items)] : [...Evento.getGroupsByName(this.items)]) : [...this.items];
        if (this.source === ACTIVIDADES.eventos.name && this.items.length > 0) {
            const start = moment(this.items[0].fecha);
            date = {
                y: start.year(),
                m: start.month()
            }
        }

        this.setState({
            items: list,
            date,
        }, () => {
            if(this.source === ACTIVIDADES.eventos.name || search)
                this._search(search);
        });
    }

    _add = () => {
        const { type, source } = this;
        const { navigation: { navigate } } = this.props;
        const path = source === ACTIVIDADES.actividades.name ? routes.ActividadesRouter.child.EditarActividad.name : routes.ActividadesRouter.child.EditarEvento.name;
        navigate(path, {
            type,
            source,
            onUpdate: this._onItemUpdated
        });
    }

    _renderRow = ({ item, index, section }) => {
        if (this.source === ACTIVIDADES.actividades.name) {
            if (this.type === ACTIVIDADES.AR) {
                const title = item.lugar ? item.lugar.split('-')[0] : item.nombre;
                return (
                    <ListItem title={title} onPress={this._details.bind(this,item)} />
                );
            }
            return (
                <ListItem title={item.nombre} subtitle={item.lugar} onPress={this._details.bind(this,item)} />
            );
        } else {
            let fecha = stringToDate(item.fecha);
            return (
                <ListItem 
                    title={item.nombre} subtitle={item.lugarNombre || item.lugar}
                    avatar={
                        <ItemLeftText title={fecha.getDate()} subtitle="Día"/>
                    }
                    onPress={this._details.bind(this,item)}
                />
            );
        }
    }

    _renderHeader = ({section: {title}}) => (
        <ListGroupHeader title={title}/>
    );

    //ACTIONS
    sortEvents = (a, b) => moment(a.fecha).hour(a.hora.h).minute(a.hora.m).isBefore(moment(b.fecha).hour(b.hora.h).minute(b.hora.m)) ? -1 : 1;

    _search = (value)=>{
        this.setState({
            search:value
        },()=>{
            const { date: { y, m } } = this.state;
            let items = this.items.filter(i => {
                let {nombre,lugar, nombreDisciplina} = i;
                let itemData = `${replaceDiacritics(lugar)} ${replaceDiacritics(nombre)} ${replaceDiacritics(nombreDisciplina)}`;
                let search = replaceDiacritics(value);
                if(this.source === ACTIVIDADES.actividades.name)
                    return itemData.indexOf(search) > -1;
                else{
                    let fecha = stringToDate(i.fecha);
                    let date = new Date();
                    if(!y)y = date.getFullYear();
                    if(m === undefined || m === null)m = date.getMonth();
                    return itemData.indexOf(search) > -1 && (fecha.getMonth() === m && fecha.getFullYear() === y);
                }
            });   
    
            if(this.type === ACTIVIDADES.AR){
                items = ((this.source === ACTIVIDADES.actividades.name)?[...Actividad.getGroupsByName(items)]:[...Evento.getGroupsByName(items.sort(this.sortEvents))]);
            } else if (this.source === ACTIVIDADES.eventos.name) {
                items.sort(this.sortEvents);
            }
    
            this.setState({ items, init: false });
        });
    }

    _keyExtractor = (x,i)=>{
        return `item-${x.ID}`;
    }

    _onEventDateChange = (y,m)=>{
        this.setState({
            date: {
                y,
                m
            }
        }, () => {
            const { search } = this.state;
            this._search(search);
        });
    }

    _details = (item)=>{
        if(!item || !item.ID)return;
        this.props.navigation.navigate(this.prefix+routes.ActividadesRouter.child.DetallesActividad.name, {
            title:item.nombre,
            item,
            type:this.type,
            source:this.source,
            onUpdate: this._onItemUpdate || this._onItemUpdated,
            prefix: this.prefix,
            alumno: this.alumno
        });
    }

    render(){
        let { mounted, items, date, init } = this.state;
        return(
            <>
            <RefreshView onRefresh={this._refresh}>
                <View style={CSSView.container}>
                    {(mounted && this.source === ACTIVIDADES.eventos.name && !init) && (
                        <YearAndMonthPicker
                            onMonthChange={this._onEventDateChange}
                            onYearChange={this._onEventDateChange}
                            initialYear={date.y}
                            initialMonth={date.m}
                        />
                    )}
                    {mounted && (items.length > 0?(
                        <List containerStyle={[CSSList.noLines,CSSView.flex, this.source === ACTIVIDADES.actividades.name && CSSList.noMargin]}>
                            {
                                (this.type === ACTIVIDADES.AR)?(
                                    <SectionList
                                        sections={items}
                                        renderItem={this._renderRow}
                                        renderSectionHeader={this._renderHeader}
                                        keyExtractor={this._keyExtractor}
                                    />
                                ):(
                                    <FlatList 
                                        data={items}
                                        renderItem={this._renderRow}
                                        keyExtractor={this._keyExtractor}
                                    />
                                )
                            } 
                        </List>
                    ):(
                        <Text style={[CSSText.center,{paddingTop:20}]}>No hay {this.source.toLowerCase()} para mostrar.</Text>
                    ))}
                
                </View>
            </RefreshView>
            <Loader show={!mounted}/>
            </>
        );
    }
}
ListaActividadesComponent.defaultProps = {
    actividades:[],
    eventos:[]
}
ListaActividadesComponent.navigationOptions = setHeaderComponent({
    secondary:true,
    root:false
});

export const ListaActividades = connect(mapStateToProps,mapDispatchToProps)(ListaActividadesComponent);

