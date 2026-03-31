"use client";

import React, { useState } from "react";
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  createColumnHelper,
  getPaginationRowModel
} from "@tanstack/react-table";
import { 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  CheckCircle, 
  AlertCircle,
  Database,
  Search,
  ExternalLink
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { SurveillanceEvent } from "../../types";

const columnHelper = createColumnHelper<SurveillanceEvent>();

export const EventTable = () => {
  const [data] = useState<SurveillanceEvent[]>([
    {
      id: "EVT-1023",
      timestamp: new Date().toISOString(),
      type: "Zone Intrusion",
      severity: "critical",
      cameraId: "1",
      tracks: [12],
      duration: 45,
      status: "unresolved"
    },
    {
      id: "EVT-1022",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: "Loitering",
      severity: "high",
      cameraId: "2",
      tracks: [15, 18],
      duration: 120,
      status: "resolved"
    },
    {
      id: "EVT-1021",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      type: "Person Detection",
      severity: "medium",
      cameraId: "1",
      tracks: [22],
      duration: 12,
      status: "resolved"
    },
    {
      id: "EVT-1020",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: "Unusual Motion",
      severity: "low",
      cameraId: "3",
      tracks: [],
      duration: 5,
      status: "resolved"
    }
  ]);

  const columns = [
    columnHelper.accessor("timestamp", {
      header: "TIME",
      cell: (info) => <span className="font-mono text-[10px] uppercase">{new Date(info.getValue()).toLocaleString()}</span>,
    }),
    columnHelper.accessor("type", {
      header: "EVENT TYPE",
      cell: (info) => <span className="font-mono text-[10px] tracking-widest text-primary font-bold uppercase">{info.getValue()}</span>,
    }),
    columnHelper.accessor("severity", {
      header: "SEVERITY",
      cell: (info) => (
        <span className={cn(
          "px-2 py-0.5 text-[9px] border font-mono uppercase font-bold",
          info.getValue() === "critical" ? "border-danger text-danger bg-danger/5" :
          info.getValue() === "high" ? "border-warning text-warning bg-warning/5" :
          info.getValue() === "medium" ? "border-amber-400 text-amber-400 bg-amber-400/5" :
          "border-primary/50 text-primary bg-primary/5"
        )}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("cameraId", {
      header: "CAM",
      cell: (info) => <span className="font-mono text-[10px] text-muted">CAM_0{info.getValue()}</span>,
    }),
    columnHelper.accessor("duration", {
      header: "DUR",
      cell: (info) => <span className="font-mono text-[10px]">{info.getValue()}S</span>,
    }),
    columnHelper.accessor("status", {
      header: "STATUS",
      cell: (info) => (
        <div className="flex items-center gap-2">
          {info.getValue() === "resolved" ? (
            <CheckCircle className="w-3 h-3 text-primary" />
          ) : (
            <AlertCircle className="w-3 h-3 text-danger animate-pulse" />
          )}
          <span className={cn(
            "text-[10px] font-mono uppercase",
            info.getValue() === "resolved" ? "text-primary/70" : "text-danger"
          )}>
            {info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card className="flex-1 min-h-[400px]">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-card-border/50 bg-card/50">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <CardTitle className="text-sm font-mono tracking-widest p-0">EVENT LOGS DATABASE</CardTitle>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-black/40 border border-card-border overflow-hidden rounded-none">
            <Search className="w-3 h-3 text-muted" />
            <input 
              className="bg-transparent text-[10px] font-mono focus:outline-none text-primary w-32 placeholder:text-muted" 
              placeholder="QUERY DB..."
            />
          </div>
          <Button variant="secondary" size="sm" className="h-7 text-[10px] tracking-widest gap-2">
            <Filter className="w-3 h-3" />
            FILTERS
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-card-border/30 bg-card/20">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="py-2.5 px-4 text-[10px] font-mono text-muted uppercase tracking-tighter">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-card-border/20">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-primary/5 transition-colors group cursor-pointer">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="py-3 px-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>

      <div className="p-3 border-t border-card-border/50 flex items-center justify-between bg-card/30">
        <span className="text-[10px] font-mono text-muted uppercase">Showing 1-10 of 124 Results</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(p => (
              <Button 
                key={p} 
                variant={p === 1 ? "default" : "secondary"} 
                size="sm" 
                className="h-7 w-7 p-0 text-[10px] font-mono"
              >
                {p}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
