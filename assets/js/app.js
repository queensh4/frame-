// Frame+ Storefront — modern JS with localStorage cart & slider
const PRODUCTS = [
  { id: 'fp-silver', name: 'Frame+ Silver Matte', price: 249000, img: 'silver-case.svg' },
  { id: 'fp-graphite', name: 'Frame+ Graphite Frost', price: 259000, img: 'graphite-case.svg' },
  { id: 'fp-clear', name: 'Frame+ Clear Edge', price: 199000, img: 'clear-case.svg' },
  { id: 'fp-smoke', name: 'Frame+ Smoke Shield', price: 239000, img: 'smoke-case.svg' },
  { id: 'fp-gunmetal', name: 'Frame+ Gunmetal Pro', price: 279000, img: 'gunmetal-case.svg' },
];

const BEST_IDS = ['fp-silver','fp-graphite','fp-gunmetal','fp-clear','fp-smoke']; // max 5

const currency = n => new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 }).format(n);

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

/* Year */
$('#year').textContent = new Date().getFullYear();

/* Render Products */
const productsGrid = $('#productsGrid');
function renderProducts(){
  const html = PRODUCTS.map(p => `
    <div class="card product-card">
      <div class="thumb">
        <img src="assets/img/${p.img}" alt="${p.name}"/>
      </div>
      <h3>${p.name}</h3>
      <div class="price">${currency(p.price)}</div>
      <div class="actions">
        <div class="qty">
          <button aria-label="Kurangi" data-action="dec">–</button>
          <input type="number" min="1" value="1" aria-label="Jumlah">
          <button aria-label="Tambah" data-action="inc">+</button>
        </div>
        <button class="btn-primary add-to-cart" data-id="${p.id}">Tambah</button>
      </div>
    </div>
  `).join('');
  productsGrid.innerHTML = html;

  // qty controls
  productsGrid.addEventListener('click', e => {
    if(e.target.dataset.action === 'inc' || e.target.dataset.action === 'dec'){
      const input = e.target.closest('.qty').querySelector('input');
      const val = parseInt(input.value||1,10);
      input.value = e.target.dataset.action === 'inc' ? val+1 : Math.max(1, val-1);
    }
  });
  // add to cart
  productsGrid.addEventListener('click', e => {
    const btn = e.target.closest('.add-to-cart');
    if(!btn) return;
    const id = btn.dataset.id;
    const qty = parseInt(btn.closest('.product-card').querySelector('input').value,10);
    addToCart(id, qty);
    openCart();
    // playful hop animation to cart
    btn.animate([{ transform: 'translateY(0)'}, { transform:'translateY(-6px)'}, { transform:'translateY(0)'}], { duration: 300, easing: 'ease-out'});
  });
}
renderProducts();

/* Slider (Bestsellers) */
const slidesEl = $('#slides');
const dotsEl = $('#sliderDots');
let currentSlide = 0;
const SLIDE_W = 296; // approx including margin

function renderSlider(){
  const items = PRODUCTS.filter(p => BEST_IDS.includes(p.id)).slice(0,5);
  slidesEl.innerHTML = items.map(p => `
    <div class="card product-card slide">
      <div class="thumb">
        <img src="assets/img/${p.img}" alt="${p.name}"/>
      </div>
      <h3>${p.name}</h3>
      <div class="price">${currency(p.price)}</div>
      <button class="btn-outline add-to-cart" data-id="${p.id}">Tambah ke Keranjang</button>
    </div>
  `).join('');
  dotsEl.innerHTML = items.map((_,i)=>`<button data-i="${i}" class="${i===0?'active':''}"></button>`).join('');
}
renderSlider();

$('#nextSlide').addEventListener('click', ()=> moveSlide(1));
$('#prevSlide').addEventListener('click', ()=> moveSlide(-1));
dotsEl.addEventListener('click', e => {
  if(e.target.tagName !== 'BUTTON') return;
  goToSlide(parseInt(e.target.dataset.i,10));
});

