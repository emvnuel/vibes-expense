"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

// Define interface for the consolidated dashboard data
interface DashboardData {
  current_month_total: number;
  previous_month_total: number;
  monthly_percentage_change: number;
  current_year_total: number;
  previous_year_total: number;
  yearly_percentage_change: number;
  main_category_name: string;
  main_category_total: number;
  main_category_percentage: number;
  total_budget: number;
  total_spent: number;
  remaining_budget: number;
  budget_percentage_remaining: number;
}

interface MonthlyTrend {
  month_name: string;
  month_number: number;
  total_amount: number;
}

interface CategoryDistribution {
  category_name: string;
  category_color: string;
  total_amount: number;
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data from all views in parallel
        const [
          dashboardDataRes,
          monthlyTrendRes,
          categoryDistributionRes
        ] = await Promise.all([
          fetch('http://localhost:8080/dashboard_data'),
          fetch('http://localhost:8080/monthly_expenses_trend'),
          fetch('http://localhost:8080/category_distribution')
        ]);

        // Parse JSON responses
        const dashboardDataJson = await dashboardDataRes.json();
        const monthlyTrendData = await monthlyTrendRes.json();
        const categoryDistributionData = await categoryDistributionRes.json();

        // Update state with fetched data
        setDashboardData(dashboardDataJson[0] || null);
        setMonthlyTrend(monthlyTrendData || []);
        setCategoryDistribution(categoryDistributionData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format percentage with sign
  const formatPercentage = (value: number) => {
    return value > 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
  };

  // Format remaining budget with visual cue
  const formatRemainingBudget = (value: number) => {
    if (value < 0) {
      return (
        <div className="flex items-center text-red-500">
          <AlertTriangle className="mr-1 h-4 w-4" />
          <span>Orçamento excedido em {formatCurrency(Math.abs(value))}</span>
        </div>
      );
    }
    return formatCurrency(value);
  };

  // Format remaining budget percentage with visual cue
  const formatRemainingPercentage = (value: number) => {
    if (value < 0) {
      return `Excedeu o orçamento em ${Math.abs(value).toFixed(1)}%`;
    }
    return `${value.toFixed(1)}% do orçamento mensal`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Painel de Controle</h1>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Carregando..." : formatCurrency(dashboardData?.current_month_total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Carregando..." : formatPercentage(dashboardData?.monthly_percentage_change || 0)} em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos do Ano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Carregando..." : formatCurrency(dashboardData?.current_year_total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Carregando..." : formatPercentage(dashboardData?.yearly_percentage_change || 0)} em relação ao ano anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categoria Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Carregando..." : dashboardData?.main_category_name || "Nenhuma"}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Carregando..." : `${dashboardData?.main_category_percentage?.toFixed(1) || 0}% do total de gastos`}
            </p>
          </CardContent>
        </Card>
        <Card className={dashboardData?.remaining_budget && dashboardData.remaining_budget < 0 ? "border-red-500" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamento Restante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dashboardData?.remaining_budget && dashboardData.remaining_budget < 0 ? "text-red-500" : ""}`}>
              {loading ? "Carregando..." : formatRemainingBudget(dashboardData?.remaining_budget || 0)}
            </div>
            <p className={`text-xs ${dashboardData?.remaining_budget && dashboardData.remaining_budget < 0 ? "text-red-500" : "text-muted-foreground"}`}>
              {loading ? "Carregando..." : formatRemainingPercentage(dashboardData?.budget_percentage_remaining || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="overflow-y-auto">
          <CardHeader>
            <CardTitle>Tendência de Gastos Mensais</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">Carregando...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={monthlyTrend.map(item => ({
                    name: item.month_name,
                    valor: item.total_amount
                  }))}
                  margin={{ left: 50, right: 20, top: 10, bottom: 10 }}
                >
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
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">Carregando...</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution
                        .filter(item => item.total_amount > 0)
                        .map(item => ({
                          name: item.category_name,
                          value: item.total_amount
                        }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryDistribution
                        .filter(item => item.total_amount > 0)
                        .map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.category_color}
                          />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}