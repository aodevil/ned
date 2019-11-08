import React from "react";
import {Platform} from "react-native";
import I from "react-native-vector-icons/Ionicons";
import colors from "../styles/colors";

export const iconForPlatform = (name)=>{
    return `${Platform.OS === "ios"?"ios":"md"}-${name}`;
}

export const Icon = ({name,color,size})=>{
    return(
        <I name={iconForPlatform(name)} color={color} size={size}/>
    );
}
Icon.defaultProps = {
    name:"help-circle",
    color:colors.dark,
    size:26
}

