document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  let debounceTimeout;

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (query !== "") {
      search(query);
    }
  });

  searchInput.addEventListener("input", function () {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(function () {
      const query = searchInput.value.trim();
      if (query !== "") {
        search(query);
      }
    }, 100);
  });

  function search(query) {
    fetch(`/search?q=${query}`)
      .then((response) => response.json())
      .then((data) => {
        displayResults(data.items);
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
  }

  function displayResults(videos) {
    const searchResultsContainer = document.getElementById("search-results");
    searchResultsContainer.innerHTML = "";

    if (videos && videos.length > 0) {
      videos.forEach((video, index) => {
        // Tạo card cho kết quả
        const videoCard = document.createElement("div");
        videoCard.classList.add("col-md-6", "mb-4");
        videoCard.innerHTML = `
        <div class="card">
        <div class="row g-0">
        <div class="embed-responsive embed-responsive-16by9"> <!-- Thêm class embed-responsive để giữ tỷ lệ -->
        <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/${video.id.videoId}" allowfullscreen></iframe>
      </div>
          <div class="col">
            <div class="card-body">
              <h6 class="card-title mb-0 limit-lines">${video.snippet.title}</h6>
              <div class="mt-2">
                <a href="#" class="btn btn-sm btn-primary w-100">
                  <i class="bi bi-file-earmark-music"></i> Convert MP3
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
              `;

        // Thêm card vào container hiện tại
        searchResultsContainer.appendChild(videoCard);
      });
    } else {
      searchResultsContainer.innerHTML = "<p>No videos found.</p>";
    }
  }
});
