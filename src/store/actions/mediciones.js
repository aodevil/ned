import actions from "../actions.json";

export const loadMediciones = (payload)=>({
    type:actions.load_mediciones,
    payload
});