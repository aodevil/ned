import React, { useState, useEffect } from "react";
//STYLES
import colors from '../styles/colors.json';
//ELEMENTS
import { StyleSheet, Dimensions, ScrollView, Text, View } from 'react-native';
import { BarChart, StackedBarChart } from "react-native-chart-kit";
import { CSSText } from "../styles/text.js";
import { CSSView } from "../styles/view.js";
import { Icon } from "./IconComponent.js";

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    chart: {
        flex: 1
    }
});

const chartConfig = {
    backgroundColor: colors.white,
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 1,
    color: () => colors.primary,
    labelColor: () => colors.secondary,
    propsForLabels: {
        fontWeight: 'bold'
    }
}

const mapLegend = (x, i) => {
    return (
        <View style={CSSView.row} key={`chart-legend-${x}`}>
            <Icon name="arrow-dropright-circle" size={15} color={colors.primary} />
            <Text style={[CSSView.flex, CSSView.paddingViewSm]}>{x}</Text>
        </View>
    )
}

export const ChartKit = ({ data, height, width, title, type = 'bar' }) => {
    const [w, _width] = useState(0);
    const [h, _height] = useState(0);
    
    //  HOOKS
    useEffect(() => {
        _width((width || Dimensions.get('screen').width));
    }, [width]);

    useEffect(() => {
        _height((height || Dimensions.get('screen').height))
    }, [height]);

    //  RENDER
    return (
        <>
            {!!title && <Text style={[CSSView.paddingHeightSm, CSSText.bold, CSSText.fontMd, CSSText.center]}>{title}</Text>}
            { type === 'bar' && !!data.legend && (
                <View style={CSSView.paddingHeightSm}>
                    {data.legend.map(mapLegend)}
                </View>
            )}
            <ScrollView style={styles.container} horizontal showsHorizontalScrollIndicator={false}>
                { type === 'bar' && (
                    <BarChart 
                        style={styles.chart} 
                        data={data} 
                        width={w} 
                        height={h}
                        chartConfig={chartConfig}
                        verticalLabelRotation={data.verticalLabelRotation}
                        fromZero
                    />
                )}
                { type === 'stacked' && (
                    <StackedBarChart
                        style={styles.chart}
                        data={data}
                        width={w}
                        height={h}
                        chartConfig={chartConfig}
                    />
                )}
            </ScrollView>
        </>
    );
}