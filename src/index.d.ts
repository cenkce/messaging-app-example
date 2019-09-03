import { NavigationScreenComponent, NavigationScreenOptions } from "react-navigation";

export type ScreenComponent<T = null> = NavigationScreenComponent<{ title: string }, NavigationScreenOptions, T>;
export type MessageResponseType = {
  id: string,
  user: {
    id: string,
    name: string,
    avatarUrl: string
  },
  text: string,
  date: number
}

export type User = {
  id: string,
  name: string,
  avatarUrl: string,
  nickName: string
}

export type MessagingService = {
  readonly loaded: boolean;
  setLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  readonly user: User;
}

export type MessagingState = {
  messages: MessageResponseType[],
  messagesById: { [key: string]: number },
  grouppedMessages: MessageSection[]
}

export type MessageSection = { title: string, data: MessageResponseType[] };