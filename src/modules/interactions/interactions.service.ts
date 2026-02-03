import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { and, eq, gte, or, sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.module';
import { interactions, profiles } from '../../database/schema';
import { CreateInteractionInput } from './dto/create-interaction.input';
import { InteractionType } from './models/interaction.model';
import { Gender, LookingFor } from '../profiles/models/profile.model';

@Injectable()
export class InteractionsService {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async create(input: CreateInteractionInput) {
    const { fromUserId, toUserId, type, message } = input;

    // Map enum to database value
    const typeStr = String(type).toUpperCase();

    // Validate super_like has message
    if (typeStr === 'SUPER_LIKE' && !message) {
      throw new BadRequestException('Super like requires a message');
    }

    // Check existing interaction
    const existing = await this.findInteraction(fromUserId, toUserId);
    const now = new Date();

    // Check cooldown (24 hours)
    if (existing && existing.expiresAt > now) {
      throw new BadRequestException(
        'Cannot interact yet. Please wait 24 hours.',
      );
    }

    // Calculate expiresAt (24 hours from now)
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dbType =
      typeStr === 'LIKE'
        ? 'like'
        : typeStr === 'SUPER_LIKE'
          ? 'super_like'
          : 'skip';

    // Calculate likeCount
    let likeCount = 1;
    if (existing && (typeStr === 'LIKE' || typeStr === 'SUPER_LIKE')) {
      likeCount = existing.likeCount + 1;
    }

    const id = createId();

    // Upsert interaction
    const result = await this.db
      .insert(interactions)
      .values({
        id,
        fromUserId,
        toUserId,
        type: dbType as 'like' | 'super_like' | 'skip',
        isRead: false,
        likeCount,
        expiresAt,
        ...(typeStr === 'SUPER_LIKE' && message ? { message } : {}),
      })
      .onConflictDoUpdate({
        target: [interactions.fromUserId, interactions.toUserId],
        set: {
          type: dbType as 'like' | 'super_like' | 'skip',
          isRead: false,
          likeCount,
          expiresAt,
          createdAt: now,
          ...(typeStr === 'SUPER_LIKE' && message ? { message } : {}),
        },
      })
      .returning();

    const interaction = result[0];

    // Convert to model type
    return {
      ...interaction,
      type: this.mapDbTypeToEnum(interaction.type),
      message: interaction.message ?? undefined,
      isRead: interaction.isRead ?? false,
    };
  }

  private mapDbTypeToEnum(
    dbType: 'like' | 'super_like' | 'skip',
  ): InteractionType {
    switch (dbType) {
      case 'like':
        return InteractionType.LIKE;
      case 'super_like':
        return InteractionType.SUPER_LIKE;
      case 'skip':
        return InteractionType.SKIP;
    }
  }

  async findInteraction(fromUserId: string, toUserId: string) {
    const result = await this.db
      .select()
      .from(interactions)
      .where(
        and(
          eq(interactions.fromUserId, fromUserId),
          eq(interactions.toUserId, toUserId),
        ),
      )
      .limit(1);
    return result[0] ?? null;
  }

  async checkMutualLike(user1Id: string, user2Id: string): Promise<boolean> {
    const interaction1 = await this.findInteraction(user1Id, user2Id);
    const interaction2 = await this.findInteraction(user2Id, user1Id);

    return (
      interaction1 !== null &&
      interaction2 !== null &&
      (interaction1.type === 'like' || interaction1.type === 'super_like') &&
      (interaction2.type === 'like' || interaction2.type === 'super_like')
    );
  }

  async resetLikeCount(fromUserId: string, toUserId: string) {
    await this.db
      .update(interactions)
      .set({ likeCount: 0 })
      .where(
        and(
          eq(interactions.fromUserId, fromUserId),
          eq(interactions.toUserId, toUserId),
        ),
      );
  }

  async getLikesReceived(userId: string) {
    // Get all likes and super_likes received by user
    const result = await this.db
      .select({
        interaction: interactions,
        profile: profiles,
      })
      .from(interactions)
      .innerJoin(profiles, eq(profiles.userId, interactions.fromUserId))
      .where(
        and(
          eq(interactions.toUserId, userId),
          or(
            eq(interactions.type, 'like'),
            eq(interactions.type, 'super_like'),
          ),
        ),
      )
      .orderBy(interactions.createdAt);

    return result.map((r) => ({
      id: r.interaction.id,
      fromUser: this.mapProfileToModel(r.profile),
      likeCount: r.interaction.likeCount,
      createdAt: r.interaction.createdAt,
    }));
  }

  async getSuperLikesReceived(userId: string) {
    // Get all super_likes with messages received by user
    const result = await this.db
      .select({
        interaction: interactions,
        profile: profiles,
      })
      .from(interactions)
      .innerJoin(profiles, eq(profiles.userId, interactions.fromUserId))
      .where(
        and(
          eq(interactions.toUserId, userId),
          eq(interactions.type, 'super_like'),
        ),
      )
      .orderBy(interactions.createdAt);

    return result.map((r) => ({
      id: r.interaction.id,
      fromUser: this.mapProfileToModel(r.profile),
      message: r.interaction.message || '',
      isRead: r.interaction.isRead ?? false,
      createdAt: r.interaction.createdAt,
    }));
  }

  private mapProfileToModel(profile: typeof profiles.$inferSelect) {
    const mapGender = (g: string | null): Gender | undefined => {
      if (!g) return undefined;
      switch (g) {
        case 'male':
          return Gender.MALE;
        case 'female':
          return Gender.FEMALE;
        case 'other':
          return Gender.OTHER;
        default:
          return undefined;
      }
    };

    const mapLookingFor = (l: string | null): LookingFor | undefined => {
      if (!l) return undefined;
      switch (l) {
        case 'male':
          return LookingFor.MALE;
        case 'female':
          return LookingFor.FEMALE;
        case 'both':
          return LookingFor.BOTH;
        default:
          return undefined;
      }
    };

    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.name ?? undefined,
      bio: profile.bio ?? undefined,
      age: profile.age ?? undefined,
      birthDate: profile.birthDate ?? undefined,
      gender: mapGender(profile.gender),
      lookingFor: mapLookingFor(profile.lookingFor),
      city: profile.city ?? undefined,
      latitude: profile.latitude ?? undefined,
      longitude: profile.longitude ?? undefined,
      photos: (profile.photos as string[]) ?? [],
      interests: (profile.interests as string[]) ?? [],
      minAge: profile.minAge ?? 18,
      maxAge: profile.maxAge ?? 100,
      maxDistance: profile.maxDistance ?? 50,
      isVisible: profile.isVisible ?? true,
      onboardingCompleted: profile.onboardingCompleted ?? false,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async markAsRead(interactionId: string) {
    const result = await this.db
      .update(interactions)
      .set({ isRead: true })
      .where(eq(interactions.id, interactionId))
      .returning();
    return result[0] ?? null;
  }

  async getUnreadSuperLikesCount(userId: string): Promise<number> {
    const result = await this.db
      .select()
      .from(interactions)
      .where(
        and(
          eq(interactions.toUserId, userId),
          eq(interactions.type, 'super_like'),
          eq(interactions.isRead, false),
        ),
      );
    return result.length;
  }

  async getInteractionsByUser(userId: string) {
    return this.db
      .select()
      .from(interactions)
      .where(eq(interactions.fromUserId, userId));
  }

  async getActiveInteractionsForDiscovery(userId: string) {
    const now = new Date();
    return this.db
      .select({ toUserId: interactions.toUserId })
      .from(interactions)
      .where(
        and(
          eq(interactions.fromUserId, userId),
          gte(interactions.expiresAt, now),
        ),
      );
  }
}
