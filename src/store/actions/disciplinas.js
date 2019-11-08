import actions from "../actions.json";
import { Disciplina } from "../../model/Disciplina";
import { setStorage, storageKeys } from "../../services/storage.js";

const storage = (payload, callback)=>{
    setStorage(storageKeys.disciplinas,payload?JSON.stringify(payload):null)
    .then(()=>{if(callback)callback(payload);})
    .catch(()=>{if(callback)callback(payload);});
}

export const loadDisciplinas = (payload, callback, store = true)=>(dispatch,getState)=>{
    dispatch({
        type:actions.load_disciplinas,
        payload
    });
    if(payload && store)storage(payload,callback);
    else if (callback) callback();
};

export const removeDisciplina = (payload, callback)=>(dispatch,getState)=>{

    const disciplinas = [...getState().disciplinas].filter(x => x.ID !== payload.ID);

    dispatch({
        type:actions.delete_disciplinas,
        payload: disciplinas
    });

    storage(disciplinas,callback);
};

export const updateDisciplina = (payload, callback)=>(dispatch,getState)=>{

    let disciplinas = [...getState().disciplinas];

    let found = false;

    for(let i = 0; i < disciplinas.length; i++){
        if(disciplinas[i].ID === payload.ID){
            disciplinas[i] = new Disciplina(payload);
            found = true;
        }
    }

    if(!found){
        disciplinas.push(new Disciplina(payload));
    }

    dispatch({
        type:actions.update_disciplinas,
        payload:disciplinas
    });

    storage(disciplinas,callback);
};