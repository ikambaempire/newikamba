import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, MessageCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["impact_audit_leads"]["Row"];

const LeadManager = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("impact_audit_leads").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Could not load audit leads");
    if (data) setLeads(data);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("impact_audit_leads").update({ status }).eq("id", id);
    if (error) {
      toast.error("Could not update lead status");
      return;
    }
    setLeads((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Impact Story Audit Leads</h2>
          <p className="text-sm text-muted-foreground">New lead capture submissions from the website.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLeads}><RefreshCw size={14} /> Refresh</Button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No audit requests yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs">Name</TableHead>
                <TableHead className="text-muted-foreground text-xs">Organization</TableHead>
                <TableHead className="text-muted-foreground text-xs">Contact</TableHead>
                <TableHead className="text-muted-foreground text-xs">Source</TableHead>
                <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                <TableHead className="text-muted-foreground text-xs">Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id} className="border-border hover:bg-muted/30">
                  <TableCell className="font-medium text-foreground text-sm">{lead.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{lead.organization || "—"}</TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <a href={`mailto:${lead.email}`} className="text-foreground hover:text-accent inline-flex items-center gap-1"><Mail size={13} /> {lead.email}</a>
                      {lead.whatsapp && <p className="text-muted-foreground inline-flex items-center gap-1"><MessageCircle size={13} /> {lead.whatsapp}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs capitalize">{lead.source}</TableCell>
                  <TableCell>
                    <Select value={lead.status} onValueChange={(status) => updateStatus(lead.id, status)}>
                      <SelectTrigger className="h-8 w-[130px] text-xs bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default LeadManager;
