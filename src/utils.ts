import { Task } from './types';

// Play sound using the Web Audio API
export function playAppSound(type: 'complete' | 'click' | 'alarm' | 'delete') {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    switch (type) {
      case 'complete': {
        // Soft bubble-pop upward synth
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
        break;
      }
      case 'click': {
        // High-frequency subtle transient tick
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
        break;
      }
      case 'alarm': {
        // Gentle dual-tone warning ring (bell sound)
        const playTone = (freq: number, delay: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
          gain.gain.setValueAtTime(0.1, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
          
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + duration);
        };
        
        // Ring twice
        playTone(523.25, 0, 0.4); // C5
        playTone(659.25, 0.1, 0.4); // E5
        playTone(523.25, 0.4, 0.4);
        playTone(659.25, 0.5, 0.4);
        break;
      }
      case 'delete': {
        // Soft swoosh down frequency
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
        break;
      }
    }
  } catch (e) {
    console.warn("Audio Context playback failed", e);
  }
}

// Request and fire browser notifications
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function triggerBrowserNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'kundalik-reminder',
        silent: true, // We play our custom synthesized sound instead
        ...options
      });
    } catch (err) {
      // Swallowing failures since some container constraints block Notification constructors
      console.warn("Failed to instantiate standard Notification constructor", err);
    }
  }
}

// Build standard ICS file format to sync/import tasks directly to Google Calendar, Apple Calendar, Mac/iOS systems
export function exportToICS(tasks: Task[]) {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kundalik//Vazifalar Planner//UZ',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  tasks.forEach(task => {
    // Generate clean safe dates
    // Task date is in format YYYY-MM-DD
    const rawDate = task.date.replace(/-/g, '');
    let dtStart = rawDate + 'T090000Z'; // default task start 9:00 AM UTC
    let dtEnd = rawDate + 'T100000Z';

    if (task.reminderTime) {
      // If task has a reminder timestamp (e.g. 2026-06-20T14:30)
      const parts = task.reminderTime.split('T');
      if (parts.length === 2) {
        const dStr = parts[0].replace(/-/g, '');
        const tStr = parts[1].replace(/:/g, '') + '00';
        dtStart = dStr + 'T' + tStr + 'Z';
        // end time + 30 mins
        dtEnd = dStr + 'T' + String(Number(tStr) + 3000).padStart(6, '0') + 'Z';
      }
    }

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:task-${task.id}@kundalik.app`);
    icsContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, '').split('T')[0]}T000000Z`);
    icsContent.push(`DTSTART:${dtStart}`);
    icsContent.push(`DTEND:${dtEnd}`);
    icsContent.push(`SUMMARY:${task.title.replace(/[,;]/g, '\\$&')}`);
    icsContent.push(`DESCRIPTION:${task.description ? task.description.replace(/[,;]/g, '\\$&') : 'Kundalik takvimi vazifasi'}`);
    icsContent.push(`STATUS:${task.completed ? 'COMPLETED' : 'CONFIRMED'}`);
    icsContent.push('CLASS:PRIVATE');
    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');

  const fileString = icsContent.join('\r\n');
  const blob = new Blob([fileString], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `kundalik_vazifalari_${new Date().toISOString().split('T')[0]}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Format localized dates
export function formatLocalizedDate(dateString: string, lang: 'uz' | 'en' | 'ru', translations: any): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = date.getDate();
  const monthIdx = date.getMonth();
  const year = date.getFullYear();

  const months = [
    translations[lang]['jan'],
    translations[lang]['feb'],
    translations[lang]['mar'],
    translations[lang]['apr'],
    translations[lang]['may'],
    translations[lang]['jun'],
    translations[lang]['jul'],
    translations[lang]['aug'],
    translations[lang]['sep'],
    translations[lang]['oct'],
    translations[lang]['nov'],
    translations[lang]['dec'],
  ];

  if (lang === 'uz') {
    return `${day}-${months[monthIdx]}, ${year}-yil`;
  } else if (lang === 'ru') {
    return `${day} ${months[monthIdx]} ${year} г.`;
  } else {
    return `${months[monthIdx]} ${day}, ${year}`;
  }
}
