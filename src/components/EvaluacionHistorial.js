//LIB
import React, {Component, PureComponent} from 'react';
import moment from 'moment';
//ELEMENTS
import { View, Alert, FlatList, StyleSheet, Dimensions, TouchableOpacity, Text, ScrollView, Modal, Platform } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import SwipeOut from "react-native-swipeout";
import { Icon } from '../user-controls/IconComponent';
import { Select } from '../user-controls/Select';
import { Label } from '../user-controls/Label';
import { ChartKit } from '../user-controls/ChartKit';
import { RefreshView } from '../user-controls/RefreshView';
import { SegmentedButtons } from '../user-controls/SegmentedButtons';
import { CheckButtonGroup } from '../user-controls/CheckButtonGroup';
//STYLES
import colors from '../styles/colors.json';
import { CSSView } from '../styles/view';
import { CSSList } from '../styles/list';
import { CSSForms } from '../styles/forms';
import { CSSText } from '../styles/text';
//MODEL
import errors from '../services/errors';
import routes from '../providers/routes';
import { EVALUACIONES, ACTIONS, ALERTS, ROLES, USUARIOS, MESES_ABBR } from '../services/constants';
import { Usuario } from '../model/Usuario';
import { ROUTES } from '../services/post';
import Toast from 'react-native-root-toast';
import { monthNameWithIndex } from '../services/functions';
import { getStorage, storageKeys } from '../services/storage';

const styles = StyleSheet.create({
    filterButton: {
        alignSelf: 'center',
        marginTop: 20,
        width: '60%'
    },
    refreshButton: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: colors.light
    },
    chartContainer: {
        width: Dimensions.get('window').width - 40
    }
});

class Lista extends PureComponent {
    constructor(props) {
        super(props);
        const { defaultSegment } = props;
        this.state = {
            listSource: defaultSegment
        };
    }

    //  ACTIONS
    _remove = (item) => () => {
        const { onLoading, network, token, onRemove } = this.props;
        if (!network) {
            Toast.show(errors.network, { shadow: false });
            return;
        }
        onLoading(true, (resolve) => {
            const { listSource } = this.state;
            const source = listSource === 0 ? 'pruebas' : 'mediciones';
            Usuario.fetch(network, ROUTES.ALUMNO, ACTIONS.delete + 'evaluaciones', {
                ID: item.ID,
                source
            }, token, (response) => {
                let { error } = response;
                if (error) {
                    Alert.alert(null,error);
                    resolve();
                    return;
                }
                onRemove(item, source, resolve);
            });
        });
    }

    _updateListSource = (listSource)=>{
        this.setState({ listSource });
    }

    //  RENDER

    _renderItem = ({ item }) => {
        const { usuario, onSelect } = this.props;
        const { listSource } = this.state;
        const fecha = moment(item.fecha ? parseInt(item.fecha) : +new Date());
        const title = fecha.format(`DD [de] [${monthNameWithIndex(fecha.month())}] [de] YYYY`);
        const owner = usuario.ID === item.evaluador;
        const subtitle = !owner ? 'Realizada por otro evaluador' : ' ';
        const swipeItemOptions = [{
            backgroundColor:colors.danger,
            color:colors.white,
            text:"Eliminar",
            onPress: this._remove(item)
        }];
        return (
            <SwipeOut 
                right={swipeItemOptions} 
                autoClose 
                backgroundColor={colors.none}
                disabled={!owner}
            >
                {
                    owner || usuario.tipo === USUARIOS.alumno ? (
                        <ListItem
                            title={title}
                            onPress={onSelect(item, title, listSource)}
                        />
                    ) : (
                        <ListItem
                            title={title}
                            subtitle={subtitle}
                            subtitleStyle={CSSText.normal}
                            onPress={onSelect(item, title, listSource)}
                        />
                    )
                }
            </SwipeOut>
        );
    }

    _keyExtractor = (item) => {
        return `evaluacion-item-${item.fecha}`;
    }

    _onClose = () => {
        const { onClose } = this.props;
        const { listSource } = this.state;
        onClose(listSource);
    }

