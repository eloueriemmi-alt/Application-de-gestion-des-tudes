import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


export interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    // Charger les notifications depuis localStorage
    this.loadNotifications();
  }

  private loadNotifications() {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      const notifications = JSON.parse(stored);
      this.notificationsSubject.next(notifications);
      this.updateUnreadCount();
    }
  }

  private saveNotifications() {
    const notifications = this.notificationsSubject.value;
    localStorage.setItem('notifications', JSON.stringify(notifications));
    this.updateUnreadCount();
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    const notifications = [newNotification, ...this.notificationsSubject.value];
    
    // Garder seulement les 50 dernières notifications
    if (notifications.length > 50) {
      notifications.pop();
    }

    this.notificationsSubject.next(notifications);
    this.saveNotifications();
  }

  markAsRead(id: string) {
    const notifications = this.notificationsSubject.value.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(notifications);
    this.saveNotifications();
  }

  markAllAsRead() {
    const notifications = this.notificationsSubject.value.map(n => 
      ({ ...n, read: true })
    );
    this.notificationsSubject.next(notifications);
    this.saveNotifications();
  }

  deleteNotification(id: string) {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(notifications);
    this.saveNotifications();
  }

  clearAll() {
    this.notificationsSubject.next([]);
    localStorage.removeItem('notifications');
    this.updateUnreadCount();
  }

  private updateUnreadCount() {
    const unread = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(unread);
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }
}