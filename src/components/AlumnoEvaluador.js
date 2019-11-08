//LIB
import React, {Component} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import moment from 'moment';
//ELEMENTS
import {View, Text } from 'react-native';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import Card from '../user-controls/Card';
import { Grid } from '../user-controls/Grid';
import { Icon } from '../user-controls/IconComponent';
//STYLES
import { CSSView } from '../styles/view';
import { CSSText } from '../styles/text';
import colors from '../styles/colors';
//MODEL
import routes from '../providers/routes';
import { Usuario } from '../model/Usuario';
import { ACTIONS, SEXO } from '../services/constants';
import { ROUTES } from '../services/post';

class AlumnoEvaluadorComponent extends Component{

    constructor(props){
        super(props);
        let {navigation} = props;
        this.state = {
            alumno: new Usuario(navigation.getParam("item")),
            historial: {
                pruebas: [],
                mediciones: []
            }
        };
    }

    componentDidMount(){
        this.load();
    }

    load = ()=>{
        const { network, token, onLoading } = this.props;
        const { alumno } = this.state;

        if (!network) return;

        onLoading(true, (resolve) => {
            try {
                Usuario.fetch(network, ROUTES.ALUMNO, ACTIONS.select + 'evaluaciones', {
                    alumno: alumno.ID
                }, token, (response) => {
                    let { error, data } = response;
                    if (error) {
                        resolve();
                        return;
                    }
                    this.setState({
                        historial: this.groupItems(data)
                    }, resolve);
                });   
            } catch (error) {
                resolve();
            }
        });
    }

    groupItems = (items) => {
        const historial = {
            pruebas: items ? items.filter(x=> x.rol === 'pruebas') : [],
            mediciones: items ? items.filter(x=> x.rol === 'mediciones') : []
        };
        return historial;
    }

    //RENDER

    render(){
        const { loading } = this.props;
        const { alumno, historial } = this.state;
        if (!alumno) return <></>;
        const { activo, evaluacion, nacimiento, sexo, validada, actividades, eventos } = alumno;
        const edad = moment().diff(moment(nacimiento), 'year');
        const columns = [
            <Card>
                <Text style={CSSText.title}>Cuenta activa</Text>
                <View style={CSSView.center}>
                    <Icon name={activo ? 'checkmark' : 'close'} color={activo ? colors.success : colors.danger} size={50} />
                </View>
            </Card>,
            <Card>
                <Text style={CSSText.title}>Validada</Text>
                <View style={CSSView.center}>
                    <Icon name={validada ? 'checkmark' : 'close'} color={validada ? colors.success : colors.danger} size={50} />
                </View>
            </Card>,
            <Card>
                <Text style={CSSText.title}>Edad</Text>
                <View style={CSSView.paddingSm}>
                    <Text style={[CSSText.center, CSSText.fontMd]}>{edad} años</Text>
                </View>
            </Card>,
            <Card>
                <Text style={CSSText.title}>Sexo</Text>
                <View style={CSSView.center}>
                    <Icon name={sexo === SEXO.M ? 'man' : 'woman'} color={colors.secondary} size={35} />
                </View>
            </Card>,
            <Card>
                <Text style={CSSText.title}>Actividades</Text>
                <View style={CSSView.paddingSm}>
                    <Text style={[CSSText.center, CSSText.fontMd]}>{actividades.length}</Text>
                </View>
            </Card>,
            <Card>
                <Text style={CSSText.title}>Eventos</Text>
                <View style={CSSView.paddingSm}>
                    <Text style={[CSSText.center, CSSText.fontMd]}>{eventos.length}</Text>
                </View>
            </Card>,
            <Card>
                <Text style={CSSText.title}>Evaluaciones</Text>
                <View style={[CSSView.paddingSm, CSSView.row]}>
                    <View style={[CSSView.row, CSSView.flex]}>
                        <View style={[CSSView.noGrow, CSSView.paddingSm]}>
                            <Icon name="body" color={colors.secondary} size={20} />
                        </View>
                        <Text style={[CSSView.flex, CSSText.fontMd]}>Pruebas: {loading ? '...' : historial.pruebas.length}</Text>
                    </View>
                    <View style={[CSSView.row, CSSView.flex]}>
                        <View style={[CSSView.noGrow, CSSView.paddingSm]}>
                            <Icon name="nutrition" color={colors.secondary}  size={20} />
                        </View>
                        <Text style={[CSSView.flex, CSSText.fontMd]}>Nutrición: {loading ? '...' : historial.mediciones.length}</Text>
                    </View>
                </View>
                {evaluacion && <Text style={[CSSText.center, CSSText.fontSm, CSSText.placeholder]}>{evaluacion ? `Última evaluación: ${moment(evaluacion.fecha).format('DD/MM/YY')}` : 'Sin registro'}</Text>}
            </Card>,
        ];
        return(
            <Grid
                numColumns={2}
                columns={columns}
            />
        );
    }
}
AlumnoEvaluadorComponent.navigationOptions = setHeaderComponent({
    title:routes.EvaluadoresRouter.child.AlumnosEvaluador.title,
    secondary:true,
    root:false
});

export const AlumnoEvaluador = connect(mapStateToProps,mapDispatchToProps)(AlumnoEvaluadorComponent);