    render () {
        const { onRefresh, data } = this.props;
        const { listSource } = this.state;
        const evaluaciones = data[ listSource === 0 ? 'pruebas' : 'mediciones' ];
        return (
            <RefreshView onRefresh={onRefresh}>
                <View style={[CSSView.row, CSSList.itemBorder, CSSView.paddingSm, CSSView.paddingView]}>
                    <Text style={CSSText.bold}>Historial de evaluaciones</Text>
                    <View style={[CSSView.flex, CSSView.alignEnd]}>
                        <TouchableOpacity style={[CSSForms.circleButton]} onPress={this._onClose}>
                            <Icon name="arrow-down" color={colors.white} size={20}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={CSSView.padding}>
                    <SegmentedButtons index={listSource} buttons={EVALUACIONES} onChange={this._updateListSource}/>
                </View>
                {evaluaciones.length > 0 ? (
                    <List containerStyle={[CSSList.noMargin, CSSList.noLines, CSSView.flex]}>
                        <FlatList
                            data={evaluaciones}
                            renderItem={this._renderItem}
                            keyExtractor={this._keyExtractor}
                        />
                    </List>
                ) : (
                    <Text style={CSSText.center}>Aún no hay evaluaciones.</Text>
                )}
            </RefreshView>
        );
    }
}

export class Historial extends Component{
    constructor(props) {
        super(props);
        this.date = moment();
        this.year = this.date.year();
        this.month = this.date.month();
        this.years = [this.year - 1, this.year];
        this.reduceLists();
        const { historial, usuario } = props;
        this.state = {
            parametro: -1,
            indicador: -1,
            desde:{ y: this.year, m: this.month <= 0 ? 0 : this.month - 1 },
            hasta:{ y: this.year, m: this.month },
            meta: 0,
            height: 0,
            showList: false,
            historial: JSON.parse(JSON.stringify(historial)),
            data: null,
            applied: false,
            listDefaultSegment: usuario.rol == ROLES.entrenador || usuario.rol == ROLES.none  ? 0 : 1
        }
    }

    componentDidMount() {
        const { navigation } = this.props;
        navigation.setParams({
            onSave: null,
            custom: [
                {
                    icon: 'filing',
                    onPress: this._toggleList
                }
            ]
        });
        this.getStorage();
    }

    reduceLists = () => {
        const { parametros } = this.props;
        this.indicadores = parametros.map(x => (x.data.map((i)=>i.evaluacion)));
        this.parametros = parametros.map((x, i) => x.title);
    }

    getStorage = () => {
        const { fetchOnLoad } = this.props;
        if (fetchOnLoad) {
            this._load(false)();
        }
    }

    load = (resolve, toast = true)=>{
        let { network, token, alumno, onFetch, onUpdate } = this.props;
        Usuario.fetch(network, ROUTES.ALUMNO, ACTIONS.select + 'evaluaciones', {
            alumno: alumno.ID
        }, token, async (response) => {
            let { error, data } = response;
            if (error) {
                if (toast) Toast.show(error, { shadow: false });
                const storage = await getStorage(storageKeys.alumno_evaluaciones);
                if (storage) {
                    this.setState({
                        historial: JSON.parse(storage)
                    }, () => {
                        const { historial } = this.state;
                        onUpdate(historial);
                        resolve();
                    });
                    return;
                } else {
                    onFetch(false);
                    resolve();
                    return;
                }
            }
            this.setState({
                historial: this.groupItems(data)
            }, () => {
                const { historial } = this.state;
                onUpdate(historial);
                resolve();
            });
        });
    }

