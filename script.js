const header = document.getElementById('header');
const scrollTopBtn = document.getElementById('scrollTop');
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
const modalOverlay = document.getElementById('modalOverlay');

window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
});

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
});

nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
});

document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !menuToggle.contains(e.target)) {
        nav.classList.remove('open');
    }
});

const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        cards.forEach((card, i) => {
            const show = filter === 'all' || card.dataset.category === filter;
            card.style.display = show ? '' : 'none';
            if (show) {
                card.classList.remove('visible');
                setTimeout(() => card.classList.add('visible'), i * 60);
            }
        });
    });
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

cards.forEach(card => observer.observe(card));

function initVariants(container) {
    const variantsEl = container.querySelector('.product-variants');
    if (!variantsEl || !variantsEl.dataset.variants) return;

    const variantsMap = JSON.parse(variantsEl.dataset.variants);
    const allColors = JSON.parse(variantsEl.dataset.colors);
    const colorsContainer = variantsEl.querySelector('.product-colors');
    const sizeTags = variantsEl.querySelectorAll('.size-tag');

    function renderColors(selectedSize) {
        const available = selectedSize ? (variantsMap[selectedSize] || []) : [];
        colorsContainer.innerHTML = '';
        allColors.forEach(c => {
            const dot = document.createElement('span');
            dot.className = 'color-dot';
            dot.style.background = c.hex;
            dot.setAttribute('data-name', c.name);
            if (selectedSize && !available.includes(c.name)) {
                dot.classList.add('unavailable');
            }
            colorsContainer.appendChild(dot);
        });
    }

    sizeTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasActive = tag.classList.contains('active');
            sizeTags.forEach(t => t.classList.remove('active'));
            if (!wasActive) {
                tag.classList.add('active');
                renderColors(tag.dataset.size);
            } else {
                renderColors(null);
            }
        });
    });

    renderColors(null);
}

/* ─── CARROSSEL AUTOMÁTICO NOS CARDS ─── */
function initCarousel(card) {
    const images = card.dataset.images ? JSON.parse(card.dataset.images) : null;
    if (!images || images.length < 2) return;

    const productImg = card.querySelector('.product-img');
    const firstImg = productImg.querySelector('img');
    firstImg.classList.add('carousel-img', 'active');

    images.slice(1).forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'carousel-img';
        img.loading = 'lazy';
        productImg.insertBefore(img, firstImg.nextSibling);
    });

    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    images.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dots.appendChild(dot);
    });
    productImg.appendChild(dots);

    let idx = 0;
    let timer = null;
    const allImgs = productImg.querySelectorAll('.carousel-img');
    const allDots = dots.querySelectorAll('.carousel-dot');

    function goTo(n) {
        allImgs[idx].classList.remove('active');
        allDots[idx].classList.remove('active');
        idx = (n + images.length) % images.length;
        allImgs[idx].classList.add('active');
        allDots[idx].classList.add('active');
    }

    card.addEventListener('mouseenter', () => {
        timer = setInterval(() => goTo(idx + 1), 1500);
    });

    card.addEventListener('mouseleave', () => {
        clearInterval(timer);
        allImgs[idx].classList.remove('active');
        allDots[idx].classList.remove('active');
        idx = 0;
        allImgs[0].classList.add('active');
        allDots[0].classList.add('active');
    });
}

document.querySelectorAll('.product-card').forEach(card => {
    initVariants(card);
    initCarousel(card);
});

let currentOrderData = {};

