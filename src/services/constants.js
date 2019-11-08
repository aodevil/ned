export const MBXTOKEN = "<token de mapbox -  se debe crear una cuenta>";

export const ACTIONS = {
    select:"select",
    delete:"delete",
    edit:"edit",
    insert:"insert",
    update:"update",
    login:"login"
}

export const SEXO = {
    M:0,
    F:1,
    A:2 //#ambos, se aplica en el caso de actividades o eventos donde se indica si está disponible para ambos sexos o sólo para alguno.
};

export const SEXOS = [
    "Masculino",
    "Femenino"
];

export const EVALUACIONES_FISICAS = [
    "Equilibrio",
    "Coordinación",
    "Flexibilidad",
    "Fuerza brazos",
    "Fuerza piernas",
    "Fuerza abdomen",
    "Cooper"
];

export const EVALUACIONES_NUTRICION = [
    "Peso",
    "Talla",
    "IMC",
    "Circunferencia Cintura",
    "ICC",
    "Porcentaje de grasa"
];

export const EVALUACIONES_EDADES = [
    "Todas",
    "<15",
    "15-19",
    "20-29",
    "30-39",
    "40-49",
    "50 o más"
];

export const CENTROSHORARIOS = {
    instalacion:0,
    informes:1
};

export const USUARIOS = {
    visitante:0,
    coordinador:1,
    evaluador:2,
    alumno:3
};

export const ROLES = {
    none:0,
    master:1,
    entrenador:2,
    nutriologo:3,
    labels:["Alumno", "Dirección", "Entrenador/a", "Nutriólogo/a"],
    maleLabels: ["Alumno", "Dirección", "Entrenador", "Nutriólogo"],
    femaleLabels: ["Alumna", "Dirección", "Entrenadora", "Nutrióloga"],
};

export const ACTIVIDADES = {
    actividades: {
        name:"Actividades",
        type:0
    },
    eventos:{
        name:"Eventos",
        type:1
    },
    tipos:["Alto rendimiento", "Nutrición", "Actividad física"],
    AR:0,
    NUT:1,
    AF:2
};

export const EVALUACIONES = [
    'Pruebas físicas', 'Nutrición'
]

export const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const MESES_ABBR = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

export const DIAS = [
    "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
];

export const HORAS24 = [
    "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
];

export const ALERTS = {
    help:{
        title:"Ayuda",
        text:{
            nombreUsuario:"El nombre de usuario es con el que se inicia sesión."
        }
    },
    form:{
        title:"Formulario",
        text:{
            required:"Indica los campos requeridos.",
            contrasena:"Indica la contraseña actual.",
            confContrasena:"La constraseña no coincide en ambos campos.",
            invalidUserName:"El nombre de usuario no es válido. Debe contener mínimo 6 caracteres.",
            invalidEmail:"El correo indicado no es válido.",
            invalidCredentials:"Los datos de usuario no son válidos.",
            cantOpenPicker:"No se puede abrir el selector.",
            insufficientData: "No hay suficientes datos que guardar.",
            tryAnotherData: "Intenta con otros datos",
            filterParams: "Indica más parámetros para la consulta"
        }
    },
    refresh: {
        title: "Volver a cargar",
        text: {
            accept: "Aceptar",
            cancel: "Cancelar",
            confirm: "¿Intentar cargar los datos de nuevo?"
        }
    },
    remove: {
        title: "Eliminar",
        text: {
            accept: "Aceptar",
            cancel: "Cancelar",
            confirm: "¿Deseas eliminar este elemento?\r\nEsta acción no se puede deshacer."
        }
    },
    response:{
        title:"Respuesta",
        text:{
            done:"Hecho",
            saved:"Guardado",
            noChanges:"Sin cambios",
            network:"No hay conexión a internet",
            noData: "No hay datos para mostrar"
        }
    },
    subscribe: {
        title: "Suscribir",
        text: {
            insert: "Agregado",
            delete: "Removido"
        }
    },
    geo:{
        title: "Ubicación",
        text:{
            longLat: "Puedes obtener los valores de la longitud y latitud buscando el domicilio del centro en Google Maps.",
            invalidLongLat: "No es posible ubicar el punto con la latitud y longitud proporcionados."
        }
    },
    leave: {
        title: 'Salir',
        text: {
            accept: "Aceptar",
            cancel: "Cancelar",
            unsaved: 'Hay algunos datos que aún no se han guardado.\r\n¿Salir sin guardar?'
        }
    },
    clipboard: {
        title: 'Copiar',
        text: {
            copied: 'Copiado al portapapeles'
        }
    },
    storage: {
        title: 'Almacenamiento local',
        text: {
            accept: "Continuar",
            cancel: "Cancelar",
            error: 'No fue posible almacenar los datos en la memoria local',
            tmp: 'Almacenado temporalmente en la memoria local',
            limit: 'Libera espacio para guardar en la memoria local',
            userName: 'Estás en modo offline. Se asignará un nombre de usuario aleatorio para prevenir duplicados. Podrás cambiarlo después, pero deberás notificar al alumno.',
            hasLocalStorage: 'Aún hay elementos sin enviar a la nube. Súbelos primero para poder continuar.'
        }
    }
}