import actions from "../actions.json";
import initialState from "../initialState.json";

export const evaluadores = (state = initialState.evaluadores,{type,payload})=>{
    switch(type){
        case actions.load_evaluadores:
        case actions.update_evaluadores:
            return payload || state;
        case actions.delete_evaluadores:
            return state.filter(x=>x.ID !== payload.ID);
        default:
            return state;
    }
}