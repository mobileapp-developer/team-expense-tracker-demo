'use strict';
const cfg={"slug": "team-expense-tracker-demo", "title": "Team Expense Tracker", "label": "TEAM FINANCE", "description": "A responsive browser demo for recording team expenses in INR, calculating totals, and exporting spreadsheet-ready CSV.", "topic": "expense-tracker", "color": "#4f46a5", "items": ["Travel to customer site", "Equipment supplies", "Mobile data allowance"], "hint": "Add an expense description", "mode": "expenses", "features": ["Record expenses in INR", "Calculate the total using integer paise", "Remove individual expenses", "Export spreadsheet-ready CSV"]};
const key=cfg.slug+'-v1';
const initial=()=>cfg.items.map((title,i)=>({id:'sample-'+i,title,done:false,paise:[45000,125000,29900][i]}));
const message=document.querySelector('#message');
let rows=initial();
try {const saved=JSON.parse(localStorage.getItem(key));if(Array.isArray(saved)&&saved.every(r=>typeof r.id==='string'&&typeof r.title==='string'&&typeof r.done==='boolean'&&Number.isSafeInteger(r.paise)&&r.paise>=0))rows=saved;}catch{message.textContent='Browser storage is unavailable. Changes will last only for this session.';}
const money=p=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(p/100);
function persist(){try{localStorage.setItem(key,JSON.stringify(rows));message.textContent='Saved in this browser.';}catch{message.textContent='Unable to save locally. Export a CSV before closing.';}render();}
function button(label,action,style='secondary'){const b=document.createElement('button');b.type='button';b.textContent=label;b.className=style;b.onclick=action;return b;}
function render(){
 const list=document.querySelector('#items');list.replaceChildren();
 if(!rows.length){const p=document.createElement('p');p.textContent='No items yet. Add your first item above.';list.append(p);}
 rows.forEach(r=>{const el=document.createElement('div');el.className='row'+(r.done?' done':'');const title=document.createElement('strong');title.textContent=r.title;el.append(title);
 const status=document.createElement('span');status.className='small';status.textContent=cfg.mode==='expenses'?money(r.paise):(r.done?'Complete':'Pending');el.append(status);
 const actions=document.createElement('div');actions.className='actions';
 if(cfg.mode!=='expenses')actions.append(button(r.done?'Reopen':'Mark complete',()=>{r.done=!r.done;persist();}));
 actions.append(button('Remove',()=>{rows=rows.filter(x=>x.id!==r.id);persist();},'danger'));el.append(actions);list.append(el);});
 document.querySelector('#metric').textContent=cfg.mode==='expenses'?money(rows.reduce((s,r)=>s+r.paise,0)):rows.filter(r=>r.done).length+' / '+rows.length;
}
document.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const input=document.querySelector('#title');const title=input.value.trim();if(!title){input.setCustomValidity('Enter a description.');input.reportValidity();return;}
 let paise=0;if(cfg.mode==='expenses'){const raw=document.querySelector('#amount').value;if(!/^\d+(\.\d{1,2})?$/.test(raw)){message.textContent='Enter a positive amount with up to two decimal places.';return;}const [whole,fraction='']=raw.split('.');paise=Number(whole)*100+Number(fraction.padEnd(2,'0'));if(paise<=0||paise>100000000){message.textContent='Enter an amount from INR 0.01 to INR 1,000,000.';return;}}
 rows.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2),title,done:false,paise});e.target.reset();persist();input.focus();});
document.querySelector('#title').addEventListener('input',e=>e.target.setCustomValidity(''));
document.querySelector('#reset').onclick=()=>{if(confirm('Replace current items with the original sample data?')){rows=initial();persist();}};
function cell(v){let s=String(v);if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
document.querySelector('#export').onclick=()=>{const table=[cfg.mode==='expenses'?['Description','Amount (INR)']:['Description','Status'],...rows.map(r=>[r.title,cfg.mode==='expenses'?(r.paise/100).toFixed(2):(r.done?'Complete':'Pending')])];const blob=new Blob(['\ufeff'+table.map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=cfg.slug+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message.textContent='CSV exported.';};
render();
