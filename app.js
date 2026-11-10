const $ = selector => document.querySelector(selector);
const paths = {
 Dashboard:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
 'Point of Sale':'M3 5h18v12H3z M8 21h8 M12 17v4 M6 9h12',
 Inventory:'m3 7 9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10',
 Purchases:'M5 4h14v17l-3-2-4 2-4-2-3 2z M8 9h8 M8 13h8',
 Suppliers:'M3 6h12v12H3z M15 10h4l2 3v5h-6 M7 20h.01 M17 20h.01',
 Returns:'m7 8-4 4 4 4 M3 12h12a4 4 0 0 0 0-8',
 'Stock Count':'M5 5h14v16H5z M9 3h6v4H9z M8 13l2 2 5-5',
 Alerts:'M18 8a6 6 0 1 0-12 0c0 6-3 7-3 9h18c0-2-3-3-3-9 M10 21h4',
 Reports:'M4 3v17h17 M8 16v-4 M13 16V8 M18 16V5',
 Accounts:'M3 6h18v13H3z M3 10h18 M7 15h4',
 Backup:'M4 4h16v16H4z M8 4v6h8V4 M8 20v-6h8v6',
 Plus:'M12 5v14 M5 12h14'
};
const icon = name => '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+paths[name]+'"/></svg>';
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const dateAt = (offset=0) => {
 const d = new Date(); d.setDate(d.getDate()+offset);
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
};
const day = dateAt();
const money = value => 'Rs '+new Intl.NumberFormat('en-PK',{maximumFractionDigits:2}).format(value);
const num = new Intl.NumberFormat('en-PK');
const sum = (items, fn) => items.reduce((total,item)=>total+fn(item),0);
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const key = 'medora-pharmacy-demo-v1';
const suppliers = [{id:'s1',name:'City Pharma Distributors',phone:'0300 555 0101'},{id:'s2',name:'Medline Traders',phone:'0300 555 0102'},{id:'s3',name:'Horizon Medical Supply',phone:'0300 555 0103'}];
const products = [
 ['p1','Paracetamol 500 mg','Pain relief','8961001000013','PCM-241',180,10,2.5,4,220,'s1'],
 ['p2','Cetirizine 10 mg','Allergy','8961001000020','CTZ-118',260,10,5,8,126,'s2'],
 ['p3','Omeprazole 20 mg','Digestive health','8961001000037','OMP-063',18,10,12,18,15,'s1'],
 ['p4','Vitamin C 500 mg','Supplements','8961001000044','VTC-310',350,10,8,12,310,'s3'],
 ['p5','Ibuprofen 200 mg','Pain relief','8961001000051','IBU-307',43,10,4,7,26,'s2'],
 ['p6','ORS Sachet','Hydration','8961001000068','ORS-812',96,1,24,35,180,'s3'],
 ['p7','Cough Syrup 120 mL','Cold & flu','8961001000075','CSY-211',8,1,160,225,95,'s1'],
 ['p8','Multivitamin Tablets','Supplements','8961001000082','MVT-099',130,10,7,11,370,'s3']
 ].map(([id,name,category,barcode,batch,qty,strip,cost,price,expiry,supplier])=>({id,name,category,barcode,batch,qty,strip,box:strip*10,cost,price,expiry:dateAt(expiry),supplier}));
