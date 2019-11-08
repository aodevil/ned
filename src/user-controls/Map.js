//LIB
import React, {Component} from 'react';
import MapBox from "@react-native-mapbox-gl/maps";
import shortId from "shortid";
import isLatLong from 'validator/lib/isLatLong';
//STYLES
import { CSSMap } from '../styles/map';
//MODEL
import { componentDidMountDelay, compareValues } from '../services/functions';

export class MapComponent extends Component {

    //INIT
    constructor(props){
        super(props);
        this.state = {
            mounted:false
        }
    }

    shouldComponentUpdate(props,state){
        if(
            this.state.mounted === state.mounted &&
            compareValues(this.props.centros,props.centros) &&
            compareValues(this.props.center,props.center)
        )return false;
        return true;
    }

    componentDidMount(){
        componentDidMountDelay(this,null,530);
    }

    _void = () => null;

    //RENDER

    _renderAnnotations = (x,i)=>{
        let {onSelected, onDeselected} = this.props;
        let {mounted} = this.state;
        let id = `annotation-${shortId.generate()}`;
        if (!isLatLong(`${x.lat},${x.long}`) || !mounted) return null;

        return (
            <MapBox.PointAnnotation
                key={id}
                id={id}
                title={x.nombre}
                coordinate={[x.long,x.lat]}
                onSelected={onSelected ? onSelected.bind(this,x) : this._void}
                onDeselected={onDeselected ? onDeselected : this._void}
            />
        );
    }

    render(){
        let {onDidFinishLoadingMap, onPress, onLongPress, centros, center} = this.props;
        return (
            <MapBox.MapView
                logoEnabled={false}
                localizeLabels
                onDidFinishLoadingMap={onDidFinishLoadingMap ? onDidFinishLoadingMap : this._void}
                onDidFailLoadingMap={onDidFinishLoadingMap ? onDidFinishLoadingMap : this._void}
                styleURL={MapBox.StyleURL.Street}
                style={CSSMap.view}
                onPress={onPress ? onPress : this._void}
                onLongPress={onLongPress ? onLongPress : this._void}
            >
                <MapBox.Camera
                    centerCoordinate={center}
                    zoomLevel={15}
                />
                { centros.map(this._renderAnnotations)}
            </MapBox.MapView>
        );
    }
}
MapComponent.defaultProps = {
    centros:[]
}