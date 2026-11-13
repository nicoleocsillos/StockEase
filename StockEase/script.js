
// ============================================
// STOCKEASE ADMIN LOGIN
// ============================================

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Admin@123";

const loginScreen = document.getElementById("loginScreen");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const appShell = document.getElementById("appShell");
const logoutButton = document.getElementById("logoutButton");

const loginPassword = document.getElementById("loginPassword");
const togglePassword = document.getElementById("togglePassword");

// SHOW / HIDE PASSWORD
togglePassword.addEventListener("click", function () {
    const passwordIsHidden = loginPassword.type === "password";

    loginPassword.type = passwordIsHidden ? "text" : "password";
    togglePassword.textContent = passwordIsHidden ? "🙈" : "👁";

    togglePassword.setAttribute(
        "aria-label",
        passwordIsHidden ? "Hide password" : "Show password"
    );

    togglePassword.title = passwordIsHidden ? "Hide password" : "Show password";
});

function showApplication() {
    loginScreen.style.display = "none";
    appShell.style.display = "flex";
}

function showLogin() {
    loginScreen.style.display = "flex";
    appShell.style.display = "none";
    loginForm.reset();
    loginError.textContent = "";

    loginPassword.type = "password";
    togglePassword.textContent = "👁";
    togglePassword.setAttribute("aria-label", "Show password");
    togglePassword.title = "Show password";
}

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = loginPassword.value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        sessionStorage.setItem("stockeaseAdminLoggedIn", "true");
        showApplication();
        renderAll();
        navigate("dashboard");
    } else {
        loginError.textContent = "Incorrect username or password.";
    }
});

logoutButton.addEventListener("click", function () {
    if (!confirm("Are you sure you want to logout?")) return;

    sessionStorage.removeItem("stockeaseAdminLoggedIn");
    showLogin();
});

if (sessionStorage.getItem("stockeaseAdminLoggedIn") === "true") {
    showApplication();
} else {
    showLogin();
}

// ============================================
// STOCKEASE INVENTORY MANAGEMENT SYSTEM
// ============================================

const STORAGE_KEY = "stockeaseDataV1";
const $ = (id) => document.getElementById(id);

const money = (amount) =>
    "₱" + Number(amount || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const todayISO = () => {
    const date = new Date();
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
};

const dateText = (value) =>
    value
        ? new Date(value + "T00:00:00").toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric"
        })
        : "—";

const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[character]));

// ============================================
// SAMPLE DATA
// ============================================

function seedData() {
    return {
        products: [
            { id: 1, name: "Denim Jacket", sku: "SKU001", category: "Outerwear", price: 899, qty: 14, reorder: 5 },
            { id: 2, name: "Oxford Shirt", sku: "SKU002", category: "Tops", price: 549, qty: 3, reorder: 5 },
            { id: 3, name: "Slim Chinos", sku: "SKU003", category: "Bottoms", price: 699, qty: 35, reorder: 8 },
            { id: 4, name: "Wool Sweater", sku: "SKU004", category: "Knitwear", price: 799, qty: 2, reorder: 5 },
            { id: 5, name: "Leather Sneakers", sku: "SKU005", category: "Footwear", price: 1299, qty: 23, reorder: 6 },
            { id: 6, name: "Canvas Tote", sku: "SKU006", category: "Accessories", price: 349, qty: 12, reorder: 4 }
        ],
        suppliers: [
            { id: 1, name: "Northwind Textiles", email: "sales@northwind.example", phone: "+63 900 000 0001" },
            { id: 2, name: "Harbor Denim Co.", email: "hello@harbor.example", phone: "+63 900 000 0002" },
            { id: 3, name: "Loom & Thread", email: "info@loom.example", phone: "+63 900 000 0003" },
            { id: 4, name: "Stride Footwear", email: "orders@stride.example", phone: "+63 900 000 0004" }
        ],
        orders: [
            {
                id: "SE-1001",
                customer: "Alex Santos",
                channel: "In-store",
                date: todayISO(),
                total: 899,
                status: "Shipped",
                items: [
                    { productId: 1, name: "Denim Jacket", sku: "SKU001", qty: 1, price: 899 }
                ]
            },
            {
                id: "SE-1002",
                customer: "Jamie Cruz",
                channel: "Online",
                date: todayISO(),
                total: 1098,
                status: "Packed",
                items: [
                    { productId: 2, name: "Oxford Shirt", sku: "SKU002", qty: 2, price: 549 }
                ]
            }
        ],
        activity: []
    };
}

