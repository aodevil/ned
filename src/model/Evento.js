import shortId from "shortid";
import isURL from 'validator/lib/isURL';
import { stringToDate, rawStr } from "../services/functions";
import { ACTIVIDADES, ACTIONS } from "../services/constants";
import { post, ROUTES } from '../services/post';
import errors from "../services/errors";

export class Evento {
    constructor(i){
        if(i){
            this.copy(i);
        }else{
            this.init();
        }
    }

    copy(i){
        this.ID=i.ID || shortId.generate();
        this.nombre=i.nombre;
        this.fecha = stringToDate(i.fecha);
        this.hora = i.hora;
        this.centro = i.centro;
        this.lugar=i.lugar;
        this.tipo=i.tipo;
        this.descripcion=i.descripcion;
        this.disciplina=i.disciplina;
        this.nombreDisciplina=i.nombreDisciplina;
        this.enlaces = [];
        if(i.enlaces){
            i.enlaces.forEach(e => {
                if (rawStr(e.titulo) && rawStr(e.url) && isURL(e.url))
                    this.enlaces.push(new EventoEnlace(e));
            });
        }
    }

    init(){
        this.ID=shortId.generate();
        this.nombre="";
        this.fecha = new Date();
        this.hora = {h:0, m:0};
        this.centro = "";
        this.lugar="";
        this.tipo=-1;
        this.descripcion="";
        this.disciplina="";
        this.nombreDisciplina="";
        this.enlaces = [];
    }

    static hoursToString(time, count = false) {
        if (!time) return '';
        const { h, m } = time;
        let hour = h > 12 ? h - 12 : h;
        hour = hour < 10 ? `0${hour}` : `${hour}`;
        const minute = m < 10 ? `0${m}` : `${m}`;
        const meridiem = h >= 12 ? 'pm' : 'am';
        return `${(count ? (hour == 1) ? 'a la ' : 'a las ' : '')} ${hour}:${minute} ${meridiem}`;
    }

    /**
     * @param list array de eventos de la clase Evento
     */
    static getGroupsByName(list){
        let groups = [];
        list.forEach(e => {
            if(groups.indexOf(e.nombreDisciplina) < 0){
                groups.push(e.nombreDisciplina);
            }
        });

        let arr = [];

        groups.forEach(g => {
            list.forEach(i => {
                if(i.nombreDisciplina === g){
                    let item = arr.find(x=>x.title === g);
                    if(!item){
                        item = {
                            title:i.nombreDisciplina,
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
     * Devuelve una lista de eventos de un centro en específico agrupados por tipo
     * @param id string correspondiente al ID de un centro
     * @param list array de actividades de la clase Actividad
     * @param date? filtra sólo los eventos de un mes y año específicos.
     */
    static getItemsWithCenter(id,list, date){
        let groups = [];
        
        if(!date)date = new Date();

        let items = list.filter(x=>{ let fecha = stringToDate(x.fecha); return x.centro === id && (fecha.getFullYear() === date.getFullYear() && fecha.getMonth() === date.getMonth()); });

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

    static async fetch(network, token, data={}, processDidEnd, route = ROUTES.EVENTOS, action=ACTIONS.select){
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

export class EventoEnlace {
    constructor(i){
        if(i){
            this.copy(i);
        }else{
            this.init();
        }
    }

    copy(i){
        this.ID=i.ID || shortId.generate();
        this.titulo = i.titulo || '';
        this.url = i.url || '';
    }

    init(){
        this.ID=shortId.generate();
        this.titulo = '';
        this.url = '';
    }
}