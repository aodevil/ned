//INIT
import {createStackNavigator} from "react-navigation";
//ELEMENTS
import { headerTitleStyle } from "../user-controls/HeaderTitle";
//ROUTES
import { Evaluadores } from '../components/Evaluadores';
import { Evaluador } from '../components/Evaluador';
import { AlumnosEvaluador } from '../components/AlumnosEvaluador';
import { AlumnoEvaluador } from '../components/AlumnoEvaluador';

export const EvaluadoresRouter = createStackNavigator(
    {
        Evaluadores,
        Evaluador,
        AlumnosEvaluador,
        AlumnoEvaluador
    },{
        headerMode:"screen",
        navigationOptions: headerTitleStyle
    }
);