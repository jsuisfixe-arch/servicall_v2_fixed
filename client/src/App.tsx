/**
 * APP.TSX — Routeur principal (wouter)
 * ✅ FIX BUILD : lazyWithRetry stable (sans window.location.reload boucle infinie)
 * ✅ FIX PAGE BLANCHE : ErrorBoundary par Suspense + fallback robuste
 */

import { lazy, Suspense, Component, type ReactNode } from 'react';
import { Switch, Route, Redirect } from 'wouter';
import { useAuth } from './_core/hooks/useAuth';
import { LoadingFallback } from './components/LoadingFallback';
import DashboardLayout from './components/DashboardLayout';
import { PWAManager } from '@/components/PWAManager';
import { ServicallWidget } from './components/ServicallWidget';

// ── lazyWithRetry STABLE ──────────────────────────────────────────────────────
// ✅ FIX : Pas de window.location.reload() qui crée des boucles infinies.
// On tente une seule fois, et en cas d'échec on retourne un composant d'erreur
// plutôt que de recharger la page indéfiniment.
function lazyWithRetry<T extends React.ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(() =>
    factory().catch((err) => {
      console.error('[lazyWithRetry] Échec du chargement du module:', err);
      // Retourner un composant d'erreur générique plutôt que de recharger
      return {
        default: (() => (
          <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
            <p className="text-destructive font-medium mb-2">Erreur de chargement</p>
            <p className="text-muted-foreground text-sm mb-4">
              Ce module n'a pas pu être chargé.
            </p>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
              onClick={() => window.location.reload()}
            >
              Recharger la page
            </button>
          </div>
        )) as unknown as T,
      };
    })
  );
}

