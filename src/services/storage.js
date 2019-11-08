import {Alert} from "react-native";
import AsyncStorage from '@react-native-community/async-storage';
import errors from './errors';

export const storageKeys = {
    token:"token",
    usuario:"usuario",
    coordinadores:"coordinadores",
    centros:"centros",
    evaluadores:"evaluadores",
    alumnos:"alumnos",
    disciplinas: "disciplinas",
    actividades: "actividades",
    eventos: "eventos",
    referencias: "referencias",
    evaluaciones: "evaluaciones",
    alumnos_tmp: "alumnos_tmp",
    alumno_evaluaciones: "alumno_evaluaciones",
    refresh_date: "refresh_date"
}

export const setStorage = async (key,data) => {
    try {
        return await AsyncStorage.setItem(key, data);
    } catch (error) {
        Alert.alert(
            "Local storage",
            errors.setStorage
        );
    }
}

export const setMultiStorage = async (key,keyValuePairs)=>{
    try {
        return await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
        Alert.alert(
            "Local storage",
            errors.setStorage
        );
    }
}

export const getStorage = async (key) => {
    try {
        if (!!key) {
            return await AsyncStorage.getItem(key);
        } else {
            const keys = await AsyncStorage.getAllKeys((error, keys) => { 
                if (error) {
                    return [];
                } else {
                    return keys;
                }
            });
            const result = await AsyncStorage.multiGet(keys, (error, items) => {
                if (error) {
                    return null;
                }
                return items;
            });

            if (result) {
                const storage = {};
                for (let i of result) {
                    const [prop, value] = i;
                    storage[prop] = value;
                }
                return storage;
            }
            return null;
        }
    } catch (error) {
        Alert.alert(
            "Local storage",
            errors.getStorage
        );
    }
}

export const removeStorageItem = async (key) => {
    try{
        return await AsyncStorage.removeItem(key);
    }catch(error){
        Alert.alert(
            "Local storage",
            errors.getStorage
        );
    }
}

export const clearStorage = async () => {
    try{
        return await AsyncStorage.clear();
    }catch(error){
        Alert.alert(
            "Local storage",
            errors.getStorage
        );
    }
}