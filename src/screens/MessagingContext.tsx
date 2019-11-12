import produce from "immer";
import React, { Dispatch, PropsWithChildren, Reducer, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { MessageResponseType, MessageSection, MessagingService, MessagingState, User } from "..";

const MessagingDispatcherContext = React.createContext<Dispatch<actions>>(() => { });

export function useMessagingDispatcher() {
  const dispatch = useContext(MessagingDispatcherContext);
  return dispatch;
}

const initialMessagingState: MessagingState = {
  messages: [],
  messagesById: {},
  grouppedMessages: []
}
const MessagingContext = React.createContext<MessagingState>(initialMessagingState);
const EmptyUser: User = {
  id: '',
  avatarUrl: '',
  name: ''
}
const MessagingServiceContext = React.createContext<MessagingService>({
  loaded: false,
  setLoaded: () => { },
  setUser: () => { },
  user: EmptyUser
});

export function useUserLogin() {
  const service = useMessagingService();
  const login = useCallback((name: string) =>
    fetch(getUrl('user/login'), {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((resp) => {
        return resp.json()
      })
      .then((user) => {
        service.setUser(user);
      }),
    [service])
  return login;
}

export function MessagingServiceProvider(props: PropsWithChildren<{}>) {
  const [loaded, setLoaded] = useState(false);

  const [user, setUser] = useState<User>(EmptyUser);
  const services = useMemo(() => ({
    get loaded() {
      return loaded
    },
    setLoaded,
    setUser,
    get user() {
      return user
    }
  }), [user, loaded])

  return <MessagingServiceContext.Provider value={services}>
    {props.children}
  </MessagingServiceContext.Provider>;
}

const localhostConfig = { host: 'localhost', port: 3000 }

const getUrl = ((config) => (endpoint: string) => {
  return `http://${config.host}:${config.port}/${endpoint}`;
})(localhostConfig)

export function useMessagingService(name?: string) {
  const services = useContext(MessagingServiceContext);

  return services;
}

export function useGetMessages() {
  const dispatch = useMessagingDispatcher();
  const services = useContext(MessagingServiceContext);
  function startMessagesPoll() {
    return setInterval(() => {
      let response: Response;
      fetch(getUrl('messages/latest'), { method: 'GET' })
        .then<MessageResponseType[]>(resp => {
          response = resp;
          return resp.json()
        })
        .then((data) => {
          if (response.status === 200 && data && data.length) {
            dispatch({
              type: "add-message",
              payload: data
            })
          }
        })
    }, 500);
  }
  useEffect(() => {
    let interval: number = 0;
    !services.loaded && fetch(getUrl('messages'), { method: 'GET' })
      .then<MessageResponseType[]>(resp => resp.json())
      .then((data) => {
        dispatch({
          type: "init-messages",
          payload: data
        })
        interval = startMessagesPoll();
        services.setLoaded(true);
      })
    return () => {
      clearInterval(interval);
    }
  }, [])

  return services.loaded;
}

export function useSendMessages() {
  const dispatch = useMessagingDispatcher();
  const { user } = useMessagingService();
  const sendMessage = useCallback((text: string) => {
    fetch(
      getUrl('messages'),
      {
        method: 'POST',
        body: JSON.stringify({ text, user }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then<MessageResponseType>(resp => resp.json())
      .then((data) => {
        dispatch({
          type: "add-message",
          payload: data
        })
      })
  }, [])

  return sendMessage;
}

// No need to create actionCreator factories beacuse of using Typescript
// So that we don't need to import implentation of actionFactories anywhere
type actions =
  | { type: "add-message", payload: MessageResponseType | MessageResponseType[] }
  | { type: "init-messages", payload: MessageResponseType[] }

// Groups messages by user, if the messages' user is same respectively
function groupMessages(list: MessageResponseType[]) {
  return list.reduce<MessageSection[]>((acc, item) => {
    const prevMessages = acc.length ? acc[acc.length - 1] : { title: '', data: [] };
    const prevMessage = prevMessages ? prevMessages.data[prevMessages.data.length - 1] : null;
    prevMessage && prevMessage.user.id === item.user.id
      ? prevMessages.data.push(item)
      : acc.push({ title: '', data: [item] });
    return acc;
  }, [])
}

const MessagingReducer: Reducer<MessagingState, actions> = (state, action) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'add-message':
        (Array.isArray(action.payload) ? action.payload : [action.payload])
          .forEach(item => {
            draft.messagesById[item.id] = draft.messages.length;
            draft.messages.push(item);
          });
        draft.grouppedMessages = groupMessages(draft.messages);
        break;
      case 'init-messages':
        draft.messages = action.payload;
        draft.messagesById = draft.messages
          .reduce<{ [id: string]: number }>((acc, item, index) => {
            acc[item.id] = index;
            return acc;
          }, {});
        draft.grouppedMessages = groupMessages(draft.messages);
        break;
    }
  })
}

export function useMessagingState() {
  const state = useContext(MessagingContext);
  return state;
}

export function MessagingProvider(props: PropsWithChildren<{ nitialState?: [] }>) {
  const [state, dispatch] = useReducer(MessagingReducer, initialMessagingState);
  return <MessagingContext.Provider value={state}>
    <MessagingDispatcherContext.Provider value={dispatch}>
      <MessagingServiceProvider>
        {props.children}
      </MessagingServiceProvider>
    </MessagingDispatcherContext.Provider>
  </MessagingContext.Provider>
}
