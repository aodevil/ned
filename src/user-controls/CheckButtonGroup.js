import React, { Component } from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import * as colors from "../styles/colors";
import { CSSView } from '../styles/view';
import { CSSForms } from '../styles/forms';

const styles = StyleSheet.create({
    button: {
        borderColor: colors.light,
        backgroundColor: colors.clear,
        borderWidth: 1,
        borderRadius: 15,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 8,
        paddingRight: 8,
        marginRight: 5,
        marginBottom: 8
    },
    primaryActiveButton: {
        borderColor: colors.primary,
        backgroundColor: colors.primary
    },
    secondaryActiveButton: {
        borderColor: colors.secondary,
        backgroundColor: colors.secondary
    },
    activeButtonText: {
        color: colors.white
    }
})

const CheckButton = ({ onPress, item, index, primary }) => (
    <TouchableOpacity onPress={onPress(item, index)}>
        <View style={[styles.button, item.active && (primary ? styles.primaryActiveButton : styles.secondaryActiveButton)]}>
            <Text style={item.active && styles.activeButtonText}>{item.label}</Text>
        </View>
    </TouchableOpacity>
);

export class CheckButtonGroup extends Component{

    constructor(props) {
        super(props);
        const { options: items, defaultActive } = props;
        let options = [];
        let index = 0;
        for (let i of items) {
            options.push({
                label: i,
                active: Array.isArray(defaultActive) ? defaultActive.indexOf(index) >= 0 : defaultActive === index,
            });
            index++;
        }
        this.state = {
            options
        }
    }

    _onChange = (x, i) => () => {
        const { onChange } = this.props;
        const { options: items } = this.state;
        let options = [ ...items ];
        let item = { ...x };
        item.active = !x.active;
        options[i] = item;
        this.setState({
            options
        }, () => {
            let active = [];
            let indexes = [];
            let index = 0;
            for (let i of options) {
                if (i.active) {
                    active.push(i.label);
                    indexes.push(index);
                }
                index++;
            }
            onChange(active, indexes);
        });
    }

    _onPress = (x, i) => () => {
        const { onPress, name } = this.props;
        const { options: items } = this.state;
        let options = [ ...items ];
        options.forEach(e => {
            e.active = false;
        });
        let item = { ...x };
        item.active = !x.active;
        options[i] = item;
        this.setState({
            options
        }, () => {
            onPress(name, { ...item, index: i });
        });
    }

    _mapOptions = (x, i) => {
        const { name, onChange, onPress, primary } = this.props;
        if (onChange) {
            return (
                <CheckButton
                    key={`${name}-${i}`}
                    item={x}
                    index={i}
                    onPress={this._onChange}
                    primary={primary}
                />
            );
        } else if (onPress) {
            return (
                <CheckButton
                    key={`${name}-${i}`}
                    item={x}
                    index={i}
                    onPress={this._onPress}
                    primary={primary}
                />
            );
        }
        return null;
    }
    
    render(){
        const { noMargin } = this.props;
        const { options } = this.state;
        return(
            <View style={[!noMargin && CSSForms.separate, CSSView.flex, CSSView.wrap]}>
                { options.map(this._mapOptions) }
            </View>
        );
    }
}
CheckButtonGroup.defaultProps = {
    noMargin:false,
    options: [],
    defaultActive: [],
}