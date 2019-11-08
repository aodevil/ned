//LIB
import React, {Component} from 'react';
import {withNavigation} from "react-navigation";
import {connect} from "react-redux";
import { mapStateToProps } from '../store/mapStateToProps';
import { mapDispatchToProps } from '../store/mapDispatchToProps';
import GeoCoding from "@mapbox/mapbox-sdk/services/geocoding";
import isLatLong from 'validator/lib/isLatLong';
//ELEMENTS
import {View, FlatList, Modal, SafeAreaView, Keyboard, Text, Alert} from 'react-native';
import { setHeaderComponent } from '../user-controls/HeaderTitle';
import { Loader } from '../user-controls/Loader';
import { Button } from '../user-controls/Button';
import {List, ListItem, SearchBar} from "react-native-elements";
import { AnimatedFooter } from '../user-controls/AnimatedFooter';
import SwipeOut from "react-native-swipeout";
import { RefreshView } from '../user-controls/RefreshView';
import Toast from 'react-native-root-toast';
//STYLES
import { CSSView } from '../styles/view';
import { CSSText } from '../styles/text';
import { CSSList } from '../styles/list';
import colors from '../styles/colors';
//MODEL
import errors from '../services/errors';
import routes from '../providers/routes';
import { componentDidMountDelay, compareValues, replaceDiacritics } from '../services/functions';
import { MBXTOKEN, ACTIONS, ALERTS, USUARIOS } from '../services/constants';
import { ROUTES } from "../services/post";
import { Usuario } from '../model/Usuario';
import { Centro } from '../model/Centro';
import { MapComponent } from '../user-controls/Map';

const GeoCodingClient = GeoCoding({accessToken:MBXTOKEN});

class CentrosSearchComponent extends Component{

    //INIT

    constructor(props){
        super(props);
        this.searchTypingTimeOut = null;
        this.state = {
            searchFeatures:[]
        }
    }

    componentDidMount(){
        this._setNavParams();
    }

    shouldComponentUpdate(props,state){
        if(
            this.props.network === props.network &&
            compareValues(this.state.searchFeatures,state.searchFeatures) &&
            compareValues(this.props.annotation,props.annotation)
        )return false;
        return true;
    }

    _refresh = () => {
        Alert.alert(ALERTS.refresh.title, ALERTS.refresh.text.confirm, [
            { text: ALERTS.refresh.text.cancel, onPress: void 0 },
            { text: ALERTS.refresh.text.accept, onPress: this.props.onRefresh }
        ])
    }

    _setNavParams = ()=>{
        let params = {};
        params.custom = [];
        if(this.props.isAdmin){
            params.onSearch = this._onSearch;
            params.searchPlaceholder = "Buscar calle #, ciudad, estado";
            params.custom.push({
                icon:"add",
                onPress:this._add
            });
        } else {
            params.custom.push({
                icon:"refresh",
                onPress:this._refresh
            });
        }
        
        params.custom.push({
            icon:"list",
            onPress:this.props.onToggleListModal
        });
        this.props.navigation.setParams(params);
    }

    _add = ()=>{
        let {annotation} = this.props;
        this.props.onAdd(new Centro((annotation && annotation.ID)?null:this.props.annotation), "Editar");
        
    }

    //ACTIONS

    _onSearch = (query="")=>{
        if(!query.trim()){
            this._onClear(()=>{
                this.props.onSearch(false,()=>{
                    if(this.searchTypingTimeOut)clearTimeout(this.searchTypingTimeOut);
                });
            });
            return;
        }
        this.props.onSearch(true,()=>{
            if(this.searchTypingTimeOut)clearTimeout(this.searchTypingTimeOut);
            this.searchTypingTimeOut = setTimeout(() => {
                GeoCodingClient.forwardGeocode({
                    query,
                    limit: 5,
                    countries:["mx"],
                    language:["es"],
                    types:["address"],
                    proximity:[-103.4054534,20.6737777]
                })
                .send()
                .then(response => {
                    let match = response.body;
                    let features = [];
                    if(match){
                        if(match.features && match.features.length > 0){
                            features = [...match.features];
                        }
                    }
                    this.setState({
                        searchFeatures:[...features]
                    },()=>{
                        this.props.onSearch(false);
                    });
                })
                .catch(error=>{
                    this.setState({
                        searchFeatures:[]
                    },()=>{
                        this.props.onSearch(false);
                    });
                });
            }, 1200);
        });
    }

    _onFeatureSelected = (item)=>{
        this._onClear(()=>{
            if(item){
                this.props.onFeatureSelected(item.center);
            }
        });
    }

    _onClear = (callback)=>{
        this.setState({
            searchFeatures:[]
        },callback);
    }

    //RENDER

