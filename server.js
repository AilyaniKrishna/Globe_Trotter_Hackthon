const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const DB_FILE = path.join(ROOT, 'data.json');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const seed = {
  users: [{id:'admin', name:'Alex Morgan', email:'alex@voyagera.app', password:'demo123', city:'London', country:'United Kingdom', bio:'Weekend explorer and thoughtful trip planner.', role:'admin'}],
  trips: [
    {id:'t1',userId:'admin',title:'Lisbon long weekend',place:'Lisbon, Portugal',start:'2026-09-18',end:'2026-09-21',budget:1200,status:'upcoming',cover:'lisbon',days:[{date:'2026-09-18',items:[{time:'10:00',title:'Pastéis de Belém',cost:12},{time:'14:00',title:'Alfama walking tour',cost:25},{time:'19:30',title:'Fado dinner',cost:55}]}]},
    {id:'t2',userId:'admin',title:'Kyoto in spring',place:'Kyoto, Japan',start:'2026-04-08',end:'2026-04-13',budget:2100,status:'completed',cover:'kyoto',days:[]},
    {id:'t3',userId:'admin',title:'New York city break',place:'New York, USA',start:'2026-11-04',end:'2026-11-08',budget:1800,status:'planned',cover:'newyork',days:[]}
  ],
  posts: [{id:'p1',user:'Maya Chen',city:'Lisbon',text:'Skip the queue at Time Out Market by arriving before 12. The rooftop views at sunset are worth it!',likes:34},{id:'p2',user:'Jordan Hill',city:'Kyoto',text:'My favorite quiet stop: the moss gardens at Gio-ji. Bring cash and take the early bus.',likes:52},{id:'p3',user:'Elena Rossi',city:'New York',text:'A rainy-day tip: the Whitney has wonderful views even when the sky is moody.',likes:19}]
};
function readDb(){ if(!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(seed,null,2)); return JSON.parse(fs.readFileSync(DB_FILE,'utf8')); }
function writeDb(db){ fs.writeFileSync(DB_FILE, JSON.stringify(db,null,2)); }
function body(req){return new Promise((resolve,reject)=>{let s='';req.on('data',d=>s+=d);req.on('end',()=>{try{resolve(s?JSON.parse(s):{})}catch(e){reject(e)}})})}
function send(res,status,payload){res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(payload));}
function uid(prefix){return prefix+'_'+crypto.randomUUID().slice(0,8)}
async function api(req,res,url){
  const db=readDb(), method=req.method, route=url.pathname;
  if(method==='GET'&&route==='/api/bootstrap') return send(res,200,{users:db.users.map(({password,...u})=>u),trips:db.trips,posts:db.posts});
  if(method==='POST'&&route==='/api/login'){const b=await body(req);const u=db.users.find(x=>x.email.toLowerCase()===String(b.email).toLowerCase()&&x.password===b.password);return u?send(res,200,{user:((({password,...x})=>x)(u))}):send(res,401,{error:'Incorrect email or password.'});}
  if(method==='POST'&&route==='/api/register'){const b=await body(req);if(db.users.some(x=>x.email===b.email))return send(res,409,{error:'An account with this email already exists.'});const u={id:uid('u'),name:`${b.firstName} ${b.lastName}`.trim(),email:b.email,password:b.password,city:b.city,country:b.country,bio:b.bio||'',role:'user'};db.users.push(u);writeDb(db);return send(res,201,{user:((({password,...x})=>x)(u))});}
  if(method==='POST'&&route==='/api/admin/auth'){const b=await body(req);const u=db.users.find(x=>x.email===b.email&&x.password===b.password&&x.role==='admin');return u?send(res,200,{authorized:true}):send(res,403,{error:'Admin credentials were not accepted.'});}
  if(method==='POST'&&route==='/api/trips'){const b=await body(req); if(!b.title||!b.place||!b.start||!b.end)return send(res,400,{error:'Please complete the trip details.'});const t={id:uid('t'),userId:b.userId,title:b.title,place:b.place,start:b.start,end:b.end,budget:Number(b.budget)||0,status:'planned',cover:b.place.split(',')[0].toLowerCase(),days:[]};db.trips.unshift(t);writeDb(db);return send(res,201,{trip:t});}
  const tripMatch=route.match(/^\/api\/trips\/([^/]+)$/);
  if(method==='PATCH'&&tripMatch){const b=await body(req);const t=db.trips.find(x=>x.id===tripMatch[1]);if(!t)return send(res,404,{error:'Trip not found'});Object.assign(t,b);writeDb(db);return send(res,200,{trip:t});}
  const itemMatch=route.match(/^\/api\/trips\/([^/]+)\/items$/);
  if(method==='POST'&&itemMatch){const b=await body(req);const t=db.trips.find(x=>x.id===itemMatch[1]);if(!t)return send(res,404,{error:'Trip not found'});if(!t.days.length)t.days.push({date:t.start,items:[]});t.days[0].items.push({time:b.time||'12:00',title:b.title,cost:Number(b.cost)||0});writeDb(db);return send(res,201,{trip:t});}
  if(method==='POST'&&route==='/api/posts'){const b=await body(req);const p={id:uid('p'),user:b.user||'Traveler',city:b.city||'Everywhere',text:b.text,likes:0};db.posts.unshift(p);writeDb(db);return send(res,201,{post:p});}
  const userMatch=route.match(/^\/api\/users\/([^/]+)$/);
  if(method==='PATCH'&&userMatch){const b=await body(req);const u=db.users.find(x=>x.id===userMatch[1]);if(!u)return send(res,404,{error:'User not found'});for(const k of ['name','city','country','bio'])if(typeof b[k]==='string')u[k]=b[k].trim();writeDb(db);return send(res,200,{user:((({password,...x})=>x)(u))});}
  return send(res,404,{error:'Not found'});
}
const port = Number(process.env.PORT) || 3000;
const host = '127.0.0.1';
http.createServer(async(req,res)=>{const url=new URL(req.url,'http://localhost');try{if(url.pathname.startsWith('/api/'))return await api(req,res,url);let file=url.pathname==='/'?'/public/index.html':'/public'+url.pathname;file=path.normalize(path.join(ROOT,file));if(!file.startsWith(path.join(ROOT,'public')))throw new Error('bad path');fs.readFile(file,(e,data)=>{if(e){res.writeHead(404);res.end('Not found');return}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(data)});}catch(e){send(res,500,{error:e.message})}}).listen(port,host,()=>console.log(`Voyagera running at http://${host}:${port}`));
