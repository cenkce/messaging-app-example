import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Image, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, SectionList, SectionListRenderItem, StyleSheet, Text, TextInput, View } from "react-native";
import { MessageResponseType, ScreenComponent } from "..";
import { useGetMessages, useMessagingState, useSendMMessages, useUserInfo } from "./MessagingContext";

const borderRadius = 15;

const style = StyleSheet.create({
  sectionList: {
    paddingLeft: 10,
    paddingRight: 10
  },
  sectionBubble: {
    padding: 5,
    backgroundColor: "#CCCCCC",
    width: "auto",
    maxWidth: "70%",
    height: "auto",
    alignSelf: "flex-start",
    marginBottom: 5,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: borderRadius,
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
  },
  sectionBubbleBody: {
    flexDirection: "row",
  },
  sectionBubbleText: {
    marginLeft: 5,
    color: '#666666',
    flexShrink: 1
  },
  sectionBubbleOwner: {
    direction: 'rtl',
    alignSelf: 'flex-end',
    backgroundColor: "#5195CE",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: borderRadius,
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius
  },
  sectionBubbleBodyOwner: {
    flexDirection: 'row'
  },
  sectionBubbleTextOwner: {
    marginLeft: 5,
    color: '#ffffff',
    flexShrink: 1
  },
  sectionBubbleDate: {
    alignSelf: "flex-end",
    color: '#ffffff',
    flexShrink: 1,
    fontSize: 10
  },
  sectionHeader: {
    height: 30,
    alignSelf: "center",
    fontWeight: 'bold'
  },
  input: {
    alignSelf: "stretch",
    height: 30,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: 'white',
    flexGrow: 1
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  inputContainer: {
    alignSelf: "stretch",
    height: "auto",
    flexDirection: "row",
    padding: 5,
    paddingBottom: 0,
    backgroundColor: "#e3e3e3",
    borderColor: "#f4f4f4",
  }
})


const MessagingSection = (props: { item: MessageResponseType, index: number }) => {
  // const dateString = useMemo(() => )
  const user = useUserInfo();
  const isOwner = props.item.user.id === user.id;
  return <View style={[style.sectionBubble, isOwner ? style.sectionBubbleOwner : {}]}>
    <View style={[style.sectionBubbleBody, isOwner ? style.sectionBubbleBodyOwner : {}]}>
      <Image
        source={{ uri: props.item.user.avatarUrl }}
        style={style.avatar}
      />
      <Text
        style={[style.sectionBubbleText, isOwner ? style.sectionBubbleTextOwner : {}]}
      >{props.item.text}
      </Text>
    </View>
    <Text style={style.sectionBubbleDate}>{moment(props.item.date).calendar()}
    </Text>
  </View>
}

export const MessagingScreen: ScreenComponent = (props) => {
  const renderItem = useCallback<SectionListRenderItem<MessageResponseType>>((props) => {
    console.log("index : ", props.index);
    return <MessagingSection item={props.item} index={props.index} />
  }, []);

  const listRef = useRef<any>(null);
  const state = useMessagingState();
  const [message, setMessage] = useState();

  const loaded = useGetMessages();
  useEffect(() => {
    const handler = () => {
      scrollToEndWithTimer();
    }
    const listener = Keyboard.addListener('keyboardDidShow', handler)
    return () => listener.remove();
  }, [listRef.current, state.grouppedMessages]);

  const [firstLoad, setFirstLoad] = useState(false);
  const [attheEnd, setAttheEnd] = useState(false);

  function scrollToEnd() {
    listRef.current
      && state.grouppedMessages
      && state.grouppedMessages.length > 4
      && listRef.current.scrollToLocation({
        itemIndex: state.grouppedMessages[state.grouppedMessages.length - 1].data.length - 1 || 0,
        sectionIndex: state.grouppedMessages.length - 1
      })
  }

  function scrollToEndWithTimer() {
    setTimeout(() => {
      try {
        scrollToEnd();
        loaded
          && setFirstLoad(true);
      } catch {
        scrollToEndWithTimer();
      }
    }, 500);
  }

  useEffect(() => {
    !firstLoad && scrollToEndWithTimer();
  }, [listRef.current, state.grouppedMessages, loaded])

  const renderHeader = useCallback<any>((params: any) => (
    <Text style={style.sectionHeader}>{params.section.title}</Text>
  ), []);
  const keyExtractor = useCallback((item: any, index: number) => item + index, []);
  const List: SectionList<MessageResponseType> = SectionList;
  const sendMessage = useSendMMessages();

  return <SafeAreaView style={{ flexGrow: 1 }}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={(Platform.OS === 'ios') ? "padding" : undefined}
      enabled
      keyboardVerticalOffset={Platform.select({ ios: 90, android: 500 })}
    >
      <List
        onViewableItemsChanged={(info) => {
          console.log(info);
        }}
        initialNumToRender={10}
        style={style.sectionList}
        ref={listRef}
        renderItem={renderItem}
        renderSectionHeader={renderHeader}
        sections={state.grouppedMessages}
        keyExtractor={keyExtractor}
        onEndReached={() => setAttheEnd(true)}
        onEndReachedThreshold={0.5}

      />
      <View style={style.inputContainer}>
        <TextInput
          value={message}
          keyboardAppearance="default"
          keyboardType="default"
          multiline={true}
          style={style.input}
          placeholder="Type a message"
          returnKeyType="send"
          onChangeText={(text) => setMessage(text)}
        />
        <Button
          title="Send"
          disabled={!message}
          onPress={() => { message && sendMessage(message); setMessage(undefined) }}
        />
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
}