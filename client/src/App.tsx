/**
 * APP.TSX — Routeur principal (wouter)
 * PHASE 5 : lazyWithRetry + toutes les routes référence + guards stables
 */

import { lazy, Suspense } from 'react';
import { Switch, Route, Redirect } from 'wouter';
import { useAuth } from './_core/hooks/useAuth';
import { LoadingFallback } from './components/LoadingFallback';
import DashboardLayout from './components/DashboardLayout';
import { PWAManager } from "@/components/PWAManager";

// ── lazyWithRetry (Phase 5.1) ──────────────────────────────────────────────
function lazyWithRetry<T extends React.ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(() =>
    factory().catch(() => {
      window.location.reload();
      return factory();
    })
  );
}

// ── Public pages (non lazy) ───────────────────────────────────────────────
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import HomePage from './pages/Home';

// ── Protected pages (lazyWithRetry) ──────────────────────────────────────
const IAMonitoring           = lazyWithRetry(() => import('./pages/IAMonitoring'));
const Dashboard              = lazyWithRetry(() => import('./pages/Dashboard'));
const AgentDashboard         = lazyWithRetry(() => import('./pages/AgentDashboard'));
const ManagerDashboard       = lazyWithRetry(() => import('./pages/ManagerDashboard'));
const AdminDashboard         = lazyWithRetry(() => import('./pages/AdminDashboard'));
const AdminPanel             = lazyWithRetry(() => import('./pages/admin'));
const SelectTenant           = lazyWithRetry(() => import('./pages/SelectTenant'));
const Connected              = lazyWithRetry(() => import('./pages/Connected'));

const Calls                  = lazyWithRetry(() => import('./pages/Calls'));
const Softphone              = lazyWithRetry(() => import('./pages/Softphone'));
const RecordingPlayer        = lazyWithRetry(() => import('./pages/RecordingPlayer'));

const Prospects              = lazyWithRetry(() => import('./pages/Prospects'));
const ProspectDetail         = lazyWithRetry(() => import('./pages/ProspectDetail'));
const ProspectDetail360      = lazyWithRetry(() => import('./pages/ProspectDetail360'));
const Leads                  = lazyWithRetry(() => import('./pages/Leads'));
const LeadExtraction         = lazyWithRetry(() => import('./pages/LeadExtraction'));
const Clients                = lazyWithRetry(() => import('./pages/Clients'));

const Campaigns              = lazyWithRetry(() => import('./pages/Campaigns'));
const CampaignWizard         = lazyWithRetry(() => import('./pages/CampaignWizard'));
const Messages               = lazyWithRetry(() => import('./pages/Messages'));
const CalendarView           = lazyWithRetry(() => import('./pages/CalendarView'));
const Tasks                  = lazyWithRetry(() => import('./pages/Tasks'));

const Workflows              = lazyWithRetry(() => import('./pages/Workflows'));
const WorkflowEditor         = lazyWithRetry(() => import('./pages/WorkflowEditor'));
const WorkflowsAdmin         = lazyWithRetry(() => import('./pages/WorkflowsAdmin'));
const WorkflowsAndAgentSwitch = lazyWithRetry(() => import('./pages/WorkflowsAndAgentSwitch'));
const AgentSwitch            = lazyWithRetry(() => import('./pages/AgentSwitch'));

const Coaching               = lazyWithRetry(() => import('./pages/Coaching'));
const RecruitmentInterviews  = lazyWithRetry(() => import('./pages/RecruitmentInterviews'));
const RecruitmentEnhanced    = lazyWithRetry(() => import('./pages/RecruitmentEnhanced'));
const Training               = lazyWithRetry(() => import('./pages/Training'));
const IntelligenceCentrale   = lazyWithRetry(() => import('./pages/IntelligenceCentrale'));
const SocialMediaManager     = lazyWithRetry(() => import('./pages/SocialMediaManager'));
const UnifiedInbox           = lazyWithRetry(() => import('./pages/UnifiedInbox'));
const AIRoleEditor           = lazyWithRetry(() => import('./pages/AIRoleEditor'));
const BrandConfigPage        = lazyWithRetry(() => import('./components/BrandConfigPanel'));

const Documents              = lazyWithRetry(() => import('./pages/Documents'));

const InvoiceCreation        = lazyWithRetry(() => import('./pages/InvoiceCreation'));
const InvoiceHistory         = lazyWithRetry(() => import('./pages/InvoiceHistory'));
const InvoicePaymentPage     = lazyWithRetry(() => import('./pages/InvoicePaymentPage'));
const InvoiceAcceptancePage  = lazyWithRetry(() => import('./pages/InvoiceAcceptancePage'));
const Billing                = lazyWithRetry(() => import('./pages/Billing'));
const BillingAdmin           = lazyWithRetry(() => import('./pages/BillingAdmin'));
const Subscription           = lazyWithRetry(() => import('./pages/subscription'));

