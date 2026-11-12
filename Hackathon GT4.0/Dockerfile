from node:20

workdir /app

copy package.json package-lock.json ./

workdir /app

run npm run intall

copy . .

cmd["node","src/server.js"]