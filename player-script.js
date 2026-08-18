
const auth = firebase.auth();
const db = firebase.firestore();


// Your name - shown in the "Good morning" greeting
const USER_NAME = "Nidhi";

// Sample Songs Array - REPLACE WITH YOUR SONGS
// "mood" is used to power the "Made for your mood" row - set it to
// one of: happy, calm, energetic, focused, sleepy
const songs = [
    {
        title: "Midnight Dreams",
        artist: "Luna Echo",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        mood: "calm"
    },
    {
        title: "Neon Lights",
        artist: "Cyber Wave",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        mood: "energetic"
    },
    {
        title: "Golden Hour",
        artist: "Sunset Vibes",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        mood: "happy"
    },
    {
        title: "Electric Pulse",
        artist: "Synth Masters",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        mood: "focused"
    },
    {
        title: "Starlight Journey",
        artist: "Cosmic Waves",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        mood: "sleepy"
    },
    {
        title: "Bisilu Kudureyondu",
        artist: "Rajesh Krishnan and Yogaraj Bhat",
        url: "songs/BisiluKudureyondu.mp4",
        mood: "calm"
    },
    {
        title: "Ek zindagi",
        artist: "Tanishka Sanghvi and Sachin-Jigar",
        url: "songs/EkZindagi.mp4",
        mood: "focused"
    },
    {
        title: "Unstoppable",
        artist: "Sia",
        url: "songs/Unstoppable.mp4",
        mood: "focused"
    }
];
// Fetch extra songs from Audius (free, no API key needed)
const AUDIUS_HOST = 'https://discoveryprovider.audius.co';

async function fetchAudiusSongs(limit = 10) {
    try {
        const response = await fetch(
            `${AUDIUS_HOST}/v1/tracks/trending?app_name=NidhiMusicPlayer&limit=${limit}`
        );
        const data = await response.json();
        return data.data.map(track => ({
            title: track.title,
            artist: track.user.name,
            url: `${AUDIUS_HOST}/v1/tracks/${track.id}/stream?app_name=NidhiMusicPlayer`,
            mood: 'happy'   // Audius doesn't tag mood, so default all to "happy" for now
        }));
    } catch (error) {
        console.error('Failed to fetch Audius songs:', error);
        return [];
    }
}

// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');
const songTitle = document.getElementById('songTitle');
const songArtist = document.getElementById('songArtist');
const albumArt = document.getElementById('albumArt');
const playlistContainer = document.getElementById('playlistContainer');
const playlistToggle = document.getElementById('playlistToggle');
const closePlaylist = document.getElementById('closePlaylist');
const playlist = document.getElementById('playlist');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const noResults = document.getElementById('noResults');
const favoritesToggle = document.getElementById('favoritesToggle');
const noFavorites = document.getElementById('noFavorites');
const autoplayToggle = document.getElementById('autoplayToggle');
const greetingText = document.getElementById('greetingText');
const moodButtons = document.getElementById('moodButtons');
const moodRow = document.getElementById('moodRow');
const moodRowTitle = document.getElementById('moodRowTitle');
const recentlyPlayedRow = document.getElementById('recentlyPlayedRow');
const favoritesRow = document.getElementById('favoritesRow');
const madeForYouRow = document.getElementById('madeForYouRow');
const moodflowCarousel = document.getElementById('moodflowCarousel');
const moodflowBtn = document.getElementById('moodflowBtn');
const reactionButtons = document.getElementById('reactionButtons');
const personalitySection = document.getElementById('personalitySection');
const personalityBars = document.getElementById('personalityBars');
const recommendedRow = document.getElementById('recommendedRow');

