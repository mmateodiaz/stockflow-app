const productForm = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const btnSort = document.getElementById('btn-sort'); // Capturamos el botón de ordenar

// Cargamos los productos guardados en el almacenamiento local o un array vacío si no hay nada
let products = JSON.parse(localStorage.getItem('stockflow_products')) || [];
let isSorted = false; // Estado para saber si está ordenado o no

// Función para guardar en localStorage y actualizar la vista
function saveAndRender() {
    localStorage.setItem('stockflow_products', JSON.stringify(products));
    renderProducts();
}

// Función para renderizar (dibujar) los productos en la tabla
function renderProducts() {
    productList.innerHTML = ''; // Limpiamos la tabla antes de redibujar

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Filtramos los productos
    let displayedProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.category.toLowerCase().includes(searchTerm)
    );

    // Si el botón de ordenamiento está activo, ordenamos alfabéticamente por nombre
    if (isSorted) {
        displayedProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (displayedProducts.length === 0) {
        productList.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b;">No se encontraron productos.</td></tr>`;
        return;
    }

    displayedProducts.forEach((product) => {
        // Buscamos el índice real en el array original para que las acciones no fallen
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

// Evento para activar/desactivar el orden alfabético
if (btnSort) {
    btnSort.addEventListener('click', () => {
        isSorted = !isSorted; // Alterna entre ordenado y desordenado
        btnSort.textContent = isSorted ? '🔄 Restaurar Orden Original' : '🔤 Ordenar Alfabéticamente (A-Z)';
        btnSort.style.backgroundColor = isSorted ? '#0f172a' : ''; // Cambia sutilmente el color si está activo
        btnSort.style.color = isSorted ? '#ffffff' : '';
        renderProducts();
    });
}

// Evento para el buscador en tiempo real
if (searchInput) {
    searchInput.addEventListener('input', renderProducts);
}

// Función para agregar un producto nuevo
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

// Función para cambiar el stock rápidamente
window.updateStock = function(index, change) {
    products[index].stock += change;
    if (products[index].stock < 0) {
        products[index].stock = 0;
    }
    saveAndRender();
}

// Función para eliminar un producto
window.deleteProduct = function(index) {
    products.splice(index, 1);
    saveAndRender();
}

// Renderizamos la tabla al cargar la página por primera vez
renderProducts();