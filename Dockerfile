FROM node:18-slim

# Install LibreOffice
RUN apt-get update && apt-get install -y libreoffice

# Set up your working directory
WORKDIR /app

# Copy the files and install dependencies
COPY . /app
RUN npm install

# Expose the port
EXPOSE 5000

# Start the app
CMD ["node", "index.js"]