// ============================================
// LOAD AND SAVE DATA
// ============================================

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return seedData();

        const parsed = JSON.parse(saved);

        if (
            !Array.isArray(parsed.products) ||
            !Array.isArray(parsed.suppliers) ||
            !Array.isArray(parsed.orders)
        ) {
            throw new Error("Saved data is incomplete.");
        }

        return parsed;
    } catch (error) {
        console.warn("Could not load saved data:", error);
        return seedData();
    }
}

let data = loadData();

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        showToast("Unable to save data. Browser storage may be unavailable.", true);
    }
}

// ============================================
// GENERAL FUNCTIONS
// ============================================

function showToast(message, isError = false) {
    const toast = $("toast");
    toast.textContent = message;
    toast.className = "toast show" + (isError ? " error" : "");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}

function emptyRow(columns, message) {
    return `<tr><td colspan="${columns}">
        <div class="empty-state">${escapeHTML(message)}</div>
    </td></tr>`;
}

function isLow(product) {
    return Number(product.qty) <= Number(product.reorder);
}

function productById(id) {
    return data.products.find(product => product.id === Number(id));
}

function addActivity(message) {
    data.activity.unshift({
        message,
        date: new Date().toISOString()
    });

    data.activity = data.activity.slice(0, 20);
}

function statusBadge(status) {
    return `<span class="status ${escapeHTML(status)}">${escapeHTML(status)}</span>`;
}

function renderAll() {
    populateCategoryFilter();
    populateOrderProducts();
    renderDashboard();
    renderProducts();
    renderOrders();
    renderSuppliers();
    renderReports();
}

// ============================================
// NAVIGATION
// ============================================

function navigate(page) {
    document.querySelectorAll(".page").forEach(section => {
        section.classList.toggle("active", section.id === page + "Page");
    });

    document.querySelectorAll(".nav-link[data-page]").forEach(button => {
        button.classList.toggle("active", button.dataset.page === page);
    });

    const titles = {
        dashboard: "Dashboard",
        products: "Products",
        orders: "Sales Orders",
        suppliers: "Suppliers",
        reports: "Reports"
    };

    $("pageTitle").textContent = titles[page] || "Dashboard";

    if (page === "dashboard") renderDashboard();
    if (page === "products") renderProducts();
    if (page === "orders") renderOrders();
    if (page === "suppliers") renderSuppliers();
    if (page === "reports") renderReports();
}

// ============================================
// DASHBOARD
// ============================================

function renderDashboard() {
    const totalUnits = data.products.reduce(
        (sum, product) => sum + Number(product.qty), 0
    );

    const lowStock = data.products.filter(isLow);

    const todayOrders = data.orders.filter(
        order => order.date === todayISO() && order.status !== "Returned"
    );

    const todaySales = todayOrders.reduce(
        (sum, order) => sum + Number(order.total), 0
    );

    $("todaySales").textContent = money(todaySales);
    $("totalProducts").textContent = data.products.length;
    $("totalUnits").textContent = totalUnits;
    $("lowStockCount").textContent = lowStock.length;

    $("todayLabel").textContent = new Date().toLocaleDateString("en-PH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    const topProducts = [...data.products]
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 6);

    const maxQuantity = Math.max(
        1,
        ...topProducts.map(product => Number(product.qty))
    );

    $("stockBars").innerHTML = topProducts.length
        ? topProducts.map(product => `
            <div class="bar-item">
                <div class="bar-track" title="${product.qty} units">
                    <div class="bar-fill"
                         style="height:${Math.max(3, product.qty / maxQuantity * 100)}%">
                    </div>
                </div>
                <small>${escapeHTML(product.name)}</small>
            </div>
        `).join("")
        : '<div class="empty-state">No products yet.</div>';

    $("lowStockList").innerHTML = lowStock.length
        ? lowStock.map(product => `
            <div class="simple-list-item">
                <div>
                    <b>${escapeHTML(product.name)}</b>
                    <small>${escapeHTML(product.sku)}</small>
                </div>
                <span class="quantity-warning">${product.qty} left</span>
            </div>
        `).join("")
        : '<div class="empty-state">All products have sufficient stock.</div>';

    const recentOrders = [...data.orders]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5);

    $("recentOrders").innerHTML = recentOrders.length
        ? recentOrders.map(order => `
            <tr>
                <td><b>${escapeHTML(order.id)}</b></td>
                <td>${escapeHTML(order.customer)}</td>
                <td>${dateText(order.date)}</td>
                <td>${money(order.total)}</td>
                <td>${statusBadge(order.status)}</td>
            </tr>
        `).join("")
        : emptyRow(5, "No orders yet.");
}

