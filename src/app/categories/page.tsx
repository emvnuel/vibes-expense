"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  color: string;
  budget: number;
  spent: number;
}

interface NewCategory {
  name: string;
  color: string;
  budget: number;
  spent: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: "",
    color: "#FF6B6B",
    budget: 0,
    spent: 0,
  });

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const formatInputValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const parseInputValue = (value: string) => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(numericValue) || 0;
  };

  const handleCreateCategory = async () => {
    try {
      const response = await fetch('http://localhost:8080/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      // Reset form and close dialog
      setNewCategory({
        name: "",
        color: "#FF6B6B",
        budget: 0,
        spent: 0,
      });
      setIsDialogOpen(false);
      
      // Refresh categories list
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleEditCategory = async () => {
    if (!categoryToEdit) return;

    try {
      const response = await fetch(`http://localhost:8080/categories?id=eq.${categoryToEdit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: categoryToEdit.name,
          color: categoryToEdit.color,
          budget: categoryToEdit.budget,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      // Close dialog and refresh list
      setIsEditDialogOpen(false);
      setCategoryToEdit(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/categories?id=eq.${categoryToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      // Close dialog and refresh list
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categorias</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Categoria
            </Button>
          </DialogTrigger>
          <DialogOverlay className="bg-background/80 backdrop-blur-sm" />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input 
                  placeholder="Nome da categoria"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Orçamento</label>
                <MoneyInput 
                  value={newCategory.budget}
                  onChange={(value) => setNewCategory({ ...newCategory, budget: value })}
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cor</label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-input"
                    style={{ backgroundColor: newCategory.color }}
                  />
                  <Input 
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="w-32 h-8 p-1"
                  />
                </div>
              </div>
              <Button 
                className="w-full cursor-pointer"
                onClick={handleCreateCategory}
                disabled={!newCategory.name || !newCategory.budget}
              >
                Salvar Categoria
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {category.name}
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  className="cursor-pointer"
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setCategoryToEdit(category);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  className="cursor-pointer"
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setCategoryToDelete(category);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <div className="text-2xl font-bold">
                  {formatCurrency(category.spent)}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(category.budget)} orçamento mensal
              </div>
              <div className="mt-2">
                <div className="h-2 bg-muted rounded-full">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: category.color,
                      width: `${(category.spent / category.budget) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogOverlay className="bg-background/10 backdrop-blur-sm" />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Tem certeza que deseja excluir a categoria &quot;{categoryToDelete?.name}&quot;?
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
                onClick={handleDeleteCategory}
              >
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogOverlay className="bg-background/10 backdrop-blur-sm" />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input 
                placeholder="Nome da categoria"
                value={categoryToEdit?.name || ""}
                onChange={(e) => setCategoryToEdit(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Orçamento</label>
              <MoneyInput 
                value={categoryToEdit?.budget || 0}
                onChange={(value) => setCategoryToEdit(prev => prev ? { ...prev, budget: value } : null)}
                placeholder="R$ 0,00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cor</label>
              <div className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-full border-2 border-input"
                  style={{ backgroundColor: categoryToEdit?.color }}
                />
                <Input 
                  type="color"
                  value={categoryToEdit?.color || "#FF6B6B"}
                  onChange={(e) => setCategoryToEdit(prev => prev ? { ...prev, color: e.target.value } : null)}
                  className="w-32 h-8 p-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="cursor-pointer"
                onClick={handleEditCategory}
                disabled={!categoryToEdit?.name || !categoryToEdit?.budget}
              >
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 