const services = [
  {
    name: 'Aadhaar Services',
    category: 'Identity',
    department: 'UIDAI',
    description: 'Update address, mobile number, and biometric details online.'
  },
  {
    name: 'Birth & Death Certificates',
    category: 'Civil Records',
    department: 'Municipal Administration',
    description: 'Request and download civil registration certificates.'
  },
  {
    name: 'Ration Card Services',
    category: 'Welfare',
    department: 'Food & Civil Supplies',
    description: 'Apply, add members, and check ration card eligibility.'
  },
  {
    name: 'Scholarship Portal',
    category: 'Education',
    department: 'Ministry of Education',
    description: 'Apply for pre-matric, post-matric, and merit scholarships.'
  },
  {
    name: 'Health Insurance Enrollment',
    category: 'Healthcare',
    department: 'National Health Authority',
    description: 'Enroll in public health insurance schemes and verify benefits.'
  },
  {
    name: 'Women Safety Helpline',
    category: 'Women & Child',
    department: 'Ministry of Women and Child Development',
    description: 'Access emergency and legal aid support resources.'
  },
  {
    name: 'Pension Services',
    category: 'Social Security',
    department: 'Social Justice Department',
    description: 'Apply for old age, widow, and disability pensions.'
  },
  {
    name: 'Employment Exchange',
    category: 'Employment',
    department: 'Labour Department',
    description: 'Register for jobs, skilling programs, and placement drives.'
  }
];

const serviceGrid = document.getElementById('service-grid');
const filterButtons = document.getElementById('filter-buttons');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('service-search');
const resultSummary = document.getElementById('result-summary');

let activeCategory = 'All';
let searchTerm = '';

function renderCategories() {
  filterButtons.innerHTML = '';
  const categories = ['All', ...new Set(services.map((service) => service.category))];

  categories.forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = category;
    button.classList.toggle('active', category === activeCategory);
    button.addEventListener('click', () => {
      activeCategory = category;
      renderCategories();
      renderServices();
    });
    filterButtons.appendChild(button);
  });
}

function getFilteredServices() {
  return services.filter((service) => {
    const matchesCategory =
      activeCategory === 'All' || service.category === activeCategory;
    const haystack = `${service.name} ${service.department} ${service.description}`.toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
}

function renderServices() {
  serviceGrid.innerHTML = '';
  const filteredServices = getFilteredServices();

  resultSummary.textContent = `${filteredServices.length} service(s) available`;

  if (!filteredServices.length) {
    serviceGrid.innerHTML =
      '<article><h4>No services found</h4><p>Try a different keyword or category.</p></article>';
    return;
  }

  filteredServices.forEach((service) => {
    const card = document.createElement('article');
    card.innerHTML = `
      <p><strong>${service.category}</strong></p>
      <h4>${service.name}</h4>
      <p>${service.description}</p>
      <small>Department: ${service.department}</small>
    `;
    serviceGrid.appendChild(card);
  });
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  searchTerm = searchInput.value.trim();
  renderServices();
});

renderCategories();
renderServices();