// ============================================
// PRODUCTS
// ============================================

function populateCategoryFilter() {
    const select = $("categoryFilter");
    const current = select.value;

    const categories = [
        ...new Set(data.products.map(product => product.category))
    ].sort();

    select.innerHTML = '<option value="all">All categories</option>' +
        categories.map(category => `
            <option value="${escapeHTML(category)}">${escapeHTML(category)}</option>
        `).join("");

    if (categories.includes(current)) {
        select.value = current;
    }
}

function renderProducts() {
    const query = $("productSearch").value.toLowerCase().trim();
    const category = $("categoryFilter").value;
    const stock = $("stockFilter").value;

    const filtered = data.products.filter(product => {
        const matchesSearch = (
            product.name + " " + product.sku + " " + product.category
        ).toLowerCase().includes(query);

        const matchesCategory =
            category === "all" || product.category === category;

        const matchesStock =
            stock === "all" ||
            (stock === "low" ? isLow(product) : !isLow(product));

        return matchesSearch && matchesCategory && matchesStock;
    });

    $("productRows").innerHTML = filtered.length
        ? filtered.map(product => `
            <tr>
                <td>
                    <span class="product-name">${escapeHTML(product.name)}</span>
                    <span class="subtext">${escapeHTML(product.category)}</span>
                </td>
                <td>${escapeHTML(product.sku)}</td>
                <td>${escapeHTML(product.category)}</td>
                <td>${money(product.price)}</td>
                <td>${product.qty}</td>
                <td>
                    ${isLow(product)
                        ? '<span class="status low">Low stock</span>'
                        : '<span class="status">In stock</span>'}
                </td>
                <td>
                    <div class="row-actions">
                        <button data-action="edit-product" data-id="${product.id}">Edit</button>
                        <button class="danger" data-action="delete-product"
                                data-id="${product.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `).join("")
        : emptyRow(7, "No matching products found.");

    $("productCount").textContent =
        `Showing ${filtered.length} of ${data.products.length} products.`;
}

function openProductForm(id = null) {
    $("productForm").reset();
    $("productError").textContent = "";
    $("productId").value = "";
    $("productDialogTitle").textContent = id ? "Edit Product" : "Add Product";

    if (id) {
        const product = productById(id);
        if (!product) return;

        $("productId").value = product.id;
        $("productName").value = product.name;
        $("productSku").value = product.sku;
        $("productCategory").value = product.category;
        $("productPrice").value = product.price;
        $("productQty").value = product.qty;
        $("productReorder").value = product.reorder;
    }

    $("productDialog").showModal();
}

function validateProduct() {
    const name = $("productName").value.trim();
    const sku = $("productSku").value.trim();
    const category = $("productCategory").value.trim();
    const price = Number($("productPrice").value);
    const qty = Number($("productQty").value);
    const reorder = Number($("productReorder").value);
    const id = Number($("productId").value);

    if (!name || !sku || !category) {
        return "Please complete all required product fields.";
    }

    if (!Number.isFinite(price) || price <= 0) {
        return "Price must be greater than zero.";
    }

    if (
        !Number.isInteger(qty) || qty < 0 ||
        !Number.isInteger(reorder) || reorder < 0
    ) {
        return "Quantity and reorder level must be whole numbers of zero or more.";
    }

    const duplicateSKU = data.products.some(product =>
        product.sku.toLowerCase() === sku.toLowerCase() &&
        product.id !== id
    );

    if (duplicateSKU) {
        return "That SKU already exists. Use a unique SKU.";
    }

    return "";
}

