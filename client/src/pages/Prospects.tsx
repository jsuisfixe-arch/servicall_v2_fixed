import { useState } from "react";
import { 
  Users, 
  Plus, 
  Download, 
  Upload,
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon,
  PhoneCall,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UniversalKanban, KanbanItem, KanbanColumn } from "@/components/UniversalKanban";
import { EmptyStateEnhanced } from "@/components/EmptyStateEnhanced";
import { LoadingStateEnhanced } from "@/components/LoadingStateEnhanced";
import { ErrorStateEnhanced } from "@/components/ErrorStateEnhanced";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Pagination } from "@/components/Pagination";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useTranslation } from "react-i18next";
import { useTenant } from "@/contexts/TenantContext";
import { ProspectDialog } from "@/components/ProspectDialog";
import { useCallStore } from "@/lib/callStore";

type ProspectStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

export default function ProspectsFixed() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { tenantId } = useTenant();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const initiateCall = useCallStore((state) => state.initiateCall);

  // Handler appel direct depuis la card prospect
  const handleCall = (item: any) => {
    if (!item.phone) {
      toast.warning("Ce prospect n'a pas de numéro de téléphone");
      return;
    }
    initiateCall({
      prospectId: typeof item.id === 'number' ? item.id : undefined,
      prospectName: item.title as string,
      phoneNumber: item.phone as string,
    });
    toast.success(`Appel vers ${item.title as string} (${item.phone as string}) en cours...`);
  };

  // Handler SMS direct depuis la card prospect
  const handleSms = (item: any) => {
    if (!item.phone) {
      toast.warning("Ce prospect n'a pas de numéro de téléphone");
      return;
    }
    // Ouvrir le lien SMS natif avec pré-remplissage du numéro
    window.open(`sms:${item.phone as string}`, '_self');
    toast.success(`SMS vers ${item.title as string} (${item.phone as string})`);
  };

  // Query tRPC pour récupérer les prospects avec pagination
  const { 
    data: paginatedData, 
    isPending, 
    isError, 
    error,
    refetch 
  } = trpc.prospect.list.useQuery(
    { page, limit: pageSize },
    { 
      enabled: !!tenantId,
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  const prospects = (paginatedData as Record<string,unknown>)?.['prospects'] || (paginatedData as Record<string,unknown>)?.['data'] || [];
  const totalCount = (paginatedData as Record<string,unknown>)?.['total'] || (paginatedData as Record<string,unknown>)?.['pagination'] || 0;

  // Mutation avec gestion optimiste
  const updateStatusMutation = trpc.prospect.update.useMutation({
    onMutate: async (newData) => {
      const queryKey = getQueryKey(trpc.prospect.list, { page, limit: pageSize }, 'query');
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old || !old.prospects) return old;
        return {
          ...old,
          prospects: (old["prospects"] as Record<string,unknown>[]).map((p) => p["id"] === (newData as Record<string,unknown>)["id"] ? { ...p, status: (newData as Record<string,unknown>)["status"] } : p)
        };
      });
      
      return { previous };
    },
    onError: (_err, _newData, context: any) => {
      const queryKey = getQueryKey(trpc.prospect.list, { page, limit: pageSize }, 'query');
      if (context) queryClient.setQueryData(queryKey, (context as Record<string,unknown>)["previous"]);
      toast.error(t('common:errors.unexpected'));
    },
    onSettled: () => {
      const queryKey = getQueryKey(trpc.prospect.list, { page, limit: pageSize }, 'query');
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Colonnes du Kanban
  const columns: KanbanColumn[] = [
    { id: "new", title: t('pages.prospects.columns.new') || "Nouveau", color: "bg-slate-500" },
    { id: "contacted", title: t('pages.prospects.columns.contacted') || "Contacté", color: "bg-blue-500" },
    { id: "qualified", title: t('pages.prospects.columns.qualified') || "Qualifié", color: "bg-indigo-500" },
    { id: "proposal", title: t('pages.prospects.columns.proposal') || "Proposition", color: "bg-purple-500" },
    { id: "negotiation", title: t('pages.prospects.columns.negotiation') || "Négociation", color: "bg-orange-500" },
    { id: "converted", title: t('pages.prospects.columns.converted') || "Converti", color: "bg-green-500" },
    { id: "lost", title: t('pages.prospects.columns.lost') || "Perdu", color: "bg-red-500" },
  ];

  // Transformer les prospects pour le Kanban
  const kanbanItems: KanbanItem[] = (Array.isArray(prospects) ? prospects as Record<string,unknown>[] : []).map((p) => ({
    id: p.id as string | number,
    title: `${(p.firstName as string) || ""} ${(p.lastName as string) || ""}`.trim() || "Sans nom",
    company: (p.company as string) || "N/A",
    status: (p.status as ProspectStatus) || "new",
    priority: "medium",
    phone: (p.phone as string) || "",
    email: (p.email as string) || "",
  }));

  // Filtrage par recherche (local pour l'instant)
  const filteredItems: KanbanItem[] = kanbanItems.filter((item: KanbanItem) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(search) ||
      (item.company ?? '').toLowerCase().includes(search) ||
      (item.email ?? '').toLowerCase().includes(search) ||
      (item.phone ?? '').includes(search)
    );
  });

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in p-1" data-main-content>
      <ProspectDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSuccess={() => refetch()}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">{t('pages.prospects.title')}</h1>
          </div>
          <p className="text-muted-foreground">
            {t('pages.prospects.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2" 
            onClick={() => window.location.href='/campaigns?tab=import'}
          >
            <Upload className="w-4 h-4" />
            {t('pages.prospects.import_csv')}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => toast.info(t('pages.calls.export'))}
          >
            <Download className="w-4 h-4" />
            {t('pages.prospects.export')}
          </Button>
          <Button 
            size="sm" 
            className="gap-2 shadow-lg shadow-primary/20"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            {t('pages.prospects.new_prospect')}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t('pages.prospects.search_placeholder')} 
              className="pl-10 bg-muted/50 border-none focus-visible:ring-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <Tabs value={view} onValueChange={(v: any) => setView(v)} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="kanban" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              {t('pages.prospects.kanban')}
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <ListIcon className="w-4 h-4" />
              {t('pages.prospects.list')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Area with State Management */}
      <div className="min-h-[600px] space-y-4">
        {isPending && (
          <LoadingStateEnhanced 
            message={t('pages.prospects.loading')} 
            variant="spinner"
          />
        )}

        {isError && (
          <ErrorStateEnhanced
            title={t('pages.prospects.error_title')}
            message={t('pages.prospects.error_message')}
            error={error}
            onRetry={() => refetch()}
            variant="default"
          />
        )}

        {!isPending && !isError && filteredItems.length === 0 && !searchTerm && (
          <EmptyStateEnhanced
            icon={Users}
            title={t('pages.prospects.no_prospects')}
            description={t('pages.prospects.no_prospects_desc')}
            actionLabel={t('pages.prospects.new_prospect')}
            onAction={() => setIsDialogOpen(true)}
            secondaryActionLabel={t('pages.prospects.import_csv')}
            onSecondaryAction={() => window.location.href='/campaigns?tab=import'}
            variant="centered"
          />
        )}

        {!isPending && !isError && filteredItems.length === 0 && searchTerm && (
          <EmptyStateEnhanced
            icon={Search}
            title={t('pages.prospects.no_results')}
            description={t('pages.prospects.no_results_desc', { searchTerm })}
            actionLabel={t('pages.prospects.reset_search')}
            onAction={() => setSearchTerm("")}
            variant="centered"
          />
        )}

        {!isPending && !isError && filteredItems.length > 0 && (
          <>
            {view === "kanban" ? (
              <UniversalKanban 
                items={filteredItems}
                columns={columns}
                onStatusChange={(id: string | number, status: string) => {
                  updateStatusMutation.mutate({ prospectId: Number(id), status: status as "new" | "contacted" | "qualified" | "converted" | "lost" });
                  toast.success(t('pages.prospects.moved_to', { status: columns.find(c => c.id === status)?.title || status }));
                }}
                onCall={handleCall}
                onSms={handleSms}
                onAction={(action: string, id: string | number) => {
                  toast.info(`Action ${action} sur le prospect ${id}`);
                }}
              />
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-semibold">{t('pages.prospects.table.name')}</th>
                      <th className="px-4 py-3 font-semibold">{t('pages.prospects.table.company')}</th>
                      <th className="px-4 py-3 font-semibold">{t('pages.prospects.table.email')}</th>
                      <th className="px-4 py-3 font-semibold">{t('pages.prospects.table.status')}</th>
                      <th className="px-4 py-3 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item: any) => (
                      <tr key={item.id as string} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.title as string}</div>
                          {item.phone && (
                            <div className="text-xs text-muted-foreground mt-0.5">{item.phone as string}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">{item.company as string}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{item.email as string}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${columns.find(c => c.id === item.status)?.color || 'bg-slate-500'}`}>
                            {columns.find(c => c.id === item.status)?.title || (item.status as string)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {item.phone ? (
                              <>
                                <button
                                  title={`Appeler ${item.title as string}`}
                                  onClick={() => handleCall(item)}
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm border border-primary/20"
                                >
                                  <PhoneCall className="w-4 h-4" />
                                </button>
                                <button
                                  title={`SMS à ${item.title as string}`}
                                  onClick={() => handleSms(item)}
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-green-500/5 text-green-600 hover:bg-green-500 hover:text-white transition-all shadow-sm border border-green-500/20"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Pas de tél.</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination 
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </div>
    </div>
  );
}
