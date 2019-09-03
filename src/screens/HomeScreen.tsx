import React, { useCallback, useState } from "react";
import { ActivityIndicator, Button, KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenComponent } from "..";
import { comonStyles } from "../common-styles";
import { useUserInfo } from "./MessagingContext";

const style = StyleSheet.create({
  field: { height: 40, borderColor: 'gray', width: 100, borderWidth: 1, borderRadius: 4, padding: 5 },
  fieldError: { borderColor: 'red', color: 'red' },
  fieldContainer: { alignItems: "center", justifyContent: "center" }
});

export const HomeScreen: ScreenComponent = (props) => {
  const [username, setUserName] = useState<string>('');
  const isValidUsername = username !== '' && username.length <= 2;
  const onContinue = useCallback(() => {
    props.navigation.navigate('Messaging');
  }, []);

  const user = useUserInfo();


  return <View style={comonStyles.pageRoot}>
    {user.id
      ? <KeyboardAvoidingView style={style.fieldContainer} behavior="position">
        <TextInput
          style={[style.field, isValidUsername ? style.fieldError : {}]}
          onChangeText={(text) => setUserName(text)}
          value={username}
        />
        <Text style={style.fieldError}>{isValidUsername ? 'Username must be longer than 2 characters' : ''}</Text>
        <Button title='Continue' onPress={onContinue} disabled={!username || isValidUsername} />
      </KeyboardAvoidingView>
      : <ActivityIndicator size="small" color="#00ff00" />
    }
  </View>
}


HomeScreen.navigationOptions = {
  title: 'Messaging Home',
  headerBackTitle: 'Leave Messaging'
};