function seed(){
 const sales = Array.from({length:7},(_,index)=>Array.from({length:[5,7,6,9,8,11,10][index]},(_,i)=>{
  const p=products[(i+index)%products.length], qty=p.strip*(i%3+1);
  return {id:'seed-'+index+'-'+i,number:'INV-'+(101+index*12+i),date:dateAt(index-6),customer:['Walk-in customer','Ayesha Malik','Walk-in customer','Bilal Shah'][i%4],method:i%3?'Cash':'Card',lines:[{product:p.id,name:p.name,batch:p.batch,qty,units:qty,unit:p.strip===1?'Unit':'Tablet',price:p.price,cost:p.cost}],total:qty*p.price,cost:qty*p.cost};
 })).flat();
 return {products:structuredClone(products),suppliers:structuredClone(suppliers),sales, purchases:[
 {id:'buy1',date:dateAt(-3),supplier:'s1',product:'p1',name:products[0].name,qty:200,total:500},
 {id:'buy2',date:dateAt(-2),supplier:'s2',product:'p2',name:products[1].name,qty:300,total:1500},
 {id:'buy3',date:dateAt(-1),supplier:'s3',product:'p6',name:products[5].name,qty:100,total:2400}
 ], payments:[{id:'pay1',date:dateAt(-1),supplier:'s3',amount:1000}],returns:[],counts:[],expenses:[{id:'exp1',date:day,description:'Shop supplies',amount:250}],next:200};
}
const collections=['products','suppliers','sales','purchases','payments','returns','counts','expenses'];
const safeId = id => typeof id==='string' && /^[a-z0-9-]+$/i.test(id);
const safeDate = date => typeof date==='string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
const valid = data => data && Number.isSafeInteger(data.next) && collections.every(name=>
 Array.isArray(data[name]) && data[name].every(row=>row && safeId(row.id) &&
 (name==='products'?safeDate(row.expiry) && safeId(row.supplier) && Number.isSafeInteger(row.qty):
 name==='suppliers'||safeDate(row.date))
 )) && data.sales.every(s=>Array.isArray(s.lines)&&s.lines.every(l=>l && safeId(l.product)));
