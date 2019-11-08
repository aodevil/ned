import React, { Component, Fragment } from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import { componentDidMountDelay } from '../services/functions';
import errors from '../services/errors';
//MODEL
import { Disciplina } from '../model/Disciplina';
//ELEMENTS
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Toast from 'react-native-root-toast';
import { Select } from './Select';
import { Icon } from './IconComponent';
import { CSSText } from '../styles/text';
import colors from '../styles/colors.json';

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
    }
});

class DisciplineSelectorComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            mounted: false,
            options: [],
            value: -1
        };
    }

    componentDidMount() {
        componentDidMountDelay(this, () => {
            const { disciplinas } = this.props;
            if (!disciplinas || disciplinas.length <= 0) this.load(); 
            else {
                this.initWithDefaults(disciplinas);
            }
        });
    }

    componentWillUnmount() {
        this.setState({
            mounted: false
        });
    }

    initWithDefaults = (disciplinas) => {
        const { defaultValue } = this.props;
        const options = Disciplina.extract(disciplinas);
        let value = -1;
        if (defaultValue) {
            for (let i = 0; i < disciplinas.length; i++) {
                if (disciplinas[i].ID === defaultValue) {
                    value = i;
                    break;
                }
            }
        }
        this.setState({
            loading: false,
            options,
            value,
        });
    }

    load = async () => {
        const { mounted } = this.state;
        const { network, token, onLoadDisciplinas } = this.props;
        if (!mounted) return;
        this.setState({
            loading: true,
        }, () => {
            Disciplina.fetch(network, token, {}, (response) => {
                if(!response || response.error) {
                    this.setState({
                        loading: false,
                    }, () => {
                        Toast.show(response.error || errors.connection, { duration: 1500, shadow: false });
                    });
                } else {
                    onLoadDisciplinas(response.data, () => {
                        this.initWithDefaults(response.data);
                    })
                }
            });
        });
    }

    _onChange = (prop, value = -1) => {
        const { disciplinas, onChange } = this.props;
        this.setState({
            value
        }, () => {
            if (value >= 0) {
                const { ID, nombre } = disciplinas[value];
                onChange({
                    disciplina: ID,
                    nombre
                });
            }
        });
    }

    render () {
        const { marginTop } = this.props;
        const { loading, options: disciplinas, value } = this.state;
        return (
            <View>
                {
                    (!disciplinas || disciplinas.length <= 0) ? (
                        <TouchableOpacity style={styles.button} onPress={this.load} disabled={loading}>
                            {loading ? (
                                <Fragment>
                                    <ActivityIndicator color={colors.dark} />
                                    <Text style={[CSSText.center, styles.textButton]}>Cargando disciplinas...</Text>   
                                </Fragment>
                            ) : (
                                <Fragment>
                                    <Icon name='refresh' size={20} />
                                    <Text style={[CSSText.center, styles.textButton]}>No se han cargado las disciplinas.</Text>   
                                </Fragment>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <Select name="disciplina" label="Disciplina de alto rendimiento" marginTop={marginTop} defaultValue={value} options={disciplinas} onChange={this._onChange}/>
                    )
                }
            </View>
        );
    }
}
DisciplineSelectorComponent.defaultProps = {
    marginTop: 0,
    defaultValue: -1,
    value: -1
}

export const DisciplineSelector = connect(mapStateToProps,mapDispatchToProps)(DisciplineSelectorComponent);