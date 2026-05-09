// Global variables for marketplace functionality
let currentUser = null;
let userHerd = [];
let marketplaceListings = [];
let userListings = [];
let userPurchases = [];
let userSales = [];

// Initialize marketplace functionality
function initializeMarketplace() {
  loadUserData();
  setupTabSwitching();
  setupSalesTabSwitching();
  setupModalHandlers();
  setupFormHandlers();
  setupFilters();
  setupExportHandler();
  loadMarketplaceListings();
  renderHerdTable();
  renderListingsTable();
  renderSoldTable();
  renderPurchasesTable();
  renderLedgerTables();
}

function setupExportHandler() {
  const exportBtn = document.getElementById('exportLedgerBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportLedgerToCsv);
  }

  const actionPlanBtn = document.getElementById('actionPlanBtn');
  if (actionPlanBtn) {
    actionPlanBtn.addEventListener('click', exportLedgerToCsv);
  }
}

function exportLedgerToCsv() {
  const availableListings = marketplaceListings.filter(listing => listing.status === 'available');
  const soldItems = userSales;

  const rows = [];
  rows.push(['Section', 'Animal / Tag', 'Type', 'Breed', 'Province', 'Price', 'Counterparty', 'Date', 'Status']);

  availableListings.forEach(listing => {
    rows.push([
      'Available',
      `${listing.animal.tagId} - ${listing.animal.name || listing.animal.breed}`,
      listing.animal.type,
      listing.animal.breed,
      listing.province,
      `R ${listing.askingPrice}`,
      listing.sellerName || '',
      new Date(listing.listedDate).toLocaleDateString(),
      listing.status
    ]);
  });

  soldItems.forEach(sale => {
    rows.push([
      'Sold',
      `${sale.animal.tagId} - ${sale.animal.name || sale.animal.breed}`,
      sale.animal.type,
      sale.animal.breed,
      sale.province || '',
      `R ${sale.askingPrice}`,
      sale.buyerName || sale.sellerName || '',
      new Date(sale.saleDate || sale.purchaseDate).toLocaleDateString(),
      sale.status || 'sold'
    ]);
  });

  if (rows.length === 1) {
    showToast('No ledger records available to export.', 'error');
    return;
  }

  const csvContent = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `farmlife-ledger-${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('Ledger exported successfully.');
}

// Load user data from localStorage
function loadUserData() {
  try {
    const storedUser = localStorage.getItem('currentUser');
    currentUser = storedUser ? JSON.parse(storedUser) : { id: 'demo-user', name: 'Demo Farmer' };
    
    // Ensure we have a valid user object
    if (!currentUser || !currentUser.id) {
      currentUser = { id: 'demo-user', name: 'Demo Farmer' };
    }
    
    userHerd = JSON.parse(localStorage.getItem(`herd_${currentUser.id}`)) || [];
    marketplaceListings = JSON.parse(localStorage.getItem('marketplaceListings')) || [];
    userListings = marketplaceListings.filter(listing => listing.sellerId === currentUser.id);
    userPurchases = JSON.parse(localStorage.getItem(`purchases_${currentUser.id}`)) || [];
    userSales = JSON.parse(localStorage.getItem(`sales_${currentUser.id}`)) || [];
  } catch (error) {
    console.error('Error loading user data:', error);
    currentUser = { id: 'demo-user', name: 'Demo Farmer' };
    userHerd = [];
    marketplaceListings = [];
    userListings = [];
    userPurchases = [];
    userSales = [];
  }
}

// Save user data to localStorage
function saveUserData() {
  if (!currentUser || !currentUser.id) return;
  localStorage.setItem(`herd_${currentUser.id}`, JSON.stringify(userHerd));
  localStorage.setItem('marketplaceListings', JSON.stringify(marketplaceListings));
  localStorage.setItem(`purchases_${currentUser.id}`, JSON.stringify(userPurchases));
  localStorage.setItem(`sales_${currentUser.id}`, JSON.stringify(userSales));
}

function refreshUserState() {
  loadUserData();
  renderHerdTable();
  loadMarketplaceListings();
  renderListingsTable();
  renderSoldTable();
  renderPurchasesTable();
  renderLedgerTables();
}

function setActiveNavLink() {
  document.querySelectorAll('nav a').forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Tab switching functionality
function setupTabSwitching() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;

      // Update tab buttons
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update tab content
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
  });
}

// Sales tab switching
function setupSalesTabSwitching() {
  const salesTabBtns = document.querySelectorAll('.sales-tab-btn');
  salesTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.salesTab;

      // Update tab buttons
      document.querySelectorAll('.sales-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update tab content
      document.querySelectorAll('.sales-content').forEach(content => content.classList.remove('active'));
      document.getElementById(`${targetTab}Content`).classList.add('active');
    });
  });
}

// Modal handlers
function setupModalHandlers() {
  // Close modals
  document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      const modal = closeBtn.closest('.modal');
      if (modal) closeModal(modal.id);
    });
  });

  // Close modal when clicking outside
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  // Add animal button
  const addAnimalBtn = document.getElementById('addAnimalBtn');
  if (addAnimalBtn) {
    addAnimalBtn.addEventListener('click', () => {
      openModal('animalModal');
    });
  }

  // Create listing button
  const createListingBtn = document.getElementById('createListingBtn');
  if (createListingBtn) {
    createListingBtn.addEventListener('click', () => {
      populateAnimalSelect();
      if (userHerd.length === 0) {
        showToast('Register an animal before creating a marketplace listing.', 'error');
        return;
      }
      openModal('listingModal');
    });
  }
}

// Form handlers
function setupFormHandlers() {
  // Animal registration form
  document.getElementById('animalForm').addEventListener('submit', handleAnimalRegistration);

  // Listing creation form
  document.getElementById('listingForm').addEventListener('submit', handleListingCreation);

  // Purchase confirmation
  document.getElementById('confirmPurchaseBtn').addEventListener('click', handlePurchaseConfirmation);
}

// Handle animal registration
function handleAnimalRegistration(e) {
  e.preventDefault();

  // Ensure currentUser is loaded
  if (!currentUser) {
    loadUserData();
  }

  const animalData = {
    id: Date.now().toString(),
    tagId: document.getElementById('animalTagId').value,
    type: document.getElementById('animalType').value,
    breed: document.getElementById('animalBreed').value,
    age: parseInt(document.getElementById('animalAge').value),
    weight: parseFloat(document.getElementById('animalWeight').value),
    gender: document.getElementById('animalGender').value,
    healthStatus: document.getElementById('animalHealth').value,
    notes: document.getElementById('animalNotes').value,
    registeredDate: new Date().toISOString(),
    ownerId: currentUser.id
  };

  userHerd.push(animalData);
  saveUserData();
  renderHerdTable();
  closeModal('animalModal');
  e.target.reset();

  showToast('Animal registered successfully!');
}

// Handle listing creation
function handleListingCreation(e) {
  e.preventDefault();

  // Ensure user data is loaded
  if (!currentUser) {
    loadUserData();
  }

  const animalId = document.getElementById('listingAnimalId').value;
  const animal = userHerd.find(a => a.id === animalId);

  if (!animal) {
    showToast('Animal not found!', 'error');
    return;
  }

  const listingData = {
    id: Date.now().toString(),
    animalId: animalId,
    animal: animal,
    askingPrice: parseFloat(document.getElementById('askingPrice').value),
    province: document.getElementById('listingProvince').value,
    description: document.getElementById('listingDescription').value,
    images: [], // Would handle file uploads in real implementation
    sellerId: currentUser.id,
    sellerName: currentUser.name,
    listedDate: new Date().toISOString(),
    status: 'available'
  };

  marketplaceListings.push(listingData);
  saveUserData();
  refreshUserState();
  closeModal('listingModal');
  e.target.reset();

  showToast('Listing created successfully!');
}

// Handle purchase confirmation
function handlePurchaseConfirmation() {
  const listingId = document.getElementById('confirmPurchaseBtn').dataset.listingId;
  const listing = marketplaceListings.find(l => l.id === listingId);

  if (!listing) {
    showToast('Listing not found!', 'error');
    return;
  }

  // Update listing status
  listing.status = 'sold';
  listing.buyerId = currentUser.id;
  listing.buyerName = currentUser.name;
  listing.saleDate = new Date().toISOString();

  // Add to user's purchases
  userPurchases.push({
    ...listing,
    purchaseDate: new Date().toISOString()
  });

  // Add to seller's sales record
  const sellerSales = JSON.parse(localStorage.getItem(`sales_${listing.sellerId}`)) || [];
  sellerSales.push({
    ...listing,
    saleDate: new Date().toISOString()
  });
  localStorage.setItem(`sales_${listing.sellerId}`, JSON.stringify(sellerSales));

  saveUserData();
  refreshUserState();
  closeModal('purchaseModal');

  showToast('Purchase completed successfully!');
}

// Populate animal select for listing creation
function populateAnimalSelect() {
  const select = document.getElementById('listingAnimalId');
  if (!select) return;
  select.innerHTML = '<option value="">Choose an animal...</option>';

  if (userHerd.length === 0) {
    select.innerHTML = '<option value="">No registered animals available</option>';
    return;
  }

  userHerd.forEach(animal => {
    const option = document.createElement('option');
    option.value = animal.id;
    option.textContent = `${animal.tagId} - ${animal.type} (${animal.breed})`;
    select.appendChild(option);
  });
}

// Modal utility functions
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// Render herd table
function renderHerdTable() {
  const tbody = document.getElementById('herdTableBody');
  tbody.innerHTML = '';

  if (userHerd.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">No animals registered yet. Click "Register New Animal" to get started.</td></tr>';
    return;
  }

  userHerd.forEach(animal => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${animal.tagId}</td>
      <td>${animal.type}</td>
      <td>${animal.breed}</td>
      <td>${animal.age} months</td>
      <td>${animal.weight}</td>
      <td><span class="status-badge ${getHealthStatusClass(animal.healthStatus)}">${animal.healthStatus}</span></td>
      <td>
        <button class="btn-small btn-outline" onclick="editAnimal('${animal.id}')">Edit</button>
        <button class="btn-small btn-primary-small" onclick="listForSale('${animal.id}')">List for Sale</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Render marketplace listings
function loadMarketplaceListings() {
  const container = document.getElementById('marketplaceListings');
  container.innerHTML = '';

  const availableListings = marketplaceListings.filter(listing => listing.status === 'available');

  if (availableListings.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #64748b; grid-column: 1 / -1;">No livestock available for sale at the moment.</div>';
    return;
  }

  availableListings.forEach(listing => {
    const card = document.createElement('div');
    card.className = 'marketplace-card';
    card.innerHTML = `
      <div class="marketplace-card-image">
        <span>${getAnimalIcon(listing.animal.type)}</span>
      </div>
      <div class="marketplace-card-content">
        <div class="marketplace-card-header">
          <h3 class="marketplace-card-title">${listing.animal.tagId} - ${listing.animal.breed} ${listing.animal.type}</h3>
          <div class="marketplace-card-price">R ${listing.askingPrice.toLocaleString()}</div>
        </div>
        <div class="marketplace-card-details">
          <div class="marketplace-card-detail">
            <span>Age:</span>
            <span>${listing.animal.age} months</span>
          </div>
          <div class="marketplace-card-detail">
            <span>Weight:</span>
            <span>${listing.animal.weight} kg</span>
          </div>
          <div class="marketplace-card-detail">
            <span>Gender:</span>
            <span>${listing.animal.gender}</span>
          </div>
          <div class="marketplace-card-detail">
            <span>Health:</span>
            <span>${listing.animal.healthStatus}</span>
          </div>
        </div>
        <div class="marketplace-card-location">
          📍 ${listing.province} • Listed by ${listing.sellerName}
        </div>
        <div class="marketplace-card-actions">
          <button class="btn-small btn-outline" onclick="viewListingDetails('${listing.id}')">View Details</button>
          <button class="btn-small btn-primary-small" onclick="initiatePurchase('${listing.id}')">Buy Now</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Render user's listings table
function renderListingsTable() {
  const tbody = document.getElementById('listingsTableBody');
  tbody.innerHTML = '';

  if (userListings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">No active listings. Create your first listing to start selling.</td></tr>';
    return;
  }

  userListings.forEach(listing => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${listing.animal.tagId} - ${listing.animal.breed} ${listing.animal.type}</td>
      <td>R ${listing.askingPrice.toLocaleString()}</td>
      <td>${new Date(listing.listedDate).toLocaleDateString()}</td>
      <td><span class="status-badge ${listing.status === 'available' ? 'available' : 'sold'}">${listing.status}</span></td>
      <td>
        ${listing.status === 'available' ? `<button class="btn-small btn-outline" onclick="editListing('${listing.id}')">Edit</button>` : ''}
        <button class="btn-small btn-primary-small" onclick="viewListing('${listing.id}')">View</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Render sold items table
function renderSoldTable() {
  const tbody = document.getElementById('soldTableBody');
  tbody.innerHTML = '';

  const soldItems = userSales;

  if (soldItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">No sales completed yet.</td></tr>';
    return;
  }

  soldItems.forEach(sale => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${sale.animal.tagId} - ${sale.animal.breed} ${sale.animal.type}</td>
      <td>${sale.buyerName}</td>
      <td>R ${sale.askingPrice.toLocaleString()}</td>
      <td>${new Date(sale.saleDate).toLocaleDateString()}</td>
      <td><span class="status-badge sold">Sold</span></td>
    `;
    tbody.appendChild(row);
  });
}

// Render purchases table
function renderPurchasesTable() {
  const tbody = document.getElementById('purchasesTableBody');
  tbody.innerHTML = '';

  if (userPurchases.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">No purchases made yet.</td></tr>';
    return;
  }

  userPurchases.forEach(purchase => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${purchase.animal.tagId} - ${purchase.animal.breed} ${purchase.animal.type}</td>
      <td>${purchase.sellerName}</td>
      <td>R ${purchase.askingPrice.toLocaleString()}</td>
      <td>${new Date(purchase.purchaseDate).toLocaleDateString()}</td>
      <td><span class="status-badge sold">Purchased</span></td>
    `;
    tbody.appendChild(row);
  });
}

// Setup filters
function setupFilters() {
  const animalTypeFilter = document.getElementById('animalTypeFilter');
  const provinceFilter = document.getElementById('provinceFilter');

  function applyFilters() {
    const animalType = animalTypeFilter.value;
    const province = provinceFilter.value;

    const filteredListings = marketplaceListings.filter(listing => {
      if (listing.status !== 'available') return false;
      if (animalType && listing.animal.type !== animalType) return false;
      if (province && listing.province !== province) return false;
      return true;
    });

    renderFilteredListings(filteredListings);
  }

  animalTypeFilter.addEventListener('change', applyFilters);
  provinceFilter.addEventListener('change', applyFilters);
}

// Render filtered listings
function renderFilteredListings(listings) {
  const container = document.getElementById('marketplaceListings');
  container.innerHTML = '';

  if (listings.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #64748b; grid-column: 1 / -1;">No listings match your filters.</div>';
    return;
  }

  listings.forEach(listing => {
    const card = document.createElement('div');
    card.className = 'marketplace-card';
    card.innerHTML = `
      <div class="marketplace-card-image">
        <span>${getAnimalIcon(listing.animal.type)}</span>
      </div>
      <div class="marketplace-card-content">
        <div class="marketplace-card-header">
          <h3 class="marketplace-card-title">${listing.animal.tagId} - ${listing.animal.breed} ${listing.animal.type}</h3>
          <div class="marketplace-card-price">R ${listing.askingPrice.toLocaleString()}</div>
        </div>
        <div class="marketplace-card-details">
          <div class="marketplace-card-detail">
            <span>Age:</span>
            <span>${listing.animal.age} months</span>
          </div>
          <div class="marketplace-card-detail">
            <span>Weight:</span>
            <span>${listing.animal.weight} kg</span>
          </div>
          <div class="marketplace-card-detail">
            <span>Gender:</span>
            <span>${listing.animal.gender}</span>
          </div>
          <div class="marketplace-card-detail">
            <span>Health:</span>
            <span>${listing.animal.healthStatus}</span>
          </div>
        </div>
        <div class="marketplace-card-location">
          📍 ${listing.province} • Listed by ${listing.sellerName}
        </div>
        <div class="marketplace-card-actions">
          <button class="btn-small btn-outline" onclick="viewListingDetails('${listing.id}')">View Details</button>
          <button class="btn-small btn-primary-small" onclick="initiatePurchase('${listing.id}')">Buy Now</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Utility functions
function getHealthStatusClass(status) {
  switch (status.toLowerCase()) {
    case 'excellent': return 'available';
    case 'good': return 'available';
    case 'fair': return 'pending';
    case 'poor': return 'sold';
    default: return 'pending';
  }
}

function getAnimalIcon(type) {
  switch (type.toLowerCase()) {
    case 'cattle': return '🐄';
    case 'sheep': return '🐑';
    case 'goats': return '🐐';
    case 'poultry': return '🐔';
    default: return '🐾';
  }
}

function showToast(message, type = 'success') {
  // Simple toast implementation
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#dc2626' : '#059669'};
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    z-index: 1001;
    font-weight: 500;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
}

// Global functions for button clicks
function editAnimal(animalId) {
  // Would implement edit functionality
  showToast('Edit functionality coming soon!');
}

function listForSale(animalId) {
  populateAnimalSelect();
  document.getElementById('listingAnimalId').value = animalId;
  openModal('listingModal');
}

function viewListingDetails(listingId) {
  // Would show detailed view
  showToast('Detailed view coming soon!');
}

function initiatePurchase(listingId) {
  const listing = marketplaceListings.find(l => l.id === listingId);
  if (!listing) return;

  const detailsDiv = document.getElementById('purchaseDetails');
  detailsDiv.innerHTML = `
    <h4>${listing.animal.tagId} - ${listing.animal.breed} ${listing.animal.type}</h4>
    <p><strong>Seller:</strong> ${listing.sellerName}</p>
    <p><strong>Location:</strong> ${listing.province}</p>
    <p><strong>Price:</strong> <span class="price">R ${listing.askingPrice.toLocaleString()}</span></p>
    <p><strong>Description:</strong> ${listing.description || 'No description provided'}</p>
    <div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 6px;">
      <p style="margin: 0; font-weight: 500;">Confirm Purchase</p>
      <p style="margin: 4px 0 0; font-size: 0.9rem; color: #64748b;">This action cannot be undone. The seller will be notified of your purchase.</p>
    </div>
  `;

  document.getElementById('confirmPurchaseBtn').dataset.listingId = listingId;
  openModal('purchaseModal');
}

function editListing(listingId) {
  showToast('Edit listing functionality coming soon!');
}

function viewListing(listingId) {
  showToast('View listing functionality coming soon!');
}
// This function checks the current page's filename and adds the 'active' class to the corresponding navigation link, allowing for visual indication of the active page in the navigation bar.

function initializeCharts() {
  const growthSalesCtx = document.getElementById('growthSalesChart')?.getContext('2d');
  if (growthSalesCtx) {
    new Chart(growthSalesCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            // This dataset represents the total herd size over the first six months of the year. It is styled with a blue line and a light blue fill to visually differentiate it from the sales data.
            label: 'Total Herd',
            data: [450, 455, 460, 462, 465, 468],
            borderColor: '#1d4ed8',
            backgroundColor: 'rgba(29, 78, 216, 0.08)',
            borderWidth: 3,
            fill: true,
            pointBackgroundColor: '#1d4ed8',
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.4
          },
          {
            label: 'Units Sold',
            data: [20, 25, 30, 28, 32, 35],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            borderWidth: 3,
            fill: true,
            pointBackgroundColor: '#f59e0b',
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
// This block initializes a line chart using Chart.js to display the growth of the herd and units sold over the first six months of the year. It includes styling for the lines, points, and area under the curves for better visualization.
}
// This block initializes a bar chart using Chart.js to display the revenue generated from sales over the first six months of the year. It includes styling for the bars and ensures the chart is responsive and maintains its aspect ratio.
function renderLedgerTables() {
  const availableBody = document.getElementById('ledgerAvailableBody');
  const soldBody = document.getElementById('ledgerSoldBody');
  if (!availableBody || !soldBody) return;

  const availableListings = marketplaceListings.filter(listing => listing.status === 'available');
  availableBody.innerHTML = availableListings.length ? availableListings.map(listing => `
    <tr>
      <td>${listing.animal.tagId} - ${listing.animal.breed} ${listing.animal.type}</td>
      <td>R ${listing.askingPrice.toLocaleString()}</td>
      <td>${new Date(listing.listedDate).toLocaleDateString()}</td>
      <td><span class="status-badge available">Available</span></td>
    </tr>
  `).join('') : '<tr><td colspan="4" style="text-align:center; padding: 24px; color: #64748b;">No animals currently listed for sale.</td></tr>';

  const soldItems = userSales;
  soldBody.innerHTML = soldItems.length ? soldItems.map(sale => `
    <tr>
      <td>${sale.animal.tagId} - ${sale.animal.breed} ${sale.animal.type}</td>
      <td>${sale.buyerName || 'Private Buyer'}</td>
      <td>R ${sale.askingPrice.toLocaleString()}</td>
      <td>${new Date(sale.saleDate).toLocaleDateString()}</td>
      <td><span class="status-badge sold">Sold</span></td>
    </tr>
  `).join('') : '<tr><td colspan="5" style="text-align:center; padding: 24px; color: #64748b;">No sold animals yet.</td></tr>';
}

document.addEventListener('DOMContentLoaded', function() {
  setActiveNavLink();
  initializeCharts();
  initializeMarketplace();
});
