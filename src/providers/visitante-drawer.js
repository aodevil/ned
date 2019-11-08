import {createDrawerNavigator} from "react-navigation";
import { DrawerSetup } from "../user-controls/Drawer";
import { ActividadesRouter } from './actividades-router';
import { CentrosRouter } from './centros-router';
import { ObtenerCuentaRouter } from './obtener-cuenta-router';
import routes from './routes';

const prefix = routes.prefix.Visitante;

export const VisitanteDrawer = createDrawerNavigator(
    {
        [`${prefix}ActividadesRouter`]:{
            screen:ActividadesRouter,
            navigationOptions: {
                title: routes.ActividadesRouter.title
            }
        },
        [`${prefix}CentrosRouter`]:{
            screen:CentrosRouter,
            navigationOptions: {
                title: routes.CentrosRouter.title
            }
        },
        [`${prefix}ObtenerCuenta`]:{
            screen:ObtenerCuentaRouter,
            navigationOptions: {
                title: routes.ObtenerCuenta.title
            }
        }
    },
    DrawerSetup
);