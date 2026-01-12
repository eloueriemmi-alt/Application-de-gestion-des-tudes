import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationsService, Notification } from './../../services/notifications.service';

@Component({
  selector: 'app-notification-bell',
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.css',
})
export class NotificationBellComponent implements OnInit {
  notifications: Notification[] = [];
  unreadCount = 0;
  showDropdown = false;

  constructor(
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.notificationsService.getNotifications().subscribe({
      next: (notifications: Notification[]) => {
        this.notifications = notifications.slice(0, 10);
      }
    });

    this.notificationsService.getUnreadCount().subscribe({
      next: (count: number) => {
        this.unreadCount = count;
      }
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  markAsRead(notification: Notification) {
    this.notificationsService.markAsRead(notification.id);
    
    if (notification.link) {
      this.router.navigate([notification.link]);
      this.showDropdown = false;
    }
  }

  markAllAsRead() {
    this.notificationsService.markAllAsRead();
  }

  deleteNotification(event: Event, id: string) {
    event.stopPropagation();
    this.notificationsService.deleteNotification(id);
  }

  clearAll() {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      this.notificationsService.clearAll();
      this.showDropdown = false;
    }
  }

  getIcon(type: string): string {
    switch(type) {
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  }

  getTypeClass(type: string): string {
    return `notification-${type}`;
  }
}