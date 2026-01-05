import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes, isSuccessResponse, isErrorWithCode } from '@react-native-google-signin/google-signin';
import { getAuth, GoogleAuthProvider, signInWithCredential, onAuthStateChanged} from '@react-native-firebase/auth';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const HomeScreen: React.FC=  () => {
    const [userInfo, setUserInfo] = React.useState<any>(null);
    GoogleSignin.configure({
        webClientId: '924988303048-5grleknnej9l2chrm11mdaviua17q5nd.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
    })

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
    });

    return () => unsubscribe();
}, []);

const signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            if(isSuccessResponse(response)){
                setUserInfo(JSON.parse(JSON.stringify(response.data)));
                console.log('Google Sign-In successful', response.data);
                connectFirebase(response.data.idToken, 'sign in');
            }
            else {
                console.log('Google Sign-In was not successful');
            }
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

const connectFirebase = async (idToken: string, method: string) => {
    try {
        // console.log("Is Firebase ready?", getApps().length > 0 ? "Yes" : "No");
            console.log('Code reached here by', method);
        const googleCredential = GoogleAuthProvider.credential(idToken);
        // console.log('google credential', googleCredential);
        // console.log('code reaches here');
        const authInstance = getAuth();
        console.log('auth instance retrieved');
        const userCredential = await signInWithCredential(authInstance, googleCredential);
        console.log('Firebase Sign-In successful', userCredential.user.displayName);
    }
    catch (error) {
        console.log('Error during Firebase Sign-In', error);
    }
}


    const signOut = async ()=> {
        await AsyncStorage.removeItem('@user');
        await GoogleSignin.signOut();
        setUserInfo(null);
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
                <Button title='Sign out' onPress={()=> signOut()} disabled={userInfo === null}/>
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