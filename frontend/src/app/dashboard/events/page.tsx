'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Chip, Button, Select, SelectItem, Input, Modal, ModalContent,
  ModalHeader, ModalBody, Pagination, Spinner, useDisclosure
} from '@heroui/react';
import api from '@/lib/api';
import { format } from 'date-fns';

const SEVERITY_COLORS: any = { critical: 'danger', high: 'warning', medium: 'primary', low: 'default' };
const EVENT_TYPES = ['intrusion','loitering','zone_entry','zone_exit','unattended_object'];
const SEVERITIES = ['critical','high','medium','low'];

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ type: '', severity: '', camera: '' });
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['events', page, filters],
    queryFn: () => api.get('/events', {
      params: { page, limit: 20, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) }
    }).then(r => r.data),
  });

  const resolveMutation = useMutation({
    mutationFn: (eventId: string) => api.put(`/events/${eventId}/resolve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });

  const openDetail = (event: any) => { setSelectedEvent(event); onOpen(); };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold text-[#f0f0f5] font-mono">EVENT LOG</h1>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select placeholder="All Types" size="sm" className="w-40"
          onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
          {EVENT_TYPES.map(t => <SelectItem key={t}>{t}</SelectItem>)}
        </Select>
        <Select placeholder="All Severities" size="sm" className="w-40"
          onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}>
          {SEVERITIES.map(s => <SelectItem key={s}>{s}</SelectItem>)}
        </Select>
        <Input placeholder="Camera ID" size="sm" className="w-36"
          onValueChange={v => setFilters(f => ({ ...f, camera: v }))} />
        <Button size="sm" variant="bordered" onPress={() => setFilters({ type: '', severity: '', camera: '' })}
          className="border-[#1e1e35] text-[#8888aa]">
          Clear
        </Button>
      </div>

      {/* Table */}
      <Table aria-label="Events"
        classNames={{ wrapper: 'bg-[#0f0f1a] border border-[#1e1e35] rounded-xl', th: 'bg-[#161625] text-[#8888aa] font-mono text-xs', td: 'text-[#e0e0e8]' }}>
        <TableHeader>
          <TableColumn>TIME</TableColumn>
          <TableColumn>TYPE</TableColumn>
          <TableColumn>SEVERITY</TableColumn>
          <TableColumn>CAMERA</TableColumn>
          <TableColumn>TRACK ID</TableColumn>
          <TableColumn>DURATION</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          loadingContent={<Spinner color="primary" />}
          emptyContent="No events found"
          items={data?.data || []}>
          {(event: any) => (
            <TableRow key={event._id} className="cursor-pointer hover:bg-white/[0.02]"
              onClick={() => openDetail(event)}>
              <TableCell className="font-mono text-xs text-[#8888aa]">
                {format(new Date(event.startTime), 'HH:mm:ss dd/MM')}
              </TableCell>
              <TableCell className="font-mono text-xs">{event.type}</TableCell>
              <TableCell>
                <Chip size="sm" color={SEVERITY_COLORS[event.severity]} variant="flat">
                  {event.severity.toUpperCase()}
                </Chip>
              </TableCell>
              <TableCell className="font-mono text-xs">{event.cameraId}</TableCell>
              <TableCell className="font-mono text-xs">#{event.personTrackId}</TableCell>
              <TableCell className="font-mono text-xs">{event.duration ? `${event.duration}s` : '—'}</TableCell>
              <TableCell>
                <Chip size="sm" color={event.resolved ? 'success' : 'warning'} variant="dot">
                  {event.resolved ? 'Resolved' : 'Open'}
                </Chip>
              </TableCell>
              <TableCell onClick={e => e.stopPropagation()}>
                {!event.resolved && (
                  <Button size="sm" variant="light" color="success"
                    isLoading={resolveMutation.isPending}
                    onPress={() => resolveMutation.mutate(event.eventId)}
                    className="text-xs">
                    Resolve
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {data?.pagination && (
        <div className="flex justify-center">
          <Pagination total={data.pagination.totalPages} page={page} onChange={setPage}
            classNames={{ cursor: 'bg-[#4d9fff]' }} />
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg"
        classNames={{ base: 'bg-[#0f0f1a] border border-[#1e1e35]', header: 'border-b border-[#1e1e35]' }}>
        <ModalContent>
          <ModalHeader className="text-[#f0f0f5] font-mono">Event Detail</ModalHeader>
          <ModalBody className="pb-6">
            {selectedEvent && (
              <div className="space-y-3 font-mono text-sm">
                {Object.entries({
                  'Event ID': selectedEvent.eventId,
                  'Type': selectedEvent.type,
                  'Severity': selectedEvent.severity,
                  'Camera': selectedEvent.cameraId,
                  'Zone': selectedEvent.zoneName || selectedEvent.zoneId || '—',
                  'Track ID': `#${selectedEvent.personTrackId}`,
                  'Start Time': format(new Date(selectedEvent.startTime), 'PPpp'),
                  'Duration': selectedEvent.duration ? `${selectedEvent.duration} seconds` : 'Ongoing',
                  'Description': selectedEvent.description || '—',
                  'Status': selectedEvent.resolved ? 'Resolved' : 'Open',
                }).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-[#1e1e35] pb-2">
                    <span className="text-[#555577]">{k}</span>
                    <span className="text-[#f0f0f5]">{v as string}</span>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
