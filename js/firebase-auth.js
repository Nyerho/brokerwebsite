// Firebase Authentication for CentralTradehub
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
    // Add your Firebase configuration here
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Enhanced Firebase Authentication Manager
class FirebaseAuthManager {
    constructor() {
        this.currentUser = null;
        this.initializeAuthStateListener();
    }

    // Initialize authentication state listener
    initializeAuthStateListener() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.currentUser = user;
                await this.syncUserProfile(user);
                this.handleAuthSuccess(user);
            } else {
                this.currentUser = null;
                this.handleAuthSignOut();
            }
        });
    }

    // Register new user with email and password
    async register(userData) {
        try {
            const { firstName, lastName, email, password } = userData;
            
            // Create user account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update user profile
            await updateProfile(user, {
                displayName: `${firstName} ${lastName}`
            });

            // Create user document in Firestore
            await this.createUserDocument(user, {
                firstName,
                lastName,
                email,
                createdAt: new Date().toISOString(),
                profile: {
                    avatar: null,
                    bio: '',
                    tradingExperience: userData.accountType || 'beginner',
                    preferences: {
                        notifications: true,
                        newsletter: true,
                        twoFactorAuth: false
                    }
                }
            });

            return { success: true, user };
        } catch (error) {
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    // Sign in with email and password
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            // Check if this is a new user and create profile if needed
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                await this.createUserDocument(user, {
                    firstName: user.displayName?.split(' ')[0] || '',
                    lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                    email: user.email,
                    createdAt: new Date().toISOString(),
                    profile: {
                        avatar: user.photoURL,
                        bio: '',
                        tradingExperience: 'beginner',
                        preferences: {
                            notifications: true,
                            newsletter: true,
                            twoFactorAuth: false
                        }
                    }
                });
            }

            return { success: true, user };
        } catch (error) {
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    // Send password reset email
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true, message: 'Password reset email sent' };
        } catch (error) {