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
import { ACTIONS, USUARIOS, ROLES, ALERTS } from '../services/constants';
import { ROUTES } from '../services/post';
import { CSSList } from '../styles/list';

class CoordinadoresComponent extends Component{

    constructor(props){
        super(props);
        this.rowWidth = Dimensions.get('screen').width - 22;
        let {navigation, usuario} = props;
        let params = {
            onSearch:this._filter
        };
        if(usuario.master){
            params.custom = [{
                icon:"add",
                onPress:this._navigate.bind(this,null,null)
            }];
        }
        navigation.setParams(params);
        this.state = {
            mounted:false,
            filtering:true,
            coordinadores:[]
        };
    }

    componentDidMount(){
        componentDidMountDelay(this,()=>{
            this._getStorage();
        });
    }

    //ACTIONS

    _getStorage = ()=>{
        const { coordinadores } = this.props;
        if (coordinadores && coordinadores.length > 0) {
            this._filter("");
        } else {
            this._load();
        }
    }

    load = (resolve)=>{
        let {network,token} = this.props;
        Usuario.fetch(network, ROUTES.COORDINADOR, ACTIONS.select,{
            tipo:USUARIOS.coordinador
        },token,(response)=>{
            let {error,data} = response;
            this.props.onLoadCoordinadores(data,()=>{
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
        let {coordinadores,usuario:{ID:uID}} = this.props;
        let filter = coordinadores.filter(i=>{
            let {nombres,apellidos,ID,usuario} = i;
            if(uID === ID)return false;
            let itemData = `${rawStr(nombres)}${rawStr(apellidos)}${rawStr(usuario)}`;
            let search = rawStr(value);
            return itemData.indexOf(search) > -1;
        });
        this.setState({
            coordinadores:filter,
            filtering:false
        });
    }

    _navigate = (e,i)=>{
        this.props.navigation.navigate(routes.CoordinadoresRouter.child.Coordinador.name,{item:e,index:i, onUpdate:this._filter});
    }

    _remove = (e)=>{

        Alert.alert(ALERTS.remove.title, ALERTS.remove.text.confirm, [
            { text: ALERTS.remove.text.cancel, onPress: void 0 },
            { text: ALERTS.remove.text.accept, onPress: () => {
                let { usuario: { ID, activo }, network, token, onLoading, onRemoveCoordinador} = this.props;
                if (!network) {
                    Toast.show(ALERTS.response.text.network,{shadow:false});
                    return;
                }

                if(!activo){
                    Alert.alert("", errors.auth);
                    return;
                }

                onLoading(true,(resolve)=>{
                    Usuario.fetch(network,ROUTES.COORDINADOR,ACTIONS.delete,{ID:e.ID},token, (response)=>{
                        let {error} = response;
                        if(!error){
                            onRemoveCoordinador(e,(state)=>{
                                this.setState({
                                    coordinadores:state.filter(x => x.ID !== ID)
                                },resolve);
                            });
                        }else{
                            resolve();
                            Alert.alert(null,error);
                        }
                    });
                });
            }}
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
                    }
                ]} 
                autoClose 
                backgroundColor={colors.none}
                disabled={!usuario.master}
            >
                <ListItem 
                    title={`${item.nombres} ${item.apellidos}`}
                    titleContainerStyle={CSSList.fullWidth}
                    subtitle={`${item.usuario}`}
                    subtitleStyle={CSSText.normal}
                    rightTitle={((item.activo)?((!item.master)?` `:ROLES.labels[item.rol]):`Inactivo`)}
                    rightTitleStyle={((item.activo)?((!item.master)?CSSText.danger:CSSText.success):CSSText.danger)}
                    onPress={this._navigate.bind(this,item,index)}
                />
            </SwipeOut>
        );
    }

    _keyExtractor = (x,i)=>{
        return `item-coordinador-${x.ID}`;
    }

    render(){
        let {coordinadores, filtering} = this.state;
        return(
            <RefreshView onRefresh={this._refresh}>
                <View style={[CSSView.container]}>
                    {
                        (coordinadores.length <= 0 && !filtering) && (
                            <Text style={CSSText.center}>No hay coordinadores en la lista.</Text>
                        )
                    }
                    <List containerStyle={CSSView.flex}>
                        <FlatList
                            data={coordinadores}
                            renderItem={this._renderRow}
                            keyExtractor={this._keyExtractor}
                        />
                    </List>
                </View>
            </RefreshView>
        );
    }
}
CoordinadoresComponent.navigationOptions = setHeaderComponent({
    title:routes.CoordinadoresRouter.child.Coordinadores.title
});

export const Coordinadores = connect(mapStateToProps,mapDispatchToProps)(CoordinadoresComponent);
