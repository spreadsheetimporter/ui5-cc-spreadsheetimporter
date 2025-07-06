# Use the official Node 20 Debian image as a base
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Install gnome-keyring
RUN apt-get update && \
    apt-get install -y gnome-keyring && \
    apt-get clean

# Use npm (already installed)


RUN npm i -g @sap/cds-dk@8.8.2

# Copy package.json and other configuration files
COPY package.json tsconfig.json ./

# Copy the entire project folder to the container
COPY . .

# Install all dependencies
RUN npm install --legacy-peer-deps

# Build the project
RUN npm run build

# Specifically build the sub-project in the examples/packages/ordersv4fe folder
RUN cd examples/packages/ordersv4fe && npm run build
RUN cd examples/packages/ordersv2fe && npm run build
RUN cd examples/packages/anyupload && npm run build
RUN cd examples/packages/ordersv4freestyle && npm run build

# Expose the port the app runs on
EXPOSE 4004

# Command to run the app
CMD ["npm", "run", "start:server"]