function saveProduct(event) {
    event.preventDefault();

    const error = validateProduct();

    if (error) {
        $("productError").textContent = error;
        return;
    }

    const id = Number($("productId").value);

    const product = {
        id: id || Date.now(),
        name: $("productName").value.trim(),
        sku: $("productSku").value.trim(),
        category: $("productCategory").value.trim(),
        price: Number($("productPrice").value),
        qty: Number($("productQty").value),
        reorder: Number($("productReorder").value)
    };

    const index = data.products.findIndex(item => item.id === id);

    if (index >= 0) {
        data.products[index] = {
            ...product,
            supplierId: data.products[index].supplierId
        };
    } else {
        data.products.push(product);
    }

    if (isLow(product)) {
        addActivity(`${product.name} is at or below its reorder level.`);
    }

    saveData();
    $("productDialog").close();
    renderAll();

    showToast(
        index >= 0
            ? "Product updated successfully."
            : "Product added successfully."
    );
}

function deleteProduct(id) {
    const product = productById(id);
    if (!product) return;

    const linkedToActiveOrder = data.orders.some(order =>
        order.status !== "Returned" &&
        order.items.some(item => item.productId === product.id)
    );

    if (linkedToActiveOrder) {
        showToast(
            "This product is linked to an active order and cannot be deleted.",
            true
        );
        return;
    }

    if (!confirm(`Delete ${product.name}?`)) return;

    data.products = data.products.filter(item => item.id !== product.id);

    saveData();
    renderAll();
    showToast("Product deleted.");
}

// ============================================
// SALES ORDERS
// ============================================

function populateOrderProducts() {
    const select = $("orderProduct");
    const previous = select.value;

    select.innerHTML = data.products.length
        ? data.products.map(product => `
            <option value="${product.id}">
                ${escapeHTML(product.name)} — ${product.qty} available
            </option>
        `).join("")
        : '<option value="">No products available</option>';

    if (data.products.some(product => String(product.id) === previous)) {
        select.value = previous;
    }

    updateOrderPreview();
}

function updateOrderPreview() {
    const product = productById($("orderProduct").value);
    const quantity = Number($("orderQty").value) || 0;

    $("orderAvailable").value = product ? product.qty : "—";

    $("orderLineTotal").textContent =
        "Line total: " + money(product ? product.price * quantity : 0);
}

function openOrderForm() {
    $("orderForm").reset();
    $("orderError").textContent = "";

    $("orderQty").value = 1;
    populateOrderProducts();

    if (!data.products.length) {
        showToast("Add a product before placing an order.", true);
        return;
    }

    $("orderDialog").showModal();
    updateOrderPreview();
}

function confirmOrder(event) {
    event.preventDefault();

    const customer = $("orderCustomer").value.trim();
    const product = productById($("orderProduct").value);
    const quantity = Number($("orderQty").value);

    if (!customer) {
        $("orderError").textContent = "Enter the customer name.";
        return;
    }

    if (!product) {
        $("orderError").textContent = "Select a valid product.";
        return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        $("orderError").textContent =
            "Quantity must be a whole number greater than zero.";
        return;
    }

    if (quantity > product.qty) {
        $("orderError").textContent =
            `Not enough stock. Only ${product.qty} unit(s) are available.`;
        return;
    }

    product.qty -= quantity;

    const order = {
        id: "SE-" + (1000 + Date.now().toString().slice(-5)),
        customer,
        channel: $("orderChannel").value,
        date: todayISO(),
        total: product.price * quantity,
        status: "Confirmed",
        items: [{
            productId: product.id,
            name: product.name,
            sku: product.sku,
            qty: quantity,
            price: product.price
        }]
    };

    data.orders.push(order);

    addActivity(
        `Order ${order.id} confirmed; ${quantity} unit(s) reserved.`
    );

    if (isLow(product)) {
        addActivity(`${product.name} is now low in stock.`);
    }

    saveData();
    $("orderDialog").close();
    renderAll();

    showToast("Order confirmed. Stock has been reserved.");
}

