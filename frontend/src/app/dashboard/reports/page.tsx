'use client';
import { useState } from 'react';
import { Button, Input, Spinner, Card, CardBody } from '@heroui/react';
import ReactMarkdown from 'react-markdown';
import api from '@/lib/api';

export default function ReportsPage() {
  const [shiftStart, setShiftStart] = useState('');
  const [shiftEnd, setShiftEnd] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generateReport() {
    if (!shiftStart || !shiftEnd) { setError('Please select both start and end times'); return; }
    setLoading(true); setError(''); setReport('');
    try {
      const { data } = await api.post('/ai/report', { shiftStart, shiftEnd });
      setReport(data.data.report);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  }

  function downloadReport() {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `SASS_Report_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
  }

  // Quick presets
  const setToday = () => {
    const today = new Date();
    const start = new Date(today); start.setHours(0,0,0,0);
    const end = new Date(today); end.setHours(23,59,59,0);
    setShiftStart(start.toISOString().slice(0,16));
    setShiftEnd(end.toISOString().slice(0,16));
  };
  const setLast24h = () => {
    const end = new Date();
    const start = new Date(Date.now() - 86400000);
    setShiftStart(start.toISOString().slice(0,16));
    setShiftEnd(end.toISOString().slice(0,16));
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <h1 className="text-xl font-bold text-[#f0f0f5] font-mono">AI SHIFT REPORTS</h1>

      <Card className="bg-[#0f0f1a] border border-[#1e1e35]">
        <CardBody className="space-y-4 p-5">
          <div className="flex gap-2 mb-2">
            <Button size="sm" variant="bordered" onPress={setToday} className="border-[#1e1e35] text-[#8888aa] text-xs">Today</Button>
            <Button size="sm" variant="bordered" onPress={setLast24h} className="border-[#1e1e35] text-[#8888aa] text-xs">Last 24h</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-[#555577] mb-1 block">SHIFT START</label>
              <input type="datetime-local" value={shiftStart} onChange={e => setShiftStart(e.target.value)}
                className="w-full bg-[#161625] border border-[#1e1e35] text-[#f0f0f5] rounded-xl px-3 py-2 text-sm font-mono focus:border-[#9b5eff] outline-none" />
            </div>
            <div>
              <label className="text-xs font-mono text-[#555577] mb-1 block">SHIFT END</label>
              <input type="datetime-local" value={shiftEnd} onChange={e => setShiftEnd(e.target.value)}
                className="w-full bg-[#161625] border border-[#1e1e35] text-[#f0f0f5] rounded-xl px-3 py-2 text-sm font-mono focus:border-[#9b5eff] outline-none" />
            </div>
          </div>
          {error && <p className="text-sm text-[#ff3b3b] font-mono">{error}</p>}
          <Button onPress={generateReport} isLoading={loading}
            className="bg-[#9b5eff] text-white w-full">
            {loading ? 'Generating report...' : '🤖 Generate AI Report'}
          </Button>
        </CardBody>
      </Card>

      {report && (
        <Card className="bg-[#0f0f1a] border border-[#1e1e35]">
          <CardBody className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-mono text-sm text-[#8888aa]">GENERATED REPORT</h2>
              <Button size="sm" variant="bordered" onPress={downloadReport}
                className="border-[#1e1e35] text-[#8888aa] text-xs">
                Download .md
              </Button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none border-t border-[#1e1e35] pt-4">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
