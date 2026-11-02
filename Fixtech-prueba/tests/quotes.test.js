import test from 'node:test';
import assert from 'node:assert/strict';
import {validateQuote} from '../server/validation.js';
import {models} from '../src/catalog.js';
import {existsSync} from 'node:fs';
const valid={name:'Test',phone:'+52 555 123 4567',email:'test@example.com',address:'Dirección de prueba 123',city:'Prueba',postal:'12345',date:'2099-12-01',time:'morning',notes:'',model:'iphone-15',repairs:['screen'],language:'es',consent:true};
test('accepts complete requests and deduplicates repairs',()=>{assert.ok(validateQuote(valid));assert.deepEqual(validateQuote({...valid,repairs:['screen','screen']}).repairs,['screen']);});
test('rejects unsupported devices, invalid contact, missing consent and impossible dates',()=>{for(const patch of [{model:'ipad'},{repairs:['laptop']},{repairs:[]},{phone:'bad'},{email:'bad'},{consent:false},{date:'2099-02-31'},{date:'2020-01-01'},{time:'midnight'},{address:''},{language:'fr'},{notes:'x'.repeat(1501)}])assert.equal(validateQuote({...valid,...patch}),null,JSON.stringify(patch));});
test('all models have supplied images and unique identifiers',()=>{assert.equal(new Set(models.map(m=>m.id)).size,models.length);for(const m of models)assert.ok(existsSync(`img/${m.image}`),m.image);});
