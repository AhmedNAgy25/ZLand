(function () {
  function toArabicNumber(num) {
    return String(num).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
  }
  function getSizeLabel(size) {
    if (size === "large") return "1 لتر";
    if (size === "small") return "0.25 لتر";
    return "";
  }
  function truncate(text, max = 80) {
    if (!text) return "";
    return text.length > max ? text.slice(0, max) + "..." : text;
  }
  function getImageSrc(product) {
    const name = (product["الاسم"] || "").trim();
    const size = (product["size"] || "").trim();
    if (size && size !== "unknown") {
      return `productImge/${name} ${size}.jpg`;
    }
    return `productImge/${name}.jpg`;
  }

  const currentOfferPercent = 10; 
  function getDiscountedPrice(price) {
    return Math.round(price * (1 - currentOfferPercent / 100));
  }

  function ensureModal() {
    if (!document.getElementById("productModal")) {
      const modalHTML = `
        <div class="modal fade" id="productModal" tabindex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="productModalLabel"></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-md-4">
                    <img id="modalProductImg" src="assets/product.png" class="img-fluid rounded" alt="Product Image" />
                  </div>
                  <div class="col-md-8">
                    <div id="modalContent"></div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                <a href="contact.html" class="btn btn-success">اطلب الآن</a>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", modalHTML);
    }
  }
  function showProductDetails(product) {
    ensureModal();
    const modal = new bootstrap.Modal(document.getElementById("productModal"));
    const modalTitle = document.getElementById("productModalLabel");
    const modalContent = document.getElementById("modalContent");
    const modalImg = document.getElementById("modalProductImg");
    modalTitle.textContent = `${product["الاسم"] || "منتج"} - ${getSizeLabel(
      product.size
    )}`;
    modalContent.innerHTML = `
      <h6 class="text-muted mb-3">${product["خصائص المنتج وفائده"] || ""}</h6>
      <div class="mb-3"><strong>التصنيف:</strong> ${
        product["تصنيف المنتج"] || ""
      }</div>
      <div class="mb-3"><strong>الاستخدامات:</strong><p>${
        product["أستخدماته"] || ""
      }</p></div>
      <div class="mb-3"><strong>المكونات:</strong><p>${
        product["المكونات"] || ""
      }</p></div>
      <div class="mb-3"><strong>طريقة الاستخدام:</strong><p>${
        product["طريقة الاستخدام"] || ""
      }</p></div>
      <div class="mb-3"><strong>طريقة التخزين:</strong><p>${
        product["طريقة التخزين"] || ""
      }</p></div>
      <div class="mb-3"><strong>فترة الصلاحية:</strong><p>${
        product["فترة الصلاحية"] || ""
      }</p></div>
      <div class="mt-4">
        <h3 lang="ar" style="color: var(--Primary);">
          ${
            currentOfferPercent > 0
              ? `<span style='color:#888;text-decoration:line-through;font-size:0.8em;margin-left:8px;'>${toArabicNumber(
                  product.price
                )}</span>`
              : ""
          }
          ${toArabicNumber(getDiscountedPrice(product.price))}<span> ج.م</span>
          ${
            currentOfferPercent > 0
              ? `<span class='badge bg-danger ms-2' style='font-size:0.7em;'>خصم ${currentOfferPercent}%</span>`
              : ""
          }
        </h3>
      </div>
    `;
    modalImg.src = getImageSrc(product);
    modalImg.onerror = function () {
      this.src = "assets/product.png";
    };
    const modalFooter = document.querySelector("#productModal .modal-footer");
    if (modalFooter) {
      modalFooter.innerHTML = `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
        <button type="button" id="modalAddToCartBtn" class="btn btn-warning">أضف للسلة</button>
        <a href="contact.html" class="btn btn-success">اطلب الآن</a>
      `;
      document.getElementById("modalAddToCartBtn").onclick = function () {
        addToCart(product);
        modal.hide();
      };
    }
    modal.show();
  }
  window.showProductDetails = showProductDetails;

  const CART_KEY = "zland_cart";
  function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  function addToCart(product) {
    let cart = getCart();
    const idx = cart.findIndex(
      (item) => item["الاسم"] === product["الاسم"] && item.size === product.size
    );
    if (idx > -1) {
      cart[idx].qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    saveCart(cart);
    updateCartUI();
  }
  function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartUI();
  }
  function updateCartUI() {
    const cart = getCart();
    const cartCount = document.getElementById("cart-count");
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    if (cartCount)
      cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartItems) {
      cartItems.innerHTML =
        cart.length === 0
          ? '<li class="list-group-item">سلة المشتريات فارغة</li>'
          : "";
      cart.forEach((item, idx) => {
        cartItems.innerHTML += `<li class="list-group-item d-flex justify-content-between align-items-center">
          <span>
            <span dir="ltr" style="unicode-bidi: embed;">${item["الاسم"]}</span>
            <span dir="rtl" style="unicode-bidi: embed;">${getSizeLabel(
              item.size
            )}</span>
            ×
            <span dir="rtl" style="unicode-bidi: embed;">${toArabicNumber(
              item.qty
            )}</span>
          </span>
          <span>${toArabicNumber(
            getDiscountedPrice(item.price) * item.qty
          )} ج.م</span>
          <button class="btn btn-sm btn-danger ms-2" onclick="removeFromCart(${idx})">حذف</button>
        </li>`;
      });
    }
    if (cartTotal)
      cartTotal.textContent = toArabicNumber(
        cart.reduce(
          (sum, item) => sum + getDiscountedPrice(item.price) * item.qty,
          0
        )
      );
  }
  window.removeFromCart = removeFromCart;
  window.addToCart = addToCart;
  
  function checkoutCart() {
    const cart = getCart();
    if (cart.length === 0) return;
    let msg = "أرغب في شراء المنتجات التالية:%0A";
    cart.forEach((item) => {
      msg += `- ${item["الاسم"]} ${getSizeLabel(item.size)} × ${item.qty} = ${
        getDiscountedPrice(item.price) * item.qty
      } ج.م%0A`;
    });
    const total = cart.reduce(
      (sum, item) => sum + getDiscountedPrice(item.price) * item.qty,
      0
    );
    msg += `%0Aالإجمالي: ${total} ج.م`;
    const phone = "201021944642";
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    saveCart([]);
    updateCartUI();
  }
  document.addEventListener("DOMContentLoaded", () => {
    updateCartUI();
    const checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) checkoutBtn.onclick = checkoutCart;
  });

  function renderCard(product, { showReadMore = true } = {}) {
    return `
      <div class="card h-100 shadow w-100" style="min-height: 420px; display: flex; flex-direction: column;">
        <img src="${getImageSrc(product)}" class="card-img-top" alt="${
      product["الاسم"] || "منتج"
    }"
          style="object-fit: contain; height: 180px; background: #f8f8f8; cursor: pointer;"
          onerror="this.src='assets/product.png'"
          onclick="showProductDetails(${JSON.stringify(product).replace(
            /\"/g,
            "&quot;"
          )})" />
        <div class="card-body d-flex flex-column" style="flex: 1 1 auto; min-height: 200px;">
          <div style="margin-bottom: 0.5rem;">
            <span class="card-title" style="display:block;font-size:1.35rem;font-weight:800;color:var(--Primary);line-height:1.2;">
              ${
                product["الاسم"] || ""
              } <span style="font-size:0.8em;color:#888;">${getSizeLabel(
      product.size
    )}</span>
            </span>
            <span class="card-category" style="display:block;font-size:1rem;font-weight:500;color:#4e6e4e;opacity:0.85;margin-top:0.15em;">
              ${product["تصنيف المنتج"] || ""}
            </span>
          </div>
          <h6 class="card-subtitle mb-2 text-muted">${truncate(
            product["خصائص المنتج وفائده"],
            60
          )}</h6>
          <p class="card-text mb-1" style="font-size:0.95em;">${truncate(
            product["أستخدماته"],
            50
          )}</p>
          <p class="card-text mb-1" style="font-size:0.95em;">${truncate(
            product["المكونات"],
            50
          )}</p>
          <p class="card-text mb-1" style="font-size:0.95em;">${truncate(
            product["طريقة الاستخدام"],
            50
          )}</p>
          <p class="card-text mb-1" style="font-size:0.95em;">${truncate(
            product["طريقة التخزين"],
            50
          )}</p>
          <p class="card-text mb-1" style="font-size:0.95em;">${truncate(
            product["فترة الصلاحية"],
            40
          )}</p>
          <div class="mt-auto d-flex flex-column align-items-end justify-content-end" style="margin-top: auto;">
            <h3 lang="ar" class="mt-2 mb-2" style="font-size: 1.5em; color: var(--Primary);">
              ${
                currentOfferPercent > 0
                  ? `<span style='color:#888;text-decoration:line-through;font-size:0.8em;margin-left:8px;'>${toArabicNumber(
                      product.price
                    )}</span>`
                  : ""
              }
              ${toArabicNumber(
                getDiscountedPrice(product.price)
              )}<span> ج.م</span>
              ${
                currentOfferPercent > 0
                  ? `<span class='badge bg-danger ms-2' style='font-size:0.7em;'>خصم ${currentOfferPercent}%</span>`
                  : ""
              }
            </h3>
            <div class="d-flex gap-2 w-100">
              ${
                showReadMore
                  ? `<button class="btn btn-outline-primary flex-fill" onclick="showProductDetails(${JSON.stringify(
                      product
                    ).replace(/\"/g, "&quot;")})">اقرأ المزيد</button>`
                  : ""
              }
              <button class="btn btn-warning flex-fill" onclick='addToCart(${JSON.stringify(
                product
              )})'>أضف للسلة</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const res = await fetch("items.json");
      const products = await res.json();

  
      const homeContainer = document.getElementById("index-products-container");
      if (homeContainer) {
        homeContainer.innerHTML = "";
        const sampleProducts = products.slice(0, 3);
        sampleProducts.forEach((product) => {
          const col = document.createElement("div");
          col.className =
            "col-12 col-md-6 col-lg-4 mb-4 d-flex align-items-stretch";
          col.innerHTML = renderCard(product);
          homeContainer.appendChild(col);
        });
      }

  
      const shopContainer = document.getElementById("products-container");
      if (shopContainer) {
        shopContainer.innerHTML = "";
        products.forEach((product) => {
          const col = document.createElement("div");
          col.className =
            "col-12 col-md-6 col-lg-4 mb-4 d-flex align-items-stretch";
          col.innerHTML = renderCard(product);
          shopContainer.appendChild(col);
        });
      }
    } catch (err) {
      const homeContainer = document.getElementById("index-products-container");
      const shopContainer = document.getElementById("products-container");
      if (homeContainer)
        homeContainer.innerHTML =
          '<div class="alert alert-danger">تعذر تحميل المنتجات أو عرضها.</div>';
      if (shopContainer)
        shopContainer.innerHTML =
          '<div class="alert alert-danger">تعذر تحميل المنتجات أو عرضها.</div>';
    }
  });
})();
