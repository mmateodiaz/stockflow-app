const productForm = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input'); // Capturamos el buscador

// Cargamos los productos guardados en el almacenamiento local o un array vacío si no hay nada
let products = JSON.parse(localStorage.getItem('stockflow_products')) || [];

// Función para guardar en localStorage y actualizar la vista
function saveAndRender() {
    localStorage.setItem('stockflow_products', JSON.stringify(products));
    renderProducts();
}

// Función para renderizar (dibujar) los productos en la tabla
function renderProducts() {
    productList.innerHTML = ''; // Limpiamos la tabla antes de redibujar

    // Obtenemos el texto que escribió el usuario en minúsculas para comparar bien
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Filtramos los productos que coincidan con el nombre o la categoría
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.category.toLowerCase().includes(searchTerm)
    );

    if (filteredProducts.length === 0) {
        productList.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b;">No se encontraron productos.</td></tr>`;
        return;
    }

    filteredProducts.forEach((product) => {
        // IMPORTANTE: Buscamos el índice real en el array original 'products' 
        // para que las acciones no fallen al estar filtrando.
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

// Evento para que el buscador filtre en tiempo real mientras escribís
if (searchInput) {
    searchInput.addEventListener('input', renderProducts);
}

// Función para agregar un producto nuevo
productForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita que la página se recargue por defecto

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

    productForm.reset(); // Limpia el formulario
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

// Función para eliminar un producto
window.deleteProduct = function(index) {
    products.splice(index, 1);
    saveAndRender();
}

// Renderizamos la tabla al cargar la página por primera vez
renderProducts();