/* AURÉLIA demo interactions */
(function(){
  "use strict";

  /* ---------- announcement rotator ---------- */
  var msgs = [
    "Quality Stainless Steel Jewellery • Wholesale & Retail",
    "📍 ቦሌ አለምነሽ plaza 3F & 📍 22 Town square mall 1F",
    "🤳 Call or Order: 0930535654 • Telegram: @mercyjewlery"
  ];
  var msgEl = document.getElementById("announceMsg");
  var pauseBtn = document.getElementById("announcePause");
  var mi = 0, paused = false, timer = null;
  function rotate(){
    if (paused) return;
    mi = (mi + 1) % msgs.length;
    msgEl.style.opacity = 0;
    setTimeout(function(){
      msgEl.textContent = msgs[mi];
      msgEl.style.opacity = 1;
    }, 250);
  }
  msgEl.style.transition = "opacity .25s";
  timer = setInterval(rotate, 4200);
  pauseBtn.addEventListener("click", function(){
    paused = !paused;
    pauseBtn.style.opacity = paused ? 1 : .7;
    toast(paused ? "Announcements paused" : "Announcements resumed");
  });

  /* ---------- sticky condense ---------- */
  var header = document.getElementById("siteHeader");
  window.addEventListener("scroll", function(){
    header.classList.toggle("condensed", window.scrollY > 140);
  }, {passive:true});

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById("burger");
  var mobileNav = document.getElementById("mobileNav");
  burger.addEventListener("click", function(){
    mobileNav.classList.toggle("open");
  });
  mobileNav.querySelectorAll("a").forEach(function(a){
    a.addEventListener("click", function(){ mobileNav.classList.remove("open"); });
  });

  /* ---------- carousel arrows ---------- */
  var car = document.getElementById("carousel");
  function step(){ 
    var card = car.querySelector(".card");
    return card ? card.offsetWidth + 28 : 320;
  }
  document.getElementById("carPrev").addEventListener("click", function(){
    car.scrollBy({left: -step() * 2, behavior: "smooth"});
  });
  document.getElementById("carNext").addEventListener("click", function(){
    car.scrollBy({left: step() * 2, behavior: "smooth"});
  });

  /* ---------- wishlist ---------- */
  var wishCount = document.getElementById("wishCount");
  var wishes = new Set();
  function renderWish(){
    wishCount.hidden = wishes.size === 0;
    wishCount.textContent = wishes.size;
  }
  document.querySelectorAll(".wish").forEach(function(btn){
    btn.addEventListener("click", function(e){
      e.stopPropagation();
      var card = btn.closest(".card");
      var id = card.dataset.id;
      if (wishes.has(id)) { wishes.delete(id); btn.classList.remove("active"); }
      else {
        wishes.add(id); btn.classList.add("active");
        toast("Saved to your wishlist");
      }
      renderWish();
    });
  });

  /* ---------- bag ---------- */
  var bag = []; // {id,name,price,img}
  var drawer = document.getElementById("bagDrawer");
  var veil = document.getElementById("drawerVeil");
  var bagCount = document.getElementById("bagCount");
  var drawerCount = document.getElementById("drawerCount");
  var drawerItems = document.getElementById("drawerItems");
  var drawerTotal = document.getElementById("drawerTotal");

  function fmt(n){ return "Br " + n.toLocaleString("en-US"); }

  function renderBag(){
    var n = bag.length;
    bagCount.hidden = n === 0;
    bagCount.textContent = n;
    drawerCount.textContent = "(" + n + ")";
    if (!n){
      drawerItems.innerHTML = '<p class="drawer-empty">Your bag is empty.</p>';
    } else {
      drawerItems.innerHTML = bag.map(function(it, i){
        return '<div class="drawer-item">' +
          '<img src="' + it.img + '" alt="">' +
          '<div class="di-info"><h4>' + it.name + '</h4>' +
          '<p class="di-price">' + fmt(it.price) + '</p>' +
          '<button class="di-remove" data-i="' + i + '">Remove</button></div></div>';
      }).join("");
      drawerItems.querySelectorAll(".di-remove").forEach(function(b){
        b.addEventListener("click", function(){
          bag.splice(parseInt(b.dataset.i, 10), 1);
          renderBag();
        });
      });
    }
    drawerTotal.textContent = fmt(bag.reduce(function(s, it){ return s + it.price; }, 0));
  }

  function openDrawer(){ drawer.classList.add("open"); veil.classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeDrawer(){ drawer.classList.remove("open"); veil.classList.remove("open"); document.body.style.overflow = ""; }

  document.getElementById("bagBtn").addEventListener("click", openDrawer);
  document.getElementById("drawerClose").addEventListener("click", closeDrawer);
  veil.addEventListener("click", closeDrawer);

  document.querySelectorAll(".quickadd").forEach(function(btn){
    btn.addEventListener("click", function(e){
      e.stopPropagation();
      var card = btn.closest(".card");
      bag.push({
        id: card.dataset.id,
        name: card.dataset.name,
        price: parseInt(card.dataset.price, 10),
        img: card.querySelector(".card-media img").src
      });
      renderBag();
      toast(card.dataset.name + " added to your bag");
    });
  });

  document.getElementById("checkoutBtn").addEventListener("click", function(){
    if (!bag.length){ toast("Your bag is empty"); return; }
    toast("Order registered — we will contact you at 0930535654");
  });

  /* ---------- newsletter ---------- */
  document.getElementById("newsForm").addEventListener("submit", function(e){
    e.preventDefault();
    var input = document.getElementById("newsEmail");
    if (!input.value || input.value.indexOf("@") < 0){ toast("Please enter a valid email"); return; }
    document.getElementById("newsForm").style.display = "none";
    document.getElementById("newsDone").hidden = false;
    toast("Subscribed — welcome to Mercy Jewelry");
  });

  /* ---------- toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastT = null;
  function toast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function(){ toastEl.classList.remove("show"); }, 2400);
  }

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, {threshold: .12});
  document.querySelectorAll(".reveal").forEach(function(el){ io.observe(el); });
  // cards & tiles get a staggered reveal
  document.querySelectorAll(".card, .cat-tile, .service").forEach(function(el){
    el.classList.add("reveal"); io.observe(el);
  });

  renderBag();
})();
