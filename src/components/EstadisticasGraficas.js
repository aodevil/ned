//LIB
import React, {Component} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
//ELEMENTS
import {ScrollView, View} from 'react-native';
import { Loader} from '../user-controls/Loader';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
//STYLES
import { CSSView } from '../styles/view';
//MODEL
import { componentDidMountDelay} from '../services/functions';
import { ChartKit } from '../user-controls/ChartKit';

class EstadisticasGraficasComponent extends Component{

    //INIT

    constructor(props){
        super(props);
        this.init(props);
    }

    init(props){
        this.state = {
            modal: false,
            mounted: false,
            height: 0,
            charts: props.navigation.getParam("charts") || []
        };
    }

    componentDidMount(){
        componentDidMountDelay(this);
    }

    //RENDER

    _onLayout = ({nativeEvent})=>{
        this.setState({
            height: Math.round(nativeEvent.layout.height / 2)
        });
    }

    _map = (x, i) => {
        const { height } = this.state;
        const { type, title } = x;
        return (
            <ChartKit
                key={`chart-kit-${i}`} 
                title={title}
                type={type}
                data={{
                    ...x
                }}
                height={height}
            />
        );
    }

    render(){
        let { mounted, charts, height } = this.state;
        return(
            <View style={CSSView.container} onLayout={this._onLayout}>
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                    <ScrollView>
                        {
                            height > 0 && charts.map(this._map)
                        }
                    </ScrollView>
                </ScrollView>
                <Loader show={!mounted}/>
            </View>
        );
    }
}
EstadisticasGraficasComponent.navigationOptions = setHeaderComponent({
    secondary:true,
    root:false
});

export const EstadisticasGraficas = connect(mapStateToProps,mapDispatchToProps)(EstadisticasGraficasComponent);