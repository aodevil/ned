//LIB
import React, {Component} from "react";
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import {Dimensions} from "react-native";
//ELEMENTS
import {ScrollView, View, Image, ImageBackground, Text, TouchableOpacity, StyleSheet} from "react-native";
import {SafeAreaView, DrawerItems} from "react-navigation";
//STYLES
import colors from "../styles/colors";
import { CSSView } from "../styles/view";
import {CSSDrawer} from "../styles/drawer";
import {CSSText} from "../styles/text";
//IMAGES
import BGLogin from "../assets/BG.jpg";
import LogoNED from "../assets/Logo-NED.png";
//MODEL
import * as routes from '../providers/routes';
import { clearStorage } from '../services/storage';

export const DrawerContentOptions = {
    activeTintColor: colors.white,
    inactiveTintColor:colors.white,
    itemStyle:CSSDrawer.item,
    labelStyle:CSSDrawer.label,
    activeLabelStyle:CSSText.bold
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        paddingLeft:20,
        paddingRight:20
    }
});

class DrawerComponent extends Component{
    
    _logout = ()=>{
        let {token} = this.props;
        if(token){
            clearStorage()
            .then(()=>{
                this.props.onLogout(()=>{
                    let {navigation:{navigate}} = this.props;
                    navigate(routes.Login.name);
                });
            });
        }
        else{
            this.props.onLogout(()=>{
                let {navigation:{navigate}} = this.props;
                navigate(routes.Login.name);
            });
        }
    }

    render(){
        return(
            <View style={CSSView.main}>
                <ImageBackground source={BGLogin} style={[CSSView.backgroundImage]}>
                    <ScrollView>
                        <SafeAreaView style={[styles.container]}>
                            <View style={[CSSDrawer.logoContainer]}>
                                <Image source={LogoNED} style={CSSDrawer.logo}/>
                            </View>
                            <DrawerItems {...this.props}/>
                            <TouchableOpacity style={CSSDrawer.item} onPress={this._logout}>
                                <Text style={[CSSDrawer.label, {color:colors.white}]}>Salir</Text>
                            </TouchableOpacity>
                        </SafeAreaView>
                    </ScrollView>
                </ImageBackground>
            </View>
        );
    }
}

export const Drawer = connect(mapStateToProps,mapDispatchToProps)(DrawerComponent);


export const DrawerSetup = {
    drawerWidth:Dimensions.get("window").width / 3 * 2,
    contentOptions:DrawerContentOptions,
    contentComponent:Drawer
};