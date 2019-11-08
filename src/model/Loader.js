import { getStorage, storageKeys, setStorage } from "../services/storage";
import { ACTIONS, USUARIOS, ROLES } from '../services/constants';
import { ROUTES } from '../services/post';
import { Usuario } from "./Usuario";
import { Centro } from "./Centro";
import { Disciplina } from "./Disciplina";
import { Actividad } from "./Actividad";
import { Evento } from "./Evento";
import { Referencia } from "./Referencia";
import Toast from 'react-native-root-toast';
import moment from 'moment';

export class LoaderModule {
    
    constructor() {
        const keys = Object.keys(storageKeys);
        this.data = {};
        for (let k of keys) {
            this.data[k] = null;
        }
    }

    async getInitialStorage() {
        const storage = await getStorage();
        const keys = Object.keys(storage);
        for (let k of keys) {
            this.data[k] = JSON.parse(storage[k]);
        }
    }

    async putStorageIntoStore({
        network,
        token,
        usuario,
        onLoadActividades,
        onLoadAlumnos,
        onLoadCentros,
        onLoadCoordinadores,
        onLoadEvaluadores,
        onLoadEventos,
        onLoadDisciplinas,
        onLoadReferencias
    }, callback) {
        const {
            coordinadores,
            centros,
            evaluadores,
            alumnos,
            disciplinas,
            actividades, 
            eventos,
            referencias,
            refresh_date
        } = this.data;

        const date = moment().startOf('day');
        let refreshed = false;

        if (refresh_date && (moment(refresh_date).isSame(date))) {
            refreshed = true;
        }

        const tipo = usuario.tipo;
        
        if(tipo === USUARIOS.coordinador) {
            if (coordinadores) {
                onLoadCoordinadores(coordinadores, null, false);
            } else {
                let toast = Toast.show('Cargando coordinadores', { shadow: false, duration: 3000 });
                await Usuario.fetch(network, ROUTES.COORDINADOR, ACTIONS.select,{
                    tipo:USUARIOS.coordinador
                },token, ({error, data})=>{
                    onLoadCoordinadores(data, null);
                });
                Toast.hide(toast);
            }

            if (evaluadores) {
                onLoadEvaluadores(evaluadores, null, false);
            } else {
                let toast = Toast.show('Cargando evaluadores', { shadow: false, duration: 3000 });
                await Usuario.fetch(network, ROUTES.EVALUADOR, ACTIONS.select,{
                    tipo:USUARIOS.evaluador
                },token, ({error, data})=>{
                    onLoadEvaluadores(data, null);
                });
                Toast.hide(toast);
            }
        }
        
        if (centros) {
            onLoadCentros(centros, null, false);
        } else {
            let toast = Toast.show('Cargando centros', { shadow: false, duration: 3000 });
            await Centro.fetch(network, ROUTES.CENTRO, ACTIONS.select, null, token, ({error,data}) => {
                onLoadCentros(data, null);
            });
            Toast.hide(toast);
        }

        if (tipo === USUARIOS.evaluador) {
            if (alumnos) {
                onLoadAlumnos(alumnos, null, false);
            } else {
                let toast = Toast.show('Cargando alumnos', { shadow: false, duration: 3000 });
                await Usuario.fetch(network, ROUTES.ALUMNO, ACTIONS.select,{
                    tipo: USUARIOS.alumno,
                    ID: usuario.ID,
                    centro: usuario.centro ? usuario.centro.ID : '',
                    source: (usuario.rol == ROLES.entrenador ? 'pruebas' : 'mediciones')
                }, token, ({ error, data })=>{
                    onLoadAlumnos(data, null);
                });
                Toast.hide(toast);
            }
        }

        if (disciplinas) {
            onLoadDisciplinas(disciplinas, null, false);
        } else {
            let toast = Toast.show('Cargando disciplinas', { shadow: false, duration: 3000 });
            await Disciplina.fetch(network, token, null, ({error,data}) => {
                onLoadDisciplinas(data, null);
            });
            Toast.hide(toast);
        }

        if (refreshed || (!network && referencias)) {
            onLoadReferencias(referencias, null, false);
        } else {
            let toast = Toast.show('Cargando referencias', { shadow: false, duration: 3000 });
            await Referencia.fetch(network, token, null, ({error,data}) => {
                onLoadReferencias(data, null);
            });
            Toast.hide(toast);
        }

        if (actividades) {
            onLoadActividades(actividades, null, false);
        } else {
            let toast = Toast.show('Cargando actividades', { shadow: false, duration: 3000 });
            await Actividad.fetch(network, token, null, ({error,data}) => {
                onLoadActividades(data, null);
            });
            Toast.hide(toast);
        }

        if (refreshed || (!network && eventos)) {
            onLoadEventos(eventos, null, false);
        } else {
            let toast = Toast.show('Cargando eventos', { shadow: false, duration: 3000 });
            await Evento.fetch(network, token, null, ({error,data}) => {
                onLoadEventos(data, null);
            });
            Toast.hide(toast);
        }

        if (network && !refreshed) {
            await setStorage(storageKeys.refresh_date, moment().startOf('day').valueOf().toString());
        }

        callback();
    }
}