import actions from "../actions.json";
import initialState from "../initialState.json";

export const centros = (state = initialState.centros,{type,payload})=>{
    switch(type){
        case actions.load_centros:
        case actions.update_centros:
            return payload || state;
        case actions.delete_centros:
            return state.filter(x=>x.ID !== payload.ID);
        default:
            return state;
    }
}