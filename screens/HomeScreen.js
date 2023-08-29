import React, { useState, useRef, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { FontAwesome } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

// import Recording from "../components/Recording";
import Recording from "../components/Recording";
// import NoRecordings from "../components/NoRecordings";
import NoRecordings from "../components/NoRecordings";
import { getAllData, uploadToFirebaseStorage, uploadToFirestore } from "../firebaseDB";

export default function HomeScreen() {
  const [recording, setRecording] = useState();
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      // Access Firestore collection and fetch data
      getAllData()
      .then((data) => {
          console.log(data);
          setRecordings(data)
       }).catch((error) => { 
        console.log(error); 
      })
    };

    fetchData();
  }, []);

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
  const recordingSettings = {
    android: {
      extension: ".m4a",
      outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
      audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: ".m4a",
      outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
      audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: 'audio/webm',
      bitsPerSecond: 128000,
    },
  };
  async function saveRecordingToAsyncStorage(recordingObject) {
    try {
      const recordings = await AsyncStorage.getItem("recordings");
      const parsedRecordings = recordings ? JSON.parse(recordings) : [];
      parsedRecordings.push(recordingObject);
      await AsyncStorage.setItem(
        "recordings",
        JSON.stringify(parsedRecordings)
      );
      console.log("Recording saved to AsyncStorage successfully");
    } catch (error) {
      console.error("Failed to save recording to AsyncStorage:", error);
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
      // await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.prepareToRecordAsync(recordingSettings);

      setRecording(recording);
      setIsRecording(true);

      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);

      await recording.startAsync();
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }

  async function stopRecording() {
    clearInterval(intervalRef.current);
    try {
      await recording.stopAndUnloadAsync();
      const today = new Date();

      const recordingObject = {
        title: `Recording ${recordings.length + 1}`,
        date: `${today.getDay()}-${today.getMonth()}-${today.getFullYear()}`,
        duration: convertSecondsToMinutes(timer),
        file: recording.getURI(),
      };
      console.log("uri", recording.getURI());
      await saveRecordingToAsyncStorage(recordingObject);

      uploadToFirebaseStorage(recordingObject)
        .then((response) => {
          console.log("response", response);
          // recordingObject.file = response
          uploadToFirestore({ ...recordingObject, file: response })
            .then((docId) => {
              setRecordings((prevRecordings) => {
                return [{ ...recordingObject, id: docId }, ...prevRecordings];
              });

            }).catch((err) => {
              console.log("error adding doc", err);
            })
        })
        .catch((error) => {
          console.log(error);
        });
      // console.log('----',recordingObject);
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }

    setRecording(undefined);
    setIsRecording(false);
    setTimer(0);
  }

  function convertSecondsToMinutes(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;

    return (
      minutes + ":" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds
    );
  }

  return (
    
      <View style={styles.innerContainer}>
        <View style={styles.headerContainer}>
          <Text
            style={[
              styles.timer,
              { color: isRecording ? "#ffffff" : "#b2b1b1" },
            ]}
          >
            {convertSecondsToMinutes(timer)}
          </Text>
        </View>

        <View style={styles.recordContainer}>
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
          >
            <View style={styles.recordButtonContainer}>
              <View style={styles.recordButton}>
                <Text style={styles.recordButtonText}>
                  {isRecording ? (
                    <FontAwesome
                      name="microphone-slash"
                      size={52}
                      color="white"
                    />
                  ) : (
                    <FontAwesome name="microphone" size={52} color="white" />
                  )}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.recordingsContainer}>
          {recordings.length > 0 ? (
            <FlatList
              data={recordings}
              renderItem={({ item }) => <Recording recording={item} setRecordings={setRecordings}/>}
            // keyExtractor={item => item.id}
            />
          ) : (
            <NoRecordings />
          )}
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
 
  innerContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    // marginHorizontal: 20,
  },
  headerContainer: {
    marginHorizontal: 20,
    paddingVertical: 10,
  },
  timer: {
    fontSize: 48,
    fontWeight: "700",
    marginTop: 10,
  },
  recordContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  recordButtonContainer: {
    width: 250,
    height: 250,
    borderRadius: 250 / 2,
    borderWidth: 1,
    borderColor: "#b2b1b1",
    justifyContent: "center",
    alignItems: "center",
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
    borderRadius: 150 / 2,

    backgroundColor: "rgb(246,32,69)",
    shadowColor: "rgb(246,32,69)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgb(246,32,69)",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 16.0,

    elevation: 12,
  },
  recordButtonText: {
    fontSize: 28,
    letterSpacing: 3,
  },
  recordingsContainer: {
    flex: 1,
  },
});
