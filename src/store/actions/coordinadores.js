import actions from "../actions.json";
import { Usuario } from "../../model/Usuario.js";
import { setStorage, storageKeys } from "../../services/storage.js";

const storage = (payload, callback)=>{
    setStorage(storageKeys.coordinadores,payload?JSON.stringify(payload):null)
    .then(()=>{if(callback)callback(payload);})
    .catch(()=>{if(callback)callback(payload);});
}

export const loadCoordinadores = (payload, callback, store = true)=>(dispatch,getState)=>{
    dispatch({
        type:actions.load_coordinadores,
        payload
    });
    
    if(payload && store)storage(payload,callback);
    else if (callback) callback();
};

export const removeCoordinador = (payload, callback)=>(dispatch,getState)=>{

    dispatch({
        type:actions.delete_coordinadores,
        payload
    });

    storage(getState().coordinadores,callback);
};

export const updateCoordinador = (payload, callback)=>(dispatch,getState)=>{

    let coordinadores = [...getState().coordinadores];

    let found = false;

    for(let i = 0; i < coordinadores.length; i++){
        if(coordinadores[i].ID === payload.ID){
            coordinadores[i] = new Usuario(payload);
            found = true;
        }
    }

    if(!found){
        coordinadores.push(new Usuario(payload));
    }

    dispatch({
        type:actions.update_coordinadores,
        payload:coordinadores
    });

    storage(coordinadores,callback);
};