function openModal(card) {
    const imgs = card.querySelectorAll('.product-img img');
    const mainImg = imgs[0];
    const allImages = card.dataset.images ? JSON.parse(card.dataset.images) : [mainImg ? mainImg.getAttribute('src') : ''];
    const name = card.querySelector('.product-name').textContent;
    const price = card.querySelector('.product-price').textContent;
    const variantsEl = card.querySelector('.product-variants');

    const modalImgEl = document.getElementById('modalImg');
    const modalThumbsEl = document.getElementById('modalThumbs');

    modalImgEl.src = allImages[0];
    modalImgEl.alt = name;

    modalThumbsEl.innerHTML = '';
    if (allImages.length > 1) {
        allImages.forEach((src, i) => {
            const t = document.createElement('img');
            t.src = src;
            t.alt = name + ' foto ' + (i + 1);
            t.className = 'modal-thumb' + (i === 0 ? ' active' : '');
            t.addEventListener('click', () => {
                modalImgEl.style.opacity = '0';
                setTimeout(() => { modalImgEl.src = src; modalImgEl.style.opacity = '1'; }, 150);
                modalThumbsEl.querySelectorAll('.modal-thumb').forEach(th => th.classList.remove('active'));
                t.classList.add('active');
            });
            modalThumbsEl.appendChild(t);
        });
        modalThumbsEl.style.display = 'flex';
    } else {
        modalThumbsEl.style.display = 'none';
    }

    document.getElementById('modalName').textContent = name;
    document.getElementById('modalPrice').textContent = price;

    const modalVariants = document.getElementById('modalVariants');
    if (variantsEl && variantsEl.dataset.variants) {
        const clone = variantsEl.cloneNode(true);
        modalVariants.innerHTML = '';
        modalVariants.appendChild(clone);
        initVariants(modalVariants);
    } else {
        modalVariants.innerHTML = '';
    }

    currentOrderData = {
        img: allImages[0],
        name: name,
        price: price,
        variants: variantsEl ? variantsEl.dataset.variants : '{}',
        colors: variantsEl ? variantsEl.dataset.colors : '[]'
    };

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

function openOrderFromModal() {
    closeModal();
    setTimeout(() => openOrderForm(currentOrderData), 150);
}

function openOrderFromCard(btn) {
    const card = btn.closest('.product-card');
    const allImages = card.dataset.images ? JSON.parse(card.dataset.images) : [card.querySelector('.product-img img').src];
    const img = allImages[0];
    const name = card.querySelector('.product-name').textContent;
    const price = card.querySelector('.product-price').textContent;
    const variantsEl = card.querySelector('.product-variants');

    openOrderForm({
        img: img,
        name: name,
        price: price,
        variants: variantsEl ? variantsEl.dataset.variants : '{}',
        colors: variantsEl ? variantsEl.dataset.colors : '[]'
    });
}

const orderOverlay = document.getElementById('orderOverlay');
const orderDeliveryCheck = document.getElementById('orderDeliveryCheck');
const orderAddressFields = document.getElementById('orderAddressFields');

orderDeliveryCheck.addEventListener('change', () => {
    orderAddressFields.classList.toggle('visible', orderDeliveryCheck.checked);
});

let orderVariantsMap = {};
let orderAllColors = [];
let orderSelectedSize = null;
let orderSelectedColor = null;

function openOrderForm(data) {
    document.getElementById('orderThumb').src = data.img;
    document.getElementById('orderProdName').textContent = data.name;
    document.getElementById('orderProdPrice').textContent = data.price;

    orderVariantsMap = JSON.parse(data.variants);
    orderAllColors = JSON.parse(data.colors);
    orderSelectedSize = null;
    orderSelectedColor = null;

    const sizesContainer = document.getElementById('orderSizes');
    const colorsContainer = document.getElementById('orderColors');
    sizesContainer.innerHTML = '';
    colorsContainer.innerHTML = '';

    const sizeKeys = Object.keys(orderVariantsMap);
    sizeKeys.forEach(size => {
        const tag = document.createElement('span');
        tag.className = 'order-size-tag';
        if (size === 'ÚNICO') tag.classList.add('unique');
        tag.textContent = size;
        tag.dataset.size = size;
        tag.addEventListener('click', () => selectOrderSize(tag));
        sizesContainer.appendChild(tag);
    });

    if (sizeKeys.length === 1) {
        sizesContainer.querySelector('.order-size-tag').click();
    } else {
        renderOrderColors(null);
    }

    document.getElementById('orderProdDetail').textContent = '';
    document.getElementById('orderName').value = '';
    document.getElementById('orderPhone').value = '';
    document.getElementById('orderAddress').value = '';
    document.getElementById('orderObs').value = '';
    orderDeliveryCheck.checked = false;
    orderAddressFields.classList.remove('visible');
    document.getElementById('orderError').classList.remove('visible');
    document.querySelectorAll('.order-field input, .order-field textarea').forEach(f => f.classList.remove('error'));

    orderOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function selectOrderSize(tag) {
    document.querySelectorAll('#orderSizes .order-size-tag').forEach(t => t.classList.remove('active'));
    tag.classList.add('active');
    orderSelectedSize = tag.dataset.size;
    orderSelectedColor = null;
    renderOrderColors(orderSelectedSize);
    updateOrderDetail();
}

function renderOrderColors(size) {
    const container = document.getElementById('orderColors');
    container.innerHTML = '';
    const available = size ? (orderVariantsMap[size] || []) : [];

    orderAllColors.forEach(c => {
        const dot = document.createElement('span');
        dot.className = 'order-color-dot';
        dot.style.background = c.hex;
        dot.title = c.name;
        dot.dataset.color = c.name;

        if (size && !available.includes(c.name)) {
            dot.classList.add('unavailable');
        } else {
            dot.addEventListener('click', () => selectOrderColor(dot));
        }

        container.appendChild(dot);
    });

    if (orderAllColors.length === 1 && (!size || available.length === 1)) {
        const firstDot = container.querySelector('.order-color-dot:not(.unavailable)');
        if (firstDot) firstDot.click();
    }
}

function selectOrderColor(dot) {
    document.querySelectorAll('#orderColors .order-color-dot').forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
    orderSelectedColor = dot.dataset.color;
    updateOrderDetail();
}

function updateOrderDetail() {
    const parts = [];
    if (orderSelectedSize) parts.push('Tam ' + orderSelectedSize);
    if (orderSelectedColor) parts.push(orderSelectedColor);
    document.getElementById('orderProdDetail').textContent = parts.join(' · ');
}

function closeOrder() {
    orderOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

orderOverlay.addEventListener('click', (e) => {
    if (e.target === orderOverlay) closeOrder();
});

function submitOrder() {
    const name = document.getElementById('orderName').value.trim();
    const phone = document.getElementById('orderPhone').value.trim();
    const needsDelivery = orderDeliveryCheck.checked;
    const address = document.getElementById('orderAddress').value.trim();
    const obs = document.getElementById('orderObs').value.trim();
    const errorEl = document.getElementById('orderError');

    document.querySelectorAll('.order-field input, .order-field textarea').forEach(f => f.classList.remove('error'));
    errorEl.classList.remove('visible');

    let hasError = false;
    if (!name) { document.getElementById('orderName').classList.add('error'); hasError = true; }
    if (!phone) { document.getElementById('orderPhone').classList.add('error'); hasError = true; }
    if (needsDelivery && !address) { document.getElementById('orderAddress').classList.add('error'); hasError = true; }
    if (!orderSelectedSize || !orderSelectedColor) { hasError = true; }

    if (hasError) {
        errorEl.classList.add('visible');
        return;
    }

    const prodName = document.getElementById('orderProdName').textContent;
    const prodPrice = document.getElementById('orderProdPrice').textContent;

    let msg = `*NOVO PEDIDO - MY BASIC*\n\n`;
    msg += `*Produto:* ${prodName}\n`;
    msg += `*Tamanho:* ${orderSelectedSize}\n`;
    msg += `*Cor:* ${orderSelectedColor}\n`;
    msg += `*Valor:* ${prodPrice}\n\n`;
    msg += `*--- Dados do Cliente ---*\n`;
    msg += `*Nome:* ${name}\n`;
    msg += `*Telefone:* ${phone}\n`;
    if (needsDelivery) {
        msg += `*Entrega:* Sim\n`;
        msg += `*Endereço:* ${address}\n`;
    } else {
        msg += `*Entrega:* Retirar no local\n`;
    }
    if (obs) msg += `*Obs:* ${obs}\n`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/5547999476241?text=${encoded}`, '_blank');
    closeOrder();
}

document.getElementById('orderPhone').addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    e.target.value = v;
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (orderOverlay.classList.contains('active')) closeOrder();
        else if (modalOverlay.classList.contains('active')) closeModal();
    }
});
