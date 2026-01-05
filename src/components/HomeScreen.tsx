import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { statusCodes, isErrorWithCode } from '@react-native-google-signin/google-signin';
import { getAuth, onAuthStateChanged} from '@react-native-firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "@react-native-firebase/firestore";
import { signInWithGoogle, signOutFromGoogle } from './services/AuthHandler';

const HomeScreen: React.FC=  () => {
    const [userInfo, setUserInfo] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            // console.log('User is signed in:', user.displayName);
            setUserInfo(user);
        } else {
            console.log('No user is signed in.');
            setUserInfo(null);
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
}, []);

const signIn = async () => {
    setIsLoading(true);    
    try {
            await signInWithGoogle();
        }
        catch (error) {
          if (isErrorWithCode(error)) {
            switch (error.code) {
              case statusCodes.IN_PROGRESS:
                console.log("Sign-in is in progress already");
                break;
              case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                console.log("Play services not available or outdated");
                break;
            }
          } else {
            console.log(
              "An unknown error occurred during Google Sign-In",
              error
            );
          }
        }

}

if(isLoading) {
    return(
        <View style={styles.container}>
            <ActivityIndicator size={100}/>
        </View>
    )
}
    return(
        <View style={styles.container}>
            <Text>Home Screen</Text>
            {!userInfo && (
        <Button title='Sign in with Google' onPress={() => signIn()}/>
                )}
            {userInfo && (
                <View>
                    <Text>Welcome, {userInfo.displayName}</Text>
                <Button title='Sign out' onPress={()=> signOutFromGoogle()} disabled={userInfo === null}/>
                </View>
            )}
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
export default HomeScreen;