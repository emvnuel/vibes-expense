"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Search, Trash2 } from "lucide-react";
import { ExpenseFormDialog } from "@/components/expenses/ExpenseFormDialog";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Category {
  id: number;
  name: string;
  color: string;
  budget: number;
  spent: number;
}

interface Expense {
  id: number;
  date: string;
  description: string;
  category_id: number;
  amount: number;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const itemsPerPage = 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const fetchData = useCallback(async () => {
    try {
      const offset = (currentPage - 1) * itemsPerPage;

      // Build the base URL with pagination
      let expensesUrl = `http://localhost:8080/expenses?order=date.desc&limit=${itemsPerPage}&offset=${offset}`;

      // Add search filter if search term exists
      if (debouncedSearchTerm) {
        expensesUrl += `&description=ilike.*${encodeURIComponent(debouncedSearchTerm)}*`;
      }

      // Add category filter if a category is selected
      if (selectedCategory && selectedCategory !== "all") {
        expensesUrl += `&category_id=eq.${selectedCategory}`;
      }

      // Add date filter based on selected period
      if (selectedPeriod && selectedPeriod !== "all") {
        const today = new Date();
        let startDate = new Date();
        
        if (selectedPeriod === "today") {
          // Today: same day for start and end
          startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        } else if (selectedPeriod === "week") {
          // This week: start from last Sunday (or current day - 6 for last 7 days)
          const day = today.getDay(); // 0 is Sunday, 6 is Saturday
          startDate = new Date(today);
          startDate.setDate(today.getDate() - day); // Go back to last Sunday
        } else if (selectedPeriod === "month") {
          // This month: start from 1st day of current month
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        } else if (selectedPeriod === "year") {
          // This year: start from January 1st of current year
          startDate = new Date(today.getFullYear(), 0, 1);
        }
        
        const formattedEndDate = today.toISOString().split('T')[0];
        const formattedStartDate = startDate.toISOString().split('T')[0];
        
        expensesUrl += `&date=lte.${formattedEndDate}&date=gte.${formattedStartDate}`;
      }

      // Build the count URL with the same filters
      let countUrl = 'http://localhost:8080/expenses?select=count';
      if (debouncedSearchTerm) {
        countUrl += `&description=ilike.*${encodeURIComponent(debouncedSearchTerm)}*`;
      }
      if (selectedCategory && selectedCategory !== "all") {
        countUrl += `&category_id=eq.${selectedCategory}`;
      }
      
      // Add the same date filter to count URL
      if (selectedPeriod && selectedPeriod !== "all") {
        const today = new Date();
        let startDate = new Date();
        
        if (selectedPeriod === "today") {
          startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        } else if (selectedPeriod === "week") {
          const day = today.getDay();
          startDate = new Date(today);
          startDate.setDate(today.getDate() - day);
        } else if (selectedPeriod === "month") {
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        } else if (selectedPeriod === "year") {
          startDate = new Date(today.getFullYear(), 0, 1);
        }
        
        const formattedEndDate = today.toISOString().split('T')[0];
        const formattedStartDate = startDate.toISOString().split('T')[0];
        
        countUrl += `&date=lte.${formattedEndDate}&date=gte.${formattedStartDate}`;
      }

      const [expensesResponse, categoriesResponse, totalCountResponse] = await Promise.all([
        fetch(expensesUrl),
        fetch('http://localhost:8080/categories'),
        fetch(countUrl)
      ]);

      if (!expensesResponse.ok || !categoriesResponse.ok || !totalCountResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [expensesData, categoriesData, totalCountData] = await Promise.all([
        expensesResponse.json(),
        categoriesResponse.json(),
        totalCountResponse.json()
      ]);

      setExpenses(expensesData);
      setCategories(categoriesData);
      setTotalExpenses(totalCountData[0]?.count || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm, selectedCategory, selectedPeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const getCategory = (categoryId: number) => {
    return categories.find(cat => cat.id === categoryId) || { id: 0, name: "Outros", color: "#6c757d", budget: 0, spent: 0 };
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDialogOpen(true);
  };

  const handleAddExpense = () => {
    setSelectedExpense(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    fetchData();
    setIsDialogOpen(false);
  };

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:8080/expenses?id=eq.${expenseToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao excluir despesa");
      }

      // Close dialog and refresh data
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
      fetchData();

    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Despesas</h1>
        <Button className="cursor-pointer" onClick={handleAddExpense}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Despesa
        </Button>
      </div>

      {/* Expense Form Dialog */}
      <ExpenseFormDialog
        categories={categories}
        expense={selectedExpense || undefined}
        onExpenseAdded={handleDialogClose}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogOverlay className="bg-background/10 backdrop-blur-sm" />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Tem certeza que deseja excluir a despesa &quot;{expenseToDelete?.description}&quot;?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteExpense}
              >
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar despesas..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value);
            setCurrentPage(1); // Reset to first page when changing category
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedPeriod}
          onValueChange={(value) => {
            setSelectedPeriod(value);
            setCurrentPage(1); // Reset to first page when changing period
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Nenhuma despesa encontrada
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {new Date(expense.date).toLocaleDateString("pt-BR", { timeZone: "UTC"})}
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    {(() => {
                      const category = getCategory(expense.category_id);
                      return (
                        <Badge 
                          variant="outline" 
                          style={{ 
                            borderColor: category.color,
                            color: category.color,
                          }}
                        >
                          {category.name}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                    className="cursor-pointer" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditExpense(expense)}
                    >
                      <Pencil/>
                    </Button>
                    <Button 
                    className="cursor-pointer"
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteClick(expense)}
                  >
                    <Trash2/>
                  </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalExpenses > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {Math.min(itemsPerPage, expenses.length)} de {totalExpenses} resultados
          </div>
          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(prev => prev - 1);
                    }
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                >
                  <span className="hidden sm:block">Anterior</span>
                </PaginationPrevious>
              </PaginationItem>
              
              {/* First page */}
              {currentPage > 2 && (
                <PaginationItem>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(1);
                    }}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {/* Ellipsis if needed */}
              {currentPage > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              {/* Previous page if not first */}
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(currentPage - 1);
                    }}
                  >
                    {currentPage - 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {/* Current page */}
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  {currentPage}
                </PaginationLink>
              </PaginationItem>
              
              {/* Next page if not last */}
              {currentPage < Math.ceil(totalExpenses / itemsPerPage) && (
                <PaginationItem>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(currentPage + 1);
                    }}
                  >
                    {currentPage + 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {/* Ellipsis if needed */}
              {currentPage < Math.ceil(totalExpenses / itemsPerPage) - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              {/* Last page if not current or next */}
              {currentPage < Math.ceil(totalExpenses / itemsPerPage) - 1 && (
                <PaginationItem>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(Math.ceil(totalExpenses / itemsPerPage));
                    }}
                  >
                    {Math.ceil(totalExpenses / itemsPerPage)}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < Math.ceil(totalExpenses / itemsPerPage)) {
                      setCurrentPage(prev => prev + 1);
                    }
                  }}
                  className={currentPage >= Math.ceil(totalExpenses / itemsPerPage) ? "pointer-events-none opacity-50" : ""}
                >
                  <span className="hidden sm:block">Próxima</span>
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}