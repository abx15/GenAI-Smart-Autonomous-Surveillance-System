"use client";

import React from "react";
import CameraFeed from "../../components/camera/CameraFeed";
import AlertPanel from "../../components/alerts/AlertPanel";
import AIChat from "../../components/ai/AIChat";
import EventTable from "../../components/events/EventTable";
import StatsBar from "../../components/stats/StatsBar";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      {/* Top stats */}
      <StatsBar />

      {/* Main grid */}
      <div className="grid grid-cols-5 gap-4 flex-1 min-h-0">
        {/* Camera feed — 2 cols */}
        <div className="col-span-2 flex flex-col gap-4">
          <CameraFeed cameraId="CAM-01" />
        </div>

        {/* Alert panel — 1.5 cols */}
        <div className="col-span-2 min-h-0">
          <AlertPanel />
        </div>

        {/* AI Chat — 1.5 cols */}
        <div className="col-span-1 min-h-0">
          <AIChat />
        </div>
      </div>

      {/* Event table — full width */}
      <div className="h-72">
        <EventTable />
      </div>
    </div>
  );
}