function renderOrders() {
    const query = $("orderSearch").value.toLowerCase().trim();
    const status = $("orderStatusFilter").value;

    const filtered = data.orders.filter(order => {
        const matchesSearch = (
            order.id + " " + order.customer + " " + order.channel
        ).toLowerCase().includes(query);

        const matchesStatus =
            status === "all" || order.status === status;

        return matchesSearch && matchesStatus;
    });

    $("orderRows").innerHTML = filtered.length
        ? filtered.map(order => `
            <tr>
                <td><b>${escapeHTML(order.id)}</b></td>
                <td>${escapeHTML(order.customer)}</td>
                <td>${escapeHTML(order.channel)}</td>
                <td>${dateText(order.date)}</td>
                <td>${money(order.total)}</td>
                <td>${statusBadge(order.status)}</td>
                <td>
                    <div class="row-actions">
                        <button data-action="invoice"
                                data-id="${escapeHTML(order.id)}">Invoice</button>
                        ${order.status !== "Returned"
                            ? `<button data-action="next-status"
                                       data-id="${escapeHTML(order.id)}">Update</button>`
                            : ""}
                    </div>
                </td>
            </tr>
        `).join("")
        : emptyRow(7, "No matching orders found.");
}

function updateOrderStatus(id) {
    const order = data.orders.find(item => item.id === id);

    if (!order || order.status === "Returned") return;

    const statuses = [
        "Confirmed",
        "Packed",
        "Shipped",
        "Delivered",
        "Returned"
    ];

    const nextStatus = statuses[statuses.indexOf(order.status) + 1];

    if (!nextStatus) return;

    if (nextStatus === "Returned") {
        const confirmed = confirm(
            `Mark order ${order.id} as returned? The stock will be restored.`
        );

        if (!confirmed) return;

        order.items.forEach(item => {
            const product = productById(item.productId);
            if (product) product.qty += item.qty;
        });
    }

    order.status = nextStatus;

    addActivity(`Order ${order.id} status changed to ${nextStatus}.`);

    saveData();
    renderAll();

    showToast(`Order status updated to ${nextStatus}.`);
}

// ============================================
// INVOICE
// ============================================

function showInvoice(id) {
    const order = data.orders.find(item => item.id === id);
    if (!order) return;

    const itemRows = order.items.map(item => `
        <tr>
            <td>${escapeHTML(item.name)}</td>
            <td>${item.qty}</td>
            <td>${money(item.price)}</td>
            <td>${money(item.price * item.qty)}</td>
        </tr>
    `).join("");

    $("invoiceContent").innerHTML = `
        <h2 class="invoice-title">StockEase Invoice</h2>
        <p class="muted">Inventory made simple.</p>

        <div class="invoice-meta">
            <div>
                <b>Invoice:</b> ${escapeHTML(order.id)}<br>
                <b>Customer:</b> ${escapeHTML(order.customer)}
            </div>
            <div>
                <b>Date:</b> ${dateText(order.date)}<br>
                <b>Status:</b> ${escapeHTML(order.status)}
            </div>
        </div>

        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>${itemRows}</tbody>
            </table>
        </div>

        <h3 style="text-align:right;margin-top:20px;">
            Total: ${money(order.total)}
        </h3>
    `;

    $("invoiceDialog").showModal();
}

// ============================================
// SUPPLIERS
// ============================================

