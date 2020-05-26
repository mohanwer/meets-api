FROM node:12 AS build
WORKDIR /src

COPY ./package.json ./yarn.lock ./
RUN yarn install

COPY . /src

RUN yarn build

FROM node:12-alpine
WORKDIR /usr/app
COPY --from=build /src/node_modules /usr/app/node_modules
COPY --from=build /src/package.json /usr/app/package.json
COPY --from=build /src/dist /usr/app/dist

EXPOSE 5000
CMD ["yarn", "start"]