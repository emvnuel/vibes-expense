"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ptBR } from "date-fns/locale";
import { MoneyInput } from "@/components/ui/money-input";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  id: number;
  name: string;
  color: string;
  budget: number;
  spent: number;
}

const formSchema = z.object({
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  date: z.date({
    required_error: "Data é obrigatória",
  }),
  category_id: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória"),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ExpenseRequestBody {
  date: string;
  description: string;
  category_id: number;
  amount: number;
}

interface ExpenseFormDialogProps {
  categories: Category[];
  onExpenseAdded?: () => void;
  expense?: {
    id: number;
    date: string;
    description: string;
    category_id: number;
    amount: number;
    tags?: string;
  };
  triggerButton?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ExpenseFormDialog({ 
  categories, 
  onExpenseAdded, 
  expense, 
  triggerButton,
  open,
  onOpenChange
}: ExpenseFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!expense;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      description: "",
      tags: "",
    },
  });

  // Reset form when dialog opens and populate with expense data if editing
  useEffect(() => {
    const isOpen = open !== undefined ? open : internalOpen;
    
    if (isOpen) {
      if (expense) {
        form.reset({
          amount: expense.amount,
          description: expense.description,
          tags: expense.tags || "",
          date: new Date(expense.date),
          category_id: String(expense.category_id),
        });
      } else {
        form.reset({
          amount: 0,
          description: "",
          tags: "",
        });
      }
    }
  }, [form, expense, open, internalOpen]);

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true);

      const expenseData: ExpenseRequestBody = {
        date: format(values.date, "yyyy-MM-dd"),
        description: values.description,
        category_id: parseInt(values.category_id),
        amount: values.amount,
      };

      const url = isEditing 
        ? `http://localhost:8080/expenses?id=eq.${expense.id}` 
        : "http://localhost:8080/expenses";
      
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        throw new Error(isEditing ? "Erro ao atualizar despesa" : "Erro ao salvar despesa");
      }

      toast({
        title: "Sucesso!",
        description: isEditing 
          ? "Despesa atualizada com sucesso." 
          : "Despesa adicionada com sucesso.",
      });

      setInternalOpen(false);
      form.reset();
      onExpenseAdded?.();
    } catch (error) {
      console.error(isEditing ? "Error updating expense:" : "Error saving expense:", error);
      toast({
        title: "Erro",
        description: isEditing 
          ? "Não foi possível atualizar a despesa. Tente novamente." 
          : "Não foi possível salvar a despesa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Despesa" : "Adicionar Nova Despesa"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <MoneyInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="R$ 0,00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva sua despesa..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: mercado, lazer, urgente..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : (isEditing ? "Atualizar Despesa" : "Salvar Despesa")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 