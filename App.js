import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Recording from './components/Recording';
import NoRecordings from './components/NoRecordings';
import { uploadToFirebaseStorage } from './firebaseDB';

export default function App() {
  const [recording, setRecording] = useState();
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);

  useEffect( () => {
    // const getData = async () => {
    //   const recordings = await AsyncStorage.getItem('recordings');
    //   const parsedRecordings = recordings ? JSON.parse(recordings) : [];
    //   setRecordings(parsedRecordings);
    //   console.log(parsedRecordings);
    // }
    // getData();
  }, [recording]);

  // async function saveAsyncStorageRecordingsToFirebase() {
  //   try {
  //     const recordings = await AsyncStorage.getItem('recordings');
  //     const parsedRecordings = recordings ? JSON.parse(recordings) : [];
  //     await saveRecordingsToFirebase(parsedRecordings);
  //     console.log('Saved recordings from AsyncStorage to Firebase successfully');
  //   } catch (error) {
  //     console.error('Failed to save recordings from AsyncStorage to Firebase:', error);
  //   }
  // }

  async function saveRecordingToAsyncStorage(recordingObject) {
    try {
      const recordings = await AsyncStorage.getItem('recordings');
      const parsedRecordings = recordings ? JSON.parse(recordings) : [];
      parsedRecordings.push(recordingObject);
      await AsyncStorage.setItem('recordings', JSON.stringify(parsedRecordings));
      console.log('Recording saved to AsyncStorage successfully');
    } catch (error) {
      console.error('Failed to save recording to AsyncStorage:', error);
    }
  }


  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);

      setRecording(recording);
      setIsRecording(true);

      intervalRef.current = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);

      await recording.startAsync();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }

  async function stopRecording() {
    clearInterval(intervalRef.current);

    try {
      await recording.stopAndUnloadAsync();
      const today = new Date();

      //
      // Fetch the audio data from the URI
      // const response = await fetch(recording.getURI());
      // console.log(response);
      // const blob = await response.blob();
      // console.log(blob);

      const recordingObject = {
        title: `Recording ${recordings.length + 1}`,
        date: `${today.getDay()}-${today.getMonth()}-${today.getFullYear()}`,
        duration: convertSecondsToMinutes(timer),
        file: recording.getURI(),
      };
      console.log('uri', recording.getURI());
      await saveRecordingToAsyncStorage(recordingObject);

      uploadToFirebaseStorage(recordingObject).then((response)=> {
        console.log('response', response);
        // recordingObject.file = response
        setRecordings(prevRecordings => {return [ recordingObject, ...prevRecordings]})
      }).catch((error) => {
        console.log(error);
      });
      // console.log('----',recordingObject);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }

    setRecording(undefined);
    setIsRecording(false);
    setTimer(0);
  }

  function convertSecondsToMinutes(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;

    return minutes + ':' + (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
  }


  return (
    <View style={styles.container}>

      <View style={styles.innerContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.timer, { color: isRecording ? '#ffffff' : '#b2b1b1' }]}>{convertSecondsToMinutes(timer)}</Text>
        </View>

        <View style={styles.recordContainer}>
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
          >
            <View style={styles.recordButtonContainer}>
              <View style={styles.recordButton}>
                <Text style={styles.recordButtonText}>
                  {
                    isRecording ?
                      (<FontAwesome name="microphone-slash" size={52} color="white" />)
                      :
                      (<FontAwesome name="microphone" size={52} color="white" />)
                  }
                </Text>
              </View>
            </View>
          </TouchableOpacity>

        </View>

        <View style={styles.recordingsContainer}>
          {
            recordings.length > 0 ?
              <FlatList
                data={recordings}
                renderItem={({ item }) => <Recording recording={item}/>}
              // keyExtractor={item => item.id}
              />
              :
              <NoRecordings />
          }

        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(31,30,31)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  scrollView: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgb(255,255,255)',
  },
  innerContainer: {
    flex: 1,
    width: '100%',

    height: '100%',
    marginHorizontal: 20,
  },
  headerContainer: {
    marginHorizontal: 20,
    paddingVertical: 10,

  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
  },
  recordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonContainer: {
    width: 250,
    height: 250,
    borderRadius: 250/2,
    borderWidth: 1,
    borderColor: '#b2b1b1',
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: '#b2b1b1',
    // shadowOffset: {
    //   width: 1,
    //   height: 1,
    // },
    // shadowOpacity: 0.2,
    // shadowRadius: 5.00,

    // elevation: 12,
  },
  recordButton: {
    width: 150,
    height: 150,
    borderRadius: 150/2,

    backgroundColor: 'rgb(246,32,69)',
    shadowColor: 'rgb(246,32,69)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgb(246,32,69)',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 16.00,

    elevation: 12,
  },
  recordButtonText: {
    fontSize: 28,
    letterSpacing: 3,
  },
  recordingsContainer: {
    flex: 1,
  }
});
