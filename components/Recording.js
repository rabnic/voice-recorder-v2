import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { AntDesign } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const Recording = () => {
    return (
        <View style={styles.recordingContainer}>
            <View style={styles.playButtonContainer}>
                {/* <AntDesign name="playcircleo" size={44} color="#b2b1b1" /> */}
                <Ionicons name="play-circle-outline" size={44} color="#b2b1b1" />
            </View>
            <View style={styles.recordingDetailsContainer}>
                <Text style={styles.recordTitle}>Recording 1</Text>
                <Text style={styles.durationAndDate}>3:15   3-Aug-2023</Text>
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