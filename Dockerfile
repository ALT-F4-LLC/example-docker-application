FROM node:alpine
COPY . .
RUN npm install
CMD [ "node index.js" ]