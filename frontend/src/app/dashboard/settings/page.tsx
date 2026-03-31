'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Select, SelectItem, Chip, Card, CardBody, CardHeader, Input } from '@heroui/react';
import api from '@/lib/api';

export default function SettingsPage() {
  const qc = useQueryClient();
  const [newZone, setNewZone] = useState({ name: '', cameraId: 'CAM-01', type: 'monitoring', description: '' });

  const { data: zones, isLoading } = useQuery({
    queryKey: ['zones'],
    queryFn: () => api.get('/zones').then(r => r.data.data),
  });

  const createZone = useMutation({
    mutationFn: (data: any) => api.post('/zones', { ...data, coordinates: [[0,0],[640,0],[640,480],[0,480]] }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['zones'] }); setNewZone({ name: '', cameraId: 'CAM-01', type: 'monitoring', description: '' }); },
  });

  const deleteZone = useMutation({
    mutationFn: (zoneId: string) => api.delete(`/zones/${zoneId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zones'] }),
  });

  const ZONE_TYPE_COLORS: any = { restricted: 'danger', entry: 'success', monitoring: 'primary' };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h1 className="text-xl font-bold text-[#f0f0f5] font-mono">SETTINGS</h1>

      {/* Zone Management */}
      <Card className="bg-[#0f0f1a] border border-[#1e1e35]">
        <CardHeader className="border-b border-[#1e1e35] px-5 py-3">
          <h2 className="font-mono text-sm text-[#f0f0f5]">ZONE MANAGEMENT</h2>
        </CardHeader>
        <CardBody className="p-5 space-y-4">
          {/* Create zone form */}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Zone Name" value={newZone.name} onValueChange={v => setNewZone(z => ({...z, name: v}))}
              classNames={{ input: 'font-mono text-sm', inputWrapper: 'bg-[#161625] border-[#1e1e35]' }} />
            <Input label="Camera ID" value={newZone.cameraId} onValueChange={v => setNewZone(z => ({...z, cameraId: v}))}
              classNames={{ input: 'font-mono text-sm', inputWrapper: 'bg-[#161625] border-[#1e1e35]' }} />
            <Select label="Zone Type" selectedKeys={[newZone.type]}
              onChange={e => setNewZone(z => ({...z, type: e.target.value}))}
              classNames={{ trigger: 'bg-[#161625] border-[#1e1e35]' }}>
              <SelectItem key="restricted">Restricted</SelectItem>
              <SelectItem key="entry">Entry</SelectItem>
              <SelectItem key="monitoring">Monitoring</SelectItem>
            </Select>
            <Input label="Description (optional)" value={newZone.description}
              onValueChange={v => setNewZone(z => ({...z, description: v}))}
              classNames={{ input: 'font-mono text-sm', inputWrapper: 'bg-[#161625] border-[#1e1e35]' }} />
          </div>
          <Button onPress={() => createZone.mutate(newZone)} isLoading={createZone.isPending}
            isDisabled={!newZone.name || !newZone.cameraId}
            className="bg-[#4d9fff] text-white">
            + Add Zone
          </Button>

          {/* Zone list */}
          <div className="space-y-2 mt-4">
            {isLoading && <p className="font-mono text-xs text-[#555577]">Loading zones...</p>}
            {zones?.map((zone: any) => (
              <div key={zone.zoneId} className="flex items-center justify-between px-4 py-3 bg-[#161625] rounded-xl border border-[#1e1e35]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-[#f0f0f5]">{zone.name}</span>
                    <Chip size="sm" color={ZONE_TYPE_COLORS[zone.type] || 'default'} variant="flat">
                      {zone.type}
                    </Chip>
                  </div>
                  <span className="font-mono text-xs text-[#555577]">{zone.cameraId}</span>
                </div>
                <Button size="sm" color="danger" variant="light"
                  isLoading={deleteZone.isPending}
                  onPress={() => deleteZone.mutate(zone.zoneId)}>
                  Delete
                </Button>
              </div>
            ))}
            {!isLoading && !zones?.length && (
              <p className="font-mono text-xs text-[#555577] text-center py-4">No zones configured</p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
