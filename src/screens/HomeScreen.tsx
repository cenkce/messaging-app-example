import React, { useCallback, useState } from "react";
import { ActivityIndicator, Button, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenComponent } from "..";
import { comonStyles } from "../common-styles";
import { useUserLogin } from "./MessagingContext";

const style = StyleSheet.create({
  field: { height: 40, borderColor: 'gray', width: 100, borderWidth: 1, borderRadius: 4, padding: 5 },
  fieldError: { borderColor: 'red', color: 'red' },
  fieldContainer: { alignItems: "center", justifyContent: "center" }
});

export const HomeScreen: ScreenComponent = (props) => {
  const [name, setName] = useState('');
  const login = useUserLogin();
  const [status, setStatus] = useState<'idle' | 'waiting'>('idle')
  const onContinue = useCallback(() => {
    if (status !== 'waiting') {
      login(name)
        .then(() => {
          props.navigation.navigate('Messaging');
          setStatus('idle');
        });
      setName('');
      setStatus('waiting');
    }
  }, [name]);

  // const [user, setNickName] = useMessagingService();
  const isValidUsername = !!name && name.length > 2;

  return <View style={comonStyles.pageRoot}>
    {status === 'idle'
      ? <KeyboardAvoidingView
        style={style.fieldContainer}
        behavior={(Platform.OS === 'ios') ? "padding" : undefined}
        keyboardVerticalOffset={Platform.select({ ios: 100, android: 500 })}
      >
        <TextInput
          style={[style.field, !isValidUsername && !!name ? style.fieldError : {}]}
          onChangeText={(text) => setName(text)}
          value={name}
        />
        <Text style={style.fieldError}>{!isValidUsername && name ? 'Username must be longer than 2 characters' : ''}</Text>
        <Button title='Continue' onPress={onContinue} disabled={!name || !isValidUsername} />
      </KeyboardAvoidingView>
      : <ActivityIndicator size="small" color="#00ff00" />
    }
  </View>
}


HomeScreen.navigationOptions = {
  title: 'Messaging Home',
  headerBackTitle: 'Leave'
};