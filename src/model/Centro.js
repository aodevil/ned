import shortId from "shortid";
import { CENTROSHORARIOS, ACTIONS } from "../services/constants";
import isLatLong from "validator/lib/isLatLong";
import { dayNameWithIndex } from "../services/functions";
import { post } from '../services/post';
import errors from "../services/errors";

export class Centro {
    static defaultLong = -103.34775458;
    static defaultLat = 20.69898808;

    constructor(i){
        if(i){
            this.copy(i);
        }else{
            this.init();
        }
    }

    copy(i){
        this.ID=i.ID || "";
        this.nombre = i.nombre || "";
        this.ciudad = i.ciudad || "";
        this.estado = i.estado || "";
        this.cp = i.cp || "";
        this.pais = i.pais || "";
        this.long = i.long ? parseFloat(i.long.toString()) : 0;
        this.lat = i.lat ? parseFloat(i.lat.toString()) : 0;
        this.domicilio = i.domicilio || "";
        this.email = i.email || "";
        this.telefonos = [];
        if(i.telefonos && i.telefonos.length > 0){
            i.telefonos.forEach(tel => {
                this.telefonos.push({...tel});
            });
        }
        this.horarios = [];
        if(i.horarios){
            i.horarios.forEach(e => {
                this.horarios.push({...e});
            });
            // this.horarios.sort((a,b)=>{
            //     return a.de_dia < b.de_dia?-1:1;
            // });
        }
    }

    init(){
        this.setID();
        this.nombre = "";
        this.domicilio = "";
        this.ciudad = "";
        this.estado = "";
        this.cp = "";
        this.pais = "";
        this.long = 0;
        this.lat = 0;
        this.email = "";
        this.telefonos = [];
        this.horarios = [];
    }

    setID = ()=>{
        this.ID = shortId.generate();
    }

    setDefaultLongLat = ()=>{
        if(
            (!this.long && !this.lat) ||
            !isLatLong(`${this.lat},${this.long}`)
        ){
            this.lat = Centro.defaultLat;
            this.long = Centro.defaultLong;
        }
    }

    setDomicilioFromLongLat = ()=>{
        return `${this.lat.toString().substring(0,15)}, ${this.long.toString().substring(0,15)}`;
    }

    static locationToString = (item) => {
        const { ciudad, estado, pais, cp } = item;
        let str = (!!ciudad ? `${ciudad}, ` : '' );
        str += (!!estado ? `${estado}. ` : '' );
        str += (!!pais ? `${pais}. ` : '' );
        str += (!!cp ? `C.P. ${cp}.` : '' );
        return str;
    }

    static getRawList = (centros)=>{
        let result = [];
        for(let c of centros){
            result.push(c.nombre);
        }
        return result;
    }

    static getNameWithId = (ID, centros)=>{
        let name = "";
        for(let c of centros){
            if(c.ID === ID)name = c.nombre;
        }
        return name;
    }

    static getIdWithName = (name, centros)=>{
        let ID = "";
        for(let c of centros){
            if(c.nombre === name)ID = c.ID;
        }
        return ID;
    }

    static getIndexWithId = (ID, centros)=>{
        if(ID)
        for(let i = 0;i<centros.length;i++){
            if(centros[i].ID === ID){
                return i;
            }
        }
        return -1;
    }

    static async fetch(network, route, action=ACTIONS.select, data={}, token, processDidEnd){
        if(network){
            let response = await post(route,{action, ...data}, token);
            processDidEnd(response);
        }else{
            processDidEnd({
                error:errors.network
            });
        }
    }

}

export class CentroHorario{
    constructor(i){
        if(i){
            this.copy(i);
        }else{
            this.init();
        }
    }

    copy(i){
        this.ID = i.ID || shortId.generate();
        this.de_dia = i.de_dia;
        this.hasta_dia = i.hasta_dia;
        this.de_hora = i.de_hora;
        this.hasta_hora = i.hasta_hora;
        this.tipo = i.tipo;
    }

    init(){
        this.ID = shortId.generate();
        this.de_dia = 0;
        this.hasta_dia = 0;
        this.de_hora = {h:0,m:0};
        this.hasta_hora = {h:0,m:0};
        this.tipo = CENTROSHORARIOS.instalacion;
    }

    static daysToString(x) {
        const { de_dia: i, hasta_dia: f } = x;
        let str = dayNameWithIndex(i);
        if (i !== f) {
            str += ((f - i < 1) ? ' y ' : ' a ');
            str += dayNameWithIndex(f);
        }
        return str;
    }

    static hoursToString(x) {
        const { h: ihTmp, m: im } = x.de_hora;
        const { h: fhTmp, m: fm } = x.hasta_hora;
        const ih = ihTmp > 12 ? ihTmp - 12 :  ihTmp;
        const fh = fhTmp > 12 ? fhTmp - 12 :  fhTmp;
        return `${ih < 10 ? `0${ih}`: ih}:${im < 10 ? `0${im}`: im} ${((ihTmp >= 12) ? 'pm' : 'am')} - ${fh < 10 ? `0${fh}`: fh}:${fm < 10 ? `0${fm}`: fm} ${((fhTmp >= 12) ? 'pm' : 'am')}`;
    }
}