    _searchFeatureKeyExtractor = (x,i)=>{
        return `feature-${x.id}`;
    }

    _renderSearchFeature = ({ item, index })=>{
        return (
            <ListItem title={item.place_name} onPress={this._onFeatureSelected.bind(this,item)} hideChevron/>
        );
    }

    render(){
        let {searchFeatures} = this.state;
        return (
            <View style={[CSSView.floatingTopView]}>
                <List containerStyle={[CSSList.noLines,CSSList.noMargin]}>
                    <FlatList 
                        data={searchFeatures}
                        renderItem={this._renderSearchFeature}
                        keyExtractor={this._searchFeatureKeyExtractor}
                    />
                </List>
            </View>
        );
    }
}
const CentrosSearch = withNavigation(CentrosSearchComponent);


class CentrosListComponent extends Component{

    //INIT

    constructor(props){
        super(props);
        this.mounted = false;
        this.state = {
            items:[...props.centros]
        };
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    shouldComponentUpdate(props,state){
        if(
            props.network === this.props.network &&
            compareValues(props.centros,this.props.centros) &&
            compareValues(state.items,this.state.items)
        )return false;
        return this.mounted;
    }

    //ACTIONS

    _onSelect = (item)=>{
        if(!this.props.network){
            this._onPressItem(item,ACTIONS.select);
        }else{
            this.props.onItemSelected(item);
        }
    }

    _onSearch = (value)=>{
        if (!this.mounted) return;
        let items = this.props.centros.filter(i => {
            let {nombre,domicilio} = i;
            let itemData = `${replaceDiacritics(nombre)} ${replaceDiacritics(domicilio)}`;
            let search = replaceDiacritics(value);
            return itemData.indexOf(search) > -1;
        });
        this.setState({
            items:[...items]
        });
    }

    _onPressItem = (item,action)=>{
        if (!this.mounted) return;
        if (action === ACTIONS.delete) {
            Alert.alert(ALERTS.remove.title, ALERTS.remove.text.confirm, [
                { text: ALERTS.remove.text.cancel, onPress: void 0 },
                { text: ALERTS.remove.text.accept, onPress: () => {
                    const { usuario: { activo } } = this.props;
                    if(!activo){
                        Alert.alert("", errors.auth);
                        return;
                    }
                    this.setState({
                        items:this.props.centros.filter(x=>x.ID !== item.ID)
                    },()=>{
                        this.props.onDeleteItem(item)();
                    });
                }}
            ]);
        } else if (action === ACTIONS.select || action === ACTIONS.edit) {
            this.props.onNavigate(item,(action === ACTIONS.select ? "Detalles" : "Editar"));
        }
    }

    //RENDER

    _searchLocationKeyExtractor = (x,i)=>{
        return `location-${x.ID}`;
    }

    _renderLocationItem = ({ item, index })=>{
        let buttons = [];
        if(item.ID){
            if(this.props.isAdmin){
                buttons.push({
                    backgroundColor:colors.danger,
                    color:colors.white,
                    text:"Eliminar",
                    onPress:this._onPressItem.bind(this,item,ACTIONS.delete)
                });
                buttons.push({
                    backgroundColor:colors.success,
                    color:colors.white,
                    text:"Editar",
                    onPress:this._onPressItem.bind(this,item,ACTIONS.edit)
                });
            }
            buttons.push({
                backgroundColor:colors.secondary,
                color:colors.white,
                text:"Ver más",
                onPress:this._onPressItem.bind(this,item,ACTIONS.select)
            });
        }else if(this.props.isAdmin){
            buttons.push({
                backgroundColor:colors.success,
                text:"Guardar",
                onPress:this._onPressItem.bind(this,item,ACTIONS.edit)
            });
            buttons.push({
                backgroundColor:colors.danger,
                text:"Descartar",
                onPress:this._onPressItem.bind(this,item,ACTIONS.delete)
            });
        }
        return (
            <SwipeOut right={buttons} autoClose backgroundColor={colors.none}>
                <ListItem 
                    title={item.nombre || "Marcador"} 
                    subtitle={item.domicilio || item.setDomicilioFromLongLat()} 
                    onPress={this._onSelect.bind(this,item)}
                    rightIcon={this.props.network?{name:"map"}:{}}
                />
            </SwipeOut>
        );
    }

    render(){
        let {onToggleListModal, onRefresh} = this.props;
        let {items} = this.state;
        return(
            <SafeAreaView style={[CSSView.main,{backgroundColor:colors.secondary}]}>
                <View style={[CSSView.row,{justifyContent:"flex-start",backgroundColor:colors.secondary}]}>
                    <View style={CSSView.flex}>
                        <SearchBar 
                            round
                            placeholder="Buscar"
                            onChangeText={this._onSearch}
                            containerStyle={[CSSList.noLines,{backgroundColor:colors.secondary}]}
                            inputStyle={{backgroundColor:'white'}}
                        />
                    </View>
                    <View style={[CSSView.noGrow, {marginRight:20}]}>
                        <Button 
                            iconOnly
                            noMargin
                            color={colors.primary}
                            icon="arrow-down"
                            onPress={onToggleListModal}
                        />
                    </View>
                </View>
                <RefreshView onRefresh={onRefresh} safeAreaView={false}>
                    {(!items || items.length <= 0) && <Text style={[CSSText.center, CSSView.padding]}>No hay centros en la lista.</Text>}
                    <List containerStyle={[CSSList.noLines,CSSList.noMargin,CSSView.main]}>
                        <FlatList 
                            data={items}
                            renderItem={this._renderLocationItem}
                            keyExtractor={this._searchLocationKeyExtractor}
                        />
                    </List>
                </RefreshView>
            </SafeAreaView>
        );
    }
}
const CentrosList = withNavigation(CentrosListComponent);


class CentrosComponent extends Component{

