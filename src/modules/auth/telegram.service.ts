import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramInitData {
  user: TelegramUser;
  auth_date: number;
  hash: string;
  query_id?: string;
  chat_instance?: string;
}

@Injectable()
export class TelegramService {
  private readonly botToken: string;

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
  }

  validateInitData(initData: string): TelegramInitData {
    if (!this.botToken) {
      throw new UnauthorizedException('Bot token not configured');
    }

    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      throw new UnauthorizedException('Hash not found in initData');
    }

    // Remove hash from params for validation
    params.delete('hash');

    // Sort params alphabetically and create data check string
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key: HMAC-SHA256(bot_token, "WebAppData")
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(this.botToken)
      .digest();

    // Calculate hash: HMAC-SHA256(data_check_string, secret_key)
    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      throw new UnauthorizedException('Invalid initData hash');
    }

    // Check auth_date (data should not be older than 24 hours)
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 86400; // 24 hours

    if (now - authDate > maxAge) {
      throw new UnauthorizedException('InitData expired');
    }

    // Parse user data
    const userString = params.get('user');
    if (!userString) {
      throw new UnauthorizedException('User data not found');
    }

    const user: TelegramUser = JSON.parse(userString);

    return {
      user,
      auth_date: authDate,
      hash,
      query_id: params.get('query_id') || undefined,
      chat_instance: params.get('chat_instance') || undefined,
    };
  }

  parseInitDataUnsafe(initData: string): TelegramInitData | null {
    try {
      const params = new URLSearchParams(initData);
      const userString = params.get('user');

      if (!userString) return null;

      const user: TelegramUser = JSON.parse(userString);

      return {
        user,
        auth_date: parseInt(params.get('auth_date') || '0', 10),
        hash: params.get('hash') || '',
        query_id: params.get('query_id') || undefined,
        chat_instance: params.get('chat_instance') || undefined,
      };
    } catch {
      return null;
    }
  }
}
