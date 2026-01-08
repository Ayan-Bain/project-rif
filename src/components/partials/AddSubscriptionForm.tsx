import React, { FC, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Platform, TouchableOpacity } from 'react-native';
import CustomButton from '../custom-components/CustomButton';
import { useData } from '../services/RetrieveData';
import { useAuth } from '../services/AuthHandler';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import Subscription from '../../subscriptions/subsciption';
interface Props {
    editingItem?: Subscription;
    onComplete?: ()=> void;
}

const AddSubscriptionForm: React.FC<Props> = ({editingItem, onComplete}) => {
  const { user } = useAuth();
  const { save, update } = useData();
const [name, setName] = useState(editingItem?.name || '');
  const [price, setPrice] = useState(editingItem?.price.toString() || '');
  const [cycle, setCycle] = useState(editingItem?.cycle || 'monthly');
  const [dateInfo, setDateInfo] = useState(editingItem ? new Date(editingItem.date) : new Date());
  const [showPicker, setShowPicker] = useState(false);

    const handleSave = async () => {
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
        <View style={styles.container}>
          <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 24}}>{editingItem? 'Edit Subscription': 'Add new Subscription'}</Text>
            <Text style={styles.label}>Subscription Name</Text>
            <TextInput 
                style={styles.input} 
                placeholder="e.g. Netflix" 
                value={name} 
                onChangeText={setName} 
            />

            <Text style={styles.label}>Price</Text>
            <TextInput 
                style={styles.input} 
                placeholder="0.00" 
                keyboardType="numeric" 
                value={price} 
                onChangeText={setPrice} 
            />

            <Text style={styles.label}>Last Paid Date (DD/MM/YYYY)</Text>
            <TouchableOpacity 
                style={styles.dateDisplay} 
                onPress={() => setShowPicker(true)}
            >
                <Text style={styles.dateText}>
                    {dateInfo.toLocaleDateString()} {/* Formats based on user locale */}
                </Text>
            </TouchableOpacity>

            {/* The actual Picker component */}
            {showPicker && (
                <DateTimePicker
                    value={dateInfo}
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

            <Text style={styles.label}>Billing Cycle</Text>
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
                color="white" 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: 'white', borderRadius: 10 },
    label: { fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5 },
    cycleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, marginTop: 10 }, 
    dateDisplay: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        alignItems: 'center'
    },
    dateText: { fontSize: 16, color: '#333' }
});

export default AddSubscriptionForm;