import React from "react";
import {StatusBar as Bar} from "react-native";
import colors from "../styles/colors.json";

export const StatusBar = ()=>(
    <Bar barStyle="light-content" backgroundColor={colors.dark}/>
);