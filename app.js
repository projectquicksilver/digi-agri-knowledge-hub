// Global variables
let allProducts = [];
let filteredProducts = [];
let currentViewMode = 'grid';
let currentPage = 1;
let productsPerPage = 51;
let currentSort = 'default'; // default, name-asc, name-desc, company-asc, company-desc
const EXCEL_FILE_URL = './agrihubdb.xlsx';

// Wait for page to load
window.addEventListener('load', function() {
    console.log('Page loaded, initializing...');
    initializeApp();
});

function initializeApp() {
    // Initialize theme
    initializeTheme();
    
    // Set up event listeners
    document.getElementById('retry-btn').addEventListener('click', loadExcelData);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    document.getElementById('clear-all-filters-btn').addEventListener('click', clearFilters);
    document.getElementById('clear-filters-btn-2').addEventListener('click', clearFilters);
    
    document.getElementById('grid-view-btn').addEventListener('click', function() {
        setViewMode('grid');
    });
    document.getElementById('list-view-btn').addEventListener('click', function() {
        setViewMode('list');
    });
    
    // Sorting
    document.getElementById('sort-filter').addEventListener('change', function() {
        currentSort = this.value;
        currentPage = 1; // Reset to first page when sorting
        applyFilters();
    });
    
    // Universal search with debounce
    let searchTimeout;
    document.getElementById('universal-search').addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyFilters, 300);
    });
    
    // Filter listeners
    document.getElementById('company-filter').addEventListener('change', applyFilters);
    document.getElementById('type-filter').addEventListener('change', applyFilters);
    document.getElementById('crop-filter').addEventListener('change', applyFilters);
    document.getElementById('sidebar-type-filter').addEventListener('change', applyFilters);
    document.getElementById('season-filter').addEventListener('change', applyFilters);
    document.getElementById('organic-filter').addEventListener('change', applyFilters);
    
    document.getElementById('product-name-filter').addEventListener('change', applyFilters);
    document.getElementById('brand-name-filter').addEventListener('change', applyFilters);
    document.getElementById('crops-filter').addEventListener('change', applyFilters);
    
    document.getElementById('product-modal-overlay').addEventListener('click', closeProductModal);
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductModal();
        }
    });
    
    // Load data
    loadExcelData();
}

async function loadExcelData() {
    console.log('Loading Excel data...');
    showLoading();
    hideError();
    hideProducts();

    try {
        const response = await fetch(EXCEL_FILE_URL);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch Excel file: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        parseExcelData(data);
    } catch (err) {
        console.error('Error loading Excel file:', err);
        showError(err.message || 'Failed to load product data. Please ensure agrihubdb.xlsx is in the same folder as this HTML file.');
    }
}

function parseExcelData(data) {
    try {
        console.log('Parsing Excel data...');
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        allProducts = jsonData.map((row, index) => ({
            id: index + 1,
            sno: row['S.No'] || index + 1,
            company: row['Company Name'] || 'N/A',
            name: row['Product Name'] || 'Unnamed Product',
            brandName: row['Brand Name'] || '',
            description: row['Description of the Product'] || 'No description available',
            type: row['Product Type'] || 'Other',
            subType: row['Sub-Type'] || '',
            appliedSeasons: row['Applied Seasons'] || '',
            suitableCrops: row['Suitable Crops'] ? row['Suitable Crops'].split(',').map(c => c.trim()) : [],
            benefits: row['Benefits'] || '',
            dosage: row['Dosage (Unit/acre)'] || 'Not Available',
            applicationMethod: row['Application Method'] || '',
            packSizes: row['Pack Sizes'] || '',
            priceRange: row['Price Range'] || 'Not Available',
            availableIn: row['Available In (States)'] || '',
            organic: row['Organic/Certified'] === 'Yes' || row['Organic/Certified'] === 'yes',
            imageLink: row['Product Image Link'] || '',
            sourceUrl: row['Source URL'] || '',
            notes: row['Notes'] || ''
        }));

        console.log(`✅ Loaded ${allProducts.length} products successfully`);
        
        populateFilterOptions();
        updateStats();
        applyFilters();
        hideLoading();
        showProducts();
        
    } catch (error) {
        console.error('Error parsing Excel data:', error);
        showError('Failed to parse Excel file. Please check the file format.');
    }
}

