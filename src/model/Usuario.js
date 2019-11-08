import shortId from "shortid";
import { USUARIOS, SEXO, ACTIONS, ROLES} from "../services/constants";
import errors from "../services/errors";
import routes from '../providers/routes';
import { post } from '../services/post';
import { rawStr } from "../services/functions";

export class Usuario {
    constructor(i){
        if(i){
            this.copy(i);
        }else{
            this.init();
        }
    }

    copy(i){
        this.ID=i.ID || shortId.generate();
        this.usuario=Usuario.fixUserName(i.usuario || '');
        this.email=i.email || "";
        this.telefono=i.telefono || "";
        this.tipo=i.tipo;
        this.activo=false;
        this.activo = i.activo;
        this.validada=i.validada;
        this.token=i.token;
        this.nombres = i.nombres || "";
        this.apellidos = i.apellidos || "";
        this.sexo = i.sexo;
        this.nacimiento = i.nacimiento || null;
        this.registro = i.registro || null;
        this.centro = i.centro || null;
        this.master = i.master || false;
        this.rol = i.rol || 0;
        this.registrante = i.registrante || '';
        this.actividades = [];
        if (i.actividades) {
            for(let actividad of i.actividades) {
                this.actividades.push(actividad);
            }
        }
        this.eventos = [];
        if (i.eventos) {
            for(let evento of i.eventos) {
                this.eventos.push(evento);
            }
        }
        this.evaluacion = {
            fecha: +new Date(),
            evaluaciones: []
        };
        if (i.evaluacion && i.evaluacion.evaluaciones) {
            this.evaluacion.fecha = i.evaluacion.fecha;
            for(let evaluacion of i.evaluacion.evaluaciones) {
                delete evaluacion.evaluacion;
                this.evaluacion.evaluaciones.push(evaluacion);
            }
        }
    }

    init(){
        this.ID=shortId.generate();
        this.usuario="";
        this.email="";
        this.telefono="";
        this.tipo=0;
        this.activo=true;
        this.validada=false;
        this.token="";
        this.nombres = "";
        this.apellidos = "";
        this.sexo = SEXO.M;
        this.nacimiento = null;
        this.registro = null;
        this.centro = null;
        this.master = false;
        this.registrante = '';
        this.rol = ROLES.none;
        this.actividades = [];
        this.eventos = [];
        this.evaluacion = {
            fecha: +new Date(),
            evaluaciones: []
        };
    }

    equals(i){
        if(
            this.ID===i.ID &&
            this.usuario===i.usuario &&
            this.email===i.email &&
            this.telefono===i.telefono &&
            this.tipo===i.tipo &&
            this.activo===i.activo &&
            this.validada===i.validada &&
            this.token===i.token &&
            this.nombres===i.nombres &&
            this.apellidos===i.apellidos &&
            this.sexo===i.sexo &&
            this.nacimiento===i.nacimiento &&
            this.registro===i.registro &&
            this.centro === i.centro
        )return true;
        return false;
    }

    static fixUserName(value) {
        return rawStr(value).replace(/\W/gi,'').toUpperCase();
    }

    static reduce(usuario, contrasena, insert = true) {
        if (!usuario) return null;
        let x = new Usuario(usuario);
        if (insert) x.usuario = Usuario.fixUserName(shortId.generate());
        delete x.centro;
        delete x.master;
        delete x.actividades;
        delete x.eventos;
        delete x.evaluacion;
        x.contrasena = contrasena;
        return x;
    }

    static isAdmin({usuario,token},tipos=[USUARIOS.coordinador, USUARIOS.evaluador]){
        let tipo = 0;
        if(usuario.tipo){
            tipo = parseInt(usuario.tipo.toString());
        }

        return (token && usuario && tipos.indexOf(tipo) >= 0);
    }

    static routeForUser(tipo=0){
        let keys = Object.keys(routes.prefix);
        return routes.prefix[keys[tipo]] + routes.userHomePage[keys[tipo]];
    }

    static deactivate(active, u, dispatch, callback){
        let usuario = new Usuario(u);
        if(usuario.activo === active)callback();
        else {
            usuario.activo = active;
            dispatch(usuario,callback);
        }
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