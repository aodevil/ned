import {StyleSheet, Dimensions} from 'react-native';
import * as colors from "./colors";

export const CSSView = StyleSheet.create({
    main:{
        flex:1,
        backgroundColor: colors.white
    },
    container: {
        flex: 1,
        padding:20,
        backgroundColor: colors.white
    },
    flex:{
        flex:1
    },
    wrap: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    justify: {
        justifyContent:"space-between"
    },
    align:{
        alignItems: 'center',
    },
    center:{
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullWidth:{
        width:"100%"
    },
    noGrow:{
        flex:0
    },
    absolute:{
        position:"absolute",
        top:0,
        left:0,
        bottom:0,
        right:0
    },
    backgroundImage:{
        flex:1,
        width:null,
        height:null,
        position:"absolute",
        top:0,
        left:0,
        bottom:0,
        right:0
    },
    paddingView:{
        paddingLeft:20,
        paddingRight:20
    },
    paddingViewSm:{
        paddingLeft:10,
        paddingRight:10
    },
    paddingHeight:{
        paddingTop:20,
        paddingBottom:20
    },
    paddingHeightSm:{
        paddingTop:10,
        paddingBottom:10
    },
    padding:{
        padding:20
    },
    paddingSm:{
        padding:10
    },
    row:{
        flexDirection:"row",
        width:"100%",
        alignItems:"center",
        justifyContent:"space-between"
    },
    absoluteCenter:{
        flex:1,
        position:"absolute",
        top:"50%",
        left:"50%"
    },
    relative:{
        position:"relative"
    },
    round:{
        borderRadius:15
    },
    separate:{
        marginTop:15,
        marginBottom:15
    },
    separateSm:{
        marginBottom:15
    },
    separateTop:{
        marginTop:15
    },
    floatingTopView:{
        maxHeight:Dimensions.get("window").height / 3,
        backgroundColor:colors.white,
        position:"absolute",
        top:0,
        left:0,
        right:0,
        zIndex:1,
        shadowColor:colors.dark,
        shadowOffset:{x:0,y:8},
        shadowRadius:5,
        shadowOpacity:0.8,
        elevation:1
    },
    rightTop: {
        position: 'absolute',
        top: 0,
        right: 0
    },
    alignEnd: {
        alignItems: 'flex-end'
    },
    alignStart: {
        alignItems: 'flex-start'
    }
});