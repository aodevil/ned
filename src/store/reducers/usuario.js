import actions from "../actions.json";
import initialState from "../initialState.json";

export const usuario = (state = initialState.usuario,{type,payload})=>{
    switch(type){
        case actions.login:
            return {...payload};
        case actions.logout:
        default:
            return state;
    }
}

export const token = (state = initialState.token, {type,payload})=>{
    if(type === actions.set_token)return payload;
    return state;
}