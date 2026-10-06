const productForm = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const btnSort = document.getElementById('btn-sort');

// Cargamos los productos guardados en el almacenamiento local o un array vacío
let products = JSON.parse(localStorage.getItem('stockflow_products')) || [];
let isSorted = false;

function saveAndRender() {
    localStorage.setItem('stockflow_products', JSON.stringify(products));
    renderProducts();
    updateMetrics();
}

// Función segura para actualizar métricas (si no existen en el HTML, no rompe la app)
function updateMetrics() {
    const totalProductos = products.length;
    const stockCritico = products.filter(p => p.stock <= (Number(p.minStock) + 3)).length;
    const unidadesTotales = products.reduce((acc, p) => acc + Number(p.stock), 0);

    const elTotal = document.getElementById('metric-total');
    const elCritico = document.getElementById('metric-critico');
    const elUnidades = document.getElementById('metric-unidades');

    if (elTotal) elTotal.textContent = totalProductos;
    if (elCritico) elCritico.textContent = stockCritico;
    if (elUnidades) elUnidades.textContent = unidadesTotales;
}

// Función para renderizar productos, tabla y panel de alertas de forma segura
function renderProducts() {
    if (!productList) return; // Si no existe la lista, frena para evitar errores

    productList.innerHTML = ''; 
    const alertsList = document.getElementById('alerts-list');
    if (alertsList) alertsList.innerHTML = ''; 

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Separamos productos en advertencia/crítico vs normales
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

    let displayedNormalProducts = normalProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.category.toLowerCase().includes(searchTerm)
    );

    if (isSorted) {
        displayedNormalProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Renderizar panel lateral de alertas (si existe en el HTML)
    if (alertsList) {
        if (warningProducts.length === 0) {
            alertsList.innerHTML = `<p class="no-alerts">✅ Todo en orden. No hay stock bajo.</p>`;
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
                        <button class="btn-stock" onclick="updateStock(${realIndex}, 1)" title="Sumar 1">+</button>
                    </div>
                `;
                alertsList.appendChild(alertItem);
            });
        }
    }

    // Renderizar tabla principal
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

// Evento de ordenamiento
if (btnSort) {
    btnSort.addEventListener('click', () => {
        isSorted = !isSorted;
        btnSort.textContent = isSorted ? '🔄 Restaurar Orden Original' : '🔤 Ordenar Alfabéticamente (A-Z)';
        btnSort.style.backgroundColor = isSorted ? '#0f172a' : '';
        btnSort.style.color = isSorted ? '#ffffff' : '';
        renderProducts();
    });
}

// Evento de búsqueda
if (searchInput) {
    searchInput.addEventListener('input', renderProducts);
}

// Evento para agregar productos
if (productForm) {
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const category = document.getElementById('category').value.trim();
        const stock = parseInt(document.getElementById('stock').value);
        const minStock = parseInt(document.getElementById('minStock').value);

        if (!name) return;

        const newProduct = { name, category, stock, minStock };

        products.push(newProduct);
        saveAndRender();
        productForm.reset();
    });
}

// Funciones globales para los botones de la tabla y alertas
window.updateStock = function(index, change) {
    if (products[index]) {
        products[index].stock += change;
        if (products[index].stock < 0) {
            products[index].stock = 0;
        }
        saveAndRender();
    }
}

window.deleteProduct = function(index) {
    products.splice(index, 1);
    saveAndRender();
}

// Inicialización
renderProducts();
updateMetrics();