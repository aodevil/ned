import actions from "../actions.json";
import initialState from "../initialState.json";

export const disciplinas = (state = initialState.disciplinas,{type,payload})=>{
    switch(type){
        case actions.load_disciplinas:
        case actions.update_disciplina:
        case actions.delete_disciplina:
            return payload || state;
        default:
            return state;
    }
}