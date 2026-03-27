import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';

interface Props {
  onSelect: (role: 'provider' | 'requester') => void;
}

export function RoleSelection({ onSelect }: Props) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
      <div className="absolute top-32 -left-16 w-48 h-48 rounded-full bg-white/5" />
      <div className="absolute bottom-40 -right-10 w-36 h-36 rounded-full bg-white/10" />

      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-5 shadow-lg">
            <span style={{ fontSize: 38 }}>💸</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>P2P Remit</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8, fontSize: 16 }}>
            Nền tảng chuyển tiền ngang hàng
          </p>
        </motion.div>

        <div className="w-full space-y-4">
          {/* Provider card */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            onClick={() => onSelect('provider')}
            className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 shadow-xl text-left active:scale-95 transition-transform"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}
            >
              <TrendingUp size={26} color="white" />
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>
                Tôi là Nhà cung cấp
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                Đăng deal & nhận yêu cầu từ khách
              </div>
            </div>
            <ArrowRight size={20} color="#9CA3AF" />
          </motion.button>

          {/* Requester card */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            onClick={() => onSelect('requester')}
            className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 shadow-xl text-left active:scale-95 transition-transform"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}
            >
              <span style={{ fontSize: 26 }}>🔄</span>
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>
                Tôi cần Giao dịch
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                Tìm deal tốt nhất & gửi yêu cầu
              </div>
            </div>
            <ArrowRight size={20} color="#9CA3AF" />
          </motion.button>
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex items-center gap-2"
        >
          <ShieldCheck size={16} color="rgba(255,255,255,0.7)" />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
            An toàn · Uy tín · Nhanh chóng
          </span>
        </motion.div>
      </div>
    </div>
  );
}
