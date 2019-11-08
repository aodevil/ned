import { SEXO, ACTIVIDADES, ACTIONS } from "../services/constants";
import { post, ROUTES } from '../services/post';
import shortId from "shortid";
import { dayNameWithIndex } from "../services/functions";
import errors from "../services/errors";

export class Actividad {
    constructor(i){
        if(i){
            this.copy(i);
        }else{
            this.init();
        }
    }

    copy(i){
        this.ID=i.ID || shortId.generate();
        this.centro = i.centro;
        this.lugar=i.lugar;
        this.nombre=i.nombre;
        this.disciplina=i.disciplina;
        this.descripcion=i.descripcion;
        this.tipo=i.tipo;
        this.horarios = [];
        if(i.horarios){
            i.horarios.forEach(e => {
                this.horarios.push(new ActividadHorario(e));
            });
        } else {
            this.horarios.push(new ActividadHorario());
        }
        this.horarios.sort((a,b)=>{
            return a.dias < b.dias?-1:1;
        });
    }

    init () {
        this.ID=shortId.generate();
        this.centro="";
        this.lugar="";
        this.nombre="";
        this.disciplina="";
        this.descripcion="";
        this.tipo=-1;
        this.horarios = [ new ActividadHorario() ];
    }

    /**
     * @param list array de actividades de la clase Actividad
     */
    static getGroupsByName(list){
        let groups = [];
        list.forEach(e => {
            if(groups.indexOf(e.nombre) < 0){
                groups.push(e.nombre);
            }
        });
        groups.sort();

        let arr = [];

        groups.forEach(g => {
            list.forEach(i => {
                if(i.nombre === g){
                    let item = arr.find(x=>x.title === g);
                    if(!item){
                        item = {
                            title:g,
                            data:[
                                i
                            ]
                        };
                        arr.push(item);
                    }else{
                        item.data.push(i);
                    }

                }
            });
        });

        return arr;
    }

    /**
     * Devuelve una lista de actividades de un centro en específico agrupadas por tipo
     * @param id string correspondiente al ID de un centro
     * @param list array de actividades de la clase Actividad
     */
    static getItemsWithCenter(id,list){
        let groups = [];
        let items = list.filter(x=>x.centro === id);
        items.forEach(e => {
            let tipo = ACTIVIDADES.tipos[e.tipo];
            if(groups.indexOf(tipo) < 0){
                groups.push(tipo);
            }
        });
        groups.sort();

        let arr = [];

        groups.forEach(g => {
            items.forEach(i => {
                if(ACTIVIDADES.tipos[i.tipo] === g){
                    let item = arr.find(x=>x.title === g);
                    if(!item){
                        item = {
                            title:g,
                            data:[
                                i
                            ]
                        };
                        arr.push(item);
                    }else{
                        item.data.push(i);
                    }

                }
            });
        });

        return arr;
    }

    static async fetch(network, token, data={}, processDidEnd, route = ROUTES.ACTIVIDADES, action=ACTIONS.select){
        if(network){
            let response = await post(route, {action, ...data}, token);
            processDidEnd(response);
        }else{
            processDidEnd({
                error:errors.network
            });
        }
    }
}

export class ActividadHorario{
    constructor(i){
        if(i){
            this.copy(i);
        }else{
            this.init();
        }
    }

    copy(i){
        this.ID = i.ID || shortId.generate();
        this.dias = i.dias?[...i.dias]:[];
        this.de_hora = i.de_hora;
        this.hasta_hora = i.hasta_hora;
        this.sexo=i.sexo;
        this.edad_min=i.edad_min;
        this.edad_max=i.edad_max;
        this.requisitos = [];
        if(i.requisitos){
            i.requisitos.forEach(e => {
                this.requisitos.push(new ActividadDetails(e));
            });
        }
        this.costos = [];
        if(i.costos){
            i.costos.forEach(e => {
                this.costos.push(new ActividadDetails(e));
            });
        }
    }

    init(){
        this.ID=shortId.generate();
        this.sexo=SEXO.A;
        this.edad_min='';
        this.edad_max='';
        this.dias = [];
        this.de_hora = {h: 0, m: 0};
        this.hasta_hora = {h: 0, m: 0};
        this.requisitos = [];
        this.costos = [];
    }

    static daysToString(dias){
        let str ="";
        if(dias && dias.length > 0){
            if(dias.length >= 7 || dias.indexOf(7) >= 0){
                return "Todos los días";
            }
            let arr = [];
            for(let i = 0; i < dias.length; i++){
                arr.push(dayNameWithIndex(dias[i]));
            }
            if(arr.length > 0){
                
                str = arr.length >= 2 ? arr.splice(0, arr.length -1).join(", ") + ' y ' + arr[arr.length-1] : arr.join(', ');
            }
        }
        return str;
    }

    static hoursToString(time) {
        if (!time) return '';
        const { h, m } = time;
        let hour = h > 12 ? h - 12 : h;
        hour = hour < 10 ? `0${hour}` : `${hour}`;
        const minute = m < 10 ? `0${m}` : `${m}`;
        const meridiem = h >= 12 ? 'pm' : 'am';
        return `${hour}:${minute} ${meridiem}`;
    }

    static hoursFromToString(desde, hasta) {
        const a = ActividadHorario.hoursToString(desde);
        const b = ActividadHorario.hoursToString(hasta);

        return `de ${a} a ${b}`;
    }
}

export class ActividadDetails{
    tipos = {
        costos: 0,
        requisitos: 1,
        otros: 2
    };

    constructor(i){
        if(i){
            this.copy(i);
        }else{
            this.init();
        }
    }

    copy(i){
        this.ID = i.ID || shortId.generate();
        this.concepto = i.concepto;
        this.valor = i.valor;
        this.tipo = i.tipo;
    }

    init(){
        this.ID = shortId.generate();
        this.tipo = this.tipos.costo;
        this.concepto = '';
        this.valor = '';
    }

    setTipo (tipo) {
        this.tipo = this.tipos[tipo];
    }
}