//INIT
import {createStackNavigator} from "react-navigation";
//ELEMENTS
import { headerTitleStyle } from "../user-controls/HeaderTitle";
//ROUTES
import { Actividades } from '../components/Actividades';
import { ListaActividades } from '../components/ListaActividades';
import { DetallesActividad } from '../components/DetallesActividad';
import { EditarActividad } from '../components/EditarActividad';
import { EditarEvento } from '../components/EditarEvento';

export const ActividadesRouter = createStackNavigator(
    {
        Actividades,
        ListaActividades,
        DetallesActividad,
        EditarActividad,
        EditarEvento
    },{
        headerMode:"screen",
        navigationOptions: headerTitleStyle
    }
);