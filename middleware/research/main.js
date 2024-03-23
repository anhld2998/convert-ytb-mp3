module.exports = {
  // Hàm này nhận đầu vào là một URL YouTube hoặc ID video và trích xuất ID video
  extractVideoId: function(input) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    let output;

    // Kiểm tra xem đầu vào có khớp với mẫu URL không
    if (input.match(regex)) {
      // Trích xuất ID video từ URL
      const match = input.match(regex);
      output = match[1];
    } else {
      // Nếu không phải là URL, giả định đó là văn bản
      output = input;
    }

    return output;
  }
};
