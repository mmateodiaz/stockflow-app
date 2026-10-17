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
    renderPriceList();
    renderDrinks();
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

    // --- RENDERIZAR TABLA DE PRODUCTOS CRÍTICOS EN LA TARJETA ---
const criticalListContainer = document.getElementById('critical-products-list');
if (criticalListContainer) {
    criticalListContainer.innerHTML = '';

    // Filtramos los productos en estado crítico (menor o igual al stock mínimo o margen de advertencia)
    const criticalProducts = products.filter(p => Number(p.stock) <= Number(p.minStock || 5));

    if (criticalProducts.length === 0) {
        criticalListContainer.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #059669; font-weight: 600; padding: 10px;">¡Excelente! No hay stock crítico.</td></tr>`;
    } else {
        criticalProducts.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${product.name}</strong><br><span style="font-size: 0.75rem; color: #64748b;">Mín: ${product.minStock || 5}</span></td>
                <td style="color: #dc2626; font-weight: bold;">${product.stock} un.</td>
                <td style="text-align: right;">
                    <a href="grafico-producto.html?nombre=${encodeURIComponent(product.name)}" target="_blank" style="padding: 4px 8px; font-size: 0.75rem; text-decoration: none; border-radius: 4px; background: #fee2e2; color: #991b1b; font-weight: 600;" title="Ver Gráfico">📈 Gráfico</a>
                </td>
            `;
            criticalListContainer.appendChild(row);
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
                <a href="grafico-producto.html?nombre=${encodeURIComponent(product.name)}" target="_blank" style="padding: 4px 8px; font-size: 0.75rem; text-decoration: none; border-radius: 4px; background: #e0e7ff; color: #3730a3; margin-left: 4px;" title="Ver Gráfico de Rendimiento">📈 Gráfico</a>
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

// Lógica para importar productos desde un archivo Excel o CSV (Evita duplicados y actualiza)
const excelUpload = document.getElementById('excel-upload');

if (excelUpload) {
    excelUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const importedProducts = jsonData.map(row => ({
                    name: String(row.Nombre || row.producto || row.PRODUCTO || row.Name || 'Sin nombre').trim(),
                    category: String(row.Categoría || row.Categoria || row.CATEGORIA || row.Category || 'General').trim(),
                    stock: parseInt(row.Stock || row.STOCK || row.stock || 0),
                    minStock: parseInt(row.Minimo || row.Mínimo || row.MINIMO || row.minStock || 5),
                    price: parseFloat(row.Precio || row.PRECIO || row.precio || 0)
                })).filter(p => p.name !== 'Sin nombre');

                let countNew = 0;
                let countUpdated = 0;

                importedProducts.forEach(impProd => {
                    const existingIndex = products.findIndex(p => p.name.toLowerCase() === impProd.name.toLowerCase());
                    
                    if (existingIndex !== -1) {
                        products[existingIndex] = impProd;
                        countUpdated++;
                    } else {
                        products.push(impProd);
                        countNew++;
                    }
                });

                saveAndRender();
                alert(`¡Proceso exitoso! Se agregaron ${countNew} nuevos y se actualizaron ${countUpdated} productos existentes.`);
            } catch (error) {
                console.error(error);
                alert('Hubo un error al leer el archivo Excel.');
            }
            excelUpload.value = '';
        };
        reader.readAsArrayBuffer(file);
    });
}

// Formulario manual con precio y control de duplicados
if (productForm) {
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const category = document.getElementById('category').value.trim();
        const stock = parseInt(document.getElementById('stock').value);
        const minStock = parseInt(document.getElementById('minStock').value);
        const price = parseFloat(document.getElementById('price').value) || 0;

        if (!name) return;

        const newProduct = { name, category, stock, minStock, price };

        const existingIndex = products.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
        if (existingIndex !== -1) {
            products[existingIndex] = newProduct;
        } else {
            products.push(newProduct);
        }

        saveAndRender();
        productForm.reset();
    });
}

// Renderizar la lista de precios (Solo muestra productos con precio mayor a 0)
function renderPriceList() {
    const priceListContainer = document.getElementById('price-list');
    if (!priceListContainer) return;

    priceListContainer.innerHTML = '';

    const pricedProducts = products.filter(product => Number(product.price) > 0);

    if (pricedProducts.length === 0) {
        priceListContainer.innerHTML = `<tr><td colspan="2" style="text-align: center; color: #64748b;">No hay productos con precio cargado para mostrar.</td></tr>`;
        return;
    }

    pricedProducts.forEach(product => {
        const row = document.createElement('tr');
        const formattedPrice = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.price);

        row.innerHTML = `
            <td><strong>${product.name}</strong></td>
            <td style="text-align: right; color: #059669; font-weight: 600;">${formattedPrice}</td>
        `;
        priceListContainer.appendChild(row);
    });
}
// --- RENDERIZAR LA SECCIÓN EXCLUSIVA DE BEBIDAS ---
function renderDrinks() {
    const drinksListContainer = document.getElementById('drinks-list');
    if (!drinksListContainer) return;

    drinksListContainer.innerHTML = '';

    // Filtramos los productos cuya categoría sea Bebidas o contenga términos relacionados
    const drinkProducts = products.filter(product => {
        const cat = (product.category || '').toLowerCase();
        return cat.includes('bebida') || cat.includes('alcohol') || cat.includes('jugo') || cat.includes('agua') || cat.includes('gaseosa') || cat.includes('vino') || cat.includes('cerveza');
    });

    if (drinkProducts.length === 0) {
        drinksListContainer.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #64748b;">No hay bebidas cargadas en el inventario.</td></tr>`;
        return;
    }

    drinkProducts.forEach(product => {
        const row = document.createElement('tr');
        const formattedPrice = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.price || 0);

        row.innerHTML = `
            <td><strong>${product.name}</strong></td>
            <td><span style="background: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">${product.category}</span></td>
            <td>${product.stock}</td>
            <td style="text-align: right; color: #059669; font-weight: 600;">${formattedPrice}</td>
        `;
        drinksListContainer.appendChild(row);
    });
}
// --- LÓGICA DEL MENÚ DESPLEGABLE DE TRES PUNTITOS ---
const menuBtn = document.getElementById('menu-btn');
const dropdownMenu = document.getElementById('dropdown-menu');

