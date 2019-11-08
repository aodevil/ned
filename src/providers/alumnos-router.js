//INIT
import { createStackNavigator } from "react-navigation";
//ELEMENTS
import { headerTitleStyle } from "../user-controls/HeaderTitle";
//ROUTES
import routes from './routes';
import { Alumnos } from '../components/Alumnos';
import { Alumno } from '../components/Alumno';
import { Evaluacion } from '../components/Evaluacion';
import { DetallesEvaluacion } from '../components/DetallesEvaluacion';
import { Actividades } from '../components/Actividades';
import { ListaActividades } from '../components/ListaActividades';
import { DetallesActividad } from '../components/DetallesActividad';

export const AlumnosRouter = createStackNavigator(
    {
        Alumnos,
        Alumno,
        Evaluacion,
        DetallesEvaluacion,
        [`${routes.EvaluadoresRouter.prefix}${routes.ActividadesRouter.child.Actividades.name}`]:{
            screen:Actividades
        },
        [`${routes.EvaluadoresRouter.prefix}${routes.ActividadesRouter.child.ListaActividades.name}`]:{
            screen:ListaActividades
        },
        [`${routes.EvaluadoresRouter.prefix}${routes.ActividadesRouter.child.DetallesActividad.name}`]:{
            screen:DetallesActividad
        },
    },{
        headerMode:"screen",
        navigationOptions: headerTitleStyle
    }
);