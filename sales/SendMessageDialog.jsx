import { useState, useEffect, useCallback } from 'react';
import { messageTemplatesApi } from '@/lib/api/message-templates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Mail, MessageCircle, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/ui/use-toast';

const TYPE_LABELS = {
  cobranca: 'Cobrança',
  upgrade: 'Upgrade de plano',
  reuniao: 'Reunião',
  outro: 'Outro',
};

function fillVariables(text, client) {
  if (!text) return '';
  return text
    .replaceAll('{nome}', client.name || '')
    .replaceAll('{empresa}', client.company || '')
    .replaceAll('{plano}', client.plan || '')
    .replaceAll('{email}', client.email || '')
    .replaceAll('{telefone}', client.phone || '');
}

export default function SendMessageDialog({ client, mode, onClose }) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(mode === 'whatsapp' ? 'reuniao' : 'cobranca');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const list = await messageTemplatesApi.list();
      setTemplates(list);
    } catch {
      toast({ title: 'Erro ao carregar modelos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  const templatesOfType = templates.filter((t) => t.type === selectedType);

  const applyTemplate = (tpl) => {
    setSubject(fillVariables(tpl.subject || '', client));
    setBody(fillVariables(tpl.body || '', client));
  };

  useEffect(() => {
    if (!loading && templatesOfType.length > 0) {
      applyTemplate(templatesOfType[0]);
    }
  }, [loading, selectedType]);

  const openEmail = () => {
    if (!client.email) {
      toast({ title: 'E-mail do cliente não informado', variant: 'destructive' });
      return;
    }
    const subj = encodeURIComponent(subject || 'Contato');
    const bdy = encodeURIComponent(body || '');
    const url = `mailto:${client.email}?subject=${subj}&body=${bdy}`;
    console.log('Opening email:', url);
    window.location.href = url;
    toast({ title: 'Abrindo seu app de e-mail...' });
  };

  const openWhatsApp = () => {
    let num = (client.whatsapp || '').replace(/\D/g, '');
    if (!num || num.length < 10) {
      toast({ title: 'Número de WhatsApp inválido', variant: 'destructive' });
      return;
    }
    // Adiciona código do país Brasil se não tiver
    if (num.length === 10 || num.length === 11) {
      num = '55' + num;
    }
    const msg = encodeURIComponent(body || '');
    const url = `https://wa.me/${num}?text=${msg}`;
    console.log('Opening WhatsApp:', url);
    window.open(url, '_blank');
    toast({ title: 'Abrindo WhatsApp...' });
  };

  const send = mode === 'email' ? openEmail : openWhatsApp;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'email' ? <Mail className="w-4 h-4 text-primary" /> : <MessageCircle className="w-4 h-4 text-[#25D366]" />}
            {mode === 'email' ? 'Enviar e-mail' : 'Enviar WhatsApp'} — {client.name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Tipo de mensagem</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {templatesOfType.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-4 text-center">
                <p className="text-sm text-muted-foreground">Nenhum modelo para este tipo.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Crie modelos em "Modelos de mensagem".</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Modelo pronto</Label>
                <Select onValueChange={(title) => {
                  const tpl = templatesOfType.find((t) => t.title === title);
                  if (tpl) applyTemplate(tpl);
                }}>
                  <SelectTrigger><SelectValue placeholder="Escolha um modelo..." /></SelectTrigger>
                  <SelectContent>
                    {templatesOfType.map((t) => (
                      <SelectItem key={t.id} value={t.title}>{t.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {mode === 'email' && (
              <div className="space-y-1.5">
                <Label>Assunto</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Assunto do e-mail" />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Mensagem {mode === 'email' ? '(editável antes de enviar)' : '(editável antes de enviar)'}</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={7} placeholder="Escreva ou escolha um modelo..." />
              <p className="text-xs text-muted-foreground/70">Variáveis: {`{nome}`}, {`{empresa}`}, {`{plano}`}, {`{email}`}, {`{telefone}`}</p>
            </div>

            <div className="rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground">
              {mode === 'email' ? (
                <>Enviar para: <span className="font-medium text-foreground">{client.email || '—'}</span></>
              ) : (
                <>Enviar para: <span className="font-medium text-foreground">{client.whatsapp || '—'}</span></>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={send}
            disabled={loading || !body.trim() || (mode === 'email' ? !client.email : !client.whatsapp)}
            className={mode === 'whatsapp' ? 'bg-[#25D366] hover:bg-[#1ebe57] text-white' : ''}
          >
            <ExternalLink className="w-4 h-4 mr-1.5" />
            {mode === 'email' ? 'Abrir no e-mail' : 'Abrir no WhatsApp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}