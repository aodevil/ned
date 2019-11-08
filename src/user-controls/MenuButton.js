import React from "react";
import {TouchableOpacity, StyleSheet, View} from "react-native";
import {withNavigation} from "react-navigation";
import { Icon } from '../user-controls/IconComponent';
import colors from "../styles/colors";

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
        alignItems:"center",
        marginLeft:20
    }
});

export const MenuButton = withNavigation(({navigation, invert})=> {
    let onAlert = navigation.getParam("onAlert");
    return (
        <View style={[styles.container]}>
            <TouchableOpacity style={[styles.touchable]} onPress={navigation.openDrawer}>
                <Icon
                    name="menu"
                    color={invert?colors.white:colors.secondary}
                    size={25}
                />
            </TouchableOpacity>
            {onAlert && (
            <TouchableOpacity onPress={onAlert} style={[styles.touchable]}>
                <Icon name="alert" color={invert?colors.white:colors.danger} size={25} />
            </TouchableOpacity>
            )}
        </View>
    );
});
