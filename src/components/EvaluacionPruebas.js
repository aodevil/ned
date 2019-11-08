//LIB
import React, {Component, memo, PureComponent} from 'react';
import moment from 'moment';
import isNumeric from 'validator/lib/isNumeric';
import errors from '../services/errors';
import { ROLES, ALERTS, ACTIONS } from '../services/constants';
import { Referencia } from '../model/Referencia';
import { rawStr } from '../services/functions';
import { ROUTES, post } from '../services/post';
import { Usuario } from '../model/Usuario';
import { setStorage, storageKeys, getStorage } from '../services/storage';
//ELEMENTS
import { View, SectionList, Dimensions, Text, Keyboard, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { List, Badge } from 'react-native-elements';
import { ListGroupHeader } from '../user-controls/ListGroupHeader';
import { TextInput, keyboardTypes } from '../user-controls/TextInput';
import { Label } from '../user-controls/Label';
import { Icon } from '../user-controls/IconComponent';
import Popover, { Rect } from 'react-native-popover-view';
import Toast from 'react-native-root-toast';
//STYLES
import colors from '../styles/colors.json';
import { CSSView } from '../styles/view';
import { CSSText } from '../styles/text';
import { CSSList } from '../styles/list';

class ListInput extends Component {
    constructor (props) {
        super(props);
        this.state = {
            ...new Referencia(props.item)
        };
    }

    shouldComponentUpdate(props, state) {
        const { valor: prev } = this.state;
        const { valor: next } = state;
        if (
            prev !== next
        ) return true;
        return false;
    }

    _setState = (prop) => (value) => {
        const { onChange } = this.props;
        this.setState({
            [prop]: value
        }, () => {
            onChange({
                ...this.state
            });
        });
    }

    render () {
        const { getResult} = this.props;
        const { evaluacion, unidad, valor } = this.state;
        const result = Referencia.getResult(this.state);
        
        return (
            <View style={CSSView.row}>
                <View style={CSSView.flex}>
                    <Label>{evaluacion}{!!unidad ? ` (${unidad})`: ''}</Label>
                    <TextInput noMargin onChangeText={this._setState('valor')} placeholder={unidad || evaluacion} value={valor} keyboardType={keyboardTypes.math} isLast/>
                </View>
                {
                    (getResult && !!valor) && (
                        <View style={CSSView.noGrow}>
                            <Icon {...result} />
                        </View>
                    )
                }
            </View> 
        );
    }
}

const PruebasPopover =  memo(({ width, VO2Max }) => (
    <View style={[CSSView.padding, { width }]}>
        <Text style={[CSSText.center, CSSText.bold]}>VO2Max</Text>
        {VO2Max > 0 && <Text style={[CSSText.center, CSSText.placeholder]}>Calculado con el valor obtenido del test de Cooper</Text>}
        <View style={CSSView.separate}>
            {VO2Max > 0 ? (
                <Text>{VO2Max.toFixed(2)} ml/Kg/min</Text>
            ) : (
                <Text>Para calcular el volumen máximo de oxígeno realiza el test de Cooper</Text>
            )}
        </View>
    </View>
));

const MedicionesPopover =  memo(({ width, pesoIdeal, imc, icc, sumatoria, grasa, musculo }) => (
    <View style={[CSSView.padding, { width }]}>
        <ScrollView>
            <View style={[CSSView.paddingSm, CSSList.itemBorder]}>
                <Text style={[CSSText.center, CSSText.bold]}>Peso ideal</Text>
                <Text style={CSSText.center}>{pesoIdeal.toFixed(2)} Kg</Text>
            </View>
            <View style={[CSSView.paddingSm, CSSList.itemBorder]}>
                <Text style={[CSSText.center, CSSText.bold]}>IMC</Text>
                <Text style={CSSText.center}>{imc.toFixed(2)} Kg/m2</Text>
            </View>
            <View style={[CSSView.paddingSm, CSSList.itemBorder]}>
                <Text style={[CSSText.center, CSSText.bold]}>Cintura-Cadera</Text>
                <Text style={CSSText.center}>{icc.toFixed(2)}</Text>
            </View>
            <View style={[CSSView.paddingSm, CSSList.itemBorder]}>
                <Text style={[CSSText.center, CSSText.bold]}>∑ 6 pliegues</Text>
                <Text style={CSSText.center}>{sumatoria.toFixed(2)}</Text>
            </View>
            <View style={[CSSView.paddingSm, CSSList.itemBorder]}>
                <Text style={[CSSText.center, CSSText.bold]}>Grasa</Text>
                <Text style={CSSText.center}>{grasa.toFixed(2)} %</Text>
            </View>
            <View style={[CSSView.paddingSm, CSSList.itemBorder]}>
                <Text style={[CSSText.center, CSSText.bold]}>Músculo</Text>
                <Text style={CSSText.center}>{musculo.toFixed(2)} Kg</Text>
            </View>
        </ScrollView>
    </View>
));

class DatePopover extends PureComponent {
    constructor(props){
        super(props);
        this.state = {
            focusedInput: -1,
            day: props.day,
            month: props.month + 1,
            year: props.year, 
        };
    }

    _setState = (prop) => (value) => {
        this.setState({
            [prop]: value
        }, () => {
            const { onChange } = this.props;
            const { day, month, year } = this.state;
            onChange(day, month, year);
        });
    }

    _focusNextInput = (pos)=>{
        this.setState({
            focusedInput: pos,
        });
    }

    render () {
        const { focusedInput, day, month, year } = this.state;
        return (
            <View style={CSSView.row}>
                <View style={CSSView.flex}>
                    <Label style={CSSText.center}>Día</Label>
                    <TextInput pos={0} noMargin focusState={focusedInput} onChangeText={this._setState('day')} onFocusNext={this._focusNextInput} placeholder={'DD'} value={day} keyboardType={keyboardTypes.number} styles={[CSSText.center]} selectTextOnFocus />
                </View>
                <View style={CSSView.flex}>
                    <Label style={CSSText.center}>Mes</Label>
                    <TextInput pos={1} noMargin focusState={focusedInput} onChangeText={this._setState('month')} onFocusNext={this._focusNextInput} placeholder={'MM'} value={month} keyboardType={keyboardTypes.number} styles={[CSSText.center]} selectTextOnFocus />
                </View>
                <View style={CSSView.flex}>
                    <Label style={CSSText.center}>Año</Label>
                    <TextInput pos={2} noMargin focusState={focusedInput} onChangeText={this._setState('year')} onFocusNext={this._focusNextInput} placeholder={'YYYY'} value={year} keyboardType={keyboardTypes.number} isLast styles={[CSSText.center]} selectTextOnFocus />
                </View>
            </View>
        );
    }
}

export class Pruebas extends Component{
    constructor(props) {
        super(props);
        let width = Dimensions.get('window').width;
        this.popoverWidth = Math.floor(width / 2);
        this.popoverPosition = new Rect(width, 80, -135, 0);
        this.datePopoverPosition = new Rect(width, 130, -width, 0);
        const { evaluaciones } = props;
        this.evaluaciones = Referencia.reduce(evaluaciones, true);
        this.state = {
            focusedInput:0,
            popover: false,
            datePopover: false,
            date: moment(),
            resultados: {
                VO2Max: 0,
                pesoIdeal: 0,
                imc: 0, 
                icc: 0, 
                sumatoria: 0, 
                grasa: 0, 
                musculo: 0
            }
        };
    }

    componentDidMount() {
        const { navigation } = this.props;
        navigation.setParams({
            onSave: this._save,
            custom: [{
                icon: 'calculator',
                onPress: this._togglePopover
            }]
        });
    }

    //ACTIONS

    _onChange = (item) => {
        const { onChange } = this.props;
        this.evaluaciones.forEach(evaluacion => {
            if (evaluacion.ID === item.ID) {
                evaluacion.valor = !isNumeric(item.valor) ? 0 : parseFloat(item.valor);
                return;
            }
        });
        onChange(item); 
    }

    _togglePopover = () => {
        Keyboard.dismiss();
        this.setState(({ popover }) => {
            return {
                popover: !popover,
            };
        }, () => {
            const { popover } = this.state;
            const { type } = this.props;
            if (popover) {
                if (type === ROLES.entrenador) {
                    this.calculatePruebas();
                } else {
                    this.calculateMediciones();
                }
            }                
        });
    }

    _toggleDatePopover = () => {
        Keyboard.dismiss();
        this.setState(({ datePopover }) => {
            return {
                datePopover: !datePopover,
            };
        });
    }

    calculatePruebas = () => {
        const { alumno } = this.props;

        let items = {};
        
        this.evaluaciones.forEach(item => {
            const { evaluacion, valor } = item;
            items[rawStr(evaluacion)] = valor; 
        });

        const { VO2Max } = Referencia.calculatePruebas(items, alumno.sexo);

        this.setState({
            resultados: {
                VO2Max
            }
        });
    }

    calculateMediciones = () => {
        const { alumno } = this.props;

        let items = {};
        
        this.evaluaciones.forEach(item => {
            const { evaluacion, valor } = item;
            items[rawStr(evaluacion)] = valor; 
        });

        const { pesoIdeal, imc, icc, sumatoria, grasa, musculo } = Referencia.calculateMediciones(items, alumno.sexo);

        this.setState({
            resultados: {
                pesoIdeal,
                imc,
                icc,
                sumatoria,
                grasa,
                musculo
            }
        });
    }

    setLocalStorage = async (alumno, callback, toast = ALERTS.storage.text.tmp) => {
        const { ID, evaluacion } = alumno;
        const item = { ID, evaluacion };
        let evaluaciones = [ ];
        const storage = await getStorage(storageKeys.evaluaciones);

        let found = false;
        if (storage) {
            evaluaciones = [ ...JSON.parse(storage) ];
            evaluaciones.forEach(x => {
                if (found) return;
                if (x.ID === ID && x.evaluacion.fecha === evaluacion.fecha) {
                    found = true;
                    x.evaluacion.evaluaciones = [ ...evaluacion.evaluaciones ];
                }
            });
        }

        if (!found)
            evaluaciones.push(item);

        if (evaluaciones.length >= 100) {
            Alert.alert(
                ALERTS.storage.title,
                ALERTS.storage.text.limit,
                [
                    { text: ALERTS.remove.text.accept, onPress: callback },
                ]
            );
            return;
        }

        setStorage(storageKeys.evaluaciones, JSON.stringify(evaluaciones))
        .then(()=>{ 
            Toast.show(toast, { shadow: false, duration: 3000 });
            if(callback) callback(); 
        })
        .catch(()=>{ 
            if(callback) callback(); 
        });
    }

    updateLocalStorage = async (alumno, callback) => {
        const { ID, evaluacion: { fecha } } = alumno;
        let evaluaciones = [];
        const storage = await getStorage(storageKeys.evaluaciones);
        if (storage) {
            evaluaciones = JSON.parse(storage).filter(x => !(x.ID === ID && x.evaluacion.fecha === fecha));
            setStorage(storageKeys.evaluaciones, JSON.stringify(evaluaciones))
            .then(callback)
            .catch(callback);
        } else {
            if (callback) callback();
        }
    }
    
    _onDateChanged = (day, month, year) => {
        this.setState({
            date: moment(new Date(year, month - 1, day)),
        });
    }

    _save = async () => {
        const { alumno, usuario, network, onLoading, type, token, onUpdate, onUpdateAlumno } = this.props;
        const nacimiento = moment(alumno.nacimiento || +new Date()).startOf('day')
        const { date } = this.state;
        const edad = date.clone().startOf('day').diff(nacimiento, 'years');
        const data = {
            source: (type === ROLES.entrenador ? 'pruebas' : 'mediciones'),
            evaluaciones: [ ...this.evaluaciones ],
            alumno: alumno.ID,
            evaluador: usuario.ID,
            evaluadorNombre: `${usuario.nombres} ${usuario.apellidos}`,
            centro: usuario.centro ? usuario.centro.ID : null,
            fecha: date.clone().startOf('day').valueOf(),
            edad
        }
        
        const replace = new Usuario({ ...alumno, evaluacion: { fecha: data.fecha, evaluaciones: [ ...this.evaluaciones ] } });

        if(!usuario.activo){
            Alert.alert("", errors.auth);
            return;
        }

        let value = 0;
        for (let i of this.evaluaciones) {
            value += i.valor;
        }
        if (value <= 0) {
            Toast.show(ALERTS.form.text.insufficientData, { shadow:false });
            return;
        }

        if(!network){
            onUpdateAlumno(replace, () => {
                this.setLocalStorage(replace, () => {
                    onUpdate(replace, true);
                });
            });
            return;
        }

        onLoading(true, async (resolve)=>{
            let response = await post(ROUTES.ALUMNO, { action:ACTIONS.insert+'evaluaciones', self:false, data }, token);

            if(response) {
                let { error } = response;
                                
                if(error) {
                    this.setLocalStorage(replace, () => {
                        onUpdate(replace, true);
                        resolve();
                        Alert.alert(null, error || ALERTS.response.text.noChanges);
                    });
                } else {
                    onUpdateAlumno(replace, () => {
                        this.updateLocalStorage(replace, () => {
                            onUpdate(replace, true);
                            resolve();
                            Toast.show(ALERTS.response.text.done, { shadow: false});
                        });
                    });
                }
            } else {
                this.setLocalStorage(replace, () => {
                    onUpdate(replace, true);
                    resolve();
                });
            }
        });
    }

    //RENDER

    _renderRow = ({ item, index, section }) => {
        const { type } = this.props;
       return (
        <ListInput
            item={item}
            onChange={this._onChange}
            getResult={type === ROLES.entrenador}
        />
       );
    }

    _renderHeader = ({section: {title}}) => (
        <ListGroupHeader title={title}/>
    );

    _keyExtractor = (x,i)=>{
        return `evaluacion-item-${x.ID}`;
    }

    render(){
        const { popover, datePopover, resultados, date } = this.state;
        const { type, evaluaciones } = this.props;
        const dateFormat = date.format('[Evaluación del día] DD/MM/YYYY');
        const day = date.date();
        const month = date.month();
        const year = date.year();
        return(
            <>
                <View style={[CSSView.main, CSSView.padding]}>
                    <TouchableOpacity onPress={this._toggleDatePopover}>
                        <Badge value={dateFormat} textStyle={CSSText.dark} containerStyle={{backgroundColor: colors.clear}} />
                    </TouchableOpacity>
                    <List containerStyle={[CSSList.noLines,CSSView.flex]}>
                        <SectionList
                            sections={evaluaciones}
                            renderItem={this._renderRow}
                            renderSectionHeader={this._renderHeader}
                            keyExtractor={this._keyExtractor}
                        />
                    </List>
                </View>
                <Popover
                    isVisible={popover}
                    fromRect={this.popoverPosition}
                    placement="bottom"
                    onRequestClose={this._togglePopover}
                >
                    { type === ROLES.entrenador ? (
                        <PruebasPopover 
                            width={this.popoverWidth}
                            VO2Max={resultados.VO2Max}
                        /> 
                    ) : (
                        <MedicionesPopover 
                            width={this.popoverWidth}
                            pesoIdeal={resultados.pesoIdeal}
                            imc={resultados.imc}
                            icc={resultados.icc}
                            sumatoria={resultados.sumatoria}
                            grasa={resultados.grasa}
                            musculo={resultados.musculo}
                        />
                    )}
                </Popover>
                <Popover
                    isVisible={datePopover}
                    placement="bottom"
                    onRequestClose={this._toggleDatePopover}
                    fromRect={this.datePopoverPosition}
                >
                    <DatePopover
                        day={day}
                        month={month}
                        year={year}
                        onChange={this._onDateChanged}
                    />
                </Popover>
            </>
        );
    }
}