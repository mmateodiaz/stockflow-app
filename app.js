// Seleccionamos los elementos del DOM
const productForm = document.getElementById('product-form');
const productList = document.getElementById('product-list');

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

    if (products.length === 0) {
        productList.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b;">No hay productos registrados.</td></tr>`;
        return;
    }

    products.forEach((product, index) => {
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
                <button class="btn-delete" onclick="deleteProduct(${index})">Eliminar</button>
            </td>
        `;

        productList.appendChild(row);
    });
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

// Función para eliminar un producto
window.deleteProduct = function(index) {
    products.splice(index, 1);
    saveAndRender();
}

// Renderizamos la tabla al cargar la página por primera vez
renderProducts();