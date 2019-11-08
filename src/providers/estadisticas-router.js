//INIT
import {createStackNavigator} from "react-navigation";
//ELEMENTS
import { headerTitleStyle } from "../user-controls/HeaderTitle";
//ROUTES
import { Estadisticas } from '../components/Estadisticas';
import { EstadisticasGraficas } from '../components/EstadisticasGraficas';

export const EstadisticasRouter = createStackNavigator(
    {
        Estadisticas, EstadisticasGraficas
    },{
        headerMode:"screen",
        navigationOptions: headerTitleStyle
    }
);