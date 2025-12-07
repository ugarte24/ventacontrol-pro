import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCart } from '@/contexts/CartContext';
import { mockProducts, PaymentMethod } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  CreditCard, 
  QrCode,
  Banknote,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function NewSale() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('efectivo');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();

  const filteredProducts = mockProducts.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompleteSale = () => {
    if (items.length === 0) {
      toast.error('Agrega productos al carrito');
      return;
    }
    
    // In a real app, this would save to the database
    setShowSuccessDialog(true);
  };

  const handleNewSale = () => {
    clearCart();
    setShowSuccessDialog(false);
    toast.success('¡Listo para una nueva venta!');
  };

  const paymentMethods = [
    { id: 'efectivo' as PaymentMethod, label: 'Efectivo', icon: Banknote },
    { id: 'qr' as PaymentMethod, label: 'QR', icon: QrCode },
    { id: 'transferencia' as PaymentMethod, label: 'Transferencia', icon: CreditCard },
  ];

  return (
    <DashboardLayout title="Nueva Venta">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative animate-fade-in">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-10 text-base"
            />
          </div>

          {/* Products Grid */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product, index) => (
              <Card 
                key={product.id}
                className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/30 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => {
                  addItem(product);
                  toast.success(`${product.nombre} agregado`);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{product.nombre}</p>
                      <p className="text-sm text-muted-foreground">{product.codigo}</p>
                    </div>
                    <Badge 
                      variant={product.stock_actual <= product.stock_minimo ? 'destructive' : 'secondary'}
                      className="shrink-0"
                    >
                      {product.stock_actual}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-display text-lg font-bold text-primary">
                      Bs. {product.precio_venta.toFixed(2)}
                    </p>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="space-y-4 animate-slide-up">
          <Card className="sticky top-6">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 font-display">
                <ShoppingCart className="h-5 w-5" />
                Carrito
                {itemCount > 0 && (
                  <Badge className="ml-auto">{itemCount}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">El carrito está vacío</p>
                  <p className="text-sm text-muted-foreground">Haz clic en un producto para agregarlo</p>
                </div>
              ) : (
                <>
                  <ScrollArea className="max-h-[300px]">
                    <div className="divide-y">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-4">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground truncate">{item.nombre}</p>
                            <p className="text-sm text-muted-foreground">
                              Bs. {item.precio_venta.toFixed(2)} c/u
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.cantidad}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Payment Method */}
                  <div className="border-t p-4">
                    <p className="mb-3 text-sm font-medium text-muted-foreground">Método de Pago</p>
                    <div className="grid grid-cols-3 gap-2">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedPayment(method.id)}
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-lg border p-3 transition-all",
                            selectedPayment === method.id
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <method.icon className="h-5 w-5" />
                          <span className="text-xs font-medium">{method.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">Bs. {total.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-display text-lg font-bold">Total</span>
                      <span className="font-display text-2xl font-bold text-primary">
                        Bs. {total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 space-y-2">
                    <Button 
                      className="w-full h-12 gap-2 text-base" 
                      onClick={handleCompleteSale}
                    >
                      <CheckCircle className="h-5 w-5" />
                      Completar Venta
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={clearCart}
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <DialogTitle className="font-display text-2xl">¡Venta Completada!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">Total cobrado</p>
              <p className="font-display text-3xl font-bold text-foreground">
                Bs. {total.toFixed(2)}
              </p>
              <Badge className="mt-2 capitalize">{selectedPayment}</Badge>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>{items.length} productos • {itemCount} unidades</p>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full h-11" onClick={handleNewSale}>
              Nueva Venta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
