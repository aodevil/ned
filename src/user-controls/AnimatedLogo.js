import React, {Component} from "react";
import {Image, Animated, StyleSheet, Easing} from "react-native";
import LogoCODE from "../assets/Logo-CODE.png";
import { CSSView } from "../styles/view";
import colors from "../styles/colors";

const styles = StyleSheet.create({
    container:{
        backgroundColor:colors.primary
    },
    logo:{
        width:330,
        height:585
    },
    view:{
        width:330,
        height:585
    }
});

export class AnimatedLogo extends Component{

    state = {
        scale: new Animated.Value(1),
        opacityIn: new Animated.Value(0),
        opacityOff: new Animated.Value(1)
    };

    componentDidMount() {
        Animated.parallel(
            [
              Animated.timing(
                this.state.scale,
                {
                  toValue: 0,
                  duration: 1200
                }
              ),
              Animated.timing(
                this.state.opacityIn,
                {
                  toValue: 1,
                  duration: 600
                }
              ),
              Animated.timing(
                this.state.opacityOff,
                {
                  toValue: 0,
                  duration: 1200
                }
              ),
            ],
            {                     
                easing:Easing.inOut(Easing.bounce),
                delay:50,
                useNativeDriver: true
            }
        ).start(()=>{
            if(this.props.onDidMount)this.props.onDidMount();
        });
    }

    render(){
        let {scale, opacityIn, opacityOff} = this.state;
        return (
            <Animated.View style={[CSSView.container, CSSView.absolute, styles.container, {opacity:opacityOff}]}>
                <Animated.View style={[CSSView.absoluteCenter, {opacity:opacityIn, transform:([{ translateX: -145 }, { translateY: -293 }, { scale }]),}]}>
                    <Image source={LogoCODE} style={styles.logo}/>
                </Animated.View>
            </Animated.View>
        );
    }
}