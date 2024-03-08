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
      } else {
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
        // Create card for each result
        const videoCard = document.createElement("div");
        videoCard.classList.add("col-md-6", "col-12", "mb-3");
        videoCard.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6 d-flex align-items-stretch justify-content-center">
                                <div class="embed-responsive embed-responsive-16by9">
                                    <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/${video.id.videoId}" allowfullscreen></iframe>
                                </div>
                            </div>
                            <div class="col-md-6 d-flex flex-column justify-content-between">
                                <div class="title-container mt-2">
                                    <h6 class="card-title mb-0 w-100 h-100">${video.snippet.title}</h6>
                                </div>
                                <div class="mt-auto mb-2">
                                    <!-- Button triggers modal -->
                                    <button class="btn btn-md btn-primary" onclick="openModal('${video.id.videoId}', '${video.snippet.title}')" data-toggle="modal" data-target="#exampleModal${index}" id="openModalButton${index}">
                                        Convert MP3
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

        // Append card to the current container
        searchResultsContainer.appendChild(videoCard);

        // Modal HTML for each video
        const modalHTML = `
                <div class="modal fade" id="exampleModal${index}" tabindex="-1" aria-labelledby="exampleModalLabel${index}" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel${index}">Convert MP3</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body" id="modal-body-${video.id.videoId}">
                            <div class="text-center">
                            <img
                              style="border-radius: 50%; margin-bottom: 10%"
                              src="template/assets/images/logo/logo-icon.png"
                              alt="Logo"
                              width="100"
                              height="100"
                            />
                          </div>
                          <div class="text-center">
                            <div class="spinner-border" role="status">
                              <span class="visually-hidden">Loading...</span>
                            </div>
                          </div>
                          <div class="text-center mt-3">
                            <p>Please wait while processing...</p>
                          </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        // Append modal HTML to body
        document.body.insertAdjacentHTML("beforeend", modalHTML);
      });
    } else {
      searchResultsContainer.innerHTML = "<p>No videos found.</p>";
    }
  }
});
function openModal(videoId, title) {
  const modalBody = document.getElementById("modal-body");

  // Show the modal
  const modal = document.getElementById("myModal");
  modal.style.display = "block";

  // Make an AJAX request to your server to convert the video to MP3
  fetch("/convert-mp3", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ youtubeUrl: videoId }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const downloadLink = document.createElement("a");
        downloadLink.setAttribute("href", data.fileUrl);
        downloadLink.setAttribute("download", `${title}.mp3`);
        downloadLink.setAttribute("class", "btn btn-sm btn-primary");
        downloadLink.textContent = "Download";
        modalBody.innerHTML = ""; // Clear default content

        // Attach click event listener to initiate download
        downloadLink.addEventListener("click", () => {
          // Trigger click event to initiate download
          downloadLink.click();
        });

        modalBody.appendChild(downloadLink);
      } else {
        // If conversion fails, display an error message
        modalBody.innerHTML = `<p>Conversion failed: ${data.error}</p>`;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      modalBody.innerHTML =
        "<p>An error occurred while converting the video.</p>";
    });
}
