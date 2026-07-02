export type NotificationType =
  | "loan"
  | "contribution"
  | "dividend"
  | "security"
  | "meeting";

// ── Wire shapes (snake_case, ISO dates) ────────────────────────────────────

export interface ApiNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  action: { label: string; url: string } | null;
}

export interface ApiNotificationListResponse {
  notifications: ApiNotification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    unread_count: number;
  };
}

export interface ApiNotificationPreferences {
  push_enabled: boolean;
  categories: Record<NotificationType, boolean>;
}

// ── UI shapes ───────────────────────────────────────────────────────────────

export interface NotificationAction {
  label: string;
  route: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO-8601
  isRead: boolean;
  action?: NotificationAction;
}

export interface NotificationListPage {
  notifications: Notification[];
  page: number;
  totalPages: number;
  total: number;
  unreadCount: number;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  categories: Record<NotificationType, boolean>;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  categories: {
    loan: true,
    contribution: true,
    dividend: true,
    security: true,
    meeting: true,
  },
};

// ── Transforms ──────────────────────────────────────────────────────────────

export function transformNotification(api: ApiNotification): Notification {
  return {
    id: api.id,
    type: api.type,
    title: api.title,
    message: api.body,
    timestamp: api.created_at,
    isRead: api.read,
    action: api.action
      ? { label: api.action.label, route: api.action.url }
      : undefined,
  };
}

export function transformListResponse(
  api: ApiNotificationListResponse,
): NotificationListPage {
  return {
    notifications: (api.notifications || []).map(transformNotification),
    page: api.meta.page,
    totalPages: api.meta.total_pages,
    total: api.meta.total,
    unreadCount: api.meta.unread_count,
  };
}

export function transformPreferences(
  api: ApiNotificationPreferences,
): NotificationPreferences {
  return {
    pushEnabled: api.push_enabled,
    categories: { ...DEFAULT_PREFERENCES.categories, ...api.categories },
  };
}

export function serializePreferencesPatch(
  patch: Partial<NotificationPreferences>,
): Partial<ApiNotificationPreferences> {
  const out: Partial<ApiNotificationPreferences> = {};
  if (patch.pushEnabled !== undefined) out.push_enabled = patch.pushEnabled;
  if (patch.categories !== undefined) out.categories = patch.categories;
  return out;
}

// ── Display helpers ─────────────────────────────────────────────────────────

export function getRelativeTime(isoTimestamp: string): string {
  const then = new Date(isoTimestamp).getTime();
  if (Number.isNaN(then)) return "";

  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(isoTimestamp).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}
