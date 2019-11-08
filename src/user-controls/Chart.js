import React, {Component} from "react";
//ELEMENTS
import { View } from "react-native";
import PureChart from 'react-native-pure-chart';

export class Chart extends Component{


    //ACTIONS

    _onPress = (index)=>{
        let {onPress} = this.props;
        if(onPress)onPress(index);
    }

    //RENDER

    render() {
        let { height, data, type, customValueRenderer, numberOfYAxisGuideLine } = this.props;
        return (
            height?<View style={{marginTop:20}}>

                <PureChart 
                    data={data} 
                    height={height}
                    type={type}
                    onPress={this._onPress}
                    numberOfYAxisGuideLine={numberOfYAxisGuideLine}
                    customValueRenderer={customValueRenderer}
                />

            </View>:null
        );
    }
}
Chart.defaultProps = {
    type:"bar",
    height:0,
    data:[],
    customValueRenderer:null,
    numberOfYAxisGuideLine:5
}

// let sampleData = [{
//     seriesName: 'series1',
//     data: [
//     {x: '1', y: 30},
//     {x: '2', y: 200},
//     {x: '3', y: 170},
//     {x: '4', y: 250},
//     {x: '5', y: 10},
//     {x: '5', y: 10}
//     ],
//     color: colors.blue
// }];

// _customValueRenderer = (index, point) => {
//     return (
//         <TouchableOpacity onPress={this._onSelectColumn.bind(this,index)} style={{alignSelf:"center", transform:[{ translateY: 50 }]}}>
//         <Badge style={{backgroundColor:colors.secondary }}>
//             <Text style={{fontSize:10}}>{point.y}</Text>
//         </Badge>
//         </TouchableOpacity>
//     );
// }

// _onSelectColumn = (index)=>{
//     let {navigation:{navigate}} = this.props;
//     let {filteredMeasurements} = this.state;
//     if(filteredMeasurements){
//         let item = filteredMeasurements[index].c;
//         navigate(routes.consulta.name,{title:Cita.toString(item.date),item});
//     }
// }

// _onContainerLayout = ({nativeEvent})=>{
//     this.setState({
//         height:nativeEvent.layout.height - 200
//     });
// }
