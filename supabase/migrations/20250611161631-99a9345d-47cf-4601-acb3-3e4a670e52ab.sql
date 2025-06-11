
-- Create table to store user sessions and bot state
CREATE TABLE public.bot_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  language_code TEXT,
  current_step TEXT DEFAULT 'welcome',
  session_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to store orders from Telegram bot
CREATE TABLE public.telegram_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  order_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_bot_sessions_telegram_user_id ON public.bot_sessions(telegram_user_id);
CREATE INDEX idx_telegram_orders_telegram_user_id ON public.telegram_orders(telegram_user_id);
CREATE INDEX idx_telegram_orders_status ON public.telegram_orders(status);

-- Enable Row Level Security (since this is a public bot, we'll make it permissive)
ALTER TABLE public.bot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_orders ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for bot operations
CREATE POLICY "Allow bot operations on sessions" ON public.bot_sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow bot operations on orders" ON public.telegram_orders
  FOR ALL USING (true) WITH CHECK (true);

-- Create function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_bot_sessions_updated_at 
  BEFORE UPDATE ON public.bot_sessions 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_telegram_orders_updated_at 
  BEFORE UPDATE ON public.telegram_orders 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
