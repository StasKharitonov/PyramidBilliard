# build env
FROM node:21.7.1-alpine
WORKDIR /app
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com
RUN npm install --legacy-peer-deps
COPY . ./
ENV VITE_API_URL=/api
RUN npm run build
CMD ["sh", "-c", "cp -r dist/. /frontend_static/ && tail -f /dev/null"]