    //INIT

    constructor(props){
        super(props);
        this.isAdmin = Usuario.isAdmin(props, [USUARIOS.coordinador]);
        this.searchTypingTimeOut = null;
        this.mounted = false;
        this.init(props);
        this.props.onLoading(true);
    }

    init = (props)=>{
        const { navigation } = props;
        let center = [-103.34775458,20.69898808];
        
        if(props.centros && props.centros.length > 0){
            const ID = navigation.getParam('centro');
            center = [props.centros[0].long,props.centros[0].lat];
            if (ID) {
                const item = props.centros.find(x => x.ID === ID);
                if (item) {
                    center = [ item.long, item.lat ];
                }
            }
        }

        let state = {
            isSearchTyping:false,
            mounted:this.mounted,
            modalList:false,
            annotation:false,
            centros:[...props.centros],
            center,
            isOnline:false
        };
        if(!this.mounted){
            this.state = {...state};
            this.mounted = true;
        }
        else{
            this.setState({
                ...state
            });
        }
    }

    componentWillUnmount(){
        // this.props.onToggleNetworkNotification(false);
        this.setState({
            mounted:false
        });
    }

    componentDidMount(){
        componentDidMountDelay(this,()=>{
            let {centros} = this.props;
            if(centros && centros.length > 0){
                this.props.onLoading(false);
            }else{
                this._load();
            }
        });
    }

    _onDidFinishLoadingMap = ()=>{
        this.props.onLoading(false);
    }

    UNSAFE_componentWillReceiveProps = (props)=>{
        const {centros:next} = props;
        const {centros:prev} = this.props;
        if(!compareValues(next,prev)){
            this.init(props);
        }
    }

    _load = ()=>{
        this.props.onLoading(true,(resolve)=>{
            this.load(resolve);
        });
    }

    load = (resolve)=>{
        let {network,token} = this.props;
        Centro.fetch(network, ROUTES.CENTRO, ACTIONS.select,null,token,(response)=>{
            let {error,data} = response;
            this.props.onLoadCentros(data,()=>{
                resolve();
                if(error){
                    Alert.alert(null,error);
                }
            });
        });
    }

    //ACTIONS

    _isOnline = (isOnline)=>{
        this.setState({
            isOnline
        });
    }

    _restoreAnnotations = (center)=>{
        if(center){
            this.setState({
                annotation:false,
                center:[...center],
                centros:[...this.state.centros.filter(x=>!(!x.ID)),new Centro({
                    long:center[0],
                    lat:center[1]
                })]
            });
        }
    }

    _removeItem = (item)=>{
        this.setState(() => {
            return {
                annotation:false,
                centros:[...this.state.centros.filter(x=> (!!item.ID) ? x.ID !== item.ID : !(!x.ID))]
            }
        });
    }

    _showItemDetails = (item, action="Detalles")=>{
        let {navigation:{navigate}} = this.props;
        if(!item)item = new Centro();
        Keyboard.dismiss();
        this.setState({
            modalList:false,
            // annotation:false
        },()=>{
            navigate(routes.CentrosRouter.child[item.ID?`${action}Centro`:"EditarCentro"].name,{
                title:item.ID?((action === "Editar")?routes.CentrosRouter.child.EditarCentro.title:null):"Nuevo centro",
                item
            });
        });
    }

    _isSearchTyping = (isSearchTyping, callback=null)=>{
        this.setState({
            isSearchTyping,
            annotation:false
        },callback);
    }

    _onLongMapPress = (data)=>{
        if(data && this.isAdmin){
            let {geometry:{coordinates}} = data;
            this._restoreAnnotations(coordinates);
        }
    }

