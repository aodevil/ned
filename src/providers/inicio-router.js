//INIT
import {createStackNavigator} from "react-navigation";
//ELEMENTS
import { headerTitleStyle } from "../user-controls/HeaderTitle";
//ROUTES
import routes from './routes';
import { AlumnoInicio } from '../components/AlumnoInicio';
import { AlumnoInicioHistorial } from '../components/AlumnoInicioHistorial';
import { AlumnoInicioRecomendaciones } from '../components/AlumnoInicioRecomendaciones';
import { AlumnoInicioCalificaciones } from '../components/AlumnoInicioCalificaciones';
import { DetallesActividad } from '../components/DetallesActividad';
import { DetallesEvaluacion } from '../components/DetallesEvaluacion';

export const InicioRouter = createStackNavigator(
    {
        AlumnoInicio,
        AlumnoInicioHistorial,
        AlumnoInicioRecomendaciones,
        AlumnoInicioCalificaciones,
        [`${routes.InicioRouter.prefix}${routes.ActividadesRouter.child.DetallesActividad.name}`]: {
            screen: DetallesActividad
        },
        [`${routes.InicioRouter.prefix}${routes.EvaluacionRouter.child.DetallesEvaluacion.name}`]: {
            screen: DetallesEvaluacion
        },

    },{
        headerMode:"screen",
        navigationOptions: headerTitleStyle
    }
);