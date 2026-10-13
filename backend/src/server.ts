import "./config/env";
import { createApp } from "./app";
import { prisma } from "./config/prisma";

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");

    const app = createApp();
    const port = parseInt(process.env.PORT || "3000", 10);

    const server = app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("Server closed");
        prisma.$disconnect();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Server error:", error);
    process.exit(1);
  }
}

startServer();