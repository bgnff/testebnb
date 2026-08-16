import { useState } from 'react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Switch } from '@/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert';
import { Check, X, AlertCircle, Info, Loader2, Star, Plus, Trash2, Search, Filter } from 'lucide-react';

export default function Styleguide() {
  const [switchState, setSwitchState] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex-1 overflow-auto scrollbar-thin">
      <div className="px-6 py-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Design System - BnBweb</h1>
          <p className="text-muted-foreground">Identidade visual: Azul (primary), Preto (fundo), Branco (texto)</p>
        </div>

        <Tabs defaultValue="colors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="colors">Cores</TabsTrigger>
            <TabsTrigger value="typography">Tipografia</TabsTrigger>
            <TabsTrigger value="buttons">Botões</TabsTrigger>
            <TabsTrigger value="forms">Formulários</TabsTrigger>
            <TabsTrigger value="components">Componentes</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          {/* Colors */}
          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paleta de Cores</CardTitle>
                <CardDescription>Cores primárias e secundárias da marca BnBweb</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Primary (Azul BnBweb)</h3>
                  <div className="flex gap-2 flex-wrap">
                    {['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'].map((shade) => (
                      <div key={shade} className="flex flex-col items-center gap-1">
                        <div className={`w-16 h-16 rounded-lg bg-primary-${shade} border border-border`} />
                        <span className="text-xs text-muted-foreground">{shade}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Semantic Colors</h3>
                  <div className="flex gap-2 flex-wrap">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-16 h-16 rounded-lg bg-background border border-border" />
                      <span className="text-xs text-muted-foreground">background</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-16 h-16 rounded-lg bg-foreground border border-border" />
                      <span className="text-xs text-muted-foreground">foreground</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-16 h-16 rounded-lg bg-card border border-border" />
                      <span className="text-xs text-muted-foreground">card</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-16 h-16 rounded-lg bg-muted border border-border" />
                      <span className="text-xs text-muted-foreground">muted</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-16 h-16 rounded-lg bg-accent border border-border" />
                      <span className="text-xs text-muted-foreground">accent</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-16 h-16 rounded-lg bg-destructive border border-border" />
                      <span className="text-xs text-muted-foreground">destructive</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography */}
          <TabsContent value="typography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tipografia</CardTitle>
                <CardDescription>Fontes e tamanhos de texto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">text-xs</p>
                  <p className="text-sm text-muted-foreground">text-sm</p>
                  <p className="text-base text-muted-foreground">text-base (default)</p>
                  <p className="text-lg text-muted-foreground">text-lg</p>
                  <p className="text-xl text-muted-foreground">text-xl</p>
                  <p className="text-2xl text-muted-foreground">text-2xl</p>
                  <p className="text-3xl text-muted-foreground">text-3xl</p>
                  <p className="text-4xl text-muted-foreground">text-4xl</p>
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <p className="font-heading text-lg">Font Heading</p>
                  <p className="font-body text-lg">Font Body</p>
                  <p className="font-display text-lg">Font Display</p>
                  <p className="font-mono text-lg">Font Mono</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buttons */}
          <TabsContent value="buttons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Botões</CardTitle>
                <CardDescription>Variações de botões e estados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Primary</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button>Default</Button>
                    <Button disabled>Disabled</Button>
                    <Button size="sm">Small</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Secondary</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="secondary" disabled>Disabled</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Outline</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline">Outline</Button>
                    <Button variant="outline" disabled>Disabled</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Ghost</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="ghost" disabled>Disabled</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Destructive</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="destructive" disabled>Disabled</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">With Icons</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button><Plus className="w-4 h-4 mr-2" /> Adicionar</Button>
                    <Button variant="outline"><Search className="w-4 h-4 mr-2" /> Buscar</Button>
                    <Button variant="destructive"><Trash2 className="w-4 h-4 mr-2" /> Excluir</Button>
                    <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filtros</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Loading</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button disabled><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Carregando...</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms */}
          <TabsContent value="forms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Formulários</CardTitle>
                <CardDescription>Inputs, selects e controles de formulário</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" placeholder="Digite seu nome" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="select">Selecione uma opção</Label>
                  <Select>
                    <SelectTrigger id="select">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Opção 1</SelectItem>
                      <SelectItem value="2">Opção 2</SelectItem>
                      <SelectItem value="3">Opção 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="notifications" checked={switchState} onCheckedChange={setSwitchState} />
                  <Label htmlFor="notifications">Notificações</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components */}
          <TabsContent value="components" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Componentes</CardTitle>
                <CardDescription>Cards, badges, dialogs e tabs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Badges</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge className="bg-primary">Primary</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Card</h3>
                  <Card className="max-w-sm">
                    <CardHeader>
                      <CardTitle>Título do Card</CardTitle>
                      <CardDescription>Descrição do card com informações adicionais</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Conteúdo do card com texto e informações relevantes.</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Ação</Button>
                    </CardFooter>
                  </Card>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Dialog</h3>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Abrir Dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Título do Dialog</DialogTitle>
                        <DialogDescription>
                          Descrição do dialog com informações importantes para o usuário.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <p>Conteúdo do dialog com informações e ações.</p>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={() => setDialogOpen(false)}>Confirmar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Tabs</h3>
                  <Tabs defaultValue="tab1" className="w-full">
                    <TabsList>
                      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                      <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                      <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1">
                      <p className="text-sm text-muted-foreground">Conteúdo da Tab 1</p>
                    </TabsContent>
                    <TabsContent value="tab2">
                      <p className="text-sm text-muted-foreground">Conteúdo da Tab 2</p>
                    </TabsContent>
                    <TabsContent value="tab3">
                      <p className="text-sm text-muted-foreground">Conteúdo da Tab 3</p>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback */}
          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback</CardTitle>
                <CardDescription>Alerts e mensagens de feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Informação</AlertTitle>
                  <AlertDescription>Mensagem informativa para o usuário.</AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>Mensagem de erro ou aviso importante.</AlertDescription>
                </Alert>
                <Alert className="border-primary">
                  <Check className="h-4 w-4 text-primary" />
                  <AlertTitle>Sucesso</AlertTitle>
                  <AlertDescription>Operação realizada com sucesso.</AlertDescription>
                </Alert>
                <Alert className="border-yellow-500">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <AlertTitle>Aviso</AlertTitle>
                  <AlertDescription>Mensagem de aviso ou atenção.</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
