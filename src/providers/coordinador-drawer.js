import {createDrawerNavigator} from "react-navigation";
import { DrawerSetup } from "../user-controls/Drawer";
import { CoordinadoresRouter } from './coordinadores-router';
import { ActividadesRouter } from './actividades-router';
import { CentrosRouter } from './centros-router';
import { PerfilRouter } from './perfil-router';
import { EstadisticasRouter } from './estadisticas-router';
import { EvaluadoresRouter } from "./evaluadores-router";
import { ReferenciasRouter } from "./referencias-router";
import routes from './routes';

const prefix = routes.prefix.Coordinador;

export const CoordinadorDrawer = createDrawerNavigator(
    {
        [`${prefix}PerfilRouter`]:{
            screen:PerfilRouter,
            navigationOptions: {
                title: routes.Perfil.title
            }
        },
        [`${prefix}EstadisticasRouter`]:{
            screen:EstadisticasRouter,
            navigationOptions: {
                title:routes.EstadisticasRouter.title
            }
        },
        [`${prefix}CoordinadoresRouter`]:{
            screen:CoordinadoresRouter,
            navigationOptions: {
                title: routes.CoordinadoresRouter.title
            }
        },
        [`${prefix}EvaluadoresRouter`]:{
            screen:EvaluadoresRouter,
            navigationOptions: {
                title: routes.EvaluadoresRouter.title
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
        },
        [`${prefix}ReferenciasRouter`]:{
            screen:ReferenciasRouter,
            navigationOptions: {
                title: routes.ReferenciasRouter.title
            }
        }
    },
    DrawerSetup
);