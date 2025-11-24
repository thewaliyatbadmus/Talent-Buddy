const API_URL = 'https://www.themuse.com/api/public/jobs';

const state = {
    jobs: [],
    saved: JSON.parse(localStorage.getItem('savedJobs')) || [],
    filters: { page: 0, category: '', level: '', location: '' }
};

const dom = {
    grid: document.getElementById('jobs-grid'),
    search: document.getElementById('search-input'),
    location: document.getElementById('location-input'),
    btnSearch: document.getElementById('search-btn'),
    chips: document.querySelectorAll('.chip'),
    loading: document.getElementById('loading'),
    noResults: document.getElementById('no-results'),
    count: document.getElementById('saved-count'),
    modal: document.getElementById('saved-modal'),
    list: document.getElementById('saved-list'),
    btnSaved: document.getElementById('nav-saved'),
    btnClose: document.getElementById('close-modal'),
    title: document.getElementById('section-title'),
    sort: document.getElementById('sort-select')
};

document.addEventListener('DOMContentLoaded', () => {
    updateCount();
    fetchJobs();
    initListeners();
});

function initListeners() {
    dom.btnSearch.addEventListener('click', handleSearch);
    dom.search.addEventListener('keypress', e => { if (e.key === 'Enter') handleSearch(); });

    dom.chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const group = chip.dataset.filter;
            const isActive = chip.classList.contains('active');

            document.querySelectorAll(`.chip[data-filter="${group}"]`).forEach(c => c.classList.remove('active'));

            if (!isActive) {
                chip.classList.add('active');
                state.filters[group] = chip.dataset.value;
            } else {
                state.filters[group] = '';
            }
            handleSearch();
        });
    });

    dom.btnSaved.addEventListener('click', () => {
        renderSaved();
        dom.modal.classList.remove('hidden');
    });

    dom.btnClose.addEventListener('click', () => dom.modal.classList.add('hidden'));

    dom.modal.addEventListener('click', e => {
        if (e.target === dom.modal) dom.modal.classList.add('hidden');
    });

    dom.sort.addEventListener('change', handleSort);
}

async function fetchJobs() {
    toggleLoading(true);
    dom.noResults.classList.add('hidden');

    try {
        const url = new URL(API_URL);
        url.searchParams.append('page', state.filters.page);

        if (state.filters.category) url.searchParams.append('category', state.filters.category);
        if (state.filters.level) url.searchParams.append('level', state.filters.level);
        if (state.filters.location) url.searchParams.append('location', state.filters.location);

        if (!state.filters.category && !state.filters.level && !state.filters.location && !dom.search.value) {
            url.searchParams.append('category', 'Software Engineering');
            url.searchParams.append('category', 'Data Science');
            url.searchParams.append('level', 'Internship');
            url.searchParams.append('level', 'Entry Level');
        }

        const res = await fetch(url);
        const data = await res.json();
        state.jobs = data.results;

        const q = dom.search.value.toLowerCase();
        const loc = dom.location.value.toLowerCase();

        if (q || loc) {
            state.jobs = state.jobs.filter(job => {
                const matchText = job.name.toLowerCase().includes(q) || job.company.name.toLowerCase().includes(q);
                const matchLoc = job.locations.some(l => l.name.toLowerCase().includes(loc));
                return matchText && (loc ? matchLoc : true);
            });
        }

        renderJobs(state.jobs);

    } catch (err) {
        console.error(err);
        dom.grid.innerHTML = '<p style="text-align:center">Failed to load jobs.</p>';
    } finally {
        toggleLoading(false);
    }
}

function handleSearch() {
    state.filters.page = 0;
    dom.title.textContent = (dom.search.value || state.filters.level) ? 'Search Results' : 'Latest Opportunities';
    fetchJobs();
}

function handleSort() {
    const val = dom.sort.value;
    if (val === 'newest') {
        state.jobs.sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));
    } else {
        state.jobs.sort((a, b) => a.company.name.localeCompare(b.company.name));
    }
    renderJobs(state.jobs);
}

function renderJobs(jobs) {
    if (!jobs.length) {
        dom.noResults.classList.remove('hidden');
        dom.grid.innerHTML = '';
        return;
    }

    dom.grid.innerHTML = jobs.map(job => {
        const isSaved = state.saved.some(s => s.id === job.id);
        const loc = job.locations[0]?.name || 'Remote';

        return `
            <div class="card">
                <div class="card-header">
                    <span class="company">${job.company.name}</span>
                    <button class="save-btn ${isSaved ? 'saved' : ''}" onclick="toggleSave(${job.id})">
                        <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>
                </div>
                <a href="${job.refs.landing_page}" target="_blank" class="job-title">${job.name}</a>
                <div class="meta">
                    <span><i class="fa-solid fa-location-dot"></i> ${loc}</span>
                    <span><i class="fa-solid fa-briefcase"></i> ${job.levels[0]?.name || 'Entry'}</span>
                </div>
                <div class="tags">
                    ${job.categories.slice(0, 3).map(c => `<span class="tag">${c.name}</span>`).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function renderSaved() {
    if (!state.saved.length) {
        dom.list.innerHTML = '<p style="text-align:center; color:#666">No saved jobs.</p>';
        return;
    }

    dom.list.innerHTML = state.saved.map(job => `
        <div class="saved-item">
            <div>
                <h4>${job.name}</h4>
                <p style="color:#666; font-size:0.9rem">${job.company.name}</p>
            </div>
            <div style="display:flex; gap:10px; align-items:center">
                <a href="${job.refs.landing_page}" target="_blank" style="color:blue; text-decoration:none">Apply</a>
                <button class="remove-btn" onclick="toggleSave(${job.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function toggleLoading(show) {
    if (show) {
        dom.loading.classList.remove('hidden');
        dom.grid.classList.add('hidden');
    } else {
        dom.loading.classList.add('hidden');
        dom.grid.classList.remove('hidden');
    }
}

window.toggleSave = function (id) {
    const idx = state.saved.findIndex(j => j.id === id);

    if (idx === -1) {
        const job = state.jobs.find(j => j.id === id);
        if (job) state.saved.push(job);
    } else {
        state.saved.splice(idx, 1);
    }

    localStorage.setItem('savedJobs', JSON.stringify(state.saved));
    updateCount();

    if (!dom.modal.classList.contains('hidden')) renderSaved();
    renderJobs(state.jobs);
};

function updateCount() {
    dom.count.textContent = state.saved.length;
}
