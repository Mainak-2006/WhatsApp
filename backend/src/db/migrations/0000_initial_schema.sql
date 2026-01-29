-- Migration: 0000_initial_schema
-- Created: 2026-01-29
-- Description: Initial database schema for WhatsApp clone

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "phone" VARCHAR(20) UNIQUE,
    "password_hash" TEXT,
    "display_name" VARCHAR(100) NOT NULL,
    "avatar_url" TEXT,
    "bio" TEXT,
    "is_online" BOOLEAN DEFAULT FALSE,
    "last_seen" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "idx_users_phone" ON "users" ("phone");
CREATE INDEX IF NOT EXISTS "idx_users_is_online" ON "users" ("is_online");

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "conversations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255),
    "is_group" BOOLEAN DEFAULT FALSE NOT NULL,
    "avatar_url" TEXT,
    "description" TEXT,
    "created_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "last_message_id" UUID,
    "last_message_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for conversations table
CREATE INDEX IF NOT EXISTS "idx_conversations_created_by" ON "conversations" ("created_by");
CREATE INDEX IF NOT EXISTS "idx_conversations_is_group" ON "conversations" ("is_group");
CREATE INDEX IF NOT EXISTS "idx_conversations_last_message_at" ON "conversations" ("last_message_at" DESC);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "messages" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
    "sender_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "content" TEXT,
    "message_type" VARCHAR(20) DEFAULT 'text' NOT NULL,
    "media_url" TEXT,
    "media_metadata" JSONB,
    "reply_to_id" UUID REFERENCES "messages"("id") ON DELETE SET NULL,
    "is_edited" TIMESTAMP WITH TIME ZONE,
    "is_deleted" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add self-referencing foreign key for reply_to_id
ALTER TABLE "messages" 
    ADD CONSTRAINT "fk_messages_reply_to" 
    FOREIGN KEY ("reply_to_id") REFERENCES "messages"("id") ON DELETE SET NULL;

-- Add foreign key for last_message_id in conversations
ALTER TABLE "conversations" 
    ADD CONSTRAINT "fk_conversations_last_message" 
    FOREIGN KEY ("last_message_id") REFERENCES "messages"("id") ON DELETE SET NULL;

-- Create indexes for messages table
CREATE INDEX IF NOT EXISTS "idx_messages_conversation_id" ON "messages" ("conversation_id");
CREATE INDEX IF NOT EXISTS "idx_messages_sender_id" ON "messages" ("sender_id");
CREATE INDEX IF NOT EXISTS "idx_messages_created_at" ON "messages" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_messages_conversation_created" ON "messages" ("conversation_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_messages_reply_to_id" ON "messages" ("reply_to_id");

-- ============================================
-- PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "participants" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "role" VARCHAR(20) DEFAULT 'member' NOT NULL,
    "nickname" VARCHAR(100),
    "is_muted" BOOLEAN DEFAULT FALSE,
    "muted_until" TIMESTAMP WITH TIME ZONE,
    "last_read_message_id" UUID REFERENCES "messages"("id") ON DELETE SET NULL,
    "last_read_at" TIMESTAMP WITH TIME ZONE,
    "joined_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "left_at" TIMESTAMP WITH TIME ZONE,
    UNIQUE("conversation_id", "user_id")
);

-- Create indexes for participants table
CREATE INDEX IF NOT EXISTS "idx_participants_conversation_id" ON "participants" ("conversation_id");
CREATE INDEX IF NOT EXISTS "idx_participants_user_id" ON "participants" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_participants_user_conversation" ON "participants" ("user_id", "conversation_id");

-- ============================================
-- PRESENCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "presence" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
    "is_online" BOOLEAN DEFAULT FALSE NOT NULL,
    "last_seen" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "status" VARCHAR(50) DEFAULT 'available',
    "socket_id" VARCHAR(100),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for presence table
CREATE INDEX IF NOT EXISTS "idx_presence_user_id" ON "presence" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_presence_is_online" ON "presence" ("is_online");
CREATE INDEX IF NOT EXISTS "idx_presence_socket_id" ON "presence" ("socket_id");

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for all tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON "users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON "conversations"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON "messages"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presence_updated_at
    BEFORE UPDATE ON "presence"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
