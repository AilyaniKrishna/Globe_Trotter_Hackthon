// ============================================
// SHARED SUPABASE CONNECTION + DATABASE FUNCTIONS
// ============================================
const supabaseUrl = 'https://tbrmzigrcyajwemnewfg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicm16aWdyY3lhandlbW5ld2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODk2MjYsImV4cCI6MjEwMjk2NTYyNn0.2N6vWYoVtqkXrwl--3q6JMeyY2Ki9FLPuxCMUAPTIKM';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

async function createTrip(userId, tripName, startDate, endDate, description, coverImage) {
  const { data, error } = await supabaseClient
    .from('trips')
    .insert({
      user_id: userId,
      name: tripName,
      start_date: startDate,
      end_date: endDate,
      destination: description,
      status: 'upcoming'
    })
    .select()
    .single();
  return { data, error };
}

async function getUserTrips(userId, status = null) {
  let query = supabaseClient.from('trips').select('*').eq('user_id', userId);
  if (status) query = query.eq('status', status);
  const { data, error } = await query.order('start_date');
  return { data, error };
}

async function updateTrip(tripId, fields) {
  const { data, error } = await supabaseClient
    .from('trips')
    .update(fields)
    .eq('id', tripId)
    .select();
  return { data, error };
}

async function deleteTrip(tripId) {
  const { error } = await supabaseClient
    .from('trips')
    .delete()
    .eq('id', tripId);
  return { error };
}
