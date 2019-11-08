import React, {Component} from "react";
import {Text,TouchableOpacity, StyleSheet, Animated, ActivityIndicator} from "react-native";
import { Icon } from '../user-controls/IconComponent';
import colors from '../styles/colors.json';

const styles = StyleSheet.create({
    container:{
        flex:1,
        position:"absolute",
        bottom:20,
        left:8,
        right:8,
        zIndex:2
    },
    snack:{
        flex:1,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        borderRadius:20,
        padding:8
    },
    text:{
        flex:1,
        color:colors.white,
        textAlign:"center"
    },
    icon:{
        flex:0,
        marginRight:5,
    },
    activityIndicator:{
        flex:0,
        marginLeft:0
    },
    default:{
        backgroundColor:colors.dark
    },
    primary:{
        backgroundColor:colors.primary
    },
    danger:{
        backgroundColor:colors.danger
    },
    info:{
        backgroundColor:colors.secondary
    }
});

export class SnackBar extends Component{

    constructor(props){
        super(props);
        this.state = {
            opacity: new Animated.Value(0)
        };
    }

    componentDidUpdate(props,state){
        if(props.show === this.props.show)return;
        if(this.props.show)this._in();
        else this._out();

    }

    componentWillUnmount(){
        this._out();
    }

    componentDidMount(){
        this._in();
    }

    _in = ()=>{
        Animated.timing(
            this.state.opacity,
            {
                toValue: 1,
                duration: 1500
            }
        ).start();
    }

    _out = ()=>{
        Animated.timing(
            this.state.opacity,
            {
                toValue: 0,
                duration: 1500
            }
        ).start();
    }

    render(){
        let {show,text,icon,onPress,type,loading} = this.props;
        let {opacity} = this.state;
        if(!show)return null;
        return(
            <Animated.View style={[styles.container, {opacity}]}>
                <TouchableOpacity style={[styles.snack,styles[type]]} onPress={onPress}>
                    {!!icon && <Icon size={25} name={icon} color={colors.white} style={styles.icon}/>}
                        <Text style={styles.text}>{text}</Text>
                    {loading && <ActivityIndicator style={styles.activityIndicator} size="small" color={colors.white} />}
                </TouchableOpacity>
            </Animated.View>
        );
    }
}
SnackBar.defaultProps = {
    icon:"",
    show:true,
    text:"",
    onPress:null,
    type:"default",
    loading:false
};