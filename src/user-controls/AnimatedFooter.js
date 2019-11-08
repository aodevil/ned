import React, {Component} from "react";
import { Animated, StyleSheet, SafeAreaView } from "react-native";
import colors from "../styles/colors";

const collapsePosition = 60;

const styles = StyleSheet.create({
    container:{
        position:"absolute",
        bottom:0,
        left:0,
        right:0,
        zIndex:2,
        transform:[{translateY:0}],
        shadowColor:colors.dark,
        shadowOffset:{x:0,y:-5},
        shadowOpacity:0.6,
        shadowRadius:3,
        elevation:1,
        justifyContent:"center",
        flex:1
    }
});

export class AnimatedFooter extends Component{

    //INIT

    constructor(props){
        super(props);
        this.height = props.height
        this.translateY = new Animated.Value(this.height + 120);
    }

    shouldComponentUpdate(props,state){
        return !(this.props.collapse === props.collapse);
    }

    componentDidUpdate(props,state){
        Animated.timing(
            this.translateY,
            {
                toValue: (this.props.collapse)?this.height+120:0,
                duration: 530
            }
        ).start();
    }

    //RENDER

    renderView = () => {
        const { children, background } = this.props;
        return (
            <Animated.View style={[styles.container,{
                height:this.height,
                backgroundColor:background,
                transform:[
                    {
                        translateY:this.translateY
                    }
                ]
            }]}>
                {children}
            </Animated.View>
        )
    }

    render(){
        const { safeAreaView } = this.props;
        return (
            safeAreaView ? (
                <SafeAreaView>
                    { this.renderView() }
                </SafeAreaView>
            ) : this.renderView()
        );
    }
}
AnimatedFooter.defaultProps = {
    collapse:true,
    height:collapsePosition,
    background:colors.clear,
    safeAreaView:true
}