import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ViewState, AuthSession } from "./types";
import { auth, db } from "./firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut 
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, limit, getDocs } from "firebase/firestore";

interface AppContextType {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  authSession: AuthSession;
  setAuthSession: (session: AuthSession) => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  authLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [authSession, setAuthSession] = useState<AuthSession>({ isLoggedIn: false, user: null });
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          let role: 'admin' | 'user' = 'user';
          let name = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "사용자";

          if (!userDocSnap.exists()) {
            const usersRef = collection(db, "users");
            const q = query(usersRef, limit(1));
            const querySnapshot = await getDocs(q);
            const isFirstUser = querySnapshot.empty;
            role = isFirstUser ? 'admin' : 'user';

            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: name,
              role: role,
              createdAt: new Date().toISOString()
            });
          } else {
            const data = userDocSnap.data();
            role = (data.role as 'admin' | 'user') || 'user';
            name = data.name || name;
          }

          setAuthSession({
            isLoggedIn: true,
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: name,
              role: role,
            },
          });
          setCurrentView((prev) => {
            if (prev === 'auth') {
              return role === 'admin' ? 'admin_dashboard' : 'dashboard';
            }
            return prev;
          });
        } catch (error) {
          console.error("Error running onAuthStateChanged user role check:", error);
          setAuthSession({
            isLoggedIn: true,
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "사용자",
              role: 'user',
            },
          });
          setCurrentView((prev) => (prev === 'auth' ? 'dashboard' : prev));
        }
      } else {
        setAuthSession({ isLoggedIn: false, user: null });
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      const usersRef = collection(db, "users");
      const q = query(usersRef, limit(1));
      const querySnapshot = await getDocs(q);
      const isFirstUser = querySnapshot.empty;
      const role = isFirstUser ? 'admin' : 'user';

      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        email: email,
        name: name,
        role: role,
        createdAt: new Date().toISOString()
      });

      setAuthSession({
        isLoggedIn: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email || "",
          name: name,
          role: role,
        },
      });
      setCurrentView(role === 'admin' ? 'admin_dashboard' : 'dashboard');
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentView('home');
  };

  return (
    <AppContext.Provider 
      value={{ 
        currentView, 
        setCurrentView, 
        authSession, 
        setAuthSession, 
        signInWithEmail, 
        signUpWithEmail, 
        logout,
        authLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
