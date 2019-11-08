import {createSwitchNavigator} from "react-navigation";
import routes from '../providers/routes';
import { Auth, AuthComponent } from '../components/Auth';
import { Login, LoginComponent } from '../components/Login';
import {AppRouter} from "./app-router";

AuthComponent.navigationOptions = {
    title: "",
    header:null
};

LoginComponent.navigationOptions = {
    title: routes.Login.title,
    header:null
};

export const LoginRouter = createSwitchNavigator(
    {
        Auth,Login,...AppRouter
    }
);