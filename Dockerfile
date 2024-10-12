FROM node:20.15.0-alpine AS base

ARG NODE_ENV=development 
ENV NODE_ENV=${NODE_ENV} 
WORKDIR /usr/src/app 
COPY package.json ./ 
RUN npm install
COPY . . 
RUN npm run build
 
CMD ["npm", "run", "start"]