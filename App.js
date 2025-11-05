import React, { useState, useMemo, useEffect } from 'react';
import { Grid, List, Search, Filter, X, Leaf, Upload, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import './App.css';

function App() {
  const [viewMode, setViewMode] = useState('grid');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    productName: '',
    brandName: '',
    suitableCrops: '',
    productType: 'all'
  });
  const [companyFilter, setCompanyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // GitHub repository Excel file URL - UPDATE THIS WITH YOUR REPO NAME
  const EXCEL_FILE_URL = `${process.env.PUBLIC_URL}/agrihubdb.xlsx`;

  // Function to parse Excel data
  const parseExcelData = (data) => {
    try {
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const transformedProducts = jsonData.map((row, index) => ({
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
        organic: row['Organic/Certified'] === 'Yes',
        imageLink: row['Product Image Link'] || '',
        sourceUrl: row['Source URL'] || '',
        notes: row['Notes'] || '',
        availability: row['Available In (States)'] ? 'Available' : 'Not Available'
      }));

      return transformedProducts;
    } catch (error) {
      console.error('Error parsing Excel data:', error);
      throw new Error('Failed to parse Excel file');
    }
  };

  // Load Excel data from GitHub on component mount
  const loadExcelData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(EXCEL_FILE_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Excel file: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const parsedProducts = parseExcelData(data);
      
      setProducts(parsedProducts);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading Excel file:', err);
      setError(err.message || 'Failed to load product data');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExcelData();
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const parsedProducts = parseExcelData(data);
        setProducts(parsedProducts);
        setIsLoading(false);
      } catch (error) {
        setError('Error reading Excel file. Please ensure it has the correct format.');
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const companies = ['all', ...new Set(products.map(p => p.company))];
  const productTypes = ['all', ...new Set(products.map(p => p.type))];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesProductName = product.name.toLowerCase().includes(filters.productName.toLowerCase());
      const matchesBrandName = (product.brandName || '').toLowerCase().includes(filters.brandName.toLowerCase());
      const matchesCrops = product.suitableCrops.some(crop => 
        crop.toLowerCase().includes(filters.suitableCrops.toLowerCase())
      );
      const matchesType = filters.productType === 'all' || product.type === filters.productType;
      const matchesCompany = companyFilter === 'all' || product.company === companyFilter;
      const matchesTypeFilter = typeFilter === 'all' || product.type === typeFilter;

      return matchesProductName && matchesBrandName && 
             (filters.suitableCrops === '' || matchesCrops) && 
             matchesType && matchesCompany && matchesTypeFilter;
    });
  }, [filters, companyFilter, typeFilter, products]);

  const clearFilters = () => {
    setFilters({
      productName: '',
      brandName: '',
      suitableCrops: '',
      productType: 'all'
    });
    setCompanyFilter('all');
    setTypeFilter('all');
  };

  const hasActiveFilters = filters.productName || filters.brandName || 
                          filters.suitableCrops || filters.productType !== 'all' ||
                          companyFilter !== 'all' || typeFilter !== 'all';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Leaf className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">AgriCatalog</h1>
              <p className="text-green-100 text-lg">Agricultural Product Directory</p>
            </div>
          </div>
          <p className="text-lg text-green-50">
            Discover agricultural products, fertilizers, and farming solutions. Browse our comprehensive catalog.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
            <p className="mt-6 text-gray-600 text-lg">Loading products from database...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="mb-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-red-900 mb-2">Failed to Load Products</h3>
              <p className="text-red-700 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={loadExcelData}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Retry Loading
                </button>
                <label htmlFor="excel-upload-error" className="cursor-pointer">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="excel-upload-error"
                  />
                  <div className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 border border-gray-300">
                    <Upload className="w-5 h-5" />
                    Upload Local File
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Product Catalog</h2>
                <p className="text-gray-600 mt-1">{filteredProducts.length} of {products.length} products</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={loadExcelData}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 border border-gray-300 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <label htmlFor="excel-upload-refresh" className="cursor-pointer">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="excel-upload-refresh"
                  />
                  <div className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 border border-gray-300">
                    <Upload className="w-4 h-4" />
                    Upload
                  </div>
                </label>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">View:</span>
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Companies</option>
                  {companies.slice(1).map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Product Types</option>
                {productTypes.slice(1).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-6">
              <div className="w-80 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    </div>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                      >
                        <X className="w-4 h-4" />
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Product Name
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={filters.productName}
                          onChange={(e) => setFilters({...filters, productName: e.target.value})}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Brand Name
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search brands..."
                          value={filters.brandName}
                          onChange={(e) => setFilters({...filters, brandName: e.target.value})}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Suitable Crops
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search crops..."
                          value={filters.suitableCrops}
                          onChange={(e) => setFilters({...filters, suitableCrops: e.target.value})}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Product Type
                      </label>
                      <select
                        value={filters.productType}
                        onChange={(e) => setFilters({...filters, productType: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="all">All types</option>
                        {productTypes.slice(1).map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No products found matching your filters.</p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                    : 'space-y-4'
                  }>
                    {filteredProducts.map(product => (
                      <div
                        key={product.id}
                        className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow ${
                          viewMode === 'list' ? 'flex' : ''
                        }`}
                      >
                        <div className={`bg-gradient-to-br from-gray-100 to-gray-200 ${
                          viewMode === 'grid' ? 'h-48' : 'w-48 flex-shrink-0'
                        } flex items-center justify-center overflow-hidden`}>
                          {product.imageLink && product.imageLink !== 'Not Available' && product.imageLink.startsWith('http') ? (
                            <img 
                              src={product.imageLink} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="text-gray-400 text-sm p-4 text-center">No Image</div>';
                              }}
                            />
                          ) : (
                            <div className="text-gray-400 text-sm">No Image</div>
                          )}
                        </div>
                        
                        <div className="p-6 flex-1">
                          <p className="text-sm text-gray-600 mb-1">{product.company}</p>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                          {product.brandName && (
                            <p className="text-green-600 font-medium mb-3">{product.brandName}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {product.type && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                                {product.type}
                              </span>
                            )}
                            {product.subType && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                {product.subType}
                              </span>
                            )}
                            {product.organic && (
                              <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                                Organic
                              </span>
                            )}
                          </div>

                          {product.description && product.description !== 'No description available' && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
                          )}

                          <div className="space-y-2 text-sm">
                            {product.suitableCrops && product.suitableCrops.length > 0 && product.suitableCrops[0] !== '' && (
                              <div>
                                <span className="font-semibold text-gray-900">Suitable Crops:</span>
                                <p className="text-gray-700">{product.suitableCrops.join(', ')}</p>
                              </div>
                            )}
                            
                            {product.appliedSeasons && (
                              <div>
                                <span className="font-semibold text-gray-900">Season:</span>
                                <p className="text-gray-700">{product.appliedSeasons}</p>
                              </div>
                            )}
                            
                            {product.dosage && product.dosage !== 'Not Available' && (
                              <div>
                                <span className="font-semibold text-gray-900">Dosage:</span>
                                <p className="text-gray-700">{product.dosage}</p>
                              </div>
                            )}
                            
                            {product.applicationMethod && (
                              <div>
                                <span className="font-semibold text-gray-900">Application:</span>
                                <p className="text-gray-700">{product.applicationMethod}</p>
                              </div>
                            )}
                            
                            {product.benefits && (
                              <div>
                                <span className="font-semibold text-gray-900">Benefits:</span>
                                <p className="text-gray-700 line-clamp-2">{product.benefits}</p>
                              </div>
                            )}

                            {product.sourceUrl && product.sourceUrl.startsWith('http') && (
                              <div className="pt-2">
                                <a 
                                  href={product.sourceUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-700 font-medium text-sm inline-flex items-center gap-1"
                                >
                                  View Details 
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
