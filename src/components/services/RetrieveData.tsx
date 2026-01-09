import React, { createContext, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'
import {getFirestore, doc, getDoc, setDoc, serverTimestamp} from '@react-native-firebase/firestore'
import { useAuth } from './AuthHandler';
import Subscription from '../../subscriptions/subsciption';
import { Alert } from 'react-native';
type uidType = null | string;
interface dataInputTypePrimitive{
    name: string;
    date: string;
    cycle: cycleType;
    price: number;
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
};

type cycleType = 'monthly' | 'yearly' | 'weekly';

const RetrieveData = createContext<RetriveDataType>({} as RetriveDataType);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const {user} = useAuth();
    const [data, setData] = React.useState<Subscription[]>();
    const [loading, setLoading] = React.useState<boolean>(false);
    const [isCloudSyncOn, setCloudSyncOn] = React.useState<boolean>(false);
    const [themeMode, setTheme] = React.useState<'light' | 'dark' | 'system'>('system');
    const getStorageKey = (uid: uidType): string => {
        return (uid ? "@data_" + uid : "@data_guest");
    }

    const toggleTheme = async (mode: 'light' | 'dark' | 'system') => {
        setTheme(mode);
        try {
            await AsyncStorage.setItem('user_theme_preference', mode);
            console.log('====================================');
            console.log('Changed theme to',mode);
            console.log('====================================');
        }
        catch (e) {
            console.error('Error in saving theme preference')
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

    const save = async (uid: uidType, data: dataInputType) => {
        try {
            const jsonString = await AsyncStorage.getItem(getStorageKey(uid));
            const storageData = jsonString !== null ? JSON.parse(jsonString) : {uid: uid,data: []};
            if(storageData.uid === null && uid) {
                storageData.uid = uid;
            }
            if(data) {
                storageData.data = [...storageData.data, {...data,id: Date.now().toString()}]
                console.log(storageData);
                await AsyncStorage.setItem(getStorageKey(uid), JSON.stringify(storageData));
                setData(storageData.data);
            }
        }
        catch (e) {
            console.error('Error in saving data', e);
        }
    }

    const deleteSubscription = async (uid: uidType,id: string ) => {
        try {
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
    try {
        const jsonString = await AsyncStorage.getItem(getStorageKey(uid));
        if (!jsonString) return;

        const storageData = JSON.parse(jsonString);

        const updatedList = storageData.data.map((item: Subscription) => 
            item.id === subscriptionId ? { ...item, ...updatedFields } : item
        );

        await AsyncStorage.setItem(getStorageKey(uid), JSON.stringify({ ...storageData, data: updatedList }));
        setData(updatedList);
        console.log("Subscription updated!");
    } catch (e) {
        console.error("Update Error", e);
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
                await AsyncStorage.setItem(key, JSON.stringify({uid, data: cloudData}));
                setData(cloudData);
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

    useEffect(()=> {
        if(user) {
            uploadToCloud(user.uid);
        }
    },[data, isCloudSyncOn]);

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
          toggleTheme
        }}
      >
        {children}
      </RetrieveData.Provider>
    );
}

export const useData = () => useContext(RetrieveData);