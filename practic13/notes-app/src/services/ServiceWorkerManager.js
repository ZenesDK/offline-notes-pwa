export class ServiceWorkerManager {
  constructor(swUrl = "/sw.js") {
    this.swUrl = swUrl;
    this.registration = null;
  }

  async register() {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker not supported");
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register(this.swUrl);
      this.registration = registration;
      console.log("SW registered:", registration.scope);
      
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            console.log("New SW available, reload to update");
          }
        });
      });
      
      return true;
    } catch (error) {
      console.error("SW registration failed:", error);
      return false;
    }
  }

  async unregister() {
    if (!this.registration) return false;
    const result = await this.registration.unregister();
    if (result) console.log("SW unregistered");
    return result;
  }
}