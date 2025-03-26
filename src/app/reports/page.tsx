"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";
import { Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Definir interfaces para os dados dos relatórios
interface MonthlyTrend {
  name: string;
  valor: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface SummaryData {
  total_spending: number;
  average_daily: number;
  top_category: string;
  top_category_percentage: number;
}

// Definir interfaces para as respostas da API
interface MonthlyTrendResponse {
  month_name: string;
  month_number: number;
  total_amount: number;
}

interface CategoryDistributionResponse {
  category_name: string;
  category_color: string;
  total_amount: number;
}

export default function ReportsPage() {
  const [chartType, setChartType] = useState("line");
  const [monthlyData, setMonthlyData] = useState<MonthlyTrend[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        // Buscar dados de todos os endpoints em paralelo
        const [
          monthlyTrendRes,
          categoryDataRes,
          summaryDataRes
        ] = await Promise.all([
          fetch(`http://localhost:8080/monthly_expenses_trend`),
          fetch(`http://localhost:8080/category_comparison`),
          fetch(`http://localhost:8080/expense_summary`)
        ]);

        // Analisar respostas JSON
        const monthlyTrendData: MonthlyTrendResponse[] = await monthlyTrendRes.json();
        const categoryDistributionData: CategoryDistributionResponse[] = await categoryDataRes.json();
        const summaryDataJson: SummaryData[] = await summaryDataRes.json();

        // Atualizar estado com dados obtidos
        setMonthlyData(monthlyTrendData.map((item) => ({
          name: item.month_name,
          valor: item.total_amount
        })));
        
        setCategoryData(categoryDistributionData.map((item) => ({
          name: item.category_name,
          value: item.total_amount,
          color: item.category_color
        })));
        
        setSummaryData(summaryDataJson[0] || null);
      } catch (error) {
        console.error("Erro ao buscar dados dos relatórios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, []);

  // Formatar percentagem com sinal
  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Relatórios & Análises</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <Select value={chartType} onValueChange={setChartType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de Gráfico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Gráfico de Barras</SelectItem>
            <SelectItem value="line">Gráfico de Linha</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cartões de Resumo */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Cartão de Gastos Totais */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gastos Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-full">Carregando...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(summaryData?.total_spending || 0)}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Cartão de Média Diária */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Média Diária
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-full">Carregando...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(summaryData?.average_daily || 0)}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Cartão de Categoria Principal */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categoria Principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-full">Carregando...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {summaryData?.top_category || 'Nenhuma'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatPercentage(summaryData?.top_category_percentage || 0)} dos gastos totais
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tendência de Gastos Mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">Carregando...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" ? (
                    <LineChart data={monthlyData} margin={{ left: 50, right: 20, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)} 
                        tick={{ fontSize: 12 }}
                        width={80}
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        wrapperStyle={{ zIndex: 1000 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="valor"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={monthlyData} margin={{ left: 50, right: 20, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)} 
                        tick={{ fontSize: 12 }}
                        width={80}
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        wrapperStyle={{ zIndex: 1000 }}
                      />
                      <Bar dataKey="amount" fill="#8884d8" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparação de Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">Carregando...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ left: 50, right: 20, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)} 
                      tick={{ fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      wrapperStyle={{ zIndex: 1000 }}
                    />
                    <Bar dataKey="value" fill="#8884d8">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}