function load(){
 try {const data=JSON.parse(localStorage.getItem(key)); if(valid(data)) return data;} catch {}
 return seed();
}
let db=load(), page='Dashboard', cart=[], query='', report='Daily', ledger='';
function save(){
 try {
  const previous=localStorage.getItem(key);
  if(previous) localStorage.setItem(key+'-previous',previous);
  localStorage.setItem(key,JSON.stringify(db));
 } catch { notify('Browser storage is unavailable. Export a backup before closing.'); }
}
let toastTimer;
function notify(message){const t=$('#toast');t.textContent=message;t.style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.style.display='none',3000);}
const pill = (value,type='') => '<span class="pill '+type+'">'+esc(value)+'</span>';
const btn = (label,attrs='',primary=false) => '<button class="btn'+(primary?' primary':'')+'" '+attrs+'>'+label+'</button>';
const heading = (title,desc,actions='',label='PHARMACY OPERATIONS') => '<div class="page-head"><div><div class="eyebrow">'+label+'</div><h1>'+title+'</h1><p>'+desc+'</p></div><div class="actions">'+actions+'</div></div>';
const card = (title,body,action='',desc='')=>'<section class="card"><div class="card-head"><div><h2>'+title+'</h2>'+(desc?'<p>'+desc+'</p>':'')+'</div>'+action+'</div>'+body+'</section>';
const table=(headers,rows,empty='No records yet.')=>rows.length?'<div class="table-wrap"><table><thead><tr>'+headers.map(h=>'<th scope="col">'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(cell=>'<td>'+cell+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':'<div class="empty">'+empty+'</div>';
const stat=(name,value,detail,symbol)=>'<article class="stat"><div class="stat-top"><span class="stat-icon">'+icon(symbol)+'</span>'+name+'</div><strong>'+value+'</strong><small>'+detail+'</small></article>';
const product = id=>db.products.find(p=>p.id===id);
const supplier = id=>db.suppliers.find(s=>s.id===id)?.name || '—';
const low = p=>p.qty<=p.strip*3;
const near = p=>p.expiry<=dateAt(45);
const sellable = p=>p.qty>0 && p.expiry>=day;
const status = p=>p.expiry<day?pill('Expired','bad'):near(p)?pill('Expiring soon','bad'):low(p)?pill('Low stock','warn'):pill('In stock');
const newest = items=>items.slice().reverse();
const filtered = items=>items.filter(p=>[p.name,p.category,p.batch,p.barcode].some(value=>String(value).toLowerCase().includes(query.trim().toLowerCase())));
const search = placeholder=>'<div class="filter"><input id="search" type="search" autocomplete="off" aria-label="'+placeholder+'" placeholder="'+placeholder+'" value="'+esc(query)+'"></div>';
const navGroups={'WORKSPACE':['Dashboard','Point of Sale','Inventory','Purchases','Suppliers'],'OPERATIONS':['Returns','Stock Count','Alerts'],'MANAGEMENT':['Reports','Accounts','Backup']};
function render(){
 $('#nav').innerHTML=Object.entries(navGroups).map(([label,pages])=>'<div class="nav-label">'+label+'</div>'+pages.map(name=>'<button class="nav-btn'+(name===page?' active':'')+'" data-page="'+name+'" '+(name===page?'aria-current="page"':'')+'>'+icon(name)+esc(name)+'</button>').join('')).join('');
 $('#breadcrumb').innerHTML='<span class="muted">Workspace</span> &nbsp;/&nbsp; <strong>'+page+'</strong>';
 $('#main').innerHTML=views[page]();
}
function salesTable(sales){return table(['Invoice','Customer','Date','Payment','Total',''],sales.map(s=>['<strong>'+esc(s.number)+'</strong>',esc(s.customer),esc(s.date),pill(s.method),money(s.total),btn('Receipt','data-receipt="'+s.id+'"')]),'No sales in this period.');}
function dashboard(){
 const today=db.sales.filter(s=>s.date===day), sales=sum(today,s=>s.total)-sum(db.returns.filter(r=>r.type==='Customer'&&r.date===day),r=>r.amount);
 const totals=Array.from({length:7},(_,i)=>{const date=dateAt(i-6);return {date,total:sum(db.sales.filter(s=>s.date===date),s=>s.total)};});
 const max=Math.max(1,...totals.map(t=>t.total));
 const chart='<div class="chart">'+totals.map(t=>'<div class="bar-col"><div class="bar-track"><div class="bar" style="height:'+Math.round(t.total/max*100)+'%" title="'+money(t.total)+'"></div></div><span>'+new Date(t.date+'T12:00:00').toLocaleDateString('en',{weekday:'short'})+'</span></div>').join('')+'</div>';
 const flagged=db.products.filter(p=>low(p)||near(p)).sort((a,b)=>a.expiry.localeCompare(b.expiry));
 const alertList=flagged.length?'<div class="list">'+flagged.slice(0,4).map(p=>'<div class="row"><div><div class="item-title">'+esc(p.name)+'</div><small class="sub">'+esc(p.batch)+' · '+(near(p)?esc(p.expiry):num.format(p.qty)+' units left')+'</small></div>'+status(p)+'</div>').join('')+'</div>':'<div class="empty">All stock levels and expiry dates look good.</div>';
 return heading('Overview','Sales and stock at Shifa Pharmacy today.',btn('View reports','data-page="Reports"')+btn(icon('Plus')+' New sale','data-page="Point of Sale"',true),'STORE OVERVIEW')+
 '<div class="metrics">'+stat('Net sales today',money(sales),'Sales less customer returns','Accounts')+stat('Invoices today',num.format(today.length),'Completed transactions','Purchases')+stat('Low-stock batches',num.format(db.products.filter(low).length),'At or below reorder level','Inventory')+stat('Expiry alerts',num.format(db.products.filter(near).length),'Expired or due within 45 days','Alerts')+'</div>'+
 '<div class="split">'+card('Sales activity',chart,pill('Last 7 days'),'Gross sales by day')+card('Stock attention',alertList,btn('View all','data-page="Alerts"'),'Batches that need a check')+'</div>'+
 card('Recent transactions',salesTable(newest(db.sales).slice(0,5)),btn('Open POS','data-page="Point of Sale"'));
}
function inventory(alerts=false){
 const items=filtered(alerts?db.products.filter(p=>low(p)||near(p)):db.products);
 return heading(alerts?'Stock alerts':'Inventory',alerts?'Review low stock and batches expiring within 45 days.':'Check stock by medicine, barcode and batch.',alerts?'':btn(icon('Plus')+' Add batch','data-form="batch"',true))+
 card(alerts?'Flagged batches':'Medicine batches',search('Search medicine, barcode or batch')+'<div id="results">'+inventoryRows(items)+'</div>',pill(items.length+' batches'));
}
function inventoryRows(items){return table(['Medicine','Barcode','Batch','Expiry','On hand','Unit price','Status'],items.map(p=>['<strong>'+esc(p.name)+'</strong><span class="sub">'+esc(p.category)+'</span>',esc(p.barcode),esc(p.batch),esc(p.expiry),num.format(p.qty),money(p.price),status(p)]),'No matching batches.');}
const options = (values,selected)=>values.map(([value,label])=>'<option value="'+esc(value)+'" '+(value===selected?'selected':'')+'>'+esc(label)+'</option>').join('');
const units = p=>p.strip===1?[['unit','Unit'],['box','Box ('+p.box+')']]:[['unit','Tablet'],['strip','Strip ('+p.strip+')'],['box','Box ('+p.box+')']];
const factor = (p,unit)=>unit==='box'?p.box:unit==='strip'?p.strip:1;
const posProducts = ()=>table(['Medicine','Batch','On hand','Base price',''],filtered(db.products.filter(sellable)).map(p=>['<strong>'+esc(p.name)+'</strong><span class="sub">'+esc(p.barcode)+'</span>',esc(p.batch),num.format(p.qty),money(p.price),btn('Add','data-add="'+p.id+'"')]),'No sellable batches match your search.');
function lineAmount(line){
 const p=product(line.id);
 return line.qty*factor(p,line.unit)*p.price;
}
function pos(){
 const lines=cart.map(line=>{const p=product(line.id);return ['<strong>'+esc(p.name)+'</strong><span class="sub">'+esc(p.batch)+'</span>','<div class="cart-controls"><input aria-label="Quantity for '+esc(p.name)+'" type="number" min="1" step="1" value="'+line.qty+'" data-qty="'+line.id+'"><select aria-label="Billing unit for '+esc(p.name)+'" data-unit="'+line.id+'">'+options(units(p),line.unit)+'</select></div>','<span id="amount-'+line.id+'">'+money(lineAmount(line))+'</span>',btn('Remove','data-remove="'+line.id+'"')];});
 return heading('Point of Sale','Scan a barcode or search by medicine name.')+'<div class="split pos-split">'+card('Product lookup',search('Scan barcode or search medicine')+'<div id="results">'+posProducts()+'</div>')+card('Current sale',table(['Medicine','Quantity','Amount',''],lines,'Add a medicine to start billing.')+'<div class="row total"><span>Total</span><span id="cart-total">'+money(sum(cart,lineAmount))+'</span></div><div class="padded">'+btn('Complete sale','data-form="sale" '+(cart.length?'':'disabled'),true)+'</div>',pill(cart.length+' lines'))+'</div>'+card('Recent sales',salesTable(newest(db.sales).slice(0,8)));
}
function purchases(){return heading('Purchases','Receive medicine stock and record supplier invoices.',btn(icon('Plus')+' Record purchase','data-form="purchase"',true))+card('Purchase history',table(['Date','Supplier','Medicine','Units received','Total'],newest(db.purchases).map(p=>[p.date,esc(supplier(p.supplier)),esc(p.name),p.qty,money(p.total)])));}
const supplierReturns=id=>db.returns.filter(r=>r.type==='Supplier'&&r.supplier===id);
const balance=id=>sum(db.purchases.filter(p=>p.supplier===id),p=>p.total)-sum(db.payments.filter(p=>p.supplier===id),p=>p.amount)-sum(supplierReturns(id),r=>r.amount);
function supplierView(){
 const entries=ledger?[...db.purchases.filter(p=>p.supplier===ledger).map(p=>[p.date,'Purchase',p.total]),...db.payments.filter(p=>p.supplier===ledger).map(p=>[p.date,'Payment',-p.amount]),...supplierReturns(ledger).map(r=>[r.date,'Supplier return',-r.amount])].sort((a,b)=>b[0].localeCompare(a[0])):[];
 return heading('Suppliers','Review outstanding balances and record payments.',btn('Add supplier','data-form="supplier"')+btn('Record payment','data-form="payment"',true))+'<div class="stack">'+card('Supplier directory',table(['Supplier','Phone','Outstanding',''],db.suppliers.map(s=>[esc(s.name),esc(s.phone),money(balance(s.id)),btn('View ledger','data-ledger="'+s.id+'"')])))+
 (ledger?card(esc(supplier(ledger))+' ledger',table(['Date','Entry','Balance change'],entries.map(([d,t,a])=>[d,t,money(a)])),pill('Balance '+money(balance(ledger)))):'')+'</div>';
}
function returnsView(){return heading('Returns','Record a customer refund or a credit from a supplier.',btn('New customer return','data-form="customerReturn"')+btn('New supplier return','data-form="supplierReturn"',true))+card('Return history',table(['Date','Type','Reference','Medicine','Units','Credit'],newest(db.returns).map(r=>[r.date,pill(r.type),esc(r.reference),esc(r.name),r.qty,money(r.amount)])));}
function stockCount(){return heading('Stock Count','Compare physical stock with the recorded balance.',btn(icon('Plus')+' Record count','data-form="count"',true))+card('Stock count history',table(['Date','Medicine','Batch','Expected','Counted','Variance'],newest(db.counts).map(c=>[c.date,esc(c.name),esc(c.batch),c.before,c.qty,pill((c.qty-c.before>0?'+':'')+(c.qty-c.before),c.qty===c.before?'':'warn')])));}
function financial(date){
 const sales=db.sales.filter(s=>!date||s.date===date),returns=db.returns.filter(r=>r.type==='Customer'&&(!date||r.date===date)),expenses=db.expenses.filter(e=>!date||e.date===date);
 const revenue=sum(sales,s=>s.total)-sum(returns,r=>r.amount), cost=sum(sales,s=>s.cost)-sum(returns,r=>r.cost), expense=sum(expenses,e=>e.amount);
 return {revenue,cost,expense,profit:revenue-cost-expense,sales,returns};
}
function reports(){
 const all=financial();
 let rows,headers;
 if(report==='Product-wise'){
  const groups=new Map();
  function group(line,qty,amount){const id=line.product, entry=groups.get(id)||{name:line.name,qty:0,amount:0};entry.qty+=qty;entry.amount+=amount;groups.set(id,entry);}
  all.sales.forEach(s=>s.lines.forEach(l=>group(l,l.units,l.price*l.qty)));
  all.returns.forEach(r=>group(r,-r.qty,-r.amount));
  headers=['Medicine / batch','Units sold net','Net sales'];rows=[...groups.values()].sort((a,b)=>b.amount-a.amount).map(g=>[esc(g.name),g.qty,money(g.amount)]);
 } else {
  headers=['Period','Invoices','Net sales','Cost of goods','Expenses','Net profit'];
  const dates=[...new Set([day,...db.sales.map(s=>s.date),...db.returns.map(r=>r.date),...db.expenses.map(e=>e.date)])].sort().reverse();
  rows=(report==='Daily'?dates:[null]).map(d=>{const f=d?financial(d):all;return [d||'All dates',f.sales.length,money(f.revenue),money(f.cost),money(f.expense),money(f.profit)];});
 }
 return heading('Reports','Review daily, product-wise and cumulative performance.')+card(report+' sales',table(headers,rows),'<select id="report-mode" aria-label="Report type">'+options(['Daily','Product-wise','Cumulative'].map(r=>[r,r]),report)+'</select>');
}
function accounts(){
 const f=financial();
 return heading('Accounts','Track sales, cost of goods, expenses and profit.',btn(icon('Plus')+' Record expense','data-form="expense"',true))+'<div class="metrics">'+stat('Net sales',money(f.revenue),'After customer refunds','Accounts')+stat('Cost of goods',money(f.cost),'Stock cost on completed sales','Inventory')+stat('Expenses',money(f.expense),'Recorded operating expenses','Purchases')+stat('Net profit / loss',money(f.profit),'Net sales less cost and expenses','Reports')+'</div>'+card('Operating expenses',table(['Date','Description','Amount'],newest(db.expenses).map(e=>[e.date,esc(e.description),money(e.amount)])));
}
function backup(){return heading('Backup & Restore','Download or restore the records stored in this browser.')+'<div class="split">'+card('Local backup','<div class="padded form"><p class="muted">The previous saved state is retained automatically in this browser. Export a JSON file to keep a portable copy.</p><div class="actions">'+btn('Download backup','data-export',true)+btn('Restore previous save','data-form="previous"')+'</div></div>')+card('Restore from file','<div class="padded form"><p class="muted">Choose a Medora backup file to replace the demo records in this browser.</p><input type="file" id="restore-file" accept=".json,application/json" aria-label="Select backup file"></div>')+'</div>';}
const views={Dashboard:dashboard,'Point of Sale':pos,Inventory:inventory,Purchases:purchases,Suppliers:supplierView,Returns:returnsView,'Stock Count':stockCount,Alerts:()=>inventory(true),Reports:reports,Accounts:accounts,Backup:backup};
const field=(label,name,type='text',attributes='')=>'<label>'+label+'<input name="'+name+'" type="'+type+'" '+attributes+' required></label>';
const select=(label,name,values)=>'<label>'+label+'<select name="'+name+'" required>'+options(values)+'</select></label>';
const productOptions=()=>db.products.map(p=>[p.id,p.name+' · '+p.batch+' ('+p.qty+' on hand)']);
const supplierOptions=()=>db.suppliers.map(s=>[s.id,s.name]);
const pair=(a,b)=>'<div class="form-grid">'+a+b+'</div>';
const integer=(label,name,min=1,value='')=>field(label,name,'number','min="'+min+'" step="1" '+(value!==''?'value="'+value+'"':''));
const amount=(label,name,min='0.01')=>field(label,name,'number','min="'+min+'" step="0.01"');
const returnable=(sale,line)=>line.units-sum(db.returns.filter(r=>r.sale===sale.id&&r.product===line.product),r=>r.qty);
const returnOptions=()=>newest(db.sales).flatMap(s=>s.lines.filter(l=>returnable(s,l)>0).map(l=>[s.id+'|'+l.product,s.number+' · '+l.name+' ('+returnable(s,l)+' available)']));
const forms={
 batch:['Add medicine batch',()=>field('Medicine name','name')+pair(field('Category','category'),field('Barcode','barcode'))+pair(field('Batch number','batch'),field('Expiry date','expiry','date'))+pair(integer('Units per strip (1 for individual items)','strip',1,10),integer('Units per box','box',1,100))+pair(amount('Unit cost','cost','0'),amount('Unit price','price'))+select('Supplier','supplier',supplierOptions())],
 purchase:['Record supplier purchase',()=>select('Medicine batch','product',productOptions())+select('Supplier','supplier',supplierOptions())+pair(integer('Units received','qty'),amount('Total invoice amount','total'))],
 supplier:['Add supplier',()=>field('Supplier name','name')+field('Phone','phone','tel')],
 payment:['Record supplier payment',()=>select('Supplier','supplier',supplierOptions())+amount('Amount paid','amount')],
 customerReturn:['Record customer return',()=>select('Invoice and batch','line',returnOptions())+integer('Base units returned','qty')+select('Return to sellable stock','restock',[['no','No'],['yes','Yes']])],
 supplierReturn:['Record supplier return',()=>select('Medicine batch','product',productOptions())+select('Supplier','supplier',supplierOptions())+pair(integer('Units sent back','qty'),amount('Supplier credit','amount'))],
 count:['Record physical stock count',()=>select('Medicine batch','product',productOptions())+integer('Counted units','qty',0)],
 expense:['Record operating expense',()=>field('Description','description')+amount('Amount','amount')],
 sale:['Complete sale',()=>'<label>Customer<input name="customer" placeholder="Walk-in customer"></label>'+select('Payment method','method',[['Cash','Cash'],['Card','Card'],['Bank transfer','Bank transfer']])],
 previous:['Restore previous save',()=>'<p>Replace the current records with the previous saved state?</p>'],
 restore:['Restore backup file',()=>'<p>Replace the current records with the selected backup?</p>']
};
let pendingRestore;
function modal(title,body){
 $('#modal').innerHTML='<div class="card-head"><h2>'+title+'</h2></div>'+body;
 if(!$('#modal').open) $('#modal').showModal();
}
function openForm(kind){
 const [title,fields]=forms[kind];
 modal(title,'<form id="entry" class="form padded" data-kind="'+kind+'">'+fields()+'<p id="error" role="alert"></p><div class="actions">'+btn('Cancel','type="button" data-close')+btn(kind==='sale'?'Save & view receipt':'Confirm','type="submit"',true)+'</div></form>');
}
function receipt(s){
 const detail='<h2>Shifa Pharmacy</h2><p>'+esc(s.number)+' · '+s.date+'</p><p>'+esc(s.customer)+' · '+esc(s.method)+'</p>'+table(['Medicine','Quantity','Amount'],s.lines.map(l=>[esc(l.name)+'<small class="sub">'+esc(l.batch)+'</small>',l.qty+' '+esc(l.unit),money(l.qty*l.price)]))+'<div class="row total"><span>Total paid</span><span>'+money(s.total)+'</span></div>';
 $('#print-area').innerHTML=detail;
 modal('Sales receipt','<div class="padded">'+detail+'<div class="actions">'+btn('Close','data-close')+btn('Print receipt','data-print',true)+'</div></div>');
}
function fail(message){throw new Error(message);}
function addToCart(id){
 const p=product(id), line=cart.find(item=>item.id===id);
 if(line){
  if((line.qty+1)*factor(p,line.unit)>p.qty){notify('Not enough stock for another '+line.unit+'.');return;}
  line.qty++;
 }else cart.push({id,unit:'unit',qty:1});
 render();$('#search')?.focus();
}
function transact(kind,data){
 const p=product(data.product), record={id:uid(),date:day}, qty=Number(data.qty), value=Number(data.amount);
 if(kind==='batch'){
  const {name,category,barcode,batch,expiry,supplier}=data, strip=Number(data.strip),box=Number(data.box);
  if(!name.trim()||!batch.trim()||!barcode.trim())fail('Enter a medicine name, barcode and batch number.');
  if(db.products.some(p=>p.barcode===barcode.trim()&&p.batch.toLowerCase()===batch.trim().toLowerCase()))fail('This barcode and batch combination already exists.');
  if(box<strip||box%strip!==0)fail('Units per box must be a multiple of units per strip.');
  db.products.push({id:record.id,name:name.trim(),category:category.trim(),barcode:barcode.trim(),batch:batch.trim(),expiry,supplier,qty:0,strip,box,cost:Number(data.cost),price:Number(data.price)});
 }else if(kind==='supplier'){
  if(!data.name.trim()||!data.phone.trim())fail('Enter the supplier name and phone number.');
  db.suppliers.push({id:record.id,name:data.name.trim(),phone:data.phone.trim()});
 }else if(kind==='purchase'){
  if(!p||!data.supplier)fail('Choose a batch and supplier.');
  if(p.supplier!==data.supplier)fail('Choose the supplier assigned to this batch.');
  const total=Number(data.total);
  p.cost=(p.qty*p.cost+total)/(p.qty+qty);
  p.qty+=qty;db.purchases.push({...record,supplier:data.supplier,product:p.id,name:p.name,qty,total});
 }else if(kind==='payment'){
  if(!data.supplier)fail('Choose a supplier.');
  if(value>balance(data.supplier)+0.00001)fail('Payment exceeds the outstanding supplier balance.');
  db.payments.push({...record,supplier:data.supplier,amount:value});
 }else if(kind==='supplierReturn'){
  if(!p||p.supplier!==data.supplier)fail('Choose the batch and its supplier.');
  if(qty>p.qty)fail('Returned units exceed stock on hand.');
  p.qty-=qty;
  db.returns.push({...record,type:'Supplier',supplier:data.supplier,reference:supplier(data.supplier),product:p.id,name:p.name,qty,amount:value});
 }else if(kind==='customerReturn'){
  if(!data.line)fail('Choose an invoice and batch.');
  const [saleId,id]=data.line.split('|'), sale=db.sales.find(s=>s.id===saleId), line=sale?.lines.find(l=>l.product===id), batch=product(id);
  if(!line||qty>returnable(sale,line))fail('Quantity exceeds the returnable units on this invoice.');
  const restock=data.restock==='yes';
  if(restock&&(!batch||batch.expiry<day))fail('This batch cannot be returned to sellable stock.');
  if(restock)batch.qty+=qty;
  db.returns.push({...record,type:'Customer',sale:sale.id,reference:sale.number,product:id,name:line.name,qty,amount:Math.round(line.price*line.qty/line.units*qty*100)/100,cost:restock?line.cost*qty:0});
 }else if(kind==='count'){
  if(!p)fail('Choose a medicine batch.');
  db.counts.push({...record,product:p.id,name:p.name,batch:p.batch,before:p.qty,qty});p.qty=qty;
 }else if(kind==='expense'){
  if(!data.description.trim())fail('Enter an expense description.');
  db.expenses.push({...record,description:data.description.trim(),amount:value});
 }else if(kind==='sale'){
  if(!cart.length)fail('Add a medicine first.');
  const lines=cart.map(item=>{
   const p=product(item.id), count=factor(p,item.unit), unitsSold=item.qty*count;
   if(!sellable(p)||unitsSold>p.qty)fail('Insufficient stock for '+p.name+' in batch '+p.batch+'.');
   const unit=item.unit==='unit'?(p.strip===1?'Unit':'Tablet'):item.unit==='strip'?'Strip':'Box';
   return {product:p.id,name:p.name,batch:p.batch,qty:item.qty,units:unitsSold,unit,price:p.price*count,cost:p.cost};
  });
  const sale={...record,number:'INV-'+db.next++,customer:data.customer.trim()||'Walk-in customer',method:data.method,lines,total:sum(lines,l=>l.price*l.qty),cost:sum(lines,l=>l.cost*l.units)};
  lines.forEach(l=>product(l.product).qty-=l.units);db.sales.push(sale);cart=[];
  return sale;
 }else if(kind==='restore'||kind==='previous'){
  const restored=kind==='restore'?pendingRestore:JSON.parse(localStorage.getItem(key+'-previous'));
  if(!valid(restored))fail('No valid backup is available.');
  db=restored;cart=[];ledger='';pendingRestore=null;
 }
}
document.addEventListener('click',event=>{
 const button=event.target.closest('button');
 if(!button)return;
 const d=button.dataset;
 if(d.page){page=d.page;query='';render();if(page==='Point of Sale')$('#search')?.focus();}
 if(d.form)openForm(d.form);
 if(d.add)addToCart(d.add);
 if(d.remove){cart=cart.filter(l=>l.id!==d.remove);render();}
 if(d.ledger){ledger=d.ledger;render();}
 if(d.close!==undefined)$('#modal').close();
 if(d.print!==undefined)window.print();
 if(d.receipt)receipt(db.sales.find(s=>s.id===d.receipt));
 if(d.export!==undefined){
  const a=document.createElement('a'), url=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:'application/json'}));
  a.href=url;a.download='medora-backup-'+day+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
});
document.addEventListener('input',event=>{
 if(event.target.id!=='search')return;
 query=event.target.value;
 $('#results').innerHTML=page==='Point of Sale'?posProducts():inventoryRows(filtered(page==='Alerts'?db.products.filter(p=>low(p)||near(p)):db.products));
});
document.addEventListener('keydown',event=>{
 if(page!=='Point of Sale'||event.target.id!=='search'||event.key!=='Enter')return;
 event.preventDefault();
 const batch=db.products.filter(p=>p.barcode===query.trim()&&sellable(p)).sort((a,b)=>a.expiry.localeCompare(b.expiry))[0];
 if(!batch){notify('No sellable batch found for that barcode.');return;}
 query='';addToCart(batch.id);
});
document.addEventListener('change',async event=>{
 const input=event.target;
 if(input.dataset.qty||input.dataset.unit){
  const line=cart.find(l=>l.id===(input.dataset.qty||input.dataset.unit));
  if(input.dataset.qty){line.qty=Math.max(1,Math.floor(Number(input.value)||1));input.value=line.qty;}
  else line.unit=input.value;
  $('#amount-'+line.id).textContent=money(lineAmount(line));
  $('#cart-total').textContent=money(sum(cart,lineAmount));
 }
 if(input.id==='report-mode'){report=input.value;render();}
 if(input.id==='restore-file'&&input.files.length){
  try {
   pendingRestore=JSON.parse(await input.files[0].text());
   if(!valid(pendingRestore))fail('Invalid backup');
   openForm('restore');
  }catch{notify('Choose a valid Medora backup file.');}
  input.value='';
 }
});
document.addEventListener('submit',event=>{
 if(event.target.id!=='entry')return;
 event.preventDefault();
 try{
  const sale=transact(event.target.dataset.kind,Object.fromEntries(new FormData(event.target)));
  $('#modal').close();render();notify('Records updated.');save();
  if(sale)receipt(sale);
 }catch(error){$('#error').textContent=error.message;}
});
$('#alert-button').innerHTML=icon('Alerts');
$('#today').textContent=new Date().toLocaleDateString('en-PK',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
render();
try {if(!localStorage.getItem(key))save();} catch {}

