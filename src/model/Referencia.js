import shortId from 'shortid';
import { ACTIONS, SEXO } from '../services/constants';
import { post, ROUTES } from '../services/post';
import errors from '../services/errors';
import colors from '../styles/colors.json';
import moment from 'moment';

export class Referencia {
    static RESULTS = {
        NULO: -1,
        BAJO: 0,
        NORMAL: 1,
        ALTO: 2
    }

    static RESULTS_LABELS = {
        VO2Max: ['VO2 Máx.', ''],
        pesoIdeal: ['Peso ideal', 'Kg'],
        imc: ['IMC', 'Kg/m2'], 
        icc: ['Cintura-Cadera', ''], 
        sumatoria: ['Σ 6 pliegues', ''], 
        grasa: ['Grasa', '%'],
        musculo: ['Músculo', 'Kg']

    }

    constructor(i){
        if(i){
            this.copy(i);
        }else{
            this.init();
        }
    }

    copy(i){
        this.ID = i.ID || shortId.generate();
        this.evaluacion = i.evaluacion;
        this.unidad = i.unidad;
        this.grupo = i.grupo;
        this.bajo = i.bajo && !isNaN(i.bajo) ? parseFloat(i.bajo.toString()) : 0;
        this.normal = i.normal && !isNaN(i.normal)  ? parseFloat(i.normal.toString()) : 0;
        this.alto = i.alto && !isNaN(i.alto)  ? parseFloat(i.alto.toString()) : 0;
        this.valor = i.valor || '';
    }

    init(){
        this.ID=shortId.generate();
        this.evaluacion = '';
        this.unidad = '';
        this.grupo = -1;
        this.bajo = 0;
        this.normal = 0;
        this.alto = 0;
        this.valor = '';
    }

    static getResult(reference, raw = false) {
        let result = Referencia.RESULTS.BAJO;
        const value = reference.valor || 0;
        if (!isNaN(value)) {
            const v = parseFloat(value.toString());
            if (v >= reference.bajo && v < reference.normal) result = Referencia.RESULTS.BAJO;
            else if (v >= reference.normal && v < reference.alto) result = Referencia.RESULTS.NORMAL;
            else if (v >= reference.alto) result = Referencia.RESULTS.ALTO;
        }
        if(raw) return result;
        else return Referencia.interpreter(result);
    }

    static interpreter(result) {
        let name, color;
        switch(result){
            case Referencia.RESULTS.BAJO:
                name = 'sad';
                color = colors.danger;
                break;
            case Referencia.RESULTS.NORMAL:
                name = 'happy';
                color = colors.primary;
                break;
            case Referencia.RESULTS.ALTO:
                name = 'trophy';
                color = colors.success;
                break;
            default:
                name = 'remove';
                color = colors.light;
                break;
        }
        return {
            name, color
        };
    }

    static reduce(list, simplify = false) {
        const reduced = JSON.parse(JSON.stringify(list)).reduce((result, next) => {
            if(next){
                result.data = result.data.concat(next.data);
            }
            return result;
        });
        if (simplify) {
            const items = [];
            for (let i of reduced.data) {
                items.push({
                    ID: i.ID,
                    evaluacion: i.evaluacion,
                    valor: (!!i.valor && !isNaN(i.valor) ? parseFloat(i.valor) : 0)
                });
            }
            return items;
        }
        return reduced.data;
    }

    static group(items, last = null, testToday = true) {
        let groups = [];
        let fetchLast = !testToday;
        if (last && testToday) {
            const today = moment().startOf('day');
            const date = moment(last.fecha);
            if (today.isSame(date)) {
                fetchLast = true;
            }
        }
        items.forEach(i => {
            if (groups.find(x => x.title === i.grupo)) return;
            groups.push({
                title: i.grupo,
                data: []
            });
        });
        groups.forEach(g => {
            items.forEach(i => {
                if (g.title === i.grupo) {
                    const item = new Referencia(i);
                    if (fetchLast && last) {
                        const evaluacion = last.evaluaciones.find(x => x.ID == i.ID);
                        if (evaluacion) item.valor = evaluacion.valor;
                    }
                    g.data.push(item);
                }
            });
        });
        return groups;
    }

    /**
     * @param {*} km obtenido mediante la prueba de Cooper
     */
    static VO2Max (km) {
        if(!isNaN(km) && km > 0){
            return 22.351 * km - 11.288;
        }
        return 0;
    }

    static pesoIdeal(estatura = 0, sexo = SEXO.M){
        if(estatura > 0){
            if(sexo === SEXO.M)
                return (Math.pow(estatura,2) * 23);
            else if(sexo == SEXO.F)
                return (Math.pow(estatura,2) * 22);
        }
        return 0;
    }
    
    static imc(peso = 0, estatura = 0){
        if(peso && estatura){
            return (peso / Math.pow(estatura,2));
        }
        return 0;
    }

    static cinturaCadera(cintura = 0, cadera = 0){
        if(cintura && cadera){
            return (cintura / cadera);
        }
        return 0;
    }
    
    static sumatoriaSeisPliegues(pliegues){
        let sum = 0;
        sum = pliegues.reduce((x, y) => {
            return x += y;
        });
        return sum;
    }

    static grasaPorcentaje(sum, sexo){
        if(sum && sum > 0){
          if(sexo === SEXO.M)
            return sum * 0.1052 + 2.585;
          else if(sexo === SEXO.F)
            return sum * 0.1548 + 3.58;
        }
        return 0;
    }

    static oseaKg(estatura, biestiloideo, biepicondileo){
        if(estatura && biestiloideo && biepicondileo){
            if(estatura > 0 && biestiloideo > 0 && biepicondileo > 0){
                return 3.02 * Math.pow(estatura, 2) * (biepicondileo / 1000) * (biestiloideo / 1000) * Math.pow(400,0.712);
            }
        }
        return 0;
    }

    static residualKg(peso, sexo){
        if(peso){
          return peso * ((sexo === SEXO.F) ? 0.209 : 0.241);
        }
        return 0;
      }
    
    static muscularlKg(peso, grasa, osea, residual){
        if(peso && grasa && osea && residual){
          return peso - ((peso * grasa)/100 + osea + residual);
        }
        return 0;
    }
    
    static calculateMediciones ({
        abdominal,
        biepicondileo,
        biestiloideo,
        cadera,
        cintura,
        estatura,
        muslofrontal,
        pantorrillamedial,
        peso,
        subescapular,
        supraespinal,
        tricipital,
    }, sexo) {
        const sumatoriaSeisPliegues = Referencia.sumatoriaSeisPliegues([tricipital, subescapular, supraespinal, abdominal, muslofrontal, pantorrillamedial]);
        const grasa = Referencia.grasaPorcentaje(sumatoriaSeisPliegues, sexo);
        const osea = Referencia.oseaKg(estatura, biestiloideo, biepicondileo);
        const residual = Referencia.residualKg(peso, sexo);
        
        return {
            pesoIdeal: Referencia.pesoIdeal(estatura, sexo),
            imc: Referencia.imc(peso, estatura), 
            icc: Referencia.cinturaCadera(cintura, cadera), 
            sumatoria: sumatoriaSeisPliegues, 
            grasa,
            musculo: Referencia.muscularlKg(peso, grasa, osea, residual)
        };
    }

    static calculatePruebas ({
        cooper
    }, sexo) {
        const VO2Max = Referencia.VO2Max(cooper);
        
        return {
            VO2Max
        };
    }

    static async fetch(network, token, data={}, processDidEnd, route = ROUTES.REFERENCIAS, action=ACTIONS.select){
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