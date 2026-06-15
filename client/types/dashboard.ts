type DashboardData = {
  emailCount: number;
  meetingCount: number;
  integrationCount: number;

  aiSummary: string;

  recentEmails: {
    id: string;
    subject: string;
  }[];

  upcomingEvents: {
    id: string;
    title: string;
  }[];
};