function moveSlide(dir){
  const count = dotsEl.children.length;
  currentSlide = (currentSlide + dir + count) % count;
  updateSlider();
}
function goToSlide(i){ currentSlide = i; updateSlider(); }
function updateSlider(){
  slidesEl.style.transform = `translateX(${-currentSlide * SLIDE_W}px)`;
  [...dotsEl.children].forEach((d,i)=>d.classList.toggle('active', i===currentSlide));
}
updateSlider();

/* Cart with localStorage */
const CART_KEY = 'frameplus_cart';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function getProduct(id){ return PRODUCTS.find(p=>p.id===id); }
function cartCount(){ return cart.reduce((a,i)=>a+i.qty,0); }
function cartTotal(){ return cart.reduce((a,i)=>a+(getProduct(i.id).price*i.qty),0); }

function renderCart(){
  $('#cartCount').textContent = cartCount();
  $('#cartTotal').textContent = currency(cartTotal());
  const items = cart.map(item=>{
    const p = getProduct(item.id);
    return `
      <div class="cart-item">
        <img src="assets/img/${p.img}" alt="${p.name}"/>
        <div>
          <div style="font-weight:600">${p.name}</div>
          <div class="price">${currency(p.price)}</div>
          <div class="qty" style="margin-top:6px">
            <button data-id="${p.id}" data-action="dec">–</button>
            <input readonly value="${item.qty}"/>
            <button data-id="${p.id}" data-action="inc">+</button>
          </div>
        </div>
        <button class="icon-btn" data-id="${p.id}" data-action="remove">Hapus</button>
      </div>
    `;
  }).join('');
  $('#cartItems').innerHTML = items || '<p>Keranjang kosong.</p>';
}
function addToCart(id, qty=1){
  const idx = cart.findIndex(i=>i.id===id);
  if(idx>-1){ cart[idx].qty += qty; } else { cart.push({id, qty}); }
  saveCart(); renderCart();
}
function updateQty(id, delta){
  const idx = cart.findIndex(i=>i.id===id);
  if(idx>-1){ cart[idx].qty = Math.max(1, cart[idx].qty+delta); }
  saveCart(); renderCart();
}
function removeItem(id){
  cart = cart.filter(i=>i.id!==id);
  saveCart(); renderCart();
}

$('#cartItems').addEventListener('click', e=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if(action==='inc') updateQty(id, 1);
  if(action==='dec') updateQty(id, -1);
  if(action==='remove') removeItem(id);
});

/* Drawer controls */
const drawer = $('#cartDrawer');
const backdrop = $('#backdrop');
function openCart(){ drawer.classList.add('open'); backdrop.classList.add('show'); drawer.setAttribute('aria-hidden','false'); }
function closeCart(){ drawer.classList.remove('open'); backdrop.classList.remove('show'); drawer.setAttribute('aria-hidden','true'); }
$('#openCartBtn').addEventListener('click', openCart);
$('#closeCartBtn').addEventListener('click', closeCart);
backdrop.addEventListener('click', ()=>{ closeCart(); closeCheckout(); });

/* Checkout Modal with Game-like Progress */
const checkoutModal = $('#checkoutModal');
const progressFill = $('#progressFill');
const steps = $$('#progressSteps .step');
let stepIndex = 0;

const STEP_VIEWS = [
`<div class="field"><label>Nama Penerima</label><input placeholder="Nama Lengkap" required></div>
 <div class="row">
   <div class="field"><label>No. HP</label><input placeholder="08xxxxxxxxxx" required></div>
   <div class="field"><label>Kode Pos</label><input placeholder="12345" required></div>
 </div>
 <div class="field"><label>Alamat</label><textarea rows="3" placeholder="Alamat lengkap..." required></textarea></div>`,
`<div class="field"><label>Kurir</label>
  <select><option>REG (2-4 hari)</option><option>EXPRESS (1-2 hari)</option></select>
 </div>
 <div class="field"><label>Catatan</label><input placeholder="Catatan untuk kurir (opsional)"></div>`,
`<div class="field"><label>Metode</label>
  <select><option>Transfer Bank</option><option>Virtual Account</option><option>QRIS</option><option>COD</option></select>
 </div>`,
`<div><strong>Ringkasan</strong></div>
 <div id="reviewList"></div>
 <div class="checkout-summary"><span>Total</span><strong id="reviewTotal"></strong></div>`
];

