import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { fetchChatUnreadCount } from '../services/chatService';
import {
  connectChatSocket,
  subscribeToChatMessages,
} from '../services/chatSocketService';

export function useChatUnreadBadge(): number {
  const profileData = useSelector((state: RootState) => state.profile.profileData);
  const currentUserId =
    (profileData as any)?._id?.toString?.() ||
    (profileData as any)?.id?.toString?.() ||
    '';

  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const refresh = useCallback(async () => {
    const count = await fetchChatUnreadCount();
    setUnreadChatCount(count);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
      connectChatSocket();
      const unsubscribe = subscribeToChatMessages(message => {
        if (message.senderId !== currentUserId) {
          refresh();
        }
      });
      return () => {
        unsubscribe();
      };
    }, [refresh, currentUserId]),
  );

  return unreadChatCount;
}
