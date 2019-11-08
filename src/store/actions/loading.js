import actions from "../actions.json";

/** @param callback is a function that receives as parameter another callback, in this case sets loading value to it's inverse */
export const loading = (payload, callback)=>(dispatch,getState)=>{
    dispatch({
        type:actions.loading,
        payload
    });

    if(callback)callback(()=>{
        dispatch({
            type:actions.loading,
            payload:!payload
        });
    });
};