// ---------- Auth ----------
// ---------- Auth ----------
const authOverlay = document.getElementById('authOverlay');
const loginView = document.getElementById('loginView');
const signupView = document.getElementById('signupView');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const signupConfirmPassword = document.getElementById('signupConfirmPassword');
const authLoginBtn = document.getElementById('authLoginBtn');
const authSignupBtn = document.getElementById('authSignupBtn');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const authError = document.getElementById('authError');
const logoutBtn = document.getElementById('logoutBtn');
let currentUserId = null;

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        currentUserId = user.uid;
        authOverlay.style.display = 'none';
        playlistContainer.classList.remove('open');
        init();
    } else {
        currentUserId = null;
        authOverlay.style.display = 'flex';
        loginView.style.display = 'block';
        signupView.style.display = 'none';
        loginEmail.value = '';
        loginPassword.value = '';
        signupEmail.value = '';
        signupPassword.value = '';
        signupConfirmPassword.value = '';
        authError.textContent = '';
        audioPlayer.pause();
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
});

showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    authError.textContent = '';
    loginView.style.display = 'none';
    signupView.style.display = 'block';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    authError.textContent = '';
    signupView.style.display = 'none';
    loginView.style.display = 'block';
});

authSignupBtn.addEventListener('click', () => {
    authError.textContent = '';
    if (signupPassword.value !== signupConfirmPassword.value) {
        authError.textContent = 'Passwords do not match.';
        return;
    }
    firebase.auth().createUserWithEmailAndPassword(signupEmail.value, signupPassword.value)
        .catch(err => authError.textContent = err.message);
});

authLoginBtn.addEventListener('click', () => {
    authError.textContent = '';
    firebase.auth().signInWithEmailAndPassword(loginEmail.value, loginPassword.value)
        .catch(err => authError.textContent = err.message);
});
logoutBtn.addEventListener('click', () => {
    firebase.auth().signOut();
});
// Player State
let currentSongIndex = 0;
let isPlaying = false;
let showingFavoritesOnly = false;
let autoplayEnabled = true;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let selectedMood = null;
let recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];

// MoodFlow: a fixed emotional journey the user can step through
const moodFlowStages = [
    { key: 'sad',        label: '😔 Sad',        songMood: 'calm' },
    { key: 'calm',       label: '😌 Calm',       songMood: 'calm' },
    { key: 'happy',      label: '😊 Happy',      songMood: 'happy' },
    { key: 'energetic',  label: '🔥 Energetic',  songMood: 'energetic' }
];
let moodFlowIndex = parseInt(localStorage.getItem('moodFlowIndex')) || 0;

