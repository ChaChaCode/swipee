import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface MatchNotificationData {
  recipientTelegramId: number;
  matchedUserName: string;
  matchedUserUsername?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly botToken: string;
  private readonly telegramApiUrl: string;

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.telegramApiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  async sendMatchNotification(data: MatchNotificationData): Promise<boolean> {
    if (!this.botToken) {
      this.logger.warn('Bot token not configured, skipping notification');
      return false;
    }

    const { recipientTelegramId, matchedUserName, matchedUserUsername } = data;

    let message = `You have a new match with ${matchedUserName}!`;

    if (matchedUserUsername) {
      message += `\n\nYou can now chat: @${matchedUserUsername}`;
    }

    message += '\n\nOpen the app to see their profile.';

    try {
      await this.sendTelegramMessage(recipientTelegramId, message);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send match notification to ${recipientTelegramId}`,
        error,
      );
      return false;
    }
  }

  private async sendTelegramMessage(
    chatId: number,
    text: string,
  ): Promise<void> {
    const url = `${this.telegramApiUrl}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Telegram API error: ${error}`);
    }
  }
}
