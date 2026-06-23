import notifee, {
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';
import { Platform } from 'react-native';

interface ChannelConfig {
  id: string;
  name: string;
  description?: string;
  importance: AndroidImportance;
  visibility?: AndroidVisibility;
  sound?: string;
  vibration?: boolean;
  lights?: boolean;
}

const CHANNELS: ChannelConfig[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Default notifications',
    importance: AndroidImportance.HIGH,
  },
];

export async function createNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  for (const channel of CHANNELS) {
    const channelConfig: any = {
      id: channel.id,
      name: channel.name,
      importance: channel.importance,
    };

    // Only add optional properties if they are defined
    if (channel.description) channelConfig.description = channel.description;
    if (channel.visibility !== undefined)
      channelConfig.visibility = channel.visibility;
    if (channel.sound) channelConfig.sound = channel.sound;
    if (channel.vibration !== undefined)
      channelConfig.vibration = channel.vibration;
    if (channel.lights !== undefined) channelConfig.lights = channel.lights;

    await notifee.createChannel(channelConfig);
  }

  console.log('Notification channels created');
}

export async function deleteNotificationChannel(
  channelId: string,
): Promise<void> {
  if (Platform.OS !== 'android') return;

  await notifee.deleteChannel(channelId);
}

export async function getNotificationChannels(): Promise<string[]> {
  if (Platform.OS !== 'android') return [];

  const channels = await notifee.getChannels();
  return channels.map(channel => channel.id);
}
