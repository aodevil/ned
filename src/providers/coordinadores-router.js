//INIT
import {createStackNavigator} from "react-navigation";
//ELEMENTS
import { headerTitleStyle } from "../user-controls/HeaderTitle";
//ROUTES
import { Coordinadores } from '../components/Coordinadores';
import { Coordinador } from '../components/Coordinador';

export const CoordinadoresRouter = createStackNavigator(
    {
        Coordinadores, Coordinador
    },{
        headerMode:"screen",
        navigationOptions: headerTitleStyle
    }
);