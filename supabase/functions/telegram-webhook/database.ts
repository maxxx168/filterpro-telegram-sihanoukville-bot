
export async function getUserSession(supabase: any, userId: number) {
  const { data } = await supabase
    .from('bot_sessions')
    .select('*')
    .eq('telegram_user_id', userId)
    .single()
  
  return data
}

export async function createUserSession(supabase: any, user: any) {
  const { data } = await supabase
    .from('bot_sessions')
    .insert({
      telegram_user_id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      language_code: user.language_code
    })
    .select()
    .single()
  
  return data
}

export async function updateUserStep(supabase: any, userId: number, step: string) {
  await supabase
    .from('bot_sessions')
    .update({ current_step: step })
    .eq('telegram_user_id', userId)
}

export async function updateSessionData(supabase: any, userId: number, sessionData: any, nextStep: string) {
  await supabase
    .from('bot_sessions')
    .update({ 
      session_data: sessionData,
      current_step: nextStep
    })
    .eq('telegram_user_id', userId)
}

export async function getLastOrder(supabase: any, userId: number) {
  const { data } = await supabase
    .from('telegram_orders')
    .select('order_data')
    .eq('telegram_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data
}

export async function saveOrder(supabase: any, userId: number, orderData: any) {
  const { data: savedOrder, error } = await supabase
    .from('telegram_orders')
    .insert({
      telegram_user_id: userId,
      order_data: orderData,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving order to db:', error)
  }

  return savedOrder
}
