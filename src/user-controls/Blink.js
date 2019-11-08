import React, {Component} from "react";
import {Animated, StyleSheet, View, SafeAreaView} from "react-native";
import colors from "../styles/colors";

const styles = StyleSheet.create({
    container:{
        backgroundColor:colors.none,
        flex:1,
        position:"absolute",
        bottom:0,
        left:0,
        right:0,
        justifyContent:"center",
        alignItems:"center",
    },
    view:{
    }
});

export class Blink extends Component{

    state = {
        opacity: new Animated.Value(0)
    };

    _in = ()=>{
        Animated.timing(this.state.opacity, {toValue:1,duration:800, delay:800}).start(this._out);
    }

    _out = ()=>{
        Animated.timing(this.state.opacity, {toValue:0,duration:800}).start(this._in);
    }

    componentDidMount() {
        this._in();
    }

    render(){
        let {children} = this.props;
        let {opacity} = this.state;
        return (
            <SafeAreaView>
                <Animated.View style={[styles.container, {opacity}]}>
                    <View style={styles.view}>
                        {children}
                    </View>
                </Animated.View>
            </SafeAreaView>
        );
    }
}