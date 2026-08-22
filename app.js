const buttons = document.querySelectorAll('[data-screen], [data-screen-target]');
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  document.querySelectorAll('[data-screen]').forEach(b => b.classList.toggle('active', b.dataset.screen === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
buttons.forEach(button => button.addEventListener('click', () => showScreen(button.dataset.screen || button.dataset.screenTarget)));

const places = [
  ['City guide', 'Porto, Portugal', 'Cobblestone lanes, tiled facades and riverside wine.', 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=800&q=80'],
  ['Experience', 'Pasta making in Rome', '3 hours · From ₹4,200', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80'],
  ['City guide', 'Kyoto, Japan', 'Temples, tea houses and a quieter kind of wonder.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'],
  ['Experience', 'Capri by boat', '5 hours · From ₹6,800', 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=800&q=80'],
  ['City guide', 'Marrakech, Morocco', 'Markets, mint tea and desert light.', 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80'],
  ['Experience', 'Lisbon food tour', '4 hours · From ₹3,600', 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=800&q=80']
];
const grid = document.getElementById('discover-grid');
function renderPlaces(query = '') {
  const selection = places.filter(p => p.join(' ').toLowerCase().includes(query.toLowerCase()));
  grid.innerHTML = selection.map(p => `<article class="place-card"><div class="place-image" style="background-image:url('${p[3]}')"></div><div class="place-body"><p>${p[0].toUpperCase()}</p><h2>${p[1]}</h2><div><span>${p[2]}</span><button class="text-button">＋ Save</button></div></div></article>`).join('') || '<p class="subtle">No results yet - try another search.</p>';
}
renderPlaces();
document.getElementById('place-search').addEventListener('input', e => renderPlaces(e.target.value));
document.querySelectorAll('.filter').forEach(filter => filter.addEventListener('click', () => { document.querySelectorAll('.filter').forEach(f => f.classList.remove('selected')); filter.classList.add('selected'); }));

const calendar = document.getElementById('calendar-grid');
const events = {12:['Naples arrival','travel'],13:['Pizza & palaces','naples'],14:['Pompeii day trip','naples'],15:['To Positano','travel'],16:['Positano beach','positano'],17:['Path of Gods','positano'],18:['Capri by boat','capri'],19:['Blue Grotto','capri'],20:['Fly home','travel']};
for (let i = 31; i <= 30 + 35; i++) { const day = i <= 30 ? i : i - 30; const muted = i <= 30 && day > 30 ? 'muted' : ''; const event = events[day]; calendar.innerHTML += `<div class="date-cell ${muted}">${day}${event ? `<span class="event ${event[1]}">${event[0]}</span>` : ''}</div>`; }

document.getElementById('edit-profile').addEventListener('click', e => { e.currentTarget.textContent = 'Saved ✓'; e.currentTarget.style.background = '#4d9a81'; setTimeout(() => { e.currentTarget.textContent = 'Edit profile'; e.currentTarget.style.background = ''; }, 1700); });

function setAuthTab(tab) {
  const signup = tab === 'signup';
  document.querySelectorAll('[data-auth-tab]').forEach(button => button.classList.toggle('active', button.dataset.authTab === tab));
  document.getElementById('login-form').hidden = signup;
  document.getElementById('signup-form').hidden = !signup;
  document.getElementById('auth-eyebrow').textContent = signup ? 'THE WORLD IS WAITING' : 'TRIP PLANNING, SORTED';
  document.getElementById('auth-title').textContent = signup ? 'Create your account' : 'Welcome back';
  document.getElementById('auth-copy').textContent = signup ? 'Start mapping the places that matter to you.' : 'Log in to pick up your itineraries right where you left them.';
}
document.querySelectorAll('[data-auth-tab]').forEach(button => button.addEventListener('click', () => setAuthTab(button.dataset.authTab)));
document.querySelectorAll('.reveal').forEach(button => button.addEventListener('click', () => { const input = button.previousElementSibling; input.type = input.type === 'password' ? 'text' : 'password'; }));
document.querySelectorAll('.interest-pills button, .trip-filter button').forEach(button => button.addEventListener('click', () => { button.parentElement.querySelectorAll('button').forEach(item => item.classList.remove('selected')); button.classList.add('selected'); }));

// ============================================
// SUPABASE-BACKED AUTH + TRIPS
// ============================================

function statusLabel(status) {
  return (status || 'upcoming').toUpperCase();
}

function formatDateRange(start, end) {
  if (!start && !end) return '';
  const opts = { day: '2-digit', month: 'short' };
  const s = start ? new Date(start).toLocaleDateString('en-GB', opts) : '';
  const e = end ? new Date(end).toLocaleDateString('en-GB', opts) : '';
  return [s, e].filter(Boolean).join(' - ');
}

async function renderTrips(user) {
  const { data: trips, error } = await getUserTrips(user.id);
  const homeList = document.getElementById('home-trips-list');
  const gridList = document.getElementById('my-trip-grid');

  if (error) {
    console.error(error);
    return;
  }

  const tripList = trips || [];

  if (homeList) {
    homeList.innerHTML = tripList.slice(0, 2).map(trip => `
      <article class="mini-trip">
        <span>${statusLabel(trip.status)}</span>
        <h3>${trip.name}</h3>
        <p>${formatDateRange(trip.start_date, trip.end_date)}</p>
      </article>
    `).join('');
    const btn = document.createElement('button');
    btn.className = 'empty-trip';
    btn.innerHTML = '＋<br /><b>Plan another trip</b>';
    btn.addEventListener('click', () => showScreen('create-trip'));
    homeList.appendChild(btn);
  }

  if (gridList) {
    if (!tripList.length) {
      gridList.innerHTML = '<p class="subtle">No trips yet — plan your first one!</p>';
    } else {
      gridList.innerHTML = tripList.map(trip => `
        <article class="my-trip-card">
          <div><span class="status">${statusLabel(trip.status)}</span><button>•••</button></div>
          <footer>
            <p>${formatDateRange(trip.start_date, trip.end_date)}</p>
            <h2>${trip.name}</h2>
            <span>${trip.destination || ''}</span>
            <button class="primary" data-screen-target="builder">View itinerary →</button>
          </footer>
        </article>
      `).join('');
      gridList.querySelectorAll('[data-screen-target]').forEach(btn => {
        btn.addEventListener('click', () => showScreen(btn.dataset.screenTarget));
      });
    }
  }
}

const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    alert(error.message);
    return;
  }
  showScreen('home');
  renderTrips(data.user);
});

const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const firstName = document.getElementById('signup-first-name').value;
  const lastName = document.getElementById('signup-last-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const country = document.getElementById('signup-country').value;

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { first_name: firstName, last_name: lastName, country } }
  });
  if (error) {
    alert(error.message);
    return;
  }
  showScreen('home');
  renderTrips(data.user);
});

const newTripForm = document.getElementById('new-trip-form');
newTripForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) { showScreen('auth'); return; }

  const name = document.getElementById('trip-name').value;
  const destination = document.getElementById('trip-destination').value;
  const startDate = document.getElementById('trip-start-date').value;
  const endDate = document.getElementById('trip-end-date').value;

  const { data: trip, error } = await createTrip(user.id, name, startDate, endDate, destination, null);
  if (error) {
    alert(error.message);
    return;
  }
  showScreen('trips');
  renderTrips(user);
});

const signoutBtn = document.getElementById('signout-btn');
if (signoutBtn) {
  signoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    showScreen('auth');
  });
}

(async function init() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (user) {
    showScreen('home');
    renderTrips(user);
  } else {
    showScreen('auth');
  }
})();