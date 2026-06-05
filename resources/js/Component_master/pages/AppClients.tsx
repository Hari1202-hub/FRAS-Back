import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BASEURL, TOKEN } from "../../app";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  RotateCcw,
  Trash2,
  Copy,
  CheckCheck,
  Search,
  RefreshCw,
  ShieldCheck,
  Activity,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

const V2 = BASEURL + "v2/";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppClient {
  uuid: string;
  name: string;
  client_id: string;
  is_active: boolean;
  has_active_token: boolean;
  token_expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

interface AccessLog {
  id: number;
  client_id: string;
  client_name: string;
  endpoint: string;
  method: string;
  ip_address: string;
  user_agent: string;
  response_status: number;
  created_at: string;
}

interface PaginatedLogs {
  data: AccessLog[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page: string | null;
    prev_page: string | null;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const authHeaders = () => ({
  Authorization: `Bearer ${TOKEN()}`,
});

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="ml-2 text-gray-500 hover:text-gray-800">
      {copied ? <CheckCheck className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function SecretRevealDialog({
  open,
  clientId,
  secret,
  onClose,
}: {
  open: boolean;
  clientId: string;
  secret: string;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) setVisible(false);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            Save Your Credentials
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-3">
            This is the only time the secret will be shown. Copy it now — it cannot be retrieved later.
          </p>

          <div className="space-y-2">
            <Label className="text-xs text-gray-500">Client ID</Label>
            <div className="flex items-center bg-gray-50 border rounded-md px-3 py-2 text-sm font-mono">
              <span className="flex-1 truncate">{clientId}</span>
              <CopyButton value={clientId} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-gray-500">Client Secret</Label>
            <div className="flex items-center bg-gray-50 border rounded-md px-3 py-2 text-sm font-mono">
              <span className="flex-1 truncate">
                {visible ? secret : "•".repeat(Math.min(secret.length, 40))}
              </span>
              <button
                onClick={() => setVisible((v) => !v)}
                className="ml-2 text-gray-500 hover:text-gray-800"
              >
                {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <CopyButton value={secret} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="bg-green-600 hover:bg-green-700 w-full">
            I have saved the secret
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Clients Tab ──────────────────────────────────────────────────────────────

function ClientsTab() {
  const [clients, setClients] = useState<AppClient[]>([]);
  const [loading, setLoading] = useState(false);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newClientId, setNewClientId] = useState("");
  const [creating, setCreating] = useState(false);

  // Secret reveal dialog
  const [secretDialog, setSecretDialog] = useState<{
    open: boolean;
    clientId: string;
    secret: string;
  }>({ open: false, clientId: "", secret: "" });

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<AppClient | null>(null);

  // Toggle status target
  const [togglingUuid, setTogglingUuid] = useState<string | null>(null);

  // Rotate target
  const [rotatingUuid, setRotatingUuid] = useState<string | null>(null);

  const fetchClients = useCallback(() => {
    setLoading(true);
    axios
      .get(V2 + "app/clients", { headers: authHeaders() })
      .then((r) => setClients(r.data.data ?? []))
      .catch(() => toast.error("Failed to load app clients."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCreate = () => {
    if (!newName.trim() || !newClientId.trim()) {
      toast.error("Name and Client ID are required.");
      return;
    }
    setCreating(true);
    axios
      .post(
        V2 + "app/clients",
        { name: newName.trim(), client_id: newClientId.trim() },
        { headers: authHeaders() }
      )
      .then((r) => {
        const { client_id, client_secret } = r.data.data;
        setCreateOpen(false);
        setNewName("");
        setNewClientId("");
        fetchClients();
        setSecretDialog({ open: true, clientId: client_id, secret: client_secret });
        toast.success("App client registered.");
      })
      .catch((e) => {
        const msg = e.response?.data?.errors
          ? Object.values(e.response.data.errors).flat().join(" ")
          : "Failed to create client.";
        toast.error(msg);
      })
      .finally(() => setCreating(false));
  };

  const handleToggleStatus = (client: AppClient) => {
    setTogglingUuid(client.uuid);
    axios
      .put(
        V2 + `app/clients/${client.uuid}`,
        { is_active: !client.is_active },
        { headers: authHeaders() }
      )
      .then(() => {
        fetchClients();
        toast.success(`Client ${client.is_active ? "deactivated" : "activated"}.`);
      })
      .catch(() => toast.error("Failed to update status."))
      .finally(() => setTogglingUuid(null));
  };

  const handleRotate = (client: AppClient) => {
    setRotatingUuid(client.uuid);
    axios
      .post(V2 + `app/clients/${client.uuid}/rotate-secret`, {}, { headers: authHeaders() })
      .then((r) => {
        const { client_id, client_secret } = r.data.data;
        fetchClients();
        setSecretDialog({ open: true, clientId: client_id, secret: client_secret });
        toast.success("Secret rotated. Existing token revoked.");
      })
      .catch(() => toast.error("Failed to rotate secret."))
      .finally(() => setRotatingUuid(null));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    axios
      .delete(V2 + `app/clients/${deleteTarget.uuid}`, { headers: authHeaders() })
      .then(() => {
        fetchClients();
        toast.success("App client deleted.");
      })
      .catch(() => toast.error("Failed to delete client."))
      .finally(() => setDeleteTarget(null));
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">
          Manage machine-to-machine credentials for the Python FRAS service and other integrations.
        </p>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-proscape hover:bg-proscape-dark"
        >
          <Plus className="h-4 w-4 mr-2" />
          Register Client
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex justify-end p-3 border-b bg-gray-50">
          <Button variant="outline" size="sm" onClick={fetchClients} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Expires At</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                    {loading ? "Loading…" : "No app clients registered yet."}
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((c) => (
                  <TableRow key={c.uuid}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center font-mono text-xs text-gray-600">
                        {c.client_id}
                        <CopyButton value={c.client_id} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          c.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {c.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          c.has_active_token
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {c.has_active_token ? "Issued" : "None"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {fmtDate(c.token_expires_at)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {fmtDate(c.last_used_at)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {fmtDate(c.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                disabled={togglingUuid === c.uuid}
                                onClick={() => handleToggleStatus(c)}
                              >
                                <Activity className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {c.is_active ? "Deactivate" : "Activate"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
                                disabled={rotatingUuid === c.uuid}
                                onClick={() => handleRotate(c)}
                              >
                                <RotateCcw
                                  className={`h-4 w-4 ${rotatingUuid === c.uuid ? "animate-spin" : ""}`}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Rotate Secret</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                onClick={() => setDeleteTarget(c)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register New App Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="c-name">Name</Label>
              <Input
                id="c-name"
                placeholder="e.g. Python FRAS Service"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="c-id">Client ID</Label>
              <Input
                id="c-id"
                placeholder="e.g. fras-python-v1"
                value={newClientId}
                onChange={(e) => setNewClientId(e.target.value)}
              />
              <p className="text-xs text-gray-400">
                Unique machine-readable identifier — no spaces.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="bg-proscape hover:bg-proscape-dark"
            >
              {creating ? "Creating…" : "Register"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Secret Reveal Dialog */}
      <SecretRevealDialog
        open={secretDialog.open}
        clientId={secretDialog.clientId}
        secret={secretDialog.secret}
        onClose={() => setSecretDialog({ open: false, clientId: "", secret: "" })}
      />

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete App Client</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong> and revoke all
              tokens. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Logs Tab ─────────────────────────────────────────────────────────────────

function LogsTab() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [meta, setMeta] = useState<PaginatedLogs["meta"] | null>(null);
  const [loading, setLoading] = useState(false);

  const [clientFilter, setClientFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(
    (p = 1) => {
      setLoading(true);
      const params: Record<string, string> = { per_page: "50", page: String(p) };
      if (clientFilter.trim()) params.client_id = clientFilter.trim();
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      axios
        .get(V2 + "app/logs", { headers: authHeaders(), params })
        .then((r) => {
          setLogs(r.data.data ?? []);
          setMeta(r.data.meta ?? null);
          setPage(p);
        })
        .catch(() => toast.error("Failed to load access logs."))
        .finally(() => setLoading(false));
    },
    [clientFilter, fromDate, toDate]
  );

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handleSearch = () => fetchLogs(1);
  const handleClear = () => {
    setClientFilter("");
    setFromDate("");
    setToDate("");
    setTimeout(() => fetchLogs(1), 0);
  };

  const methodBadgeClass = (method: string) => {
    const m = method.toUpperCase();
    if (m === "GET")    return "bg-blue-100 text-blue-800";
    if (m === "POST")   return "bg-green-100 text-green-800";
    if (m === "DELETE") return "bg-red-100 text-red-700";
    if (m === "PUT")    return "bg-amber-100 text-amber-800";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <>
      {/* Filters */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Client ID</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                className="pl-8"
                placeholder="Filter by client_id"
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">From Date</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To Date</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              className="flex-1 bg-proscape hover:bg-proscape-dark"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex justify-between items-center p-3 border-b bg-gray-50">
          <span className="text-sm text-gray-500">
            {meta ? `${meta.total} total requests` : ""}
          </span>
          <Button variant="outline" size="sm" onClick={() => fetchLogs(page)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    {loading ? "Loading…" : "No access logs found."}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{log.client_name}</div>
                      <div className="text-xs text-gray-400 font-mono">{log.client_id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={methodBadgeClass(log.method)}>
                        {log.method.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-700">
                      /{log.endpoint}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {log.ip_address ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          log.response_status < 300
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {log.response_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {fmtDate(log.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-600">
              Page {meta.current_page} of {meta.last_page}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page === 1}
                onClick={() => fetchLogs(meta.current_page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page === meta.last_page}
                onClick={() => fetchLogs(meta.current_page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const AppClients = () => (
  <div className="space-y-6">
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">App Client Management</h1>
      <p className="text-sm text-gray-500 mb-4">
        Issue and manage API credentials for external services using app-token authentication.
      </p>
    </div>

    <Tabs defaultValue="clients" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="clients" className="flex items-center gap-1">
          <ShieldCheck className="h-4 w-4" />
          App Clients
        </TabsTrigger>
        <TabsTrigger value="logs" className="flex items-center gap-1">
          <Activity className="h-4 w-4" />
          Access Logs
        </TabsTrigger>
      </TabsList>

      <TabsContent value="clients">
        <ClientsTab />
      </TabsContent>

      <TabsContent value="logs">
        <LogsTab />
      </TabsContent>
    </Tabs>
  </div>
);

export default AppClients;
