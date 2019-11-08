import {createStackNavigator} from "react-navigation";
import { ObtenerCuenta } from '../components/ObtenerCuenta';
import { headerTitleStyle } from "../user-controls/HeaderTitle";

export const ObtenerCuentaRouter = createStackNavigator(
    {
        ObtenerCuenta:{
            screen:ObtenerCuenta,
        }
    },
    {
        headerMode:"screen",
        navigationOptions: headerTitleStyle
    }
);