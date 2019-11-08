//LIB
import React, {Component} from "react";
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import NetInfo from '@react-native-community/netinfo';
//ELEMENTS
import {SnackBar} from "./Snackbar";

export const networkConfig = {
    pingInterval: 10000,
    pingTimeout: 30000,
    pingOnlyIfOffline: true,
    pingInBackground: false
};

class NetworkStateComponent extends Component {
    
    constructor(props) {
        super(props);
        this.unsubscribe = NetInfo.addEventListener(state => {
            this.props.onNetworkChange(state.isConnected);
        });          
    }

    componentWillUnmount () {
        this.unsubscribe();
    }

    render(){
        let {network} = this.props;
        return (
            <SnackBar 
                show={!network} 
                text="No hay conexión a internet" 
                icon="wifi"
                loading
            />
        );
    }
}

export const NetworkStateProvider = connect(mapStateToProps,mapDispatchToProps)(NetworkStateComponent);