# Brio production image: LiteFS sidecar + Node server.
# Build with: fly deploy (or `docker build -t brio .`)

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json* bun.lock* ./
RUN npm install --omit=dev || npm install
COPY . .
RUN npm run build

# Final image with LiteFS binary.
FROM flyio/litefs:0.5 AS litefs
FROM node:22-bookworm-slim
WORKDIR /app
COPY --from=build /app /app
COPY --from=litefs /usr/local/bin/litefs /usr/local/bin/litefs
COPY litefs.yml /etc/litefs.yml

# The LiteFS mount target (matches litefs.yml + fly.toml).
ENV LITEFS_DIR=/data \
    NODE_ENV=production \
    PORT=3000

EXPOSE 3000
# LiteFS becomes PID 1 and execs the Node server.
ENTRYPOINT ["litefs", "mount"]
CMD ["node", "dist/server.cjs"]
