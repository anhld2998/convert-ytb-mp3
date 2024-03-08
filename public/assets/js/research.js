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
      }else {
        searchResults.innerHTML = "";
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
        videoCard.classList.add("col-md-6", "col-12", "mb-3");
        videoCard.innerHTML = ` 
        <div class="card">
    <div class="card-body">
        <div class="row">
            <div class="col-md-6 d-flex align-items-stretch justify-content-center">
                <div class="embed-responsive embed-responsive-16by9  ">
                    <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/${video.id.videoId}" allowfullscreen></iframe>
                </div>
            </div>
            <div class="col-md-6">
                <div class="d-flex flex-column h-100">
                    <div class="title-container mt-2">
                        <h6 class="card-title mb-0 w-100 h-100">${video.snippet.title}</h6>
                    </div>
                    <div class="ms-auto mt-2">
                        <button class="btn btn-md btn-primary">
                            Convert MP3
                        </button>
                    </div>
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
