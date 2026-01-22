self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

const STATUS_CACHE = "nudge-status";

const readStatus = async () => {
  const cache = await caches.open(STATUS_CACHE);
  const response = await cache.match("/nudge-status");
  if (!response) return { completed: false, date: null };
  try {
    return await response.json();
  } catch (error) {
    return { completed: false, date: null };
  }
};

const notifyIfNeeded = async () => {
  const status = await readStatus();
  const todayKey = new Date().toISOString().slice(0, 10);
  if (status.completed && status.date === todayKey) return;
  await self.registration.showNotification("Priesthood Path", {
    body: "Your daily mission is waiting. Take 2 minutes to record your thoughts and strengthen your service.",
    icon: "/assets/week1-badge.png",
    data: { url: "/?page=dashboard" }
  });
};

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(event.notification.data?.url || "/");
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(event.notification.data?.url || "/");
      }
      return undefined;
    })
  );
});

self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "NUDGE_STATUS") return;
  const { completed, date } = event.data.payload || {};
  event.waitUntil(
    caches.open(STATUS_CACHE).then((cache) =>
      cache.put(
        "/nudge-status",
        new Response(JSON.stringify({ completed: !!completed, date }), {
          headers: { "Content-Type": "application/json" }
        })
      )
    )
  );
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "daily-nudge") {
    event.waitUntil(notifyIfNeeded());
  }
});

self.addEventListener("sync", (event) => {
  if (event.tag === "daily-nudge") {
    event.waitUntil(notifyIfNeeded());
  }
});
