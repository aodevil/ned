import React from "react";
import {View, TouchableOpacity, StyleSheet} from "react-native";
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
        paddingRight:10,
        paddingLeft:10,
        marginRight:10
    }
})

const mapButtons = (invert,x,i)=>{
    return (<TouchableOpacity key={`right-button-${i}`} onPress={x.onPress} style={[styles.touchable]}>
        <Icon name={x.icon} color={invert?colors.secondary:colors.white} size={25} />
    </TouchableOpacity>)
}

export const RightButtons = withNavigation(({navigation, invert})=>{
    let onSave = navigation.getParam("onSave");
    let onEdit = navigation.getParam("onEdit");
    let custom = navigation.getParam("custom") || [];
    return (
        <View style={[styles.container]}>
            {
                custom.map(mapButtons.bind(this,invert))
            }

            {onSave && <TouchableOpacity onPress={onSave} style={[styles.touchable]}>
                <Icon name="save" color={invert?colors.secondary:colors.white} size={25} />
            </TouchableOpacity>}

            {onEdit && <TouchableOpacity onPress={onEdit} style={[styles.touchable]}>
                <Icon name="create" color={invert?colors.secondary:colors.white} size={25} />
            </TouchableOpacity>}
        </View>
    );
});