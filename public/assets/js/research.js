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
    }, 300);
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
        videoCard.classList.add("col-12 col-md-4", "mb-3");
        videoCard.innerHTML = `  <div class="card">
        <div class="card-body">
            <div class="row">
                <div class="col-md-6 d-flex align-items-stretch">
                    <div class="embed-responsive embed-responsive-16by9">
                      <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/${video.id.videoId}" allowfullscreen></iframe>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="d-flex flex-column h-100">
                        <h5 class="d-flex justify-content-start align-items-start card-title mb-0 limit-lines w-100">${video.snippet.title}</h5>
                        <div class="mt-auto">
                            <button class="btn btn-md btn-primary">
                                Convert MP3
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
        // Thêm card vào container hiện tại
        searchResultsContainer.appendChild(videoCard);
      });
    } else {
      searchResultsContainer.innerHTML = "<p>No videos found.</p>";
    }
  }
});
