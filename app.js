const productForm = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const btnSort = document.getElementById('btn-sort');

let products = JSON.parse(localStorage.getItem('stockflow_products')) || [];
let isSorted = false;

function saveAndRender() {
    localStorage.setItem('stockflow_products', JSON.stringify(products));
    renderProducts();
    updateMetrics();
}

function updateMetrics() {
    const totalProductos = products.length;
    
    // Consideramos crítico o en advertencia si está en la zona de riesgo (mínimo + 3)
    const stockCritico = products.filter(p => p.stock <= (Number(p.minStock) + 3)).length;
    
    const unidadesTotales = products.reduce((acc, p) => acc + Number(p.stock), 0);

    document.getElementById('metric-total').textContent = totalProductos;
    document.getElementById('metric-critico').textContent = stockCritico;
    document.getElementById('metric-unidades').textContent = unidadesTotales;
}

// Función para renderizar (dibujar) los productos en la tabla y en el panel lateral de alertas
// Función para renderizar (dibujar) los productos separando inventario y alertas
function renderProducts() {
    productList.innerHTML = ''; // Limpiamos la tabla
    const alertsList = document.getElementById('alerts-list');
    if (alertsList) alertsList.innerHTML = ''; // Limpiamos el panel lateral

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // 1. Separamos los productos en dos grupos según su stock
    const warningProducts = [];
    const normalProducts = [];

    products.forEach(product => {
        const margenAdvertencia = Number(product.minStock) + 3;
        if (product.stock <= margenAdvertencia) {
            warningProducts.push(product);
        } else {
            normalProducts.push(product);
        }
    });

    // 2. Filtramos los productos normales según el buscador de la tabla
    let displayedNormalProducts = normalProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.category.toLowerCase().includes(searchTerm)
    );

    // 3. Ordenamiento alfabético si está activo
    if (isSorted) {
        displayedNormalProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    // --- RENDERIZAR PANEL LATERAL DE ALERTAS ---
    if (alertsList) {
        if (warningProducts.length === 0) {
            alertsList.innerHTML = `<p class="no-alerts">✅ Todo en orden. No hay productos con stock bajo.</p>`;
        } else {
            warningProducts.forEach(product => {
                const realIndex = products.indexOf(product);
                const isCriticoReal = product.stock <= product.minStock;
                const alertItem = document.createElement('div');
                alertItem.className = `alert-item ${isCriticoReal ? 'critico-real' : 'advertencia-real'}`;
                
                alertItem.innerHTML = `
                    <div class="alert-info">
                        <strong>${product.name}</strong>
                        <span>Stock: <strong>${product.stock}</strong> (Mín: ${product.minStock})</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span class="alert-badge">${isCriticoReal ? '⚠️ Crítico' : '⚡ Bajo'}</span>
                        <!-- Botones rápidos también en la alerta para sumar stock al instante -->
                        <button class="btn-stock" onclick="updateStock(${realIndex}, 1)" title="Sumar 1">+</button>
                    </div>
                `;
                alertsList.appendChild(alertItem);
            });
        }
    }

    // --- RENDERIZAR TABLA PRINCIPAL (Solo productos en estado óptimo) ---
    if (displayedNormalProducts.length === 0) {
        productList.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b;">No hay productos óptimos para mostrar.</td></tr>`;
        return;
    }

    displayedNormalProducts.forEach((product) => {
        const realIndex = products.indexOf(product);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td><strong>${product.stock}</strong></td>
            <td>${product.minStock}</td>
            <td>✅ Óptimo</td>
            <td>
                <button class="btn-stock" onclick="updateStock(${realIndex}, -1)">-</button>
                <button class="btn-stock" onclick="updateStock(${realIndex}, 1)">+</button>
                <button class="btn-delete" onclick="deleteProduct(${realIndex})">Eliminar</button>
            </td>
        `;

        productList.appendChild(row);
    });
}

renderProducts();
updateMetrics();