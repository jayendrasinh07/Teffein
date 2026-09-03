const {readFileSync}=require('node:fs');
const {stripTypeScriptTypes}=require('node:module');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
function moduleSource(file,names,mocks={}){
  const source=readFileSync(`src/services/${file}.ts`,'utf8').replace(/import[\s\S]*?from ['"][^'"]+['"];?/g,'').replace(/export /g,'');
  return vm.runInNewContext(stripTypeScriptTypes(source)+`\n;({${names}})`,{Intl,Date,Map,Promise,Object,Number,Error,TextEncoder,crypto:webcrypto,...mocks});
}
const availability=moduleSource('availabilityEngine','checkMealAvailability,istDate,getOrderableDates');
assert.equal(availability.istDate(new Date('2026-09-03T19:00:00Z')),'2026-09-04');
for(const [mealSlot,instant,expected] of [
  ['lunch','04:59:59',true],['lunch','05:00:00',false],['dinner','11:59:59',true],['dinner','12:00:00',false]]){
  assert.equal(availability.checkMealAvailability({date:'2026-09-03',mealSlot,currentTime:new Date(`2026-09-03T${instant}Z`)}).isAvailable,expected);
}
assert.equal(availability.checkMealAvailability({date:'2026-09-02',mealSlot:'lunch',currentTime:new Date('2026-09-03T01:00:00Z')}).isAvailable,false);
const menu=moduleSource('menuService','mapDeliverySlot,dietLabel');
const slot=menu.mapDeliverySlot({id:'slot',meal_type:'dinner',start_time:'19:30:00',end_time:'20:15:00',max_orders:200,booked_portions:199});
assert.equal(slot.maxCapacity-slot.bookedCount,1);assert.equal(slot.windowLabel,'7:30 PM – 8:15 PM');
const {mapAddress}=moduleSource('addressService','mapAddress');
const row={id:'order',order_number:'TEF-test',user_id:'customer',order_date:'2026-09-04',meal_type:'lunch',status:'confirmed',payment_status:'pending',subtotal:200,customization_total:15,delivery_fee:25,discount:0,grand_total:240,notes:'Less salt',address_snapshot:{id:'addr',recipient_name:'A',recipient_phone:'0000000000',area:'Vavol',formatted_address:'House 7, Vavol',slotLabel:'12:00 – 12:45',deliveryFee:25},order_items:[{meal_id:'meal',meal_name_snapshot:'Thali',quantity:2,preparation_preferences:{spiceLevel:'Less Spicy',oilLevel:'Standard',dietType:'jain_satvik'},order_customizations:[{id:'extra',customization_name_snapshot:'Roti',quantity:1,unit_price:15}]}]};
const storage=new Map();let calls=[];let fail=true;
const {orderService,toCustomerOrder}=moduleSource('orderService','orderService,toCustomerOrder',{
  mapAddress,dietLabel:menu.dietLabel,
  sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
  getSupabaseClient:()=>({rpc:async(name,args)=>{calls.push(args);await new Promise(resolve=>setTimeout(resolve,10));return fail?{data:null,error:new Error('Connection lost')}:{data:row,error:null};}}),
});
const mapped=toCustomerOrder(row);assert.equal(mapped.total,240);assert.equal(mapped.paymentStatus,'PENDING');assert.equal(mapped.notes,'Less salt');assert.equal(mapped.customizations.dietVariant,'Jain Satvik');assert.equal(mapped.address.addressLine,'House 7, Vavol');
assert.throws(()=>toCustomerOrder({id:'incomplete'}));
(async()=>{
  const payload={userId:'customer',addressId:'addr',orderDate:'2026-09-04',mealType:'lunch',deliverySlotId:'slot',mealId:'meal',quantity:2,selectedAddons:{extra:1},notes:'Less salt',preferences:{spiceLevel:'Less Spicy',oilLevel:'Standard'}};
  const first=await Promise.all([orderService.createOrder(payload),orderService.createOrder(payload)]);
  assert.equal(calls.length,1);assert.ok(first.every(r=>r.error&&!r.order));assert.equal(storage.size,1);
  fail=false;const retry=await orderService.createOrder(payload);
  assert.equal(retry.order.id,'order');assert.equal(calls[0].p_idempotency_key,calls[1].p_idempotency_key);assert.equal(calls[1].p_notes,'Less salt');assert.equal(calls[1].p_meal_id,'meal');assert.equal(calls[1].p_customizations[0].quantity,1);assert.equal(storage.size,0);
  const context=readFileSync('src/context/AppContext.tsx','utf8');
  const handler=context.slice(context.indexOf('  const createOneTimeOrder ='),context.indexOf('  const reorderMeal ='));
  let resolveOrder;let storedOrders=[];let tracking=null;let toasts=0;
  const identity={current:'customer'};
  const place=vm.runInNewContext(stripTypeScriptTypes(handler)+';createOneTimeOrder',{
    currentUser:{id:'customer'},authIdentity:identity,
    orderService:{createOrder:()=>new Promise(resolve=>{resolveOrder=resolve;})},
    setOneTimeOrders:update=>{storedOrders=update(storedOrders);},setActiveTrackingOrder:o=>{tracking=o;},showToast:()=>{toasts++;}
  });
  const draft={...mapped,address:{id:'addr'},addOns:[{id:'extra',quantity:1}],customizations:{spiceLevel:'Less Spicy',oilLevel:'Standard'}};
  let active=place(draft);assert.equal(storedOrders.length,0);assert.equal(toasts,0);resolveOrder({order:null,error:new Error('Database unavailable')});await assert.rejects(active,/Database unavailable/);assert.equal(storedOrders.length,0);assert.equal(tracking,null);
  active=place(draft);resolveOrder({order:mapped,error:null});await active;assert.equal(storedOrders.length,1);assert.equal(toasts,1);assert.equal(tracking.id,'order');
  active=place(draft);identity.current='another-customer';resolveOrder({order:mapped,error:null});await assert.rejects(active,/account changed/);assert.equal(storedOrders.length,1);assert.equal(toasts,1);
  console.log('PASS: IST cutoff, portion adapter, server snapshots, failed checkout, duplicate clicks and uncertain retry');
  console.log('PASS: checkout confirmation waits for persistence; rejection and account switch do not publish success');
})().catch(error=>{console.error(error);process.exitCode=1;});
