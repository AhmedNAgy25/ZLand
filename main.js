!(function () {
  function t(t) {
    return String(t).replace(/[0-9]/g, (t) => "٠١٢٣٤٥٦٧٨٩"[t]);
  }
  function n(t) {
    return "large" === t ? "1000 mL" : "small" === t ? "250 mL" : "";
  }
  function e(t, n = 80) {
    return t ? (t.length > n ? t.slice(0, n) + "..." : t) : "";
  }
  function s(t) {
    const n = (t["الاسم"] || "").trim(),
      e = (t.size || "").trim();
    return e && "unknown" !== e
      ? `productImge/${n} ${e}.jpg`
      : `productImge/${n}.jpg`;
  }
  function o(t) {
    return Math.round(0.9 * t);
  }
  window.showProductDetails = function (e) {
    !(function () {
      if (!document.getElementById("productModal")) {
        const t =
          '\n        <div class="modal fade" id="productModal" tabindex="-1" aria-labelledby="productModalLabel" aria-hidden="true">\n          <div class="modal-dialog modal-lg">\n            <div class="modal-content">\n              <div class="modal-header">\n                <h5 class="modal-title" id="productModalLabel"></h5>\n                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>\n              </div>\n              <div class="modal-body">\n                <div class="row">\n                  <div class="col-md-4">\n                    <img id="modalProductImg" src="assets/product.png" class="img-fluid rounded" alt="Product Image" />\n                  </div>\n                  <div class="col-md-8">\n                    <div id="modalContent"></div>\n                  </div>\n                </div>\n              </div>\n              <div class="modal-footer">\n                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>\n                <a href="contact.html" class="btn btn-success">اطلب الآن</a>\n              </div>\n            </div>\n          </div>\n        </div>\n      ';
        document.body.insertAdjacentHTML("beforeend", t);
      }
    })();
    const c = new bootstrap.Modal(document.getElementById("productModal")),
      a = document.getElementById("productModalLabel"),
      i = document.getElementById("modalContent"),
      l = document.getElementById("modalProductImg");
    (a.textContent = `${e["الاسم"] || "منتج"} - ${n(e.size)}`),
      (i.innerHTML = `\n      <h6 class="text-muted mb-3 rtl-text">${
        e["خصائص المنتج وفائده"] || ""
      }</h6>\n      <div class="mb-3"><strong>التصنيف:</strong> ${
        e["تصنيف المنتج"] || ""
      }</div>\n      <div class="mb-3"><strong>الاستخدامات:</strong><p>${
        e["أستخدماته"] || ""
      }</p></div>\n      <div class="mb-3"><strong>المكونات:</strong><p>${
        e["المكونات"] || ""
      }</p></div>\n      <div class="mb-3"><strong>طريقة الاستخدام:</strong><p>${
        e["طريقة الاستخدام"] || ""
      }</p></div>\n      <div class="mb-3"><strong>طريقة التخزين:</strong><p>${
        e["طريقة التخزين"] || ""
      }</p></div>\n      <div class="mb-3"><strong>فترة الصلاحية:</strong><p>${
        e["فترة الصلاحية"] || ""
      }</p></div>\n      <div class="mt-4">\n        <h3 lang="ar" style="color: var(--Primary);">\n          <span style='color:#888;text-decoration:line-through;font-size:0.8em;margin-left:8px;'>${t(
        e.price
      )}</span>\n          ${t(
        o(e.price)
      )}<span> ج.م</span>\n          <span class='badge bg-danger ms-2' style='font-size:0.7em;'>خصم 10%</span>\n        </h3>\n      </div>\n    `),
      (l.src = s(e)),
      (l.onerror = function () {
        this.src = "assets/product.png";
      });
    const r = document.querySelector("#productModal .modal-footer");
    r &&
      ((r.innerHTML =
        '\n        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>\n        <button type="button" id="modalAddToCartBtn" class="btn btn-warning">أضف للسلة</button>\n        <a href="contact.html" class="btn btn-success">اطلب الآن</a>\n      '),
      (document.getElementById("modalAddToCartBtn").onclick = function () {
        d(e), c.hide();
      })),
      c.show();
  };
  const c = "zland_cart";
  function a() {
    return JSON.parse(localStorage.getItem(c) || "[]");
  }
  function i(t) {
    localStorage.setItem(c, JSON.stringify(t));
  }
  function d(t) {
    let n = a();
    const e = n.findIndex(
      (n) => n["الاسم"] === t["الاسم"] && n.size === t.size
    );
    e > -1 ? (n[e].qty += 1) : n.push({ ...t, qty: 1 }), i(n), l();
  }
  function l() {
    const e = a(),
      s = document.getElementById("cart-count"),
      c = document.getElementById("cart-items"),
      i = document.getElementById("cart-total");
    s && (s.textContent = e.reduce((t, n) => t + n.qty, 0)),
      c &&
        ((c.innerHTML =
          0 === e.length
            ? '<li class="list-group-item">سلة المشتريات فارغة</li>'
            : ""),
        e.forEach((e, s) => {
          c.innerHTML += `<li class="list-group-item d-flex justify-content-between align-items-center item-card-container">\n          <span>\n            <span dir="ltr" style="unicode-bidi: embed;">${
            e["الاسم"]
          }</span>\n            <span style="unicode-bidi: embed;">${n(
            e.size
          )}</span>\n            ×\n            <span dir="rtl" style="unicode-bidi: embed;">${t(
            e.qty
          )}</span>\n          </span>\n          <span>${t(
            o(e.price) * e.qty
          )} ج.م</span>\n          <div class="btn-group ms-2 car-controller" role="group">\n            <button class="btn btn-sm btn-btn-success border-0 bg-success" onclick="increaseQty(${s})">+</button>\n            <button class="btn btn-sm btn-danger ms-1 border-0 me-1" onclick="removeFromCart(${s})">حذف</button>\n            <button class="btn btn-sm btn-btn-success border-0 bg-success" onclick="decreaseQty(${s})">-</button>\n          </div>\n        </li>`;
        })),
      i && (i.textContent = t(e.reduce((t, n) => t + o(n.price) * n.qty, 0)));
  }
  function r() {
    const t = a();
    if (0 === t.length) return;
    let e = "أرغب في شراء المنتجات التالية:%0A";
    t.forEach((t) => {
      e += `- ${t["الاسم"]} ${n(t.size)} × ${t.qty} = ${
        o(t.price) * t.qty
      } ج.م%0A`;
    });
    const s = t.reduce((t, n) => t + o(n.price) * n.qty, 0);
    e += `%0Aالإجمالي: ${s} ج.م`;
    window.open(`https://wa.me/201021944642?text=${e}`, "_blank"), i([]), l();
  }
  function m(c, { showReadMore: a = !0 } = {}) {
    return `
    <div class="card h-100 shadow w-100" style="min-height: 420px; display: flex; flex-direction: column;">
      <img src="${s(c)}" class="card-img-top" alt="${c["الاسم"] || "منتج"}"
        style="object-fit: contain; height: 180px; background: #f8f8f8; cursor: pointer;"
        onerror="this.src='assets/product.png'"
        onclick="showProductDetails(${JSON.stringify(c).replace(
          /\"/g,
          "&quot;"
        )})" />
      <div class="card-body d-flex flex-column" style="flex: 1 1 auto; min-height: 200px;">
        <div style="margin-bottom: 0.5rem;">
          <span class="card-title" style="display:block;font-size:1.35rem;font-weight:800;color:var(--Primary);line-height:1.2;">
            ${c["الاسم"] || ""} 
            <span style="font-size:0.8em;color:#888;">${n(c.size)}</span>
          </span>
          <span class="card-category" style="display:block;font-size:1rem;font-weight:500;color:#4e6e4e;opacity:0.85;margin-top:0.15em;">
            ${c["تصنيف المنتج"] || ""}
          </span>
        </div>

        <!-- Only show product features/benefits -->
        <h6 class="card-subtitle mb-3 text-muted" style="font-size:0.95em;">
          ${e(c["خصائص المنتج وفائده"], 200)}
        </h6>

        <div class="mt-auto d-flex flex-column align-items-end justify-content-end" style="margin-top: auto;">
          <h3 lang="ar" class="mt-2 mb-2" style="font-size: 1.5em; color: var(--Primary);">
            <span style='color:#888;text-decoration:line-through;font-size:0.8em;margin-left:8px;'>${t(
              c.price
            )}</span>
            ${t(o(c.price))}<span> ج.م</span>
            <span class='badge bg-danger ms-2' style='font-size:0.7em;'>خصم 10%</span>
          </h3>

          <div class="d-flex gap-2 w-100">
            ${
              a
                ? `<button class="btn btn-outline-primary flex-fill" onclick="showProductDetails(${JSON.stringify(
                    c
                  ).replace(/\"/g, "&quot;")})">اقرأ المزيد</button>`
                : ""
            }
            <button class="btn btn-warning flex-fill" onclick='addToCart(${JSON.stringify(
              c
            )})'>أضف للسلة</button>
          </div>
        </div>
      </div>
    </div>
  `;
  }

  (window.increaseQty = function (t) {
    let n = a();
    (n[t].qty += 1), i(n), l();
  }),
    (window.decreaseQty = function (t) {
      let n = a();
      n[t].qty > 1 ? (n[t].qty -= 1) : n.splice(t, 1), i(n), l();
    }),
    (window.removeFromCart = function (t) {
      let n = a();
      n.splice(t, 1), i(n), l();
    }),
    (window.addToCart = d),
    document.addEventListener("DOMContentLoaded", () => {
      l();
      const t = document.getElementById("checkout-btn");
      t && (t.onclick = r);
    }),
    document.addEventListener("DOMContentLoaded", async () => {
      try {
        const t = await fetch("items.json"),
          n = await t.json(),
          e = document.getElementById("index-products-container");
        if (e) {
          e.innerHTML = "";
          n.slice(0, 3).forEach((t) => {
            const n = document.createElement("div");
            (n.className =
              "col-12 col-md-6 col-lg-4 mb-4 d-flex align-items-stretch"),
              (n.innerHTML = m(t)),
              e.appendChild(n);
          });
        }
        const s = document.getElementById("products-container");
        s &&
          ((s.innerHTML = ""),
          n.forEach((t) => {
            const n = document.createElement("div");
            (n.className =
              "col-12 col-md-6 col-lg-4 mb-4 d-flex align-items-stretch"),
              (n.innerHTML = m(t)),
              s.appendChild(n);
          }));
      } catch (t) {
        const n = document.getElementById("index-products-container"),
          e = document.getElementById("products-container");
        n &&
          (n.innerHTML =
            '<div class="alert alert-danger">تعذر تحميل المنتجات أو عرضها.</div>'),
          e &&
            (e.innerHTML =
              '<div class="alert alert-danger">تعذر تحميل المنتجات أو عرضها.</div>');
      }
    });
})();
