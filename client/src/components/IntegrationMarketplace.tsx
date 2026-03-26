import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailConfigCard } from "./EmailConfigCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  ShoppingCart, 
  Globe, 
  Cloud, 
  MessageSquare, 
  Calendar, 
  ExternalLink, 
  Settings2,
  CheckCircle2,
  Plus,
  Mail,
  Key,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface IntegrationApp {
  id: string;
  name: string;
  description: string;
  category: "Caisse" | "Stockage" | "Web" | "Communication" | "API";
  icon: React.ComponentType<{ className?: string }>;
  status: "connected" | "disconnected" | "coming_soon";
  color: string;
}

const APPS: IntegrationApp[] = [
  {
    id: "pos",
    name: "Caisse Enregistreuse",
    description: "Synchronisez vos commandes IA avec Lightspeed, SumUp ou Square.",
    category: "Caisse",
    icon: ShoppingCart,
    status: "connected",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    id: "drive",
    name: "Google Drive",
    description: "Sauvegardez vos rapports et réservations sur Google Sheets.",
    category: "Stockage",
    icon: Cloud,
    status: "disconnected",
    color: "text-green-500 bg-green-500/10",
  },
  {
    id: "website",
    name: "API Site Web",
    description: "Connectez votre site WordPress ou Shopify via Webhooks.",
    category: "Web",
    icon: Globe,
    status: "disconnected",
    color: "text-purple-500 bg-purple-500/10",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Envoyez des confirmations de commande par message.",
    category: "Communication",
    icon: MessageSquare,
    status: "connected",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    description: "Synchronisation bidirectionnelle des rendez-vous.",
    category: "Communication",
    icon: Calendar,
    status: "disconnected",
    color: "text-red-500 bg-red-500/10",
  },
  {
    id: "custom-api",
    name: "API Personnalisée",
    description: "Ajoutez vos propres endpoints API pour une intégration sur mesure.",
    category: "API",
    icon: Key,
    status: "disconnected",
    color: "text-orange-500 bg-orange-500/10",
  }
];

export function IntegrationMarketplace({ onConfigurePOS }: { onConfigurePOS?: () => void }) {
  const [_filter, _setFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("apps");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<IntegrationApp | null>(null);
  const [apiKey, setApiKey] = useState("");

  const handleAction = (app: IntegrationApp) => {
    if (app.id === "pos" && onConfigurePOS) {
      onConfigurePOS();
    } else {
      setSelectedApp(app);
      setIsConfigOpen(true);
    }
  };

  const handleSaveConfig = () => {
    toast.success(`Configuration pour ${selectedApp?.name} enregistrée avec succès !`);
    setIsConfigOpen(false);
    setApiKey("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">App Marketplace</h2>
          <p className="text-muted-foreground">Connectez vos outils préférés en quelques secondes.</p>
        </div>
        <Button className="gap-2" onClick={() => toast.success("Merci pour votre suggestion !")}>
          <Plus className="w-4 h-4" />
          Suggérer une App
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl border border-border">
          <TabsTrigger value="apps" className="gap-2 rounded-lg">
            <ShoppingCart className="w-4 h-4" />
            <span>Apps & Extensions</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2 rounded-lg">
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="apps" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {APPS.map((app) => (
              <Card key={app.id} className={cn(
                "relative overflow-hidden transition-all hover:shadow-md border-border/50",
                app.status === "coming_soon" && "opacity-70 grayscale-[0.5]"
              )}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className={cn("p-2 rounded-lg", app.color)}>
                      <app.icon className="w-6 h-6" />
                    </div>
                    <Badge variant={
                      app.status === "connected" ? "default" : 
                      app.status === "coming_soon" ? "secondary" : "outline"
                    }>
                      {app.status === "connected" ? "Connecté" : 
                       app.status === "coming_soon" ? "Bientôt" : "Disponible"}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4 text-lg">{app.name}</CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[40px]">
                    {app.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{app.category}</span>
                    {app.status === "connected" && (
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Actif
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t bg-muted/5">
                  <div className="flex w-full gap-2">
                    <Button 
                      variant={app.status === "connected" ? "outline" : "default"} 
                      className="flex-1 gap-2"
                      onClick={() => handleAction(app)}
                    >
                      <Settings2 className="w-4 h-4" />
                      {app.status === "connected" ? "Configurer" : "Installer"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => toast.info(`Ouverture de la documentation ${app.name}`)}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4 pt-4">
          <EmailConfigCard />
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              Configuration {selectedApp?.name}
            </DialogTitle>
            <DialogDescription>
              Entrez vos identifiants pour activer l'intégration {selectedApp?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="api-key">Clé API / Token</Label>
              <Input 
                id="api-key" 
                type="password" 
                placeholder="Entrez votre clé..." 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            {selectedApp?.id === "whatsapp" && (
              <div className="grid gap-2">
                <Label htmlFor="phone-id">ID du numéro de téléphone</Label>
                <Input id="phone-id" placeholder="Ex: 105943..." />
              </div>
            )}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-blue-600">
              <Zap className="w-4 h-4 shrink-0" />
              <span>Cette intégration utilise des webhooks pour une synchronisation en temps réel.</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveConfig}>Activer l'intégration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
