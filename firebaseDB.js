import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, updateDoc, deleteDoc, addDoc, getDocs, collection, initializeFirestore, getDoc } from "firebase/firestore";
import {getAuth,updateProfile ,createUserWithEmailAndPassword, signInWithEmailAndPassword, initializeAuth, getReactNativePersistence, signOut} from "firebase/auth";
// import { getReactNativePersistence } from "firebase/auth/react-native"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGEwwRCLdRXYLhMYgrCkh-67beRw31i-U",
  authDomain: "voice-recorder-84355.firebaseapp.com",
  projectId: "voice-recorder-84355",
  storageBucket: "voice-recorder-84355.appspot.com",
  messagingSenderId: "823767307506",
  appId: "1:823767307506:web:5f2b93939e7b1b296dec6b",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
// const auth = getAuth(app);
export const auth = getAuth(app, {
  // persistence: getReactNativePersistence(AsyncStorage),
})

export const signUpWithEmailAndPassword = async (email, password) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      console.log('User signed in successfully');
    })
    .catch((error) => {
      console.log('SignIn Error =',error);
    });
}

export const signInUserWithEmailAndPassword = async (email,password) => {
  signInWithEmailAndPassword(auth,email, password)
  .then( async (userCredential) => {
    const {user} = userCredential;
    console.log('User signed in:', user.email);
    await getUser(user.email).then((userData) => {
        console.log('User data:', userData);
    })
  }).catch((error) => {
    console.log('Could not sign in',error);
  })
} 

export const signOutUser = async () => {
  signOut(auth)
    .then( async () => {
      await AsyncStorage.removeItem('user');
      console.log("Sign-out successful.");
    })
    .catch((error) => {
      console.log(error);
    });
}
// dribble, awwwards, mobbing, framer, ux toast ================================
export const registerUser = async (user) => {
  try {
    // Add a new document in collection "users"
    console.log('trying to register', user.email)
    await setDoc(doc(db, 'users', user.email), user)
    .then( async () => {
      console.log("User registered");
      await AsyncStorage.setItem('user', JSON.stringify({email: user.email}));
    }).catch((error) => {
      console.log(error);
    });
  } catch (e) {
    console.error("Error adding user document: ", e);
  }
}

export const getUser = async (email) => {
  const userDocRef = doc(db, 'users', email);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    // console.log("Document data:", docSnap.data());
    return docSnap.data();
  } else {
    console.log("No such document!");
    return null;
  }
};

export const getAllData = async (userEmail) => {
  try {
    // console.log('trying to get all',userEmail)
    const docRef = doc(db, 'users', userEmail);
    const recordingsRef = collection(docRef,'recordings');
    const response = await getDocs(recordingsRef);
    // console.log('response', response);
    const data = []
    response.forEach((recordingData) => {
      // console.log('----',{ ...recordingData.data(), id: recordingData.id })
      data.push({ ...recordingData.data(), id: recordingData.id });
    })
   return data; 
} catch (error) {
    console.log(error.message);
}
};

export const deleteRecording = async (userEmail, id) => {
  const docRef = doc(db, 'users', userEmail);
  return await deleteDoc(doc(docRef, "recordings", id));
};

export const updateRecording = async (id, userEmail, newTitle) => {
  const docRef = doc(db, 'users', userEmail);
  return await updateDoc(doc(docRef, "recordings", id),{title: newTitle});
}

export const uploadToFirestore = async (userEmail, recording) => {
  try {
    // console.log(userEmail, recording)
    const docRef = doc(db, 'users', userEmail);
    const collectionRef = collection(docRef, 'recordings');
    const addedDoc = await addDoc(collectionRef, recording);

    // const addedDoc = await addDoc(collection(db,'user1-recordings'), recording);
    // console.log('Added doc: ' + addedDoc.id);
    return  addedDoc.id;
  } catch (error) {
    console.log(error);
  }
};

export const uploadToFirebaseStorage = async (userEmail, recording) => {
  try {
    // console.log("start upload to firebase storage");

    // console.log("file", typeof recording.file);
    let fileType = "";
    const blob = await fetchAudioFile(recording.file)
      .then((audioFile) => {
        // console.log("i have audio", audioFile);
        const uriParts = recording.file.split(".");
        fileType = uriParts[uriParts.length - 1];

        return audioFile;
      })
      .catch((error) => {
        console.log("error", error);
      });

    // console.log("blob", blob);

    if (blob) {
      const storageRef = ref(storage, `${userEmail}/${recording.title}.${recording.file.includes('blob') ? 'webm':fileType}`);
      await uploadBytes(storageRef, blob, { contentType: `audio/${recording.file.includes('blob') ? 'webm':fileType}` });
      const downloadUrl = await getDownloadURL(storageRef);
      // console.log("Recording uploaded to Firebase Storage.");
      return downloadUrl;
    }
  } catch (error) {
    // console.error("Error uploading recording to Firebase:", error);
  }
};

const fetchAudioFile = (uri) => {
  console.log("inside fetchAudioFile");
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", uri, true);
    xhr.responseType = "blob";

    xhr.onload = () => {
      // console.log('status =', xhr.status);
      if (xhr.status === 0 || xhr.status === 200) {
        console.log(xhr.response);
        resolve(xhr.response);
      } else {
        reject(new Error(xhr.statusText));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error"));
    };

    xhr.send(null);
  });
};


