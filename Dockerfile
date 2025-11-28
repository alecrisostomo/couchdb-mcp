FROM node:lts-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --ignore-scripts
COPY . .
RUN npm run build
CMD [ "node", "build/index.js" ]
