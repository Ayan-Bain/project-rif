import React from "react";
import { Image, View, StyleSheet } from "react-native";
import { SvgUri } from "react-native-svg";

interface logoProps {
    uri: string;
    size?: number;
}

const UniversalLogoHandler: React.FC<logoProps> = ({uri, size}) => {


    if(!uri) return null;

    const [prev, next] = uri.split('logo.');
    console.log('====================================');
    console.log(next);
    console.log('====================================');
    const isSvg = next.startsWith('svg');
    console.log('====================================');
    console.log("isSvg", isSvg);
    console.log('====================================');
    return (
        <View style={{width: size, height: size}}>
            {isSvg ? (
                <SvgUri width={size} height={size} uri={uri}/>
            ) : (
                <Image width={size} height={size} source={{uri: uri}} resizeMode="contain"/> 
            )}
        </View>
    )
}


export default UniversalLogoHandler;