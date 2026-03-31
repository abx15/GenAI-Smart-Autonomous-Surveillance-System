'use client';
import { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Chip } from '@heroui/react';

interface Alert {
  id: string;
  type: 'motion' | 'intrusion' | 'system' | 'critical';
  title: string;
  description: string;
  camera: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'investigating';
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Mock data for demonstration
    const mockAlerts: Alert[] = [
      {
        id: 'ALT-001',
        type: 'motion',
        title: 'Motion Detected',
        description: 'Unusual movement detected near main entrance',
        camera: 'CAM-01',
        timestamp: '2024-03-31T12:45:30Z',
        status: 'investigating'
      },
      {
        id: 'ALT-002',
        type: 'intrusion',
        title: 'Unauthorized Access Attempt',
        description: 'Person detected in restricted area after hours',
        camera: 'CAM-02',
        timestamp: '2024-03-31T11:30:15Z',
        status: 'active'
      },
      {
        id: 'ALT-003',
        type: 'system',
        title: 'Camera Offline',
        description: 'Camera CAM-03 lost connection',
        camera: 'CAM-03',
        timestamp: '2024-03-31T10:15:00Z',
        status: 'resolved'
      },
      {
        id: 'ALT-004',
        type: 'critical',
        title: 'Perimeter Breach',
        description: 'Multiple sensors triggered on north fence',
        camera: 'CAM-01',
        timestamp: '2024-03-31T09:45:22Z',
        status: 'active'
      }
    ];
    setAlerts(mockAlerts);
  }, []);

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.type === filter);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'motion': return 'bg-[#4d9fff]';
      case 'intrusion': return 'bg-[#ff6b6b]';
      case 'system': return 'bg-[#ffd93d]';
      case 'critical': return 'bg-[#ff3b3b]';
      default: return 'bg-[#555577]';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-[#ff3b3b]';
      case 'resolved': return 'bg-[#4dff88]';
      case 'investigating': return 'bg-[#ffd93d]';
      default: return 'bg-[#555577]';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#f0f0f5] font-mono">ALERT MONITORING</h1>
        <div className="flex gap-2">
          {['all', 'motion', 'intrusion', 'system', 'critical'].map(type => (
            <Button
              key={type}
              size="sm"
              variant={filter === type ? 'solid' : 'flat'}
              className={`font-mono text-xs capitalize ${
                filter === type 
                  ? 'bg-[#4d9fff] text-white' 
                  : 'border-[#1e1e35] text-[#555577] hover:text-[#f0f0f5]'
              }`}
              onPress={() => setFilter(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAlerts.map(alert => (
          <Card key={alert.id} className="bg-[#0f0f1a] border border-[#1e1e35]">
            <CardBody className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getTypeColor(alert.type)} animate-pulse`} />
                  <div>
                    <h3 className="font-mono text-sm text-[#f0f0f5]">{alert.title}</h3>
                    <p className="font-mono text-xs text-[#555577]">{alert.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Chip 
                    size="sm" 
                    className={`font-mono text-xs ${getStatusColor(alert.status)} text-white`}
                  >
                    {alert.status}
                  </Chip>
                  <Chip 
                    size="sm" 
                    variant="flat"
                    className="font-mono text-xs border-[#1e1e35] text-[#555577]"
                  >
                    {alert.camera}
                  </Chip>
                </div>
              </div>
              
              <p className="font-mono text-xs text-[#8888aa] mb-3">{alert.description}</p>
              
              <div className="flex justify-between items-center">
                <p className="font-mono text-[10px] text-[#555577]">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="flat" className="font-mono text-xs border-[#1e1e35] text-[#555577]">
                    View Feed
                  </Button>
                  <Button size="sm" variant="flat" className="font-mono text-xs border-[#1e1e35] text-[#555577]">
                    Dismiss
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <Card className="bg-[#0f0f1a] border border-[#1e1e35]">
          <CardBody className="p-8 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <p className="font-mono text-sm text-[#555577]">No alerts found</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
