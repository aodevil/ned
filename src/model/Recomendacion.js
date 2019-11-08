import { ROLES } from "../services/constants";
import { ACTIONS } from "../services/constants";
import { post, ROUTES } from '../services/post';
import errors from "../services/errors";

export class Recomendacion {

    static ROUTE = 'recomendaciones';
    static LEVEL = { alumno: 0, grupo: 1 }
    constructor(i) {
        if (i) {
            this.copy(i)
        } else {
            this.init();
        }
    }

    init () {
        this.ID = 0;
        this.envia = '';
        this.nombres = '';
        this.rol = ROLES.entrenador;
        this.fecha = +new Date(),
        this.texto = '';
        this.tipo = Recomendacion.LEVEL.alumno;
        this.titulo = '';
    }

    copy (i) {
        this.ID = i.ID || 0;
        this.envia = i.envia || '';
        this.nombres = i.nombres || '';
        this.rol = ((i.rol && !isNaN(i.rol)) ? parseInt(i.rol) : ROLES.entrenador);
        this.fecha = i.fecha || +new Date(),
        this.texto = i.texto || '';
        this.titulo = i.titulo || '';
        this.tipo = i.tipo || Recomendacion.LEVEL.alumno;
    }

    static async fetch(network, token, data={}, processDidEnd, action=ACTIONS.select, route = ROUTES.ALUMNO){
        if(network){
            let response = await post(route, {action : `${action}${Recomendacion.ROUTE}`, ...data}, token);
            processDidEnd(response);
        }else{
            processDidEnd({
                error:errors.network
            });
        }
    }
}