    _toggleListModal = ()=>{
        this.setState({
            modalList:!this.state.modalList
        });
    }

    _onAnnotationSelected = (item)=>{
        this.setState({
            annotation:item
        });
    }

    _onAnnotationDeselected = ()=>{
        this.setState({
            annotation:false
        });
    }

    _onLocationItemSelected = (item)=>{
        this.setState({
            annotation:false,
            modalList:false
        },()=>{
            const { long, lat } = item;
            if (!isLatLong(`${lat},${long}`)) {
                Toast.show(ALERTS.geo.text.invalidLongLat, { duration: 3000, shadow: false });
            } else {
                this.setState({
                    annotation:item,
                    center:[item.long,item.lat]
                });
            }
        });
    }

    _onDeleteItemSelected = (item) => () => {
        if (!item || !item.ID) { this._removeItem(item); return; }
        this.props.onLoading(true,(resolve)=>{
            let {network,token} = this.props;
            Centro.fetch(network, ROUTES.CENTRO, ACTIONS.delete, { ID: item.ID}, token, (response)=>{
                let { error, data } = response;
                if (error) {
                    Alert.alert(null,error);
                    resolve();
                } else {
                    this.props.onRemoveCentro(data,()=>{
                        resolve();
                        this._removeItem(item);
                    });
                }
            });
        });
    }

    //RENDER

    render(){
        let {mounted, centros, center, isSearchTyping, modalList, annotation} = this.state;
        let {network, loading, usuario} = this.props;
        
        return(
            <View style={[CSSView.main]}>
                {mounted && (
                    <CentrosSearch 
                        annotation={annotation}
                        network={network}
                        isAdmin={this.isAdmin}
                        onSearch={this._isSearchTyping}
                        onFeatureSelected={this._restoreAnnotations}
                        onToggleListModal={this._toggleListModal}
                        onAdd={this._showItemDetails}
                        onRefresh={this._load}
                    />
                )}

                {(mounted && !loading) && (
                    <MapComponent 
                        centros={centros}
                        center={center}
                        onDidFinishLoadingMap={this._onDidFinishLoadingMap}
                        onLongPress={this._onLongMapPress}
                        onSelected={this._onAnnotationSelected}
                        onDeselected={this._onAnnotationDeselected}
                    />
                )}

                {mounted && (
                    <AnimatedFooter collapse={annotation?false:true} height={80} background={colors.secondary}>
                        {annotation && (
                            <SwipeOut
                                backgroundColor={colors.none}
                                autoClose
                                right={(this.isAdmin)?(!annotation.ID?
                                    [
                                        {
                                            text:"Descartar",
                                            backgroundColor:colors.danger,
                                            onPress:this._removeItem.bind(this,annotation,ACTIONS.delete)
                                        }
                                    ]:[
                                        {
                                            text:"Editar",
                                            backgroundColor:colors.success,
                                            onPress:this._showItemDetails.bind(this,annotation,"Editar")
                                        }
                                    ]):null
                                }
                            >
                                <ListItem 
                                    title={annotation.nombre || "Marcador"} 
                                    subtitle={annotation.domicilio || annotation.setDomicilioFromLongLat()}
                                    onPress={this._showItemDetails.bind(this,annotation,annotation.ID?"Detalles":"Editar")} 
                                    underlayColor={colors.none}
                                    containerStyle={{borderBottomWidth:0}}
                                    titleStyle={{color:colors.white}}
                                    rightTitle={annotation.ID?"Ver más":"Guardar"}
                                    rightTitleContainerStyle={{borderWidth:1,borderRadius:5,borderColor:annotation.ID?colors.light:colors.primary,flex:0, padding:5, alignItems:"center", justifyContent:"center"}}
                                    rightTitleStyle={{color:annotation.ID?colors.light:colors.primary,textAlign:"center"}}
                                />
                            </SwipeOut>
                        )}
                    </AnimatedFooter>
                )}

                {(mounted) && (
                    <Modal animationType="slide" visible={modalList} onRequestClose={()=>{}}>
                        <CentrosList
                            network={network}
                            isAdmin={this.isAdmin}
                            usuario={usuario}
                            centros={centros}
                            onToggleListModal={this._toggleListModal}
                            onItemSelected={this._onLocationItemSelected}
                            onNavigate={this._showItemDetails}
                            onDeleteItem={this._onDeleteItemSelected}
                            onRefresh={this.load}
                        />
                    </Modal>
                )}
                
                <Loader show={isSearchTyping} transparent={false} opacity={0.6}/>
            </View>
        );
    }
}
CentrosComponent.navigationOptions = setHeaderComponent({
    title:routes.CentrosRouter.child.Centros.title
});

export const Centros = connect(mapStateToProps,mapDispatchToProps)(CentrosComponent);