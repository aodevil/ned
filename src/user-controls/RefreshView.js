import React, {Component} from 'react';
//ELEMENTS
import {ScrollView, RefreshControl, SafeAreaView, View} from "react-native";
//STYLES
import colors from "../styles/colors";
import { CSSView } from '../styles/view';


export class RefreshView extends Component{

    //INIT
    constructor(props){
        super(props);
        this.state = {
            refresing: false
        };
    }

    //ACTIONS
    _refresh = ()=>{
        this.setState({refreshing:true},()=>{
            this.props.onRefresh(()=>{
                this.setState({
                    refreshing:false
                });
            })
        });
    }

    //RENDER

    render() {
        let {children, fab, scrollRef, safeAreaView, contentContainerStyle} = this.props;
        let {refreshing} = this.state;
        if(safeAreaView)
        return (
            <SafeAreaView style={CSSView.main}>
                <ScrollView contentContainerStyle={contentContainerStyle} refreshControl={
                    <RefreshControl onRefresh={this._refresh} refreshing={refreshing} tintColor={colors.dark} colors={[colors.dark]}/>
                } ref={scrollRef}>
                
                    {
                        children
                    }
                </ScrollView>
                {fab}
            </SafeAreaView>
        );
        else
        return (
            <View style={CSSView.main}>
                <ScrollView contentContainerStyle={contentContainerStyle} refreshControl={
                    <RefreshControl onRefresh={this._refresh} refreshing={refreshing} tintColor={colors.dark} colors={[colors.dark]}/>
                } ref={scrollRef}>
                
                    {
                        children
                    }
                </ScrollView>
                {fab}
            </View>
        );
    }
}
RefreshView.defaultProps = {
    fab:null,
    scrollRef:null,
    safeAreaView:true,
    contentContainerStyle: {}
}