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
      <Card title="Tham gia lớp học" className="w-full max-w-md">
        <div className="space-y-4">
          <Input 
            label="Họ và tên"
            placeholder="Ví dụ: Nguyễn Văn A"
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
            Vào phòng ngay
          </Button>
        </div>
      </Card>
    </div>
  );
}
