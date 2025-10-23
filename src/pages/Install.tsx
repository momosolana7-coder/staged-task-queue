import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <Smartphone className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl">Install GIGACOCK</CardTitle>
              <CardDescription className="text-base">
                Get the best experience with our mobile app
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isInstalled ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                    <Check className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Already Installed!</h3>
                  <p className="text-muted-foreground mb-6">
                    You're using GIGACOCK as an installed app
                  </p>
                  <Link to="/">
                    <Button>Go to Home</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Offline Access</h4>
                        <p className="text-sm text-muted-foreground">
                          Access token data even without internet connection
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Home Screen Icon</h4>
                        <p className="text-sm text-muted-foreground">
                          Quick access directly from your phone's home screen
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Faster Loading</h4>
                        <p className="text-sm text-muted-foreground">
                          Optimized performance with cached resources
                        </p>
                      </div>
                    </div>
                  </div>

                  {isInstallable ? (
                    <Button 
                      onClick={handleInstallClick}
                      className="w-full"
                      size="lg"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Install App
                    </Button>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        To install this app on your device:
                      </p>
                      <div className="text-left space-y-2 bg-secondary/50 p-4 rounded-lg">
                        <p className="text-sm">
                          <strong>iPhone/iPad:</strong> Tap the Share button <span className="inline-block">📤</span> and select "Add to Home Screen"
                        </p>
                        <p className="text-sm">
                          <strong>Android:</strong> Tap the menu (⋮) and select "Install app" or "Add to Home screen"
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Install;
