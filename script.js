const episodes = [
  {
    title: "中堅マーケターのための昇進戦略",
    category: "career",
    label: "Career",
    duration: "28分",
    minutes: 28,
    description: "上司視点で見られる動き方",
    icon: "▶",
    saved: true,
    recent: true,
    downloaded: false
  },
  {
    title: "六本木で使えるBtoBマーケ入門",
    category: "marketing",
    label: "Marketing",
    duration: "34分",
    minutes: 34,
    description: "広告・CRM・営業連携",
    icon: "◐",
    saved: true,
    recent: false,
    downloaded: true
  },
  {
    title: "筋トレ中に聴く市場分析",
    category: "fitness",
    label: "Short",
    duration: "5分",
    minutes: 5,
    description: "短時間で市場を見る",
    icon: "▮",
    saved: false,
    recent: true,
    downloaded: false
  },
  {
    title: "プレイヤーからリーダーへ",
    category: "career",
    label: "Leadership",
    duration: "22分",
    minutes: 22,
    description: "昇進前のチーム視点",
    icon: "↗",
    saved: true,
    recent: false,
    downloaded: false
  },
  {
    title: "ブランドはレコードのように積み上がる",
    category: "music",
    label: "Brand",
    duration: "18分",
    minutes: 18,
    description: "音楽好きにも刺さる戦略論",
    icon: "◯",
    saved: true,
    recent: true,
    downloaded: true
  },
  {
    title: "ゴルフ移動で聴く営業連携術",
    category: "marketing",
    label: "Sales",
    duration: "16分",
    minutes: 16,
    description: "営業との会話を変える",
    icon: "＋",
    saved: false,
    recent: false,
    downloaded: false
  }
];

const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".bottom-nav button");
const pageTargetButtons = document.querySelectorAll("[data-page-target]");
const backButton = document.getElementById("backButton");
const appHeader = document.querySelector(".header");
const appFooter = document.querySelector(".footer");
const registerForm = document.getElementById("registerForm");

const episodeList = document.getElementById("episodeList");
const searchResultList = document.getElementById("searchResultList");
const libraryList = document.getElementById("libraryList");

const tabs = document.querySelectorAll(".tab");
const libraryTabs = document.querySelectorAll(".library-tabs button");
const homeSearchInput = document.getElementById("homeSearchInput");
const searchPageInput = document.getElementById("searchPageInput");

const playerTitle = document.getElementById("playerTitle");
const playerCategory = document.getElementById("playerCategory");
const mainPlayBtn = document.getElementById("mainPlayBtn");
const fullPlayBtn = document.getElementById("fullPlayBtn");
const progressFill = document.getElementById("progressFill");
const fullProgressFill = document.getElementById("fullProgressFill");
const miniPlayer = document.getElementById("miniPlayer");

const fullPlayerTitle = document.getElementById("fullPlayerTitle");
const fullPlayerLabel = document.getElementById("fullPlayerLabel");
const fullPlayerDescription = document.getElementById("fullPlayerDescription");
const elapsedTime = document.getElementById("elapsedTime");
const remainingTime = document.getElementById("remainingTime");

const playFeatured = document.getElementById("playFeatured");
const featuredCard = document.getElementById("featuredCard");

let activeCategory = "all";
let activeLibraryFilter = "saved";
let currentEpisodeIndex = 0;
let isPlaying = false;
let progress = 0;
let timer = null;
let previousPage = "register";
let currentPage = "register";
let userProfile = null;

function showPage(pageName, options = {}) {
  previousPage = currentPage;
  currentPage = pageName;

  pages.forEach((page) => {
    page.classList.toggle("active", page.dataset.page === pageName);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.pageTarget === pageName);
  });

  backButton.classList.toggle("visible", pageName === "player");

  const isRegister = pageName === "register";
  appHeader.classList.toggle("register-mode", isRegister);
  appFooter.classList.toggle("hidden", isRegister);

  if (pageName === "player") {
    miniPlayer.classList.add("hidden");
  } else {
    miniPlayer.classList.remove("hidden");
  }

  if (!options.keepScroll) {
    document.querySelector(".content").scrollTop = 0;
  }
}

function createEpisodeCard(episode, index) {
  const card = document.createElement("button");
  card.className = "episode-card";
  card.type = "button";

  card.innerHTML = `
    <div class="episode-icon">${episode.icon}</div>

    <div class="episode-meta">
      <p>${episode.label}</p>
      <h3>${episode.title}</h3>
      <span>${episode.description} · ${episode.duration}</span>
    </div>

    <span class="episode-action" aria-hidden="true">▶</span>
  `;

  card.addEventListener("click", () => {
    selectEpisode(index);
    showPage("player");
  });

  return card;
}

function renderList(target, list) {
  target.innerHTML = "";

  list.forEach((episode) => {
    target.appendChild(createEpisodeCard(episode, episodes.indexOf(episode)));
  });

  if (list.length === 0) {
    const empty = document.createElement("article");
    empty.className = "episode-card";
    empty.innerHTML = `
      <div class="episode-icon">—</div>
      <div class="episode-meta">
        <p>No result</p>
        <h3>該当するエピソードがありません</h3>
        <span>別のキーワードで検索してください</span>
      </div>
      <span></span>
    `;
    target.appendChild(empty);
  }
}

