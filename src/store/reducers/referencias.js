import actions from "../actions.json";
import initialState from "../initialState.json";

export const referencias = (state = initialState.referencias,{type,payload})=>{
    switch(type){
        case actions.load_referencias:
        case actions.update_referencias:
            return payload || state;
        default:
            return state;
    }
}