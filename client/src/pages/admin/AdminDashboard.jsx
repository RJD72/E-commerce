import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  useGetDashboardSalesQuery,
  useGetOrderStatusStatsQuery,
  useGetPaymentMethodStatsQuery,
  useGetTopProductsQuery,
} from "../../redux/api/adminApiSlice";

const Dashboard = () => {
  const { data: salesData = [] } = useGetDashboardSalesQuery();
  const { data: topProducts = [] } = useGetTopProductsQuery();
  const { data: orderStatusData = [] } = useGetOrderStatusStatsQuery();
  const { data: paymentMethodData = [] } = useGetPaymentMethodStatsQuery();

  const COLORS = ["#FFBB28", "#00C49F", "#0088FE", "#FF8042", "#FF6384"];

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Sales Over Time */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Revenue Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <XAxis dataKey="month" />
            <YAxis />
            <CartesianGrid stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Top Selling Products */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProducts}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Order Status Breakdown */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Order Status Breakdown</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={orderStatusData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {orderStatusData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </section>

      {/* Payment Method Usage */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Payment Method Usage</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={paymentMethodData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {paymentMethodData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

export default Dashboard;
