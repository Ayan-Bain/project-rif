import { StatusBar } from 'react-native';
import React from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Image } from 'react-native';
import { useAuth } from './services/AuthHandler';
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
import AccountStatus from './AccountStatus';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen: React.FC=  () => {
    const { isLoading} = useAuth();

// useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//         if (user) {
//             // console.log('User is signed in:', user.displayName);
//             setUserInfo(user);
//             console.log('User info:', user);
//         } else {
//             console.log('No user is signed in.');
//             setUserInfo(null);
//         }
//         setIsLoading(false);
//     });

//     return () => unsubscribe();
// }, []);

// const signIn = async () => {
//     setIsLoading(true);    
//     try {
//             const checker = await signInWithGoogle();
//             if(!checker) {
//                 setUserInfo(null);
//                 setIsLoading(false);
//             }
//         }
//         catch (error) {
//           if (isErrorWithCode(error)) {
//             switch (error.code) {
//               case statusCodes.IN_PROGRESS:
//                 console.log("Sign-in is in progress already");
//                 break;
//               case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
//                 console.log("Play services not available or outdated");
//                 break;
//             }
//           } else {
//             console.log(
//               "An unknown error occurred during Google Sign-In",
//               error
//             );
//           }
//         }

// }

if(isLoading) {
    return(
        <SafeAreaView style={[styles.container,{justifyContent: 'center'}]}>
            <StatusBar barStyle="dark-content" />
            <ActivityIndicator size={100}/>
        </SafeAreaView>
    )
}
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View
          style={{
            justifyContent: "flex-start",
            alignItems: "flex-end",
            marginRight: "2%",
          }}
        >
          <AccountStatus />
        </View>
        <View style={{ alignItems: "center", marginTop: "15%" }}>
          <Text>This is the list of Subscriptions</Text>
        </View>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
});
export default HomeScreen;