import React from 'react';
//ELEMENTS
import { View, StyleSheet } from 'react-native';
import colors from '../styles/colors.json';

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 2,
        shadowColor: colors.dark,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3.5,
        elevation: 5,
        padding: 10,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 20
    },

});


export default ({ children, style }) => {
    return (
        <View style={[styles.card, style]}>
            {children}
        </View>
    );
}