import {combineReducers} from "redux";
import actions from "../actions.json";
import {loading} from "./loading";
import {network, networkNotification} from "./network";
import {usuario, token} from "./usuario";
import {actividades,eventos} from "./actividades";
import {centros} from "./centros";
import {coordinadores} from "./coordinadores";
import {evaluadores} from "./evaluadores";
import {alumnos} from "./alumnos";
import {disciplinas} from "./disciplinas";
import {referencias} from "./referencias";
import {mediciones} from "./mediciones";

const appReducer = combineReducers({
    network,
    networkNotification,
    loading,
    token,
    usuario,
    centros,
    actividades,
    eventos,
    coordinadores,
    evaluadores,
    alumnos,
    disciplinas,
    referencias,
    mediciones
});

export default (state,action)=>{
    if(action.type === actions.logout){
        state = undefined;
    }
    return appReducer(state,action);
}