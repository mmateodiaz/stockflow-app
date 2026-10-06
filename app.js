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
function renderProducts() {
    productList.innerHTML = ''; // Limpiamos la tabla antes de redibujar
    const alertsList = document.getElementById('alerts-list');
    if (alertsList) alertsList.innerHTML = ''; // Limpiamos el panel lateral

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let displayedProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.category.toLowerCase().includes(searchTerm)
    );

    if (isSorted) {
        displayedProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (displayedProducts.length === 0) {
        productList.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b;">No se encontraron productos.</td></tr>`;
    }

    // Filtrar productos para el panel lateral (solo los que están en advertencia o crítico)
    const warningProducts = products.filter(product => {
        const margenAdvertencia = Number(product.minStock) + 3;
        return product.stock <= margenAdvertencia;
    });

    // Renderizar panel lateral de alertas
    if (alertsList) {
        if (warningProducts.length === 0) {
            alertsList.innerHTML = `<p class="no-alerts">✅ Todo en orden. No hay productos con stock bajo.</p>`;
        } else {
            warningProducts.forEach(product => {
                const isCriticoReal = product.stock <= product.minStock;
                const alertItem = document.createElement('div');
                alertItem.className = `alert-item ${isCriticoReal ? 'critico-real' : 'advertencia-real'}`;
                
                alertItem.innerHTML = `
                    <div class="alert-info">
                        <strong>${product.name}</strong>
                        <span>Stock: <strong>${product.stock}</strong> (Mín: ${product.minStock})</span>
                    </div>
                    <span class="alert-badge">${isCriticoReal ? '⚠️ Crítico' : '⚡ Bajo'}</span>
                `;
                alertsList.appendChild(alertItem);
            });
        }
    }

    // Renderizar filas de la tabla principal
    displayedProducts.forEach((product) => {
        const realIndex = products.indexOf(product);
        const margenAdvertencia = Number(product.minStock) + 3;
        const isAdvertencia = product.stock <= margenAdvertencia;
        const isCriticoReal = product.stock <= product.minStock;

        const row = document.createElement('tr');
        if (isAdvertencia) {
            row.classList.add('critico');
        }

        let estadoTexto = '✅ Óptimo';
        if (isCriticoReal) {
            estadoTexto = '⚠️ ¡Stock Crítico!';
        } else if (isAdvertencia) {
            estadoTexto = '⚠️ Acercándose al mínimo';
        }

        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td><strong>${product.stock}</strong></td>
            <td>${product.minStock}</td>
            <td>${estadoTexto}</td>
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