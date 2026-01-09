import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { useData } from './services/RetrieveData';
import { Colors } from './constants/Colors';
const Details: React.FC=  () => {
    const {themeMode} = useData();
        const systemScheme = useColorScheme(); //
        const theme = Colors[themeMode === 'system' ? (systemScheme || 'light') : themeMode];
      
      // Determine actual theme based on selection
    return(
        <View style={[styles.container,{backgroundColor: theme.background}]}>
            <Text style={{color: theme.text}}>Details Screen</Text>
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Details;