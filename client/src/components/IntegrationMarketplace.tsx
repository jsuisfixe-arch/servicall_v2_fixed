import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailConfigCard } from "./EmailConfigCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Zap,
  Phone,
  Bell,
  Monitor,
  Clock,
  XCircle,
  PlayCircle,
  PhoneCall,
  PhoneForwarded
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
  },
  {
    id: "callbacks",
    name: "Rappels IA",
    description: "Configurez les rappels automatiques quand l'IA transfère ou planifie un rappel client.",
    category: "Communication",
    icon: PhoneForwarded,
    status: "connected",
    color: "text-violet-500 bg-violet-500/10",
  },
  {
    id: "smart-prompting",
    name: "Smart-Prompting",
    description: "Bibliothèque de prompts certifiés par métier pour une IA experte dès le premier appel.",
    category: "API",
    icon: Zap,
    status: "connected",
    color: "text-yellow-500 bg-yellow-500/10",
  },
  {
    id: "ai-audit",
    name: "Audit Performance IA",
    description: "Analyse hebdomadaire des transcriptions pour identifier les points de friction business.",
    category: "API",
    icon: Monitor,
    status: "connected",
    color: "text-indigo-500 bg-indigo-500/10",
  },
  {
    id: "web-widget",
    name: "Widget Omnicanal",
    description: "Widget flottant pour capturer appels, WhatsApp et messages vocaux sur votre site.",
    category: "Web",
    icon: MessageSquare,
    status: "connected",
    color: "text-pink-500 bg-pink-500/10",
  },
  {
    id: "white-label",
    name: "Mode Marque Blanche",
    description: "Personnalisez logo, couleurs et nom de l'application pour vos propres clients.",
    category: "Web",
    icon: Settings2,
    status: "connected",
    color: "text-slate-500 bg-slate-500/10",
  },
];

