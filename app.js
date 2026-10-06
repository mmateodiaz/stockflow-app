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

function renderProducts() {
    productList.innerHTML = '';

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
        return;
    }

    displayedProducts.forEach((product) => {
        const realIndex = products.indexOf(product);
        
        // Margen preventivo: avisa si está en el mínimo o hasta 3 unidades por encima
        const margenAdvertencia = Number(product.minStock) + 3;
        const isAdvertencia = product.stock <= margenAdvertencia;
        const isCriticoReal = product.stock <= product.minStock;

        const row = document.createElement('tr');
        if (isAdvertencia) {
            row.classList.add('critico'); // Usa la misma clase visual de alerta
        }

        // Mensaje dinámico según qué tan al límite esté
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

if (btnSort) {
    btnSort.addEventListener('click', () => {
        isSorted = !isSorted;
        btnSort.textContent = isSorted ? '🔄 Restaurar Orden Original' : '🔤 Ordenar Alfabéticamente (A-Z)';
        btnSort.style.backgroundColor = isSorted ? '#0f172a' : '';
        btnSort.style.color = isSorted ? '#ffffff' : '';
        renderProducts();
    });
}

if (searchInput) {
    searchInput.addEventListener('input', renderProducts);
}

productForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const category = document.getElementById('category').value.trim();
    const stock = parseInt(document.getElementById('stock').value);
    const minStock = parseInt(document.getElementById('minStock').value);

    const newProduct = { name, category, stock, minStock };

    products.push(newProduct);
    saveAndRender();
    productForm.reset();
});

window.updateStock = function(index, change) {
    products[index].stock += change;
    if (products[index].stock < 0) {
        products[index].stock = 0;
    }
    saveAndRender();
}

window.deleteProduct = function(index) {
    products.splice(index, 1);
    saveAndRender();
}

renderProducts();
updateMetrics();