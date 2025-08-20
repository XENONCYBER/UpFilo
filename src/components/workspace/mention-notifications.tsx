import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MentionNotification {
  id: string;
  userName: string;
  channelName: string;
  workspaceName: string;
  message: string;
  timestamp: number;
}

interface MentionNotificationProps {
  notification: MentionNotification;
  onDismiss: (id: string) => void;
  onClick?: () => void;
}

export const MentionNotificationCard: React.FC<MentionNotificationProps> = ({
  notification,
  onDismiss,
  onClick,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(notification.id), 300);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
      handleDismiss();
    }
  };

  return (
    <div
      className={cn(
        "transform transition-all duration-300 ease-in-out",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div
        className="bg-neomorphic-surface border border-neomorphic-border rounded-neomorphic shadow-neomorphic p-4 max-w-sm cursor-pointer hover:shadow-neomorphic-pressed transition-shadow"
        onClick={handleClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-electric-blue/20 text-electric-blue rounded-full flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-neomorphic-text">
                <span className="text-electric-blue">@{notification.userName}</span> mentioned you
              </div>
              <div className="text-xs text-neomorphic-text-secondary mt-1">
                in #{notification.channelName} • {notification.workspaceName}
              </div>
              <div className="text-sm text-neomorphic-text mt-2 line-clamp-2">
                {notification.message}
              </div>
              <div className="text-xs text-neomorphic-text-secondary mt-2">
                {new Date(notification.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="flex-shrink-0 p-1 hover:bg-neomorphic-border/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-neomorphic-text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for managing mention notifications
export const useMentionNotifications = () => {
  const [notifications, setNotifications] = useState<MentionNotification[]>([]);

  const addNotification = (notification: Omit<MentionNotification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep max 5 notifications
    
    // Show toast notification
    toast.custom((t) => (
      <MentionNotificationCard
        notification={newNotification}
        onDismiss={() => toast.dismiss(t)}
        onClick={() => {
          // Handle navigation to the channel/message
          console.log('Navigate to mention:', newNotification);
          toast.dismiss(t);
        }}
      />
    ), {
      duration: 8000,
      position: 'top-right',
    });

    // Auto-remove after 30 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 30000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };
};

// Notification Bell Icon with Badge
interface MentionBellProps {
  notificationCount: number;
  onClick: () => void;
  className?: string;
}

export const MentionBell: React.FC<MentionBellProps> = ({
  notificationCount,
  onClick,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-2 btn-neomorphic hover:bg-neomorphic-border/20 transition-colors",
        className
      )}
    >
      <Bell className="w-4 h-4" />
      {notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral-red text-white text-xs rounded-full flex items-center justify-center font-medium">
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
    </button>
  );
};
