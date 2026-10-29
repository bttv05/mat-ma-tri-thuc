// DỮ LIỆU MẪU – có thể thay bằng API và cơ sở dữ liệu sau này.
const products = [
  {id:1,name:'Bộ khám phá phân số – Lớp 4',price:129000,image:'01-ban-do-hanh-trinh.png',desc:'Bản đồ phiêu lưu, manh mối và các chặng khám phá.'},
  {id:2,name:'Bộ phong thư bí mật',price:89000,image:'02-phong-thu-manh-moi.png',desc:'Bộ phong thư manh mối theo từng chặng.'},
  {id:3,name:'Bộ kho báu tri thức',price:159000,image:'05-hop-kho-bau.png',desc:'Hộp kho báu dành cho hành trình học mà chơi.'}
];
const rewards = [
  {id:1,name:'Sticker khám phá',cost:2,image:'07-sticker-qua-tang.png'},
  {id:2,name:'Huy hiệu vàng',cost:3,image:'06-huy-hieu-vang.png'},
  {id:3,name:'Hộp quà bất ngờ',cost:5,image:'09-hop-qua.png'}
];
const stages = [
  {name:'Khu rừng bí số',desc:'Khởi động hành trình và khám phá bản đồ.'},
  {name:'Cây cầu tri thức',desc:'Vượt qua thử thách trên phiếu học tập.'},
  {name:'Hang động bí ẩn',desc:'Tìm những manh mối được cất giấu.'},
  {name:'Đỉnh núi thử thách',desc:'Tiến gần hơn đến chiếc rương kho báu.'},
  {name:'Kho báu cuối cùng',desc:'Hoàn thành hành trình khám phá.'}
];
const storageKey='matMaTriThucDemoV1';
const defaults={name:'Nhà thám hiểm nhỏ',grade:'Lớp 4',completed:0,badges:0,cart:[],orders:0,history:[]};
let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey))||{}}catch(e){}
let state={...defaults,...saved};
state.completed=Math.max(0,Math.min(5,Number(state.completed)||0));
state.badges=Math.max(0,Number(state.badges)||0);
if(!Array.isArray(state.cart))state.cart=[];
if(!Array.isArray(state.history))state.history=[];
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('vi-VN').format(n)+' đ';
function save(){localStorage.setItem(storageKey,JSON.stringify(state))}
let toastTimer;
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3200)}
function renderProfile(){
 $('display-name').textContent=state.name;
 $('display-grade').textContent=state.grade;
 $('badge-count').textContent=state.badges;
 $('completed-count').textContent=state.completed+'/5';
 $('orders-count').textContent=state.orders;
 $('progress-label').textContent=(state.completed*20)+'%';
 $('progress-fill').style.width=(state.completed*20)+'%';
}
function renderProducts(){
 $('product-list').innerHTML=products.map(p=>`<article class="product-card"><img src="images/${p.image}" alt="${p.name}" loading="lazy"><div class="card-body"><h3>${p.name}</h3><p>${p.desc}</p><span class="price">${money(p.price)}</span><button class="btn btn-blue" data-add="${p.id}" type="button">🛒 Thêm vào giỏ</button></div></article>`).join('');
}
function renderStages(){
 $('stage-list').innerHTML=stages.map((s,i)=>{
  const done=i<state.completed,current=i===state.completed,locked=i>state.completed;
  const label=done?'✓ Đã hoàn thành':locked?'🔒 Chưa mở':'⭐ Hoàn thành chặng';
  return `<article class="stage-card ${done?'done':current?'current':'locked'}"><div class="stage-number">${done?'🏅':locked?'🔒':['🌳','🌉','🕯️','⛰️','💎'][i]}</div><h3>Chặng ${i+1}: ${s.name}</h3><p>${s.desc}</p><button type="button" class="btn ${done?'btn-outline':'btn-gold'}" data-stage="${i}" ${!current?'disabled':''}>${label}</button></article>`;
 }).join('');
 $('finish-message').hidden=state.completed!==5;
}
function renderRewards(){
 $('reward-list').innerHTML=rewards.map(r=>`<article class="reward-card"><img src="images/${r.image}" alt="${r.name}" loading="lazy"><div class="card-body"><h3>${r.name}</h3><p>Đổi bằng huy hiệu tích lũy</p><span class="price">🏅 ${r.cost} huy hiệu</span><button class="btn btn-gold" data-reward="${r.id}" type="button" ${state.badges<r.cost?'disabled':''}>🎁 Đổi quà</button></div></article>`).join('');
 $('reward-history').innerHTML=state.history.length?state.history.map(h=>{const li=document.createElement('li');li.textContent=h;return li.outerHTML}).join(''):'<li>Chưa đổi quà nào.</li>';
}
function renderCart(){
 $('cart-count').textContent=state.cart.length;
 $('cart-items').innerHTML=state.cart.length?state.cart.map((id,i)=>{const p=products.find(x=>x.id===id);return p?`<div class="cart-item"><span>${p.name}<br><strong>${money(p.price)}</strong></span><button data-remove="${i}" aria-label="Xóa sản phẩm" type="button">✕</button></div>`:''}).join(''):'<p>Giỏ hàng đang trống.</p>';
 $('cart-total').textContent=money(state.cart.reduce((sum,id)=>sum+(products.find(p=>p.id===id)?.price||0),0));
 $('checkout').disabled=state.cart.length===0;
}
function render(){renderProfile();renderProducts();renderStages();renderRewards();renderCart()}
document.addEventListener('click',e=>{
 const add=e.target.closest('[data-add]');if(add){state.cart.push(Number(add.dataset.add));save();renderCart();toast('Đã thêm sản phẩm vào giỏ!');return}
 const remove=e.target.closest('[data-remove]');if(remove){state.cart.splice(Number(remove.dataset.remove),1);save();renderCart();return}
 const stage=e.target.closest('[data-stage]');if(stage){const i=Number(stage.dataset.stage);if(i!==state.completed)return;state.completed++;state.badges++;save();render();toast('Hoàn thành chặng! +1 huy hiệu 🏅');return}
 const reward=e.target.closest('[data-reward]');if(reward){const r=rewards.find(x=>x.id===Number(reward.dataset.reward));if(!r||state.badges<r.cost)return;if(!confirm(`Đổi ${r.cost} huy hiệu lấy ${r.name}?`))return;state.badges-=r.cost;state.history.unshift(`${r.name} – ${new Date().toLocaleDateString('vi-VN')}`);save();render();toast('Đã ghi nhận lượt đổi quà!');}
});
$('cart-toggle').addEventListener('click',()=>{$('cart-panel').hidden=!$('cart-panel').hidden});
$('cart-close').addEventListener('click',()=>{$('cart-panel').hidden=true});
$('checkout').addEventListener('click',()=>{if(!state.cart.length)return;if(!confirm('Ghi nhận đơn hàng? Đây chỉ là thao tác lưu trên thiết bị, chưa có thanh toán hoặc giao hàng.'))return;state.orders++;state.cart=[];save();render();$('cart-panel').hidden=true;toast('Đã lưu đơn hàng trên thiết bị!')});
$('edit-profile').addEventListener('click',()=>{$('player-name').value=state.name;$('player-grade').value=state.grade;$('profile-dialog').showModal()});
$('cancel-profile').addEventListener('click',()=>{$('profile-dialog').close()});
$('profile-form').addEventListener('submit',e=>{e.preventDefault();state.name=$('player-name').value.trim().slice(0,30)||defaults.name;state.grade=$('player-grade').value;save();renderProfile();$('profile-dialog').close();toast('Đã lưu thông tin!')});
render();

// Điều hướng như các trang riêng: chỉ hiện mục được chọn trên thanh menu.
const pageIds = ['trang-chu','ca-nhan','san-pham','chang','doi-thuong'];
function showPage() {
  const requested = decodeURIComponent(location.hash.slice(1));
  const active = pageIds.includes(requested) ? requested : 'trang-chu';
  pageIds.forEach(id => { $(id).hidden = id !== active; });
  document.querySelectorAll('.site-header nav a').forEach(link => {
    const selected = link.getAttribute('href') === '#' + active;
    link.classList.toggle('active', selected);
    if (selected) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  $('cart-panel').hidden = true;
  window.scrollTo({top:0,behavior:'instant'});
}
window.addEventListener('hashchange', showPage);
showPage();

// Chơi lại: giữ tên, lớp, giỏ hàng và đơn mua; xóa tiến độ, huy hiệu, lịch sử đổi quà.
$('reset-progress').addEventListener('click', () => {
  if (!confirm('Bạn muốn chơi lại từ đầu? 5 chặng, huy hiệu và lịch sử đổi quà sẽ được đặt lại.')) return;
  state.completed = 0;
  state.badges = 0;
  state.history = [];
  save();
  render();
  toast('Đã đặt lại hành trình!');
});
