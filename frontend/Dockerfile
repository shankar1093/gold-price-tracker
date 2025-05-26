FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Debug: Show what was built and check CSS content
RUN echo "=== Build Output ===" && \
    ls -la .next/ && \
    echo "=== CSS Files Generated ===" && \
    find .next -name "*.css" && \
    echo "=== Sample CSS Content ===" && \
    find .next -name "*.css" -exec head -10 {} \;

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# For standalone builds, copy the standalone output first
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Then copy static files to the correct location
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public files
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Use server.js for standalone builds
CMD ["node", "server.js"]