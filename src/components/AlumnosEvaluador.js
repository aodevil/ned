//LIB
import React, {Component} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import moment from 'moment';
//ELEMENTS
import {View, FlatList, Text } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { RefreshView } from '../user-controls/RefreshView';
import Toast from 'react-native-root-toast';
//STYLES
import { CSSView } from '../styles/view';
import { CSSText } from '../styles/text';
//MODEL
import routes from '../providers/routes';
import { rawStr, componentDidMountDelay } from '../services/functions';
import { Usuario } from '../model/Usuario';
import { ACTIONS, USUARIOS, ROLES } from '../services/constants';
import errors from '../services/errors';
import { ROUTES } from '../services/post';
import { CSSList } from '../styles/list';

class AlumnosEvaluadorComponent extends Component{

    constructor(props){
        super(props);
        let {navigation} = props;
        let params = {
            onSearch:this._filter
        };
        navigation.setParams(params);
        this.state = {
            mounted:false,
            filtering:true,
            alumnos:[]
        };
        this.evaluador = new Usuario(navigation.getParam("item"));
        this.alumnos = [];
    }

    componentDidMount(){
        componentDidMountDelay(this,()=>{
            this._load();
        });
    }

    //ACTIONS

    load = (resolve)=>{
        let {network,token} = this.props;
        Usuario.fetch(network, ROUTES.ALUMNO, ACTIONS.select,{
            tipo: USUARIOS.alumno,
            ID:this.evaluador.ID,
            centro: '',
            source: (parseInt(this.evaluador.rol) === ROLES.entrenador ? 'pruebas' : 'mediciones')
        },token,(response)=>{
            let {error,data} = response;
            this.alumnos = data || [];
            this.setState({
                alumnos:[...this.alumnos],
                filtering:false
            },()=>{
                resolve();
                if(error){
                    Toast.show(error, { shadow: false })
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
        let filter = this.alumnos.filter(i=>{
            let {nombres,apellidos,usuario} = i;
            let itemData = `${rawStr(nombres)}${rawStr(apellidos)}${rawStr(usuario)}`;
            let search = rawStr(value);
            return itemData.indexOf(search) > -1;
        });
        this.setState({
            alumnos:filter,
            filtering:false
        });
    }

    _navigate = (e,i)=>{
        try {
            this.props.navigation.navigate(routes.EvaluadoresRouter.child.AlumnoEvaluador.name, { item:e, index:i, title: `${e.nombres} ${e.apellidos}` });
        } catch (error) {
            Toast.show(errors.navigation, { shadow: false });
        }
    }

    //RENDER

    _renderRow = ({ item,index }) =>{
        return (
            <ListItem 
                title={`${item.nombres} ${item.apellidos}`}
                subtitle={
                    <View style={{...CSSList.fullWidth, paddingLeft:11,paddingRight:11}}>
                        <Text style={[CSSText.fontSm,CSSText.placeholder]}>
                            {moment().diff(moment(item.nacimiento), 'year')} años
                        </Text>
                        {/* {item.centro && (
                        <Text style={[CSSText.fontSm,CSSText.primary]}>
                            {item.centro.nombre}
                        </Text>
                        )} */}
                    </View>
                } 
                rightTitle={(item.activo?` `:`Inactivo`)}
                rightTitleStyle={CSSText.danger}
                onPress={this._navigate.bind(this,item,index)}
            />
        );
    }

    _keyExtractor = (x,i)=>{
        return `item-alumno-${x.ID}`;
    }

    render(){
        const {alumnos, filtering} = this.state;
        const { loading } = this.props;
        return(
            <RefreshView onRefresh={this._refresh}>
                <View style={[CSSView.container]}>
                    { loading && (
                        <Text style={CSSText.center}>Cargando...</Text>
                    )}
                    {
                        (alumnos.length <= 0 && !filtering) && (
                            <Text style={CSSText.center}>No hay alumnos en la lista.</Text>
                        )
                    }
                    <List containerStyle={CSSView.flex}>
                        <FlatList
                            data={alumnos}
                            renderItem={this._renderRow}
                            keyExtractor={this._keyExtractor}
                        />
                    </List>
                </View>
            </RefreshView>
        );
    }
}
AlumnosEvaluadorComponent.navigationOptions = setHeaderComponent({
    title:routes.EvaluadoresRouter.child.AlumnosEvaluador.title,
    secondary:true,
    root:false
});

export const AlumnosEvaluador = connect(mapStateToProps,mapDispatchToProps)(AlumnosEvaluadorComponent);
