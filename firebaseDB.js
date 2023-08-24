import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGEwwRCLdRXYLhMYgrCkh-67beRw31i-U",
  authDomain: "voice-recorder-84355.firebaseapp.com",
  projectId: "voice-recorder-84355",
  storageBucket: "voice-recorder-84355.appspot.com",
  messagingSenderId: "823767307506",
  appId: "1:823767307506:web:5f2b93939e7b1b296dec6b"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);


// const imageRef = ref(storage, 'recordings/' + file.name);
// uploadBytesResumable(imageRef, file, metadata)
//   .then((snapshot) => {
//     console.log('Uploaded', snapshot.totalBytes, 'bytes.');
//     console.log('File metadata:', snapshot.metadata);
//     // Let's get a download URL for the file.
//     getDownloadURL(snapshot.ref).then((url) => {
//       console.log('File available at', url);
//       // ...
//     });
//   }).catch((error) => {
//     console.error('Upload failed', error);
//     // ...
//   });

export const uploadToFirebaseStorage = async (recording) => {
  try {
    console.log('start upload to firebase storage');
    // console.log(recording);
    // const response = await fetch(recording.file);
    // if (!response.ok) {
    //   throw new Error('Network response was not ok');
    // }
    console.log('file', recording.file);

    const blob = await fetchAudioFile(recording.file).then((audioFile) => {
      console.log('i have blob', audioFile);
      return audioFile;
    }).catch((error) => {
      console.log('error', error);
    });

    console.log('blob', blob);

    if (blob) {
      const storageRef = ref(storage, `user1/${recording.title}.mp3`);
      await uploadBytes(storageRef, blob);
      // await storageRef.put(blob);
      const downloadUrl = await getDownloadURL(storageRef);
      console.log('Recording uploaded to Firebase Storage.');
      // console.log(downloadUrl);
      return downloadUrl;
    }
  } catch (error) {
    console.error('Error uploading recording to Firebase:', error);
  }
};

const fetchAudioFile = (uri) => {
  console.log('inside fetchAudioFile');
  return new Promise((resolve, reject) => {
    // const request = new XMLHttpRequest();
    // request.responseType = 'blob';
    // request.onreadystatechange = e => {
    //   console.log('inside onready');
    //   console.log(e);
    //   if (request.readyState !== 4) {
    //     return;
    //   }

    //   // if (request.status === 200 || request.status === 0) {
    //     console.log('success', request.response);
    //     resolve(request.response);
    //   // } else {
    //   //   // console.warn('error');
    //   //   reject(request.responseText);
    //   // }
    // };

    // request.open('GET', uri);
    // request.send();
    ////////////////////////////////////////////////////////////////
    const xhr = new XMLHttpRequest();
    xhr.open('GET', uri, true);
    xhr.responseType = 'blob';

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
      reject(new Error('Network error'));
    };

    xhr.send();

  });
};
