import { useState, useEffect } from 'react';
import { Button, Input, Card } from '../common';
import { Video } from 'lucide-react';

export default function PreJoinScreen({ user, onJoin }) {
  const [name, setName] = useState(user?.name || '');

  // Cập nhật name khi prop user thay đổi (VD: khi fetch xong)
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  const handleSubmit = () => {
    if (!name.trim()) {
      onJoin(user?.name || ''); // Nếu để trống thì dùng tên mặc định
    } else {
      onJoin(name);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card title="Enter meeting" className="w-full max-w-md">
        <div className="space-y-4">
          <Input 
            label="Full Name"
            placeholder="e.g., John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          
          <Button 
            variant="primary" 
            className="w-full"
            onClick={handleSubmit}
            disabled={!name.trim()}
            icon={<Video size={18} />}
          >
            Join now
          </Button>
        </div>
      </Card>
    </div>
  );
}
