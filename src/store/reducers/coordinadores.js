import actions from "../actions.json";
import initialState from "../initialState.json";

export const coordinadores = (state = initialState.coordinadores,{type,payload})=>{
    switch(type){
        case actions.load_coordinadores:
        case actions.update_coordinadores:
            return payload || state;
        case actions.delete_coordinadores:
            return state.filter(x=>x.ID !== payload.ID);
        default:
            return state;
    }
}