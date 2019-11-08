import React, {Component} from "react";
import {Modal, View, TouchableWithoutFeedback, StyleSheet, SafeAreaView, Dimensions, Animated} from "react-native";
import colors from '../styles/colors.json';
import { CSSView } from "../styles/view.js";

const styles = StyleSheet.create({
    view:{
        flex:1
    },
    overlay:{
        flex:1
    },
    mask:{
        position:"absolute",
        top:0,
        left:0,
        right:0,
        bottom:0,
        backgroundColor:colors.dark,
        opacity:0
    },
    container:{
        backgroundColor:colors.white,
        width:Dimensions.get("window").width,
        maxHeight: Math.round(Dimensions.get("window").height / 2),
        marginTop:"auto",
        shadowColor: colors.dark,
        shadowOpacity: 0.8,
        shadowRadius: 3,
        shadowOffset: {
            height: 2,
            width: 1
        }
    }
});

export class FooterModal extends Component{

    constructor(props){
        super(props);
        this.state = {
            mounted:false,
            maskOpacity: new Animated.Value(0)
        };
    }

    UNSAFE_componentWillReceiveProps(props){
        if(props.visible && !this.props.visible)
            Animated.timing(this.state.maskOpacity,{toValue:0.6, delay:350, duration:350}).start();
    }

    _dismiss = ()=>{
        Animated.timing(this.state.maskOpacity,{toValue:0, duration:350}).start(this.props.dismiss);
    }

    render(){
        let {maskOpacity} = this.state;
        let {visible, children} = this.props;
        return (
            <Modal transparent animationType="slide" visible={visible} onRequestClose={()=>{}}>
                <View style={styles.view}>
                    <Animated.View style={[styles.mask,{opacity:maskOpacity}]}>
                        <TouchableWithoutFeedback style={styles.overlay} onPress={this._dismiss}>
                            <View style={styles.overlay}/>
                        </TouchableWithoutFeedback>
                    </Animated.View>

                    <SafeAreaView style={styles.container}>
                        <View style={CSSView.paddingViewSm}>
                            {children}
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        );
    }
}