module.exports = {
    extractVideoId: function(input) {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        let output;
      
        // Check if the input matches the URL pattern
        if (input.match(regex)) {
          // Extract the video ID from the URL
          const match = input.match(regex);
          output = match[1];
        } else {
          // If it's not a URL, assume it's text
          output = input;
        }
      
        return output;
      }
};