function renderSuppliers() {
    const query = $("supplierSearch").value.toLowerCase().trim();

    const filtered = data.suppliers.filter(supplier =>
        (
            supplier.name + " " +
            supplier.email + " " +
            supplier.phone
        ).toLowerCase().includes(query)
    );

    $("supplierRows").innerHTML = filtered.length
        ? filtered.map(supplier => {
            const productCount = data.products.filter(
                product => product.supplierId === supplier.id
            ).length;

            return `
                <tr>
                    <td><b>${escapeHTML(supplier.name)}</b></td>
                    <td>${escapeHTML(supplier.email)}</td>
                    <td>${escapeHTML(supplier.phone)}</td>
                    <td>${productCount}</td>
                    <td>
                        <div class="row-actions">
                            <button data-action="edit-supplier"
                                    data-id="${supplier.id}">Edit</button>
                            <button class="danger"
                                    data-action="delete-supplier"
                                    data-id="${supplier.id}">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("")
        : emptyRow(5, "No suppliers found.");
}

function openSupplierForm(id = null) {
    $("supplierForm").reset();
    $("supplierError").textContent = "";
    $("supplierId").value = "";

    $("supplierDialogTitle").textContent =
        id ? "Edit Supplier" : "Add Supplier";

    if (id) {
        const supplier = data.suppliers.find(
            item => item.id === Number(id)
        );

        if (!supplier) return;

        $("supplierId").value = supplier.id;
        $("supplierName").value = supplier.name;
        $("supplierEmail").value = supplier.email;
        $("supplierPhone").value = supplier.phone;
    }

    $("supplierDialog").showModal();
}

function saveSupplier(event) {
    event.preventDefault();

    const id = Number($("supplierId").value);
    const name = $("supplierName").value.trim();
    const email = $("supplierEmail").value.trim();
    const phone = $("supplierPhone").value.trim();

    if (!name || !email || !phone) {
        $("supplierError").textContent =
            "Please complete all supplier fields.";
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        $("supplierError").textContent =
            "Enter a valid email address.";
        return;
    }

    if (phone.length < 7) {
        $("supplierError").textContent =
            "Enter a valid contact number.";
        return;
    }

    const duplicateEmail = data.suppliers.some(supplier =>
        supplier.email.toLowerCase() === email.toLowerCase() &&
        supplier.id !== id
    );

    if (duplicateEmail) {
        $("supplierError").textContent =
            "That email is already registered.";
        return;
    }

    const supplier = {
        id: id || Date.now(),
        name,
        email,
        phone
    };

    const index = data.suppliers.findIndex(item => item.id === id);

    if (index >= 0) {
        data.suppliers[index] = supplier;
    } else {
        data.suppliers.push(supplier);
    }

    saveData();
    $("supplierDialog").close();
    renderAll();

    showToast(index >= 0 ? "Supplier updated." : "Supplier added.");
}

function deleteSupplier(id) {
    const supplier = data.suppliers.find(
        item => item.id === Number(id)
    );

    if (!supplier) return;

    if (!confirm(`Delete supplier ${supplier.name}?`)) return;

    data.suppliers = data.suppliers.filter(
        item => item.id !== Number(id)
    );

    saveData();
    renderAll();
    showToast("Supplier deleted.");
}

// ============================================
// REPORTS
// ============================================

function renderReports() {
    const validOrders = data.orders.filter(
        order => order.status !== "Returned"
    );

    const totalSales = validOrders.reduce(
        (sum, order) => sum + Number(order.total), 0
    );

    $("reportSales").textContent = money(totalSales);
    $("reportOrders").textContent = data.orders.length;
    $("reportSuppliers").textContent = data.suppliers.length;

    const days = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const localDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000
        ).toISOString().slice(0, 10);

        days.push({
            iso: localDate,
            label: date.toLocaleDateString("en", {
                weekday: "short"
            }),
            total: validOrders
                .filter(order => order.date === localDate)
                .reduce((sum, order) => sum + Number(order.total), 0)
        });
    }

    const maxSales = Math.max(
        1,
        ...days.map(day => day.total)
    );

    $("weeklySales").innerHTML = days.map(day => `
        <div class="week-column" title="${money(day.total)}">
            <div class="week-bar"
                 style="height:${Math.max(2, day.total / maxSales * 100)}%">
            </div>
            <small>${day.label}</small>
        </div>
    `).join("");

    const performance = data.suppliers.map(supplier => ({
        name: supplier.name,
        count: data.products.filter(
            product => product.supplierId === supplier.id
        ).length
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    const maxCount = Math.max(
        1,
        ...performance.map(supplier => supplier.count)
    );

    $("supplierPerformance").innerHTML = performance.length
        ? performance.map(supplier => `
            <div class="performance-item">
                <b>
                    <span>${escapeHTML(supplier.name)}</span>
                    <span>${supplier.count} products</span>
                </b>
                <div class="progress">
                    <span style="width:${supplier.count / maxCount * 100}%"></span>
                </div>
            </div>
        `).join("")
        : '<div class="empty-state">No suppliers yet.</div>';

    $("reportRows").innerHTML = data.products.length
        ? data.products.map(product => `
            <tr>
                <td>${escapeHTML(product.name)}</td>
                <td>${escapeHTML(product.sku)}</td>
                <td>${product.qty}</td>
                <td>${product.reorder}</td>
                <td>
                    ${isLow(product)
                        ? '<span class="status low">Low stock</span>'
                        : '<span class="status">In stock</span>'}
                </td>
            </tr>
        `).join("")
        : emptyRow(5, "No products yet.");
}

// ============================================
// EXPORT CSV
// ============================================

function exportCSV() {
    const rows = [
        [
            "Product",
            "SKU",
            "Category",
            "Price",
            "Quantity",
            "Reorder Level",
            "Status"
        ],
        ...data.products.map(product => [
            product.name,
            product.sku,
            product.category,
            product.price,
            product.qty,
            product.reorder,
            isLow(product) ? "Low stock" : "In stock"
        ])
    ];

    const csv = rows.map(row =>
        row.map(value =>
            `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
    ).join("\n");

    const blob = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "stockease-inventory-report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showToast("Inventory CSV downloaded.");
}

// ============================================
// GLOBAL SEARCH
// ============================================

function globalSearch(query) {
    if (!query.trim()) return;

    navigate("products");
    $("productSearch").value = query;
    $("globalSearch").value = "";

    renderProducts();
}

// ============================================
// EVENT LISTENERS
// ============================================

// Navigation
document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
        navigate(button.dataset.page);
    });
});