    groupItems = (items) => {
        const historial = {
            pruebas: items ? items.filter(x=> x.rol === 'pruebas') : [],
            mediciones: items ? items.filter(x=> x.rol === 'mediciones') : []
        };
        return historial;
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

    _remove = (item, source, resolve) => {
        const { historial: state } = this.state;
        const { onUpdate } = this.props;
        const historial = JSON.parse(JSON.stringify(state));
        historial[source] = historial[source].filter(x => x.fecha !== item.fecha);
        this.setState({
            historial
        }, () => {
            onUpdate(historial);
            resolve();
        });
    }

    _filterDidChange = (prop, value) => {
        const state = {
            [prop]:value,
            applied: false
        }
        if(prop === "parametro"){
            if (Platform.OS === 'android') {
                this.setState({
                    parametro: -1,
                    indicador: -1
                }, () => {
                    this.setState(state);
                });
            } else {
                state.indicador = Math.floor((Math.random() * 100) + 1) * -1;
                this.setState(state);
            }
        } else {
            this.setState(state);
        }
    }

    _toggleList = ()=>{
        this.setState({
            showList:!this.state.showList
        });
    }

    _closeList = (listSource) => {
        this.setState({
            showList:!this.state.showList,
            listDefaultSegment: listSource
        });
    }

    _navigateToItemDetails = (item, title, source) => () => {
        const { navigation: { navigate }, alumno, usuario } = this.props;
        this.setState({
            showList: false,
            listDefaultSegment: source
        }, () => {
            const params = { item, title, sexo: alumno.sexo, source: source === 0 ? 'referencias' : 'mediciones',  willBlur: this._toggleList };
            if(usuario.tipo == USUARIOS.alumno) {
                navigate(`${routes.InicioRouter.prefix}${routes.EvaluacionRouter.child.DetallesEvaluacion.name}`, params);   
            } else {
                navigate(`${routes.EvaluacionRouter.child.DetallesEvaluacion.name}`, params);
            }
        });
    }

    _void = () => null;
    
    _apply = () => {
        try {
            const { parametros } = this.props;
            const { parametro, indicador, desde, hasta, historial } = this.state;
            let source = (parametro <= 3) ? historial['pruebas'] : historial['mediciones'];
            const grupo = parametros[parametro];
            const medicion = grupo.data[indicador];
            const start = moment(new Date(desde.y, desde.m, 1)).startOf('month');
            const end = moment(new Date(hasta.y, hasta.m, 1)).endOf('month');
            let data = [];
            if (!medicion) {
                Toast.show(ALERTS.form.text.tryAnotherData, { shadow: false });
                return;
            }
            for (let i of source) {
                const date = moment(parseInt(i.fecha));
                if (date.isBetween(start, end)) {
                    const evaluacion = i.evaluaciones.find(x => x.ID == medicion.ID);
                    if (evaluacion) {
                        if (medicion.evaluacion !== 'Flexibilidad' && evaluacion.valor <= 0) continue;
                        data.push({
                            x: date.format('D/M/YY'),
                            y: evaluacion.valor
                        });
                    }
                }
            }
            if (data.length <= 0) {
                Toast.show(`${ALERTS.response.text.noData}\r\nAbre la lista para ver las evaluaciones realizadas.`, { shadow: false, duration: 3000 });
                return;
            }
            data.sort((a, b) => moment(a.x,'D/M/YY').isAfter(moment(b.x, 'D/M/YY')) ? 1 : -1);
            const labels = data.map(x => `${x.x}&${x.y}`);
            const title = `${medicion.evaluacion} (${medicion.unidad})`;
            const datasets = [{ data: data.map(x => x.y) }];
            this.setState({
                applied: true,
                data: {
                    title,
                    labels,
                    datasets
                }
            });
        } catch (error) {
            Toast.show(errors.cantProcess, { shadow: false });
        }
    }

    _toggleApplied = () => {
        const { applied } = this.state;
        let state = {
            applied: !applied
        };
        this.setState(state);
    }

    _onChangeDate = (prop, item) => {
        const { label, index } = item;
        const { desde, hasta } = this.state;
        let y = 0, m = 0;
        if (prop.indexOf('desde') >= 0) {
            if (prop.indexOf('mes') >= 0) {
                m = index;
                y = desde.y;   
            } else {
                m = desde.m;
                y = parseInt(label);
            }
            this.setState({
                desde: { y, m },
                applied: false
            });
        } else {
            if (prop.indexOf('mes') >= 0) {
                m = index;
                y = hasta.y;   
            } else {
                m = hasta.m;
                y = parseInt(label);
            }
            this.setState({
                hasta: { y, m },
                applied: false
            });
        }
    }

    //RENDER

    _chartLayout = ({nativeEvent})=>{
        this.setState({
            height: Math.round(nativeEvent.layout.height / 3 * 1.3)
        });
    }

    render(){
        const { network, token, usuario, alumno, onLoading, loading } = this.props;
        const { parametro, indicador, data, height, showList, historial, desde, hasta, applied, listDefaultSegment } = this.state;
        const isEmpty = historial.pruebas.length + historial.mediciones.length <= 0;
        const showButton = !applied && (parametro >= 0 && indicador >= 0 && (!!desde.y && !!hasta.y) && ((desde.y === hasta.y && desde.m <= hasta.m) || (desde.y < hasta.y)));
        return(
            <>
            <View style={[CSSView.main, CSSView.padding]} onLayout={this._chartLayout}>
                {!isEmpty ? (
                        <ScrollView containerStyle={CSSView.flex}>
                            <View style={CSSView.row}>
                                <View style={CSSView.flex}>
                                    <Label>Parámetro</Label>
                                    <Select 
                                        defaultValue={parametro}
                                        name="parametro"
                                        label="Elige un parámetro de evaluación" 
                                        options={this.parametros}
                                        onChange={this._filterDidChange}
                                    />
                                </View>
                                {parametro >= 0 && (
                                    <>
                                    <View style={CSSView.paddingSm}/>
                                    <View style={CSSView.flex}>
                                        <Label>Indicador</Label>
                                        <Select 
                                            defaultValue={indicador}
                                            name="indicador"
                                            label="Elige un indicador" 
                                            options={this.indicadores[parametro]}
                                            onChange={this._filterDidChange}
                                        />
                                    </View>
                                    </>
                                )}
                            </View>

                            {!applied ? (
                                <View>
                                    <View style={CSSView.flex}>
                                        <Label style={CSSView.separateSm}>Desde</Label>
                                        <CheckButtonGroup
                                            name="desde_mes"
                                            options={MESES_ABBR}
                                            defaultActive={desde.m}
                                            onPress={this._onChangeDate}
                                            noMargin
                                        />
                                        <CheckButtonGroup
                                            name="desde_anio"
                                            options={this.years}
                                            defaultActive={1}
                                            onPress={this._onChangeDate}
                                            noMargin
                                            primary
                                        />
                                    </View>
                                    <View style={CSSView.flex}>
                                        <Label style={CSSView.separateSm}>Hasta</Label>
                                        <CheckButtonGroup
                                            name="hasta_mes"
                                            options={MESES_ABBR}
                                            defaultActive={hasta.m}
                                            onPress={this._onChangeDate}
                                            noMargin
                                        />
                                        <CheckButtonGroup
                                            name="hasta_anio"
                                            options={this.years}
                                            defaultActive={1}
                                            onPress={this._onChangeDate}
                                            noMargin
                                            primary
                                        />
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity style={[CSSView.padding, CSSView.row]} onPress={this._toggleApplied}>
                                    <View  style={CSSView.noGrow}>
                                        <Icon name="calendar" />
                                    </View>
                                    <Text style={[CSSText.center, CSSView.flex]}>
                                        {`${monthNameWithIndex(desde.m).substr(0,3)}. de ${desde.y} - ${monthNameWithIndex(hasta.m).substr(0,3)}. de ${hasta.y}`}
                                    </Text>
                                    <View  style={CSSView.noGrow}>
                                        <Icon name="calendar" />
                                    </View>
                                </TouchableOpacity>
                            )}

                            {
                                showButton && (
                                    <TouchableOpacity style={[styles.filterButton, CSSForms.roundButton, CSSForms.primaryButton]} onPress={this._apply}>
                                        <Text style={[CSSText.bold, CSSText.white, CSSText.center]}>Aplicar filtro</Text>
                                    </TouchableOpacity>
                                )
                            }
                            {(data && applied) && (
                                <View style={styles.chartContainer}>
                                    <ChartKit
                                        key={`chart-kit`} 
                                        title={data.title}
                                        data={data}
                                        height={height}
                                    />
                                </View>
                            )}
                        </ScrollView>
                    ) : (
                        loading ? (
                            <Text style={[CSSText.center, CSSText.bold]}>Cargando...</Text>
                        ) : (
                            <View>
                                <Text style={[CSSText.center, CSSText.bold]}>
                                    {
                                        !network ? 'No hay conexión para poder descargar la lista de evaluaciones' : 'Aún no hay evaluaciones'
                                    }
                                </Text>
                                <TouchableOpacity style={styles.refreshButton} onPress={this._load(true)}>
                                    <View style={[CSSView.row, CSSView.center]}>
                                        <Icon name="refresh" size={15} />
                                        <Text style={CSSView.paddingSm}>Volver a {!network ? 'intentar' : 'cargar'}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )
                    )}
            </View>
            <Modal animationType="slide" visible={showList} onRequestClose={this._void}>
                <Lista
                    defaultSegment={listDefaultSegment}
                    token={token}
                    alumno={alumno}
                    usuario={usuario}
                    data={historial}
                    network={network}
                    onClose={this._closeList}
                    onSelect={this._navigateToItemDetails}
                    onRemove={this._remove}
                    onRefresh={this._refresh}
                    onLoading={onLoading}
                />
            </Modal>
            </>
        );
    }
}