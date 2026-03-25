/**
 * LEAD EXTRACTION PAGE
 * ─────────────────────────────────────────────────────────────
 * Interface complète pour extraire des leads depuis :
 *  - OpenStreetMap (gratuit, aucune clé)
 *  - Google Maps Places API (BYOK)
 *  - Pages Jaunes API (BYOK)
 *
 * Fonctionnalités :
 *  - Recherche par mot-clé + localisation
 *  - Sélection multiple des résultats
 *  - Import direct dans le CRM (prospects)
 *  - Historique des extractions
 *  - Configuration des clés API (BYOK)
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, MapPin, Star, Phone, Globe, Building2, Download,
  CheckCircle2, XCircle, Loader2, Settings, Key, History,
  Zap, AlertCircle, Map, RefreshCw, ChevronRight,
  Eye, Import,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Business {
  _source: "osm" | "google" | "pagesjaunes";
  _externalId: string;
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  phone?: string;
  website?: string;
  email?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  lat?: number;
  lng?: number;
  openingHours?: string[];
  description?: string;
}

// ──────────────────────────────────────────────
// Provider badge
// ──────────────────────────────────────────────

const PROVIDER_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  osm:         { label: "OpenStreetMap",  color: "bg-green-100 text-green-700 border-green-200",  icon: "🗺️" },
  google:      { label: "Google Maps",    color: "bg-blue-100 text-blue-700 border-blue-200",     icon: "🔵" },
  pagesjaunes: { label: "Pages Jaunes",   color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "📒" },
};

function ProviderBadge({ provider }: { provider: string }) {
  const p = PROVIDER_LABELS[provider] ?? { label: provider, color: "bg-slate-100 text-slate-600", icon: "🔍" };
  return (
    <Badge variant="outline" className={cn("text-[10px] h-5 gap-1", p.color)}>
      <span>{p.icon}</span>{p.label}
    </Badge>
  );
}

// ──────────────────────────────────────────────
// BYOK Settings Panel
// ──────────────────────────────────────────────

function BYOKSettings() {
  const [googleKey, setGoogleKey] = useState("");
  const [pjKey, setPjKey] = useState("");
  const utils = trpc.useUtils();

  const { data: config } = trpc.leadExtraction.getApiKeys.useQuery();
  const saveMutation = trpc.leadExtraction.saveApiKeys.useMutation({
    onSuccess: () => {
      toast.success("Clés API sauvegardées");
      utils.leadExtraction.getApiKeys.invalidate();
      setGoogleKey(""); setPjKey("");
    },
  });
  const testMutation = trpc.leadExtraction.testApiKey.useMutation();

  const [provider, setProvider] = useState<"osm" | "google" | "pagesjaunes">("osm");

  return (
    <div className="space-y-6 p-1" data-main-content>

      {/* Provider par défaut */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Map size={15} className="text-green-500" />
            Fournisseur de données par défaut
          </CardTitle>
          <CardDescription className="text-xs">
            OpenStreetMap est 100% gratuit et ne nécessite aucune clé API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "osm",         icon: "🗺️", label: "OpenStreetMap", desc: "Gratuit, aucune clé", badge: "GRATUIT" },
              { id: "google",      icon: "🔵", label: "Google Maps",   desc: "BYOK — votre clé",   badge: "BYOK" },
              { id: "pagesjaunes", icon: "📒", label: "Pages Jaunes",  desc: "BYOK — votre clé",   badge: "BYOK" },
            ].map((p) => (
              <button key={p.id} onClick={() => setProvider(p.id as typeof provider)}
                className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all",
                  provider === p.id ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-slate-300")}>
                <span className="text-2xl">{p.icon}</span>
                <span className="text-xs font-bold">{p.label}</span>
                <span className="text-[10px] text-slate-500">{p.desc}</span>
                <Badge className={cn("text-[9px] h-4",
                  p.badge === "GRATUIT" ? "bg-green-500" : "bg-amber-500")}>
                  {p.badge}
                </Badge>
              </button>
            ))}
          </div>

          <Button size="sm" className="w-full"
            onClick={() => saveMutation.mutate({ defaultProvider: provider })}
            disabled={saveMutation.isPending}>
            Enregistrer le fournisseur par défaut
          </Button>
        </CardContent>
      </Card>

      {/* Google Maps BYOK */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <span>🔵</span> Google Maps Places API
            {config?.hasGoogleKey && <CheckCircle2 size={13} className="text-green-500" />}
          </CardTitle>
          <CardDescription className="text-xs">
            Obtenez une clé sur{" "}
            <a href="https://console.cloud.google.com/apis/library/places-backend.googleapis.com"
              target="_blank" rel="noopener noreferrer" className="text-violet-500 underline">
              Google Cloud Console
            </a>{" "}
            — API Places activée requise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {config?.hasGoogleKey && (
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg p-2">
              <CheckCircle2 size={12} />
              <span>Clé configurée : {config.googleKeyMasked}</span>
            </div>
          )}
          <div className="flex gap-2">
            <Input type="password" placeholder="AIzaSy..." value={googleKey}
              onChange={(e) => setGoogleKey(e.target.value)}
              className="h-8 text-xs font-mono flex-1" />
            <Button size="sm" variant="outline" className="h-8 text-xs"
              disabled={!googleKey || testMutation.isPending}
              onClick={() => testMutation.mutate({ provider: "google", apiKey: googleKey })}>
              {testMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : "Tester"}
            </Button>
          </div>

          {testMutation.isSuccess && testMutation.variables?.provider === "google" && (
            <div className={cn("flex items-center gap-1.5 text-xs p-2 rounded-lg",
              testMutation.data.success ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
              {testMutation.data.success ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
              {testMutation.data.message}
            </div>
          )}

          <Button size="sm" className="w-full" disabled={!googleKey || saveMutation.isPending}
            onClick={() => saveMutation.mutate({ googleMapsApiKey: googleKey, defaultProvider: "google" })}>
            Sauvegarder la clé Google Maps
          </Button>
        </CardContent>
      </Card>

      {/* Pages Jaunes BYOK */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <span>📒</span> Pages Jaunes API
            {config?.hasPagesJaunesKey && <CheckCircle2 size={13} className="text-green-500" />}
          </CardTitle>
          <CardDescription className="text-xs">
            API Pro disponible sur{" "}
            <a href="https://developer.pagesjaunes.fr/" target="_blank" rel="noopener noreferrer"
              className="text-violet-500 underline">
              developer.pagesjaunes.fr
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {config?.hasPagesJaunesKey && (
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg p-2">
              <CheckCircle2 size={12} />
              <span>Clé configurée : {config.pagesJaunesKeyMasked}</span>
            </div>
          )}
          <div className="flex gap-2">
            <Input type="password" placeholder="Votre clé API Pages Jaunes..." value={pjKey}
              onChange={(e) => setPjKey(e.target.value)}
              className="h-8 text-xs font-mono flex-1" />
            <Button size="sm" variant="outline" className="h-8 text-xs"
              disabled={!pjKey || testMutation.isPending}
              onClick={() => testMutation.mutate({ provider: "pagesjaunes", apiKey: pjKey })}>
              {testMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : "Tester"}
            </Button>
          </div>

          {testMutation.isSuccess && testMutation.variables?.provider === "pagesjaunes" && (
            <div className={cn("flex items-center gap-1.5 text-xs p-2 rounded-lg",
              testMutation.data.success ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
              {testMutation.data.success ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
              {testMutation.data.message}
            </div>
          )}

          <Button size="sm" className="w-full" disabled={!pjKey || saveMutation.isPending}
            onClick={() => saveMutation.mutate({ pagesJaunesApiKey: pjKey, defaultProvider: "pagesjaunes" })}>
            Sauvegarder la clé Pages Jaunes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────
// Business Card
// ──────────────────────────────────────────────

function BusinessCard({
  biz,
  selected,
  onToggle,
}: {
  biz: Business;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div onClick={onToggle}
      className={cn(
        "relative flex flex-col gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all select-none",
        selected
          ? "border-violet-500 bg-violet-50 shadow-sm"
          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
      )}>
      {/* Checkbox */}
      <div className={cn("absolute top-2.5 right-2.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
        selected ? "border-violet-500 bg-violet-500" : "border-slate-300")}>
        {selected && <CheckCircle2 size={10} className="text-white" />}
      </div>

      {/* Header */}
      <div className="pr-5">
        <p className="text-sm font-bold text-slate-800 leading-tight line-clamp-1">{biz.name}</p>
        {biz.category && (
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{biz.category}</p>
        )}
      </div>

      {/* Address */}
      <div className="flex items-start gap-1 text-xs text-slate-600">
        <MapPin size={10} className="mt-0.5 flex-shrink-0 text-slate-400" />
        <span className="line-clamp-1">
          {[biz.address, biz.city, biz.postalCode].filter(Boolean).join(", ")}
        </span>
      </div>

      {/* Phone + Website */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        {biz.phone && (
          <span className="flex items-center gap-1">
            <Phone size={10} className="text-slate-400" />
            {biz.phone}
          </span>
        )}
        {biz.website && (
          <a href={biz.website} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-violet-500 hover:text-violet-700 truncate max-w-[120px]">
            <Globe size={10} />
            <span className="truncate">{biz.website.replace(/^https?:\/\//, "")}</span>
          </a>
        )}
      </div>

      {/* Rating */}
      {biz.rating != null && (
        <div className="flex items-center gap-1 text-xs text-amber-600">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span>{biz.rating.toFixed(1)}</span>
          {biz.reviewCount && <span className="text-slate-400">({biz.reviewCount})</span>}
        </div>
      )}

      {/* Source */}
      <div className="flex items-center justify-between mt-0.5">
        <ProviderBadge provider={biz._source} />
        {biz.lat && biz.lng && (
          <a href={`https://www.openstreetmap.org/?mlat=${biz.lat}&mlon=${biz.lng}#map=17/${biz.lat}/${biz.lng}`}
            target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] text-slate-400 hover:text-violet-500 flex items-center gap-0.5">
            <Eye size={9} />Carte
          </a>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────

const searchSchema = z.object({
  query: z.string().min(1, "Entrez un type d'activité"),
  location: z.string().min(1, "Entrez une ville ou code postal"),
  radius: z.number().default(5000),
  maxResults: z.number().default(20),
  provider: z.enum(["osm", "google", "pagesjaunes", "auto"]).default("auto"),
});
type SearchForm = z.infer<typeof searchSchema>;

export function LeadExtractionPage() {
  const [results, setResults] = useState<Business[]>([]);
  const [extractionId, setExtractionId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeProvider, setActiveProvider] = useState<string>("osm");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: config } = trpc.leadExtraction.getApiKeys.useQuery();
  const { data: history } = trpc.leadExtraction.history.useQuery({ limit: 10 });

  const searchMutation = trpc.leadExtraction.search.useMutation({
    onMutate: () => {
      // Vider les résultats précédents dès qu'une nouvelle recherche démarre
      setResults([]);
      setSelected(new Set());
      setExtractionId(null);
    },
    onSuccess: (data: any) => {
      setResults(data.businesses as Business[]);
      setExtractionId(data.extractionId ?? null);
      setSelected(new Set());
      setActiveProvider(data.provider as string);
      if (data.error) {
        toast.warning(data.error as string);
      } else if (data.total === 0) {
        toast.info("Aucun résultat — essayez un autre terme, une autre ville ou augmentez le rayon");
      } else {
        toast.success(`${data.total as string} entreprise(s) trouvée(s) via ${data.provider as string}`);
      }
    },
    onError: (err: any) => toast.error(err.message),
  });

  const importMutation = trpc.leadExtraction.importProspects.useMutation({
    onSuccess: (data: any) => {
      toast.success(`✅ ${data.imported as string} prospect(s) importé(s) — ${data.skipped as string} doublon(s) ignoré(s)`);
      setSelected(new Set());
    },
    onError: (err: any) => toast.error(err.message),
  });

  const form = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: "", location: "", radius: 5000,
      maxResults: 20, provider: "auto",
    },
  });

  const toggleBusiness = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === results.length) setSelected(new Set());
    else setSelected(new Set(results.map((b) => b._externalId)));
  };

  const handleImport = () => {
    const toImport = results.filter((b) => selected.has(b._externalId));
    importMutation.mutate({
      extractionId: extractionId ?? undefined,
      businesses: toImport,
    });
  };

  const QUICK_SEARCHES = [
    { q: "restaurant", l: "Paris" },
    { q: "plombier", l: "Lyon" },
    { q: "coiffeur", l: "Marseille" },
    { q: "pharmacie", l: "Bordeaux" },
    { q: "hôtel", l: "Nice" },
    { q: "garage", l: "Toulouse" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Search size={20} className="text-violet-500" />
            Extraction de Leads
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Trouvez des entreprises par activité et localisation, importez-les en 1 clic dans votre CRM
          </p>
        </div>

        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Key size={13} />
              Clés API
              {(config?.hasGoogleKey || config?.hasPagesJaunesKey) && (
                <Badge className="h-4 text-[9px] bg-green-500 ml-1">
                  {[config?.hasGoogleKey && "Google", config?.hasPagesJaunesKey && "PJ"]
                    .filter(Boolean).length} configurée(s)
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key size={16} />
                Configuration BYOK — Fournisseurs de données
              </DialogTitle>
            </DialogHeader>
            <BYOKSettings />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="search">
        <TabsList className="w-full">
          <TabsTrigger value="search" className="flex-1 gap-1.5">
            <Search size={13} />Recherche
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 gap-1.5">
            <History size={13} />Historique
          </TabsTrigger>
        </TabsList>

        {/* ── ONGLET RECHERCHE ─────────────── */}
        <TabsContent value="search" className="space-y-4 mt-4">

          {/* Provider info banner */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "osm",         icon: "🗺️", label: "OpenStreetMap", badge: "GRATUIT",  color: "border-green-300 bg-green-50", badgeColor: "bg-green-500" },
              { id: "google",      icon: "🔵", label: "Google Maps",   badge: config?.hasGoogleKey ? "CONFIGURÉ" : "BYOK",  color: config?.hasGoogleKey ? "border-blue-300 bg-blue-50" : "border-slate-200", badgeColor: config?.hasGoogleKey ? "bg-blue-500" : "bg-slate-400" },
              { id: "pagesjaunes", icon: "📒", label: "Pages Jaunes",  badge: config?.hasPagesJaunesKey ? "CONFIGURÉ" : "BYOK", color: config?.hasPagesJaunesKey ? "border-yellow-300 bg-yellow-50" : "border-slate-200", badgeColor: config?.hasPagesJaunesKey ? "bg-yellow-500" : "bg-slate-400" },
            ].map((p) => (
              <div key={p.id} className={cn("flex items-center gap-2 p-2.5 rounded-xl border text-xs", p.color)}>
                <span className="text-lg">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{p.label}</p>
                  <Badge className={cn("text-[9px] h-3.5 mt-0.5", p.badgeColor)}>{p.badge}</Badge>
                </div>
                {!["osm"].includes(p.id) && !((p.id === "google" && config?.hasGoogleKey) || (p.id === "pagesjaunes" && config?.hasPagesJaunesKey)) && (
                  <button onClick={() => setSettingsOpen(true)}
                    className="text-[10px] text-violet-500 hover:text-violet-700 flex items-center gap-0.5 flex-shrink-0">
                    <Key size={9} />Ajouter
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Search form */}
          <Card>
            <CardContent className="pt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit((d) => searchMutation.mutate(d))} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="query" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Type d'activité *</FormLabel>
                        <FormControl>
                          <Input placeholder="restaurant, plombier, hôtel..." {...field} className="h-9" />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Localisation *</FormLabel>
                        <FormControl>
                          <Input placeholder="Paris, Lyon 69001..." {...field} className="h-9" />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <FormField control={form.control} name="provider" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Fournisseur</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">🔄 Auto (défaut)</SelectItem>
                            <SelectItem value="osm">🗺️ OpenStreetMap</SelectItem>
                            <SelectItem value="google">🔵 Google Maps</SelectItem>
                            <SelectItem value="pagesjaunes">📒 Pages Jaunes</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="radius" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Rayon</FormLabel>
                        <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1000">1 km</SelectItem>
                            <SelectItem value="2000">2 km</SelectItem>
                            <SelectItem value="5000">5 km</SelectItem>
                            <SelectItem value="10000">10 km</SelectItem>
                            <SelectItem value="25000">25 km</SelectItem>
                            <SelectItem value="50000">50 km</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="maxResults" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Résultats max</FormLabel>
                        <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="40">40</SelectItem>
                            <SelectItem value="60">60</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  {/* Quick searches */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-slate-400 self-center">Rapide :</span>
                    {QUICK_SEARCHES.map((s) => (
                      <button key={`${s.q}-${s.l}`} type="button"
                        onClick={() => { form.setValue("query", s.q); form.setValue("location", s.l); }}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-colors">
                        {s.q} à {s.l}
                      </button>
                    ))}
                  </div>

                  <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
                    disabled={searchMutation.isPending}>
                    {searchMutation.isPending
                      ? <><Loader2 size={14} className="animate-spin" />Recherche en cours…</>
                      : <><Search size={14} />Lancer la recherche</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">
                    {results.length} résultat(s)
                  </p>
                  <ProviderBadge provider={activeProvider} />
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={toggleAll}
                    className="text-xs text-slate-500 hover:text-violet-600 underline underline-offset-2">
                    {selected.size === results.length ? "Tout désélectionner" : "Tout sélectionner"}
                  </button>

                  {selected.size > 0 && (
                    <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 h-8"
                      onClick={handleImport} disabled={importMutation.isPending}>
                      {importMutation.isPending
                        ? <Loader2 size={12} className="animate-spin" />
                        : <Download size={12} />}
                      Importer {selected.size} lead(s)
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.map((biz) => (
                  <BusinessCard
                    key={biz._externalId}
                    biz={biz}
                    selected={selected.has(biz._externalId)}
                    onToggle={() => toggleBusiness(biz._externalId)}
                  />
                ))}
              </div>

              {selected.size > 0 && (
                <div className="sticky bottom-4 bg-white/90 backdrop-blur border border-violet-200 rounded-xl p-3 flex items-center justify-between shadow-lg">
                  <span className="text-sm font-semibold text-violet-700">
                    {selected.size} entreprise(s) sélectionnée(s)
                  </span>
                  <Button size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-700"
                    onClick={handleImport} disabled={importMutation.isPending}>
                    {importMutation.isPending
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Zap size={13} />}
                    Importer dans le CRM
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Empty state after search */}
          {searchMutation.isSuccess && results.length === 0 && !searchMutation.isPending && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <Search size={40} className="mb-3 opacity-20" />
              <p className="text-sm font-semibold text-slate-600">Aucun résultat trouvé</p>
              <p className="text-xs mt-1 text-center max-w-xs">
                Essayez un terme plus courant (ex: <em>restaurant</em>, <em>plombier</em>, <em>coiffeur</em>),
                une ville plus grande, ou augmentez le rayon de recherche
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { form.setValue("radius", 25000); form.handleSubmit((d) => searchMutation.mutate(d))(); }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors font-medium"
                >
                  🔍 Élargir à 25 km
                </button>
                <button
                  onClick={() => { form.setValue("radius", 50000); form.handleSubmit((d) => searchMutation.mutate(d))(); }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors font-medium"
                >
                  🌍 Élargir à 50 km
                </button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── ONGLET HISTORIQUE ─────────────── */}
        <TabsContent value="history" className="mt-4">
          {!history?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <History size={40} className="mb-3 opacity-20" />
              <p className="text-sm">Aucune extraction encore effectuée</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Recherche</TableHead>
                  <TableHead className="text-xs">Fournisseur</TableHead>
                  <TableHead className="text-xs text-right">Trouvés</TableHead>
                  <TableHead className="text-xs text-right">Importés</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="text-xs">
                      <div className="font-medium">{h.query}</div>
                      <div className="text-slate-400">{h.location}</div>
                    </TableCell>
                    <TableCell><ProviderBadge provider={h.provider} /></TableCell>
                    <TableCell className="text-xs text-right">{h.resultsCount ?? 0}</TableCell>
                    <TableCell className="text-xs text-right text-green-600 font-medium">{h.importedCount ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px]",
                        h.status === "done" ? "border-green-300 text-green-600"
                          : h.status === "error" ? "border-red-300 text-red-500"
                            : "border-slate-200 text-slate-500")}>
                        {h.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {h.createdAt ? new Date(h.createdAt).toLocaleDateString("fr-FR") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LeadExtractionPage;
