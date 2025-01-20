FROM node:20-alpine as base
RUN apk add --no-cache g++ make py3-pip libc6-compat linux-headers eudev-dev
WORKDIR /app
COPY package*.json ./
RUN npm install
EXPOSE 3000

FROM base as builder
WORKDIR /app
COPY . .
RUN npm run build

FROM base as production
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_PUBLIC_GRAPHQL_URL=http://backend:4000/graphql

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

CMD ["npm", "start"]

FROM base as dev
ENV NODE_ENV=development
ENV NEXT_PUBLIC_GRAPHQL_URL=http://backend:4000/graphql
COPY . .
CMD ["npm", "run", "dev"]