// Music Reaction history
let reactions = JSON.parse(localStorage.getItem('reactions')) || [];
// Gradient backgrounds used to fake album art for the mood/recent/favorite cards
const CARD_GRADIENTS = [
    'linear-gradient(135deg, #1DB954, #1a936f)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #f857a6, #ff5858)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    'linear-gradient(135deg, #f6d365, #fda085)'
];

// Initialize
// Initialize
function init() {
    loadUserFavoritesFromFirebase();
    setGreeting();
    renderPlaylist();
    renderMadeForYouRow();
    renderMoodRow();
    renderRecentlyPlayed();
    renderFavoritesRow();
    loadSong(0);
    audioPlayer.volume = 1;
    autoplayToggle.classList.add('active');
    updateMoodFlowUI();
    renderPersonality();
    renderRecommendedRow();
    
    // Add favorite count badge
        // Add favorite count badge (only if not already present)
    if (!favoritesToggle.querySelector('.favorites-count')) {
        const countBadge = document.createElement('span');
        countBadge.className = 'favorites-count';
        countBadge.textContent = favorites.length;
        favoritesToggle.appendChild(countBadge);
    } else {
        favoritesToggle.querySelector('.favorites-count').textContent = favorites.length;
    }

    setupEventListeners();
}
// Load user favorites from Firebase
async function loadUserFavoritesFromFirebase() {
    if (!currentUserId) return;
    
    try {
        const docSnap = await db.collection('users').doc(currentUserId).get();
        if (docSnap.exists && docSnap.data().favorites) {
            favorites = docSnap.data().favorites;
            localStorage.setItem('favorites', JSON.stringify(favorites));
        }
    } catch (error) {
        console.log('Could not load favorites from Firebase:', error);
    }
}

// Greeting - "Good morning/afternoon/evening, Name!"
function setGreeting() {
    const hour = new Date().getHours();
    let timeOfDay = 'morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17) timeOfDay = 'evening';
    greetingText.textContent = `Good ${timeOfDay}, ${USER_NAME}!`;
}

// Build a small card element used in the mood / recent / favorites rows
function createSongCard(index, { small = false } = {}) {
    const song = songs[index];
    const card = document.createElement('div');
    card.className = small ? 'recent-card' : 'music-card';

    const cover = document.createElement('div');
    cover.className = small ? 'recent-thumb' : 'cover';
    cover.style.background = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
    cover.innerHTML = '<i class="fas fa-music"></i>';

    const info = document.createElement('div');
    info.className = small ? 'recent-card-info' : 'music-card-info';
    info.innerHTML = `
        <div class="music-card-title">${song.title}</div>
        <div class="music-card-artist">${song.artist}</div>
    `;

    card.appendChild(cover);
    card.appendChild(info);
    card.addEventListener('click', () => {
        loadSong(index);
        audioPlayer.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        albumArt.classList.add('playing');
        isPlaying = true;
    });

    return card;
}

// Made For You - a simple shuffled recommendation shelf
function renderMadeForYouRow() {
    madeForYouRow.innerHTML = '';

    // Shuffle a copy of the song indices so the order isn't the same as the playlist
    const shuffledIndexes = songs.map((_, i) => i);
    for (let i = shuffledIndexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledIndexes[i], shuffledIndexes[j]] = [shuffledIndexes[j], shuffledIndexes[i]];
    }

    shuffledIndexes.slice(0, 4).forEach(index => {
        madeForYouRow.appendChild(createSongCard(index));
    });
}

// Made For Your Mood
function renderMoodRow() {
    moodRow.innerHTML = '';
    const matches = selectedMood
        ? songs.filter(song => song.mood === selectedMood)
        : songs;

    if (selectedMood) {
        const label = selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1);
        moodRowTitle.textContent = `Made for your ${label} mood`;
    } else {
        moodRowTitle.textContent = 'Made for your mood';
    }

    if (matches.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'row-empty';
        empty.textContent = "No songs tagged for this mood yet - add some in player-script.js!";
        moodRow.appendChild(empty);
        return;
    }

    matches.forEach(song => {
        const index = songs.indexOf(song);
        moodRow.appendChild(createSongCard(index));
    });
}

// Recently Played
function addToRecentlyPlayed(index) {
    recentlyPlayed = recentlyPlayed.filter(i => i !== index);
    recentlyPlayed.unshift(index);
    recentlyPlayed = recentlyPlayed.slice(0, 4);
    localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
    renderRecentlyPlayed();
}

function renderRecentlyPlayed() {
    recentlyPlayedRow.innerHTML = '';
    if (recentlyPlayed.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'row-empty';
        empty.textContent = 'Play a song and it will show up here.';
        recentlyPlayedRow.appendChild(empty);
        return;
    }
    recentlyPlayed.forEach(index => {
        recentlyPlayedRow.appendChild(createSongCard(index, { small: true }));
    });
}

// Your Favorites (row preview)
function renderFavoritesRow() {
    favoritesRow.innerHTML = '';
    if (favorites.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'row-empty';
        empty.textContent = 'Tap the heart on a song to add it here.';
        favoritesRow.appendChild(empty);
        return;
    }
    favorites.forEach(index => {
        favoritesRow.appendChild(createSongCard(index));
    });
}

// Load Song
function loadSong(index) {
    if (index >= 0 && index < songs.length) {
        currentSongIndex = index;
        const song = songs[index];
        audioPlayer.src = song.url;
        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
        updatePlaylistUI();
        addToRecentlyPlayed(index);
        if (isPlaying) {
            audioPlayer.play();
        }
    }
}

