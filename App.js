//LIB
import React, {Component} from 'react';
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import {Provider} from "react-redux";
import { YellowBox, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import MapBox from '@react-native-mapbox-gl/maps';
//MODEL
import { LoginRouter } from './src/providers/login-router';
import reducers from "./src/store/reducers";
import initialState from "./src/store/initialState.json";
import { Loader } from './src/user-controls/Loader';
import { MBXTOKEN } from './src/services/constants';
import { CSSView } from './src/styles/view';
import { NetworkStateProvider } from './src/user-controls/NetworkProvider';
import SplashScreen from 'react-native-splash-screen';

YellowBox.ignoreWarnings(['Remote debugger', 'Warning: componentWillMount', 'Warning: componentWillReceiveProps']);

MapBox.setAccessToken(MBXTOKEN);

const store = createStore(reducers,initialState,applyMiddleware(thunk));

export default class App extends Component {

  constructor(props){
    super(props);
    this.h = Dimensions.get("window").height - 35;
    this.storeSubscriber = store.subscribe(()=>{
      let {loading} = store.getState();
      this.setState({
        loading
      });
    });
    this.state = {
      loading:false
    }
  }

  componentDidMount () {
    SplashScreen.hide();
  }

  componentWillUnmount(){
    this.storeSubscriber();
  }

  render() {
      let {loading} = this.state;
      return (
        <Provider store={store}>
          <KeyboardAvoidingView enabled behavior="padding" style={CSSView.main} keyboardVerticalOffset={Platform.OS === "ios"?0:-this.h}>
            <LoginRouter />
            <Loader transparent={false} dark opacity={0.35} show={loading}/>

            <NetworkStateProvider />
            
          </KeyboardAvoidingView>
        </Provider>
      );
  }
}
