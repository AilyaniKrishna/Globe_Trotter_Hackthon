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
document.querySelectorAll('#login-form, #signup-form').forEach(form => form.addEventListener('submit', event => { event.preventDefault(); showScreen('home'); }));
document.querySelectorAll('.reveal').forEach(button => button.addEventListener('click', () => { const input = button.previousElementSibling; input.type = input.type === 'password' ? 'text' : 'password'; }));
document.querySelectorAll('.interest-pills button, .trip-filter button').forEach(button => button.addEventListener('click', () => { button.parentElement.querySelectorAll('button').forEach(item => item.classList.remove('selected')); button.classList.add('selected'); }));
document.getElementById('new-trip-form').addEventListener('submit', event => { event.preventDefault(); showScreen('trips'); });
