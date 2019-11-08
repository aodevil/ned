import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { CSSView } from '../styles/view';
import { Icon } from './IconComponent';
import colors from '../styles/colors';
import { CSSText } from '../styles/text';

export const Ranking = ({ value, title, subtitle, onChange }) => {
    const [changed, _changed] = useState(false);
    const [ranking, _ranking] = useState(value);
    const items = [...Array(5).keys()];
    const _setValue = (i) => () => {
        if (!changed) _changed(true);
        const x = i === ranking ? i <= 0 ? 0 : i - 1 : i;
        _ranking(x);
    };
    useEffect(() => {
        if (changed) {
            if (onChange) onChange(ranking);
        }
    }, [ ranking ]);
    const _map = (x, i) => {
        const icon = i <= ranking ? 'star' : 'star-outline';
        const iconColor = i <= ranking ? colors.primary : colors.placeholder;
        return (
            <TouchableOpacity key={`ranking-${i}`} style={CSSView.paddingViewSm} onPress={_setValue(i)}>
                <Icon name={icon} color={iconColor}/>
            </TouchableOpacity>
        );
    }
    return (
        <View style={CSSView.center}>
            <View style={CSSView.paddingHeightSm}>
                <Text style={[CSSText.center, CSSText.bold, CSSText.dark, CSSText.fontMd]}>{title}</Text>
                {!!subtitle && (
                    <Text style={[CSSText.center, CSSText.dark, CSSText.fontMd]}>{subtitle}</Text>
                )}
            </View>
            <View style={CSSView.row}>
                { items.map(_map) }
            </View>
        </View>
    );
};
Ranking.defaultProps = {
    value: 0,
    title: 'Califica',
    subtitle: ''
};