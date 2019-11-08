//LIB
import React, { Component } from 'react';
import { connect } from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import moment from 'moment'
//ELEMENTS
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Alert, Linking, Clipboard } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import { Label } from '../user-controls/Label';
import { Select } from '../user-controls/Select';
import { SegmentedButtons } from '../user-controls/SegmentedButtons';
import { FooterModal } from '../user-controls/FooterModal';
import { CheckButtonGroup } from '../user-controls/CheckButtonGroup';
import { Icon } from '../user-controls/IconComponent';
//STYLES
import colors from '../styles/colors.json';
import { CSSView } from '../styles/view';
import { CSSText } from '../styles/text';
import { CSSForms } from '../styles/forms';
//MODEL
import routes from '../providers/routes';
import { SEXOS, EVALUACIONES_EDADES as edades, ALERTS, MESES_ABBR as MESES, ACTIONS } from '../services/constants';
import errors from '../services/errors';
import { Estadistica } from '../model/Estadistica';

const sexos = [...SEXOS, 'Ambos']

const styles = StyleSheet.create({
    filterButton: {
        alignSelf: 'center',
        marginTop: 20,
        width: '60%'
    },
    footerItem: {
        paddingTop:15, 
        paddingBottom:15
    },
    footerItemText: {
        textAlign: 'center',
        fontWeight: 'bold'
    }
});

class EstadisticasComponent extends Component{

    //INIT

    constructor(props){
        super(props);
        this.init(props);
        this.date = new Date();
        this.years = Array.from({ length: 5 }, (x, i) => this.date.getFullYear() - 4 + i);
    }

    init(props){

        props.navigation.setParams({
            custom:[
                {
                    icon:"download",
                    onPress:this._toggleExportOptions
                }
            ]
        });

        const date = moment(this.date);

        this.state = {
            changes: 0,
            mounted:false,
            focusedInput:-1,
            parametro:0,
            edad:0,
            sexo:2,
            desde:{y:date.year(),m:date.month() - 1},
            hasta:{y:date.year(),m:date.month()},
            exportOptions:false,
            exportProcessAlert: `(${date.clone().subtract(1, 'month').format('MM/YYYY')} - ${(date.format('MM/YYYY'))})`,
            exportData: null
        };
    }

    //ACTIONS

    networkAndUserValidation = () => {
        const { usuario, network } = this.props;

        if (!usuario.activo) {
            Alert.alert(null, errors.auth);
            return false;
        }

        if (!network) {
            Alert.alert(null, ALERTS.response.text.network);
            return false;
        }

        return true;
    }

    _focusNextInput = (pos)=>{
        this.setState({
            focusedInput:pos
        });
    }

    _filterDidChange = (prop,value)=>{
        const { changes } = this.state;
        this.setState({
            [prop]:value,
            changes: changes + 1,
            ...(prop === 'parametro' && {
                focusedInput:-1,
                edad:0,
                sexo:2,
            })
        });
    }

    _setSexFilter = (sexo)=>{
        const { changes } = this.state;
        this.setState({
            sexo,
            changes: changes + 1
        });
    }
    
