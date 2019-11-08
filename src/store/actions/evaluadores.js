import actions from "../actions.json";
import { Usuario } from "../../model/Usuario.js";
import { setStorage, storageKeys } from "../../services/storage.js";

const storage = (payload, callback)=>{
    setStorage(storageKeys.evaluadores,payload?JSON.stringify(payload):null)
    .then(()=>{if(callback)callback(payload);})
    .catch(()=>{if(callback)callback(payload);});
}

export const loadEvaluadores = (payload, callback, store = true)=>(dispatch,getState)=>{
    dispatch({
        type:actions.load_evaluadores,
        payload
    });
    
    if(payload && store)storage(payload,callback);
    else if (callback) callback();
};

export const removeEvaluador = (payload, callback)=>(dispatch,getState)=>{

    dispatch({
        type:actions.delete_evaluadores,
        payload
    });

    storage(getState().evaluadores,callback);
};

export const updateEvaluador = (payload, callback)=>(dispatch,getState)=>{

    let evaluadores = [...getState().evaluadores];

    let found = false;

    for(let i = 0; i < evaluadores.length; i++){
        if(evaluadores[i].ID === payload.ID){
            evaluadores[i] = new Usuario(payload);
            found = true;
        }
    }

    if(!found){
        evaluadores.push(new Usuario(payload));
    }

    dispatch({
        type:actions.update_evaluadores,
        payload:evaluadores
    });

    storage(evaluadores,callback);
};