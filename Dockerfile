# Use an official Node.js image as a base
FROM node:16

# Install LibreOffice
RUN apt-get update && apt-get install -y libreoffice

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]
