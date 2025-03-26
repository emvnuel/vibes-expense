import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CreditCard, PieChart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-8 sm:px-6 md:px-8 gap-8">
      <main className="flex flex-col gap-6 max-w-3xl w-full">
        <div className="text-center mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Vibes Expense</h1>
          <p className="text-muted-foreground">Gerencie suas despesas de forma simples e eficiente</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <BarChart3 className="h-10 w-10 mb-2 text-primary" />
            <h2 className="text-lg font-semibold mb-1">Painel de Controle</h2>
            <p className="text-sm text-center text-muted-foreground mb-4">Visualize seus gastos e orçamentos</p>
            <Link href="/dashboard" className="mt-auto">
              <Button variant="outline" size="sm">
                Acessar
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <CreditCard className="h-10 w-10 mb-2 text-primary" />
            <h2 className="text-lg font-semibold mb-1">Despesas</h2>
            <p className="text-sm text-center text-muted-foreground mb-4">Gerencie todas as suas despesas</p>
            <Link href="/expenses" className="mt-auto">
              <Button variant="outline" size="sm">
                Acessar
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <PieChart className="h-10 w-10 mb-2 text-primary" />
            <h2 className="text-lg font-semibold mb-1">Categorias</h2>
            <p className="text-sm text-center text-muted-foreground mb-4">Organize suas despesas por categorias</p>
            <Link href="/categories" className="mt-auto">
              <Button variant="outline" size="sm">
                Acessar
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/dashboard">
            <Button className="gap-2">
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
      
      <footer className="mt-auto py-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Vibes Expense. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