// Play/Pause Toggle
function togglePlay() {
    if (isPlaying) {
        audioPlayer.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        albumArt.classList.remove('playing');
        isPlaying = false;
    } else {
        audioPlayer.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        albumArt.classList.add('playing');
        isPlaying = true;
    }
}

// Next Song
function playNext() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    if (isPlaying) audioPlayer.play();
}

// Previous Song
function playPrevious() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    if (isPlaying) audioPlayer.play();
}

// Format Time
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Update Progress Bar
function updateProgress() {
    const { currentTime, duration } = audioPlayer;
    if (duration) {
        const percentage = (currentTime / duration) * 100;
        progressFill.style.width = percentage + '%';
    }
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    durationEl.textContent = formatTime(audioPlayer.duration);
}

// Render Playlist
// Render Playlist
// Render Playlist
function renderPlaylist(filteredSongs = null) {
    playlist.innerHTML = '';
    const songsToDisplay = filteredSongs || songs;
    
    if (songsToDisplay.length === 0) {
        if (showingFavoritesOnly) {
            noFavorites.style.display = 'flex';
        } else {
            noResults.style.display = 'flex';
        }
        playlist.style.display = 'none';
        return;
    } else {
        noResults.style.display = 'none';
        noFavorites.style.display = 'none';
        playlist.style.display = 'flex';
    }
    
    songsToDisplay.forEach((song, displayIndex) => {
        // Find original index
        const originalIndex = songs.indexOf(song);
        const isFavorited = favorites.includes(originalIndex);
        
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (originalIndex === currentSongIndex) item.classList.add('active');
        if (isFavorited) item.classList.add('favorite-highlight');
        
        item.innerHTML = `
            <div class="playlist-item-content">
                <div class="playlist-item-title">${song.title}</div>
                <div class="playlist-item-artist">${song.artist}</div>
            </div>
            <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-index="${originalIndex}">
                <i class="fas fa-heart"></i>
            </button>
        `;
        
        // Add click handler for song
        const contentArea = item.querySelector('.playlist-item-content');
        contentArea.addEventListener('click', () => {
            loadSong(originalIndex);
            audioPlayer.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            albumArt.classList.add('playing');
            isPlaying = true;
        });
        
        // Add click handler for favorite button
        const favBtn = item.querySelector('.favorite-btn');
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(originalIndex, favBtn, item);
        });
        
        playlist.appendChild(item);
    });
}




// Toggle Favorite
// ---------- MoodFlow ----------
function updateMoodFlowUI() {
    const stage = moodFlowStages[moodFlowIndex];

    moodflowCarousel.innerHTML = '';
    moodFlowStages.forEach((s, i) => {
        const [emoji, ...rest] = s.label.split(' ');
        const card = document.createElement('div');
        card.className = 'moodflow-stage' + (i === moodFlowIndex ? ' active' : '');
        card.innerHTML = `<span class="emoji">${emoji}</span>${rest.join(' ')}`;
        moodflowCarousel.appendChild(card);
    });

    // Button text changes depending on where you are in the journey
    moodflowBtn.textContent = (moodFlowIndex < moodFlowStages.length - 1)
        ? "I'm feeling better →"
        : "Feeling great 🔥";
    moodflowBtn.disabled = moodFlowIndex === moodFlowStages.length - 1;

    // Drive the existing "Made for your mood" row with this stage
    selectedMood = stage.songMood;
    moodButtons.querySelectorAll('.mood-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.mood === selectedMood)
    );
    renderMoodRow();
}

function advanceMoodFlow() {
    if (moodFlowIndex < moodFlowStages.length - 1) {
        moodFlowIndex++;
        localStorage.setItem('moodFlowIndex', moodFlowIndex);
        updateMoodFlowUI();
    }
}

