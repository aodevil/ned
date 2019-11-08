import React from "react";
import {Header} from "react-navigation";
import {View, Image, StyleSheet} from "react-native";
import {SearchBar} from "react-native-elements";
import colors from '../styles/colors.json';
import BGHeader from "../assets/BG-Header.jpg";

import { MenuButton } from "./MenuButton";
import { BackButton } from "./BackButton";
import { RightButtons } from "./RightButtons";

export const headerTitleStyle = {
    headerStyle: {
      backgroundColor: "transparent",
      borderBottomWidth: 0,
      shadowOpacity: 0,
      shadowOffset: {
        height: 0,
      },
      shadowRadius: 0,
      elevation:0
    },
    headerTitleStyle: {
      fontWeight: "bold",
      color: "#fff",
      zIndex: 1,
      textAlign:"center"
    }
};

const styles = StyleSheet.create({
    primary:{
        backgroundColor:colors.primary
    },
    secondary:{
        backgroundColor:colors.secondary
    },
    transparent:{
        backgroundColor:colors.none
    },
    image:{
        position:"absolute",
        width:null,
        height:null,
        bottom:0,
        left:0,
        right:0,
        top:0
    },
    searchBarContainer:{
        paddingLeft:10,
        paddingRight:10,
        backgroundColor:colors.none
    },
    searchBar:{
        borderTopWidth:0,
        borderBottomWidth:0
    }
});

export const HeaderTitle = ((props)=>{
    let {secondary,onSearch,searchPlaceholder} = props;
    if(secondary){
        return(
            <View style={styles.secondary}>
                <Header {...props}/>
                {onSearch && (
                    <View style={styles.searchBarContainer}>
                        <SearchBar
                            round
                            onChangeText={onSearch}
                            placeholder={searchPlaceholder||"Buscar"}
                            containerStyle={[styles.searchBar,styles.secondary]}
                            inputStyle={{
                                backgroundColor:colors.white
                            }}
                        />
                    </View>
                )}
            </View>
        );
    }
    return(
        <View style={[styles.primary]}>
            <Image source={BGHeader} style={styles.image}/>
            <Header {...props}/>
            {onSearch && (
                <View style={styles.searchBarContainer}>
                    <SearchBar
                        round
                        onChangeText={onSearch}
                        placeholder={searchPlaceholder||"Buscar"}
                        containerStyle={[styles.searchBar,styles.transparent]}
                        inputStyle={{
                            backgroundColor:colors.white
                        }}
                    />
                </View>
            )}
        </View>
    );
});

export const setHeaderComponent = ({secondary=false, title="", root=true, trackChanges = false})=>({navigation}) => {
    const Title = `${navigation.getParam("title") || title || ""}`;
    let Secondary = navigation.getParam("secondary"); if (Secondary === undefined) Secondary = secondary;
    let Root = navigation.getParam("root"); if (Root === undefined) Root = root;
    return {
        title: Title,
        header:(props)=><HeaderTitle 
                            secondary={Secondary} 
                            {...props} 
                            onSearch={navigation.getParam("onSearch")} 
                            searchPlaceholder={navigation.getParam("searchPlaceholder")}
                        />,
        headerLeft:Root?<MenuButton invert={secondary}/>:<BackButton trackChanges={trackChanges}/>,
        headerRight:<RightButtons invert={!secondary}/>
    };
}