if (menuBtn && dropdownMenu) {
    // Abrir/Cerrar menú al hacer clic en los tres puntitos
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Cerrar el menú si se hace clic fuera
    document.addEventListener('click', () => {
        dropdownMenu.style.display = 'none';
    });
}

// Opción 1: Ver Valor Total del Inventario
document.getElementById('opt-total-inventory')?.addEventListener('click', () => {
    const totalValue = products.reduce((acc, p) => acc + ((p.price || 0) * (p.stock || 0)), 0);
    const formattedTotal = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalValue);
    alert(`📊 El valor total monetario del inventario actual es: ${formattedTotal}`);
});

// Opción 2: Ver Total de Bebidas
document.getElementById('opt-total-drinks')?.addEventListener('click', () => {
    const drinkProducts = products.filter(product => {
        const cat = (product.category || '').toLowerCase();
        return cat.includes('bebida') || cat.includes('alcohol') || cat.includes('jugo') || cat.includes('agua') || cat.includes('gaseosa') || cat.includes('vino') || cat.includes('cerveza');
    });
    const totalDrinksStock = drinkProducts.reduce((acc, p) => acc + (p.stock || 0), 0);
    alert(`🥤 Tenés un total de ${drinkProducts.length} tipos de bebidas registradas, sumando un stock total de ${totalDrinksStock} unidades.`);
});

// Opción 3: Ver Productos Faltantes / Críticos
document.getElementById('opt-missing-products')?.addEventListener('click', () => {
    const missing = products.filter(p => (p.stock || 0) <= (p.minStock || 5));
    if (missing.length === 0) {
        alert(`⚠️ ¡Excelente! No hay productos en estado crítico o faltantes.`);
    } else {
        const names = missing.map(p => `• ${p.name} (Stock: ${p.stock})`).join('\n');
        alert(`⚠️ Productos críticos o faltantes:\n\n${names}`);
    }
});

// --- LÓGICA DE ESCANEO DE FACTURA POR FOTO ---
const btnScanInvoice = document.getElementById('btn-scan-invoice');
const invoiceUpload = document.getElementById('invoice-upload');
const scanStatus = document.getElementById('scan-status');

if (btnScanInvoice && invoiceUpload) {
    btnScanInvoice.addEventListener('click', () => {
        invoiceUpload.click(); // Dispara el selector de archivos / cámara
    });

    invoiceUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        scanStatus.textContent = '🔍 Procesando imagen de la factura con IA...';

        const reader = new FileReader();
        reader.onload = function(uploadEvent) {
            // Simulamos el tiempo de análisis de la imagen de la factura
            setTimeout(() => {
                // Simulamos productos detectados automáticamente en la factura escaneada
                const productsFromInvoice = [
                    { name: 'Gaseosa Cola 1.5L (Factura)', category: 'Bebidas / Gaseosas', stock: 24, minStock: 5, price: 2100 },
                    { name: 'Alfajor de Chocolate (Factura)', category: 'Almacén', stock: 30, minStock: 10, price: 800 }
                ];

                let countNew = 0;
                let countUpdated = 0;

                productsFromInvoice.forEach(invProd => {
                    const existingIndex = products.findIndex(p => p.name.toLowerCase() === invProd.name.toLowerCase());
                    if (existingIndex !== -1) {
                        products[existingIndex].stock += invProd.stock; // Sumamos al stock existente
                        products[existingIndex].price = invProd.price; // Actualizamos precio de factura
                        countUpdated++;
                    } else {
                        products.push(invProd);
                        countNew++;
                    }
                });

                saveAndRender();
                scanStatus.textContent = `✅ ¡Factura procesada con éxito! (${countNew} nuevos, ${countUpdated} actualizados).`;
                invoiceUpload.value = '';
            }, 1500);
        };
        reader.readAsDataURL(file);
    });
}

// Llamada inicial para renderizar la lista de precios al cargar la página
renderPriceList();
renderDrinks();