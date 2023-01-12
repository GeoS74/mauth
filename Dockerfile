FROM node

WORKDIR /mauth

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "./index"]