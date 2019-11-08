import {loading} from "./actions/loading";
import {network, toggleNetworkNotification} from "./actions/network";
import {login, logout, token} from "./actions/usuario";
import {loadActividades, loadEventos, updateActividad, removeActividad, updateEvento, removeEvento} from "./actions/actividades";
import {loadCentros, removeCentro, updateCentro} from "./actions/centros";
import {loadCoordinadores, removeCoordinador, updateCoordinador} from "./actions/coordinadores";
import {loadEvaluadores, removeEvaluador, updateEvaluador} from "./actions/evaluadores";
import {loadAlumnos, removeAlumno, updateAlumno} from "./actions/alumnos";
import {loadDisciplinas, removeDisciplina, updateDisciplina} from "./actions/disciplinas";
import {loadReferencias, updateReferencia} from "./actions/referencias";

export const mapDispatchToProps = (dispatch)=>{
    return {
        onSetToken:(payload, callback)=>{
            dispatch(token(payload, callback));
        },
        onLoading:(payload,callback)=>{
            dispatch(loading(payload,callback));
        },
        onNetworkChange:(payload,callback)=>{
            dispatch(network(payload,callback));
        },
        onToggleNetworkNotification:(payload)=>{
            dispatch(toggleNetworkNotification(payload));
        },
        onLogin:(payload, callback)=>{
            dispatch(login(payload,callback));
        },
        onLogout:(callback)=>{
            dispatch(logout(callback));
        },
        onLoadCentros:(payload,callback,store)=>{
            dispatch(loadCentros(payload,callback,store));
        },
        onRemoveCentro:(payload,callback)=>{
            dispatch(removeCentro(payload,callback))
        },
        onUpdateCentro:(payload,callback)=>{
            dispatch(updateCentro(payload,callback));
        },
        onLoadActividades:(payload,callback,store)=>{
            dispatch(loadActividades(payload,callback,store));
        },
        onUpdateActividad:(payload,callback,store)=>{
            dispatch(updateActividad(payload,callback,store));
        },
        onRemoveActividad:(payload,callback,store)=>{
            dispatch(removeActividad(payload,callback,store));
        },
        onLoadEventos:(payload,callback,store)=>{
            dispatch(loadEventos(payload,callback,store));
        },
        onUpdateEvento:(payload,callback,store)=>{
            dispatch(updateEvento(payload,callback,store));
        },
        onRemoveEvento:(payload,callback,store)=>{
            dispatch(removeEvento(payload,callback,store));
        },
        onLoadCoordinadores:(payload,callback,store)=>{
            dispatch(loadCoordinadores(payload,callback,store));
        },
        onRemoveCoordinador:(payload,callback)=>{
            dispatch(removeCoordinador(payload,callback))
        },
        onUpdateCoordinador:(payload,callback)=>{
            dispatch(updateCoordinador(payload,callback));
        },
        onLoadEvaluadores:(payload,callback,store)=>{
            dispatch(loadEvaluadores(payload,callback,store));
        },
        onRemoveEvaluador:(payload,callback)=>{
            dispatch(removeEvaluador(payload,callback))
        },
        onUpdateEvaluador:(payload,callback)=>{
            dispatch(updateEvaluador(payload,callback));
        },
        onLoadAlumnos:(payload,callback,store)=>{
            dispatch(loadAlumnos(payload,callback,store));
        },
        onRemoveAlumno:(payload,callback)=>{
            dispatch(removeAlumno(payload,callback))
        },
        onUpdateAlumno:(payload,callback)=>{
            dispatch(updateAlumno(payload,callback));
        },
        onLoadDisciplinas: (payload, callback) => {
            dispatch(loadDisciplinas(payload, callback));
        },
        onRemoveDisciplina:(payload,callback)=>{
            dispatch(removeDisciplina(payload,callback))
        },
        onUpdateDisciplina:(payload,callback)=>{
            dispatch(updateDisciplina(payload,callback));
        },
        onLoadReferencias: (payload, callback) => {
            dispatch(loadReferencias(payload, callback));
        },
        onUpdateReferencia:(payload,callback)=>{
            dispatch(updateReferencia(payload,callback));
        },
    }
}