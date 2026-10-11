import type {
  SystemDesignPayload,
  AlgoMotionProps,
} from "../../src/types.ts";

export const SYSTEM_DESIGN_BLUEPRINTS: Record<string, {
  title: string;
  subtitle: string;
  voiceoverText: string;
  payload: SystemDesignPayload;
}> = {
  "tinyurl": {
    title: "Design TinyURL (URL Shortener)",
    subtitle: "System Design • 100M Daily Active Users • Base62 Encoding & Distributed Key-Gen",
    voiceoverText:
      "Here is how to design TinyURL at scale. With 100 Million daily active users and a 100 to 1 read-heavy ratio, we need low latency and high availability. When a user creates a short URL, the request hits a Load Balancer, passes through an API Gateway, and reaches our URL Shortening Service. We use a Key Generation Service pre-generating Base62 unique tokens to prevent hash collisions. For fast reads, we cache popular URLs in a Redis cluster with an LRU eviction policy. The primary datastore is a distributed NoSQL key-value database like DynamoDB or Cassandra, easily handling petabytes of mappings.",
    payload: {
      topic: "URL Shortener (TinyURL)",
      category: "Storage & Caching",
      scale: {
        dau: "100 Million DAU",
        readWriteRatio: "100:1 (Read-heavy)",
        qps: "115K Read QPS • 1.1K Write QPS",
        storagePerYear: "15 TB / Year",
        latencyTarget: "< 20ms Read Latency",
      },
      requirements: {
        functional: [
          "Generate unique, short alias from long URL (e.g. tinyurl.com/aB3x9Z)",
          "Redirect users instantaneously to original URL (301 Permanent Redirect)",
          "Custom short alias support & optional link expiration time",
        ],
        nonFunctional: [
          "High Availability: 99.99% uptime (read redirection must never fail)",
          "Low Latency: Real-time redirection with sub-20ms P99 latency",
          "Non-Predictable URLs: Security against enumeration attacks",
        ],
      },
      nodes: [
        {
          id: "clients",
          name: "Global Clients",
          type: "client",
          description: "Web & Mobile browsers worldwide",
          technologies: ["HTTP/3", "TLS 1.3"],
          metrics: { qps: "115K QPS" },
        },
        {
          id: "cdn",
          name: "Edge CDN & Anycast DNS",
          type: "cdn",
          description: "Geographic edge caching for hot URL redirects",
          technologies: ["Cloudflare", "AWS CloudFront"],
          metrics: { latency: "< 10ms edge" },
        },
        {
          id: "load-balancer",
          name: "Load Balancer Layer",
          type: "lb",
          description: "Layer-7 reverse proxy distributing traffic",
          technologies: ["Nginx", "AWS ALB"],
          metrics: { qps: "115K QPS" },
        },
        {
          id: "api-gateway",
          name: "API Gateway & Rate Limiter",
          type: "gateway",
          description: "Authentication, token bucket rate limiting, telemetry",
          technologies: ["Kong", "Envoy"],
          metrics: { latency: "2ms overhead" },
        },
        {
          id: "shortener-service",
          name: "URL Core Service",
          type: "service",
          description: "Stateless microservice handling encode & redirect logic",
          technologies: ["Go / Node.js", "Kubernetes"],
          metrics: { qps: "Stateless Auto-scaled" },
        },
        {
          id: "kgs",
          name: "Key Generation Service (KGS)",
          type: "service",
          description: "Pre-generates 7-character Base62 keys in memory",
          technologies: ["Zookeeper", "Raft Consensus"],
          metrics: { storage: "3.5 Trillion keys" },
        },
        {
          id: "redis-cache",
          name: "Distributed Redis Cache",
          type: "cache",
          description: "In-memory LRU cache storing top 20% hot links",
          technologies: ["Redis Cluster", "Memcached"],
          metrics: { latency: "< 2ms", storage: "170 GB RAM" },
        },
        {
          id: "primary-db",
          name: "Distributed NoSQL Key-Value Store",
          type: "database",
          description: "Partitioned by short_key hash for linear scaling",
          technologies: ["DynamoDB", "Cassandra / PostgreSQL"],
          metrics: { storage: "15 TB / Year" },
        },
      ],
      flows: [
        {
          stepIndex: 0,
          from: "clients",
          to: "cdn",
          action: "1. GET /aB3x9Z (Redirect Request)",
          protocol: "HTTPS",
          dataPacket: "{ shortKey: 'aB3x9Z' }",
          description: "Client requests redirection for short URL",
        },
        {
          stepIndex: 1,
          from: "cdn",
          to: "load-balancer",
          action: "2. CDN Cache Miss -> Route to Origin",
          protocol: "HTTPS",
          description: "Cache miss forwarded to regional Load Balancer",
        },
        {
          stepIndex: 2,
          from: "load-balancer",
          to: "api-gateway",
          action: "3. Forward to API Gateway",
          protocol: "TCP",
          description: "Load Balancer selects healthy Gateway instance",
        },
        {
          stepIndex: 3,
          from: "api-gateway",
          to: "shortener-service",
          action: "4. Dispatch to URL Core Service",
          protocol: "gRPC",
          description: "Stateless microservice receives request",
        },
        {
          stepIndex: 4,
          from: "shortener-service",
          to: "redis-cache",
          action: "5. Query In-Memory Redis Cache",
          protocol: "TCP",
          dataPacket: "GET short_key:aB3x9Z",
          description: "80% of read traffic resolved in < 2ms via Redis",
        },
        {
          stepIndex: 5,
          from: "shortener-service",
          to: "primary-db",
          action: "6. Fallback DB Query on Cache Miss",
          protocol: "gRPC",
          dataPacket: "SELECT long_url WHERE key = 'aB3x9Z'",
          description: "Fetches from DynamoDB and writes back to cache",
        },
      ],
      tradeoffs: [
        {
          decision: "Short Key Generation Strategy",
          choice: "Standalone KGS (Key Generation Service) with Base62 pre-generation",
          rationale: "Zero hash collision overhead, zero duplicate queries, instant lookup time",
          alternative: "MD5 / SHA-256 Hash + Base62 with collision retry loops",
        },
        {
          decision: "Database Engine Selection",
          choice: "NoSQL Key-Value Store (DynamoDB / Cassandra)",
          rationale: "Simple key-to-URL schema with massive horizontal partition capability and low operational complexity",
          alternative: "Relational RDBMS (PostgreSQL sharded by range)",
        },
        {
          decision: "Redirect Status Code",
          choice: "301 Permanent Redirect (or 302 for real-time click tracking)",
          rationale: "301 caches in user browser slashing server load, while 302 enables fine-grained analytics",
          alternative: "Client-side JS redirect with HTML payload",
        },
      ],
    },
  },

  "rate-limiter": {
    title: "Design Distributed Rate Limiter",
    subtitle: "System Design • 500K QPS • Token Bucket & Redis Lua Script Atomicity",
    voiceoverText:
      "Let's architect a high-throughput Distributed Rate Limiter protecting APIs from abuse and denial of service. Serving 500,000 requests per second across global clusters, we position the rate limiter at the API Gateway layer. We implement the Token Bucket algorithm, tracking available tokens per client identifier. To avoid concurrency race conditions and distributed lock contention, we execute atomic Redis Lua scripts in sub-millisecond time. If tokens remain, the request passes through; if depleted, we return HTTP 429 Too Many Requests with a Retry-After header.",
    payload: {
      topic: "Distributed Rate Limiter",
      category: "Distributed Systems",
      scale: {
        dau: "50 Million DAU",
        readWriteRatio: "1:1 (Stateful check on each request)",
        qps: "500,000 Peak QPS",
        latencyTarget: "< 2ms overhead per API call",
        storagePerYear: "32 GB RAM active state",
      },
      requirements: {
        functional: [
          "Enforce rate limit based on Client IP, User ID, or API Key",
          "Return HTTP 429 Too Many Requests with Retry-After header on threshold",
          "Support configurable tiers (e.g. Free Tier: 60 req/min, Pro: 1000 req/min)",
        ],
        nonFunctional: [
          "Ultra-Low Latency: Under 2 milliseconds overhead added to caller",
          "Fault Tolerant: If rate limiter fails, fail open to avoid service outage",
          "Distributed Accuracy: Prevent race condition double-spending across replicas",
        ],
      },
      nodes: [
        {
          id: "clients",
          name: "API Consumers",
          type: "client",
          description: "Mobile apps, web frontends, 3rd party B2B integrations",
          metrics: { qps: "500K QPS" },
        },
        {
          id: "load-balancer",
          name: "Global Traffic Director",
          type: "lb",
          description: "Geo-routed Anycast IP balancing across edge regions",
          technologies: ["Cloudflare", "AWS Route 53"],
        },
        {
          id: "api-gateway",
          name: "API Gateway with Rate Limiter Filter",
          type: "gateway",
          description: "Intercepts incoming requests and evaluates rate limit tokens",
          technologies: ["Envoy Proxy", "Kong Gateway"],
          metrics: { latency: "0.8ms filter" },
        },
        {
          id: "redis-cluster",
          name: "Distributed Redis State Cluster",
          type: "cache",
          description: "Maintains token bucket state with atomic Lua scripts",
          technologies: ["Redis 7 Cluster", "Multi-AZ Replication"],
          metrics: { qps: "500K ops/sec", latency: "< 1ms" },
        },
        {
          id: "rules-service",
          name: "Rule Engine & Tier Config",
          type: "service",
          description: "Publishes dynamic rate limit tier policies to gateways",
          technologies: ["gRPC", "Etcd / Consul"],
        },
        {
          id: "core-service",
          name: "Downstream Backend Microservices",
          type: "service",
          description: "Protected core business services (Payments, Search, Feeds)",
          technologies: ["Go", "Java Spring Boot"],
        },
        {
          id: "analytics-queue",
          name: "Audit & Telemetry Kafka Queue",
          type: "queue",
          description: "Asynchronous stream tracking throttled requests",
          technologies: ["Apache Kafka", "ClickHouse"],
          metrics: { storage: "100M events/day" },
        },
      ],
      flows: [
        {
          stepIndex: 0,
          from: "clients",
          to: "load-balancer",
          action: "1. API Call with Authorization Bearer",
          protocol: "HTTPS",
          description: "Client sends HTTP request with API Key header",
        },
        {
          stepIndex: 1,
          from: "load-balancer",
          to: "api-gateway",
          action: "2. Route to Regional Gateway Envoy",
          protocol: "TCP",
          description: "Reverse proxy routes to nearest gateway instance",
        },
        {
          stepIndex: 2,
          from: "api-gateway",
          to: "redis-cluster",
          action: "3. Execute Atomic Token Bucket Lua Script",
          protocol: "TCP",
          dataPacket: "EVALSHA token_bucket.lua apiKey 100 60",
          description: "Atomic decrement prevents distributed race conditions",
        },
        {
          stepIndex: 3,
          from: "redis-cluster",
          to: "api-gateway",
          action: "4. Returns Token Balance Status (Allowed: True / False)",
          protocol: "TCP",
          dataPacket: "{ allowed: true, remaining: 42, reset: 18 }",
          description: "Instant sub-millisecond verdict",
        },
        {
          stepIndex: 4,
          from: "api-gateway",
          to: "core-service",
          action: "5a. Token Available -> Forward to Downstream Service",
          protocol: "gRPC",
          description: "Permitted request proceeds to backend business logic",
        },
        {
          stepIndex: 5,
          from: "api-gateway",
          to: "clients",
          action: "5b. Depleted -> Return HTTP 429 Too Many Requests",
          protocol: "HTTPS",
          dataPacket: "HTTP 429 { retryAfter: 18s }",
          description: "Throttled caller receives standardized rate limit headers",
        },
      ],
      tradeoffs: [
        {
          decision: "Rate Limiting Algorithm",
          choice: "Token Bucket Algorithm with Redis Lua Scripts",
          rationale: "Permits occasional bursts, memory-efficient (2 numbers stored per user), atomic via Lua",
          alternative: "Sliding Window Log (Consumes high memory per timestamp entry)",
        },
        {
          decision: "Placement of Rate Limiter",
          choice: "Integrated API Gateway Middleware (Envoy/Kong)",
          rationale: "Rejects excessive traffic before hitting internal microservice network mesh",
          alternative: "Individual rate limiter libraries inside each backend service",
        },
        {
          decision: "Failure Mode Strategy",
          choice: "Fail-Open with Circuit Breaker",
          rationale: "A rate limiter outage should not cause a global outage of customer-facing products",
          alternative: "Fail-Closed (Drops 100% of user traffic during cache maintenance)",
        },
      ],
    },
  },

  "chat-system": {
    title: "Design WhatsApp / Discord Chat",
    subtitle: "System Design • 50M Concurrent Connections • WebSockets & Kafka Message Broker",
    voiceoverText:
      "Designing a real-time messaging platform like WhatsApp or Discord requires scaling for 50 Million concurrent active connections with sub-100 millisecond message delivery. Because HTTP polling is inefficient, clients establish persistent bidirectional WebSocket connections with a distributed Gateway tier. When a message is sent, the Chat Service persists it to a distributed NoSQL store like Cassandra, optimized for write-heavy sequential conversations. Messages are published through a Kafka event bus, while a Redis-based Presence Service tracks which gateway node holds the recipient's open socket, pushing the message instantly.",
    payload: {
      topic: "Real-Time Chat System (WhatsApp / Discord)",
      category: "Real-Time / Streaming",
      scale: {
        dau: "50 Million Concurrent Connections",
        readWriteRatio: "1:1 Real-time bidirectional streaming",
        qps: "500K Messages / Second",
        storagePerYear: "180 TB Chat History / Year",
        latencyTarget: "< 100ms End-to-End Delivery",
      },
      requirements: {
        functional: [
          "1-on-1 direct messaging and multi-user group chats",
          "Online / Offline presence indicators & typing status",
          "Message read receipts (sent, delivered, read checkmarks)",
        ],
        nonFunctional: [
          "Ultra-Low Latency: Message delivery under 100ms globally",
          "Reliability: Zero message drop guarantee, guaranteed order of delivery",
          "End-to-End Encryption support & offline message buffering",
        ],
      },
      nodes: [
        {
          id: "sender-client",
          name: "Sender (Alice)",
          type: "client",
          description: "Mobile iOS/Android app with local SQLite cache",
          metrics: { latency: "< 50ms" },
        },
        {
          id: "ws-gateway",
          name: "WebSocket Gateway Cluster",
          type: "gateway",
          description: "Maintains persistent TCP/WebSocket connections",
          technologies: ["Node.js / Netty", "Auto-scaled 50M sockets"],
          metrics: { qps: "50M sockets" },
        },
        {
          id: "chat-service",
          name: "Chat Routing Service",
          type: "service",
          description: "Message validation, ordering sequence numbers, idempotency",
          technologies: ["Go Microservices", "gRPC"],
        },
        {
          id: "presence-service",
          name: "Presence & Session Service",
          type: "cache",
          description: "Maps user IDs to active gateway servers in Redis",
          technologies: ["Redis Cluster", "Heartbeat leases"],
          metrics: { latency: "< 1ms" },
        },
        {
          id: "message-broker",
          name: "Kafka Message Broker",
          type: "queue",
          description: "Partitioned event log guaranteeing sequential delivery",
          technologies: ["Apache Kafka", "Pulsar"],
          metrics: { qps: "500K msg/sec" },
        },
        {
          id: "cassandra-db",
          name: "Distributed Message Store",
          type: "database",
          description: "LSM-tree write-optimized storage for conversation history",
          technologies: ["Apache Cassandra", "ScyllaDB"],
          metrics: { storage: "180 TB / Year" },
        },
        {
          id: "receiver-client",
          name: "Recipient (Bob)",
          type: "client",
          description: "Receives push notification or live WebSocket frame",
          metrics: { latency: "< 100ms total" },
        },
      ],
      flows: [
        {
          stepIndex: 0,
          from: "sender-client",
          to: "ws-gateway",
          action: "1. Alice sends message via persistent WebSocket",
          protocol: "WebSocket",
          dataPacket: "{ chatId: 42, msg: 'Hey Bob!' }",
          description: "Alice transmits message payload through established connection",
        },
        {
          stepIndex: 1,
          from: "ws-gateway",
          to: "chat-service",
          action: "2. Forward to Chat Routing Service",
          protocol: "gRPC",
          description: "Gateway validates session and forwards to core chat service",
        },
        {
          stepIndex: 2,
          from: "chat-service",
          to: "cassandra-db",
          action: "3. Persist Message to Cassandra Log",
          protocol: "gRPC",
          dataPacket: "INSERT (chat_id, created_at, text)",
          description: "LSM tree ensures ultra-fast sequential append with zero contention",
        },
        {
          stepIndex: 3,
          from: "chat-service",
          to: "message-broker",
          action: "4. Publish to Kafka Topic (chat_events)",
          protocol: "TCP",
          description: "Kafka partition preserves strict message chronological ordering",
        },
        {
          stepIndex: 4,
          from: "chat-service",
          to: "presence-service",
          action: "5. Lookup Bob's Active Connection Node",
          protocol: "TCP",
          dataPacket: "HGET user_sessions:bob",
          description: "Finds that Bob is connected to WebSocket Node #7",
        },
        {
          stepIndex: 5,
          from: "ws-gateway",
          to: "receiver-client",
          action: "6. Push Message Frame to Bob's Device",
          protocol: "WebSocket",
          dataPacket: "{ from: 'Alice', msg: 'Hey Bob!' }",
          description: "Bob's active socket delivers the message in real time (< 80ms)",
        },
      ],
      tradeoffs: [
        {
          decision: "Communication Protocol",
          choice: "Bidirectional WebSockets with Heartbeats",
          rationale: "Lowest latency with minimal TCP handshake overhead compared to HTTP Long-Polling",
          alternative: "HTTP Long-Polling or Server-Sent Events (SSE)",
        },
        {
          decision: "Storage Engine for Chat History",
          choice: "Wide-Column Distributed NoSQL (Cassandra / ScyllaDB)",
          rationale: "Optimized for continuous append-only write streams and fast range scans on (chat_id, created_at)",
          alternative: "Relational SQL (Requires complex sharding and joins across billions of rows)",
        },
        {
          decision: "Offline Message Handling",
          choice: "APNs / FCM Push Notification + Offline Sync Queue",
          rationale: "Mobile OS terminates idle background sockets; wakes device on demand",
          alternative: "Holding background sockets indefinitely (drains client battery)",
        },
      ],
    },
  },
};

