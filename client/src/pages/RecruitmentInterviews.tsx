import { useState } from "react";

import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { normalizeInterview, normalizeInterviews } from "../utils/normalizers/recruitment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../components/ui/table";
import {
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  Filter,
  Plus,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Interview, InterviewStats } from "../../../shared/types/recruitment";
import { RouterOutputs, RouterInputs } from "../lib/trpc";

type ListInterviewsOutput = RouterOutputs['recruitment']['listInterviews'];
type GetStatsOutput = RouterOutputs['recruitment']['getStats'];
type CreateInterviewInput = RouterInputs['recruitment']['createInterview'];
type StartInterviewInput = RouterInputs['recruitment']['startInterview'];
type GenerateReportInput = RouterInputs['recruitment']['generateReport'];
type UpdateEmployerDecisionInput = RouterInputs['recruitment']['updateEmployerDecision'];





interface CreateInterviewFormProps {
  onSuccess: () => void;
}

// Définir le composant CreateInterviewForm pour éviter les erreurs de type
const CreateInterviewForm: React.FC<CreateInterviewFormProps> = ({ onSuccess }) => {
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [businessType, setBusinessType] = useState("");

  const createInterviewMutation = trpc.recruitment.createInterview.useMutation({
    onSuccess: () => {
      toast.success("Entretien créé avec succès");
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Impossible de créer l'entretien");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInterviewMutation.mutate({
      candidateName,
      candidateEmail,
      candidatePhone,
      jobPosition: jobTitle,
      scheduledAt: interviewDate,
      businessType,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="candidateName">Nom du candidat</Label>
        <Input id="candidateName" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="candidateEmail">Email du candidat</Label>
        <Input id="candidateEmail" type="email" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="candidatePhone">Téléphone du candidat</Label>
        <Input id="candidatePhone" value={candidatePhone} onChange={(e) => setCandidatePhone(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="jobTitle">Titre du poste</Label>
        <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="interviewDate">Date de l'entretien</Label>
        <Input type="datetime-local" id="interviewDate" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="businessType">Type de métier</Label>
        <Select value={businessType} onValueChange={setBusinessType}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un type de métier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="medical_secretary">Secrétaire médical</SelectItem>
            <SelectItem value="restaurant_server">Serveur restaurant</SelectItem>
            <SelectItem value="hotel_receptionist">Réceptionniste hôtel</SelectItem>
            <SelectItem value="sales_representative">Commercial</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={createInterviewMutation.isPending}>Créer</Button>
    </form>
  );
};

export default function RecruitmentInterviews() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>("all");
  const [currentPage, _setCurrentPage] = useState(1);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Récupérer les entretiens avec filtres
  const { data: interviewsData, isLoading, refetch } = trpc.recruitment.listInterviews.useQuery({
    page: currentPage,
    limit: 20,
    status: selectedStatus !== "all" ? selectedStatus as Interview['status'] : undefined,
    businessType: selectedBusinessType !== "all" ? selectedBusinessType : undefined,
  });

  // Récupérer les statistiques
  const { data: statsData } = trpc.recruitment.getStats.useQuery({
    businessType: selectedBusinessType !== "all" ? selectedBusinessType : undefined,
  });

  // Mutation pour démarrer un entretien
  const startInterviewMutation = trpc.recruitment.startInterview.useMutation({
    onSuccess: () => {
      toast.success("Entretien IA démarré avec succès");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Impossible de démarrer l'entretien");
    },
  });

  // Mutation pour générer un rapport
  const generateReportMutation = trpc.recruitment.generateReport.useMutation({
    onSuccess: () => {
      toast.success("Rapport généré avec succès");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Impossible de générer le rapport");
    },
  });

  // Mutation pour mettre à jour la décision
  const updateDecisionMutation = trpc.recruitment.updateEmployerDecision.useMutation({
    onSuccess: () => {
      toast.success("Décision enregistrée");
      refetch();
      setSelectedInterview(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Impossible d'enregistrer la décision");
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
      pending: { variant: "secondary", label: "En attente", icon: Clock },
      scheduled: { variant: "default", label: "Planifié", icon: Calendar },
      in_progress: { variant: "default", label: "En cours", icon: Phone },
      completed: { variant: "default", label: "Terminé", icon: CheckCircle },
      reviewed: { variant: "default", label: "Examiné", icon: Eye },
      shortlisted: { variant: "default", label: "Présélectionné", icon: TrendingUp },
      rejected: { variant: "destructive", label: "Rejeté", icon: XCircle },
      cancelled: { variant: "secondary", label: "Annulé", icon: XCircle },
    };

    const config = variants[status] || variants["pending"];
    const Icon = config!.icon;

    return (
      <Badge variant={config!.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config!.label}
      </Badge>
    );
  };

  const getRecommendationBadge = (recommendation: string) => {
    if (recommendation === "hire") {
      return <Badge variant="default" className="bg-green-600">Recommandé</Badge>;
    } else if (recommendation === "reject") {
      return <Badge variant="destructive">Non recommandé</Badge>;
    } else {
      return <Badge variant="secondary">À évaluer</Badge>;
    }
  };

  // ✅ Bloc 3 & 4: Normalisation et Validation Runtime
  const interviews: Interview[] = interviewsData?.data ? normalizeInterviews(interviewsData.data) : [];
  const stats: GetStatsOutput = statsData || { total: 0, pending: 0, scheduled: 0, in_progress: 0, completed: 0, reviewed: 0, shortlisted: 0, rejected: 0, cancelled: 0 };

  return (
    <div className="container mx-auto p-6 space-y-6" data-main-content>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Entretiens de Recrutement IA</h1>
          <p className="text-muted-foreground">
            Gérez vos entretiens automatisés et consultez les analyses comportementales
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel entretien
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un entretien candidat</DialogTitle>
              <DialogDescription>
                Planifiez un nouvel entretien IA pour un candidat
              </DialogDescription>
            </DialogHeader>
            <CreateInterviewForm onSuccess={() => {
              setShowCreateDialog(false);
              refetch();
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Présélectionnés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.shortlisted || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageScore ? `${stats.averageScore.toFixed(1)}/10` : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Label>Statut</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="scheduled">Planifié</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="reviewed">Examiné</SelectItem>
                <SelectItem value="shortlisted">Présélectionné</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label>Type de métier</Label>
            <Select value={selectedBusinessType} onValueChange={setSelectedBusinessType}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les métiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les métiers</SelectItem>
                <SelectItem value="medical_secretary">Secrétaire médical</SelectItem>
                <SelectItem value="restaurant_server">Serveur restaurant</SelectItem>
                <SelectItem value="hotel_receptionist">Réceptionniste hôtel</SelectItem>
                <SelectItem value="sales_representative">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des entretiens */}
      <Card>
        <CardHeader>
          <CardTitle>Entretiens</CardTitle>
          <CardDescription>
            {interviews?.length || 0} entretiens trouvés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement des entretiens...</div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun entretien trouvé avec les filtres actuels.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidat</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score IA</TableHead>
                  <TableHead>Recommandation IA</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((interview) => (
                  <TableRow key={interview.id}>
                    <TableCell className="font-medium">{interview.candidateName}</TableCell>
                    <TableCell>{interview.jobTitle}</TableCell>
                    <TableCell>{getStatusBadge(interview.status)}</TableCell>
                    <TableCell>{format(new Date(interview.interviewDate), "dd/MM/yyyy HH:mm", { locale: fr })}</TableCell>
                    <TableCell>{interview.aiScore ? `${interview.aiScore.toFixed(1)}/10` : "N/A"}</TableCell>
                    <TableCell>{interview.aiRecommendation ? getRecommendationBadge(interview.aiRecommendation) : "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startInterviewMutation.mutate(interview.id)}
                          disabled={interview.status !== "pending" && interview.status !== "scheduled" || startInterviewMutation.isPending}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Démarrer
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateReportMutation.mutate(interview.id)}
                          disabled={interview.status !== "completed" && interview.status !== "reviewed" || generateReportMutation.isPending}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Rapport
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInterview(interview)}
                          disabled={interview.status !== "completed" && interview.status !== "reviewed"}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Décision
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de décision employeur */}
      {selectedInterview && (
        <Dialog open={!!selectedInterview} onOpenChange={() => setSelectedInterview(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Décision Employeur pour {selectedInterview.candidateName}</DialogTitle>
              <DialogDescription>
                Enregistrez votre décision finale concernant ce candidat.
              </DialogDescription>
            </DialogHeader>
            <EmployerDecisionForm 
              interview={selectedInterview} 
              onSuccess={() => {
                setSelectedInterview(null);
                refetch();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface EmployerDecisionFormProps {
  interview: Interview;
  onSuccess: () => void;
}

const EmployerDecisionForm: React.FC<EmployerDecisionFormProps> = ({
  interview,
  onSuccess,
}) => {
  const [decision, setDecision] = useState<string>(interview.employerDecision || "");
  const [notes, setNotes] = useState<string>(interview.employerNotes || "");

  const updateDecisionMutation = trpc.recruitment.updateEmployerDecision.useMutation({
    onSuccess: () => {
      toast.success("Décision enregistrée");
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Impossible d'enregistrer la décision");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDecisionMutation.mutate({
      id: interview.id,
      decision: decision as string,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="decision">Décision</Label>
        <Select value={decision} onValueChange={setDecision}>
          <SelectTrigger id="decision">
            <SelectValue placeholder="Sélectionnez une décision" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shortlisted">Présélectionné</SelectItem>
            <SelectItem value="rejected">Rejeté</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optionnel)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ajoutez des commentaires sur la décision..."
          rows={5}
        />
      </div>
      <Button type="submit" disabled={updateDecisionMutation.isPending}>Enregistrer la décision</Button>
    </form>
  );
};