    _onChangeDate = (prop, item) => {
        const { label, index } = item;
        const { desde, hasta, changes } = this.state;
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
                changes: changes + 1,
                exportData: null,
                exportProcessAlert: `(${moment(`1/${m+1}/${y}`, 'D/M/YYYY').format('MM/YYYY')} - ${moment(`1/${hasta.m+1}/${hasta.y}`, 'D/M/YYYY').format('MM/YYYY')})`
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
                changes: changes + 1,
                exportData: null,
                exportProcessAlert: `(${moment(`1/${desde.m+1}/${desde.y}`, 'D/M/YYYY').format('MM/YYYY')} - ${moment(`1/${m+1}/${y}`, 'D/M/YYYY').format('MM/YYYY')})`
            });
        }
    }

    _navToCharts = () => {
        let { navigation: { navigate } } = this.props;
        const { data: { parametro, charts } } = this.state;
        navigate(routes.EstadisticasRouter.child.EstadisticasGraficas.name, {
            title: Estadistica.parametros[parametro],
            charts
        });
    }

    _applyFilters = () => {
        let { network, onLoading, token, usuario } = this.props;
        let { parametro, desde, edad, hasta, sexo, changes, data } = this.state;

        let missingParams = false;

        let fromDate = desde.m >= 0 && desde.y >= 0 ? moment(`1/${desde.m+1}/${desde.y}`, 'D/M/YYYY').startOf('day') : moment().subtract(1, 'year').startOf('day');
        let toDate = hasta.m >= 0 && hasta.y >= 0 ? moment(`1/${hasta.m+1}/${hasta.y}`, 'D/M/YYYY').startOf('day') : moment().add(1, 'day').startOf('day');

        if (parametro < 0) missingParams = true;
        if (parametro >= 7 && (edad < 0 || sexo < 0)) missingParams = true;

        if (missingParams) {
            Alert.alert(ALERTS.form.title, ALERTS.form.text.filterParams);
            return;
        }

        if (!this.networkAndUserValidation()) return;

        if (data && changes <= 0) {
            this._navToCharts();
            return;
        }

        const params = {
            usuario: usuario.ID,
            parametro,
            edad,
            sexo,
            desde: fromDate.isBefore(toDate) ? fromDate.valueOf() : toDate.clone().subtract(1, 'month').valueOf(),
            hasta: toDate.valueOf()
        }
        
        onLoading(true, (resolve) => {
            Estadistica.fetch(network, token, params, (response) => {
                resolve();
                if (response.error) {
                    Alert.alert(null, response.error);
                } else {
                    const data = Estadistica.prepareCharts(params, response.data)
                    this.setState({
                        data,
                        changes: 0
                    }, () => {
                        this._navToCharts();
                    });
                }
            });
        });
    }

    _toggleExportOptions = () => {
        this.setState({
            exportOptions:!this.state.exportOptions
        });
    }

    _compile = async () => {
        const { network, token, onLoading, usuario } = this.props;
        let { desde, hasta } = this.state;

        if (!this.networkAndUserValidation()) return;

        let fromDate = desde.m >= 0 && desde.y >= 0 ? moment(`1/${desde.m+1}/${desde.y}`, 'D/M/YYYY').startOf('day') : moment().subtract(1, 'year').startOf('day');
        let toDate = hasta.m >= 0 && hasta.y >= 0 ? moment(`1/${hasta.m+1}/${hasta.y}`, 'D/M/YYYY').startOf('day') : moment().add(1, 'day').startOf('day');
        if (fromDate.isAfter(toDate)) {
            fromDate =  toDate.clone().subtract(1, 'month');
        }

        const params = {
            usuario: usuario.ID,
            sender: usuario.usuario,
            desde: fromDate.valueOf(),
            hasta: toDate.valueOf()
        }

        onLoading(true, async (resolve) => {
            await this.setState({ exportProcessAlert: 'Procesando...' });
            Estadistica.fetch(network, token, params, async (response) => {
                if (response.error) {
                    await this.setState({ exportProcessAlert: response.error });
                } else {
                    Clipboard.setString(response.data.path)
                    await this.setState({ exportProcessAlert: `(${fromDate.format('MM/YYYY')} - ${toDate.format('MM/YYYY')})`, exportData: response.data });
                }
                resolve();
            }, ACTIONS.select + 'export');
        });
    }

    _download = async () => {
        const { exportData } = this.state;
        if (exportData) {
            await Linking.openURL(exportData.path);
            return;
        }
    }

    //RENDER

    render(){
        let { parametro, edad, sexo, exportOptions, exportData, desde, hasta, exportProcessAlert } = this.state;
        return(
            <>
            <SafeAreaView style={CSSView.main}>
                <ScrollView>
                    <View style={CSSView.container}>

                        <View style={CSSView.separateSm}>
                            <Label>Informes de atención por centros</Label>
                            <Select
                                defaultValue={parametro}
                                name="parametro"
                                label="Elige un parámetro de evaluación"
                                options={Estadistica.parametros}
                                onChange={this._filterDidChange}
                            />
                        </View>

                        {(parametro >= 7) && (
                        <View>
                            <View style={CSSView.separateSm}>
                                <Label style={CSSView.flex}>Rango de edad</Label>
                                <Select
                                    defaultValue={edad}
                                    name="edad"
                                    label="Rango de edad"
                                    options={edades}
                                    onChange={this._filterDidChange}
                                />
                            </View>

                            <SegmentedButtons index={sexo} buttons={sexos} onChange={this._setSexFilter}/>
                        </View>
                        )}

                        <Label style={CSSView.separateSm}>Desde</Label>
                        <CheckButtonGroup
                            name="desde_mes"
                            options={MESES}
                            defaultActive={desde.m}
                            onPress={this._onChangeDate}
                            noMargin
                        />
                        <CheckButtonGroup
                            name="desde_anio"
                            options={this.years}
                            defaultActive={4}
                            onPress={this._onChangeDate}
                            noMargin
                            primary
                        />

                        <Label style={CSSView.separateSm}>Hasta</Label>
                        <CheckButtonGroup
                            name="hasta_mes"
                            options={MESES}
                            defaultActive={hasta.m}
                            onPress={this._onChangeDate}
                            noMargin
                        />
                        <CheckButtonGroup
                            name="hasta_anio"
                            options={this.years}
                            defaultActive={4}
                            onPress={this._onChangeDate}
                            noMargin
                            primary
                        />

                        <TouchableOpacity style={[styles.filterButton, CSSForms.roundButton, CSSForms.primaryButton]} onPress={this._applyFilters}>
                            <Text style={[CSSText.bold, CSSText.white, CSSText.center]}>Aplicar filtro</Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </SafeAreaView>
            <FooterModal
                dismiss={this._toggleExportOptions}
                visible={exportOptions}
            >
                <List containerStyle={{marginTop:20}}>
                    {exportData ? (
                        <ListItem 
                            containerStyle={styles.footerItem} 
                            titleStyle={styles.footerItemText} 
                            title="Descargar archivo" 
                            rightIcon={<Icon name="download" color={colors.primary} />}
                            onPress={this._download}
                        />
                    ) : (
                        <ListItem 
                            containerStyle={styles.footerItem} 
                            titleStyle={styles.footerItemText} 
                            title="Compilar datos" 
                            rightIcon={<Icon name="code-download" color={colors.primary} />}
                            onPress={this._compile}
                        />
                    )}
                </List>
                {!!exportProcessAlert && (
                    <View style={CSSView.paddingHeightSm}>
                        <Text style={[CSSText.center]}>{exportProcessAlert}</Text>
                    </View>
                )}
            </FooterModal>
        </>
        );
    }
}
EstadisticasComponent.navigationOptions = setHeaderComponent({
    title:routes.EstadisticasRouter.child.Estadisticas.title
});

export const Estadisticas = connect(mapStateToProps,mapDispatchToProps)(EstadisticasComponent);