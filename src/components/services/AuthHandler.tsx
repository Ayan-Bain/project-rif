import React, { createContext, useContext, useEffect, useState } from 'react';
import { WEB_CLIENT_ID } from '@env'
import { 
  GoogleSignin, 
  statusCodes, 
  isSuccessResponse, 
  isErrorWithCode 
} from '@react-native-google-signin/google-signin';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithCredential, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  FirebaseAuthTypes
} from '@react-native-firebase/auth';

GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
});

interface AuthContextType {
    user: FirebaseAuthTypes.User | null;
    isLoading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsLoading(false); 
        });
        return () => unsubscribe();
    }, []);

    const signIn = async () => {
        setIsLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            
            if (isSuccessResponse(response) && response.data.idToken) {
                const auth = getAuth();
                const credential = GoogleAuthProvider.credential(response.data.idToken);
                await signInWithCredential(auth, credential);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            if (isErrorWithCode(error)) {
                if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                    console.log("User cancelled login");
                } else {
                    console.log("Google Sign-In Error Code:", error.code);
                }
            } else {
                console.log("Unknown Sign-In Error:", error);
            }
        }
    };

    const signOut = async () => {
        try {
            const auth = getAuth();
            await firebaseSignOut(auth);
            await GoogleSignin.signOut();
        } catch (error) {
            console.log("Sign out error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);