export function getSystemDesignPresets(): Array<{
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  props: AlgoMotionProps;
}> {
  return Object.entries(SYSTEM_DESIGN_BLUEPRINTS).map(([slug, item]) => ({
    slug,
    title: item.title,
    subtitle: item.subtitle,
    category: item.payload.category || "Distributed Systems",
    props: {
      platform: "youtube",
      templateType: "system-design",
      title: item.title,
      subtitle: item.subtitle,
      voiceoverText: item.voiceoverText,
      systemDesignPayload: item.payload,
      branding: {
        name: process.env.BRANDING_NAME || "RSquare",
        tag: process.env.BRANDING_TAG || "R²",
        handle: `@${(process.env.BRANDING_NAME || "RSquare").toLowerCase()}`,
      },
      theme: "light",
      bgMusic: true,
    },
  }));
}

export function synthesizeSystemDesignBlueprint(
  topic: string,
  userDescription?: string,
): { title: string; subtitle: string; voiceoverText: string; payload: SystemDesignPayload } {
  const normalized = topic.toLowerCase();
  for (const [key, bp] of Object.entries(SYSTEM_DESIGN_BLUEPRINTS)) {
    if (normalized.includes(key) || normalized.includes(bp.payload.topic.toLowerCase())) {
      return bp;
    }
  }

  // Intelligent fallback blueprint for arbitrary custom system design problems
  return {
    title: `Design ${topic}`,
    subtitle: `System Design Architecture • High Scale Distributed Blueprint`,
    voiceoverText: `Let's break down the system architecture for ${topic}. To handle massive scale with high availability, we partition our system into stateless microservices fronted by a reverse-proxy Load Balancer and API Gateway. We separate read and write paths with an in-memory Redis caching layer and an asynchronous message queue. This architecture guarantees low latency, fault tolerance, and seamless horizontal elasticity under heavy traffic.`,
    payload: {
      topic: topic,
      category: "Distributed Systems",
      scale: {
        dau: "25 Million DAU",
        readWriteRatio: "80:20 Read-heavy",
        qps: "50,000 QPS Peak",
        storagePerYear: "50 TB / Year",
        latencyTarget: "< 30ms P99 SLA",
      },
      requirements: {
        functional: [
          `Core business operations for ${topic}`,
          "High-throughput transactional and analytical queries",
          "Real-time event notification and status telemetry",
        ],
        nonFunctional: [
          "99.99% High Availability with multi-region failover",
          "Sub-30ms P99 Latency under peak load spikes",
          "Horizontal scalability with zero single points of failure",
        ],
      },
      nodes: [
        {
          id: "clients",
          name: "Client Applications",
          type: "client",
          description: "Mobile & Web clients accessing API endpoints",
          technologies: ["HTTPS", "gRPC"],
          metrics: { qps: "50K QPS" },
        },
        {
          id: "cdn",
          name: "Global Edge CDN",
          type: "cdn",
          description: "Static content delivery and TLS termination",
          technologies: ["Cloudflare", "Fastly"],
        },
        {
          id: "load-balancer",
          name: "Load Balancer",
          type: "lb",
          description: "Evenly distributes traffic across application gateways",
          technologies: ["AWS ALB", "Nginx"],
        },
        {
          id: "api-gateway",
          name: "API Gateway",
          type: "gateway",
          description: "Authentication, rate limiting, and request routing",
          technologies: ["Envoy", "Kong"],
          metrics: { latency: "< 2ms" },
        },
        {
          id: "app-service",
          name: "Core Application Service",
          type: "service",
          description: `Stateless business logic processing for ${topic}`,
          technologies: ["Go / Java / Python", "Kubernetes"],
        },
        {
          id: "cache-layer",
          name: "Distributed Redis Cache",
          type: "cache",
          description: "In-memory cache for hot reads and session state",
          technologies: ["Redis Cluster", "Memcached"],
          metrics: { latency: "< 1ms" },
        },
        {
          id: "message-queue",
          name: "Event Bus & Message Queue",
          type: "queue",
          description: "Asynchronous task processing and event streaming",
          technologies: ["Apache Kafka", "RabbitMQ"],
          metrics: { qps: "Async 100K/s" },
        },
        {
          id: "primary-database",
          name: "Distributed Primary Database",
          type: "database",
          description: "Persistent source-of-truth datastore",
          technologies: ["PostgreSQL / DynamoDB", "Sharded"],
          metrics: { storage: "50 TB / Year" },
        },
      ],
      flows: [
        {
          stepIndex: 0,
          from: "clients",
          to: "load-balancer",
          action: `1. Inbound Request for ${topic}`,
          protocol: "HTTPS",
          description: "Client sends HTTPS request to public endpoint",
        },
        {
          stepIndex: 1,
          from: "load-balancer",
          to: "api-gateway",
          action: "2. Forward to API Gateway",
          protocol: "TCP",
          description: "Load Balancer health checks and forwards request",
        },
        {
          stepIndex: 2,
          from: "api-gateway",
          to: "app-service",
          action: "3. Route to Core Microservice",
          protocol: "gRPC",
          description: "Gateway validates credentials and dispatches call",
        },
        {
          stepIndex: 3,
          from: "app-service",
          to: "cache-layer",
          action: "4. Check In-Memory Cache",
          protocol: "TCP",
          description: "Checks Redis for cached response to avoid DB load",
        },
        {
          stepIndex: 4,
          from: "app-service",
          to: "primary-database",
          action: "5. Query / Update Primary Database",
          protocol: "gRPC",
          description: "Executes transactional operation on primary datastore",
        },
        {
          stepIndex: 5,
          from: "app-service",
          to: "message-queue",
          action: "6. Publish Asynchronous Event",
          protocol: "TCP",
          description: "Emits event to Kafka for downstream consumers",
        },
      ],
      tradeoffs: [
        {
          decision: "Database Consistency Model",
          choice: "Eventual Consistency for Reads, Strong Consistency for Writes",
          rationale: "Maximizes throughput and read availability across distributed regions",
          alternative: "Strict 2-Phase Commit (Suffers severe latency bottlenecks)",
        },
        {
          decision: "Microservice Communication Paradigm",
          choice: "Synchronous gRPC for client path, Asynchronous Kafka for background tasks",
          rationale: "Keeps client-facing endpoints responsive while offloading heavy work",
          alternative: "Pure synchronous HTTP calls chaining between all internal services",
        },
        {
          decision: "Caching Strategy",
          choice: "Cache-Aside with TTL & Event-Driven Invalidation",
          rationale: "Protects cache from unbounded growth while ensuring freshness",
          alternative: "Write-Through Cache (Increases write latency)",
        },
      ],
    },
  };
}
