import actions from "../actions.json";
import { Usuario } from "../../model/Usuario.js";
import { setStorage, storageKeys } from "../../services/storage.js";

const storage = (payload, callback)=>{
    setStorage(storageKeys.alumnos,payload?JSON.stringify(payload):null)
    .then(()=>{if(callback)callback(payload);})
    .catch(()=>{if(callback)callback(payload);});
}

export const loadAlumnos = (payload, callback, store = true)=>(dispatch,getState)=>{
    dispatch({
        type:actions.load_alumnos,
        payload
    });
    
    if(payload && store)storage(payload,callback);
    else if (callback) callback();
};

export const removeAlumno = (payload, callback)=>(dispatch,getState)=>{

    dispatch({
        type:actions.delete_alumnos,
        payload
    });

    storage(getState().alumnos,callback);
};

export const updateAlumno = (payload, callback)=>(dispatch,getState)=>{

    let alumnos = [...getState().alumnos];

    let found = false;

    for(let i = 0; i < alumnos.length; i++){
        if(alumnos[i].ID === payload.ID){
            alumnos[i] = new Usuario(payload);
            found = true;
        }
    }

    if(!found){
        alumnos.push(new Usuario(payload));
    }

    dispatch({
        type:actions.update_alumnos,
        payload:alumnos
    });

    storage(alumnos,callback);
};