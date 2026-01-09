import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface props {
    title?: string;
    onPress?: ()=> void;
    backgroundColor?: string;
    color?: string;
    borderRadius?:  number;
    iconName?: keyof typeof Ionicons.glyphMap;
    iconSize?: number;
}

const CustomButton:  React.FC<props> = ({title, onPress, backgroundColor, color, borderRadius, iconName, iconSize}) => {


    return (
      <TouchableOpacity
        onPress={onPress}
        style={{
          backgroundColor: backgroundColor || "black",
          borderRadius: borderRadius || 10,
          padding: iconName?5:10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {iconName && (
            <Ionicons name={iconName} size={iconSize} color={color || 'white'} style={title? {marginRight: 8}: {}}/>
        )}
        <Text
          style={{
            textAlign: "center",
            justifyContent: "center",
            color: color || "white",
            fontSize: 20,
          }}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
}

export default CustomButton;