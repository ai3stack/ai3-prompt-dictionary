FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --ignore-scripts
COPY tsconfig.json ./
COPY src/ src/
COPY data/ data/
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
RUN addgroup -S mcp && adduser -S mcp -G mcp
COPY --from=builder /app/dist/ dist/
COPY --from=builder /app/data/ data/
COPY --from=builder /app/node_modules/ node_modules/
COPY package.json ./
USER mcp
ENV MCP_TRANSPORT=sse
ENV MCP_PORT=3001
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD timeout 2 wget -qO- http://localhost:3001/sse 2>/dev/null | head -c 1 | grep -q . || exit 1
CMD ["node", "dist/index.js"]
