import actions from "../actions.json";
import initialState from "../initialState.json";

export const mediciones = (state = initialState.mediciones,{type,payload})=>{
    switch(type){
        case actions.load_mediciones:
            return payload || state;
        default:
            return state;
    }
}