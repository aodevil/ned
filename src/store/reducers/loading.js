import actions from "../actions.json";
import initialState from "../initialState.json";

export const loading = (state = initialState.loading,{type,payload})=>{
    if(type === actions.loading)return payload;
    return state;
}