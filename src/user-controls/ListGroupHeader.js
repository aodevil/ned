import React from "react";
import {View, Image, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback} from "react-native";
import colors from '../styles/colors.json';
import BGHeader from "../assets/BG-Header.jpg";
import { Icon } from '../user-controls/IconComponent';
import shortId  from "shortid";

const styles = StyleSheet.create({
    container:{
        borderWidth:0,
        padding:11
    },
    primary:{
        backgroundColor:colors.primary
    },
    secondary:{
        backgroundColor:colors.secondary
    },
    image:{
        position:"absolute",
        width:null,
        height:null,
        bottom:0,
        left:0,
        right:0,
        top:0
    },
    title:{
        fontWeight:"bold",
        color:colors.white,
        flex:1
    },
    row:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center"
    },
    buttons:{
        flex:0,
        alignItems:"center",
        flexDirection: 'row'
    },
    touchable:{
        flex:0,
        paddingRight:10,
        paddingLeft:10
    }
});

const mapButtons = (x,i)=>{
    let key = `header-button-${i}-${shortId.generate()}`;
    return (
    <TouchableOpacity key={key} style={styles.touchable} onPress={x.onPress}>
        <Icon name={x.icon} color={x.color || colors.white} size={20} />
    </TouchableOpacity>
    );
}

export const ListGroupHeader = ({title, toUpperCase, secondary, buttons, icon, onPress, style})=>(
    <TouchableWithoutFeedback onPress={onPress}>
        <View style={[styles.container, !secondary?styles.primary:styles.secondary, style]}>
            {!secondary && <Image source={BGHeader} style={styles.image}/>}
            <View style={styles.row}>
                <Text style={styles.title}>{toUpperCase?title.toUpperCase():title}</Text>
                {icon && <Icon name={icon.name} color={icon.color || colors.white} size={20} />}
                {(buttons && buttons.length > 0) && (
                    <View style={styles.buttons}>
                        {buttons.map(mapButtons)}
                    </View>
                )}
            </View>
        </View>
    </TouchableWithoutFeedback>
);
ListGroupHeader.defaultProps = {
    toUpperCase:true,
    secondary:false,
    buttons:null,
    onPress:void 0
};