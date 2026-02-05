import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { and, eq, gte, or, sql, desc } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.module';
import { interactions, profiles, users } from '../../database/schema';
import { CreateInteractionInput } from './dto/create-interaction.input';
import { InteractionType } from './models/interaction.model';
import { Gender, LookingFor, Purpose } from '../profiles/models/profile.model';
import { calculateAge } from '../../common/utils/age.utils';

const UNDO_DAILY_LIMIT = 10;

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

    // Calculate expiresAt (1 minute from now - for testing)
    const expiresAt = new Date(now.getTime() + 1 * 60 * 1000);
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

    const mapPurpose = (p: string | null): Purpose | undefined => {
      if (!p) return undefined;
      switch (p) {
        case 'dating':
          return Purpose.DATING;
        case 'relationship':
          return Purpose.RELATIONSHIP;
        case 'friendship':
          return Purpose.FRIENDSHIP;
        case 'chatting':
          return Purpose.CHATTING;
        case 'adult':
          return Purpose.ADULT;
        default:
          return undefined;
      }
    };

    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.name ?? undefined,
      bio: profile.bio ?? undefined,
      age: calculateAge(profile.birthDate) ?? undefined,
      birthDate: profile.birthDate ?? undefined,
      gender: mapGender(profile.gender),
      lookingFor: mapLookingFor(profile.lookingFor),
      purpose: mapPurpose(profile.purpose),
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

  /**
   * Get the last interaction made by user
   */
  async getLastInteraction(userId: string) {
    const result = await this.db
      .select({
        interaction: interactions,
        profile: profiles,
      })
      .from(interactions)
      .innerJoin(profiles, eq(profiles.userId, interactions.toUserId))
      .where(eq(interactions.fromUserId, userId))
      .orderBy(desc(interactions.createdAt))
      .limit(1);

    if (!result[0]) return null;

    return {
      interaction: result[0].interaction,
      profile: this.mapProfileToModel(result[0].profile),
    };
  }

  /**
   * Delete an interaction (for undo)
   */
  async deleteInteraction(interactionId: string) {
    const result = await this.db
      .delete(interactions)
      .where(eq(interactions.id, interactionId))
      .returning();
    return result[0] ?? null;
  }

  /**
   * Check if user can use undo (10/day for free, unlimited for premium)
   */
  async canUseUndo(userId: string): Promise<{ canUndo: boolean; remaining: number; isPremium: boolean }> {
    // Get user to check premium status
    const userResult = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = userResult[0];
    if (!user) {
      return { canUndo: false, remaining: 0, isPremium: false };
    }

    const isPremium = user.isPremium ?? false;

    // Premium users have unlimited undo
    if (isPremium) {
      return { canUndo: true, remaining: -1, isPremium: true };
    }

    // Get profile to check undo count
    const profileResult = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    const profile = profileResult[0];
    if (!profile) {
      return { canUndo: false, remaining: 0, isPremium: false };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if last undo was today
    const lastUndoDate = profile.lastUndoDate;
    const isToday = lastUndoDate && new Date(lastUndoDate).setHours(0, 0, 0, 0) === today.getTime();

    const undoCountToday = isToday ? (profile.undoCountToday ?? 0) : 0;
    const remaining = UNDO_DAILY_LIMIT - undoCountToday;

    return {
      canUndo: remaining > 0,
      remaining,
      isPremium: false,
    };
  }

  /**
   * Increment undo count for user
   */
  async incrementUndoCount(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get current profile
    const profileResult = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    const profile = profileResult[0];
    if (!profile) return;

    // Check if last undo was today
    const lastUndoDate = profile.lastUndoDate;
    const isToday = lastUndoDate && new Date(lastUndoDate).setHours(0, 0, 0, 0) === today.getTime();

    const newCount = isToday ? (profile.undoCountToday ?? 0) + 1 : 1;

    await this.db
      .update(profiles)
      .set({
        undoCountToday: newCount,
        lastUndoDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, userId));
  }

  /**
   * Undo last interaction
   * Returns the profile that was shown (to display again)
   */
  async undoLastInteraction(userId: string) {
    // Check if can use undo
    const { canUndo, remaining, isPremium } = await this.canUseUndo(userId);

    if (!canUndo) {
      throw new BadRequestException(
        'Daily undo limit reached. Upgrade to premium for unlimited undo.',
      );
    }

    // Get last interaction
    const last = await this.getLastInteraction(userId);
    if (!last) {
      throw new BadRequestException('No interactions to undo.');
    }

    // Delete the interaction
    await this.deleteInteraction(last.interaction.id);

    // Increment undo count (only for non-premium)
    if (!isPremium) {
      await this.incrementUndoCount(userId);
    }

    // Return the profile and remaining count
    return {
      profile: last.profile,
      remaining: isPremium ? -1 : remaining - 1,
    };
  }
}
