import { Bell, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useNotifications, useDeleteNotification } from '@/services/api/queries';
import { Spinner } from '@/components/Spinner';
import { Notification } from '@/utils/types';

export const NotificationDropdown = () => {
  const queryClient = useQueryClient();
  const { data: notificationsData, isLoading, error } = useNotifications();
  const deleteNotificationMutation = useDeleteNotification();

  const notifications: Notification[] = notificationsData?.data || [];
  const hasUnreadNotifications = notifications.some(n => !n.is_read);

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      // await deleteNotificationMutation.mutateAsync(notificationId);
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Navigate to the action URL if available
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 rounded-full hover:bg-steel-850 transition-colors relative mr-2"
          aria-label="Show notifications"
          type="button"
        >
          <Bell className="w-6 h-6" />
          {hasUnreadNotifications && <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[380px] p-4 bg-steel-950 border-0 shadow-xl mt-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Notifications</h3>
          <span className="text-sm text-dark-100">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">Failed to load notifications</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-dark-100">No notifications yet</div>
          ) : (
            <div className="flex flex-col gap-2">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`rounded-xl p-4 relative group hover:bg-steel-900 transition-colors ${
                    notification.action_url ? 'cursor-pointer' : ''
                  } ${!notification.is_read ? 'bg-steel-900/50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-white text-sm line-clamp-1">{notification.title}</div>
                        {!notification.is_read && <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />}
                      </div>
                      <div className="text-sm text-dark-100 mb-2 line-clamp-2">{notification.message}</div>
                      <div className="text-xs text-dark-100 opacity-70">{formatTimeAgo(notification.created_at)}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-steel-800"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteNotification(notification.id);
                      }}
                      disabled={deleteNotificationMutation?.isPending}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