export function IntegrationMarketplace({ onConfigurePOS }: { onConfigurePOS?: () => void }) {
  const [_filter, _setFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("apps");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<IntegrationApp | null>(null);
  const [apiKey, setApiKey] = useState("");

  // ── État rappels ─────────────────────────────────────────────────────────────
  const [callbackConfig, setCallbackConfig] = useState({
    callbackPhone: "",
    callbackNotifyMode: "crm" as "crm" | "phone" | "both",
    isAvailableForTransfer: true,
  });
  const [callbackConfigLoading, setCallbackConfigLoading] = useState(false);
  const [callbackConfigSaving, setCallbackConfigSaving] = useState(false);
  const [pendingCallbacks, setPendingCallbacks] = useState<any[]>([]);
  const [callbacksLoading, setCallbacksLoading] = useState(false);
  const [executingId, setExecutingId] = useState<number | null>(null);

  // Charger config rappels quand l'onglet rappels est ouvert
  useEffect(() => {
    if (activeTab === "callbacks") {
      loadCallbackConfig();
      loadCallbacks();
    }
  }, [activeTab]);

  async function loadCallbackConfig() {
    setCallbackConfigLoading(true);
    try {
      const res = await fetch("/api/callbacks/config", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCallbackConfig({
          callbackPhone: data.data?.callbackPhone ?? "",
          callbackNotifyMode: data.data?.callbackNotifyMode ?? "crm",
          isAvailableForTransfer: data.data?.isAvailableForTransfer ?? true,
        });
      }
    } catch { /* silencieux */ }
    finally { setCallbackConfigLoading(false); }
  }

  async function loadCallbacks() {
    setCallbacksLoading(true);
    try {
      const res = await fetch("/api/callbacks?limit=15", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPendingCallbacks(data.data ?? []);
      }
    } catch { /* silencieux */ }
    finally { setCallbacksLoading(false); }
  }

  async function saveCallbackConfig() {
    setCallbackConfigSaving(true);
    try {
      const res = await fetch("/api/callbacks/config", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(callbackConfig),
      });
      if (res.ok) {
        toast.success("Configuration rappels sauvegardée ✅");
      } else {
        const err = await res.json();
        toast.error(err.error ?? "Erreur de sauvegarde");
      }
    } catch { toast.error("Erreur réseau"); }
    finally { setCallbackConfigSaving(false); }
  }

  async function executeCallbackNow(id: number) {
    setExecutingId(id);
    try {
      const res = await fetch(`/api/callbacks/${id}/execute`, {
        method: "POST", credentials: "include",
      });
      if (res.ok) {
        toast.success("Rappel déclenché ✅");
        loadCallbacks();
      } else {
        const err = await res.json();
        toast.error(err.error ?? "Erreur");
      }
    } catch { toast.error("Erreur réseau"); }
    finally { setExecutingId(null); }
  }

  async function completeCallbackItem(id: number) {
    try {
      await fetch(`/api/callbacks/${id}/complete`, { method: "PUT", credentials: "include" });
      toast.success("Marqué comme effectué");
      loadCallbacks();
    } catch { toast.error("Erreur"); }
  }

  async function cancelCallbackItem(id: number) {
    if (!confirm("Annuler ce rappel ?")) return;
    try {
      await fetch(`/api/callbacks/${id}/cancel`, { method: "PUT", credentials: "include" });
      toast.success("Rappel annulé");
      loadCallbacks();
    } catch { toast.error("Erreur"); }
  }

  const TRIGGER_LABELS: Record<string, string> = {
    no_info: "IA sans réponse",
    caller_request: "Demande appelant",
    sentiment_low: "Sentiment négatif",
    manual: "Manuel",
  };

  const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
    pending:   { label: "En attente",  cls: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    notified:  { label: "Notifié",     cls: "bg-blue-100 text-blue-800 border-blue-200" },
    called:    { label: "Appelé",      cls: "bg-purple-100 text-purple-800 border-purple-200" },
    completed: { label: "Terminé",     cls: "bg-green-100 text-green-800 border-green-200" },
    failed:    { label: "Échoué",      cls: "bg-red-100 text-red-800 border-red-200" },
    cancelled: { label: "Annulé",      cls: "bg-gray-100 text-gray-600 border-gray-200" },
  };

  const handleAction = (app: IntegrationApp) => {
    if (app.id === "pos" && onConfigurePOS) {
      onConfigurePOS();
    } else if (app.id === "callbacks") {
      setActiveTab("callbacks");
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
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl border border-border">
          <TabsTrigger value="apps" className="gap-2 rounded-lg">
            <ShoppingCart className="w-4 h-4" />
            <span>Apps & Extensions</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2 rounded-lg">
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </TabsTrigger>
          <TabsTrigger value="callbacks" className="gap-2 rounded-lg relative">
            <PhoneForwarded className="w-4 h-4" />
            <span>Rappels IA</span>
            {pendingCallbacks.filter(c => c.status === "pending" || c.status === "notified").length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {pendingCallbacks.filter(c => c.status === "pending" || c.status === "notified").length}
              </span>
            )}
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

        {/* ── Onglet Rappels IA ───────────────────────────────────────────── */}
        <TabsContent value="callbacks" className="space-y-4 pt-4">
          {/* Bandeau intro */}
          <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <PhoneForwarded className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Rappels intelligents</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Quand l'IA ne peut pas répondre ou qu'un humain est demandé, un rappel automatique
                est planifié. Configurez comment vous souhaitez être notifié.
              </p>
            </div>
          </div>

          {/* Config notification */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                Mes préférences de rappel
              </CardTitle>
              <CardDescription>
                Choisissez comment recevoir les notifications de rappels clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {callbackConfigLoading ? (
                <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
                  Chargement...
                </div>
              ) : (
                <>
                  {/* Disponibilité pour transfert */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        callbackConfig.isAvailableForTransfer ? "bg-green-500" : "bg-gray-400"
                      )} />
                      <div>
                        <p className="text-sm font-medium">Disponible pour transfert</p>
                        <p className="text-xs text-muted-foreground">
                          {callbackConfig.isAvailableForTransfer
                            ? "L'IA peut vous transférer des appels en direct"
                            : "Les appels seront planifiés en rappel automatiquement"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={callbackConfig.isAvailableForTransfer}
                      onCheckedChange={(v) =>
                        setCallbackConfig((c) => ({ ...c, isAvailableForTransfer: v }))
                      }
                    />
                  </div>

                  {/* Mode de notification */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Mode de notification</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "crm",   icon: Monitor,    label: "CRM uniquement",    desc: "Notification dans l'interface" },
                        { value: "phone", icon: Phone,      label: "Téléphone",          desc: "Appel sur votre numéro" },
                        { value: "both",  icon: Bell,       label: "Les deux",           desc: "CRM + appel téléphonique" },
                      ].map(({ value, icon: Icon, label, desc }) => (
                        <div
                          key={value}
                          onClick={() =>
                            setCallbackConfig((c) => ({ ...c, callbackNotifyMode: value as any }))
                          }
                          className={cn(
                            "p-3 rounded-xl border-2 cursor-pointer transition-all text-center",
                            callbackConfig.callbackNotifyMode === value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40"
                          )}
                        >
                          <Icon className={cn(
                            "w-5 h-5 mx-auto mb-1",
                            callbackConfig.callbackNotifyMode === value ? "text-primary" : "text-muted-foreground"
                          )} />
                          <p className="text-xs font-semibold">{label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Numéro de téléphone — affiché seulement si mode phone ou both */}
                  {(callbackConfig.callbackNotifyMode === "phone" || callbackConfig.callbackNotifyMode === "both") && (
                    <div className="space-y-2">
                      <Label htmlFor="callback-phone" className="text-sm font-medium flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                        Votre numéro de rappel
                      </Label>
                      <Input
                        id="callback-phone"
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                        value={callbackConfig.callbackPhone ?? ""}
                        onChange={(e) =>
                          setCallbackConfig((c) => ({ ...c, callbackPhone: e.target.value }))
                        }
                        className="bg-muted/30 border-border"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Twilio vous appellera sur ce numéro avec le contexte du prospect à rappeler.
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={saveCallbackConfig}
                    disabled={callbackConfigSaving}
                    className="w-full gap-2"
                  >
                    {callbackConfigSaving ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Enregistrer la configuration
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Liste des rappels planifiés */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Rappels planifiés
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadCallbacks}
                  className="text-xs"
                >
                  Actualiser
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {callbacksLoading ? (
                <div className="h-16 flex items-center justify-center text-muted-foreground text-sm">
                  Chargement...
                </div>
              ) : pendingCallbacks.length === 0 ? (
                <div className="py-8 text-center">
                  <PhoneCall className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Aucun rappel en cours</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Les rappels planifiés par l'IA apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingCallbacks.map((cb) => {
                    const statusStyle = STATUS_STYLES[cb.status] ?? STATUS_STYLES.pending;
                    const canAct = cb.status === "pending" || cb.status === "notified";
                    const scheduledDate = new Date(cb.scheduledAt);
                    const isOverdue = scheduledDate < new Date() && canAct;

                    return (
                      <div
                        key={cb.id}
                        className={cn(
                          "p-3 rounded-xl border transition-all",
                          isOverdue ? "border-red-200 bg-red-50/50" : "border-border bg-muted/10"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm truncate">
                                {cb.prospectName ?? cb.prospectPhone}
                              </span>
                              <span className={cn(
                                "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium",
                                statusStyle.cls
                              )}>
                                {statusStyle.label}
                              </span>
                              {isOverdue && (
                                <span className="text-[10px] text-red-600 font-semibold">⚠ En retard</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {cb.prospectPhone} · {TRIGGER_LABELS[cb.triggerReason] ?? cb.triggerReason}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {scheduledDate.toLocaleDateString("fr-FR", {
                                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                              })}
                            </p>
                            {cb.conversationSummary && (
                              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1 italic">
                                "{cb.conversationSummary.slice(0, 80)}..."
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          {canAct && (
                            <div className="flex flex-col gap-1 shrink-0">
                              <Button
                                size="sm"
                                variant="default"
                                className="h-7 text-xs gap-1 px-2"
                                onClick={() => executeCallbackNow(cb.id)}
                                disabled={executingId === cb.id}
                              >
                                {executingId === cb.id ? (
                                  <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <PlayCircle className="w-3 h-3" />
                                )}
                                Rappeler
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 px-2"
                                onClick={() => completeCallbackItem(cb.id)}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Fait
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs gap-1 px-2 text-muted-foreground hover:text-red-600"
                                onClick={() => cancelCallbackItem(cb.id)}
                              >
                                <XCircle className="w-3 h-3" />
                                Annuler
                              </Button>
                            </div>
                          )}
                          {cb.status === "completed" && (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
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
