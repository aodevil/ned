//LIB
import React, {Component} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
//ELEMENTS
import {View, Alert} from 'react-native';
import {Badge} from "react-native-elements";
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { TextInput, keyboardTypes } from '../user-controls/TextInput';
import { Label } from '../user-controls/Label';
import { ListGroupHeader } from '../user-controls/ListGroupHeader';
import Toast from 'react-native-root-toast';
import { RefreshView } from '../user-controls/RefreshView';
//STYLES
import { CSSView } from '../styles/view';
import { CSSText } from '../styles/text';
import colors from '../styles/colors.json';
import sizes from '../styles/sizes.json';
//MODEL
import errors from '../services/errors';
import routes from '../providers/routes';
import { post, ROUTES } from '../services/post';
import { componentDidMountDelay } from '../services/functions';
import { Usuario } from '../model/Usuario';
import { ALERTS, ACTIONS } from '../services/constants';
import { Referencia } from '../model/Referencia';

class ReferenciaComponent extends Component {

    _onChange = (prop, parent = null) => (value) => {
        const { item, onChange } = this.props;
        const referencia = new Referencia(item);
        if (parent) {
            referencia[parent][prop] = value;
        } else {
            referencia[prop] = value;
        }
        onChange(referencia);
    }

    render () {
        const { item: { grupo, evaluacion, unidad, bajo, normal, alto }, focusedInput, onFocusNext, initialFocusPosition, index } = this.props;
        return (
            <>
                <ListGroupHeader title={grupo.indexOf('Fuerza') >= 0 ? `${grupo} ${evaluacion}` : evaluacion} toUpperCase={false}/>
                <Label valid={true}>Unidad de medición</Label>
                <TextInput pos={1 + initialFocusPosition} noMargin focusState={focusedInput} onChangeText={this._onChange('unidad')} onFocusNext={onFocusNext} placeholder="Unidad de medición" value={unidad}/>

                <Badge value="Límites" textStyle={[CSSText.dark, { fontSize: sizes.font.sm }]} containerStyle={{ backgroundColor:colors.clear, marginTop: 15 }} />
                <View style={CSSView.row}>
                    <View style={CSSView.flex}>
                        <Label>Inferior</Label>
                        <TextInput pos={2 + initialFocusPosition} noMargin focusState={focusedInput} onChangeText={this._onChange('bajo')} onFocusNext={onFocusNext} placeholder="0.00" value={bajo} keyboardType={keyboardTypes.math} alterValue="0" />
                    </View>
                    <View style={[CSSView.noGrow, CSSView.paddingSm]} />
                    <View style={CSSView.flex}>
                        <Label>Intermedio</Label>
                        <TextInput pos={3 + initialFocusPosition} noMargin focusState={focusedInput} onChangeText={this._onChange('normal')} onFocusNext={onFocusNext} placeholder="0.00" value={normal} keyboardType={keyboardTypes.math} alterValue="0" />
                    </View>
                    <View style={[CSSView.noGrow, CSSView.paddingSm]} />
                    <View style={CSSView.flex}>
                        <Label>Superior</Label>
                        <TextInput pos={4 + initialFocusPosition} noMargin focusState={focusedInput} onChangeText={this._onChange('alto')} onFocusNext={onFocusNext} placeholder="0.00" value={alto} keyboardType={keyboardTypes.math} isLast alterValue="0" />
                    </View>
                </View>

                {index < 6 && <View style={CSSView.separateSm} />}
            </>
        )
    }
}

class ReferenciasComponent extends Component{

    //INIT

    constructor(props){
        super(props);
        this.init(props);
    }

    init(props){
        this.isAdmin = Usuario.isAdmin(props);
        if (this.isAdmin) {
            props.navigation.setParams({
                onSave:this._save
            });
        }
        this.state = {
            mounted:false,
            focusedInput:0,
            referencias: []
        };
    }

    load = (resolve)=>{
        let { network, token, onLoadReferencias } = this.props;
        Referencia.fetch(network, token, null, (response)=>{
            let {error, data} = response;
            onLoadReferencias(data,()=>{
                if(error){
                    Alert.alert(null,error);
                    resolve();
                } else {
                    this.setState({
                        referencias: data.map(x=> new Referencia(x))
                    }, resolve);
                }
            });
        });
    }

    componentDidMount() {
        componentDidMountDelay(this, this._getStorage);
    }

    //ACTIONS

    _getStorage = ()=>{
        const { referencias } = this.props;
        if(!referencias || referencias.length <= 0){
            this._load();
        } else {
            this.setState({
                referencias: referencias.map(x=> new Referencia(x))
            });
        }
    }

    _load = () => {
        const { onLoading } = this.props;
        onLoading(true, (resolve) => {
            this.load(resolve);
        });
    }

    _refresh = (resolve)=>{
        this.load(resolve);
    }

    _focusNextInput = (pos)=>{
        this.setState({
            focusedInput:pos
        });
    }

    _onChange = (referencia) => {
        const { referencias: state } = this.state;
        const referencias = JSON.parse(JSON.stringify(state));
        for (let i = 0; i < referencias.length; i++) {
            if (referencias[i].ID === referencia.ID) {
                referencias[i] = { ...referencia };
                break;
            }
        }
        this.setState({
            referencias
        });
    }

    _save = async ()=>{
        const { network, token, onLoading, onLoadReferencias, usuario: { activo }  } = this.props;
        const { referencias } = this.state;

        if(!network){
            Toast.show(ALERTS.response.text.network,{shadow:false});
            return;
        }

        if(!activo){
            Alert.alert("", errors.auth);
            return;
        }

        onLoading(true, async (resolve) => {
            let response = await post(ROUTES.REFERENCIAS, { action:ACTIONS.update, items: referencias.map(x=> new Referencia(x)) } , token);

            if (response) {
                let { error, data } = response;
                if (!error && data) {
                    onLoadReferencias(referencias, () => {
                        Toast.show(ALERTS.response.text.saved);
                        resolve();
                    });
                } else {
                    resolve();
                    Alert.alert(null,error || ALERTS.response.text.noChanges);
                }
            } else
                resolve();
        });
    }
    
    //RENDER

    _mapReferencias = (x, i) => {
        const { focusedInput } = this.state;
        return (
            <ReferenciaComponent
                focusedInput={focusedInput}
                initialFocusPosition={i * 7}
                onChange={this._onChange}
                onFocusNext={this._focusNextInput}
                key={`referencia-${x.ID}`}
                item={x}
                index={i}
            />
        );
    }

    render(){
        const { referencias } = this.state;
        return(
            <RefreshView onRefresh={this._refresh}>
                <View style={CSSView.container}>
                    {
                        referencias.map(this._mapReferencias)
                    }
                </View>
            </RefreshView>
        );
    }
}
ReferenciasComponent.navigationOptions = setHeaderComponent({
    title:routes.ReferenciasRouter.title,
    secondary: true
});

export const Referencias = connect(mapStateToProps,mapDispatchToProps)(ReferenciasComponent);