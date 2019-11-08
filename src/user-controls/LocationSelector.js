import React, { Component, Fragment } from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import { componentDidMountDelay } from '../services/functions';
import errors from '../services/errors';
//MODEL
import { Centro } from '../model/Centro';
import { ROUTES } from '../services/post';
import { ACTIONS } from '../services/constants';
//ELEMENTS
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import { TextInput } from './TextInput';
import { OverlayModal } from './OverlayModal';
import { ListItem } from 'react-native-elements';
import Toast from 'react-native-root-toast';
import { Icon } from './IconComponent';
import { CSSText } from '../styles/text';
import { CSSView } from '../styles/view';
import colors from '../styles/colors.json';
import sizes from '../styles/sizes.json';


const styles = StyleSheet.create({
    button: {
        borderWidth: 1,
        borderColor: colors.light,
        borderRadius: 5,
        padding: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.clear,
        height: 40,
        marginTop: 9
    },
    textButton: {
        marginLeft: 8
    },
    searchButton: {
        paddingLeft: 11,
        paddingRight: 11,
    },
    readOnly: {
        borderBottomColor: colors.light,
        borderBottomWidth: 1,
        paddingTop: 15,
        paddingBottom: 15,
        fontSize: 14
    },
    readOnlyText: {
        fontSize: sizes.font.md,
        color: colors.dark
    },
    placeholder: {
        color: colors.light
    }
});

class LocationSelectorComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            mounted: false,
            showOptions: false
        };
    }

    componentDidMount() {
        const { mountDelay } = this.props;
        componentDidMountDelay(this, () => {
            const { centros } = this.props;
            if (!centros || centros.length <= 0) this.load(); 
            else this.setDefaultLocation();
        }, mountDelay + 350);
    }

    componentWillUnmount() {
        this.setState({
            mounted: false
        });
    }

    load = async () => {
        const { mounted } = this.state;
        const { network, token, onLoadCentros } = this.props;
        if (!mounted) return;
        this.setState({
            loading: true,
        }, () => {
            Centro.fetch(network, ROUTES.CENTRO, ACTIONS.select, {}, token, (response) => {
                if(!response || response.error) {
                    this.setState({
                        loading: false,
                    }, () => {
                        Toast.show(response.error || errors.connection, { duration: 1500, shadow: false });
                    });
                } else {
                    onLoadCentros(response.data, () => {
                        this.setState({
                            loading: false,
                        }, this.setDefaultLocation);
                    });
                }
            });
        });
    }

    setDefaultLocation = () => {
        const { defaultValue, centros } = this.props;
        if (defaultValue && centros) {
            const location = centros.find(x => x.ID === defaultValue);
            if (location) this._onSelect(location)();
        }
    }

    _setState = (prop) => (value)=>{
        const { onChange } = this.props;
        onChange({
            [prop]: value
        });
    }

    _onSelect = (item) => () => {
        const { onChange, nameOnly } = this.props;
        this.setState({
            showOptions: false,
        }, () => {
            const location = Centro.locationToString(item);
            const lugar = nameOnly ? `${item.nombre}` : `${item.nombre} - ${location}`;
            onChange({
                centro: item.ID,
                lugar,
            });
        });
    }

    _toggleOptions = () => {
        this.setState(({ showOptions }) => ({
            showOptions: !showOptions,
        }));
    }

    _renderItem = ({ item: x, index: i }) => {
        const { subtitles } = this.props;

        if (subtitles) {
            const location = Centro.locationToString(x);
            return (
                <ListItem title={x.nombre} subtitle={location} subtitleNumberOfLines={2} onPress={this._onSelect(x)} hideChevron/>
            );
        } else {
            return (
                <ListItem title={x.nombre} onPress={this._onSelect(x)} hideChevron/>
            );
        }
    }

    _keyExtractor = (x,i) => {
        return `location-selector-${x.ID}`;
    }

    render () {
        const { marginTop, value, centros, pos, placeholder, readOnly } = this.props;
        const { loading, showOptions, mounted } = this.state;
        return (
            <View style={{ marginTop }}>
                {
                    (!centros || centros.length <= 0 || !mounted) ? (
                        <TouchableOpacity style={styles.button} onPress={this.load} disabled={loading}>
                            {(loading || !mounted) ? (
                                <Fragment>
                                    <ActivityIndicator color={colors.dark} />
                                    <Text style={[CSSText.center, styles.textButton]}>Cargando centros...</Text>   
                                </Fragment>
                            ) : (
                                <Fragment>
                                    <Icon name='refresh' size={20} />
                                    <Text style={[CSSText.center, styles.textButton]}>No se han cargado los centros.</Text>   
                                </Fragment>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <Fragment>
                            <View style={CSSView.row}>
                                {
                                    readOnly ? (
                                        <TouchableOpacity style={[CSSView.flex, styles.readOnly]} onPress={this._toggleOptions}>
                                            <Text style={[styles.readOnlyText, !value && styles.placeholder]}>{value || placeholder}</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={CSSView.flex}>
                                            <TextInput styles={[CSSText.left]} pos={pos} isLast noMargin value={value} onChangeText={this._setState('lugar')} placeholder={placeholder} />
                                        </View>
                                    )
                                }
                                <TouchableOpacity style={styles.searchButton} onPress={this._toggleOptions}>
                                    <Icon name="list-box" />
                                </TouchableOpacity>
                            </View>
                            <OverlayModal visible={showOptions} dismiss={this._toggleOptions} dismissLabel="Cerrar" dismissColor={colors.dark} divider={false}>
                                <FlatList 
                                    data={centros}
                                    renderItem={this._renderItem}
                                    keyExtractor={this._keyExtractor}
                                />
                            </OverlayModal>
                        </Fragment>
                    )
                }
            </View>
        );
    }
}
LocationSelectorComponent.defaultProps = {
    pos: -1,
    marginTop: 0,
    value: '',
    placeholder: 'Domicilio (calle, número ext. - int., colonia, c. p.',
    readOnly: false,
    subtitles: true,
    defaultValue: null,
    mountDelay: 0,
    nameOnly: false

}

export const LocationSelector = connect(mapStateToProps,mapDispatchToProps)(LocationSelectorComponent);