//LIB
import React, {Component} from 'react';
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
//ELEMENTS
import {ImageBackground, View} from 'react-native';
import { Loader } from '../user-controls/Loader';
//STYLES
import {CSSView} from "../styles/view";
//IMAGES
import BGLogin from "../assets/BG.jpg";
//MODEL
import routes from '../providers/routes';
import { AnimatedLogo } from '../user-controls/AnimatedLogo';
import { Usuario } from '../model/Usuario';
import { LoaderModule } from '../model/Loader';

export class AuthComponent extends Component{

    constructor(props){
        super(props);
        this.loader = new LoaderModule();
        this.state = {
            mounted:false
        };
    }

    shouldComponentUpdate(props,state){
        return !(state.mounted === this.state.mounted);
    }

    componentDidUpdate(props,state){
        if(this.state.mounted){
            const { data: { usuario: u } } = this.loader;
            if(u){
                let usuario = new Usuario(u);
                if(usuario.token)
                    this.props.onSetToken(usuario.token, () => {
                        this.props.onLogin(usuario, () => {
                            this.loader.putStorageIntoStore(this.props, () => {
                                this._goTo(Usuario.routeForUser(usuario.tipo));
                            });
                        });
                    });
                else
                    this._goTo(routes.Login.name);
            } else {
                this._goTo(routes.Login.name);
            }
        }
    }

    //ACTIONS

    _mount = async () => {
        await this.loader.getInitialStorage();
        this.setState({
            mounted:true
        });
    }

    _goTo = (route)=>{
        let {navigate} = this.props.navigation;
        navigate(route);
    }

    render() {
        let {mounted} = this.state;
        return (
        <View style={[CSSView.flex, CSSView.relative]} forceInset={{ bottom: 'never' }}>
            <ImageBackground source={BGLogin} style={[CSSView.backgroundImage]}>
                <Loader show={true}/>
            </ImageBackground>
            <AnimatedLogo show={!mounted} onDidMount={this._mount}/>
        </View>
        );
    }
}

export const Auth = connect(mapStateToProps,mapDispatchToProps)(AuthComponent);