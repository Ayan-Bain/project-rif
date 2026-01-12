import React, { useEffect } from "react";
import { Image, View, useWindowDimensions } from "react-native";
import { SvgUri } from "react-native-svg";

interface logoProps {
    uri: string;
    size?: number;
    alt?: string
}

const UniversalLogoHandler: React.FC<logoProps> = ({ uri, size = 150, alt }) => {
    const windowWidth = useWindowDimensions().width;
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
    const isSvg = uri?.toLowerCase().includes('.svg?c=');

    const darken = (url: string): string => {
        if (url?.includes('/light')) {
            return url.replace('/light', '/dark');
        }
        return url;
    };

    useEffect(() => {
        if (!isSvg && uri) {
            Image.getSize(uri, (width, height) => {
                setDimensions({ width, height });
            }, (error) => console.log("Image size error: ", error));
        }
    }, [uri, isSvg]);

    if (!uri) return null;
    const displayWidth = dimensions.width > windowWidth ? windowWidth - 40 : dimensions.width || size;
    const aspectRatio = dimensions.height / dimensions.width || 1;
    const displayHeight = dimensions.width > windowWidth ? displayWidth * aspectRatio : dimensions.height || size;

    return (
        <View style={{ padding: 20,
        }}>
            {isSvg ? (
                <SvgUri 
                    width={windowWidth-40} 
                    height={size} 
                    uri={darken(uri)} 
                    accessibilityLabel={alt}
                />
            ) : (
                <Image 
                    source={{ uri: darken(uri) }} 
                    style={{ 
                        width: displayWidth, 
                        height: displayHeight,
                        maxHeight: size 
                    }} 
                    resizeMode="contain"
                /> 
            )}
        </View>
    );
};

export default UniversalLogoHandler;