import actions from "../actions.json";
import { Actividad } from "../../model/Actividad";
import { Evento } from "../../model/Evento";
import { setStorage, storageKeys } from "../../services/storage.js";

const storage = (key, payload, callback)=>{
    setStorage(key, payload?JSON.stringify(payload):null)
    .then(()=>{if(callback)callback(payload);})
    .catch(()=>{if(callback)callback(payload);});
}

export const loadActividades = (payload, callback, store = true)=>(dispatch,getState)=>{
    dispatch({
        type:actions.load_actividades,
        payload
    });
    if (payload && store) storage(storageKeys.actividades, payload, callback);
    else if (callback) callback();
};

export const removeActividad = (payload, callback)=>(dispatch,getState)=>{
    const items = [ ...getState().actividades ].filter(x => x.ID !== payload.ID); 
    dispatch({
        type:actions.delete_actividades,
        payload: items
    });

    storage(storageKeys.actividades, items,callback);
};

export const updateActividad = (payload, callback)=>(dispatch,getState)=>{

    let items = [ ...getState().actividades ];

    let found = false;

    for(let i = 0; i < items.length; i++){
        if(items[i].ID === payload.ID){
            items[i] = new Actividad(payload);
            found = true;
        }
    }

    if(!found){
        items.push(new Actividad(payload));
    }

    dispatch({
        type:actions.update_actividades,
        payload:items
    });

    storage(storageKeys.actividades, items,callback);
};

export const loadEventos = (payload, callback, store=true)=>(dispatch,getState)=>{
    dispatch({
        type:actions.load_eventos,
        payload
    });
    if (payload && store) storage(storageKeys.eventos, payload, callback);
    else if (callback) callback();
};

export const removeEvento = (payload, callback)=>(dispatch,getState)=>{
    const items = [ ...getState().eventos ].filter(x => x.ID !== payload.ID); 
    dispatch({
        type:actions.delete_eventos,
        payload: items
    });

    storage(storageKeys.eventos, items,callback);
};

export const updateEvento = (payload, callback)=>(dispatch,getState)=>{

    let items = [ ...getState().eventos ];

    let found = false;

    for(let i = 0; i < items.length; i++){
        if(items[i].ID === payload.ID){
            items[i] = new Evento(payload);
            found = true;
        }
    }

    if(!found){
        items.push(new Evento(payload));
    }

    dispatch({
        type:actions.update_eventos,
        payload:items
    });

    storage(storageKeys.eventos, items,callback);
};