//LIB
import React, {Component} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import routes from '../providers/routes';
import { componentDidMountDelay } from '../services/functions';
//VIEWS
import { Recomendaciones } from './EvaluacionRecomendaciones';
//ELEMENTS
import { setHeaderComponent } from '../user-controls/HeaderTitle';

class AlumnoInicioRecomendacionesComponent extends Component{

    constructor(props){
        super(props);
        let { usuario : alumno } = props;
        this.state = {
            mounted:false,
            alumno,
            recomendaciones: [],
            loadRecommendations: true
        };
    }

    componentDidMount() {
        componentDidMountDelay(this);
    }

    componentWillUnmount() {
        this.setState({ mounted: false });
    }

    //ACTIONS
    _updateRecommendations = (recomendaciones) => {
        this.setState({
            recomendaciones: [ ...recomendaciones ],
            loadRecommendations: false
        });
    }
    _loadRecommendations = (load) => {
        this.setState({ loadRecommendations: load });
    }

    //RENDER
      
    render(){
        const { loadRecommendations, alumno, recomendaciones } = this.state;
        return(
            <Recomendaciones {...this.props} alumno={alumno} recomendaciones={recomendaciones} onUpdate={this._updateRecommendations} onFetch={this._loadRecommendations} fetchOnLoad={loadRecommendations} />
        );
    }
}
AlumnoInicioRecomendacionesComponent.navigationOptions = setHeaderComponent({
    title: routes.InicioRouter.child.AlumnoInicioRecomendaciones.title,
    root: false,
    secondary: true
});

export const AlumnoInicioRecomendaciones = connect(mapStateToProps,mapDispatchToProps)(AlumnoInicioRecomendacionesComponent);
