import actions from "../actions.json";

export const network = (payload, callback)=>(dispatch,getState)=>{
    dispatch({
        type:actions.network,
        payload
    });

    if(callback)callback(payload);
};

export const toggleNetworkNotification = (payload)=>({
    type:actions.network_notification,
    payload
});