import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {once} from 'node:events';

test('API persists records across restarts and protects owner records',async()=>{
 const directory=mkdtempSync(join(tmpdir(),'fixtech-api-'));
 const env={...process.env,PORT:'5198',DATA_DIR:directory,ADMIN_TOKEN:'test-only-secret',SMTP_HOST:'',OWNER_EMAIL:''};
 async function start(){const child=spawn(process.execPath,['server/index.js','--production'],{env,stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{child.kill();reject(Error('server timeout'));},10000);child.stdout.on('data',d=>{if(d.toString().includes('Fixtech:')){clearTimeout(timer);resolve();}});child.once('error',reject);});return child;}
 async function stop(child){const exited=once(child,'exit');child.kill();await exited;}
 let child=await start();
 try{
 const base='http://127.0.0.1:5198';
 assert.equal((await fetch(base+'/api/admin/quotes')).status,401);
 const data={name:'API test',phone:'5551234567',email:'test@example.com',address:'Test address 123',city:'Test city',postal:'12345',date:'2099-12-01',time:'morning',notes:'Synthetic test',model:'s25',repairs:['battery'],language:'en',consent:true};
 const response=await fetch(base+'/api/quotes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 assert.equal(response.status,201);const record=await response.json();assert.match(record.id,/^FX-/);
 assert.equal((await fetch(base+'/api/quotes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,model:'unsupported'})})).status,400);
 assert.equal((await fetch(base+'/api/quotes',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://unrelated.example'},body:JSON.stringify(data)})).status,403);
 await stop(child);child=await start();
 const records=await (await fetch(base+'/api/admin/quotes',{headers:{Authorization:'Bearer test-only-secret'}})).json();
 assert.equal(records.length,1);assert.equal(records[0].id,record.id);assert.equal(records[0].notification,'pending');assert.equal(records[0].payload.address,data.address);
 }finally{await stop(child);}
});
