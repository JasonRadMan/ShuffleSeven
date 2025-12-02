import { sendDailyCardReminder } from './pushNotifications';

let schedulerInterval: NodeJS.Timeout | null = null;
let lastReminderDate: string | null = null;

const REMINDER_HOUR = 8;
const CHECK_INTERVAL_MS = 60 * 1000;

function getCurrentDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function shouldSendReminder(): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDate = getCurrentDateString();
  
  if (lastReminderDate === currentDate) {
    return false;
  }
  
  return currentHour >= REMINDER_HOUR;
}

async function checkAndSendReminders(): Promise<void> {
  try {
    if (shouldSendReminder()) {
      console.log('Sending daily card reminders...');
      const result = await sendDailyCardReminder();
      
      lastReminderDate = getCurrentDateString();
      
      console.log(`Daily reminders complete: ${result.sent} sent, ${result.failed} failed`);
    }
  } catch (error) {
    console.error('Error in reminder scheduler:', error);
  }
}

export function startScheduler(): void {
  if (schedulerInterval) {
    console.log('Scheduler already running');
    return;
  }

  console.log(`Starting daily reminder scheduler (checks every ${CHECK_INTERVAL_MS / 1000}s, sends at ${REMINDER_HOUR}:00)`);
  
  checkAndSendReminders();
  
  schedulerInterval = setInterval(checkAndSendReminders, CHECK_INTERVAL_MS);
}

export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('Scheduler stopped');
  }
}

export async function triggerManualReminder(): Promise<{ sent: number; failed: number }> {
  console.log('Manual reminder triggered');
  return await sendDailyCardReminder();
}
