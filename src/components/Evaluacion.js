//LIB
import React, {Component} from 'react';
import {connect} from "react-redux";
import { BackHandler, Keyboard, Alert } from 'react-native';
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import { ROLES, ALERTS } from '../services/constants';
import { Referencia } from '../model/Referencia';
import routes from '../providers/routes';
import { Usuario } from '../model/Usuario';
import { componentDidMountDelay } from '../services/functions';
//VIEWS
import { Pruebas } from './EvaluacionPruebas';
import { Recomendaciones } from './EvaluacionRecomendaciones';
import { Historial } from './EvaluacionHistorial';
import { ActividadesAlumno } from './EvaluacionActividades';
//ELEMENTS
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { Tabs } from '../user-controls/Tabs';

class EvaluacionComponent extends Component{

    constructor(props){
        super(props);
        let { navigation, usuario, alumnos, referencias, mediciones } = props;
        this.tabComponents = [
            {
                icon: 'body',
                component: this._renderPruebas
            },
            {
                icon: 'clipboard',
                component: this._renderRecomendaciones
            },
            {
                icon: 'stats',
                component: this._renderHistorial
            },
            {
                icon: 'calendar',
                component: this._renderActividades
            },
        ];
        const ID = navigation.getParam('item');
        const alumno = alumnos.find(x => x.ID === ID);
        const type = parseInt(usuario.rol);
        this.state = {
            mounted:false,
            changes: 0,
            type,
            alumno,
            evaluaciones: Referencia.group((type === ROLES.entrenador ? referencias : mediciones), alumno.evaluacion),
            parametros: Referencia.group(referencias.concat(mediciones)),
            recomendaciones: [],
            historial: {pruebas: [], mediciones: []},
            loadRecommendations: true,
            loadHistory: true,
        };
    }

    componentDidMount() {
        const { navigation } = this.props;
        const resolve = navigation.getParam('resolve');
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        componentDidMountDelay(this, resolve);
    }

    componentWillUnmount() {
        this.backHandler.remove();
        this.setState({
            mounted: false
        });
    }

    //ACTIONS
    goBack = async () => {
        Keyboard.dismiss();
        const { navigation } = this.props;
        Alert.alert(ALERTS.leave.title, ALERTS.leave.text.unsaved, [
            { text: ALERTS.leave.text.cancel, onPress: void 0 },
            { text: ALERTS.leave.text.accept, onPress: navigation.goBack }
        ]);
    }

    handleBackPress = () => {
        const { changes } = this.state;
        if (changes > 0) { 
            this.goBack();
            return true;
        }
        return false;
    }

    _updateEval = (item) => {
        const { changes, evaluaciones } = this.state;
        let items = JSON.parse(JSON.stringify(evaluaciones));
        items.forEach(section => {
            if (section.title === item.grupo) {
                section.data.forEach(i => {
                    if (i.ID === item.ID) {
                        i.valor = item.valor;
                    }
                });
            }
        });
        this.setState({
            evaluaciones: items,
            changes: changes + 1
        }, () => {
            const { navigation } = this.props;
            navigation.setParams({ changes: this.state.changes });
        });
    }

    _updateRecommendations = (recomendaciones) => {
        this.setState({
            recomendaciones: [ ...recomendaciones ],
            loadRecommendations: false
        });
    }

    _updateHistory = (historial) => {
        this.setState({
            historial: JSON.parse(JSON.stringify(historial)),
            loadHistory: false
        });
    }

    _loadRecommendations = (load) => {
        this.setState({ loadRecommendations: load });
    }

    _loadHistory = (load) => {
        this.setState({ loadHistory: load });
    }

    _update = (alumno, resetChanges = false) => {
        const { mounted, changes, loadHistory } = this.state;
        if (alumno && mounted) {
            const replace = new Usuario(alumno);
            this.setState({
                alumno: replace,
                changes: resetChanges ? 0 : changes,
                loadHistory: resetChanges ? true : loadHistory
            }, () => {
                if (resetChanges) {
                    const { navigation } = this.props;
                    navigation.setParams({ changes: 0 });   
                }
            });
        }
    }

    //RENDER
    _renderPruebas = (props) => {
        const { onLoading, onUpdateAlumno} = this.props;
        return (
            <Pruebas {...props} onChange={this._updateEval} onLoading={onLoading} onUpdate={this._update} onUpdateAlumno={onUpdateAlumno} />
        );
    }
    _renderRecomendaciones = (props) => {
        const { onLoading, loading } = this.props;
        const { loadRecommendations } = this.state;
        return (
            <Recomendaciones {...props} onLoading={onLoading} loading={loading} onUpdate={this._updateRecommendations} onFetch={this._loadRecommendations} fetchOnLoad={loadRecommendations} />
        );
    }
    _renderHistorial = (props) => {
        const { onLoading, loading } = this.props;
        const { loadHistory } = this.state;
        return (
           <Historial {...props} onLoading={onLoading} loading={loading} onUpdate={this._updateHistory} onFetch={this._loadHistory} fetchOnLoad={loadHistory} />
        );
    }
    _renderActividades = (props) => {
        const { actividades, eventos } = this.props;
        return (
            <ActividadesAlumno {...props} actividades={actividades} eventos={eventos} onUpdate={this._update} />
        );
    }

    render(){
        const { network, usuario, token, loading } = this.props;
        const { changes } = this.state;
        const indicators = changes > 0 ? [true] : [];
        return(
            <Tabs 
                loading={loading}
                network={network}
                usuario={usuario}
                token={token}
                {...this.state}
                components={this.tabComponents}
                indicators={indicators}
            />
        );
    }
}
EvaluacionComponent.navigationOptions = setHeaderComponent({
    title:routes.EvaluacionRouter.child.Evaluacion.title,
    root: false,
    secondary: true,
    trackChanges: true
});

export const Evaluacion = connect(mapStateToProps,mapDispatchToProps)(EvaluacionComponent);
