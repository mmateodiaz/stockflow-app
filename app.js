const productForm = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const btnSort = document.getElementById('btn-sort');

// Cargamos los productos guardados en el almacenamiento local o un array vacío si no hay nada
let products = JSON.parse(localStorage.getItem('stockflow_products')) || [];
let isSorted = false; // Estado para saber si el orden alfabético está activo

// Función para guardar en localStorage y actualizar tanto la vista como las métricas
function saveAndRender() {
    localStorage.setItem('stockflow_products', JSON.stringify(products));
    renderProducts();
    updateMetrics();
}

// Función para actualizar el panel de métricas rápidas (KPIs)
function updateMetrics() {
    const totalProductos = products.length;
    
    // Contamos cuántos productos tienen stock menor o igual al mínimo
    const stockCritico = products.filter(p => p.stock <= p.minStock).length;
    
    // Sumamos todas las unidades de stock disponibles
    const unidadesTotales = products.reduce((acc, p) => acc + Number(p.stock), 0);

    // Actualizamos los elementos en el HTML
    document.getElementById('metric-total').textContent = totalProductos;
    document.getElementById('metric-critico').textContent = stockCritico;
    document.getElementById('metric-unidades').textContent = unidadesTotales;
}

// Función para renderizar (dibujar) los productos en la tabla
function renderProducts() {
    productList.innerHTML = ''; // Limpiamos la tabla antes de redibujar

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Filtramos los productos por nombre o categoría
    let displayedProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.category.toLowerCase().includes(searchTerm)
    );

    // Si el orden alfabético está activado, ordenamos el array a mostrar
    if (isSorted) {
        displayedProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (displayedProducts.length === 0) {
        productList.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b;">No se encontraron productos.</td></tr>`;
        return;
    }

    displayedProducts.forEach((product) => {
        // Buscamos el índice real en el array original 'products' para que las acciones no fallen al filtrar u ordenar
        const realIndex = products.indexOf(product);
        const isCritico = product.stock <= product.minStock;
        
        const row = document.createElement('tr');
        if (isCritico) {
            row.classList.add('critico');
        }

        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td><strong>${product.stock}</strong></td>
            <td>${product.minStock}</td>
            <td>${isCritico ? '⚠️ Stock Crítico' : '✅ Óptimo'}</td>
            <td>
                <button class="btn-stock" onclick="updateStock(${realIndex}, -1)">-</button>
                <button class="btn-stock" onclick="updateStock(${realIndex}, 1)">+</button>
                <button class="btn-delete" onclick="deleteProduct(${realIndex})">Eliminar</button>
            </td>
        `;

        productList.appendChild(row);
    });
}

// Evento para activar o desactivar el orden alfabético (A-Z)
if (btnSort) {
    btnSort.addEventListener('click', () => {
        isSorted = !isSorted;
        btnSort.textContent = isSorted ? '🔄 Restaurar Orden Original' : '🔤 Ordenar Alfabéticamente (A-Z)';
        btnSort.style.backgroundColor = isSorted ? '#0f172a' : '';
        btnSort.style.color = isSorted ? '#ffffff' : '';
        renderProducts();
    });
}

// Evento para que el buscador filtre en tiempo real
if (searchInput) {
    searchInput.addEventListener('input', renderProducts);
}

// Función para agregar un producto nuevo mediante el formulario
productForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const category = document.getElementById('category').value.trim();
    const stock = parseInt(document.getElementById('stock').value);
    const minStock = parseInt(document.getElementById('minStock').value);

    const newProduct = {
        name,
        category,
        stock,
        minStock
    };

    products.push(newProduct);
    saveAndRender();

    productForm.reset();
});

// Función para cambiar el stock rápidamente con los botones + y -
window.updateStock = function(index, change) {
    products[index].stock += change;
    
    // Evitamos que el stock baje de 0
    if (products[index].stock < 0) {
        products[index].stock = 0;
    }
    
    saveAndRender();
}

// Función para eliminar un producto del inventario
window.deleteProduct = function(index) {
    products.splice(index, 1);
    saveAndRender();
}

// Renderizamos la tabla y las métricas al cargar la página por primera vez
renderProducts();
updateMetrics();