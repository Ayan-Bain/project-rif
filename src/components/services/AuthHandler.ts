import React, { useEffect } from 'react';
import { GoogleSignin, statusCodes, isSuccessResponse, isErrorWithCode } from '@react-native-google-signin/google-signin';
import { getAuth, GoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut as firebaseSignOut} from '@react-native-firebase/auth';
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
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

export const signInWithGoogle = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            if(isSuccessResponse(response) && response.data.idToken) {
                console.log('Google Sign-In successful', response.data);
                const auth = getAuth();
                const userCredential = await signInWithCredential(auth, GoogleAuthProvider.credential(response.data.idToken));
                console.log('Firebase Sign-In successful', userCredential.user.displayName);
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
          }
          else {
              console.log(
                  "An unknown error occurred during Google Sign-In",
                  error
                );
            }
            throw error;
        }

}


export const signOutFromGoogle = async ()=> {
        try {
            const auth = getAuth();
            await firebaseSignOut(auth);
            await GoogleSignin.signOut();
            console.log('User signed out successfully');
        }
        catch (error) {
            console.log('Error during sign out', error);
        }
    }
