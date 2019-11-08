import React from "react";
import {TouchableOpacity, StyleSheet, Platform, Keyboard, Alert, View} from "react-native";
import {withNavigation} from "react-navigation";
import Icon from "react-native-vector-icons/Ionicons";
import colors from "../styles/colors";
import { ALERTS } from "../services/constants";

const styles = StyleSheet.create({
    container:{
        flex:0,
        flexDirection:"row",
        width:"auto",
        alignItems: 'center'
    },
    touchable:{
        flex:0,
        width:"auto",
        alignItems: 'center',
        paddingRight:20,
        paddingLeft:20
    }
});

const goBack = (navigation, trackChanges = false) => () => {
    Keyboard.dismiss();
    if (trackChanges) {
        const changes = navigation.getParam('changes');
        if (changes > 0) {
            Alert.alert(ALERTS.leave.title, ALERTS.leave.text.unsaved, [
                { text: ALERTS.leave.text.cancel, onPress: void 0 },
                { text: ALERTS.leave.text.accept, onPress: navigation.goBack }
            ]);
        } else {
            navigation.goBack();
        }
    } else {
        navigation.goBack();
    }
}

export const BackButton = withNavigation(({navigation, invert, trackChanges})=> {
    let onAlert = navigation.getParam('onAlert');
    return (
        <View style={[styles.container]}>
            <TouchableOpacity style={[styles.touchable]} onPress={goBack(navigation, trackChanges)}>
                <Icon
                    name={Platform.OS==="ios"?"ios-arrow-back":"ios-arrow-down"}
                    color={invert?colors.white:colors.primary}
                    size={25}
                />
            </TouchableOpacity>
            {onAlert && (
            <TouchableOpacity onPress={onAlert} style={[styles.touchable]}>
                <Icon name="alert" color={invert?colors.white:colors.danger} size={25} />
            </TouchableOpacity>
            )}
        </View>
    )
});
