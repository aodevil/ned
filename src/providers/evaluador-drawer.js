import {createDrawerNavigator} from "react-navigation";
import { DrawerSetup } from "../user-controls/Drawer";
import { ActividadesRouter } from './actividades-router';
import { PerfilRouter } from './perfil-router';
import { AlumnosRouter } from './alumnos-router';
import { CentrosRouter } from './centros-router';
import routes from './routes';

const prefix = routes.prefix.Evaluador;

export const EvaluadorDrawer = createDrawerNavigator(
    {
        [`${prefix}PerfilRouter`]:{
            screen:PerfilRouter,
            navigationOptions: {
                title: routes.Perfil.title
            }
        },
        [`${prefix}AlumnosRouter`]:{
            screen:AlumnosRouter,
            navigationOptions: {
                title:routes.AlumnosRouter.title
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