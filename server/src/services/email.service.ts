export class EmailService {
  async getEmails() {
    return [
      {
        id: "1",
        from: "john@example.com",
        subject: "Meeting Tomorrow",
        snippet: "Let's discuss the project tomorrow.",
        receivedAt: new Date(),
      },
      {
        id: "2",
        from: "team@company.com",
        subject: "Weekly Update",
        snippet: "Here is the latest update...",
        receivedAt: new Date(),
      },
    ];
  }

  async getEmailById(id: string) {
    return {
      id,
      from: "john@example.com",
      subject: "Meeting Tomorrow",
      body: "Full email content here...",
    };
  }

  async sendEmail(data: {
    to: string;
    subject: string;
    body: string;
  }) {
    return {
      success: true,
      message: "Email sent successfully",
    };
  }
}