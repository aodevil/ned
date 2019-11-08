import {createDrawerNavigator} from "react-navigation";
import { DrawerSetup } from "../user-controls/Drawer";
import { ActividadesRouter } from './actividades-router';
import { PerfilRouter } from './perfil-router';
import { CentrosRouter } from './centros-router';
import { InicioRouter } from './inicio-router';
import routes from './routes';

const prefix = routes.prefix.Alumno;

export const AlumnoDrawer = createDrawerNavigator(
    {
        [`${prefix}InicioRouter`]:{
            screen:InicioRouter,
            navigationOptions: {
                title: routes.InicioRouter.title
            }
        },
        [`${prefix}PerfilRouter`]:{
            screen:PerfilRouter,
            navigationOptions: {
                title: routes.Perfil.title
            }
        },
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
        }
    },
    DrawerSetup
);