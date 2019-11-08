//LIB
import React, {Component} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
//ELEMENTS
import {View, FlatList, Text, Alert, Dimensions} from 'react-native';
import { List, ListItem } from 'react-native-elements';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { RefreshView } from '../user-controls/RefreshView';
import SwipeOut from "react-native-swipeout";
import Toast from 'react-native-root-toast';
//STYLES
import { CSSView } from '../styles/view';
import { CSSText } from '../styles/text';
import colors from '../styles/colors';
//MODEL
import errors from '../services/errors';
import routes from '../providers/routes';
import { rawStr, componentDidMountDelay } from '../services/functions';
import { Usuario } from '../model/Usuario';
import { ACTIONS, USUARIOS, ROLES, ALERTS, SEXO } from '../services/constants';
import { ROUTES } from '../services/post';
import { CSSList } from '../styles/list';

class EvaluadoresComponent extends Component{

    constructor(props){
        super(props);
        this.rowWidth = Dimensions.get('screen').width - 22;
        let {navigation} = props;
        let params = {
            onSearch:this._filter,
            custom:[{
                icon:"add",
                onPress:this._edit.bind(this,null,null)
            }]
        };
        navigation.setParams(params);
        this.state = {
            mounted:false,
            filtering:true,
            evaluadores: props.evaluadores
        };
    }

    componentDidMount(){
        componentDidMountDelay(this,()=>{
            this._getStorage();
        });
    }

    //ACTIONS

    _getStorage = ()=>{
        const { evaluadores } = this.props;
        if(evaluadores && evaluadores.length > 0){
            this._filter("");
        }else{
            this._load();
        }
    }

    load = (resolve)=>{
        let {network,token} = this.props;
        Usuario.fetch(network, ROUTES.EVALUADOR, ACTIONS.select,{
            tipo:USUARIOS.evaluador
        },token,(response)=>{
            let {error,data} = response;
            this.props.onLoadEvaluadores(data,()=>{
                this._filter("");
                resolve();
                if(error){
                    Alert.alert(null,error);
                }
            });
        });
    }

    _refresh = (resolve)=>{
        this.load(resolve);
    }

    _load = ()=>{
        this.props.onLoading(true,(resolve)=>{
            this.load(resolve);
        });
    }

    _filter = (value)=>{
        let {evaluadores,usuario:{ID:uID}} = this.props;
        let filter = evaluadores.filter(i=>{
            let {nombres,apellidos,ID,usuario,rol} = i;
            if(uID === ID)return false;
            let itemData = `${rawStr(nombres)}${rawStr(apellidos)}${rawStr(usuario)}${rawStr(ROLES.labels[rol])}`;
            let search = rawStr(value);
            return itemData.indexOf(search) > -1;
        });
        this.setState({
            evaluadores:filter,
            filtering:false
        });
    }

    _edit = (e,i)=>{
        this.props.navigation.navigate(routes.EvaluadoresRouter.child.Evaluador.name,{item:e,index:i, onUpdate:this._filter});
    }

    _navigate = (e,i)=>{
        this.props.navigation.navigate(routes.EvaluadoresRouter.child.AlumnosEvaluador.name,{item:e,index:i, title:`Alumnos de ${e.nombres}`});
    }

    _remove = (e)=>{
        Alert.alert(ALERTS.remove.title, ALERTS.remove.text.confirm, [
            { text: ALERTS.remove.text.cancel, onPress: void 0 },
            { text: ALERTS.remove.text.accept, onPress: () => {
                    let { usuario:{ID, activo}, network, token, onLoading, onRemoveEvaluador} = this.props;
                    if (!network) {
                        Toast.show(ALERTS.response.text.network,{shadow:false});
                        return;
                    }

                    if(!activo){
                        Alert.alert("", errors.auth);
                        return;
                    }

                    onLoading(true,(resolve)=>{
                        Usuario.fetch(network, ROUTES.EVALUADOR, ACTIONS.delete, { ID: e.ID }, token, (response) => {
                            let {error} = response;
                            if(!error){
                                onRemoveEvaluador(e,(state)=>{
                                    this.setState({
                                        evaluadores:state.filter(x => x.ID !== ID)
                                    },resolve);
                                });
                            }else{
                                resolve();
                                Alert.alert(null,error);
                            }
                        });
                    });
                }
            }
        ]);
    }

    //RENDER

    _renderRow = ({ item,index }) =>{
        let {usuario} = this.props;
        return (
            <SwipeOut 
                right={[
                    {
                        backgroundColor:colors.danger,
                        color:colors.white,
                        text:"Eliminar",
                        onPress:this._remove.bind(this,item)
                    },
                    {
                        backgroundColor:colors.success,
                        color:colors.white,
                        text:"Editar",
                        onPress:this._edit.bind(this,item,index)
                    }
                ]} 
                autoClose 
                backgroundColor={colors.none}
                disabled={!usuario.activo}
            >
                <ListItem 
                    title={`${item.nombres} ${item.apellidos}`}
                    titleContainerStyle={CSSList.fullWidth}
                    subtitle={
                        <View style={{paddingLeft:11,paddingRight:11}}>
                            <Text style={[CSSText.fontSm,CSSText.placeholder]}>
                                {`${item.usuario}`}
                            </Text>
                            <Text style={[CSSText.fontSm,CSSText.placeholder]}>
                                {ROLES[item.sexo === SEXO.M ? 'maleLabels' : 'femaleLabels'][item.rol]}
                            </Text>
                            {item.centro && (
                            <Text style={[CSSText.fontSm,CSSText.primary]}>
                                {item.centro.nombre}
                            </Text>
                            )}
                        </View>
                    } 
                    subtitleContainerStyle={{width: this.rowWidth}}
                    rightTitle={(item.activo?` `:`Inactivo`)}
                    rightTitleStyle={CSSText.danger}
                    onPress={this._navigate.bind(this,item,index)}
                />
            </SwipeOut>
        );
    }

    _keyExtractor = (x,i)=>{
        return `item-evaluador-${x.ID}`;
    }

    render(){
        let {evaluadores, filtering} = this.state;
        return(
            <RefreshView onRefresh={this._refresh}>
                <View style={[CSSView.container]}>
                    {
                        (evaluadores.length <= 0 && !filtering) && (
                            <Text style={CSSText.center}>No hay evaluadores en la lista.</Text>
                        )
                    }
                    <List containerStyle={CSSView.flex}>
                        <FlatList
                            data={evaluadores}
                            renderItem={this._renderRow}
                            keyExtractor={this._keyExtractor}
                        />
                    </List>
                </View>
            </RefreshView>
        );
    }
}
EvaluadoresComponent.navigationOptions = setHeaderComponent({
    title:routes.EvaluadoresRouter.child.Evaluadores.title
});

export const Evaluadores = connect(mapStateToProps,mapDispatchToProps)(EvaluadoresComponent);
