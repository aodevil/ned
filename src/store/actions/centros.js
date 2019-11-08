 import actions from "../actions.json";
import { Centro } from "../../model/Centro";
import { setStorage, storageKeys } from "../../services/storage.js";

const storage = (payload, callback)=>{
    setStorage(storageKeys.centros,payload?JSON.stringify(payload):null)
    .then(()=>{if(callback)callback(payload);})
    .catch(()=>{if(callback)callback(payload);});
}

export const loadCentros = (payload, callback, store = true)=>(dispatch,getState)=>{
    dispatch({
        type:actions.load_centros,
        payload
    });
    if(payload && store)storage(payload,callback);
    else if (callback) callback();
};

export const removeCentro = (payload, callback)=>(dispatch,getState)=>{

    dispatch({
        type:actions.delete_centros,
        payload
    });

    storage(getState().centros,callback);
};

export const updateCentro = (payload, callback)=>(dispatch,getState)=>{

    let centros = [...getState().centros];

    let found = false;

    for(let i = 0; i < centros.length; i++){
        if(centros[i].ID === payload.ID){
            centros[i] = new Centro(payload);
            found = true;
        }
    }

    if(!found){
        centros.push(new Centro(payload));
    }

    dispatch({
        type:actions.update_centros,
        payload:centros
    });

    storage(centros,callback);
};