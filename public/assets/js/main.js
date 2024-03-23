$(document).ready(function () {
  const youtubeUrlInput = $("#youtubeUrl");
  const convertButton = $("#convertButton");
  const convertForm = $("#convertForm");
  const loadingModal = $("#loadingModal");

  // Hàm này loại bỏ các ký tự đặc biệt không hợp lệ từ tên file
  function sanitizeFilename(filename) {
    return filename.replace(/[<>:"\/\\|?*]/g, "");
  }

  // Hàm này thay đổi trạng thái hiển thị của nút chuyển đổi dựa trên giá trị nhập vào
  function toggleConvertButton() {
    const inputVal = youtubeUrlInput.val();
    convertButton.css("display", inputVal.trim() === "" ? "none" : "block");
  }

  // Lắng nghe sự kiện khi người dùng nhập vào ô input và thực hiện hàm toggleConvertButton
  youtubeUrlInput.on("input", toggleConvertButton);

  // Lắng nghe sự kiện khi người dùng nhấn nút chuyển đổi và gửi yêu cầu tới máy chủ
  convertForm.on("submit", function (event) {
    event.preventDefault();
    loadingModal.modal("show");
    const youtubeUrl = youtubeUrlInput.val();
    $.ajax({
      url: "/convert-mp3",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ youtubeUrl }),
      success: function (data) {
        loadingModal.modal("hide");
        if (data.success) {
          const downloadLink = $("<a>")
            .attr({
              href: data.fileUrl,
              download: sanitizeFilename(convertFilename(data.filename)),
              style: "display: none;",
            });
          $("body").append(downloadLink);
          downloadLink[0].click();
          downloadLink.remove();
        }
      },
      error: function (error) {
        loadingModal.modal("hide");
        console.error("Error:", error);
      }
    });
  });

  // Hàm này thực hiện việc chuyển đổi tên file được mã hóa URL thành tên file chuẩn
  function convertFilename(filename) {
    const decodedFilename = decodeURIComponent(filename);
    const specialChars = {
      "%20": " ",
      "%21": "!",
      "%22": '"',
      "%23": "#",
      "%24": "$",
      "%25": "%",
      "%26": "&",
      "%27": "'",
      "%28": "(",
      "%29": ")",
      "%2A": "*",
      "%2B": "+",
      "%2C": ",",
      "%2D": "-",
      "%2E": ".",
      "%2F": "/",
      "%3A": ":",
      "%3B": ";",
      "%3C": "<",
      "%3D": "=",
      "%3E": ">",
      "%3F": "?",
      "%40": "@",
      "%5B": "[",
      "%5C": "\\",
      "%5D": "]",
      "%5E": "^",
      "%5F": "_",
      "%60": "`",
      "%7B": "{",
      "%7C": "|",
      "%7D": "}",
      "%7E": "~",
      "%C4%90": "Đ",
      "%E1": "á",
    };
    let convertedFilename = decodedFilename;
    for (const [key, value] of Object.entries(specialChars)) {
      convertedFilename = convertedFilename.replace(
        new RegExp(key, "g"),
        value
      );
    }
    return convertedFilename;
  }
});
