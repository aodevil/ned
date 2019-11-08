import actions from "../actions.json";
import initialState from "../initialState.json";

export const alumnos = (state = initialState.alumnos,{type,payload})=>{
    switch(type){
        case actions.load_alumnos:
        case actions.update_alumnos:
            return payload || state;
        case actions.delete_alumnos:
            return state.filter(x=>x.ID !== payload.ID);
        default:
            return state;
    }
}