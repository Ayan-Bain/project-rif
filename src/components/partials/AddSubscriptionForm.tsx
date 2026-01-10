import React, { FC, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Platform, TouchableOpacity, useColorScheme } from 'react-native';
import CustomButton from '../custom-components/CustomButton';
import { useData } from '../services/RetrieveData';
import { useAuth } from '../services/AuthHandler';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import Subscription from '../../subscriptions/subsciption';
import { Colors } from '../constants/Colors';
import { requestNotificationPermission } from '../services/NotificationRegistry';
interface Props {
    editingItem?: Subscription;
    onComplete?: ()=> void;
}

const AddSubscriptionForm: React.FC<Props> = ({editingItem, onComplete}) => {
  const { user } = useAuth();
  const { save, update, themeMode } = useData();
  const [name, setName] = useState(editingItem?.name || '');
  const [price, setPrice] = useState(editingItem?.price.toString() || '');
  const [cycle, setCycle] = useState(editingItem?.cycle || 'monthly');
  const [dateInfo, setDateInfo] = useState(editingItem ? new Date(editingItem.date) : new Date());
  const [showPicker, setShowPicker] = useState(false);
  const systemScheme = useColorScheme(); //
  const theme = Colors[themeMode === 'system' ? (systemScheme || 'light') : themeMode];
  const activeTheme = themeMode === 'system' ? systemScheme : themeMode;
  const isDark = activeTheme === 'dark';
  const handleSave = async () => {
        const hasPermission = await requestNotificationPermission();

        if (!name || !price) {
            Alert.alert("Error", "Please fill in the name and price");
            return;
        }
        const date = dateInfo.toISOString().slice(0,10);

        const newSub = {
            name,
            price: parseFloat(price),
            date,
            cycle,
        };

        // logic to save would go here (update context + AsyncStorage)
        if(editingItem) {
            console.log("Updating Subscription", newSub);
            await update?.(user.uid, editingItem.id,newSub);
        }
        else {
            console.log("Saving subscription:", newSub);
            save(user.uid, newSub);
        }

        onComplete?.();
        // Alert.alert("Success", "Subscription added!");
    };



    // Handles the selection from the native modal
    const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        // On Android, the picker closes immediately after selection
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        
        if (selectedDate && event.type === 'set') {
            setDateInfo(selectedDate);
        }
    };

    return (
        <View style={[styles.container,{backgroundColor: theme.whiteBackground, flex: 1}]}>
          <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 24, color: theme.text}}>{editingItem? 'Edit Subscription': 'Add new Subscription'}</Text>
            <Text style={[styles.label, {color: theme.text}]}>Subscription Name</Text>
            <TextInput 
                style={[styles.input, {color: theme.text}]} 
                placeholder="e.g. Netflix" 
                placeholderTextColor={theme.text}
                value={name} 
                onChangeText={setName} 
            />

            <Text style={[styles.label, {color: theme.text}]}>Price</Text>
            <TextInput 
                style={[styles.input, {color: theme.text}]} 
                placeholder="1.69" 
                placeholderTextColor={theme.text}
                keyboardType="numeric" 
                value={price} 
                onChangeText={setPrice} 
            />

            <Text style={[styles.label, {color: theme.text}]}>Last Paid Date (DD/MM/YYYY)</Text>
            <TouchableOpacity 
                style={[styles.dateDisplay, {backgroundColor: theme.whiteBackground}]} 
                onPress={() => setShowPicker(true)}
            >
                <Text style={[styles.dateText, {color: theme.text}]}>
                    {dateInfo.toLocaleDateString()} {/* Formats based on user locale */}
                </Text>
            </TouchableOpacity>

            {/* The actual Picker component */}
            {showPicker && (
                <DateTimePicker
                    value={dateInfo}
                    style={{backgroundColor: theme.whiteBackground}}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={onChange}
                    maximumDate={new Date()} // Prevents picking future dates
                />
            )}

            {/* iOS specific: Inline pickers don't auto-close, so you might need a "Done" button */}
            {Platform.OS === 'ios' && showPicker && (
                <CustomButton 
                    title="Done" 
                    onPress={() => setShowPicker(false)} 
                    backgroundColor="#2196F3"
                />
            )}

            <Text style={[styles.label, {color: theme.text}]}>Billing Cycle</Text>
            <View style={styles.cycleContainer}>
                {['weekly', 'monthly', 'yearly'].map((item) => (
                    <CustomButton
                        key={item}
                        title={item.charAt(0).toUpperCase() + item.slice(1)}
                        onPress={() => setCycle(item as any)}
                        backgroundColor={cycle === item ? '#2196F3' : '#ccc'}
                        color={cycle === item ? 'white': 'black'}
                    />
                ))}
            </View>

            <CustomButton 
                title={editingItem? 'Update Subscription':'Add Subscription' } 
                onPress={handleSave} 
                backgroundColor="yellowgreen" 
                color= {isDark?'black': 'white'}
            />
        </View>
    );
};

const styles = StyleSheet.create({
  container: { padding: 20, borderRadius: 10 },
  label: { fontWeight: "bold", marginTop: 15, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 5 },
  cycleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 10,
  },
  dateDisplay: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  dateText: { fontSize: 16, color: "#333" },
});

export default AddSubscriptionForm;