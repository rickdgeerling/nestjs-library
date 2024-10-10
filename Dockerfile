FROM node:22 AS dev

RUN npm install --global pnpm
USER node
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

CMD ["pnpm", "run","start:debug"]
