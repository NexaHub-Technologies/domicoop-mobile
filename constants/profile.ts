// Profile settings menu structure (extracted from the retired data/mockData.ts).

export interface SettingsItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  route: string;
  destructive?: boolean;
}

export interface SettingsSection {
  id: string;
  title: string;
  items: SettingsItem[];
}


export const profileSettings: SettingsSection[] = [
  {
    id: "account-settings",
    title: "Account Settings",
    items: [
      {
        id: "edit-details",
        icon: "person",
        title: "Edit Account Details",
        subtitle: "Update name, email, and phone",
        route: "/settings/edit-profile",
      },
      {
        id: "security",
        icon: "security",
        title: "Security Settings",
        subtitle: "Passwords and 2FA",
        route: "/settings/security",
      },
      {
        id: "notifications",
        icon: "notifications",
        title: "Notification Preferences",
        subtitle: "Email and push alerts",
        route: "/settings/notification-preferences",
      },
      {
        id: "theme",
        icon: "palette",
        title: "Theme Preference",
        subtitle: "Light, dark or system default",
        route: "/settings/theme-preference",
      },
    ],
  },
  {
    id: "more-options",
    title: "More Options",
    items: [
      {
        id: "support",
        icon: "help",
        title: "Support & FAQ",
        route: "/support",
      },
      {
        id: "guidelines",
        icon: "rule",
        title: "Cooperative Guidelines",
        subtitle: "Rules and regulations",
        route: "/settings/guidelines",
      },
      {
        id: "privacy",
        icon: "description",
        title: "Privacy Policy",
        route: "/privacy",
      },
      {
        id: "logout",
        icon: "logout",
        title: "Log Out",
        route: "/logout",
        destructive: true,
      },
      {
        id: "delete-account",
        icon: "delete-forever",
        title: "Delete Account",
        route: "/delete-account",
        destructive: true,
      },
    ],
  },
];

