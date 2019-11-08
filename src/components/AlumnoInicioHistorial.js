//LIB
import React, {Component} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import { Referencia } from '../model/Referencia';
import routes from '../providers/routes';
import { componentDidMountDelay } from '../services/functions';
//VIEWS
import { Historial } from './EvaluacionHistorial';
//ELEMENTS
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { setStorage, storageKeys } from '../services/storage';

class AlumnoInicioHistorialComponent extends Component{

    constructor(props){
        super(props);
        let { usuario : alumno, referencias, mediciones } = props;
        this.state = {
            mounted:false,
            alumno,
            parametros: Referencia.group(referencias.concat(mediciones)),
            historial: {pruebas: [], mediciones: []},
            loadHistory: true,
        };
    }

    componentDidMount() {
        componentDidMountDelay(this);
    }

    componentWillUnmount() {
        this.setState({ mounted: false });
    }

    //ACTIONS
    _loadHistory = (load) => {
        this.setState({ loadHistory: load });
    }

    _updateHistory = (historial) => {
        this.setState({
            historial: JSON.parse(JSON.stringify(historial)),
            loadHistory: false
        }, () => {
            let data = {
                pruebas: historial.pruebas.slice(0,15),
                mediciones: historial.mediciones.slice(0,15)
            };
            setStorage(storageKeys.alumno_evaluaciones, JSON.stringify(data));
        });
    }

    //RENDER
      
    render(){
        const { loadHistory, alumno, parametros, historial } = this.state;
        return(
            <Historial {...this.props} alumno={alumno} parametros={parametros} historial={historial} onFetch={this._loadHistory} fetchOnLoad={loadHistory} onUpdate={this._updateHistory} />
        );
    }
}
AlumnoInicioHistorialComponent.navigationOptions = setHeaderComponent({
    title: routes.InicioRouter.child.AlumnoInicioHistorial.title,
    root: false,
    secondary: true
});

export const AlumnoInicioHistorial = connect(mapStateToProps,mapDispatchToProps)(AlumnoInicioHistorialComponent);
