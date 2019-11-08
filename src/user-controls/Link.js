import React, {Component} from "react";
import {TouchableOpacity, Linking, Alert, Text, View} from "react-native";
import { Icon } from '../user-controls/IconComponent';
import {CSSView} from '../styles/view';
import colors from '../styles/colors.json';

export class Link extends Component{

    _onPress = ()=>{
        let {url, noAlert} = this.props;
        Linking.canOpenURL(url)
        .then(supported => {
            if(supported){
                Linking.openURL(url).catch(error=>{
                    if(!noAlert)
                    Alert.alert(
                        "Hay un problema",
                        "No es posible abrir el vínculo"
                    );
                });
            }else{
                if(!noAlert)
                Alert.alert(
                    "Hay un problema",
                    "No es posible abrir el vínculo"
                );
            }
        });
    }

    render(){
        let {title,color, noIcon} = this.props;
        return(
            <TouchableOpacity style={[CSSView.row, {justifyContent:"flex-start"}]} onPress={this._onPress}>
                {!noIcon && (
                <View style={CSSView.noGrow}>
                    <Icon name="link" size={17} color={color}/>
                </View>
                )}
                <View>
                    <Text style={{color:color, fontWeight:"bold", padding:11, fontSize:15}}>
                        {title}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }   
}
Link.defaultProps = {
    url:"",
    title:"",
    color:colors.primary,
    noIcon:false,
    noAlert:false
};