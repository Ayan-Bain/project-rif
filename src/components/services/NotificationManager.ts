import * as Notifications from 'expo-notifications';
import { NotificationRegistry } from './NotificationRegistry';
import Subscription from '../../subscriptions/subsciption';
import renewalDate from './RenewalDate';

Notifications.setNotificationHandler({
handleNotification: async () => ({
shouldShowBanner: true,
shouldShowList: true,
shouldPlaySound: false,
shouldSetBadge: false,
}),
});

export const syncNotificationBatch = async (sub: Subscription, daysBefore: number) => {
  const oldIds = await NotificationRegistry.getNotifIds(sub.id);
  if (oldIds && Array.isArray(oldIds)) {
    for (const id of oldIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  }
  const newIds: string[] = [];
  const [y, m, d] = renewalDate(sub.date, sub.cycle).split('-').map(Number);
  const dueDate = new Date(y, m-1 , d, 19, 0, 0);
  for (let i = daysBefore; i >= 0; i--) {
    const triggerDate = new Date(dueDate);
    triggerDate.setDate(dueDate.getDate() - i);
    if (triggerDate.getTime() > Date.now()) {
      const body = i === 0 
        ?(sub.isAutoPayOn?`Money will be DEDUCTED today for${sub.name}`:`${sub.name} is due TODAY!`) 
        : `${sub.name} is due in ${i} days.`;
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Subscription Reminder 💳",
          body: body,
          data: { subId: sub.id },
        },
        trigger: { 
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate },
      });
      newIds.push(id);
    }
  }

  await NotificationRegistry.saveNotifIds(sub.id, newIds);
};