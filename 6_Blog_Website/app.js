// Simple Blog Manager - Vanilla JS + localStorage
(function() {
    /** @typedef {{ id: string, title: string, author: string, date: string, content: string, published: boolean, createdAt: number, updatedAt: number }} Post */

    const STORAGE_KEY = 'simple_blog_posts_v1';

    /** @type {HTMLFormElement} */
    const postForm = document.getElementById('postForm');
    const postIdInput = document.getElementById('postId');
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const dateInput = document.getElementById('date');
    const contentInput = document.getElementById('content');
    const postList = document.getElementById('postList');
    const emptyState = document.getElementById('emptyState');
    const editorPanel = document.getElementById('editorPanel');
    const formTitle = document.getElementById('formTitle');
    const newPostBtn = document.getElementById('newPostBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const searchInput = document.getElementById('searchInput');
    const tabs = Array.from(document.querySelectorAll('.tab'));

    let currentFilter = 'all';
    let posts = loadPosts();

    function loadPosts() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to load posts', e);
            return [];
        }
    }

    function savePosts() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }

    function generateId() {
        return 'p_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

    function clearForm() {
        postIdInput.value = '';
        titleInput.value = '';
        authorInput.value = '';
        // keep date if user set; otherwise default to today
        if (!dateInput.value) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            dateInput.value = `${yyyy}-${mm}-${dd}`;
        }
        contentInput.value = '';
        formTitle.textContent = 'Create Post';
        document.getElementById('saveBtn').textContent = 'Save';
    }

    function populateForm(post) {
        postIdInput.value = post.id;
        titleInput.value = post.title;
        authorInput.value = post.author;
        dateInput.value = post.date;
        contentInput.value = post.content;
        formTitle.textContent = 'Edit Post';
        document.getElementById('saveBtn').textContent = 'Update';
        titleInput.focus();
    }

    function filterPosts() {
        const query = (searchInput.value || '').toLowerCase();
        return posts.filter(p => {
            const matchesFilter = currentFilter === 'all' ? true : currentFilter === 'published' ? p.published : !p.published;
            const matchesQuery = p.title.toLowerCase().includes(query) || p.author.toLowerCase().includes(query);
            return matchesFilter && matchesQuery;
        }).sort((a, b) => b.updatedAt - a.updatedAt);
    }

    function render() {
        const visible = filterPosts();
        postList.innerHTML = '';
        emptyState.style.display = visible.length ? 'none' : 'block';

        const tmpl = document.getElementById('postItemTemplate');
        visible.forEach(post => {
            const node = tmpl.content.firstElementChild.cloneNode(true);
            node.dataset.id = post.id;
            node.querySelector('.post-title').textContent = post.title;
            node.querySelector('.author').textContent = post.author;
            node.querySelector('.date').textContent = new Date(post.date).toLocaleDateString();
            node.querySelector('.status').textContent = post.published ? 'Published' : 'Draft';
            node.querySelector('.post-content').textContent = post.content.length > 240 ? post.content.slice(0, 240) + '…' : post.content;

            const publishBtn = node.querySelector('[data-action="toggle-publish"]');
            publishBtn.textContent = post.published ? 'Unpublish' : 'Publish';
            publishBtn.classList.toggle('success', !post.published);

            postList.appendChild(node);
        });
    }

    // Handlers
    postForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = postIdInput.value;
        const now = Date.now();
        const payload = {
            title: titleInput.value.trim(),
            author: authorInput.value.trim(),
            date: dateInput.value,
            content: contentInput.value.trim()
        };

        if (!payload.title || !payload.author || !payload.date || !payload.content) {
            alert('Please fill in all fields.');
            return;
        }

        if (id) {
            const idx = posts.findIndex(p => p.id === id);
            if (idx !== -1) {
                posts[idx] = { ...posts[idx], ...payload, updatedAt: now };
            }
        } else {
            const newPost = {
                id: generateId(),
                published: false,
                createdAt: now,
                updatedAt: now,
                ...payload
            };
            posts.unshift(newPost);
        }

        savePosts();
        clearForm();
        render();
    });

    postList.addEventListener('click', function(e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        const li = btn.closest('li.post-card');
        const id = li?.dataset?.id;
        const action = btn.dataset.action;
        if (!id) return;
        const idx = posts.findIndex(p => p.id === id);
        if (idx === -1) return;

        if (action === 'edit') {
            populateForm(posts[idx]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (action === 'delete') {
            if (confirm('Delete this post?')) {
                posts.splice(idx, 1);
                savePosts();
                render();
            }
        } else if (action === 'toggle-publish') {
            posts[idx].published = !posts[idx].published;
            posts[idx].updatedAt = Date.now();
            savePosts();
            render();
        }
    });

    newPostBtn.addEventListener('click', function() {
        clearForm();
        titleInput.focus();
    });

    cancelEditBtn.addEventListener('click', function() {
        clearForm();
    });

    searchInput.addEventListener('input', function() {
        render();
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            render();
        });
    });

    // Initial render
    render();
})();


