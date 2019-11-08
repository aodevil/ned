//LIB
import React, {Component} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import routes from '../providers/routes';
import { componentDidMountDelay } from '../services/functions';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import moment from 'moment';
import { Usuario } from '../model/Usuario';
import { ROUTES } from '../services/post';
import { ACTIONS, ALERTS } from '../services/constants';
//ELEMENTS
import { FlatList, View, Text, Alert } from 'react-native';
import { RefreshView } from '../user-controls/RefreshView';
import { List, ListItem } from 'react-native-elements';
import { Icon } from '../user-controls/IconComponent';
import { OverlayModal } from '../user-controls/OverlayModal';
import { Ranking } from '../user-controls/Ranking';
//STYLES
import colors from '../styles/colors';
import { CSSView } from '../styles/view';
import { CSSText } from '../styles/text';
import { CSSList } from '../styles/list';

class AlumnoInicioCalificacionesComponent extends Component{

    constructor(props){
        super(props);
        this.state = {
            mounted:false,
            historial: [],
            modal: false,
            ranking: 0,
            selected: null
        };
    }

    componentDidMount() {
        componentDidMountDelay(this, this._load);
    }

    componentWillUnmount() {
        this.setState({ mounted: false });
    }

    //ACTIONS
    load = (resolve)=>{
        let { network, token, usuario } = this.props;
        Usuario.fetch(network, ROUTES.ALUMNO, ACTIONS.select + 'evaluaciones', {
            alumno: usuario.ID,
            ranking: true
        }, token, async (response) => {
            let { error, data } = response;
            if (error) {
                Alert.alert(null, error, [
                    { text: 'Aceptar', onPress: resolve }
                ]);
                return;
            }
            this.setState({
                historial: data
            }, resolve);
        });
    }

    _refresh = (resolve) => {
        this.load(resolve);
    }

    _load = () => {
        const { onLoading } = this.props;
        onLoading(true, (resolve) => {
            this.load(resolve);
        });
    }

    _select = (selected) => () => {
        this.setState({
            modal: true,
            selected
        });
    }

    _toggleModal = () => {
        this.setState(({ modal }) => ({ modal: !modal }));
    }

    _setRanking = (ranking) => {
        this.setState({ ranking });
    }

    _submit = () => {
        const { network, token, onLoading } = this.props;
        const { selected, ranking, historial: state } = this.state;
        if (!network) {
            Alert.alert(null, ALERTS.response.text.network);
            return;
        }

        onLoading(true, (resolve) =>{
            Usuario.fetch(network, ROUTES.ALUMNO, ACTIONS.insert + 'ranking', {
                ID: selected.ID, 
                centro: selected.centro,
                evaluador: selected.evaluador,
                ranking,
                fecha: moment().valueOf()
            }, token, (response) => {
                const { error } = response;
                if (error) {
                    Alert.alert(null, error, [
                        {
                            text: 'Aceptar',
                            onPress: resolve
                        }
                    ]);
                    return;
                }
                const historial = JSON.parse(JSON.stringify(state));
                historial.forEach(item => {
                    if (item.ID === selected.ID) {
                        item.ranking = ranking;
                    }
                });
                this.setState({
                    historial,
                    modal: false,
                    ranking: 0,
                    selected: null
                }, resolve);
            });
        });
    }

    //RENDER
    
    _renderItem = ({ item, index }) => {
        const { rol, evaluadorNombre, fecha, ranking: _ranking } = item;
        const ranking = _ranking !== null ? _ranking : -1
        const title = rol === 'mediciones' ? 'Evaluación nutricional' : 'Evaluación física';
        const date = moment(parseInt(fecha)).format('DD/MM/YYYY');
        const icon = ranking >= 0 ? 'star' : 'star-outline';
        const iconColor = ranking >= 0 ? colors.primary : colors.placeholder;
        const rightTitle = ranking >= 0 ? ranking + 1 : ' ';
        return (
            <ListItem
                title={title}
                titleStyle={CSSText.bold}
                titleContainerStyle={CSSList.fullWidth}
                subtitle={
                    <View style={CSSView.paddingViewSm}>
                        <Text style={[CSSText.fontMd, CSSText.dark]}>{evaluadorNombre}</Text>
                        <Text style={[CSSText.fontMd, CSSText.dark]}>{date}</Text>
                    </View>
                }
                rightTitle={`${rightTitle}`}
                rightTitleStyle={CSSText.placeholder}
                rightIcon={(
                    <Icon name={icon} color={iconColor} size={20} />
                )}
                onPress={this._select(item)}
            />
        );
    }

    _keyExtractor = (x, i) => {
        return `evaluacion-${x.ID}`;
    }

    render(){
        const { loading, network } = this.props;
        const { historial, mounted, modal, selected } = this.state;
        return(
            <>
                <RefreshView onRefresh={this._refresh}>
                    <View style={CSSView.container}>
                        <List containerStyle={[CSSList.noLines, CSSList.noMargin, CSSView.main]}>
                            <FlatList
                                data={historial}
                                renderItem={this._renderItem}
                                keyExtractor={this._keyExtractor}
                                ListEmptyComponent={(
                                    <View style={CSSView.padding}>
                                        <Text style={CSSText.center}>{(loading || !mounted) ? 'Cargando...' : (!network ? 'No hay conexión a internet.' : 'No se han realizado evaluaciones.')}</Text>
                                    </View>
                                )}
                            />
                        </List>
                    </View>
                </RefreshView>
                <OverlayModal visible={modal} cancel={this._toggleModal} dismiss={this._toggleModal} submit={this._submit} dismissColor={colors.secondary} dismissLabel='Enviar' loading={loading}>
                    <Ranking
                        title="Califica tu experiencia"
                        subtitle="¿Qué tal estuvo tu evaluación?"
                        value={selected ? selected.ranking : 0}
                        onChange={this._setRanking}
                    />
                </OverlayModal>
            </>
        );
    }
}
AlumnoInicioCalificacionesComponent.navigationOptions = setHeaderComponent({
    title: routes.InicioRouter.child.AlumnoInicioCalificaciones.title,
    root: false,
    secondary: true
});

export const AlumnoInicioCalificaciones = connect(mapStateToProps,mapDispatchToProps)(AlumnoInicioCalificacionesComponent);