document.querySelectorAll("[data-page-link]").forEach(button => {
    button.addEventListener("click", () => {
        navigate(button.dataset.pageLink);
    });
});

// Product events
$("addProductButton").addEventListener("click", () => openProductForm());

$("productForm").addEventListener("submit", saveProduct);
$("productSearch").addEventListener("input", renderProducts);
$("categoryFilter").addEventListener("change", renderProducts);
$("stockFilter").addEventListener("change", renderProducts);

$("productRows").addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    if (button.dataset.action === "edit-product") {
        openProductForm(button.dataset.id);
    }

    if (button.dataset.action === "delete-product") {
        deleteProduct(Number(button.dataset.id));
    }
});

// Order events
$("addOrderButton").addEventListener("click", openOrderForm);
$("orderForm").addEventListener("submit", confirmOrder);

$("orderProduct").addEventListener("change", updateOrderPreview);
$("orderQty").addEventListener("input", updateOrderPreview);
$("orderSearch").addEventListener("input", renderOrders);
$("orderStatusFilter").addEventListener("change", renderOrders);

$("orderRows").addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    if (button.dataset.action === "invoice") {
        showInvoice(button.dataset.id);
    }

    if (button.dataset.action === "next-status") {
        updateOrderStatus(button.dataset.id);
    }
});

// Supplier events
$("addSupplierButton").addEventListener("click", () => openSupplierForm());

$("supplierForm").addEventListener("submit", saveSupplier);
$("supplierSearch").addEventListener("input", renderSuppliers);

$("supplierRows").addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    if (button.dataset.action === "edit-supplier") {
        openSupplierForm(button.dataset.id);
    }

    if (button.dataset.action === "delete-supplier") {
        deleteSupplier(button.dataset.id);
    }
});

// Report events
$("printReportButton").addEventListener("click", () => window.print());
$("printInvoiceButton").addEventListener("click", () => window.print());
$("exportCsvButton").addEventListener("click", exportCSV);

// Global search
$("globalSearch").addEventListener("keydown", event => {
    if (event.key === "Enter") {
        globalSearch(event.target.value);
    }
});

// Help
$("helpButton").addEventListener("click", () => {
    $("helpDialog").showModal();
});

// Reset demo data
$("resetButton").addEventListener("click", () => {
    const confirmed = confirm(
        "Reset all StockEase data to the original demo records?"
    );

    if (!confirmed) return;

    data = seedData();

    saveData();
    renderAll();
    navigate("dashboard");

    showToast("Demo data restored.");
});

// Close dialogs
document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => {
        const dialog = $(button.dataset.close);

        if (dialog && dialog.open) {
            dialog.close();
        }
    });
});

// Update when another browser tab changes storage
window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) {
        data = loadData();
        renderAll();
    }
});

// ============================================
// INITIALIZE APPLICATION
// ============================================

renderAll();
navigate("dashboard");
