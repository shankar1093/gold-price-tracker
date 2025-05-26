FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy package.json first
COPY --from=builder /app/package.json ./package.json

# Copy the standalone server and its dependencies
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static assets - this is crucial for styling
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public directory
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]