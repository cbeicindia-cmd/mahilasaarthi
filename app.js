const state = {
  users: [
    { id: crypto.randomUUID(), name: 'System Admin', mobile: '9999999999', role: 'superAdmin' },
    { id: crypto.randomUUID(), name: 'Demo Agent', mobile: '8888888888', role: 'agent' },
    { id: crypto.randomUUID(), name: 'Sample Beneficiary', mobile: '7777777777', role: 'endUser' }
  ],
  schemes: [
    {
      id: crypto.randomUUID(),
      name: 'PM Ujjwala Yojana',
      commission: 85,
      url: 'https://www.pmuy.gov.in/'
    },
    {
      id: crypto.randomUUID(),
      name: 'Ayushman Bharat',
      commission: 120,
      url: 'https://beneficiary.nha.gov.in/'
    },
    {
      id: crypto.randomUUID(),
      name: 'PM Awas Yojana',
      commission: 150,
      url: 'https://pmaymis.gov.in/'
    }
  ],
  rules: [
    'Aadhaar and mobile verification required before submission.',
    'Agent can process only consented beneficiaries.',
    'Super admin approves high-value applications above ₹10,000 benefits.'
  ],
  applications: [],
  activeUserId: null
};

const refs = {
  registerForm: document.querySelector('#registerForm'),
  registerStatus: document.querySelector('#registerStatus'),
  activeUserSelect: document.querySelector('#activeUserSelect'),
  setActiveBtn: document.querySelector('#setActiveBtn'),
  activeUserBanner: document.querySelector('#activeUserBanner'),
  beneficiarySelect: document.querySelector('#beneficiarySelect'),
  schemeSelect: document.querySelector('#schemeSelect'),
  docsStatus: document.querySelector('#docsStatus'),
  applicationForm: document.querySelector('#applicationForm'),
  applicationsBody: document.querySelector('#applicationsBody'),
  portalLink: document.querySelector('#portalLink'),
  stats: document.querySelector('#stats'),
  rulesList: document.querySelector('#rulesList'),
  ruleForm: document.querySelector('#ruleForm'),
  ruleInput: document.querySelector('#ruleInput'),
  schemeForm: document.querySelector('#schemeForm'),
  schemesBody: document.querySelector('#schemesBody'),
  schemeName: document.querySelector('#schemeName'),
  schemeCommission: document.querySelector('#schemeCommission'),
  schemeUrl: document.querySelector('#schemeUrl'),
  themeSelect: document.querySelector('#themeSelect'),
  adminPanel: document.querySelector('#adminPanel')
};

function activeUser() {
  return state.users.find((u) => u.id === state.activeUserId) || null;
}

function formatRole(role) {
  return role === 'endUser' ? 'End User' : role === 'superAdmin' ? 'Super Admin' : 'Agent';
}

function refreshUserOptions() {
  const options = state.users
    .map((u) => `<option value="${u.id}">${u.name} (${formatRole(u.role)})</option>`)
    .join('');
  refs.activeUserSelect.innerHTML = options;
  refs.beneficiarySelect.innerHTML = state.users
    .filter((u) => u.role === 'endUser')
    .map((u) => `<option value="${u.id}">${u.name}</option>`)
    .join('');

  if (!state.activeUserId) {
    state.activeUserId = state.users[0]?.id || null;
  }
  refs.activeUserSelect.value = state.activeUserId;
  renderPanels();
}

function refreshSchemes() {
  refs.schemeSelect.innerHTML = state.schemes
    .map((s) => `<option value="${s.id}">${s.name} (₹${s.commission})</option>`)
    .join('');

  refs.schemesBody.innerHTML = state.schemes
    .map(
      (s) => `<tr><td>${s.name}</td><td>₹${s.commission}</td><td><a href="${s.url}" target="_blank" rel="noopener">Portal</a></td></tr>`
    )
    .join('');

  updatePortalLink();
}

