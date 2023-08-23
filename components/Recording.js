import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Entypo } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const Recording = ({ recording }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUri, setAudioUri] = useState(recording.file);
    const [sound, setSound] = React.useState();
    console.log(recording);

    useEffect(() => {
        return sound
          ? () => {
              console.log('Unloading Sound');
              
              sound.unloadAsync();
            }
          : undefined;
      }, [sound]);

    const play = async () => {
        setIsPlaying(true)
        console.log('Loading Sound');
        // if(!sound) {
            const { sound } = await Audio.Sound.createAsync({uri:audioUri});
            setSound(sound);
        // }

        console.log('Playing Sound');
        await sound.playAsync();
    }
    const pause = async () => {
        console.log('Pausing Sound');
        
        sound && await sound.pauseAsync();
        // sound && await sound.unloadAsync();
        console.log(sound);
        setIsPlaying(false)
        // setSound(null);
    }
    return (
        <View style={styles.recordingContainer}>
            <View style={styles.playButtonContainer}>
                <TouchableOpacity onPress={isPlaying ? pause : play}>
                    {
                        isPlaying ?
                            <Ionicons name="pause-circle-outline" size={44} color="#b2b1b1" />
                            :
                            <Ionicons name="play-circle-outline" size={44} color="#b2b1b1" />
                    }
                </TouchableOpacity>
            </View>
            <View style={styles.recordingDetailsContainer}>
                <Text style={styles.recordTitle}>{recording.title}</Text>
                <Text style={styles.durationAndDate}>{`${recording.duration}   ${recording.date}`}</Text>
            </View>
            <View style={styles.recordingActionsContainer}>
                <Entypo name="dots-three-vertical" size={24} color="#b2b1b1" />
            </View>
        </View>
    )
}

export default Recording

const styles = StyleSheet.create({
    recordingContainer: {
        padding: 15,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        borderTopWidth: 2,
        borderColor: '#333333',
    },

    recordingDetailsContainer: {
        flex: 2,
    },
    recordTitle: {
        color: '#eeeeee',
        fontWeight: '500',
    },
    durationAndDate: {
        color: '#aaaaaa',
    }
})