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
    }
];

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

// Player State
let currentSongIndex = 0;
let isPlaying = false;
let showingFavoritesOnly = false;
let autoplayEnabled = true;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let selectedMood = null;
let recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];

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
    setGreeting();
    renderPlaylist();
    renderMadeForYouRow();
    renderMoodRow();
    renderRecentlyPlayed();
    renderFavoritesRow();
    loadSong(0);
    audioPlayer.volume = 1;
    autoplayToggle.classList.add('active');
    
    // Add favorite count badge
    const countBadge = document.createElement('span');
    countBadge.className = 'favorites-count';
    countBadge.textContent = favorites.length;
    favoritesToggle.appendChild(countBadge);

    setupEventListeners();
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
function toggleFavorite(songIndex, button, item) {
    const index = favorites.indexOf(songIndex);
    
    if (index > -1) {
        // Remove from favorites
        favorites.splice(index, 1);
        button.classList.remove('favorited');
        item.classList.remove('favorite-highlight');
    } else {
        // Add to favorites
        favorites.push(songIndex);
        button.classList.add('favorited');
        item.classList.add('favorite-highlight');
    }
    
    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Update favorite count
    updateFavoriteCount();
    renderFavoritesRow();
}

// Update Favorite Count
function updateFavoriteCount() {
    const countElement = favoritesToggle.querySelector('.favorites-count');
    if (countElement) {
        countElement.textContent = favorites.length;
    }
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
    volumeSlider.addEventListener('input', (e) => {
        setVolume(e.target.value);
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
init();

console.log('Music Player Loaded! 🎵');