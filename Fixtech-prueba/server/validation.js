import {models,repairs} from '../src/catalog.js';
export function validateQuote(b){
 if(!b || typeof b!=='object') return null;
 const lengths={name:100,phone:30,email:150,address:300,city:100,postal:15,notes:1500,date:10,time:20};
 const q={};
 for(const [k,max] of Object.entries(lengths)){if(typeof b[k]!=='string'||b[k].length>max)return null;q[k]=b[k].trim();}
 if(!q.name||!/^\+?[\d\s().-]{7,30}$/.test(q.phone)||!/^\S+@\S+\.\S+$/.test(q.email)||q.address.length<5||!q.city||!q.postal)return null;
 if(!models.some(m=>m.id===b.model)||!Array.isArray(b.repairs)||!b.repairs.length||!b.repairs.every(x=>repairs.includes(x)))return null;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(q.date)||!['morning','afternoon','evening'].includes(q.time)||b.consent!==true||!['es','en'].includes(b.language))return null;
 const date=new Date(q.date+'T12:00:00Z');
 if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==q.date||date.getTime()<Date.now()-86400000)return null;
 return {...q,model:b.model,repairs:[...new Set(b.repairs)],language:b.language,consent:true};
}
