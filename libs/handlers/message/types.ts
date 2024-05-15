import { WASocket, WAMessage, MessageUpsertType } from "@adiwajshing/baileys";
import { AwaitableMediaMessage } from "@libs/builders/command";

type MessageData = {
  messages: WAMessage[];
  type: MessageUpsertType;
};

interface Client extends WASocket {}

export type MessageHandler = (
  client: Client,
  { messages, type }: MessageData
) => Promise<AwaitableMediaMessage>;
