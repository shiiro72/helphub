-- Index for the join condition
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

-- Indexes for the lookup on the conversations table
CREATE INDEX idx_conversations_p1 ON conversations(participant_1);
CREATE INDEX idx_conversations_p2 ON conversations(participant_2);