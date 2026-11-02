import 'dotenv/config';
import express from 'express';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {randomUUID,timingSafeEqual} from 'node:crypto';
import nodemailer from 'nodemailer';
import {validateQuote} from './validation.js';
import {models} from '../src/catalog.js';
const app=express();
mkdirSync(process.env.DATA_DIR||'data',{recursive:true});
const db=new DatabaseSync(`${process.env.DATA_DIR||'data'}/fixtech.sqlite`);
db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS quotes (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, payload TEXT NOT NULL, notification TEXT NOT NULL DEFAULT \'pending\', attempts INTEGER NOT NULL DEFAULT 0)');
app.disable('x-powered-by');
app.use(express.json({limit:'16kb'}));
app.use('/api',(req,res,next)=>{res.set('Cache-Control','no-store');next();});
const safeURL=x=>{try{const u=new URL(x);return u.protocol==='https:'?u.href:'';}catch{return '';}};
app.get('/api/config',(req,res)=>res.json({name:process.env.BUSINESS_NAME||'Fixtech',instagram:safeURL(process.env.INSTAGRAM_URL),facebook:safeURL(process.env.FACEBOOK_URL),whatsapp:/^\d{8,15}$/.test(process.env.WHATSAPP_NUMBER||'')?`https://wa.me/${process.env.WHATSAPP_NUMBER}`:'',email:process.env.OWNER_EMAIL||''}));
const limits=new Map();
app.post('/api/quotes',(req,res)=>{
 const origin=req.get('origin');if(origin){try{if(new URL(origin).host!==req.get('host'))return res.sendStatus(403);}catch{return res.sendStatus(403);}}
 const now=Date.now();for(const [k,v]of limits)if(now-v.start>3600000)limits.delete(k);
 const key=req.ip;const v=limits.get(key)||{start:now,count:0};v.count++;limits.set(key,v);if(v.count>15)return res.status(429).json({error:'rate_limit'});
 const q=validateQuote(req.body);if(!q||req.body.website)return res.status(400).json({error:'invalid_request'});
 const id=`FX-${randomUUID()}`;db.prepare('INSERT INTO quotes (id,created_at,payload) VALUES (?,?,?)').run(id,new Date().toISOString(),JSON.stringify(q));
 res.status(201).json({id,status:'pending_confirmation'});void notify();
});
app.get('/api/admin/quotes',(req,res)=>{
 const expected=process.env.ADMIN_TOKEN;const actual=(req.get('authorization')||'').replace(/^Bearer /,'');
 if(!expected||Buffer.byteLength(actual)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return res.sendStatus(401);
 res.json(db.prepare('SELECT * FROM quotes ORDER BY created_at DESC LIMIT 200').all().map(r=>({...r,payload:JSON.parse(r.payload)})));
});
let sending=false;
async function notify(){
 if(sending||!process.env.SMTP_HOST||!process.env.OWNER_EMAIL)return;
 sending=true;
 try{const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_PORT==='465',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}:undefined,connectionTimeout:10000,socketTimeout:15000});
 for(const row of db.prepare("SELECT * FROM quotes WHERE notification='pending' AND attempts<10 LIMIT 10").all()){
 const q=JSON.parse(row.payload);
 try{await transport.sendMail({from:process.env.SMTP_FROM||process.env.SMTP_USER,to:process.env.OWNER_EMAIL,replyTo:q.email,subject:`Fixtech · Solicitud ${row.id}`,text:`Nueva solicitud, sin pago y pendiente de confirmar.\nFolio: ${row.id}\nModelo: ${models.find(m=>m.id===q.model)?.name}\nReparaciones: ${q.repairs.join(', ')}\nNombre: ${q.name}\nTeléfono: ${q.phone}\nCorreo: ${q.email}\nDirección: ${q.address}, ${q.city}, ${q.postal}\nPreferencia: ${q.date}, ${q.time}\nIdioma: ${q.language}\nNotas: ${q.notes}`});db.prepare("UPDATE quotes SET notification='sent',attempts=attempts+1 WHERE id=?").run(row.id);}catch{db.prepare('UPDATE quotes SET attempts=attempts+1 WHERE id=?').run(row.id);console.error('Notification pending; check SMTP configuration.');}
 }}finally{sending=false;}
}
setInterval(()=>void notify(),60000).unref();void notify();
app.use('/api',(req,res)=>res.status(404).json({error:'not_found'}));
app.use('/img',express.static('img'));
if(process.argv.includes('--production')){app.use(express.static('dist'));app.get('/{*path}',(req,res)=>res.sendFile('index.html',{root:'dist'}));}
else{const {createServer}=await import('vite');const vite=await createServer({server:{middlewareMode:true},appType:'spa'});app.use(vite.middlewares);}
app.use((err,req,res,next)=>{console.error('Request failed:',err.type||err.name);res.status(500).json({error:'server_error'});});
app.listen(Number(process.env.PORT||5173),process.env.HOST||'127.0.0.1',()=>console.log(`Fixtech: http://localhost:${process.env.PORT||5173}`));