function populateFilterOptions() {
    // Initial population with all products
    updateFilterOptions(allProducts);
}

function updateFilterOptions(productsToFilter) {
    // Get current selections
    const currentCompany = document.getElementById('company-filter').value;
    const currentType = document.getElementById('type-filter').value;
    const currentCrop = document.getElementById('crop-filter').value;
    const currentSeason = document.getElementById('season-filter').value;
    const currentProduct = document.getElementById('product-name-filter').value;
    const currentBrand = document.getElementById('brand-name-filter').value;
    const currentSidebarCrop = document.getElementById('crops-filter').value;
    const currentSidebarType = document.getElementById('sidebar-type-filter').value;

    // Companies
    const companies = [...new Set(productsToFilter.map(p => p.company))].sort();
    updateSelectOptions('company-filter', companies, currentCompany, 'All Companies');

    // Product Types
    const types = [...new Set(productsToFilter.map(p => p.type))].filter(t => t).sort();
    updateSelectOptions('type-filter', types, currentType, 'All Product Types');
    updateSelectOptions('sidebar-type-filter', types, currentSidebarType, 'All types');

    // Crops - Extract all unique crops
    const allCrops = new Set();
    productsToFilter.forEach(p => {
        p.suitableCrops.forEach(crop => {
            if (crop) allCrops.add(crop);
        });
    });
    const cropsArray = [...allCrops].sort();
    updateSelectOptions('crop-filter', cropsArray, currentCrop, 'All Crops');
    updateSelectOptions('crops-filter', cropsArray, currentSidebarCrop, 'All Crops');

    // Product Names
    const productNames = [...new Set(productsToFilter.map(p => p.name))].sort();
    updateSelectOptions('product-name-filter', productNames, currentProduct, 'All Products');

    // Brand Names
    const brandNames = [...new Set(productsToFilter.map(p => p.brandName).filter(b => b))].sort();
    updateSelectOptions('brand-name-filter', brandNames, currentBrand, 'All Brands');
}

function updateSelectOptions(elementId, options, currentValue, allLabel) {
    const select = document.getElementById(elementId);
    const valueExists = options.includes(currentValue);
    
    select.innerHTML = `<option value="all">${allLabel}</option>` + 
        options.map(option => `<option value="${option}">${option}</option>`).join('');
    
    // Restore previous selection if it still exists, otherwise set to 'all'
    select.value = valueExists ? currentValue : 'all';
}

function updateStats(products = allProducts) {
    document.getElementById('stat-total').textContent = products.length;
    document.getElementById('stat-companies').textContent = new Set(products.map(p => p.company)).size;
}

function applyFilters() {
    const universalSearch = document.getElementById('universal-search').value.toLowerCase();
    const productNameFilter = document.getElementById('product-name-filter').value;
    const brandNameFilter = document.getElementById('brand-name-filter').value;
    const cropsFilter = document.getElementById('crops-filter').value;
    const companyFilter = document.getElementById('company-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    const cropFilter = document.getElementById('crop-filter').value;
    const sidebarTypeFilter = document.getElementById('sidebar-type-filter').value;
    const seasonFilter = document.getElementById('season-filter').value;
    const organicFilter = document.getElementById('organic-filter').checked;

    // Reset to page 1 when filters change
    currentPage = 1;

    // Step 1: Filter products based on current selections
    filteredProducts = allProducts.filter(product => {
        // Universal search
        const matchesUniversalSearch = universalSearch === '' || 
            product.name.toLowerCase().includes(universalSearch) ||
            product.brandName.toLowerCase().includes(universalSearch) ||
            product.company.toLowerCase().includes(universalSearch) ||
            product.description.toLowerCase().includes(universalSearch) ||
            product.suitableCrops.some(crop => crop.toLowerCase().includes(universalSearch));

        const matchesProductName = productNameFilter === 'all' || product.name === productNameFilter;
        const matchesBrandName = brandNameFilter === 'all' || product.brandName === brandNameFilter;
        const matchesCrops = cropsFilter === 'all' || product.suitableCrops.includes(cropsFilter);
        const matchesCrop = cropFilter === 'all' || product.suitableCrops.includes(cropFilter);
        const matchesCompany = companyFilter === 'all' || product.company === companyFilter;
        const matchesType = (typeFilter === 'all' && sidebarTypeFilter === 'all') || 
                           product.type === typeFilter || 
                           product.type === sidebarTypeFilter;
        const matchesSeason = seasonFilter === 'all' || 
                             (product.appliedSeasons && product.appliedSeasons.includes(seasonFilter));
        const matchesOrganic = !organicFilter || product.organic;

        return matchesUniversalSearch && matchesProductName && matchesBrandName && 
               matchesCrops && matchesCrop && matchesCompany && matchesType && 
               matchesSeason && matchesOrganic;
    });

    // Step 2: Apply sorting
    applySorting();

    // Step 3: Update filter options based on filtered results
    // This creates the interconnected behavior
    updateFilterOptions(filteredProducts);

    // Step 4: Update stats with filtered products
    updateStats(filteredProducts);

    // Step 5: Display filtered products
    displayProducts();
}

function applySorting() {
    switch(currentSort) {
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'company-asc':
            filteredProducts.sort((a, b) => a.company.localeCompare(b.company));
            break;
        case 'company-desc':
            filteredProducts.sort((a, b) => b.company.localeCompare(a.company));
            break;
        case 'price-asc':
            filteredProducts.sort((a, b) => {
                const priceA = extractPrice(a.priceRange);
                const priceB = extractPrice(b.priceRange);
                return priceA - priceB;
            });
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => {
                const priceA = extractPrice(a.priceRange);
                const priceB = extractPrice(b.priceRange);
                return priceB - priceA;
            });
            break;
        default:
            // Keep original order
            break;
    }
}

