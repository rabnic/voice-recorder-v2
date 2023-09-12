import React, { useState, useRef, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';

import {
    StyleSheet,
    Text,
    View,
    Image,
    Pressable,
    TextInput,
    ActivityIndicator
} from "react-native";
import FacebookLogo from '../assets/facebook.png';
import GoogleLogo from '../assets/google.png';
import { signInUserWithEmailAndPassword } from "../firebaseDB";

export default function LoginScreen({ navigation }) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async() => {
        setIsLoading(true);
        await signInUserWithEmailAndPassword(email.toLowerCase().trim(),password)
        .then(() => {
            
        }).finally(() => {
            // setIsLoading(false);
        });
    }

    return (
        <View style={styles.innerContainer}>
            <View style={styles.headerContainer}>
                <View style={styles.logoContainer}>
                    <FontAwesome5 name="microphone-alt" style={styles.logo} size={130} color="rgb(246,32,69)" />
                </View>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerText}>
                        Login
                    </Text>
                </View>
            </View>
            <View style={styles.formContainer}>
                <View style={styles.innerFormContainer}>
                    <View style={styles.textInputContainer}>
                        <AntDesign name="mail" size={24} color="black" />
                        <TextInput style={styles.textInput} placeholder="Email" value={email} onChangeText={(text) => setEmail(text)}/>
                    </View>
                    <View style={styles.textInputContainer}>
                        <AntDesign name="lock1" size={24} color="black" />
                        <TextInput style={styles.textInput} placeholder="Password" value={password} onChangeText={(text) => setPassword(text)} secureTextEntry={false}/>
                    </View>
                    <Pressable style={styles.registerButton} onPress={() => {setIsLoading(true), handleSignIn()}}>
                        <Text style={styles.registerButtonText}>Sign In </Text>
                        { isLoading && <ActivityIndicator style={styles.loader} />}
                    </Pressable>
                </View>
                
                <View style={styles.thirdpartyContainer}>
                    <View style={styles.orSignUpWithContainer}>
                        <View style={styles.hr}></View>
                        <Text style={styles.orSignUpWithText}> Or Sign In With</Text>
                        <View style={styles.hr}></View>
                    </View>
                    <View style={styles.thirdpartyButtons}>
                        <Pressable style={styles.thirdpartyButton} onPress={() => { }}>
                        <Image source={FacebookLogo} style={styles.thirdPartyLogo} />
                            <Text style={styles.thirdpartyButtonText}>Facebook</Text>
                        </Pressable>
                        <Pressable style={styles.thirdpartyButton} onPress={() => { }}>
                        <Image source={GoogleLogo} style={styles.thirdPartyLogo} />
                            <Text style={styles.thirdpartyButtonText}>Google</Text>
                        </Pressable>
                    </View>
                    <View style={styles.textAlreadyUserContainer}>
                        <Text style={styles.textAlreadyUser}>
                            New user?
                        </Text>
                        <Pressable style={styles.textAlreadyUserLink} onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.textAlreadyUserLinkText}>
                                Sign Up
                            </Text>
                        </Pressable>
                    </View>

                </View>

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
        borderWidth: 1,
    },
    headerContainer: {
        marginHorizontal: 20,
        paddingVertical: 10,
        flexDirection: 'column',
        flex: 1,
    },
    logoContainer: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    headerText: {
        fontSize: 48,
        fontWeight: "700",
        color: '#cccccc',
    },
    formContainer: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'rgb(246,32,69)',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        padding: 30,
    },
    innerFormContainer: {
        width: "100%",
        flex: 1,
        gap: 10,
    },
    textInputContainer: {
        width: "100%",
        borderColor: '#333333',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        height: 55,
        gap: 10,
        borderRadius: 50,
        paddingHorizontal: 15,
    },
    textInput: {
        flex: 1,
        fontSize: 24,
        backgroundColor: 'transparent'
    },
    registerButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 50,
        height: 55,
        alignItems: 'center',
        marginTop: 10,
        elevation: 3,
        backgroundColor: '#222222',
    },
    loader: {
        position: 'absolute',
        right: 30,
    },
    registerButtonText: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: '700',
        letterSpacing: 0.25,
        color: 'white',
    },
    thirdpartyContainer: {
        flex: 1,
        width: "100%",
        flex: 1,
        gap: 10,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    orSignUpWithContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    orSignUpWithText: {
        flex: 2,
        fontSize: 18,
        color: '#eeeeee',
        textAlign: 'center',
    },
    hr: {
        flex: 1,
        borderWidth: .6,
        borderColor: '#222222',
        opacity: .4,
        height: 0,
        width: '100%',
    },
    thirdpartyButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: "100%",
    },
    thirdpartyButton: {
        backgroundColor: '#ffffff',
        elevation: 3,
        height: 50,
        width: '45%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        gap: 10,
        flexDirection: 'row',

    },
    thirdPartyLogo: {
        width: 18,
        height: 18,
    },
    thirdpartyButtonText: {
        fontSize: 18,
        lineHeight: 21,
        fontWeight: '700',
        letterSpacing: 2,
        color: '#000000',
    },
    textAlreadyUserContainer: {
        flexDirection: 'row',
    },
    textAlreadyUser: {
        fontSize: 22,
        fontWeight: '500',
        color: '#333333',
    },
    textAlreadyUserLink: {
        marginLeft: 5,
    },
    textAlreadyUserLinkText: {
        fontWeight: '700',
        fontSize: 22,
        color: '#dddddd',
    },
});
