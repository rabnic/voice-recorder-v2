import React, { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

import Recording from './components/Recording';

export default function App() {
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);

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
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }

    setRecording(undefined);
    setIsRecording(false);
    setTimer(0);
  }

  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <TouchableOpacity
      onPress={isRecording ? stopRecording : startRecording}
      style={{
        padding: 20,
        backgroundColor: isRecording ? 'red' : 'green',
        borderRadius: 10,
      }}
    >
      <Text style={{ color: 'white' }}>{isRecording ? 'Stop' : 'Start'} Recording</Text>
    </TouchableOpacity>
    <Text style={{ marginTop: 20 }}>{timer} seconds</Text>
  </View>

  return (
    <View style={styles.container}>

      <View style={styles.innerContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.timer}>{timer}</Text>
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
          <Recording />
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
    color: '#b2b1b1'
  },
  recordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonContainer: {
    width: 250,
    height: 250,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: '#b2b1b1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#b2b1b1',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5.00,

    elevation: 12,
  },
  recordButton: {
    width: 150,
    height: 150,
    borderRadius: 150,

    backgroundColor: 'rgb(246,32,69)',
    shadowColor: 'rgb(246,32,69)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgb(246,32,69)',
    shadowOffset: {
      width: 4,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16.00,

    elevation: 24,
  },
  recordButtonText: {
    fontSize: 28,
    letterSpacing: 3,
  },
  recordingsContainer: {
    flex: 1,
  }
});
