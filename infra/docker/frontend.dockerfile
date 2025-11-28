# Infra - Frontend Dockerfile

FROM node:18-alpine

WORKDIR /app

COPY frontend/web/package.json .
RUN npm install

COPY frontend/web/ .
RUN npm run build

CMD ["npm", "start"]
