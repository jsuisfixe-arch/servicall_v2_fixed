import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface AIRoleForm {
  name: string;
  type: "agent" | "supervisor";
  systemPrompt: string;
  contextPrompt: string;
  responseGuidelines: string;
}

export default function AIRoleEditor() {
  const [, setLocation] = useLocation();
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<AIRoleForm>({
    name: "",
    type: "agent",
    systemPrompt: "",
    contextPrompt: "",
    responseGuidelines: "",
  });
  const [_isSaving, setIsSaving] = useState(false);

  const tenantId = 1; // Default tenant for demo

  // Queries — procédures ajoutées dans aiRouter.ts
  const rolesQuery = trpc.ai.listModels.useQuery({ tenantId });
  const roleDetailQuery = trpc.ai.getModel.useQuery(
    { tenantId, modelId: selectedRoleId ?? 0 },
    { enabled: !!selectedRoleId }
  );

  // Mutations
  const createRoleMutation = trpc.ai.createModel.useMutation({
    onSuccess: () => {
      toast.success("Rôle IA créé avec succès");
      setIsCreating(false);
      rolesQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erreur lors de la création : ${error.message}`);
    },
  });

  const updateRoleMutation = trpc.ai.updateModel.useMutation({
    onSuccess: () => {
      toast.success("Rôle IA mis à jour avec succès");
      setIsSaving(false);
      rolesQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erreur lors de la mise à jour : ${error.message}`);
    },
  });

  const deleteRoleMutation = trpc.ai.deleteModel.useMutation({
    onSuccess: () => {
      toast.success("Rôle IA supprimé");
      setSelectedRoleId(null);
      rolesQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erreur lors de la suppression : ${error.message}`);
    },
  });

  // Charger les données du rôle sélectionné
  useEffect(() => {
    if (roleDetailQuery.data) {
      const data = roleDetailQuery.data as Record<string, unknown>;
      setFormData({
        name: (data['name'] as string) || "",
        type: (data['type'] as "agent" | "supervisor") || "agent",
        systemPrompt: (data['systemPrompt'] as string) || "",
        contextPrompt: (data['contextPrompt'] as string) || "",
        responseGuidelines: (data['responseGuidelines'] as string) || "",
      });
    }
  }, [roleDetailQuery.data]);

  const handleCreateRole = async () => {
    if (!formData.name.trim()) {
      toast.error("Veuillez entrer un nom pour le rôle");
      return;
    }
    await createRoleMutation.mutateAsync({
      tenantId,
      ...formData,
    });
  };

  const handleUpdateRole = async () => {
    if (!selectedRoleId) {
      toast.error("Aucun rôle sélectionné");
      return;
    }

    setIsSaving(true);
    await updateRoleMutation.mutateAsync({
      tenantId,
      modelId: selectedRoleId,
      ...formData,
    });
  };

  const handleDeleteRole = async () => {
    if (!selectedRoleId) return;

    if (confirm("Êtes-vous sûr de vouloir supprimer ce rôle IA ?")) {
      await deleteRoleMutation.mutateAsync({
        tenantId,
        modelId: selectedRoleId,
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" data-main-content>
      <div>
        <Button variant="ghost" className="mb-2" onClick={() => setLocation("/dashboard")}>
          ← Retour
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6" />
          Éditeur de Rôles IA
        </h1>
        <p className="text-muted-foreground">
          Configurez les rôles et comportements de vos agents IA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des rôles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Rôles IA</span>
              <Button size="sm" onClick={() => { setIsCreating(true); setSelectedRoleId(null); }}>
                <Plus className="w-4 h-4 mr-1" />
                Nouveau
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rolesQuery.isPending ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : (
              <div className="space-y-2">
                {(rolesQuery.data?.roles ?? []).map((role) => {
                  const r = role as Record<string, unknown>;
                  return (
                    <div
                      key={r['id'] as number}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedRoleId === (r['id'] as number)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => { setSelectedRoleId(r['id'] as number); setIsCreating(false); }}
                    >
                      <p className="font-medium text-sm">{r['name'] as string}</p>
                      <p className="text-xs text-muted-foreground capitalize">{r['type'] as string}</p>
                    </div>
                  );
                })}
                {(rolesQuery.data?.roles ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun rôle IA configuré
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulaire d'édition */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {isCreating ? "Créer un rôle IA" : selectedRoleId ? "Modifier le rôle" : "Sélectionnez un rôle"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(isCreating || selectedRoleId) ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nom du rôle</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Agent commercial, Superviseur..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as "agent" | "supervisor" })}
                  >
                    <option value="agent">Agent</option>
                    <option value="supervisor">Superviseur</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Prompt système</label>
                  <Textarea
                    value={formData.systemPrompt}
                    onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                    placeholder="Instructions principales pour l'IA..."
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Prompt de contexte</label>
                  <Textarea
                    value={formData.contextPrompt}
                    onChange={(e) => setFormData({ ...formData, contextPrompt: e.target.value })}
                    placeholder="Contexte métier spécifique..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Directives de réponse</label>
                  <Textarea
                    value={formData.responseGuidelines}
                    onChange={(e) => setFormData({ ...formData, responseGuidelines: e.target.value })}
                    placeholder="Comment l'IA doit formuler ses réponses..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  {isCreating ? (
                    <Button
                      onClick={handleCreateRole}
                      disabled={createRoleMutation.isPending}
                    >
                      {createRoleMutation.isPending ? "Création..." : "Créer le rôle"}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleUpdateRole}
                        disabled={updateRoleMutation.isPending}
                      >
                        {updateRoleMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteRole}
                        disabled={deleteRoleMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => { setIsCreating(false); setSelectedRoleId(null); }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Sélectionnez un rôle dans la liste ou créez-en un nouveau.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
