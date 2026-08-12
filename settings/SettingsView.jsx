import { useState, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from 'next-themes';
import { useToast } from '@/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Switch } from '@/ui/switch';
import { Moon, Sun, Upload, Bell, MessageCircle, Mail } from 'lucide-react';

const TIMEZONES = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Kolkata', 'Australia/Sydney', 'America/Sao_Paulo', 'America/Manaus', 'America/Fortaleza'];

export default function SettingsView() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [name, setName] = useState(user?.full_name || '');
  const [timezone, setTimezone] = useState(localStorage.getItem('user_timezone') || 'America/Sao_Paulo');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      setAvatar(publicUrl);
    } catch (error) {
      toast({ title: 'Erro ao fazer upload', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name, avatar_url: avatar }
      });
      
      if (error) throw error;
      
      localStorage.setItem('user_timezone', timezone);
      toast({ title: 'Perfil salvo' });
    } catch (e) {
      toast({ title: 'Não foi possível salvar o perfil', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto scrollbar-thin">
      <div className="px-6 py-6 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-semibold mb-1">Configurações</h1>
        <p className="text-sm text-muted-foreground mb-6">Gerencie seu perfil e preferências</p>

        <section className="bg-card rounded-2xl border border-border p-5 mb-4">
          <h2 className="text-sm font-semibold mb-4">Perfil</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xl font-semibold overflow-hidden">
                {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : (name || 'U').charAt(0).toUpperCase()}
              </div>
              <button onClick={() => fileRef.current?.click()} disabled={uploading} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                <Upload className="w-3.5 h-3.5" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{user?.email}</p>
              <p>Envie uma foto de perfil</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nome completo</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Fuso horário</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz.replace(/_/g, ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="mt-4" onClick={saveProfile} disabled={saving}>{saving ? 'Salvando...' : 'Salvar perfil'}</Button>
        </section>

        <section className="bg-card rounded-2xl border border-border p-5 mb-4">
          <h2 className="text-sm font-semibold mb-4">Aparência</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-sm font-medium">Tema</p>
                <p className="text-xs text-muted-foreground">Alterne entre modo claro e escuro</p>
              </div>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')} />
          </div>
        </section>

        <section className="bg-card rounded-2xl border border-border p-5 mb-4">
          <h2 className="text-sm font-semibold mb-4">Notificações</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"><Bell className="w-4 h-4" /></div>
                <div><p className="text-sm font-medium">Lembretes no app</p><p className="text-xs text-muted-foreground">Alertas de vencimento e atraso</p></div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"><Mail className="w-4 h-4" /></div>
                <div><p className="text-sm font-medium">Lembretes por e-mail</p><p className="text-xs text-muted-foreground">Integração futura</p></div>
              </div>
              <Switch disabled />
            </div>
            <div className="flex items-center justify-between opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"><MessageCircle className="w-4 h-4" /></div>
                <div><p className="text-sm font-medium">Lembretes por WhatsApp</p><p className="text-xs text-muted-foreground">Integração futura</p></div>
              </div>
              <Switch disabled />
            </div>
          </div>
        </section>

        <section className="bg-card rounded-2xl border border-border p-5">
          <h2 className="text-sm font-semibold mb-2">Conta</h2>
          <p className="text-xs text-muted-foreground mb-3">Exporte suas tarefas como CSV na página de Tarefas, ou saia abaixo.</p>
          <Button variant="outline" onClick={() => logout()}>Sair</Button>
        </section>
      </div>
    </div>
  );
}