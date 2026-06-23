import { useEffect, useState } from "react";
import { Download, MonitorSmartphone, Smartphone } from "lucide-react";
import { PageHeader, OSButton } from "@/os/components/ui";
import ikambaIcon from "@/assets/ikamba-icon.png";

const AppDownload = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <div>
      <PageHeader title="Download the App" subtitle="Install iKAMBA Media OS on Android, iPhone, iPad, Mac, or Windows." />
      <section className="os-card rounded-xl p-6 sm:p-8 max-w-3xl">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
          <div className="h-16 w-16 rounded-2xl bg-os-navy-deep flex items-center justify-center shrink-0 border border-os-gold/30">
            <img src={ikambaIcon} alt="iKAMBA" className="h-10 w-10 object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-white text-xl font-bold">Install iKAMBA on this device</h2>
            <p className="text-os-muted text-sm mt-1">Open faster, use the platform full-screen, and keep it on your home screen or desktop.</p>
          </div>
          <OSButton variant="primary" onClick={install} disabled={!installPrompt || installed} className="w-full sm:w-auto justify-center">
            <Download size={16} /> {installed ? "Installed" : installPrompt ? "Download App" : "Use Browser Install"}
          </OSButton>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-4 mt-5 max-w-3xl">
        <section className="os-card-2 rounded-xl p-5">
          <Smartphone className="text-os-gold mb-3" size={24} />
          <h3 className="text-white font-bold mb-2">Android</h3>
          <p className="text-sm text-os-muted">Tap Download App, or use Chrome menu → Add to Home screen.</p>
        </section>
        <section className="os-card-2 rounded-xl p-5">
          <Smartphone className="text-os-gold mb-3" size={24} />
          <h3 className="text-white font-bold mb-2">iPhone / iPad</h3>
          <p className="text-sm text-os-muted">Open in Safari, tap Share, then Add to Home Screen.</p>
        </section>
      </div>
    </div>
  );
};

export default AppDownload;