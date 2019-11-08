import React, { Component } from 'react';
import {withNavigation} from 'react-navigation';
import { SafeAreaView, View, TouchableOpacity, Platform } from 'react-native';
import { CSSView } from '../styles/view';
import colors from '../styles/colors';
import { Icon } from './IconComponent';
import { compareValues } from '../services/functions';

class TabsComponent extends Component {
    //  INIT
    
    constructor(props) {
        super(props);
        this.state = {
            tab: 0
        };
    }

    shouldComponentUpdate (props, state) {
        if (
            this.props.loading !== props.loading ||
            this.props.network !== props.network ||
            this.state.tab !== state.tab ||
            !compareValues(this.props.indicators, props.indicators)
        ) return true;
        return false;
    }
    
    //  ACTIONS

    _change = (tab) => () => {
        const { tab: current } = this.state;
        if (tab === current) return;
        this.setState({
            tab
        });
    }

    //  RENDER

    _map = (x, i) => {
        const { tab } = this.state;
        const { indicators } = this.props;
        const active = tab === i;
        const indicator = !!indicators[i];
        return (
            <View key={`tab-${i}`} style={[CSSView.flex, CSSView.center, CSSView.paddingSm, { paddingBottom: 15, opacity: active ? 1 : 0.3 }]}>
                <TouchableOpacity style={[CSSView.paddingView, CSSView.relative]} onPress={this._change(i)}>
                    <Icon name={x.icon} color={colors.white} />
                    {indicator && (
                    <View style={CSSView.rightTop}>
                        <Icon name='alert' size={15} color={colors.danger} />
                    </View>
                    )}
                </TouchableOpacity>
            </View>
        );
    }

    _tab = () => {
        const { tab } = this.state;
        const { components } = this.props;
        const Selected = components[tab].component;
        const props = {
            ...this.props
        }
        delete props.components;
        return <Selected {...props} />
    }

    render () {
        const { components } = this.props;
        return (
            <SafeAreaView style={[CSSView.main, { backgroundColor: colors.secondary }]}>
                    { this._tab() }
                    <View style={[CSSView.noGrow, { backgroundColor: colors.secondary, zIndex: -1, position: 'relative' }]}>
                        <View style={CSSView.row}>
                            {
                                components.map(this._map)
                            }
                        </View>
                    </View>
            </SafeAreaView>
        )
    }
}

export const Tabs = withNavigation(TabsComponent);