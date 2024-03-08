$(document).ready(function () {
  const searchForm = $("#search-form");
  const searchInput = $("#search-input");
  const searchResults = $("#search-results");
  let debounceTimeout;

  searchForm.on("submit", function (event) {
    event.preventDefault();
    const query = searchInput.val().trim();
    if (query !== "") {
      search(query);
    }
  });

  let lastQuery = "";

    searchInput.on("input", function () {
    clearTimeout(debounceTimeout);

    debounceTimeout = requestAnimationFrame(() => {
        const query = searchInput.val().trim();

        if (query !== lastQuery && query.length >= 2) {  // Kiểm tra độ dài tối thiểu
        lastQuery = query;
        search(query);  // Tìm kiếm chỉ khi truy vấn đáp ứng tiêu chí
        } else {
        searchResults.html(""); 
        }
    });
    });

  function search(query) {
    $.get(`/search?q=${query}`)
      .done(function (data) {
        displayResults(data.items);
      })
      .fail(function (error) {
        console.error("Error fetching search results:", error);
      });
  }

  function displayResults(videos) {
    const searchResultsContainer = $("#search-results");
    searchResultsContainer.html("");

    if (videos && videos.length > 0) {
      $.each(videos, function (index, video) {
        // Create card for each result
        const videoCard = $("<div>").addClass("col-md-6 col-12 mb-3").html(`
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
                                      <button class="btn btn-md btn-primary open-modal" data-video-id="${video.id.videoId}" data-video-title="${video.snippet.title}" data-index="${index}">
                                          Convert MP3
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              `);

        // Append card to the current container
        searchResultsContainer.append(videoCard);

        // Modal HTML for each video
        const modalHTML = `
        <div class="modal" tabindex="-1" data-backdrop="static" id="exampleModal-${video.id.videoId}">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Convert MP3</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="modal-body-${video.id.videoId}">
              <div class="text-center">
                <img style="border-radius: 50%; margin-bottom: 10%" src="template/assets/images/logo/logo-icon.png"
                  alt="Logo" width="100" height="100" />
              </div>
              <div class="text-center">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div class="text-center mt-3">
                <p>Please wait while processing...</p>
              </div>
              <div class="text-center title-container mt-2">
                <h6 class="card-title mb-0 w-100 h-100">
                  ${video.snippet.title}
                </h6>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      `;
        // Append modal HTML to body
        $("body").append(modalHTML);
      });

      $(".open-modal").on("click", function () {
        const videoId = $(this).data("video-id");
        const title = $(this).data("video-title");
        const index = $(this).data("index");
        openModal(videoId, title, index);
      });
    } else {
      searchResultsContainer.html("<p>No videos found.</p>");
    }
  }
});

// Function to open modal
function openModal(videoId, title) {
    const modalBody = $(`#modal-body-${videoId}`);
    const modal = $(`#exampleModal-${videoId}`);
  
    // Show the modal
    modal.modal("show");
  
    // Make an AJAX request to your server to convert the video to MP3
    $.post("/convert-mp3", { youtubeUrl: videoId })
      .done(function (data) {
        if (data.success) {
          const downloadLink = $("<a>")
            .attr("href", data.fileUrl)
            .attr("download", `${title}.mp3`)
            .attr("target", "_blank") 
            .addClass("btn btn-sm btn-primary w-100")
            .text("Download");
  
          const titleElement = $("<h5>")
            .addClass("modal-title")
            .text(title);
  
          const titleContainer = $("<div>")
            .addClass("text-center title-container mt-2")
            .append(titleElement);
  
          modalBody.empty(); // Clear default content
  
          downloadLink.on("click", function () {
            downloadLink.get(0).click(); // Trigger click event to initiate download
          });
  
          modalBody.append(titleContainer); // Add title container
          modalBody.append(downloadLink); // Add download link
        } else {
          modalBody.html(`<p>Conversion failed: ${data.error}</p>`);
        }
      })
      .fail(function (error) {
        console.error("Error:", error);
        modalBody.html("<p>An error occurred while converting the video.</p>");
      });
  }
  
// Function to close modal
function closeModal(videoId) {
  const modal = $(`#exampleModal-${videoId}`);
  modal.modal("hide");
}

// Attach click event to close button
$(document).on("click", ".close-modal-btn", function () {
  const videoId = $(this).data("video-id");
  closeModal(videoId);
});

// Attach click event to close icon
$(document).on("click", ".close-modal-icon", function () {
  const videoId = $(this).data("video-id");
  closeModal(videoId);
});
