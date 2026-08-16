import { useState } from 'react';
import { Button } from '@/ui/button';
import { Database, FileText, Download, Loader2, Cloud, Rocket } from 'lucide-react';

const SUPABASE_SCHEMA = `-- BnBWeb - Supabase Schema
-- Use the migration files in supabase/migrations/ to apply this schema
`;

const README = `BnBWeb - Sistema de Produtividade

Módulos:
- Kanban (Board/Column/Task)
- Vendas/CRM (Client/PipelineStage/PipelineCard)
- Calendário (CalendarNote)
- Notificações
- Dashboard
- Configurações

Tecnologias:
- React + Vite
- React Router
- Tailwind CSS
- shadcn/ui
- Supabase (Auth + Database + Storage)
`;

const NETLIFY_TOML = `[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

const NETLIFY_REDIRECTS = `/* /index.html 200`;

const NETLIFY_DEPLOY = `Deploy no Netlify - FlowState

1. Configure as variáveis de ambiente no Netlify:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

2. Build settings:
   - Build command: npm run build
   - Publish directory: dist

3. Coloque o arquivo _redirects na pasta public/ com o conteúdo:
   /* /index.html 200

4. Faça upload da pasta dist/ no Netlify
`;

function downloadText(filename, content, mime = 'text/plain') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function DownloadsView() {
  const [loading, setLoading] = useState(null);

  const handleDownloadSupabaseSchema = () => {
    setLoading('schema');
    setTimeout(() => {
      downloadText('flowstate-supabase-schema.sql', SUPABASE_SCHEMA, 'application/sql');
      setLoading(null);
    }, 500);
  };

  return (
    <div className="flex-1 overflow-auto scrollbar-thin">
      <div className="px-6 py-6 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-semibold mb-1">Downloads</h1>
        <p className="text-sm text-muted-foreground mb-6">Baixe esquemas do banco de dados, documentação e arquivos do sistema</p>

        <section className="bg-card rounded-2xl border border-border p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Esquema do Banco de Dados Supabase</h2>
              <p className="text-xs text-muted-foreground">Estrutura completa de tabelas para Supabase</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Arquivo SQL com todas as tabelas do sistema. Use os arquivos de migração em supabase/migrations/ para aplicar o schema.
          </p>
          <Button onClick={handleDownloadSupabaseSchema} disabled={loading === 'schema'}>
            {loading === 'schema' ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Download className="w-4 h-4 mr-1.5" />}
            Baixar esquema Supabase (.sql)
          </Button>
        </section>

        <section className="bg-card rounded-2xl border border-border p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Documentação do Sistema</h2>
              <p className="text-xs text-muted-foreground">README com descrição dos módulos e tecnologias</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => downloadText('README.txt', README)}>
            <Download className="w-4 h-4 mr-1.5" /> Baixar README (.txt)
          </Button>
        </section>

        <section className="bg-card rounded-2xl border-2 border-primary/30 p-5 mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-12 translate-x-12 pointer-events-none" />
          <div className="flex items-center gap-3 mb-4 relative">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                Upload Netlify
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary">Deploy</span>
              </h2>
              <p className="text-xs text-muted-foreground">Build do sistema completo pronto para o Netlify</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4 relative">
            Gere o build de produção com <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">npm run build</code> e faça upload da pasta <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">dist/</code> no Netlify.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 relative">
            <Button onClick={() => downloadText('netlify.toml', NETLIFY_TOML, 'application/toml')}>
              <Download className="w-4 h-4 mr-1.5" /> netlify.toml
            </Button>
            <Button variant="outline" onClick={() => downloadText('_redirects', NETLIFY_REDIRECTS)}>
              <Download className="w-4 h-4 mr-1.5" /> _redirects (SPA)
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
            <Button variant="outline" onClick={() => downloadText('DEPLOY-NETLIFY.txt', NETLIFY_DEPLOY)}>
              <FileText className="w-4 h-4 mr-1.5" /> Guia de deploy (.txt)
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                downloadText('netlify.toml', NETLIFY_TOML, 'application/toml');
                setTimeout(() => downloadText('_redirects', NETLIFY_REDIRECTS), 300);
                setTimeout(() => downloadText('DEPLOY-NETLIFY.txt', NETLIFY_DEPLOY), 600);
              }}
            >
              <Rocket className="w-4 h-4 mr-1.5" /> Baixar pacote completo
            </Button>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground relative">
            <p className="font-medium text-foreground mb-1">Passos rápidos:</p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>Coloque <code className="font-mono">_redirects</code> na pasta <code className="font-mono">public/</code> do projeto</li>
              <li>Coloque <code className="font-mono">netlify.toml</code> na raiz do projeto</li>
              <li>Rode <code className="font-mono">npm run build</code> e faça upload de <code className="font-mono">dist/</code> no Netlify</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
