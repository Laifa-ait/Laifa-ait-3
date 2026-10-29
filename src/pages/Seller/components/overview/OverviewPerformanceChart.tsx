import React from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { SellerOverviewChartPoint } from "../../../../types/seller";

interface OverviewPerformanceChartProps {
  growth: string;
  chartData: SellerOverviewChartPoint[];
}

export const OverviewPerformanceChart: React.FC<OverviewPerformanceChartProps> = ({
  growth,
  chartData,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="bg-white rounded-3xl border border-[#E0B4B2]/40 shadow-2xs p-6 sm:p-8 overflow-hidden relative"
      id="seller-weekly-sales-chart"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-base sm:text-lg font-extrabold flex items-center gap-2.5 text-[#1A1836]">
            <BarChart3 className="w-5 h-5 text-[#A54055]" />
            <span>{t("seller.overview.weekly_sales", "Ventes de la Semaine")}</span>
          </h4>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t("Évolution de votre activité hebdomadaire en DZD")}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold uppercase tracking-wider tabular-nums">
            {growth}
          </span>
        </div>
      </div>
      <div className="h-[240px] sm:h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight={240}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSalesMindazzle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A54055" stopOpacity={0.32} />
                <stop offset="95%" stopColor="#E99856" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3eef1" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fontWeight: 700, fill: "#622347" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fontWeight: 700, fill: "#622347" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid rgba(224,180,178,0.5)",
                boxShadow: "0 10px 25px rgba(26,24,54,0.12)",
                fontWeight: 800,
              }}
              itemStyle={{ color: "#A54055" }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#A54055"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSalesMindazzle)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
