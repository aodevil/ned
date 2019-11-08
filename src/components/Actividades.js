//LIB
import React, {Component} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
//ELEMENTS
import {View, FlatList, SafeAreaView} from 'react-native';
import { SegmentedButtons } from '../user-controls/SegmentedButtons';
import { List, ListItem } from 'react-native-elements';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
//STYLES
import { CSSView } from '../styles/view';
//MODEL
import routes from '../providers/routes';
import { ACTIVIDADES, USUARIOS } from '../services/constants';

const buttons = [
    ACTIVIDADES.actividades.name, ACTIVIDADES.eventos.name
];

class ActividadesComponent extends Component{

    constructor(props){
        super(props);
        const { navigation, usuario } = props;
        this.state = {
            listSource: navigation.getParam('listSource') || 0
        };
        this.prefix = navigation.getParam('prefix') || '';
        this.alumno = navigation.getParam('alumno') || (usuario.tipo == USUARIOS.alumno ? usuario : null);
    }

    _navigate = (e, i)=>{
        let {listSource:s} = this.state;
        let source = s===0 ? ACTIVIDADES.actividades.name : ACTIVIDADES.eventos.name;
        this.props.navigation.navigate(this.prefix + routes.ActividadesRouter.child.ListaActividades.name, { source, title:e, type:i, prefix: this.prefix, alumno: this.alumno });
    }

    _updateListSource = (listSource)=>{
        this.setState({listSource});
    }

    _renderRow = ({ item,index }) =>{
        return (
            <ListItem title={item} onPress={this._navigate.bind(this,item,index)}/>
        );
    }

    _keyExtractor = (x,i)=>{
        return `item-${i}`;
    }

    render(){
        let {listSource} = this.state;
        return(
            <SafeAreaView style={CSSView.main}>
                <View style={[CSSView.container]}>
                    <SegmentedButtons index={listSource} buttons={buttons} onChange={this._updateListSource}/>
                    <List containerStyle={CSSView.main}>
                        <FlatList
                            data={ACTIVIDADES.tipos}
                            renderItem={this._renderRow}
                            keyExtractor={this._keyExtractor}
                        />
                    </List>
                </View>
            </SafeAreaView>
        );
    }
}
ActividadesComponent.navigationOptions = setHeaderComponent({
    title:routes.ActividadesRouter.child.Actividades.title
});

export const Actividades = connect(mapStateToProps,mapDispatchToProps)(ActividadesComponent);
