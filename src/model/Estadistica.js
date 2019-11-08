import { ACTIONS, EVALUACIONES_FISICAS, EVALUACIONES_NUTRICION, SEXO } from "../services/constants";
import { post, ROUTES } from '../services/post';
import errors from "../services/errors";
import { Referencia } from "./Referencia";

export class Estadistica {
    static parametros = [
        'Número de evaluadores',
        'Número de alumnos',
        'Total de usuarios',
        'Alumnos atendidos',
        'Alumnos promedio por evaluador',
        'Evaluaciones por día',
        'Calificación promedio de evaluadores',
        'Actividad física - Promedios de evaluación',
        'Nutrición - Promedios de evaluación'
    ];

    static toZero (value, toFixed) {
        if (!value) return 0;
        if (toFixed) return parseFloat(`${value}`).toFixed(toFixed);
        else return parseFloat(`${value}`);
    }

    static chartsCentros (parametro, data) {
        let charts = [];
        
        const legend = data.map((x, i) => `C${i+1}: ${x.nombre}`);
        
        const config = {
            type: 'bar',
            verticalLabelRotation: 0
        };

        if (parametro === 0) {
            const labelsNutriologos = data.map((x, i) => `C${i+1}&${Estadistica.toZero(x.nutriologos)}`);
            const labelsEntrenadores = data.map((x, i) => `C${i+1}&${Estadistica.toZero(x.entrenadores)}`);
            const nutriologos = data.map(x => Estadistica.toZero(x.nutriologos));
            const entrenadores = data.map(x => Estadistica.toZero(x.entrenadores));
            
            charts.push({ 
                ...config,
                labels: labelsNutriologos,
                legend,
                title: 'Número de nutriólogos',
                datasets: [
                    {
                        data: nutriologos
                    }
                ]
            });

            charts.push({ 
                ...config,
                labels: labelsEntrenadores,
                title: 'Número de entrenadores',
                datasets: [
                    {
                        data: entrenadores
                    }
                ]
            });
        }
        else if (parametro === 1) {
            const labelsMasculino = data.map((x, i) => `C${i+1}&${Estadistica.toZero(x.masculino)}`);
            const labelsFemenino = data.map((x, i) => `C${i+1}&${Estadistica.toZero(x.femenino)}`);
            const masculino = data.map(x => Estadistica.toZero(x.masculino));
            const femenino = data.map(x => Estadistica.toZero(x.femenino));
            
            charts.push({ 
                ...config,
                labels: labelsMasculino,
                legend,
                title: 'Número de alumnos',
                datasets: [
                    {
                        data: masculino
                    }
                ]
            });

            charts.push({ 
                ...config,
                labels: labelsFemenino,
                title: 'Número de alumnas',
                datasets: [
                    {
                        data: femenino
                    }
                ]
            });
        } else if (parametro === 2) {
            const labelsEvaluadores = data.map((x, i) => `C${i+1}&${Estadistica.toZero(x.evaluadores)}`);
            const labelsAlumnos = data.map((x, i) => `C${i+1}&${Estadistica.toZero(x.alumnos)}`);
            const evaluadores = data.map(x => Estadistica.toZero(x.evaluadores));
            const alumnos = data.map(x => Estadistica.toZero(x.alumnos));
            
            charts.push({ 
                ...config,
                labels: labelsEvaluadores,
                legend,
                title: 'Número de evaluadores',
                datasets: [
                    {
                        data: evaluadores
                    }
                ]
            });

            charts.push({ 
                ...config,
                labels: labelsAlumnos,
                title: 'Número de alumnos',
                datasets: [
                    {
                        data: alumnos
                    }
                ]
            });
        }
        return charts;
    }

    static _evaluadoresPruebasMediciones (charts, config, data, titlePruebas, titleMediciones) {
        const labelsPruebas = data.map((x, i) => `C${i+1}&${Estadistica.toZero(x.pruebas, 1)}`);
        const labelsMediciones = data.map((x, i) => `C${i+1}&${Estadistica.toZero(x.mediciones, 1)}`);
        const pruebas = data.map(x => Estadistica.toZero(x.pruebas, 1));
        const mediciones = data.map(x => Estadistica.toZero(x.mediciones, 1));
        
        const legend = data.map((x, i) => `C${i+1}: ${x.nombre}`);

        charts.push({ 
            ...config,
            labels: labelsPruebas,
            legend,
            title: titlePruebas,
            datasets: [
                {
                    data: pruebas
                }
            ]
        });

        charts.push({
            ...config,
            labels: labelsMediciones,
            title: titleMediciones,
            datasets: [
                {
                    data: mediciones
                }
            ]
        });
    }

