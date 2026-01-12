import React, { createContext, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'
import {getFirestore, doc, getDoc, setDoc, serverTimestamp} from '@react-native-firebase/firestore'
import { useAuth } from './AuthHandler';
import Subscription from '../../subscriptions/subsciption';
import { Alert } from 'react-native';
import { syncNotificationBatch } from './NotificationManager';
import { NotificationRegistry, requestNotificationPermission } from './NotificationRegistry';
import * as Notifications from 'expo-notifications'
import { getBrandMetadata } from './DetailsHelper';
type uidType = null | string;
interface dataInputTypePrimitive{
    name: string;
    date: string;
    cycle: cycleType;
    price: number;
    isAutoPayOn?: boolean
}

type dataInputType = null | dataInputTypePrimitive;
interface RetriveDataType {
    data?: Subscription[] | undefined;
    loading?: boolean;
    retrieve?: (uid: uidType)=> Promise<void>;
    save?: (uid: uidType, data: dataInputType)=> Promise<void>;
    deleteSubscription?: (uid: uidType, id: string) => Promise<void>;
    update?: (uid: uidType, subscriptionId: string, updatedFields: dataInputType) => Promise<void>;
    isCloudSyncOn?: boolean;
    setCloudSyncOn?: (val: boolean) => void;
    download?: (uid: uidType) => Promise<void>;
    themeMode?: 'light' | 'dark' | 'system';
    toggleTheme?: (val: 'light' | 'dark' | 'system') => void;
    days?: number;
    setDays?: (val: number) => void;
};

type cycleType = 'monthly' | 'yearly' | 'weekly';

const RetrieveData = createContext<RetriveDataType>({} as RetriveDataType);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const {user} = useAuth();
    const [data, setData] = React.useState<Subscription[]>();
    const [loading, setLoading] = React.useState<boolean>(false);
    const [isCloudSyncOn, setCloudSync] = React.useState<boolean>(false);
    const [days, setDay] = React.useState<number>(3);
    const [themeMode, setTheme] = React.useState<'light' | 'dark' | 'system'>('system');
    const getStorageKey = (uid: uidType): string => {
        return (uid ? "@data_" + uid : "@data_guest");
    }

const toggleTheme = async (mode: 'light' | 'dark' | 'system') => {
    setTheme(mode);
    try {
        await AsyncStorage.setItem('user_theme_preference', mode);
        console.log('Changed theme to',mode);
    }
    catch (e) {
        console.error('Error in saving theme preference')
    }
}
const setCloudSyncOn = async (mode: boolean) => {
    setCloudSync(mode);
    try {
        await AsyncStorage.setItem('user_cloud_preference', mode===true?'1':'0');
        console.log('Changed cloud preference to',mode);
    }
    catch (e) {
        console.error('Error in saving cloud preference')
    }
}
const setDays = async (mode: number) => {
    setDay(mode);
    try {
        await AsyncStorage.setItem('user_days_preference', String(mode));
        console.log('Changed days preference to',mode);
    }
    catch (e) {
        console.error('Error in saving days preference')
    }
}

    const retrieve = async (uid: uidType) => {
        setLoading(true);
        try {
            const storageData = await AsyncStorage.getItem(getStorageKey(uid));
            if(!storageData) {
                const tempData = {
                    'uid': null,
                    'data': []
                }
                await AsyncStorage.setItem(getStorageKey(uid), JSON.stringify(tempData));
                setData(tempData.data);
            }
            else {
                const storageData = JSON.parse(await AsyncStorage.getItem(getStorageKey(uid)));
                if(uid === null) {
                    if (storageData.uid === null) {
                        setData(storageData.data);
                    }
                    else {
                        // setData(storageData.data);
                        console.error('Manual error: In storage UID!=null but request comes from UID=null');
                    }
                }
                else {
                        setData(storageData.data);
                }
            }
        }
        catch (e) {
            console.error('Error in retrieving data', e);
        }
        finally {
            setLoading(false);
        }
    }

    const save = async (uid: uidType, input: dataInputType) => {
    if (!input) return;
    try {
        const storageKey = getStorageKey(uid);
        const jsonString = await AsyncStorage.getItem(storageKey);
        const storageData = jsonString ? JSON.parse(jsonString) : { uid, data: [] };
        const newData: Subscription = {
            ...input,
            id: Date.now().toString(),
            category: 'other', // Placeholder
            logo: null,
        };
        const optimisticList = [...(storageData.data || []), newData];
        setData(optimisticList);
        await AsyncStorage.setItem(storageKey, JSON.stringify({ ...storageData, data: optimisticList }));
        getBrandMetadata(input.name).then(async (metadata) => {
            const finalData = { ...newData, ...metadata };
            setData(current => current?.map(item => item.id === newData.id ? finalData : item));
            const latestJson = await AsyncStorage.getItem(storageKey);
            const latestStorage = latestJson ? JSON.parse(latestJson) : storageData;
            latestStorage.data = latestStorage.data.map((item: any) => item.id === newData.id ? finalData : item);
            console.log('====================================');
            console.log(latestStorage);
            console.log('====================================');
            await AsyncStorage.setItem(storageKey, JSON.stringify(latestStorage));
            setData(latestStorage);
            await syncNotificationBatch(finalData, days);
        }).catch(async () => {
            await syncNotificationBatch(newData, days);
        });
    } catch (e) {
        console.error('Save Error:', e);
    }
};

const deleteSubscription = async (uid: uidType,id: string ) => {
    try {
        const oldIds = await NotificationRegistry.getNotifIds(id);
    if (oldIds && Array.isArray(oldIds)) {
        for (const notifId of oldIds) {
            await Notifications.cancelScheduledNotificationAsync(notifId);
        }
    }
        const jsonString = await AsyncStorage.getItem(getStorageKey(uid));
        if(!jsonString) return;
        const storageData = JSON.parse(jsonString);
        const newList = storageData.data.filter((item: Subscription)=> 
            item.id !== id
          )
        await AsyncStorage.setItem(
          getStorageKey(uid),
          JSON.stringify({ ...storageData, data: newList
        })
        );
        setData(newList);
        console.log("Subsciption with ID",id, "is deleted successfully");
        console.log("New Data:",newList);
    }
    catch (e) {
        console.error('Error in deleting subscription',e);
    }
}


    const update = async (uid: uidType, subscriptionId: string, updatedFields: dataInputType) => {
    if (!updatedFields) return;
    try {
        const storageKey = getStorageKey(uid);
        const jsonString = await AsyncStorage.getItem(storageKey);
        if (!jsonString) return;

        const storageData = JSON.parse(jsonString);
        const originalItem = storageData.data.find((i: Subscription) => i.id === subscriptionId);
        
        // 1. Optimistic Update (UI)
        const updatedItem = { ...originalItem, ...updatedFields };
        const updatedList = storageData.data.map((item: Subscription) =>
            item.id === subscriptionId ? updatedItem : item
        );
        setData(updatedList);

        // 2. If name changed, trigger background metadata refresh
        if (updatedFields.name !== originalItem.name) {
            getBrandMetadata(updatedFields.name).then(async (metadata) => {
                const enhancedItem = { ...updatedItem, ...metadata };
                // Update storage with enhanced metadata
                const latest = await AsyncStorage.getItem(storageKey);
                const latestData = JSON.parse(latest || '{}');
                latestData.data = latestData.data.map((i: any) => i.id === subscriptionId ? enhancedItem : i);
                console.log('====================================');
                console.log(latestData);
                console.log('====================================');
                await AsyncStorage.setItem(storageKey, JSON.stringify(latestData));
                setData(latestData.data);
                await syncNotificationBatch(enhancedItem, days);
            });
        } else {
            // Standard update (date/price/cycle)
            await AsyncStorage.setItem(storageKey, JSON.stringify({ ...storageData, data: updatedList }));
            await syncNotificationBatch(updatedItem, days);
        }
    } catch (e) {
        console.error("Update Error:", e);
    }
};

    const uploadToCloud = async (uid: uidType) => {
        if(user && isCloudSyncOn && data.length>0) {
            try {
                const db = getFirestore();
                const userDocRef = doc(db, 'users',uid);
                await setDoc(userDocRef, {
                    subscriptions: data,
                    lastUpdated: serverTimestamp(),
                }, {merge: true});
                console.log('Auto synced to firestore');
            }
            catch (e) {
                console.error('Auto-sync failed')
            }
        }
    }
const download = async (uid: uidType) => {
    if(!uid) return;
    setLoading(true);
    try {
        const db = getFirestore();
        const docum = doc(db, 'users', uid);
        const docu = await getDoc(docum);
        if (docu.exists) {
            const cloudData = docu.data()?.subscriptions || [];
            const key = getStorageKey(uid);
            if(data.length>cloudData.length) {
                Alert.alert(
                    "Confirmation to overwrite local data",
                    "Are you sure you want to overwrite local data with cloud data ?",
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Delete",
                      style: "destructive",
                      onPress: () => {
                          setData(cloudData);
                          setCloudSyncOn(true);
                          Alert.alert("Cloud Data downloaded successfully");            
                        },
                    },
                ]
                );
            }
            await AsyncStorage.setItem(key, JSON.stringify({uid, data: cloudData}));
            setData(cloudData);
            await requestNotificationPermission();
            for(const sub of cloudData) {
                syncNotificationBatch(sub, days);
            }
            setCloudSyncOn(true);
            Alert.alert('Cloud Data downloaded successfully');
        }
        else {
            Alert.alert('Data unavailable', 'No data found in the cloud for this account');
        }
    }
    catch (e) {
        console.error('Cloud download failed', e);
    }
    finally {
        setLoading(false);
    }
}
useEffect(() => {
  if (user) {
    uploadToCloud(user.uid);
  }
}, [data, isCloudSyncOn]);
useEffect(()=> {
    if(user) {
        save(user.uid, null);
    }
},[user])
useEffect(()=> {
    const loadTheme = async ()=> {
        try {
            const savedTheme = await AsyncStorage.getItem('user_theme_preference');
            if(savedTheme!==null) {
                setTheme(savedTheme as 'light' | 'dark' | 'system');
            }
        }
        catch (e) {
            console.error('Error loading user theme preference');
        }
    }
    loadTheme();
},[])
useEffect(()=> {
    const loadCloud = async ()=> {
        try {
            const savedCloud = await AsyncStorage.getItem('user_cloud_preference');
            if(savedCloud!==null) {
                setCloudSyncOn(Number(savedCloud)===1?true:false);
            }
        }
        catch (e) {
            console.error('Error loading user cloud preference');
        }
    }
    loadCloud();
},[])
useEffect(()=> {
    const loadDays = async ()=> {
        try {
            const savedDays = await AsyncStorage.getItem('user_days_preference');
            if(savedDays!==null) {
                setDays(Number(savedDays));
            }
        }
        catch (e) {
            console.error('Error loading user days preference');
        }
    }
    loadDays();
},[])
return (
  <RetrieveData.Provider
    value={{
      data,
      loading,
      retrieve,
      save,
      deleteSubscription,
      update,
      isCloudSyncOn,
      setCloudSyncOn,
      download,
      themeMode,
      toggleTheme,
      days,
      setDays
    }}
  >
    {children}
  </RetrieveData.Provider>
);
}

export const useData = () => useContext(RetrieveData);


export const calculateTotalMonthly = (subscriptions: Subscription[]): number => {
  return subscriptions.reduce((total, sub) => {
    let monthlyPrice = sub.price;
    if (sub.cycle === 'weekly') monthlyPrice = sub.price * 4;
    if (sub.cycle === 'yearly') monthlyPrice = sub.price / 12;
    return total + monthlyPrice;
  }, 0);
};