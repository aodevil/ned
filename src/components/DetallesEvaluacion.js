//LIB
import React, { Component } from 'react';
import { connect } from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
//ELEMENTS
import { ScrollView, View, SectionList, FlatList, SafeAreaView } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import { ListGroupHeader } from '../user-controls/ListGroupHeader';
import { Loader} from '../user-controls/Loader';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { Icon } from '../user-controls/IconComponent';
//STYLES
import { CSSView } from '../styles/view';
import { CSSList } from '../styles/list';
import colors from '../styles/colors.json';
import { CSSText } from '../styles/text';
//MODEL
import { componentDidMountDelay, rawStr } from '../services/functions';
import { Referencia } from '../model/Referencia';

class DetallesEvaluacionComponent extends Component{

    //  INIT

    constructor(props){
        super(props);
        try {
            this.init(props);   
        } catch (error) {
            props.navigation.goBack();
        }
    }

    init(props){
        const { navigation } = props;
        const item = navigation.getParam("item");
        this.source = navigation.getParam("source");
        const sexo = navigation.getParam("sexo");
        const evaluaciones = Referencia.group(props[this.source], item, false);
        const resultados = this.calculate(sexo, evaluaciones, this.source);
        this.state = {
            mounted:false,
            fecha: item.fecha,
            evaluador: item.evaluador,
            evaluaciones,
            sexo,
            resultados: { ...resultados }
        };
        this.onWillBlur = navigation.getParam("willBlur");
        if (this.onWillBlur) {
            this.willBlurSubscription = this.props.navigation.addListener('willBlur', this.onWillBlur);
        }
    }

    componentDidMount(){
        componentDidMountDelay(this,()=>{
            const { fecha } = this.state;
            if(!fecha) navigation.goBack();
        });
    }

    componentWillUnmount () {
        if (this.willBlurSubscription) {
            this.willBlurSubscription.remove();
        }
    }

    //  ACTIONS
    calculate = (sexo, evaluaciones, source) => {
        
        const reduced = Referencia.reduce(evaluaciones, true);

        let items = {};
        
        reduced.forEach(item => {
            const { evaluacion, valor } = item;
            items[rawStr(evaluacion)] = valor; 
        });

        if (source == 'referencias') {
            return Referencia.calculatePruebas(items, sexo);
        } else {
            return Referencia.calculateMediciones(items, sexo);
        }
    }

    //  RENDER
    _renderRow = ({ item, index, section }) => {
        let result = null;
        if (this.source === 'referencias') {
            result = (!!item.valor || item.evaluacion === 'Flexibilidad') ? Referencia.getResult(item) : { name: 'remove', color: colors.light };
        }
        if (result) {
            return (
                <ListItem
                    title={item.evaluacion}
                    titleStyle={CSSText.dark}
                    rightTitle={`${!!item.valor ? item.valor : 0} ${!!item.unidad ? item.unidad.substring(0,3) : ''}`}
                    rightTitleStyle={[CSSText.dark, CSSText.bold]}
                    rightIcon={<Icon {...result} />}
                />
            );
        } else {
            return (
                <ListItem
                    hideChevron
                    title={item.evaluacion}
                    titleStyle={CSSText.dark}
                    rightTitle={`${!!item.valor ? item.valor : 0} ${!!item.unidad ? item.unidad.substring(0,3) : ''}`}
                    rightTitleStyle={[CSSText.dark, CSSText.bold]}
                />
            );
        }
    }

    _renderHeader = ({section: {title}}) => (
        <ListGroupHeader title={title}/>
    );

    _keyExtractor = (x,i)=>{
        return `evaluacion-item-${x.ID}`;
    }

    _renderRowResultados = ({ item, index, section }) => {
        const { resultados } = this.state;
        const x = resultados[item];
        const [label, unit] = Referencia.RESULTS_LABELS[item];
        return (
            <ListItem
                hideChevron
                title={label}
                titleStyle={CSSText.dark}
                rightTitle={`${x.toFixed(2)} ${unit}`}
                rightTitleStyle={[CSSText.dark, CSSText.bold]}
            />
        );
    }

    _keyExtractorResultados = (x,i)=>{
        return `evaluacion-item-${x}`;
    }

    render(){
        const { mounted, evaluaciones, resultados } = this.state;
        const resultadosKeys = Object.keys(resultados);
        return(
            <SafeAreaView style={CSSView.main}>
                <ScrollView>
                    <View style={CSSView.padding}>
                        <List containerStyle={[CSSList.noLines, CSSView.flex, CSSList.noMargin]}>
                            <SectionList
                                sections={evaluaciones}
                                renderItem={this._renderRow}
                                renderSectionHeader={this._renderHeader}
                                keyExtractor={this._keyExtractor}
                            />
                        </List>
                        <ListGroupHeader title="Resultados" style={CSSView.separateTop} secondary/>
                        <List containerStyle={[CSSList.noLines, CSSView.flex, CSSList.noMargin]}>
                            <FlatList
                                data={resultadosKeys}
                                keyExtractor={this._keyExtractorResultados}
                                renderItem={this._renderRowResultados}
                            />
                        </List>
                    </View>
                </ScrollView>
                <Loader show={!mounted}/>
            </SafeAreaView>
        );
    }
}
DetallesEvaluacionComponent.navigationOptions = setHeaderComponent({
    secondary:true,
    root:false
});

export const DetallesEvaluacion = connect(mapStateToProps,mapDispatchToProps)(DetallesEvaluacionComponent);