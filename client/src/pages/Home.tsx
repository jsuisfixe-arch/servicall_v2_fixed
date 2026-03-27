/**
 * Home Page - Landing Page Améliorée
 * Affiche les 10 nouveaux services métier avancés
 */

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Phone, Users, BarChart3, RefreshCw, 
  ArrowRight, Zap, MessageSquare,
  Briefcase, Mic, Target, Lock, CheckCircle, Rocket,
  Database, Brain, Workflow, Mail, TrendingUp, GraduationCap,
  Key, Plug, CreditCard, Settings
} from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { t } = useTranslation('common');
  const { loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleStart = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      setLocation("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-main-content>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('actions.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">SERVICALL<span className="text-primary">.</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Fonctionnalités</a>
            <a href="#services" className="hover:text-primary transition-colors">10 Services</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Tarifs</a>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Button variant="ghost" className="hidden sm:flex" onClick={handleStart}>
              {isAuthenticated ? "Dashboard" : "Connexion"}
            </Button>
            <Button className="rounded-full px-6 shadow-lg shadow-primary/20" onClick={handleStart}>
              {isAuthenticated ? "Dashboard" : "Démarrer Gratuitement"}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-4 text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold animate-bounce">
            <Rocket className="h-4 w-4" />
            <span>🚀 Servicall v2.0 - 10 Services Avancés</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] max-w-5xl mx-auto">
            Plateforme CRM IA <span className="text-primary">Complète</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Servicall v2.0 : Extracteur de Leads, Mémoire IA, Workflows visuels, Campagnes prédictives, Social Manager, Blueprints, Stripe Connect, Email multi-provider, Monitoring IA et Formation des Agents
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button size="lg" className="h-16 px-10 text-xl rounded-full shadow-2xl shadow-primary/30 group" onClick={handleStart}>
              {isAuthenticated ? "Aller au Dashboard" : "Démarrer Gratuitement"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 text-xl rounded-full" onClick={() => setLocation("/marketplace")}>
              Configurer les Intégrations
            </Button>
          </div>

          <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center justify-center font-bold text-2xl tracking-tighter italic">Fiable</div>
            <div className="flex items-center justify-center font-bold text-2xl tracking-tighter italic">Sécurisé</div>
            <div className="flex items-center justify-center font-bold text-2xl tracking-tighter italic">Scalable</div>
            <div className="flex items-center justify-center font-bold text-2xl tracking-tighter italic">Global</div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-black">10</div>
            <div className="text-primary-foreground/70 font-medium">Services Avancés</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-black">6</div>
            <div className="text-primary-foreground/70 font-medium">Providers BYOK</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-black">100%</div>
            <div className="text-primary-foreground/70 font-medium">Chiffré AES-256</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-black">24/7</div>
            <div className="text-primary-foreground/70 font-medium">Disponibilité</div>
          </div>
        </div>
      </section>

      {/* 10 New Services Section */}
      <section id="services" className="py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-sm font-black uppercase tracking-widest text-primary">10 Services Métier</h2>
            <p className="text-4xl md:text-5xl font-black tracking-tight">Services Avancés Intégrés</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1: Lead Extraction */}
            <Card className="border-none shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <Database className="h-8 w-8 text-blue-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Extracteur de Leads</CardTitle>
                <CardDescription className="text-lg">
                  Recherche et import automatique de leads depuis Google Maps, Pages Jaunes et fichiers CSV avec enrichissement IA
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Service 2: Contact Memory */}
            <Card className="border-none shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                  <Brain className="h-8 w-8 text-purple-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Mémoire IA des Contacts</CardTitle>
                <CardDescription className="text-lg">
                  Historique complet des interactions, résumés automatiques et suggestions de prochaines actions
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Service 3: Workflow Builder */}
            <Card className="border-none shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center">
                  <Workflow className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Éditeur Visuel de Workflows</CardTitle>
                <CardDescription className="text-lg">
                  Drag-and-drop no-code, bibliothèque d'actions pré-configurées et simulation avant déploiement
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Service 4: Weekly Reports */}
            <Card className="border-none shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-orange-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Rapports Hebdomadaires</CardTitle>
                <CardDescription className="text-lg">
                  Métriques clés, graphiques de performance et recommandations IA personnalisées par email
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Service 5: Campagnes Multi-canal */}
            <Card className="border-none shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                  <Phone className="h-8 w-8 text-red-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Campagnes Multi-canal</CardTitle>
                <CardDescription className="text-lg">
                  Dialer prédictif IA, campagnes SMS et WhatsApp en masse avec gestion des relances automatiques
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Service 6: Blueprint Marketplace */}
            <Card className="border-none shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                  <Zap className="h-8 w-8 text-indigo-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Marketplace de Blueprints</CardTitle>
                <CardDescription className="text-lg">
                  Templates par industrie, notation communautaire et import/export en un clic
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Service 7: Stripe Connect */}
            <Card className="border-none shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-pink-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Stripe Connect</CardTitle>
                <CardDescription className="text-lg">
                  Paiements directs, gestion des commissions, facturation automatique et dashboard financier
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Service 8: Email Configuration */}
            <Card className="border-none shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center">
                  <Mail className="h-8 w-8 text-cyan-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Configuration Email Multi-Provider</CardTitle>
                <CardDescription className="text-lg">
                  Gmail, Outlook, SMTP avec chiffrement des credentials, test de connexion et gestion centralisée
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Service 9: AI Monitoring */}
            <Card className="border-none shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-teal-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Monitoring IA Temps Réel</CardTitle>
                <CardDescription className="text-lg">
                  Métriques de latence, taux de succès des appels IA et alertes automatiques sur anomalies
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Service 10: Training Modules */}
            <Card className="border-none shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Formation IA des Agents</CardTitle>
                <CardDescription className="text-lg">
                  Analyse des transcriptions, scoring automatique et recommandations d'amélioration personnalisées
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* BYOK Architecture Section */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-sm font-black uppercase tracking-widest text-primary">Architecture Sécurisée</h2>
            <p className="text-4xl md:text-5xl font-black tracking-tight">BYOK - Bring Your Own Key</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* BYOK Feature 1 */}
            <Card className="border-none shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Key className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Gestion Centralisée des Clés</CardTitle>
                <CardDescription className="text-lg">
                  Interface unifiée pour configurer toutes vos clés API (Google Maps, Pages Jaunes, OpenAI, Stripe, SendGrid, Twilio)
                </CardDescription>
              </CardHeader>
            </Card>

            {/* BYOK Feature 2 */}
            <Card className="border-none shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center">
                  <Lock className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Chiffrement AES-256-CBC</CardTitle>
                <CardDescription className="text-lg">
                  Toutes les clés API sont chiffrées avec AES-256-CBC pour une sécurité maximale
                </CardDescription>
              </CardHeader>
            </Card>

            {/* BYOK Feature 3 */}
            <Card className="border-none shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Test de Validité en Temps Réel</CardTitle>
                <CardDescription className="text-lg">
                  Vérifiez vos clés API avant sauvegarde avec tests de connexion automatiques
                </CardDescription>
              </CardHeader>
            </Card>

            {/* BYOK Feature 4 */}
            <Card className="border-none shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                  <Settings className="h-8 w-8 text-purple-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Isolation Multi-Tenant</CardTitle>
                <CardDescription className="text-lg">
                  Chaque tenant a ses propres clés API isolées et sécurisées
                </CardDescription>
              </CardHeader>
            </Card>

            {/* BYOK Feature 5 */}
            <Card className="border-none shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-orange-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Audit Logging Centralisé</CardTitle>
                <CardDescription className="text-lg">
                  Tous les accès et modifications de clés sont enregistrés pour la conformité
                </CardDescription>
              </CardHeader>
            </Card>

            {/* BYOK Feature 6 */}
            <Card className="border-none shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                  <Plug className="h-8 w-8 text-red-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Intégration Facile</CardTitle>
                <CardDescription className="text-lg">
                  Tous les services fonctionnent sans clés API manquantes avec messages clairs
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight">
            Prêt à Transformer Votre Business ?
          </h2>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
            Commencez gratuitement avec tous les 10 services avancés et configurez vos intégrations en quelques minutes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button size="lg" variant="secondary" className="h-16 px-10 text-xl rounded-full group" onClick={handleStart}>
              {isAuthenticated ? "Aller au Dashboard" : "Démarrer Gratuitement"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 text-xl rounded-full text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10" onClick={() => setLocation("/marketplace")}>
              Configurer les Intégrations
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Servicall</h3>
              <p className="text-muted-foreground">Plateforme CRM IA Enterprise</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Produit</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#features" className="hover:text-primary transition-colors">Fonctionnalités</a></li>
                <li><a href="#services" className="hover:text-primary transition-colors">Services</a></li>
                <li><a href="/marketplace" className="hover:text-primary transition-colors">Marketplace</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="/contact" className="hover:text-primary transition-colors">À propos</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Légal</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="/privacy" className="hover:text-primary transition-colors">Confidentialité</a></li>
                <li><a href="/terms" className="hover:text-primary transition-colors">Conditions</a></li>
                <li><a href="/privacy" className="hover:text-primary transition-colors">Sécurité</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2026 Servicall. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
