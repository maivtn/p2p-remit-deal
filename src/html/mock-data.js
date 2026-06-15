/**
 * P2P Remit Deals — Mock Data
 * Exposes global: P2P_DATA
 *
 * Usage in HTML:
 *   <script src="mock-data.js"></script>
 *   <!-- then access P2P_DATA.getRequest('RQ-4F8N1') etc. -->
 *
 * "Now" for all countdown/timeAgo is: 2026-06-12T09:00:00Z
 */
(function (global) {
  'use strict';

  // ─────────────────────────────────────────────
  // CURRENCIES
  // ─────────────────────────────────────────────
  const CURRENCIES = [
    { code: 'USD', symbol: '$',  name: 'US Dollar',         flag: '🇺🇸', decimals: 2 },
    { code: 'VND', symbol: '₫',  name: 'Vietnamese Dong',   flag: '🇻🇳', decimals: 0 },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar',  flag: '🇸🇬', decimals: 2 },
    { code: 'JPY', symbol: '¥',  name: 'Japanese Yen',      flag: '🇯🇵', decimals: 0 },
    { code: 'EUR', symbol: '€',  name: 'Euro',              flag: '🇪🇺', decimals: 2 },
  ];

  // ─────────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────────
  const USERS = {
    'U-REQ-001': {
      id: 'U-REQ-001',
      role: 'requester',
      name: 'Minh Tuấn Nguyễn',
      shortName: 'Minh Tuấn',
      initials: 'MT',
      email: 'minhtuan@example.com',
      phone: '+84 901 234 567',
      kycStatus: 'verified',
      kycTier: 1,
      avatarBg: '#e7ecff',
      avatarColor: '#6161ff',
      createdAt: '2024-03-15T08:00:00Z',
    },
    'U-PRV-001': {
      id: 'U-PRV-001',
      role: 'provider',
      name: 'Hùng Mạnh Lê',
      shortName: 'Hùng Mạnh',
      initials: 'HM',
      email: 'hungmanh@example.com',
      phone: '+1 415 555 7890',
      kycStatus: 'verified',
      kycTier: 2,
      avatarBg: '#bcfe90',
      avatarColor: '#2a5c4e',
      rating: 4.9,
      completedCount: 247,
      onTimeRate: 98.4,
      createdAt: '2023-11-01T08:00:00Z',
    },
    'U-PRV-002': {
      id: 'U-PRV-002',
      role: 'provider',
      name: 'Linh Chi Trần',
      shortName: 'Linh Chi',
      initials: 'LC',
      email: 'linhchi@example.com',
      phone: '+84 902 111 222',
      kycStatus: 'verified',
      kycTier: 2,
      avatarBg: '#eddff7',
      avatarColor: '#9450fd',
      rating: 4.7,
      completedCount: 89,
      onTimeRate: 95.5,
      createdAt: '2024-01-20T08:00:00Z',
    },
    'U-ADM-001': {
      id: 'U-ADM-001',
      role: 'admin',
      name: 'Admin Trọng tài',
      shortName: 'Admin',
      initials: 'AD',
      email: 'admin@p2premit.com',
      avatarBg: '#fff8e1',
      avatarColor: '#f59e0b',
      createdAt: '2023-01-01T00:00:00Z',
    },
  };

  // ─────────────────────────────────────────────
  // DEALS  (provider listings)
  // ─────────────────────────────────────────────
  const DEALS = [
    {
      id: 'DEAL-001',
      versionId: 'DEAL-001-v3',
      providerId: 'U-PRV-001',
      corridor: { sendCurrency: 'USD', receiveCurrency: 'VND' },
      rate: 25500,           // 1 USD = 25,500 VND
      minAmount: 100,        // USD
      maxAmount: 5000,
      methods: ['zelle', 'venmo', 'paypal'],
      slaHours: 2,
      expiryDate: '2026-06-30T23:59:59Z',
      status: 'active',
      rating: 4.9,
      completedCount: 247,
      onTimeRate: 98.4,
    },
    {
      id: 'DEAL-002',
      versionId: 'DEAL-002-v1',
      providerId: 'U-PRV-002',
      corridor: { sendCurrency: 'USD', receiveCurrency: 'VND' },
      rate: 25480,
      minAmount: 200,
      maxAmount: 3000,
      methods: ['momo', 'zalopay', 'bank-transfer'],
      slaHours: 4,
      expiryDate: '2026-06-25T23:59:59Z',
      status: 'active',
      rating: 4.7,
      completedCount: 89,
      onTimeRate: 95.5,
    },
    {
      id: 'DEAL-003',
      versionId: 'DEAL-003-v2',
      providerId: 'U-PRV-001',
      corridor: { sendCurrency: 'VND', receiveCurrency: 'USD' },
      rate: 25510,           // rate stored as VND per 1 USD (reciprocal for display)
      minAmount: 2000000,    // VND
      maxAmount: 100000000,
      methods: ['bank-transfer', 'momo'],
      slaHours: 3,
      expiryDate: '2026-06-28T23:59:59Z',
      status: 'active',
      rating: 4.9,
      completedCount: 247,
      onTimeRate: 98.4,
    },
    {
      id: 'DEAL-004',
      versionId: 'DEAL-004-v1',
      providerId: 'U-PRV-002',
      corridor: { sendCurrency: 'USD', receiveCurrency: 'SGD' },
      rate: 1.34,            // 1 USD = 1.34 SGD
      minAmount: 50,
      maxAmount: 2000,
      methods: ['paypal', 'bank-transfer'],
      slaHours: 6,
      expiryDate: '2026-07-15T23:59:59Z',
      status: 'paused',
      rating: 4.7,
      completedCount: 12,
      onTimeRate: 91.7,
    },
  ];

  // ─────────────────────────────────────────────
  // BENEFICIARIES
  // ─────────────────────────────────────────────
  const BENEFICIARIES = {
    'BEN-001': {
      id: 'BEN-001',
      name: 'Nguyễn Thị Lan',
      relation: 'family',
      bankName: 'Vietcombank',
      accountNumberMasked: '••• ••• 4321',
      accountNumberFull: '102 000 123 4321',
      branch: 'Hà Nội',
      phone: '+84 912 345 678',
    },
    'BEN-002': {
      id: 'BEN-002',
      name: 'Trần Văn Bình',
      relation: 'friend',
      bankName: 'Techcombank',
      accountNumberMasked: '••• ••• 8812',
      accountNumberFull: '190 001 987 8812',
      branch: 'TP.HCM',
      phone: '+84 933 222 111',
    },
  };

  // ─────────────────────────────────────────────
  // DEAL REQUESTS  (one per major status)
  // ─────────────────────────────────────────────
  const REQUESTS = [

    // ── pending_acceptance (T1 đang chạy) ──────
    {
      id: 'RQ-7K2M9',
      dealId: 'DEAL-001',
      dealVersionId: 'DEAL-001-v3',
      requesterId: 'U-REQ-001',
      providerId: 'U-PRV-001',
      status: 'pending_acceptance',
      amountSend: 500,
      sendCurrency: 'USD',
      amountReceive: 12750000,
      receiveCurrency: 'VND',
      requesterFee: 2.5,          // 0.5% × 500
      providerFee: 2.5,
      memo: 'P2P-7K2M9-XFER',
      beneficiary: BENEFICIARIES['BEN-001'],
      collateralLocked: 0,
      createdAt: '2026-06-12T08:00:00Z',
      t1Deadline: '2026-06-12T10:00:00Z',   // T1 = 2h
      statusHistory: [
        { status: 'pending_acceptance', at: '2026-06-12T08:00:00Z', by: 'U-REQ-001', note: 'Request created' },
      ],
    },

    // ── accepted (T2 đang chạy) — màn R-08 ────
    {
      id: 'RQ-4F8N1',
      dealId: 'DEAL-001',
      dealVersionId: 'DEAL-001-v3',
      requesterId: 'U-REQ-001',
      providerId: 'U-PRV-001',
      status: 'accepted',
      amountSend: 500,
      sendCurrency: 'USD',
      amountReceive: 12750000,
      receiveCurrency: 'VND',
      requesterFee: 2.5,
      providerFee: 2.5,
      memo: 'P2P-4F8N1-XFER',
      beneficiary: BENEFICIARIES['BEN-001'],
      collateralLocked: 13005000,  // max(12,750,000, 12,750,000) × 1.02
      createdAt: '2026-06-12T06:00:00Z',
      t1Deadline: '2026-06-12T08:00:00Z',
      t2Deadline: '2026-06-12T09:30:00Z',   // T2 = 1h từ khi accepted
      providerPaymentInfo: {
        method: 'zelle',
        accountMasked: '+1 ••• ••• 7890',
        accountFull: '+1 415 555 7890',
        holderName: 'Hung Manh Le',
        qrAvailable: false,
      },
      statusHistory: [
        { status: 'pending_acceptance', at: '2026-06-12T06:00:00Z', by: 'U-REQ-001', note: 'Request created' },
        { status: 'accepted',           at: '2026-06-12T08:30:00Z', by: 'U-PRV-001', note: 'Provider accepted, collateral locked' },
      ],
    },

    // ── payment_sent (T3 đang chạy) ────────────
    {
      id: 'RQ-2B5R7',
      dealId: 'DEAL-001',
      dealVersionId: 'DEAL-001-v3',
      requesterId: 'U-REQ-001',
      providerId: 'U-PRV-001',
      status: 'payment_sent',
      amountSend: 300,
      sendCurrency: 'USD',
      amountReceive: 7650000,
      receiveCurrency: 'VND',
      requesterFee: 1.5,
      providerFee: 1.5,
      memo: 'P2P-2B5R7-XFER',
      beneficiary: BENEFICIARIES['BEN-001'],
      collateralLocked: 7803000,
      createdAt: '2026-06-12T04:00:00Z',
      t2Deadline: '2026-06-12T06:30:00Z',
      t3Deadline: '2026-06-12T08:00:00Z',   // T3 = 1h từ khi payment_sent
      paymentProof: {
        id: 'PRF-001',
        type: 'payment',
        files: ['proof/rq-2b5r7-payment.jpg'],
        note: 'Đã chuyển qua Zelle, ref code trong ảnh',
        refCode: 'ZLL-2026-0612-98732',
        submittedAt: '2026-06-12T07:00:00Z',
        submittedBy: 'U-REQ-001',
      },
      statusHistory: [
        { status: 'pending_acceptance', at: '2026-06-12T04:00:00Z', by: 'U-REQ-001' },
        { status: 'accepted',           at: '2026-06-12T05:00:00Z', by: 'U-PRV-001' },
        { status: 'payment_sent',       at: '2026-06-12T07:00:00Z', by: 'U-REQ-001', note: 'Payment proof uploaded' },
      ],
    },

    // ── payment_confirmed (T4 đang chạy) ───────
    {
      id: 'RQ-9C3T6',
      dealId: 'DEAL-001',
      dealVersionId: 'DEAL-001-v3',
      requesterId: 'U-REQ-001',
      providerId: 'U-PRV-001',
      status: 'payment_confirmed',
      amountSend: 1000,
      sendCurrency: 'USD',
      amountReceive: 25500000,
      receiveCurrency: 'VND',
      requesterFee: 5,
      providerFee: 5,
      memo: 'P2P-9C3T6-XFER',
      beneficiary: BENEFICIARIES['BEN-001'],
      collateralLocked: 26010000,
      createdAt: '2026-06-12T02:00:00Z',
      t3Deadline: '2026-06-12T05:00:00Z',
      t4Deadline: '2026-06-12T10:30:00Z',   // T4 = SLA 2h + 30min từ confirmed
      paymentProof: {
        id: 'PRF-002',
        type: 'payment',
        files: ['proof/rq-9c3t6-payment.jpg'],
        note: 'Transfer via Zelle — $1000',
        refCode: 'ZLL-2026-0611-45621',
        submittedAt: '2026-06-12T03:00:00Z',
        submittedBy: 'U-REQ-001',
      },
      statusHistory: [
        { status: 'pending_acceptance', at: '2026-06-12T02:00:00Z', by: 'U-REQ-001' },
        { status: 'accepted',           at: '2026-06-12T02:30:00Z', by: 'U-PRV-001' },
        { status: 'payment_sent',       at: '2026-06-12T03:00:00Z', by: 'U-REQ-001' },
        { status: 'payment_confirmed',  at: '2026-06-12T04:00:00Z', by: 'U-PRV-001', note: 'Confirmed received $1,000' },
      ],
    },

    // ── transfer_sent (T5 đang chạy) ───────────
    {
      id: 'RQ-6D1W4',
      dealId: 'DEAL-001',
      dealVersionId: 'DEAL-001-v3',
      requesterId: 'U-REQ-001',
      providerId: 'U-PRV-001',
      status: 'transfer_sent',
      amountSend: 250,
      sendCurrency: 'USD',
      amountReceive: 6375000,
      receiveCurrency: 'VND',
      requesterFee: 1.25,
      providerFee: 1.25,
      memo: 'P2P-6D1W4-XFER',
      beneficiary: BENEFICIARIES['BEN-001'],
      collateralLocked: 6502500,
      createdAt: '2026-06-11T22:00:00Z',
      t4Deadline: '2026-06-12T01:30:00Z',
      t5Deadline: '2026-06-13T00:00:00Z',   // T5 = 24h từ khi transfer_sent
      paymentProof: {
        id: 'PRF-003',
        type: 'payment',
        files: ['proof/rq-6d1w4-payment.jpg'],
        note: 'Sent via Venmo',
        refCode: 'VNM-2026-0611-11234',
        submittedAt: '2026-06-11T23:00:00Z',
        submittedBy: 'U-REQ-001',
      },
      transferProof: {
        id: 'PRF-004',
        type: 'transfer',
        files: ['proof/rq-6d1w4-transfer.jpg'],
        note: 'Đã chuyển 6,375,000 ₫ về Vietcombank chi nhánh Hà Nội',
        refCode: 'VCB-2026-0612-67891',
        submittedAt: '2026-06-12T00:30:00Z',
        submittedBy: 'U-PRV-001',
      },
      statusHistory: [
        { status: 'pending_acceptance', at: '2026-06-11T22:00:00Z', by: 'U-REQ-001' },
        { status: 'accepted',           at: '2026-06-11T22:15:00Z', by: 'U-PRV-001' },
        { status: 'payment_sent',       at: '2026-06-11T23:00:00Z', by: 'U-REQ-001' },
        { status: 'payment_confirmed',  at: '2026-06-11T23:30:00Z', by: 'U-PRV-001' },
        { status: 'transfer_sent',      at: '2026-06-12T00:30:00Z', by: 'U-PRV-001', note: 'Transfer proof uploaded' },
      ],
    },

    // ── completed ───────────────────────────────
    {
      id: 'RQ-5A9P2',
      dealId: 'DEAL-001',
      dealVersionId: 'DEAL-001-v2',
      requesterId: 'U-REQ-001',
      providerId: 'U-PRV-001',
      status: 'completed',
      amountSend: 200,
      sendCurrency: 'USD',
      amountReceive: 5100000,
      receiveCurrency: 'VND',
      requesterFee: 1,
      providerFee: 1,
      memo: 'P2P-5A9P2-XFER',
      beneficiary: BENEFICIARIES['BEN-001'],
      collateralLocked: 0,
      createdAt: '2026-06-10T10:00:00Z',
      completedAt: '2026-06-10T13:45:00Z',
      paymentProof: {
        id: 'PRF-005',
        type: 'payment',
        files: ['proof/rq-5a9p2-payment.jpg'],
        note: 'PayPal transfer done — $200',
        refCode: 'PPL-2026-0610-99001',
        submittedAt: '2026-06-10T11:00:00Z',
        submittedBy: 'U-REQ-001',
      },
      transferProof: {
        id: 'PRF-006',
        type: 'transfer',
        files: ['proof/rq-5a9p2-transfer.jpg'],
        note: 'Chuyển khoản thành công 5,100,000 ₫ về Vietcombank',
        refCode: 'VCB-2026-0610-55123',
        submittedAt: '2026-06-10T12:30:00Z',
        submittedBy: 'U-PRV-001',
      },
      statusHistory: [
        { status: 'pending_acceptance', at: '2026-06-10T10:00:00Z', by: 'U-REQ-001' },
        { status: 'accepted',           at: '2026-06-10T10:20:00Z', by: 'U-PRV-001' },
        { status: 'payment_sent',       at: '2026-06-10T11:00:00Z', by: 'U-REQ-001' },
        { status: 'payment_confirmed',  at: '2026-06-10T11:30:00Z', by: 'U-PRV-001' },
        { status: 'transfer_sent',      at: '2026-06-10T12:30:00Z', by: 'U-PRV-001' },
        { status: 'completed',          at: '2026-06-10T13:45:00Z', by: 'U-REQ-001', note: 'Requester confirmed receipt' },
      ],
      requesterRating: { score: 5, comment: 'Rất nhanh và uy tín!' },
      providerRating:  { score: 5, comment: 'Khách hàng tốt, thanh toán đúng hạn' },
    },

    // ── disputed (T6 đang chạy) ─────────────────
    {
      id: 'RQ-3H7V0',
      dealId: 'DEAL-002',
      dealVersionId: 'DEAL-002-v1',
      requesterId: 'U-REQ-001',
      providerId: 'U-PRV-002',
      status: 'disputed',
      amountSend: 400,
      sendCurrency: 'USD',
      amountReceive: 10192000,
      receiveCurrency: 'VND',
      requesterFee: 2,
      providerFee: 2,
      memo: 'P2P-3H7V0-XFER',
      beneficiary: BENEFICIARIES['BEN-002'],
      collateralLocked: 10395840,  // frozen — INV-04: không unlock khi disputed
      createdAt: '2026-06-11T08:00:00Z',
      dispute: {
        id: 'DISP-001',
        openedBy: 'U-REQ-001',
        openedAt: '2026-06-11T22:00:00Z',
        reason: 'Beneficiary chưa nhận được tiền sau 6 giờ kể từ khi Provider xác nhận đã chuyển.',
        status: 'open',
        t6Deadline: '2026-06-13T22:00:00Z',   // T6 = 48h
        assignedAdmin: 'U-ADM-001',
        evidenceRequested: false,
        timeline: [
          { at: '2026-06-11T22:00:00Z', by: 'U-REQ-001',  action: 'open_dispute',  note: 'Chưa nhận tiền sau 6h' },
          { at: '2026-06-11T22:05:00Z', by: 'system',     action: 'assign_admin',  note: 'Assigned to U-ADM-001' },
          { at: '2026-06-11T22:10:00Z', by: 'U-ADM-001',  action: 'acknowledge',   note: 'Admin đã nhận case' },
        ],
      },
      paymentProof: {
        id: 'PRF-007',
        type: 'payment',
        files: ['proof/rq-3h7v0-payment.jpg'],
        note: 'Zelle payment $400',
        refCode: 'ZLL-2026-0611-77890',
        submittedAt: '2026-06-11T10:00:00Z',
        submittedBy: 'U-REQ-001',
      },
      transferProof: {
        id: 'PRF-008',
        type: 'transfer',
        files: ['proof/rq-3h7v0-transfer.jpg'],
        note: 'Provider xác nhận đã chuyển',
        refCode: 'TCB-2026-0611-11122',
        submittedAt: '2026-06-11T16:00:00Z',
        submittedBy: 'U-PRV-002',
      },
      statusHistory: [
        { status: 'pending_acceptance', at: '2026-06-11T08:00:00Z', by: 'U-REQ-001' },
        { status: 'accepted',           at: '2026-06-11T08:30:00Z', by: 'U-PRV-002' },
        { status: 'payment_sent',       at: '2026-06-11T10:00:00Z', by: 'U-REQ-001' },
        { status: 'payment_confirmed',  at: '2026-06-11T11:00:00Z', by: 'U-PRV-002' },
        { status: 'transfer_sent',      at: '2026-06-11T16:00:00Z', by: 'U-PRV-002' },
        { status: 'disputed',           at: '2026-06-11T22:00:00Z', by: 'U-REQ-001', note: 'Dispute opened' },
      ],
    },

    // ── rejected ────────────────────────────────
    {
      id: 'RQ-1J4K8',
      dealId: 'DEAL-001',
      dealVersionId: 'DEAL-001-v3',
      requesterId: 'U-REQ-001',
      providerId: 'U-PRV-001',
      status: 'rejected',
      amountSend: 5100,   // vượt maxAmount
      sendCurrency: 'USD',
      amountReceive: 130050000,
      receiveCurrency: 'VND',
      requesterFee: 25.5,
      providerFee: 25.5,
      memo: 'P2P-1J4K8-XFER',
      beneficiary: BENEFICIARIES['BEN-001'],
      collateralLocked: 0,
      createdAt: '2026-06-11T15:00:00Z',
      rejectedAt: '2026-06-11T15:45:00Z',
      rejectedReason: 'Vượt hạn mức tối đa trong ngày của Provider. Vui lòng thử lại hoặc tìm Provider khác.',
      statusHistory: [
        { status: 'pending_acceptance', at: '2026-06-11T15:00:00Z', by: 'U-REQ-001' },
        { status: 'rejected',           at: '2026-06-11T15:45:00Z', by: 'U-PRV-001', note: 'Vượt hạn mức ngày' },
      ],
    },

    // ── cancelled (Requester hủy trước accepted) ─
    {
      id: 'RQ-8E2G5',
      dealId: 'DEAL-002',
      dealVersionId: 'DEAL-002-v1',
      requesterId: 'U-REQ-001',
      providerId: 'U-PRV-002',
      status: 'cancelled',
      amountSend: 150,
      sendCurrency: 'USD',
      amountReceive: 3822000,
      receiveCurrency: 'VND',
      requesterFee: 0.75,
      providerFee: 0.75,
      memo: 'P2P-8E2G5-XFER',
      beneficiary: BENEFICIARIES['BEN-001'],
      collateralLocked: 0,
      createdAt: '2026-06-10T16:00:00Z',
      cancelledAt: '2026-06-10T16:20:00Z',
      cancelledReason: 'Requester huỷ trước khi Provider chấp nhận',
      statusHistory: [
        { status: 'pending_acceptance', at: '2026-06-10T16:00:00Z', by: 'U-REQ-001' },
        { status: 'cancelled',          at: '2026-06-10T16:20:00Z', by: 'U-REQ-001', note: 'Cancelled by requester' },
      ],
    },

    // ── expired (T1 hết hạn) ────────────────────
    {
      id: 'RQ-0L6Q3',
      dealId: 'DEAL-001',
      dealVersionId: 'DEAL-001-v3',
      requesterId: 'U-REQ-001',
      providerId: 'U-PRV-001',
      status: 'expired',
      amountSend: 100,
      sendCurrency: 'USD',
      amountReceive: 2550000,
      receiveCurrency: 'VND',
      requesterFee: 0.5,
      providerFee: 0.5,
      memo: 'P2P-0L6Q3-XFER',
      beneficiary: BENEFICIARIES['BEN-001'],
      collateralLocked: 0,
      createdAt: '2026-06-09T10:00:00Z',
      expiredAt: '2026-06-09T12:00:00Z',
      expiredReason: 'T1 timeout — Provider không phản hồi trong 2 giờ',
      statusHistory: [
        { status: 'pending_acceptance', at: '2026-06-09T10:00:00Z', by: 'U-REQ-001' },
        { status: 'expired',            at: '2026-06-09T12:00:00Z', by: 'system',    note: 'T1 timer expired' },
      ],
    },

    // ── resolved (Admin outcome R1_complete) ────
    {
      id: 'RQ-7N8M2',
      dealId: 'DEAL-002',
      dealVersionId: 'DEAL-002-v1',
      requesterId: 'U-REQ-001',
      providerId: 'U-PRV-002',
      status: 'resolved',
      amountSend: 350,
      sendCurrency: 'USD',
      amountReceive: 8918000,
      receiveCurrency: 'VND',
      requesterFee: 1.75,
      providerFee: 1.75,
      memo: 'P2P-7N8M2-XFER',
      beneficiary: BENEFICIARIES['BEN-002'],
      collateralLocked: 0,
      createdAt: '2026-06-08T09:00:00Z',
      resolvedAt: '2026-06-09T18:00:00Z',
      dispute: {
        id: 'DISP-002',
        openedBy: 'U-REQ-001',
        openedAt: '2026-06-08T22:00:00Z',
        reason: 'Không nhận được tiền sau 12 giờ',
        status: 'resolved',
        resolvedAt: '2026-06-09T18:00:00Z',
        outcome: 'R1_complete',
        adminNote: 'Xác minh: Beneficiary đã nhận đủ. Requester không xác nhận trong T5. Thu phí 2 bên, unlock collateral.',
        assignedAdmin: 'U-ADM-001',
      },
      statusHistory: [
        { status: 'pending_acceptance', at: '2026-06-08T09:00:00Z', by: 'U-REQ-001' },
        { status: 'accepted',           at: '2026-06-08T09:30:00Z', by: 'U-PRV-002' },
        { status: 'payment_sent',       at: '2026-06-08T10:00:00Z', by: 'U-REQ-001' },
        { status: 'payment_confirmed',  at: '2026-06-08T11:00:00Z', by: 'U-PRV-002' },
        { status: 'transfer_sent',      at: '2026-06-08T14:00:00Z', by: 'U-PRV-002' },
        { status: 'disputed',           at: '2026-06-08T22:00:00Z', by: 'U-REQ-001' },
        { status: 'resolved',           at: '2026-06-09T18:00:00Z', by: 'U-ADM-001', note: 'R1_complete — Beneficiary xác nhận nhận tiền' },
      ],
    },
  ];

  // ─────────────────────────────────────────────
  // PROVIDER WALLETS
  // ─────────────────────────────────────────────
  const PROVIDER_WALLETS = {
    'U-PRV-001': {
      userId: 'U-PRV-001',
      currency: 'VND',
      available: 85000000,
      locked: 47320500,    // RQ-4F8N1 + RQ-2B5R7 + RQ-9C3T6 + RQ-6D1W4
      frozen: 0,
      totalBalance: 132320500,
      updatedAt: '2026-06-12T08:30:00Z',
    },
    'U-PRV-002': {
      userId: 'U-PRV-002',
      currency: 'VND',
      available: 55000000,
      locked: 0,
      frozen: 10395840,    // RQ-3H7V0 disputed — INV-04
      totalBalance: 65395840,
      updatedAt: '2026-06-12T08:00:00Z',
    },
  };

  // ─────────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────────
  const NOTIFICATIONS = [
    {
      id: 'NOTIF-001',
      userId: 'U-REQ-001',
      type: 'request_accepted',
      requestId: 'RQ-4F8N1',
      message: 'Provider đã chấp nhận yêu cầu RQ-4F8N1. Bạn có 1 giờ để chuyển tiền.',
      isRead: false,
      createdAt: '2026-06-12T08:30:00Z',
    },
    {
      id: 'NOTIF-002',
      userId: 'U-PRV-001',
      type: 'payment_sent',
      requestId: 'RQ-2B5R7',
      message: 'Requester đã tải bằng chứng thanh toán cho RQ-2B5R7. Vui lòng xác nhận nhận tiền.',
      isRead: false,
      createdAt: '2026-06-12T07:00:00Z',
    },
    {
      id: 'NOTIF-003',
      userId: 'U-ADM-001',
      type: 'dispute_opened',
      requestId: 'RQ-3H7V0',
      message: 'Tranh chấp mới: RQ-3H7V0. Cần xử lý trong 48 giờ (deadline: 2026-06-13T22:00).',
      isRead: true,
      createdAt: '2026-06-11T22:05:00Z',
    },
    {
      id: 'NOTIF-004',
      userId: 'U-REQ-001',
      type: 'transfer_sent',
      requestId: 'RQ-6D1W4',
      message: 'Provider đã chuyển tiền cho người nhận. Vui lòng xác nhận sau khi nhận được.',
      isRead: true,
      createdAt: '2026-06-12T00:30:00Z',
    },
    {
      id: 'NOTIF-005',
      userId: 'U-REQ-001',
      type: 'sla_warning',
      requestId: 'RQ-4F8N1',
      message: 'Chỉ còn 30 phút để chuyển tiền cho RQ-4F8N1. Hết hạn lúc 09:30.',
      isRead: false,
      createdAt: '2026-06-12T09:00:00Z',
    },
  ];

  // ─────────────────────────────────────────────
  // RATINGS
  // ─────────────────────────────────────────────
  const RATINGS = [
    {
      id: 'RAT-001',
      requestId: 'RQ-5A9P2',
      from: 'U-REQ-001',
      to: 'U-PRV-001',
      score: 5,
      comment: 'Rất nhanh và uy tín! Sẽ dùng lại.',
      createdAt: '2026-06-10T14:00:00Z',
    },
    {
      id: 'RAT-002',
      requestId: 'RQ-5A9P2',
      from: 'U-PRV-001',
      to: 'U-REQ-001',
      score: 5,
      comment: 'Khách hàng tốt, thanh toán đúng hạn, memo đầy đủ',
      createdAt: '2026-06-10T14:05:00Z',
    },
  ];

  // ─────────────────────────────────────────────
  // HELPER FUNCTIONS
  // ─────────────────────────────────────────────

  function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency', currency: 'VND',
    }).format(amount);
  }

  function formatUSD(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(amount);
  }

  function formatAmount(amount, currencyCode) {
    switch (currencyCode) {
      case 'VND': return formatVND(amount);
      case 'USD': return formatUSD(amount);
      default:    return amount.toLocaleString() + ' ' + currencyCode;
    }
  }

  function getUser(id)    { return USERS[id] || null; }
  function getDeal(id)    { return DEALS.find(function (d) { return d.id === id; }) || null; }
  function getRequest(id) { return REQUESTS.find(function (r) { return r.id === id; }) || null; }

  function getRequestsByStatus(status) {
    return REQUESTS.filter(function (r) { return r.status === status; });
  }

  function getRequestsByUser(userId, role) {
    if (role === 'requester') return REQUESTS.filter(function (r) { return r.requesterId === userId; });
    if (role === 'provider')  return REQUESTS.filter(function (r) { return r.providerId === userId; });
    return REQUESTS;
  }

  function getWallet(userId) { return PROVIDER_WALLETS[userId] || null; }

  function getNotifications(userId) {
    return NOTIFICATIONS.filter(function (n) { return n.userId === userId; });
  }

  function getUnreadCount(userId) {
    return NOTIFICATIONS.filter(function (n) { return n.userId === userId && !n.isRead; }).length;
  }

  // Fixed "now" = 2026-06-12T09:00:00Z so demos are stable
  var _NOW = new Date('2026-06-12T09:00:00Z');

  function timeAgo(isoString) {
    var diffMs  = _NOW - new Date(isoString);
    var diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1)  return 'vừa xong';
    if (diffMin < 60) return diffMin + ' phút trước';
    var diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24)  return diffHr + ' giờ trước';
    return Math.floor(diffHr / 24) + ' ngày trước';
  }

  // Countdown: returns { h, m, s, totalSeconds, isUrgent, isWarning } or null if expired/no deadline
  function getCountdown(deadlineISO) {
    if (!deadlineISO) return null;
    var diffMs = new Date(deadlineISO) - _NOW;
    if (diffMs <= 0) return { h: 0, m: 0, s: 0, totalSeconds: 0, isExpired: true, isUrgent: false, isWarning: false };
    var totalSeconds = Math.floor(diffMs / 1000);
    var h = Math.floor(totalSeconds / 3600);
    var m = Math.floor((totalSeconds % 3600) / 60);
    var s = totalSeconds % 60;
    var isUrgent  = totalSeconds < 600;   // < 10 min — danger red
    var isWarning = totalSeconds < 1800;  // < 30 min — warning amber
    return { h: h, m: m, s: s, totalSeconds: totalSeconds, isExpired: false, isUrgent: isUrgent, isWarning: isWarning };
  }

  function formatCountdown(deadlineISO) {
    var cd = getCountdown(deadlineISO);
    if (!cd || cd.isExpired) return 'Hết hạn';
    if (cd.h > 0) return cd.h + ':' + pad2(cd.m) + ':' + pad2(cd.s);
    return pad2(cd.m) + ':' + pad2(cd.s);
  }

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function getStatusLabel(status) {
    var labels = {
      pending_acceptance: 'Chờ Provider duyệt',
      accepted:           'Chờ bạn chuyển tiền',
      payment_sent:       'Chờ Provider xác nhận',
      payment_confirmed:  'Provider đang chuyển',
      transfer_sent:      'Chờ bạn xác nhận',
      completed:          'Hoàn tất',
      rejected:           'Bị từ chối',
      cancelled:          'Đã huỷ',
      expired:            'Hết hạn',
      disputed:           'Đang khiếu nại',
      resolved:           'Đã xử lý',
    };
    return labels[status] || status;
  }

  // Returns CSS class names matching theme.css badge variants
  function getStatusBadgeClass(status) {
    var classes = {
      pending_acceptance: 'badge-pending',
      accepted:           'badge-accepted',
      payment_sent:       'badge-payment-sent',
      payment_confirmed:  'badge-payment-sent',  // reuse lavender
      transfer_sent:      'badge-pending',
      completed:          'badge-completed',
      rejected:           'badge-disputed',
      cancelled:          'badge-disputed',
      expired:            'badge-disputed',
      disputed:           'badge-disputed',
      resolved:           'badge-completed',
    };
    return classes[status] || 'badge-pending';
  }

  function getMethodLabel(method) {
    var labels = { zelle: 'Zelle', venmo: 'Venmo', paypal: 'PayPal', momo: 'MoMo', zalopay: 'ZaloPay', 'bank-transfer': 'Bank Transfer' };
    return labels[method] || method;
  }

  function getMethodIcon(method) {
    var imgs = {
      'zelle':        'zelle.png',
      'venmo':        'venmo.png',
      'paypal':       'paypal.png',
      'momo':         'momo.png',
      'zalopay':      'zalopay.png',
      'bank-transfer':'bank-transfer.png',
      'apple-cash':   'apple_cash.png',
      'sepa':         'sepa.png',
      'alipay':       'alipay.png',
      'cash':         'cash.png',
      'cash-app':     'cash_app.png',
      'kakao-pay':    'kakao-pay.png',
      'pay-id':       'pay-id.png',
      'pay-now':      'pay-now.png',
      'wechat-pay':   'wechat-pay.png',
      'prompt-pay':   'promt-pay.png',
    };
    var file = imgs[method];
    if (!file) return '<span style="font-size:18px;">💸</span>';
    var label = getMethodLabel(method);
    return '<img class="method-icon" src="../images/' + file + '" alt="' + label + '">';
  }

  // collateralRequired = max(payoutVND, refundExposure) × (1 + bufferRate)
  function calcCollateral(amountSend, rate, bufferRate) {
    bufferRate = bufferRate !== undefined ? bufferRate : 0.02;
    var payoutVND = amountSend * rate;
    return Math.ceil(Math.max(payoutVND, payoutVND) * (1 + bufferRate));
  }

  // ─────────────────────────────────────────────
  // EXPORT
  // ─────────────────────────────────────────────
  global.P2P_DATA = {
    // Raw data
    CURRENCIES:       CURRENCIES,
    USERS:            USERS,
    DEALS:            DEALS,
    BENEFICIARIES:    BENEFICIARIES,
    REQUESTS:         REQUESTS,
    PROVIDER_WALLETS: PROVIDER_WALLETS,
    NOTIFICATIONS:    NOTIFICATIONS,
    RATINGS:          RATINGS,

    // Lookups
    getUser:               getUser,
    getDeal:               getDeal,
    getRequest:            getRequest,
    getRequestsByStatus:   getRequestsByStatus,
    getRequestsByUser:     getRequestsByUser,
    getWallet:             getWallet,
    getNotifications:      getNotifications,
    getUnreadCount:        getUnreadCount,

    // Formatting
    formatVND:         formatVND,
    formatUSD:         formatUSD,
    formatAmount:      formatAmount,
    timeAgo:           timeAgo,
    getCountdown:      getCountdown,
    formatCountdown:   formatCountdown,

    // UI helpers
    getStatusLabel:      getStatusLabel,
    getStatusBadgeClass: getStatusBadgeClass,
    getMethodLabel:      getMethodLabel,
    getMethodIcon:       getMethodIcon,
    calcCollateral:      calcCollateral,

    // Demo shortcuts (override per screen as needed)
    DEMO: {
      NOW:           _NOW.toISOString(),
      requester:     USERS['U-REQ-001'],
      provider:      USERS['U-PRV-001'],
      admin:         USERS['U-ADM-001'],
      // R-08 screen active request:
      activeRequest: REQUESTS.find(function (r) { return r.id === 'RQ-4F8N1'; }),
    },
  };

})(window);
