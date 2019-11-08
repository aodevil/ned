import actions from "../actions.json";
import initialState from "../initialState.json";

export const network = (state = initialState.network,{type,payload})=>{
    if(type === actions.network)return payload;
    return state;
}

export const networkNotification = (state = initialState.networkNotification,{type,payload})=>{
    if(type === actions.network_notification)return payload;
    return state;
}