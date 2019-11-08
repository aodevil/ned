import {createStackNavigator} from "react-navigation";
import { Perfil } from '../components/Perfil';
import { headerTitleStyle } from "../user-controls/HeaderTitle";

export const PerfilRouter = createStackNavigator(
    {
        Perfil
    },
    {
        headerMode:"screen",
        navigationOptions: headerTitleStyle
    }
);