function renderHomeEpisodes() {
  const keyword = homeSearchInput.value.trim().toLowerCase();

  const filteredEpisodes = episodes.filter((episode) => {
    const categoryMatch =
      activeCategory === "all" || episode.category === activeCategory;

    const keywordMatch =
      episode.title.toLowerCase().includes(keyword) ||
      episode.label.toLowerCase().includes(keyword) ||
      episode.description.toLowerCase().includes(keyword);

    return categoryMatch && keywordMatch;
  });

  renderList(episodeList, filteredEpisodes);
}

function renderSearchResults() {
  const keyword = searchPageInput.value.trim().toLowerCase();

  const filteredEpisodes = episodes.filter((episode) => {
    if (!keyword) return true;

    return (
      episode.title.toLowerCase().includes(keyword) ||
      episode.label.toLowerCase().includes(keyword) ||
      episode.description.toLowerCase().includes(keyword) ||
      episode.category.toLowerCase().includes(keyword)
    );
  });

  renderList(searchResultList, filteredEpisodes);
}

function renderLibrary() {
  const filtered = episodes.filter((episode) => episode[activeLibraryFilter]);
  renderList(libraryList, filtered);
}

function selectEpisode(index) {
  currentEpisodeIndex = index;
  const episode = episodes[index];

  playerTitle.textContent = episode.title;
  playerCategory.textContent = episode.label;

  fullPlayerTitle.textContent = episode.title;
  fullPlayerLabel.textContent = episode.label;
  fullPlayerDescription.textContent = `${episode.description} · ${episode.duration}`;

  progress = 0;
  updateProgress();
}

function play() {
  isPlaying = true;
  mainPlayBtn.textContent = "Ⅱ";
  fullPlayBtn.textContent = "Ⅱ";

  clearInterval(timer);

  timer = setInterval(() => {
    progress += 1;

    if (progress >= 100) {
      progress = 0;
      nextEpisode();
    }

    updateProgress();
  }, 500);
}

function pause() {
  isPlaying = false;
  mainPlayBtn.textContent = "▶";
  fullPlayBtn.textContent = "▶";
  clearInterval(timer);
}

function togglePlay() {
  if (isPlaying) {
    pause();
  } else {
    play();
  }
}

function nextEpisode() {
  currentEpisodeIndex = (currentEpisodeIndex + 1) % episodes.length;
  selectEpisode(currentEpisodeIndex);

  if (isPlaying) {
    play();
  }
}

function updateProgress() {
  progressFill.style.width = `${progress}%`;
  fullProgressFill.style.width = `${progress}%`;

  const episode = episodes[currentEpisodeIndex];
  const totalSeconds = episode.minutes * 60;
  const elapsedSeconds = Math.floor(totalSeconds * (progress / 100));
  const remainingSeconds = Math.max(totalSeconds - elapsedSeconds, 0);

  elapsedTime.textContent = formatTime(elapsedSeconds);
  remainingTime.textContent = `-${formatTime(remainingSeconds)}`;
}

function formatTime(seconds) {
  const minute = Math.floor(seconds / 60);
  const second = seconds % 60;
  return `${minute}:${String(second).padStart(2, "0")}`;
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    activeCategory = tab.dataset.category;
    renderHomeEpisodes();
  });
});

libraryTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    libraryTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    activeLibraryFilter = tab.dataset.libraryFilter;
    renderLibrary();
  });
});

pageTargetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.pageTarget);
  });
});

document.querySelectorAll("[data-search-keyword]").forEach((button) => {
  button.addEventListener("click", () => {
    searchPageInput.value = button.dataset.searchKeyword;
    renderSearchResults();
  });
});

backButton.addEventListener("click", () => {
  showPage(previousPage === "player" ? "home" : previousPage);
});

homeSearchInput.addEventListener("input", renderHomeEpisodes);
searchPageInput.addEventListener("input", renderSearchResults);

mainPlayBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  togglePlay();
});

fullPlayBtn.addEventListener("click", togglePlay);

document.getElementById("rewindBtn").addEventListener("click", () => {
  progress = Math.max(progress - 6, 0);
  updateProgress();
});

document.getElementById("forwardBtn").addEventListener("click", () => {
  progress = Math.min(progress + 6, 100);
  updateProgress();
});

miniPlayer.addEventListener("click", () => {
  showPage("player");
});

playFeatured.addEventListener("click", (event) => {
  event.stopPropagation();
  selectEpisode(0);
  showPage("player");
  play();
});

featuredCard.addEventListener("click", () => {
  selectEpisode(0);
  showPage("player");
});


registerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  userProfile = {
    name: document.getElementById("nameInput").value.trim(),
    email: document.getElementById("emailInput").value.trim(),
    homeStation: document.getElementById("homeStationInput").value.trim(),
    workStation: document.getElementById("workStationInput").value.trim()
  };

  const displayName = userProfile.name || "古岡 専";
  const firstChar = displayName.replace(/\s/g, "").charAt(0) || "専";

  document.querySelector(".user-button").textContent = firstChar;
  document.querySelector(".profile-avatar").textContent = firstChar;

  const profileTitle = document.querySelector(".profile-hero h1");
  const routeButton = document.querySelector(".settings-list button:first-child strong");

  if (profileTitle) {
    profileTitle.textContent = displayName;
  }

  if (routeButton) {
    routeButton.textContent = `${userProfile.homeStation} → ${userProfile.workStation}`;
  }

  showPage("home");
});

selectEpisode(0);
renderHomeEpisodes();
renderSearchResults();
renderLibrary();
showPage("register");
