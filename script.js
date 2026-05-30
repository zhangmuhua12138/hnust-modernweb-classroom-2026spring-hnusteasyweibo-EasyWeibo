/* js/script.js */

// 1. 初始化数据 (模拟数据库)
const defaultPosts = [
    {
        id: 1,
        userId: 101,
        username: '用户A',
        avatar: 'https://picsum.photos/id/1005/200/200',
        content: '今天天气真不错，开始学习Web三件套啦！👍',
        image: '',
        likes: 0,
        likedByMe: false,
        comments: [{ author: '系统', text: '欢迎加入！' }],
        timestamp: Date.now() - 1000 * 60 * 5 // 5分钟前
    },
    {
        id: 2,
        userId: 102,
        username: '用户B',
        avatar: 'https://picsum.photos/id/1012/200/200',
        content: '分享一张好看的风景图~',
        image: 'https://picsum.photos/800/400',
        likes: 5,
        likedByMe: false,
        comments: [],
        timestamp: Date.now() - 1000 * 60 * 60 // 1小时前
    }
];

// 获取当前登录用户 (模拟)
const currentUser = {
    id: 999,
    username: '我 (当前用户)',
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
};

// 从 LocalStorage 读取数据，如果没有则使用默认数据
function getPosts() {
    const saved = localStorage.getItem('social_app_posts');
    let posts = saved ? JSON.parse(saved) : defaultPosts;
    
    // 关键修复：检查每一条历史数据，如果当前用户ID在 likedByMe 列表中（或者根据旧逻辑判断），恢复状态
    // 为了简化，我们直接检查 likedByMe 字段是否存在，如果不存在，默认为 false
    return posts.map(post => ({
        ...post,
        likedByMe: post.likedByMe || false
    }));
}

function savePosts(posts) {
    localStorage.setItem('social_app_posts', JSON.stringify(posts));
}

// 2. 工具函数：时间格式化
function timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return '刚刚';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    return `${Math.floor(hours / 24)}天前`;
}

// 3. 渲染主页 (index.html 使用)
function renderFeed() {
    const feedContainer = document.getElementById('feed-container');
    if (!feedContainer) return; // 如果不是主页，直接返回

    const posts = getPosts().sort((a, b) => b.timestamp - a.timestamp); // 按时间倒序

    feedContainer.innerHTML = posts.map(post => createPostHTML(post)).join('');
    attachEventListeners(); // 绑定按钮事件
}

// 4. 渲染个人主页 (profile.html 使用)
function renderProfile() {
    // 1. 获取对应的 DOM 容器
    const headerContainer = document.getElementById('profile-header'); // 个人信息容器
    const postsContainer = document.getElementById('user-posts');      // 动态容器
    
    if (!headerContainer || !postsContainer) return;

    // 2. 渲染个人信息 (这部分代码保持不变)
    headerContainer.innerHTML = `
        <img src="${currentUser.avatar}" alt="头像" class="avatar">
        <h2>${currentUser.username}</h2>
        <p>个人简介：正在学习前端开发的练习生。</p>
    `;

    // 3. 渲染用户自己的动态
    const userPosts = getPosts().filter(p => p.userId === currentUser.id).sort((a, b) => b.timestamp - a.timestamp);
    
    if (userPosts.length === 0) {
        postsContainer.innerHTML = '<p style="text-align:center; color:#999;">暂无动态，去发布一条吧！</p>';
    } else {
        // 注意：这里渲染到 postsContainer，而不是 headerContainer
        postsContainer.innerHTML = userPosts.map(post => createPostHTML(post)).join(''); 
    }
    
    attachEventListeners();
}

// 生成单条动态的 HTML 结构
function createPostHTML(post) {
    return `
        <div class="card post-card" data-id="${post.id}">
            <div class="post-header"> 
                <!-- 2. 补全头像的 class 名称 -->
                <img src="${post.avatar}" alt="头像" class="avatar"> 
                <div class="user-info">
                    <h4>${post.username}</h4>
                    <small>${timeAgo(post.timestamp)}</small>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
                ${post.image ? `<img src="${post.image}" class="post-image" alt="动态图片" loading="lazy">` : ''}
            </div>
            <div class="post-actions">
                <button class="btn btn-like ${post.likedByMe ? 'liked' : ''}">
                    👍 <span>${post.likes}</span>
                </button>
                <button class="btn" onclick="focusCommentInput(${post.id})">💬 评论</button>
            </div>
            
            <!-- 评论区 -->
            <div class="comments-section">
                <div id="comments-list-${post.id}">
                    ${post.comments.map(c => `
                        <div class="comment-item">
                            <span class="comment-author">${c.author}:</span>
                            <span>${c.text}</span>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 0.5rem; display:flex; gap:0.5rem;">
                    <input type="text" id="comment-input-${post.id}" class="form-control" placeholder="写下你的评论..." style="padding:0.5rem;">
                    <button class="btn btn-primary" onclick="addComment(${post.id})">发送</button>
                </div>
            </div>
        </div>
    `;
}

// 5. 处理发布动态 (publish.html 使用)
function handlePublish() {
    const form = document.getElementById('publish-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const content = document.getElementById('post-content').value;
        const image = document.getElementById('post-image').value; // 这里简化处理，实际项目需文件上传

        if (!content.trim()) {
            alert('内容不能为空！');
            return;
        }

        const newPost = {
            id: Date.now(), // 简单生成ID
            userId: currentUser.id,
            username: currentUser.username,
            avatar: currentUser.avatar,
            content: content,
            image: image,
            likes: 0,
            likedByMe: false,
            comments: [],
            timestamp: Date.now()
        };

        const posts = getPosts();
        posts.unshift(newPost); // 添加到最前面
        savePosts(posts);

        alert('发布成功！');
        form.reset();
        window.location.href = 'index.html'; // 跳转回主页
    });
}

// 6. 交互功能：点赞
function toggleLike(postId) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
        if (post.likedByMe) {
            post.likes--;
        } else {
            post.likes++;
        }
        post.likedByMe = !post.likedByMe;
        savePosts(posts);
        renderFeed(); // 重新渲染以更新界面
        if (window.location.href.includes('profile.html')) renderProfile();
    }
}

// 7. 交互功能：评论
function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const text = input.value;
    if (!text.trim()) return;

    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments.push({
            author: currentUser.username,
            text: text
        });
        savePosts(posts);
        renderFeed(); // 重新渲染
        if (window.location.href.includes('profile.html')) renderProfile();
    }
}

function focusCommentInput(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    input.focus();
}

// 8. 跳转用户主页 (模拟)
function goToUserPage(userId) {
    // 这里简单处理：如果是自己点自己，去个人主页；如果是别人，暂时也去个人主页(实际项目应有公共主页)
    // 为了演示效果，点击头像直接跳转到个人主页
    // 在实际项目中，这里应该传递 userId 参数，例如 profile.html?userId=101
    window.location.href = 'profile.html';
}

// 绑定事件监听器
function attachEventListeners() {
    // 点赞按钮
    document.querySelectorAll('.btn-like').forEach(btn => {
        btn.onclick = function() {
            const postId = parseInt(this.closest('.post-card').dataset.id);
            toggleLike(postId);
        };
    });
}

// --- 页面加载初始化 ---
document.addEventListener('DOMContentLoaded', () => {
    renderFeed();
    renderProfile();
    handlePublish();
});