function updatePortalLink() {
  const scheme = state.schemes.find((s) => s.id === refs.schemeSelect.value);
  if (!scheme) return;
  refs.portalLink.href = scheme.url;
  refs.portalLink.textContent = `Open ${scheme.name} portal`;
}

function refreshRules() {
  refs.rulesList.innerHTML = state.rules.map((rule) => `<li>${rule}</li>`).join('');
}

function refreshApplications() {
  refs.applicationsBody.innerHTML = state.applications
    .map((a) => {
      const beneficiary = state.users.find((u) => u.id === a.beneficiaryId)?.name || 'Unknown';
      const processedBy = state.users.find((u) => u.id === a.processedBy)?.name || 'Unknown';
      const scheme = state.schemes.find((s) => s.id === a.schemeId)?.name || 'Removed Scheme';
      return `<tr>
        <td>${a.date}</td>
        <td>${beneficiary}</td>
        <td>${scheme}</td>
        <td>${processedBy}</td>
        <td>₹${a.commission}</td>
        <td>${a.status}</td>
      </tr>`;
    })
    .join('');
}

function refreshStats() {
  const totalCommissions = state.applications.reduce((sum, a) => sum + a.commission, 0);
  refs.stats.innerHTML = `
    <div><strong>${state.users.length}</strong><br/>Users</div>
    <div><strong>${state.applications.length}</strong><br/>Applications</div>
    <div><strong>₹${totalCommissions}</strong><br/>Total Commissions</div>
  `;
}

function renderPanels() {
  const user = activeUser();
  if (!user) return;
  refs.activeUserBanner.textContent = `Active: ${user.name} (${formatRole(user.role)})`;
  refs.adminPanel.style.display = user.role === 'superAdmin' ? 'block' : 'none';
}

refs.registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const user = {
    id: crypto.randomUUID(),
    name: data.get('name').toString().trim(),
    mobile: data.get('mobile').toString().trim(),
    role: data.get('role').toString()
  };
  state.users.push(user);
  refs.registerStatus.textContent = `${user.name} registered successfully as ${formatRole(user.role)}.`;
  event.target.reset();
  refreshUserOptions();
});

refs.setActiveBtn.addEventListener('click', () => {
  state.activeUserId = refs.activeUserSelect.value;
  renderPanels();
});

refs.applicationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const currentUser = activeUser();
  if (!currentUser) return;

  const scheme = state.schemes.find((s) => s.id === refs.schemeSelect.value);
  if (!scheme) return;

  const isAgent = currentUser.role === 'agent';
  const isAdmin = currentUser.role === 'superAdmin';
  const commission = isAgent ? scheme.commission : isAdmin ? Math.round(scheme.commission * 0.5) : 0;

  state.applications.unshift({
    date: new Date().toLocaleString(),
    beneficiaryId: refs.beneficiarySelect.value,
    schemeId: scheme.id,
    processedBy: currentUser.id,
    commission,
    status: refs.docsStatus.value === 'Yes' ? 'Submitted' : 'Draft Pending Docs'
  });

  refreshApplications();
  refreshStats();
  updatePortalLink();
});

refs.ruleForm.addEventListener('submit', (event) => {
  event.preventDefault();
  state.rules.push(refs.ruleInput.value.trim());
  refs.ruleInput.value = '';
  refreshRules();
});

refs.schemeForm.addEventListener('submit', (event) => {
  event.preventDefault();
  state.schemes.push({
    id: crypto.randomUUID(),
    name: refs.schemeName.value.trim(),
    commission: Number(refs.schemeCommission.value),
    url: refs.schemeUrl.value.trim()
  });
  refs.schemeForm.reset();
  refreshSchemes();
});

refs.themeSelect.addEventListener('change', () => {
  document.documentElement.setAttribute('data-theme', refs.themeSelect.value);
});

refs.schemeSelect.addEventListener('change', updatePortalLink);

refreshUserOptions();
refreshSchemes();
refreshRules();
refreshApplications();
refreshStats();
renderPanels();
