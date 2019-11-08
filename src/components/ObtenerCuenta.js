//LIB
import React from "react";
//ELEMENTS
import {View, Button, SafeAreaView} from "react-native";
import {Text, Divider} from "react-native-elements";
//STYLES
import { CSSView } from "../styles/view";
import colors from "../styles/colors";
//MODEL
import routes from '../providers/routes';
import { setHeaderComponent } from "../user-controls/HeaderTitle";

export const ObtenerCuenta = (props)=>(
    <SafeAreaView style={CSSView.main}>
        <View style={CSSView.container}>
            <Text h4>¿Cómo obtener una cuenta?</Text>
            <Divider style={{marginBottom:8, marginTop:8}}/>
            <Text style={{lineHeight:25}}>Asiste a cualquier centro deportivo CODE e inscríbete o participa en alguna de las actividades. Ya sea tu entrenadora o entrenador físico, o tu nutricionista podrán crear tu cuenta con algunos datos personales que te pedirán. Con tu cuenta podrás consultar los resultados de tus evaluaciones y ver recomendaciones que tus evaluadores te hagan.</Text>
            <Divider style={{marginBottom:8, marginTop:8}}/>
            <Button title="Ver centros deportivos" onPress={()=>props.navigation.navigate(routes.CentrosRouter.child.Centros.name)} color={colors.primary}/>
        </View>
    </SafeAreaView>
);
ObtenerCuenta.navigationOptions = setHeaderComponent({
    title:routes.ObtenerCuenta.title
});