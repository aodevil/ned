import actions from "../actions.json";
import { Referencia } from "../../model/Referencia";
import { setStorage, storageKeys } from "../../services/storage.js";

const storage = (key, payload, callback)=>{
    setStorage(key, payload?JSON.stringify(payload):null)
    .then(()=>{if(callback)callback(payload);})
    .catch(()=>{if(callback)callback(payload);});
}

export const loadReferencias = (payload, callback, store = true)=>(dispatch,getState)=>{
    dispatch({
        type:actions.load_referencias,
        payload
    });
    if (payload && store) storage(storageKeys.referencias, payload, callback);
    else if (callback) callback();
};

export const updateReferencia = (payload, callback)=>(dispatch,getState)=>{

    let items = [ ...getState().referencias ];

    let found = false;

    for(let i = 0; i < items.length; i++){
        if(items[i].ID === payload.ID){
            items[i] = new Referencia(payload);
            found = true;
        }
    }

    if(!found){
        items.push(new Referencia(payload));
    }

    dispatch({
        type:actions.update_referencias,
        payload:items
    });

    storage(storageKeys.referencias, items, callback);
};