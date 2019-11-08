import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { CSSView } from '../styles/view';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 10
    },
    column: {
        flex: 1,
        paddingRight: 6,
        paddingLeft: 6
    }
});


export const Grid = ({ numColumns, columns =  [] }) => {
    const keyExtractor = (x, i) => (`grid-item-${i}`);
    const renderItem = ({ item, index }) => <View style={styles.column}>{item}</View>;
    return (
        <View style={CSSView.container}>
            <FlatList
                columnWrapperStyle={styles.container}
                numColumns={numColumns}
                data={columns}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
            />
        </View>
    );
}