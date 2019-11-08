import React, {Component} from 'react';
import { StyleSheet } from 'react-native';
import {ButtonGroup} from "react-native-elements";
import colors from "../styles/colors";

const styles = StyleSheet.create({
    containerStyle: {
        height: 40,
        borderWidth:1,
        borderColor:colors.secondary,
        paddingLeft:0,
        paddingRight:0,
        margin:0
    },
    innerBorderStyle: {
        color:colors.secondary
    },
    buttonStyle: {
        backgroundColor:colors.white
    },
    selectedButtonStyle: {
        backgroundColor:colors.secondary
    },
    textStyle: {
        color:colors.secondary
    },
    selectedTextStyle: {
        color:colors.white
    }
})

export class SegmentedButtons extends Component{

    constructor(props){
        super(props);
        this.state = {
            index:props.index
        };
    }

    shouldComponentUpdate(props, state){
        if(state.index === this.state.index)return false;
        return true;
    }

    _onChange = (index)=>{
        this.setState({index},()=>{
            if(this.props.onChange){
                this.props.onChange(index);
            }
        });
    }

    render(){
        let {buttons} = this.props;
        let {index} = this.state;
        return(
            <ButtonGroup
                onPress={this._onChange}
                selectedIndex={index}
                buttons={buttons}
                containerStyle={styles.containerStyle}
                innerBorderStyle={styles.innerBorderStyle}
                buttonStyle={styles.buttonStyle}
                selectedButtonStyle={styles.selectedButtonStyle}
                textStyle={styles.textStyle}
                selectedTextStyle={styles.selectedTextStyle}
            />
        );
    }
}
SegmentedButtons.defaultProps = {
    buttons:[],
    index:0
}