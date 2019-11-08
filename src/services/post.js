import ERRORS from "./errors.json";

const controller = "https://domain.com/controller.php";

export const ROUTES = {
    LOGIN:"login",
    COORDINADOR:"coordinator",
    EVALUADOR:"evaluator",
    ALUMNO:"athletes",
    ACTIVO:"active",
    CENTRO:"centros",
    EVENTO:"eventos",
    DISCIPLINA: "disciplinas",
    ACTIVIDADES: "actividades",
    EVENTOS: "eventos",
    REFERENCIAS: 'referencias',
    PASSWORD: 'password',
    ESTADISTICA: 'estadistica'
};

export const post = async (route, params={}, token=null)=>{
    try {
        let response = await fetch(controller,{
            method:"POST",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                route,
                token,
                params
            })
        });
        let json = await response.json();
        return json;
    } catch (error) {
        return {
            error:ERRORS.connection
        };
    }
}