// ── ErrorBoundary pour les Suspense ──────────────────────────────────────────
interface ErrorBoundaryState { hasError: boolean; error?: Error }
class SuspenseErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error) {
    console.error('[SuspenseErrorBoundary]', error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
          <p className="text-destructive font-semibold text-lg mb-2">
            Une erreur est survenue
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            {this.state.error?.message ?? 'Erreur inconnue'}
          </p>
          <button
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={() => window.location.reload()}
          >
            Recharger l'application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Public pages (non lazy — chargées immédiatement) ─────────────────────────
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import HomePage from './pages/Home';

// ── Protected pages (lazy) ────────────────────────────────────────────────────
const IAMonitoring            = lazyWithRetry(() => import('./pages/IAMonitoring'));
const Dashboard               = lazyWithRetry(() => import('./pages/Dashboard'));
const AgentDashboard          = lazyWithRetry(() => import('./pages/AgentDashboard'));
const ManagerDashboard        = lazyWithRetry(() => import('./pages/ManagerDashboard'));
const AdminDashboard          = lazyWithRetry(() => import('./pages/AdminDashboard'));
const AdminPanel              = lazyWithRetry(() => import('./pages/admin'));
const SelectTenant            = lazyWithRetry(() => import('./pages/SelectTenant'));
const Connected               = lazyWithRetry(() => import('./pages/Connected'));

const Calls                   = lazyWithRetry(() => import('./pages/Calls'));
const Softphone               = lazyWithRetry(() => import('./pages/Softphone'));
const RecordingPlayer         = lazyWithRetry(() => import('./pages/RecordingPlayer'));

const Prospects               = lazyWithRetry(() => import('./pages/Prospects'));
const ProspectDetail          = lazyWithRetry(() => import('./pages/ProspectDetail'));
const ProspectDetail360       = lazyWithRetry(() => import('./pages/ProspectDetail360'));
const Leads                   = lazyWithRetry(() => import('./pages/Leads'));
const LeadExtraction          = lazyWithRetry(() => import('./pages/LeadExtraction'));
const Clients                 = lazyWithRetry(() => import('./pages/Clients'));

const Campaigns               = lazyWithRetry(() => import('./pages/Campaigns'));
const CampaignWizard          = lazyWithRetry(() => import('./pages/CampaignWizard'));
const Messages                = lazyWithRetry(() => import('./pages/Messages'));
const CalendarView            = lazyWithRetry(() => import('./pages/CalendarView'));
const Tasks                   = lazyWithRetry(() => import('./pages/Tasks'));

const Workflows               = lazyWithRetry(() => import('./pages/Workflows'));
const WorkflowEditor          = lazyWithRetry(() => import('./pages/WorkflowEditor'));
const WorkflowsAdmin          = lazyWithRetry(() => import('./pages/WorkflowsAdmin'));
const WorkflowsAndAgentSwitch = lazyWithRetry(() => import('./pages/WorkflowsAndAgentSwitch'));
// AgentSwitch importé mais non utilisé dans les routes (gardé pour compatibilité)
const _AgentSwitch            = lazyWithRetry(() => import('./pages/AgentSwitch'));

const Coaching                = lazyWithRetry(() => import('./pages/Coaching'));
const RecruitmentInterviews   = lazyWithRetry(() => import('./pages/RecruitmentInterviews'));
const RecruitmentEnhanced     = lazyWithRetry(() => import('./pages/RecruitmentEnhanced'));
const Training                = lazyWithRetry(() => import('./pages/Training'));
const IntelligenceCentrale    = lazyWithRetry(() => import('./pages/IntelligenceCentrale'));
const SocialMediaManager      = lazyWithRetry(() => import('./pages/SocialMediaManager'));
const UnifiedInbox            = lazyWithRetry(() => import('./pages/UnifiedInbox'));
const AIRoleEditor            = lazyWithRetry(() => import('./pages/AIRoleEditor'));
const BrandConfigPage         = lazyWithRetry(() => import('./components/BrandConfigPanel'));
const AdminBranding           = lazyWithRetry(() => import('./pages/AdminBranding'));
const Documents               = lazyWithRetry(() => import('./pages/Documents'));

const InvoiceCreation         = lazyWithRetry(() => import('./pages/InvoiceCreation'));
const InvoiceHistory          = lazyWithRetry(() => import('./pages/InvoiceHistory'));
const InvoicePaymentPage      = lazyWithRetry(() => import('./pages/InvoicePaymentPage'));
const InvoiceAcceptancePage   = lazyWithRetry(() => import('./pages/InvoiceAcceptancePage'));
const Billing                 = lazyWithRetry(() => import('./pages/Billing'));
const BillingAdmin            = lazyWithRetry(() => import('./pages/BillingAdmin'));
const Subscription            = lazyWithRetry(() => import('./pages/subscription'));

const Compliance              = lazyWithRetry(() => import('./pages/Compliance'));
const ComplianceRGPD          = lazyWithRetry(() => import('./pages/ComplianceRGPD'));
const Settings                = lazyWithRetry(() => import('./pages/Settings'));
const NotFound                = lazyWithRetry(() => import('./pages/NotFound'));
const Terms                   = lazyWithRetry(() => import('./pages/Terms'));
const Privacy                 = lazyWithRetry(() => import('./pages/Privacy'));
const Contact                 = lazyWithRetry(() => import('./pages/Contact'));

// ── Auth Guards ───────────────────────────────────────────────────────────────
function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (!isAuthenticated) return <Redirect to="/login" />;
  return children;
}

function PublicOnly({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (isAuthenticated) return <Redirect to="/dashboard" />;
  return children;
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <SuspenseErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <PWAManager />
        <ServicallWidget />
        <Switch>

          {/* ── Public ────────────────────────────────────────────────── */}
          <Route path="/login">
            <PublicOnly><LoginPage /></PublicOnly>
          </Route>
          <Route path="/signup">
            <PublicOnly><SignupPage /></PublicOnly>
          </Route>
          <Route path="/register">
            <PublicOnly><SignupPage /></PublicOnly>
          </Route>

          <Route path="/"        component={HomePage} />
          <Route path="/home"    component={HomePage} />
          <Route path="/terms"   component={Terms} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/contact" component={Contact} />

          <Route path="/invoice/payment/:token" component={InvoicePaymentPage} />
          <Route path="/invoice/accept/:token"  component={InvoiceAcceptancePage} />

          {/* ── Protected ─────────────────────────────────────────────── */}
          <Route path="/:rest*">
            <RequireAuth>
              <DashboardLayout>
                <SuspenseErrorBoundary>
                  <Suspense fallback={<LoadingFallback />}>
                    <Switch>
                      <Route path="/dashboard"             component={Dashboard} />
                      <Route path="/connected"             component={Connected} />
                      <Route path="/select-tenant"         component={SelectTenant} />
                      <Route path="/agent"                 component={AgentDashboard} />
                      <Route path="/manager"               component={ManagerDashboard} />
                      <Route path="/ia-monitoring"         component={IAMonitoring} />
                      <Route path="/admin/dashboard"       component={AdminDashboard} />
                      <Route path="/admin/branding"        component={AdminBranding} />
                      <Route path="/admin"                 component={AdminPanel} />

                      <Route path="/calls"                 component={Calls} />
                      <Route path="/softphone"             component={Softphone} />
                      <Route path="/recordings/:id"        component={RecordingPlayer} />

                      <Route path="/prospect/:id/360"      component={ProspectDetail360} />
                      <Route path="/prospect/:id"          component={ProspectDetail} />
                      <Route path="/prospects/:id/360"     component={ProspectDetail360} />
                      <Route path="/prospects/:id"         component={ProspectDetail} />
                      <Route path="/prospects"             component={Prospects} />
                      <Route path="/leads"                 component={Leads} />
                      <Route path="/lead-extraction"       component={LeadExtraction} />
                      <Route path="/clients"               component={Clients} />

                      <Route path="/campaigns/new"         component={CampaignWizard} />
                      <Route path="/campaigns"             component={Campaigns} />
                      <Route path="/messages"              component={Messages} />
                      <Route path="/appointments"          component={CalendarView} />
                      <Route path="/tasks"                 component={Tasks} />

                      <Route path="/workflows/admin"       component={WorkflowsAdmin} />
                      <Route path="/workflows/:id/edit"    component={WorkflowEditor} />
                      <Route path="/workflows/:id"         component={WorkflowEditor} />
                      <Route path="/workflows"             component={Workflows} />
                      <Route path="/agent-switch"          component={WorkflowsAndAgentSwitch} />

                      <Route path="/coaching"              component={Coaching} />
                      <Route path="/recruitment-enhanced"  component={RecruitmentEnhanced} />
                      <Route path="/recruitment"           component={RecruitmentInterviews} />
                      <Route path="/training"              component={Training} />
                      <Route path="/intelligence-centrale" component={IntelligenceCentrale} />
                      <Route path="/social-manager"        component={SocialMediaManager} />
                      <Route path="/inbox"                 component={UnifiedInbox} />
                      <Route path="/ai-roles"              component={AIRoleEditor} />
                      <Route path="/ai-role-editor"        component={AIRoleEditor} />
                      <Route path="/brand-config"          component={BrandConfigPage} />

                      <Route path="/documents"             component={Documents} />

                      <Route path="/invoices/new"          component={InvoiceCreation} />
                      <Route path="/invoices"              component={InvoiceHistory} />
                      <Route path="/billing/admin"         component={BillingAdmin} />
                      <Route path="/billing"               component={Billing} />
                      <Route path="/subscription"          component={Subscription} />

                      <Route path="/compliance/rgpd"       component={ComplianceRGPD} />
                      <Route path="/compliance"            component={Compliance} />

                      <Route path="/settings"              component={Settings} />

                      <Route component={NotFound} />
                    </Switch>
                  </Suspense>
                </SuspenseErrorBoundary>
              </DashboardLayout>
            </RequireAuth>
          </Route>

        </Switch>
      </Suspense>
    </SuspenseErrorBoundary>
  );
}
