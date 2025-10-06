import { useState, useEffect } from "react";
import { api } from "../services/api";
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Store } from "../types/hwaliManager";

interface ReportData {
  id: string;
  storeName: string;
  requestedBy: string;
  requested_at: string;
  status: string;
  itemCount: number;
}

export const ReportsTab = () => {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    storeId: "all",
  });

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const fetchedStores = await api.getStores();
        setStores(fetchedStores);
      } catch (error) {
        console.error("Failed to fetch stores:", error);
      }
    };
    fetchStores();
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const params = {
        ...filters,
        storeId: filters.storeId === "all" ? "" : filters.storeId,
      };
      const data = await api.getRequestsReport(params);
      setReportData(data);
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleStoreChange = (value: string) => {
    setFilters({ ...filters, storeId: value });
  };

  const chartData = reportData.reduce((acc, item) => {
    const date = new Date(item.requested_at).toLocaleDateString();
    const existing = acc.find((d) => d.date === date);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ date, count: 1 });
    }
    return acc;
  }, [] as { date: string; count: number }[]);

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
        />
        <Input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
        />
        <Select onValueChange={handleStoreChange} value={filters.storeId}>
          <SelectTrigger>
            <SelectValue placeholder="All Stores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={fetchReportData}>Apply Filters</Button>
      </div>

      <div className="business-card">
        <h3 className="font-semibold mb-4">Pickup Requests Over Time</h3>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>

      <div className="business-card">
        <h3 className="font-semibold mb-4">Pickup Requests Report</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Requested At</TableHead>
              <TableHead>Item Count</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.storeName}</TableCell>
                <TableCell>{row.requestedBy}</TableCell>
                <TableCell>
                  {new Date(row.requested_at).toLocaleString()}
                </TableCell>
                <TableCell>{row.itemCount}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