function extractPrice(priceRange) {
    if (!priceRange || priceRange === 'Not Available') return 0;
    // Extract first number from price range
    const match = priceRange.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
}

function displayProducts() {
    const container = document.getElementById('products-container');
    const noResults = document.getElementById('no-results');
    const paginationContainer = document.getElementById('pagination-container');
    
    document.getElementById('filtered-count').textContent = filteredProducts.length;
    document.getElementById('total-count').textContent = allProducts.length;

    if (filteredProducts.length === 0) {
        container.innerHTML = '';
        noResults.classList.remove('hidden');
        paginationContainer.classList.add('hidden');
        return;
    }

    noResults.classList.add('hidden');
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = Math.min(startIndex + productsPerPage, filteredProducts.length);
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    // Display products for current page
    container.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
    
    // Update pagination info
    document.getElementById('page-start').textContent = startIndex + 1;
    document.getElementById('page-end').textContent = endIndex;
    document.getElementById('page-total').textContent = filteredProducts.length;
    
    // Show/hide pagination
    if (totalPages > 1) {
        paginationContainer.classList.remove('hidden');
        renderPagination(totalPages);
    } else {
        paginationContainer.classList.add('hidden');
    }
    
    // Scroll to top of products
    document.getElementById('products-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderPagination(totalPages) {
    const paginationContainer = document.getElementById('pagination-container').querySelector('div');
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''} 
                class="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
        </button>
    `;
    
    // Page numbers with smart truncation
    const maxVisiblePages = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page
    if (startPage > 1) {
        paginationHTML += `
            <button onclick="changePage(1)" 
                    class="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm">
                1
            </button>
        `;
        if (startPage > 2) {
            paginationHTML += `<span class="px-2 text-gray-500">...</span>`;
        }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})" 
                    class="px-4 py-2 ${i === currentPage ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'} rounded-lg transition-all font-medium text-sm">
                ${i}
            </button>
        `;
    }
    
    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="px-2 text-gray-500">...</span>`;
        }
        paginationHTML += `
            <button onclick="changePage(${totalPages})" 
                    class="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm">
                ${totalPages}
            </button>
        `;
    }
    
    // Next button
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''} 
                class="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
        </button>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    displayProducts();
}

function setViewMode(mode) {
    console.log('Setting view mode:', mode);
    currentViewMode = mode;
    const gridBtn = document.getElementById('grid-view-btn');
    const listBtn = document.getElementById('list-view-btn');
    const container = document.getElementById('products-container');

    if (mode === 'grid') {
        gridBtn.className = 'p-2.5 bg-white text-green-600 rounded-lg shadow-sm transition-all';
        listBtn.className = 'p-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all';
        container.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6';
    } else {
        gridBtn.className = 'p-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all';
        listBtn.className = 'p-2.5 bg-white text-green-600 rounded-lg shadow-sm transition-all';
        container.className = 'space-y-6';
    }

    displayProducts();
}

function clearFilters() {
    console.log('Clearing filters...');
    document.getElementById('universal-search').value = '';
    document.getElementById('product-name-filter').value = 'all';
    document.getElementById('brand-name-filter').value = 'all';
    document.getElementById('crops-filter').value = 'all';
    document.getElementById('crop-filter').value = 'all';
    document.getElementById('company-filter').value = 'all';
    document.getElementById('type-filter').value = 'all';
    document.getElementById('sidebar-type-filter').value = 'all';
    document.getElementById('season-filter').value = 'all';
    document.getElementById('organic-filter').checked = false;
    document.getElementById('sort-filter').value = 'default';
    currentSort = 'default';
    currentPage = 1;
    applyFilters();
}

function createProductCard(product) {
    const isListView = currentViewMode === 'list';
    
    return `
        <div class="product-card bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden ${isListView ? 'flex flex-col sm:flex-row' : ''} fade-in" onclick="openProductModal(${product.id})">
            <div class="${isListView ? 'w-full sm:w-48 h-48 sm:h-auto flex-shrink-0' : 'h-48'} bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center overflow-hidden relative">
                ${product.imageLink && product.imageLink !== 'Not Available' && product.imageLink.startsWith('http') ? 
                    `<img src="${product.imageLink}" 
                          alt="${product.name}" 
                          class="w-full h-full object-cover"
                          onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\' viewBox=\\'0 0 200 200\\'%3E%3Crect fill=\\'%23f0fdf4\\' width=\\'200\\' height=\\'200\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-family=\\'sans-serif\\' font-size=\\'14\\' fill=\\'%239ca3af\\'%3ENo Image%3C/text%3E%3C/svg%3E'">` 
                    : 
                    `<div class="text-gray-400 text-sm flex flex-col items-center gap-2">
                        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span class="font-medium text-xs">No Image</span>
                    </div>`
                }
                ${product.organic ? '<div class="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">✓ Organic</div>' : ''}
            </div>
            
            <div class="p-5 flex-1">
                <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">${product.company}</p>
                
                <h3 class="text-lg font-bold text-gray-900 mb-2 hover:text-green-600 transition-colors line-clamp-2">${product.name}</h3>
                
                ${product.brandName ? `<p class="text-sm text-green-600 font-semibold mb-3">${product.brandName}</p>` : ''}
                
                <div class="flex flex-wrap gap-2 mb-3">
                    ${product.type ? `<span class="badge bg-green-50 text-green-700 border border-green-200">${product.type}</span>` : ''}
                    ${product.appliedSeasons ? `<span class="badge bg-amber-50 text-amber-700 border border-amber-200">${product.appliedSeasons}</span>` : ''}
                </div>

                ${product.description && product.description !== 'No description available' ? 
                    `<p class="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">${product.description}</p>` : ''}

                <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <span class="text-gray-500 font-medium">View Details</span>
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </div>
            </div>
        </div>
    `;
}

function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('product-modal');
    const overlay = document.getElementById('product-modal-overlay');

    modal.innerHTML = `
        <button onclick="closeProductModal()" class="absolute top-4 right-4 z-10 p-2.5 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>

        <div class="relative h-80 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center overflow-hidden">
            ${product.imageLink && product.imageLink !== 'Not Available' && product.imageLink.startsWith('http') ? 
                `<img src="${product.imageLink}" 
                      alt="${product.name}" 
                      class="w-full h-full object-cover"
                      onerror="this.style.display='none'; this.parentElement.innerHTML += '<div class=\\'flex flex-col items-center gap-4 text-gray-400\\'><svg class=\\'w-20 h-20\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z\\'></path></svg><span class=\\'text-lg font-semibold\\'>No Image Available</span></div>';">
                 <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);"></div>
                 <div style="position: absolute; bottom: 24px; left: 24px; right: 24px;">
                    <h2 class="text-3xl font-bold text-white mb-2" style="text-shadow: 0 2px 10px rgba(0,0,0,0.5);">${product.name}</h2>
                    ${product.brandName ? `<p class="text-lg text-green-200 font-semibold">${product.brandName}</p>` : ''}
                 </div>` 
                : 
                `<div class="text-center">
                    <svg class="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">${product.name}</h2>
                    ${product.brandName ? `<p class="text-lg text-green-600 font-semibold">${product.brandName}</p>` : ''}
                 </div>`
            }
        </div>

        <div class="p-8">
            <div class="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                <div class="flex items-center gap-3">
                    <div class="bg-green-100 p-2.5 rounded-xl">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 font-medium">Manufacturer</p>
                        <p class="text-base font-bold text-gray-900">${product.company}</p>
                    </div>
                </div>
                ${product.organic ? '<span class="badge bg-green-600 text-white">✓ Organic</span>' : ''}
            </div>

            <div class="flex flex-wrap gap-2 mb-6">
                ${product.type ? `<span class="badge bg-green-50 text-green-700 border border-green-200">${product.type}</span>` : ''}
                ${product.subType ? `<span class="badge bg-blue-50 text-blue-700 border border-blue-200">${product.subType}</span>` : ''}
                ${product.appliedSeasons ? `<span class="badge bg-amber-50 text-amber-700 border border-amber-200">${product.appliedSeasons}</span>` : ''}
            </div>

            ${product.description && product.description !== 'No description available' ? 
                `<div class="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-500">
                    <h3 class="text-base font-bold text-gray-900 mb-2">Description</h3>
                    <p class="text-gray-700 text-sm leading-relaxed">${product.description}</p>
                </div>` : ''}

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                ${product.suitableCrops && product.suitableCrops.length > 0 && product.suitableCrops[0] !== '' ? 
                    `<div class="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                        <div class="flex items-start gap-3">
                            <div class="bg-green-100 p-2 rounded-lg flex-shrink-0">
                                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                                </svg>
                            </div>
                            <div>
                                <p class="text-xs font-semibold text-gray-500 mb-1">Suitable Crops</p>
                                <p class="text-sm font-bold text-gray-900">${product.suitableCrops.join(', ')}</p>
                            </div>
                        </div>
                    </div>` : ''}
                
                ${product.dosage && product.dosage !== 'Not Available' ? 
                    `<div class="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                        <div class="flex items-start gap-3">
                            <div class="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                                </svg>
                            </div>
                            <div>
                                <p class="text-xs font-semibold text-gray-500 mb-1">Dosage</p>
                                <p class="text-sm font-bold text-gray-900">${product.dosage}</p>
                            </div>
                        </div>
                    </div>` : ''}
                
                ${product.priceRange && product.priceRange !== 'Not Available' ? 
                    `<div class="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                        <div class="flex items-start gap-3">
                            <div class="bg-amber-100 p-2 rounded-lg flex-shrink-0">
                                <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                                </svg>
                            </div>
                            <div>
                                <p class="text-xs font-semibold text-gray-500 mb-1">Price Range</p>
                                <p class="text-sm font-bold text-gray-900">${product.priceRange}</p>
                            </div>
                        </div>
                    </div>` : ''}
                
                ${product.applicationMethod ? 
                    `<div class="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                        <div class="flex items-start gap-3">
                            <div class="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"></path>
                                </svg>
                            </div>
                            <div>
                                <p class="text-xs font-semibold text-gray-500 mb-1">Application</p>
                                <p class="text-sm font-bold text-gray-900">${product.applicationMethod}</p>
                            </div>
                        </div>
                    </div>` : ''}
            </div>

            ${product.benefits ? 
                `<div class="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
                    <h3 class="text-base font-bold text-gray-900 mb-2">Key Benefits</h3>
                    <p class="text-gray-700 text-sm leading-relaxed">${product.benefits}</p>
                </div>` : ''}

            <div class="flex gap-3 pt-6 border-t border-gray-200">
                <button onclick="closeProductModal()" class="w-full px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-bold text-sm shadow-lg">
                    Close
                </button>
            </div>
        </div>
    `;

    overlay.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    const overlay = document.getElementById('product-modal-overlay');
    
    modal.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error').classList.remove('hidden');
}

function hideError() {
    document.getElementById('error').classList.add('hidden');
}

function showProducts() {
    document.getElementById('products-section').classList.remove('hidden');
}

function hideProducts() {
    document.getElementById('products-section').classList.add('hidden');
}

// Theme Management Functions
function initializeTheme() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Add a small animation effect
    const button = document.getElementById('theme-toggle');
    button.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        button.style.transform = 'rotate(0deg)';
    }, 300);
}
