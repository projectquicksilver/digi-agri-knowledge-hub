import React, { useState, useMemo } from 'react';
import { Grid, List, Search, Filter, X, Leaf } from 'lucide-react';

const AgriCatalog = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    productName: '',
    brandName: '',
    suitableCrops: '',
    productType: 'all'
  });
  const [companyFilter, setCompanyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Sample product data
  const products = [
    {
      id: 1,
      company: 'Nuziveedu Seeds Ltd.',
      name: 'Champion NPH-207 Hybrid Paddy',
      productCode: 'Champion NPH-207',
      type: 'Seed',
      category: 'Paddy Hybrid',
      description: 'Medium duration hybrid paddy with tolerance to water stress and good yield potential',
      suitableCrops: ['Paddy'],
      dosage: '10 kg/acre',
      availability: 'Available'
    },
    {
      id: 2,
      company: 'Nuziveedu Seeds Ltd.',
      name: 'NPH 2003 Deva Hybrid Paddy',
      productCode: 'NPH 2003 Deva',
      type: 'Seed',
      category: 'Paddy Hybrid',
      description: 'High yielding paddy hybrid suitable for kharif season',
      suitableCrops: ['Paddy'],
      dosage: '10 kg/acre',
      availability: 'Not Available'
    },
    {
      id: 3,
      company: 'Nuziveedu Seeds Ltd.',
      name: 'Winner NPH-567 Hybrid Paddy',
      productCode: 'Winner NPH-567',
      type: 'Seed',
      category: 'Paddy Hybrid',
      description: 'Premium quality paddy hybrid with excellent grain quality',
      suitableCrops: ['Paddy'],
      dosage: '10 kg/acre',
      availability: 'Not Available'
    },
    {
      id: 4,
      company: 'Coromandel International',
      name: 'Urea Fertilizer',
      productCode: 'UREA-46',
      type: 'Fertilizer',
      category: 'Nitrogen Fertilizer',
      description: 'High quality urea fertilizer with 46% nitrogen content',
      suitableCrops: ['Paddy', 'Wheat', 'Maize'],
      dosage: '50 kg/acre',
      availability: 'Available'
    },
    {
      id: 5,
      company: 'Bayer Crop Science',
      name: 'Confidor Insecticide',
      productCode: 'CONF-200',
      type: 'Pesticide',
      category: 'Insecticide',
      description: 'Systemic insecticide for sucking pests control',
      suitableCrops: ['Cotton', 'Vegetables'],
      dosage: '100 ml/acre',
      availability: 'Available'
    },
    {
      id: 6,
      company: 'Mahyco Seeds',
      name: 'Cotton Hybrid BG-II',
      productCode: 'MCH-001',
      type: 'Seed',
      category: 'Cotton Hybrid',
      description: 'Bollworm resistant cotton hybrid with high fiber quality',
      suitableCrops: ['Cotton'],
      dosage: '900 gm/acre',
      availability: 'Available'
    }
  ];

  const companies = ['all', ...new Set(products.map(p => p.company))];
  const productTypes = ['all', ...new Set(products.map(p => p.type))];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesProductName = product.name.toLowerCase().includes(filters.productName.toLowerCase());
      const matchesBrandName = product.company.toLowerCase().includes(filters.brandName.toLowerCase());
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
  };

  const hasActiveFilters = filters.productName || filters.brandName || 
                          filters.suitableCrops || filters.productType !== 'all';

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
            Discover agricultural products, fertilizers, and farming solutions. Upload your Excel catalog to get started.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Product Catalog</h2>
            <p className="text-gray-600 mt-1">{filteredProducts.length} of {products.length} products</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
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
          {/* Sidebar Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
                    <option value="Seed">Seed</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Pesticide">Pesticide</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-600 text-lg">No products found matching your filters.</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Product Image Placeholder */}
                    <div className={`bg-gradient-to-br from-amber-200 to-amber-300 ${
                      viewMode === 'grid' ? 'h-48' : 'w-48 flex-shrink-0'
                    }`}></div>
                    
                    <div className="p-6 flex-1">
                      <p className="text-sm text-gray-600 mb-1">{product.company}</p>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-green-600 font-medium mb-3">{product.productCode}</p>
                      
                      <div className="flex gap-2 mb-3">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                          {product.type}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                          {product.category}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4">{product.description}</p>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-semibold text-gray-900">Suitable Crops:</span>
                          <p className="text-gray-700">{product.suitableCrops.join(', ')}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">Dosage:</span>
                          <p className="text-gray-700">{product.dosage}</p>
                        </div>
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            product.availability === 'Available'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.availability}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgriCatalog;
