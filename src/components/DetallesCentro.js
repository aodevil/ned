//LIB
import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import { cleanPhoneNumber, componentDidMountDelay} from '../services/functions';
//ELEMENTS
import {ScrollView, View, SafeAreaView} from 'react-native';
import { Text } from 'react-native-elements';
import { ListGroupHeader } from '../user-controls/ListGroupHeader';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { Link } from "../user-controls/Link";
//STYLES
import { CSSView } from '../styles/view';
import { CSSText } from '../styles/text';
import colors from '../styles/colors.json';
//MODEL
import routes from '../providers/routes';
import { Usuario } from '../model/Usuario';
import { CentroHorario, Centro } from '../model/Centro';
import { CENTROSHORARIOS, USUARIOS } from '../services/constants';

class DetallesCentroComponent extends Component{

    //INIT

    constructor(props){
        super(props);
        this.init(props);
    }

    init(props){
        if(Usuario.isAdmin(props, [USUARIOS.coordinador])){
            props.navigation.setParams({onEdit:this._edit});
        }
        this.state = {
            item:props.navigation.getParam("item"),
            mounted:false
        };
    }

    componentDidMount(){
        if(!this.state.item)this.props.navigation.goBack();
        componentDidMountDelay(this);
    }

    //ACTIONS

    _edit = ()=>{
        let {navigation:{navigate}} = this.props;
        let {item} = this.state;
        navigate(routes.CentrosRouter.child.EditarCentro.name,{
            item,
            onUpdate: this._onItemUpdated
        });
    }

    _onItemUpdated = (x) => {
        this.setState({
            item: new Centro(x),
        });
    }

    _showEvents = ()=>{
        let {navigation:{navigate}} = this.props;
        let {item} = this.state;
        navigate(routes.CentrosRouter.child.ActividadesCentro.name,{
            title:item.nombre,
            id:item.ID
        });
    }

    _onSegmentChange = (segment)=>{
        this.setState({segment});
    }

    _onScroll = ({nativeEvent}) => {
        // let isNear = scrollIsNearToBottom(nativeEvent);
    }

    //RENDER

    _mapHorarios = (type) => (x,i) => {
        if (x.tipo === type) {
            return <Text key={`centro-horario-${((type === CENTROSHORARIOS.informes) ? 'informes' : 'instalacion')}-${i}`} style={{paddingBottom:8}}>{`${CentroHorario.daysToString(x)}. ${CentroHorario.hoursToString(x)}`}</Text> 
        }
        return null;
    }

    _mapPhoneNumbers = (x, i) => (
        <Link 
            key={`centro-tel-${i}`}
            title={x.num}
            color={colors.dark}
            url={`tel://+${cleanPhoneNumber(x.num)}`}
            noIcon
            noAlert
        />
    )

    render(){
        const { actividades } = this.props;
        let { item } = this.state;
        const location = Centro.locationToString(item);
        const hasActividades = actividades.filter(x => x.centro === item.ID).length > 0;

        return(
            <SafeAreaView style={CSSView.main}>
                <ScrollView scrollEventThrottle={400} onScroll={this._onScroll}>
                    <View style={[CSSView.container]}>
                        <Text style={CSSText.center} h3>{item.nombre}</Text>

                        <View style={[CSSView.separate,{borderTopColor:colors.light,borderTopWidth:1, paddingTop:15}]}>
                            {!!item.domicilio && <Text>{item.domicilio}</Text>}
                            {!!location && <Text>{location}</Text>}
                        </View>

                        {!!item.email && (
                            <Fragment>
                                <ListGroupHeader title="Correo de contacto" toUpperCase={false}/>
                                <View style={CSSView.separate}>
                                    <Text>{item.email}</Text>
                                </View>
                            </Fragment>
                        )}

                        {(item.telefonos && item.telefonos.length > 0) && (
                            <Fragment>
                                <ListGroupHeader title="Teléfono(s)" toUpperCase={false}/>
                                <View style={CSSView.separate}>
                                    {
                                        item.telefonos.map(this._mapPhoneNumbers)
                                    }
                                </View>
                            </Fragment>
                        )}

                        {(item.horarios && item.horarios.length > 0) && (
                            <Fragment>
                                <ListGroupHeader title="Horarios de instalación" toUpperCase={false}/>
                                <View style={CSSView.separate}>
                                    {
                                        item.horarios.map(this._mapHorarios(CENTROSHORARIOS.instalacion))
                                    }
                                </View>

                                <ListGroupHeader title="Horarios de informes" toUpperCase={false}/>
                                <View style={CSSView.separate}>
                                    {
                                        item.horarios.map(this._mapHorarios(CENTROSHORARIOS.informes))
                                    }
                                </View>
                            </Fragment>
                        )}

                        {(hasActividades) && (
                        <Fragment>
                            <ListGroupHeader title="Actividades" toUpperCase={false} icon={{ name: 'arrow-forward' }} onPress={this._showEvents}/>
                        </Fragment>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}
DetallesCentroComponent.navigationOptions = setHeaderComponent({
    title:routes.CentrosRouter.child.DetallesCentro.title,
    secondary:true,
    root:false
});

export const DetallesCentro = connect(mapStateToProps,mapDispatchToProps)(DetallesCentroComponent);