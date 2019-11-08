//INIT
import { createStackNavigator } from "react-navigation";
//ELEMENTS
import { headerTitleStyle } from "../user-controls/HeaderTitle";
//ROUTES
import { Referencias } from '../components/Referencias';

export const ReferenciasRouter = createStackNavigator(
    {
        Referencias
    },{
        headerMode:"screen",
        navigationOptions: headerTitleStyle
    }
);