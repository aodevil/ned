import actions from "../actions.json";
import initialState from "../initialState.json";

export const actividades = (state = initialState.actividades,{type,payload})=>{
    switch(type){
        case actions.load_actividades:
        case actions.update_actividades:
        case actions.delete_actividades:
            return payload || state;
        default:
            return state;
    }
}

export const eventos = (state = initialState.eventos,{type,payload})=>{
    switch(type){
        case actions.load_eventos:
        case actions.update_eventos:
        case actions.delete_eventos:
            return payload || state;
        default:
            return state;
    }
}