function renderStep(){
  $('#checkoutBody').innerHTML = STEP_VIEWS[stepIndex];
  steps.forEach((s,i)=> s.classList.toggle('active', i<=stepIndex));
  progressFill.style.width = ((stepIndex)/(steps.length-1))*100 + '%';
  if(stepIndex===steps.length-1){
    // fill review
    const list = cart.map(i=>{
      const p = getProduct(i.id);
      return `<div style="display:flex; justify-content:space-between; gap:12px; border-bottom:1px dashed var(--line); padding:6px 0">
        <span>${p.name} × ${i.qty}</span><span>${currency(p.price*i.qty)}</span></div>`;
    }).join('') || '<p>Tidak ada item.</p>';
    $('#reviewList').innerHTML = list;
    $('#reviewTotal').textContent = currency(cartTotal());
    $('#nextStep').textContent = 'Bayar Sekarang';
  } else {
    $('#nextStep').textContent = 'Lanjut';
  }
  $('#prevStep').style.visibility = stepIndex===0 ? 'hidden':'visible';
}

function openCheckout(){
  checkoutModal.classList.add('show');
  checkoutModal.setAttribute('aria-hidden','false');
  stepIndex = 0;
  renderStep();
}
function closeCheckout(){
  checkoutModal.classList.remove('show');
  checkoutModal.setAttribute('aria-hidden','true');
}
$('#checkoutBtn').addEventListener('click', openCheckout);
$('#drawerCheckoutBtn').addEventListener('click', ()=>{ closeCart(); openCheckout(); });
$('#closeCheckout').addEventListener('click', closeCheckout);
$('#nextStep').addEventListener('click', ()=>{
  if(stepIndex < steps.length-1){
    stepIndex++;
    renderStep();
    // confetti-like progress pulse (game feel)
    progressFill.animate([{ transform:'scaleX(1)'},{ transform:'scaleX(1.02)'},{ transform:'scaleX(1)'}], { duration: 260, easing:'ease-out'});
  }else{
    // mock payment success
    alert('Pembayaran berhasil! Terima kasih telah belanja di Frame+');
    cart = []; saveCart(); renderCart(); closeCheckout();
  }
});
$('#prevStep').addEventListener('click', ()=>{ stepIndex=Math.max(0, stepIndex-1); renderStep(); });

/* Testimonials (with localStorage) */
const T_KEY='frameplus_testi';
let testimonials = JSON.parse(localStorage.getItem(T_KEY) || '[]');
if(testimonials.length===0){
  testimonials = [
    {name:'Vina', rating:5, message:'Build quality mewah, tipis tapi kokoh. Worth it!'},
    {name:'Raka', rating:5, message:'Finishing silver-nya cakep, cocok sama iPhone graphite.'},
    {name:'Nadia', rating:4, message:'Grip nyaman, magnet MagSafe nempel kuat.'}
  ];
  localStorage.setItem(T_KEY, JSON.stringify(testimonials));
}
function renderTestimonials(){
  const html = testimonials.map(t=>`
    <div class="testimonial">
      <div class="stars">${'★'.repeat(t.rating)}${'☆'.repeat(5-t.rating)}</div>
      <p style="margin:8px 0 6px">${t.message}</p>
      <small style="color:var(--muted)">— ${t.name}</small>
    </div>
  `).join('');
  $('#testimonialsList').innerHTML = html;
}
renderTestimonials();

$('#testimonialForm').addEventListener('submit', e=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  testimonials.unshift({ name:data.name||'Anonim', rating:parseInt(data.rating,10), message:data.message });
  localStorage.setItem(T_KEY, JSON.stringify(testimonials));
  renderTestimonials();
  e.target.reset();
  e.target.querySelector('input[name="name"]').focus();
});

/* Feedback form (mock) */
$('#feedbackForm').addEventListener('submit', e=>{
  e.preventDefault();
  $('#feedbackNote').textContent = 'Terima kasih! Masukan Anda sudah kami terima.';
  e.target.reset();
  setTimeout(()=> $('#feedbackNote').textContent = '', 4000);
});

/* Initial render */
renderCart();
