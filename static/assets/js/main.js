  function sanitizeFilename(filename) {
        return filename.replace(/[<>:"\/\\|?*]/g, "");
      }
      function toggleConvertButton() {
        const inputVal = document.getElementById("youtubeUrl").value;
        const convertButton = document.getElementById("convertButton");
        convertButton.style.display = inputVal.trim() === "" ? "none" : "block";
      }
      document
        .getElementById("youtubeUrl")
        .addEventListener("input", toggleConvertButton);
      document
        .getElementById("convertForm")
        .addEventListener("submit", function (event) {
          event.preventDefault();
          $("#loadingModal").modal("show");
          const youtubeUrl = document.getElementById("youtubeUrl").value;
          fetch("/convert-mp3", {
            method: "POST",
            body: JSON.stringify({ youtubeUrl }),
            headers: { "Content-Type": "application/json" },
          })
            .then((response) => response.json())
            .then((data) => {
              $("#loadingModal").modal("hide");
              if (data.success) {
                const downloadLink = document.createElement("a");
                downloadLink.href = `${data.fileUrl}`;
                downloadLink.download = sanitizeFilename(
                  convertFilename(data.filename)
                );
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
              }
            })
            .catch((error) => {
              $("#loadingModal").modal("hide");
              console.error("Error:", error);
            });
        });
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