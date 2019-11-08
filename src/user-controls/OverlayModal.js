import React, {Component} from "react";
import {Modal,View, TouchableHighlight, StyleSheet, Button, Dimensions, ActivityIndicator} from "react-native";
import colors from '../styles/colors.json';
import { Divider } from "react-native-elements";

const styles = StyleSheet.create({
    view:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
    },
    overlay:{
        position:"absolute",
        top:0,
        left:0,
        right:0,
        bottom:0,
        backgroundColor:colors.dark,
        opacity:0.6
    },
    overlayLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.white,
        opacity:0.6,
        borderRadius:15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    container:{
        backgroundColor:colors.white,
        borderRadius:15,
        padding:15,
        width:Dimensions.get("window").width / 5 * 4,
        maxHeight:"80%",
        position: 'relative'
    },
    divider:{
        backgroundColor:colors.light,
        marginTop:15,
        marginBottom:8
    }
});

export class OverlayModal extends Component{
    _void = () => null;
    render(){
        let {visible, children, dismiss, dismissLabel, dismissColor, divider, submit, cancel, loading} = this.props;
        return (
            <Modal transparent animationType="fade" visible={visible} onRequestClose={this._void}>
                <View style={styles.view}>
                    <TouchableHighlight disabled={loading} style={styles.overlay} onPress={dismiss}><View></View></TouchableHighlight>
                    <View style={styles.container}>
                        {children}
                        {divider && <Divider style={styles.divider}/>}
                        
                        <Button 
                            onPress={submit || dismiss}
                            color={dismissColor}
                            title={dismissLabel}
                            accessibilityLabel={dismissLabel}
                            disabled={loading}
                        />
                        {cancel && (
                            <Button 
                                onPress={cancel}
                                color={colors.danger}
                                title="Cancelar"
                                accessibilityLabel="Cancelar"
                                disabled={loading}
                            />
                        )}

                        {loading && (
                            <View style={styles.overlayLoading}>
                                <ActivityIndicator color={colors.primary} size="large" />
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        );
    }
}
OverlayModal.defaultProps = {
    dismissLabel:"Aceptar",
    dismissColor:colors.danger,
    divider:true,
    cancel:null,
    loading: false,
}