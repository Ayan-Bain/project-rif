import React, { createContext, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from './AuthHandler';
import Subscription from '../../subscriptions/subsciption';
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
};

type cycleType = 'monthly' | 'yearly' | 'weekly';

const RetrieveData = createContext<RetriveDataType>({} as RetriveDataType);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const {user} = useAuth();
    const [data, setData] = React.useState<Subscription[]>();
    const [loading, setLoading] = React.useState<boolean>(false);
    const getStorageKey = (uid: uidType): string => {
        return (uid ? "@data_" + uid : "@data_guest");
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
            const storageData = JSON.parse(jsonString);
            const newList = storageData.data.filter((item: Subscription)=> {
                item.id !== id;
              })
            await AsyncStorage.setItem(
              getStorageKey(uid),
              JSON.stringify({ ...storageData, data: newList
            })
            );
            setData(newList);
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

    useEffect(()=> {
        if(user) {
            save(user.uid, null);
        }
    },[user])

    return(
        <RetrieveData.Provider value={{data, loading, retrieve, save, deleteSubscription, update}}>
            {children}
        </RetrieveData.Provider>
    )
}

export const useData = () => useContext(RetrieveData);