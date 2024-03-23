# Use an appropriate base image with Node.js pre-installed
FROM --platform=linux/amd64 node:14

# Update package lists and install required packages
RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    imagemagick \
    wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install ffmpeg-static globally using wget
RUN wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz && \
    tar -xJf ffmpeg-release-amd64-static.tar.xz && \
    cd ffmpeg-* && \
    cp ffmpeg /usr/local/bin && \
    cp ffprobe /usr/local/bin && \
    cd .. && \
    rm -rf ffmpeg-* ffmpeg-release-amd64-static.tar.xz

# Set the working directory for the application
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install ytdl-core

# Copy application source code
COPY . .

# Expose the port your app runs on
EXPOSE 8080

# Command to run the application
CMD ["node", "server.js"]
