//INIT
import {createStackNavigator} from "react-navigation";
//ELEMENTS
import { headerTitleStyle } from "../user-controls/HeaderTitle";
//ROUTES
import routes from './routes';
import { Centros } from '../components/Centros';
import { DetallesCentro } from '../components/DetallesCentro';
import { EditarCentro } from '../components/EditarCentro';
import { ActividadesCentro } from '../components/ActividadesCentro';
import { DetallesActividad } from '../components/DetallesActividad';
import { EditarActividad } from '../components/EditarActividad';
import { EditarEvento } from '../components/EditarEvento';

export const CentrosRouter = createStackNavigator(
    {
        Centros, 
        DetallesCentro, 
        EditarCentro, 
        ActividadesCentro, 
        [`${routes.CentrosRouter.prefix}${routes.ActividadesRouter.child.DetallesActividad.name}`]:{
            screen:DetallesActividad
        },
        [`${routes.CentrosRouter.prefix}${routes.ActividadesRouter.child.EditarActividad.name}`]:{
            screen:EditarActividad
        },
        [`${routes.CentrosRouter.prefix}${routes.ActividadesRouter.child.EditarEvento.name}`]:{
            screen:EditarEvento
        },
    },{
        headerMode:"screen",
        navigationOptions: headerTitleStyle
    }
);