// ---------- Music Reaction ----------
const reactionToMood = { love: 'happy', amazing: 'energetic', relaxing: 'calm', sleepy: 'sleepy' };
function recordReaction(type) {
    reactions.push({ songIndex: currentSongIndex, type, time: Date.now() });
    localStorage.setItem('reactions', JSON.stringify(reactions));
    renderPersonality();
    renderRecommendedRow();
    updateMoodFlowFromReactions();

    if (type === 'skip') {
        playNext();
    }
}

function updateMoodFlowFromReactions() {
    const counts = {};
    reactions.forEach(r => {
        if (r.type === 'skip') return;
        counts[r.type] = (counts[r.type] || 0) + 1;
    });

    let topType = null;
    let topCount = 0;
    Object.keys(counts).forEach(type => {
        if (counts[type] > topCount) {
            topCount = counts[type];
            topType = type;
        }
    });

    if (!topType) return;

    const targetMoodKey = reactionToMood[topType];
    const targetIndex = moodFlowStages.findIndex(s => s.key === targetMoodKey);

    if (targetIndex !== -1 && targetIndex !== moodFlowIndex) {
        moodFlowIndex = targetIndex;
        localStorage.setItem('moodFlowIndex', moodFlowIndex);
        updateMoodFlowUI();
    }
}

function renderRecommendedRow() {
    recommendedRow.innerHTML = '';
    const counts = {};
    reactions.forEach(r => {
        if (r.type === 'skip') return;
        counts[r.type] = (counts[r.type] || 0) + 1;
    });

    let topType = null;
    let topCount = 0;
    Object.keys(counts).forEach(type => {
        if (counts[type] > topCount) {
            topCount = counts[type];
            topType = type;
        }
    });

    const targetMood = topType ? reactionToMood[topType] : null;
    const matches = targetMood
        ? songs.filter(s => s.mood === targetMood)
        : songs;

    matches.slice(0, 4).forEach(song => {
        recommendedRow.appendChild(createSongCard(songs.indexOf(song)));
    });
}

function renderPersonality() {
    if (reactions.length === 0) {
        personalitySection.style.display = 'none';
        return;
    }
    personalitySection.style.display = 'block';

    const counts = { love: 0, amazing: 0, relaxing: 0, sleepy: 0, skip: 0 };
    reactions.forEach(r => counts[r.type]++);
    const total = reactions.length;

    const labels = {
        love: '❤️ Love it',
        amazing: '🔥 Amazing',
        relaxing: '😌 Relaxing',
        sleepy: '😴 Sleepy',
        skip: '⏭️ Skipped'
    };

    personalityBars.innerHTML = '';
    Object.keys(labels).forEach(key => {
        const percent = Math.round((counts[key] / total) * 100);
        const row = document.createElement('div');
        row.className = 'personality-bar-row';
        row.innerHTML = `
            <span style="width:90px; text-align:left;">${labels[key]}</span>
            <div class="personality-bar-track">
                <div class="personality-bar-fill" style="width:${percent}%"></div>
            </div>
            <span class="personality-bar-label">${percent}%</span>
        `;
        personalityBars.appendChild(row);
    });
}

// Toggle Favorite
function toggleFavorite(songIndex, button, item) {
    const index = favorites.indexOf(songIndex);
    
    if (index > -1) {
        favorites.splice(index, 1);
        button.classList.remove('favorited');
        item.classList.remove('favorite-highlight');
    } else {
        favorites.push(songIndex);
        button.classList.add('favorited');
        item.classList.add('favorite-highlight');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteCount();
    renderFavoritesRow();
    renderPlaylist(); 
        // Also save to Firebase
    if (currentUserId) {
        db.collection('users').doc(currentUserId).update({
            favorites: favorites,
            lastUpdated: new Date()
        }).catch(err => console.log('Firebase save error:', err));
    } // ← ADD THIS LINE
}
// Update Favorite Count
function updateFavoriteCount() {
    let badge = favoritesToggle.querySelector('.favorites-count');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'favorites-count';
        favoritesToggle.appendChild(badge);
    }
    badge.textContent = favorites.length;
}

