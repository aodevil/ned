import actions from "../actions.json";
import { setStorage, storageKeys } from "../../services/storage.js";

export const token = (payload, callback)=>(dispatch, getState)=>{
    dispatch({
        type:actions.set_token,
        payload
    });
    if(callback)callback();
};

export const login = (payload, callback)=>(dispatch,getState)=>{
    
    dispatch({
        type:actions.login,
        payload
    });

    setStorage(storageKeys.usuario,payload?JSON.stringify(payload):null)
    .then(callback)
    .catch(callback);
};

export const logout = (callback)=>(dispatch,getState)=>{
    dispatch({
        type:actions.logout,
        payload:null
    });
    if(callback)callback();
};