    static chartsEvaluadores (parametro, data) {
        let charts = [];
        
        const config = {
            type: 'bar',
            verticalLabelRotation: 0
        };

        if (parametro === 3) {
            Estadistica._evaluadoresPruebasMediciones(charts, config, data, 'Alumnos en pruebas físicas', 'Alumnos en Nutrición');
        }
        else if (parametro === 4) {
            Estadistica._evaluadoresPruebasMediciones(charts, config, data, 'Alumnos por entrenador', 'Alumnos por nutriólogo');
        } else if (parametro === 5) {
            Estadistica._evaluadoresPruebasMediciones(charts, config, data, 'Evaluaciones por entrenador', 'Evaluaciones por nutriólogo');
        } else if (parametro === 6) {
            const labels = data.map((x, i) => `C${i+1}&${Estadistica.toZero(x.ranking, 1)}`);
            const values = data.map(x => Estadistica.toZero(x.ranking, 1));
            
            const legend = data.map((x, i) => `C${i+1}: ${x.nombre}`);

            charts.push({ 
                ...config,
                labels,
                legend,
                title: 'Calificación promedio del servicio',
                datasets: [
                    {
                        data: values
                    }
                ]
            });
        }
        return charts;
    }

    static chartsAlumnos (parametro, data, sexo) {
        let charts = [];
        
        const config = {
            type: 'bar',
            verticalLabelRotation: 0
        };

        if (parametro === 7) {
            const columns = [
                'equilibrio',
                'coordinacion',
                'flexibilidad',
                'brazos',
                'piernas',
                'abdomen',
                'resistencia'
            ];

            charts = EVALUACIONES_FISICAS.map((item, index) => {
                const legend = data.map((x, i) => `C${i+1}: ${x.nombre}`);
                const values = data.map(x => Estadistica.toZero(x[columns[index]], 2));
                const labels = values.map((x, i) => `C${i+1}&${x}`);
                return { 
                    ...config,
                    ...(index === 0 && { legend }),
                    labels,
                    title: item,
                    datasets: [
                        {
                            data: values
                        }
                    ]
                }
            });
        }
        else if (parametro === 8) {
            charts = EVALUACIONES_NUTRICION.map((item, index) => {
                const legend = data.map((x, i) => `C${i+1}: ${x.nombre}`);
                const values = data.map(x => {
                    switch (index) {
                        case 0:
                            return Estadistica.toZero(x.peso, 2);
                        case 1:
                            return Estadistica.toZero(x.estatura, 2);
                        case 2:
                            return Estadistica.toZero(Referencia.imc(x.peso, x.estatura), 2);
                        case 3:
                            return Estadistica.toZero(x.cintura,2);
                        case 4:
                            return Estadistica.toZero(Referencia.cinturaCadera(x.cintura, x.cadera),2);
                        case 5:
                            return Estadistica.toZero(
                                Referencia.grasaPorcentaje(
                                    Referencia.sumatoriaSeisPliegues([
                                        Estadistica.toZero(x.abdominal),
                                        Estadistica.toZero(x.musloFrontal),
                                        Estadistica.toZero(x.pantorrillaMedial),
                                        Estadistica.toZero(x.subescapular),
                                        Estadistica.toZero(x.supraespinal),
                                        Estadistica.toZero(x.tricipital),
                                    ]),
                                sexo),
                            2);
                        default:
                            return 0;
                    }
                });
                const labels = values.map((x, i) => `C${i+1}&${x}`);
                return { 
                    ...config,
                    ...(index === 0 && { legend }),
                    labels,
                    title: item,
                    datasets: [
                        {
                            data: values
                        }
                    ]
                }
            });
        }

        if (sexo === SEXO.A) {
            charts.splice(charts.length -1, 1);
        }
        return charts;
    }

    static prepareCharts (params, data) {
        const { parametro, sexo } = params;
        let prepared = { 
            parametro,
            charts: []
        };
        if (parametro >= 0 && parametro <= 2) {
            prepared.charts = Estadistica.chartsCentros(parametro, data);
        } else if (parametro >= 3 && parametro <= 6) {
            prepared.charts = Estadistica.chartsEvaluadores(parametro, data);
        } else if (parametro >= 7) {
            prepared.charts = Estadistica.chartsAlumnos(parametro, data, sexo);
        }
        return prepared;
    }

    static async fetch(network, token, data={}, processDidEnd, action=ACTIONS.select + 'charts', route = ROUTES.ESTADISTICA) {
        if(network){
            let response = await post(route, { action, ...data }, token);
            processDidEnd(response);
        } else {
            processDidEnd({
                error:errors.network
            });
        }
    }
}