const Compliance             = lazyWithRetry(() => import('./pages/Compliance'));
const ComplianceRGPD         = lazyWithRetry(() => import('./pages/ComplianceRGPD'));
const Settings               = lazyWithRetry(() => import('./pages/Settings'));
const NotFound               = lazyWithRetry(() => import('./pages/NotFound'));
const Terms                  = lazyWithRetry(() => import('./pages/Terms'));
const Privacy                = lazyWithRetry(() => import('./pages/Privacy'));
const Contact                = lazyWithRetry(() => import('./pages/Contact'));

// ── Auth Guards (Phase 5.3) — jamais de redirect pendant loading ──────────

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingFallback />;      // spinner, pas de redirect prématuré
  if (!isAuthenticated) return <Redirect to="/login" />;
  return children;
}

function PublicOnly({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (isAuthenticated) return <Redirect to="/dashboard" />;
  return children;
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PWAManager />
      <Switch>

        {/* ── Public ──────────────────────────────────────────────────── */}
        <Route path="/login">   <PublicOnly><LoginPage /></PublicOnly>   </Route>
        <Route path="/signup">  <PublicOnly><SignupPage /></PublicOnly>  </Route>
        <Route path="/register"><PublicOnly><SignupPage /></PublicOnly>  </Route>

        <Route path="/"         component={HomePage} />
        <Route path="/home"     component={HomePage} />
        <Route path="/terms"    component={Terms} />
        <Route path="/privacy"  component={Privacy} />
        <Route path="/contact"  component={Contact} />

        <Route path="/invoice/payment/:token"  component={InvoicePaymentPage} />
        <Route path="/invoice/accept/:token"   component={InvoiceAcceptancePage} />

        {/* ── Protected ───────────────────────────────────────────────── */}
        <Route path="/:rest*">
          <RequireAuth>
            <DashboardLayout>
              <Suspense fallback={<LoadingFallback />}>
                <Switch>
                  <Route path="/dashboard"              component={Dashboard} />
                  <Route path="/connected"              component={Connected} />
                  <Route path="/select-tenant"          component={SelectTenant} />
                  <Route path="/agent"                  component={AgentDashboard} />
                  <Route path="/manager"                component={ManagerDashboard} />
                  <Route path="/ia-monitoring"          component={IAMonitoring} />
                  <Route path="/admin/dashboard"        component={AdminDashboard} />
                  <Route path="/admin"                  component={AdminPanel} />

                  <Route path="/calls"                  component={Calls} />
                  <Route path="/softphone"              component={Softphone} />
                  <Route path="/recordings/:id"         component={RecordingPlayer} />

                  {/* /prospect/:id et /prospects/:id — compatibilité référence */}
                  <Route path="/prospect/:id/360"       component={ProspectDetail360} />
                  <Route path="/prospect/:id"           component={ProspectDetail} />
                  <Route path="/prospects/:id/360"      component={ProspectDetail360} />
                  <Route path="/prospects/:id"          component={ProspectDetail} />
                  <Route path="/prospects"              component={Prospects} />
                  <Route path="/leads"                  component={Leads} />
                  <Route path="/lead-extraction"        component={LeadExtraction} />
                  <Route path="/clients"                component={Clients} />

                  <Route path="/campaigns/new"          component={CampaignWizard} />
                  <Route path="/campaigns"              component={Campaigns} />
                  <Route path="/messages"               component={Messages} />
                  <Route path="/appointments"           component={CalendarView} />
                  <Route path="/tasks"                  component={Tasks} />

                  <Route path="/workflows/admin"        component={WorkflowsAdmin} />
                  <Route path="/workflows/:id/edit"     component={WorkflowEditor} />
                  <Route path="/workflows/:id"          component={WorkflowEditor} />
                  <Route path="/workflows"              component={Workflows} />
                  {/* agent-switch avec WorkflowsAndAgentSwitch (référence) */}
                  <Route path="/agent-switch"           component={WorkflowsAndAgentSwitch} />

                  <Route path="/coaching"               component={Coaching} />
                  <Route path="/recruitment-enhanced"   component={RecruitmentEnhanced} />
                  <Route path="/recruitment"            component={RecruitmentInterviews} />
                  <Route path="/training"               component={Training} />
                  <Route path="/intelligence-centrale"  component={IntelligenceCentrale} />
                  <Route path="/social-manager"         component={SocialMediaManager} />
                  <Route path="/inbox"                  component={UnifiedInbox} />
                  <Route path="/ai-roles"               component={AIRoleEditor} />
                  <Route path="/ai-role-editor"         component={AIRoleEditor} />
                  <Route path="/brand-config"           component={BrandConfigPage} />

                  <Route path="/documents"              component={Documents} />

                  <Route path="/invoices/new"           component={InvoiceCreation} />
                  <Route path="/invoices"               component={InvoiceHistory} />
                  <Route path="/billing/admin"          component={BillingAdmin} />
                  <Route path="/billing"                component={Billing} />
                  <Route path="/subscription"           component={Subscription} />

                  <Route path="/compliance/rgpd"        component={ComplianceRGPD} />
                  <Route path="/compliance"             component={Compliance} />

                  <Route path="/settings"               component={Settings} />

                  <Route component={NotFound} />
                </Switch>
              </Suspense>
            </DashboardLayout>
          </RequireAuth>
        </Route>

      </Switch>
    </Suspense>
  );
}
