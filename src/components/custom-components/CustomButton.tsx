import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface props {
    title?: string;
    onPress?: ()=> void;
    backgroundColor?: string;
    color?: string;
    borderRadius?:  number
}

const CustomButton:  React.FC<props> = ({title, onPress, backgroundColor, color, borderRadius}) => {


    return (
        <TouchableOpacity onPress={onPress} style={{backgroundColor: backgroundColor || 'black', borderRadius: borderRadius || 10, padding: 10}}>
            <Text style={{textAlign: 'center', justifyContent: 'center', color: color || 'white', fontSize: 20}}>{title}</Text>
        </TouchableOpacity>
    )
}

export default CustomButton;