import { corsair } from "../corsair.js";

function getHeader(
  headers: any[],
  name: string
) {
  return headers.find(
    (h) => h.name === name
  )?.value;
}

export class EmailService {
  async getEmails() {
    const response =
      await corsair.gmail.api.messages.list(
        {}
      );

    const emails = await Promise.all(
      response.messages
        .slice(0, 20)
        .map(async (message: any) => {
          const email =
            await corsair.gmail.api.messages.get({
              id: message.id,
            });

          return {
            id: email.id,

            from: getHeader(
              email.payload.headers,
              "From"
            ),

            subject: getHeader(
              email.payload.headers,
              "Subject"
            ),

            snippet: email.snippet,

            receivedAt: new Date(
              Number(email.internalDate)
            ),
          };
        })
    );

    return emails;
  }
}