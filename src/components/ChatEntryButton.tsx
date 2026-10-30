import React, { useCallback, useState } from 'react';
import AppButton from './AppButton';
import { getChatAccess } from '../services/chatService';
import NavigationService from '../navigation/NavigationService';
import { SCREENS } from '../navigation/routes';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { STRING } from '../constant';

type Props = {
  serviceRequestId?: string | null;
  requestIdLabel?: string;
};

export const ChatEntryButton: React.FC<Props> = ({
  serviceRequestId,
  requestIdLabel,
}) => {
  const { t } = useTranslation();
  const [canChat, setCanChat] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const run = async () => {
        if (!serviceRequestId) {
          if (active) setCanChat(false);
          return;
        }
        setChecking(true);
        const access = await getChatAccess(serviceRequestId);
        if (active) {
          setCanChat(!!access?.canChat);
          setConversationId(access?.conversationId ?? null);
          setChecking(false);
        }
      };
      run();
      return () => {
        active = false;
      };
    }, [serviceRequestId]),
  );

  if (!serviceRequestId || !canChat || !conversationId) {
    return null;
  }

  return (
    <AppButton
      title={t(STRING.chatNow)}
      loading={checking}
      onPress={() =>
        NavigationService.navigate(SCREENS.CHAT, {
          conversationId,
        })
      }
    />
  );
};