// Get Favorites Only
function getFavoriteSongs() {
    return songs.filter((song, index) => favorites.includes(index));
}
// Search Filter Function
function filterSongs(searchTerm) {
    if (!searchTerm.trim()) {
        renderPlaylist();
        clearSearch.style.display = 'none';
        return;
    }
    
    clearSearch.style.display = 'flex';
    
    const term = searchTerm.toLowerCase();
    const filtered = songs.filter(song => 
        song.title.toLowerCase().includes(term) || 
        song.artist.toLowerCase().includes(term)
    );
    
    renderPlaylist(filtered);
}

// Update Playlist UI
function updatePlaylistUI() {
    const items = document.querySelectorAll('.playlist-item');
    items.forEach((item, index) => {
        if (index === currentSongIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Seek Progress
function seekProgress(e) {
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(x / rect.width, 1));
    audioPlayer.currentTime = percentage * audioPlayer.duration;
}

// Volume Control
function setVolume(value) {
    audioPlayer.volume = value / 100;
}

// Setup Event Listeners
function setupEventListeners() {
    // Player Controls
    playBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', playNext);
    prevBtn.addEventListener('click', playPrevious);

    // Progress
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audioPlayer.duration);
    });
    audioPlayer.addEventListener('ended', () => {
        if (autoplayEnabled) {
            playNext();
        } else {
            isPlaying = false;
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            albumArt.classList.remove('playing');
        }
    });
    progressBar.addEventListener('click', seekProgress);

    // Autoplay Toggle
    autoplayToggle.addEventListener('click', () => {
        autoplayEnabled = !autoplayEnabled;
        autoplayToggle.classList.toggle('active', autoplayEnabled);
    });

    // Mood Check-in
    moodButtons.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.dataset.mood;
            // Clicking an already-selected mood clears the filter
            selectedMood = (selectedMood === mood) ? null : mood;

            moodButtons.querySelectorAll('.mood-btn').forEach(b =>
                b.classList.toggle('active', b.dataset.mood === selectedMood)
            );

            renderMoodRow();
        });
    });

    // Volume
    // Volume
    volumeSlider.addEventListener('input', (e) => {
        setVolume(e.target.value);
    });

    // MoodFlow button
    moodflowBtn.addEventListener('click', advanceMoodFlow);

    // Music Reaction buttons
    reactionButtons.querySelectorAll('.reaction-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            reactionButtons.querySelectorAll('.reaction-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            recordReaction(btn.dataset.reaction);
        });
    });

    // Playlist Toggle
    // Playlist Toggle
    playlistToggle.addEventListener('click', () => {
        playlistContainer.classList.toggle('open');
        searchInput.focus();
    });

    closePlaylist.addEventListener('click', () => {
        playlistContainer.classList.remove('open');
    });

    // Search Functionality
    searchInput.addEventListener('input', (e) => {
        filterSongs(e.target.value);
    });

    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        filterSongs('');
    });

    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    });

    // Favorites Toggle
    favoritesToggle.addEventListener('click', () => {
        showingFavoritesOnly = !showingFavoritesOnly;
        
        if (showingFavoritesOnly) {
            favoritesToggle.style.color = '#1DB954';
            const favoriteSongs = getFavoriteSongs();
            renderPlaylist(favoriteSongs);
        } else {
            favoritesToggle.style.color = '';
            renderPlaylist();
        }
        
        // Clear search
        searchInput.value = '';
    });
}


// Initialize Player
// Fetch extra songs from Audius, then start the player
async function startApp() {
    const audiusSongs = await fetchAudiusSongs(10);
    songs.push(...audiusSongs);   // adds Audius tracks after your 5 existing ones
    
    console.log('Music Player Loaded! 🎵');
}

startApp();