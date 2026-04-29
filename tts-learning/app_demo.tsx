import React, { useState } from 'react';
import {
    LayoutDashboard, Briefcase, Users, Calendar, BookOpen,
    Trello, ClipboardCheck, ShieldCheck, FileText, Settings,
    Bell, Search, MessageSquare, ChevronDown, MoreHorizontal,
    Plus, Filter, Download, ChevronRight, CheckCircle, Clock,
    PlayCircle, FileText as FileIcon, Edit, Trash, Mail,
    CreditCard, Grid, List, Check, X, Upload, Home, ArrowLeft, ArrowRight,
    Menu, Smartphone, Monitor
} from 'lucide-react';

// --- Types ---

type ScreenType =
    | 'dashboard'
    | 'candidates'
    | 'interviews'
    | 'learning'
    | 'projects'
    | 'evaluation'
    | 'approval'
    | 'jobpost'
    | 'lms'
    | 'settings';

// --- Components ---

const SidebarItem = ({
    icon: Icon,
    label,
    active,
    onClick,
    badge
}: {
    icon: any,
    label: string,
    active: boolean,
    onClick: () => void,
    badge?: number
}) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
    >
        <Icon size={20} className={active ? 'text-blue-600' : 'text-slate-400'} />
        <span className="font-medium text-sm flex-1 text-left">{label}</span>
        {badge && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {badge}
            </span>
        )}
    </button>
);

const Avatar = ({ src, alt, size = "md", className = "" }: { src: string, alt: string, size?: "sm" | "md" | "lg" | "xl", className?: string }) => {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-16 h-16",
        xl: "w-24 h-24"
    };
    return (
        <img
            src={src}
            alt={alt}
            className={`rounded-full object-cover border border-slate-200 ${sizeClasses[size]} ${className}`}
        />
    );
};

const Badge = ({ children, color = "blue" }: { children?: React.ReactNode, color?: "blue" | "green" | "yellow" | "red" | "purple" | "slate" }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        green: "bg-emerald-50 text-emerald-700 border-emerald-100",
        yellow: "bg-amber-50 text-amber-700 border-amber-100",
        red: "bg-rose-50 text-rose-700 border-rose-100",
        purple: "bg-purple-50 text-purple-700 border-purple-100",
        slate: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color]}`}>
            {children}
        </span>
    );
};

const ProgressBar = ({ percent, color = "blue" }: { percent: number, color?: string }) => (
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
            className={`h-full rounded-full ${color === 'green' ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: `${percent}%` }}
        />
    </div>
);

// --- Screens ---

const DashboardScreen = () => (
    <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
                { title: "Vị trí đang tuyển", value: "12", trend: "+2", sub: "so với tuần trước", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
                { title: "Hồ sơ chờ duyệt", value: "45", sub: "Cần xem xét", icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
                { title: "Phỏng vấn sắp tới", value: "8", badge: "Hôm nay", sub: "Cuộc tiếp theo trong 30p", icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
                { title: "Tỷ lệ chuyển đổi", value: "18%", trend: "1.5%", sub: "so với tháng trước", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((card, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 text-sm font-medium">{card.title}</span>
                        <div className={`p-2 rounded-lg ${card.bg}`}>
                            <card.icon size={20} className={card.color} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-slate-900">{card.value}</h3>
                        {card.trend && <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-1.5 py-0.5 rounded">↑ {card.trend}</span>}
                        {card.badge && <span className="text-purple-600 text-xs font-bold bg-purple-50 px-1.5 py-0.5 rounded">{card.badge}</span>}
                    </div>
                    <p className="text-slate-400 text-xs mt-1">{card.sub}</p>
                </div>
            ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Chiến dịch tuyển dụng</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                        <Plus size={16} /> Tạo kế hoạch
                    </button>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Tên chiến dịch</th>
                                <th className="px-6 py-4">Phòng ban</th>
                                <th className="px-6 py-4">Ngày bắt đầu</th>
                                <th className="px-6 py-4">Ứng viên</th>
                                <th className="px-6 py-4">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[
                                { name: "Kỹ thuật Mùa hè 2024", dept: "Kỹ thuật", date: "15 Th3, 2024", cands: 24, status: "active" },
                                { name: "Thực tập sinh Marketing", dept: "Marketing", date: "01 Th4, 2024", cands: 8, status: "pending" },
                                { name: "Thiết kế UX/UI", dept: "Thiết kế", date: "20 Th2, 2024", cands: 12, status: "closed" },
                                { name: "Khoa học dữ liệu", dept: "Dữ liệu", date: "22 Th3, 2024", cands: 5, status: "active" },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                                    <td className="px-6 py-4 text-slate-500">{row.dept}</td>
                                    <td className="px-6 py-4 text-slate-500">{row.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(n => <div key={n} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white"></div>)}
                                            <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">+{row.cands}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge color={row.status === 'active' ? 'green' : row.status === 'pending' ? 'yellow' : 'slate'}>
                                            {row.status === 'active' ? 'Đang hoạt động' : row.status === 'pending' ? 'Chờ duyệt' : 'Đã đóng'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="w-full lg:w-80 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Lịch trình hôm nay</h3>
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">
                    {[
                        { time: "10:00 AM", title: "Phỏng vấn Frontend", with: "Michael Chen", type: "Zoom" },
                        { time: "11:30 AM", title: "Review Portfolio", with: "Sarah Miller", type: "Room 302" },
                        { time: "02:00 PM", title: "Họp Team Lead", with: "David Kim", type: "Google Meet" },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-4 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                            <div className="flex flex-col items-center min-w-[50px] bg-slate-100 rounded-lg p-2 h-fit">
                                <span className="text-xs text-slate-500 font-bold">{item.time.split(' ')[0]}</span>
                                <span className="text-[10px] text-slate-400">{item.time.split(' ')[1]}</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                                <p className="text-xs text-slate-500 mb-1">với {item.with}</p>
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{item.type}</span>
                            </div>
                        </div>
                    ))}
                    <button className="w-full py-2 text-sm text-blue-600 font-semibold hover:bg-blue-50 rounded-lg">Xem toàn bộ lịch</button>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 text-white relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                    <h4 className="font-bold relative z-10">Cần người hướng dẫn?</h4>
                    <p className="text-blue-100 text-xs mt-1 mb-4 relative z-10">Phân công mentor cho đợt thực tập mới.</p>
                    <button className="bg-white text-blue-600 text-xs font-bold py-2 px-4 rounded-lg w-full relative z-10 shadow-sm">Phân công ngay</button>
                </div>
            </div>
        </div>
    </div>
);

const CandidateListScreen = () => (
    <div className="p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900">Sàng lọc hồ sơ: Frontend Intern</h1>
                    <Badge color="green">Đang hoạt động</Badge>
                </div>
                <p className="text-slate-500 text-sm mt-1">Quản lý và sàng lọc các đơn ứng tuyển cho đợt Mùa hè 2024.</p>
            </div>
            <div className="flex gap-3">
                <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Chỉnh sửa</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">+ Đăng tin mới</button>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
                { label: "Tổng số hồ sơ", val: "142", trend: "+12%", icon: Users, color: "text-slate-400" },
                { label: "Chờ xem xét", val: "28", sub: "Cần xử lý ngay", icon: Clock, color: "text-amber-500", border: "border-l-4 border-amber-500" },
                { label: "Danh sách rút gọn", val: "15", sub: "Sẵn sàng phỏng vấn", icon: CheckCircle, color: "text-blue-500", border: "border-l-4 border-blue-500" },
                { label: "Từ chối", val: "99", sub: "Lưu trữ", icon: X, color: "text-slate-400" },
            ].map((stat, i) => (
                <div key={i} className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm ${stat.border || ''}`}>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                        <stat.icon size={20} className={stat.color} />
                    </div>
                    <div className="mt-2 text-3xl font-bold text-slate-900">{stat.val}</div>
                    {stat.trend && <span className="text-xs text-emerald-600 font-medium">{stat.trend} so với tuần trước</span>}
                    {stat.sub && <span className="text-xs text-slate-400">{stat.sub}</span>}
                </div>
            ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tìm ứng viên..." />
                </div>
                <div className="flex gap-2">
                    <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600"><Filter size={18} /></button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-200"><Download size={18} /> Xuất CSV</button>
                </div>
            </div>
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-4">Ứng viên</th>
                        <th className="px-6 py-4">Ngày ứng tuyển</th>
                        <th className="px-6 py-4">Trạng thái</th>
                        <th className="px-6 py-4">Điểm phù hợp</th>
                        <th className="px-6 py-4 text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                    {[
                        { name: "Sarah Jenkins", email: "sarah.j@example.com", date: "24 Th10, 2023", status: "pending", score: 92 },
                        { name: "David Chen", email: "david.c@uni.edu", date: "23 Th10, 2023", status: "screened", score: 78 },
                        { name: "Marcus Jones", email: "m.jones@email.com", date: "22 Th10, 2023", status: "rejected", score: 45 },
                        { name: "Emily Wong", email: "emily.w@design.io", date: "20 Th10, 2023", status: "shortlisted", score: 98 },
                    ].map((c, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 bg-center bg-cover" style={{ backgroundImage: `url(https://picsum.photos/seed/${c.name}/100)` }}></div>
                                    <div>
                                        <div className="font-semibold text-slate-900">{c.name}</div>
                                        <div className="text-xs text-slate-500">{c.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{c.date}</td>
                            <td className="px-6 py-4">
                                <Badge color={c.status === 'shortlisted' ? 'green' : c.status === 'rejected' ? 'red' : c.status === 'screened' ? 'blue' : 'yellow'}>
                                    {c.status === 'shortlisted' ? 'Rút gọn' : c.status === 'rejected' ? 'Từ chối' : c.status === 'screened' ? 'Đã lọc' : 'Chờ duyệt'}
                                </Badge>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${c.score > 80 ? 'bg-emerald-500' : c.score > 50 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${c.score}%` }}></div>
                                    </div>
                                    <span className="font-medium text-slate-700">{c.score}%</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-slate-400 hover:text-blue-600"><MoreHorizontal size={20} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const InterviewSchedulerScreen = () => (
    <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Lên lịch phỏng vấn</h1>
                <p className="text-slate-500 text-sm">Chọn ứng viên và cấu hình lời mời.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium"><Filter size={16} /> Bộ lọc</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 flex flex-col h-[600px] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-700">Hàng đợi ứng viên</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">5 Đã chọn</span>
                </div>
                <div className="overflow-y-auto flex-1">
                    {[
                        { name: "Alice Smith", role: "UX Intern", score: 92 },
                        { name: "Bob Jones", role: "Frontend Dev", score: 88 },
                        { name: "Charlie Day", role: "Product Mgmt", score: 85 },
                        { name: "Dana Lee", role: "Marketing", score: 82 },
                        { name: "Evan Wright", role: "Sales", score: 80 },
                    ].map((c, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 border-b border-slate-100 hover:bg-blue-50 cursor-pointer bg-blue-50/30">
                            <input type="checkbox" checked className="rounded text-blue-600 focus:ring-blue-500" />
                            <div className="w-8 h-8 rounded-full bg-slate-200 bg-center bg-cover" style={{ backgroundImage: `url(https://picsum.photos/seed/${c.name}/100)` }}></div>
                            <div className="flex-1">
                                <div className="font-medium text-sm text-slate-900">{c.name}</div>
                                <div className="text-xs text-slate-500">{c.role}</div>
                            </div>
                            <Badge color="green">{c.score}</Badge>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-lg font-bold text-slate-900">Cấu hình & Gửi</h2>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button className="px-3 py-1 bg-white shadow text-xs font-bold rounded text-slate-900">Mời</button>
                            <button className="px-3 py-1 text-xs font-medium text-slate-500">Từ chối</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2"><Calendar size={16} className="text-blue-500" /> Chi tiết</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="block text-sm font-medium text-slate-700">
                                Ngày
                                <input type="date" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-slate-50" />
                            </label>
                            <label className="block text-sm font-medium text-slate-700">
                                Khung giờ
                                <div className="flex items-center gap-2 mt-1">
                                    <input type="time" defaultValue="10:00" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-slate-50" />
                                    <span>-</span>
                                    <input type="time" defaultValue="11:00" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-slate-50" />
                                </div>
                            </label>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Link họp</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Monitor size={16} className="text-slate-400" />
                                </div>
                                <input type="text" defaultValue="https://meet.google.com/abc-defg-hij" className="pl-10 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-slate-50" />
                            </div>
                        </div>

                        <hr className="border-slate-100 my-4" />

                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2"><Mail size={16} className="text-blue-500" /> Email Preview</h3>
                            <button className="text-xs text-blue-600 font-medium hover:underline">Quản lý mẫu</button>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-sm text-slate-700 font-sans">
                            <p className="mb-4">Chào <span className="bg-blue-100 text-blue-800 px-1 rounded font-mono text-xs">{`{Candidate_Name}`}</span>,</p>
                            <p className="mb-4">Chúng tôi rất ấn tượng với hồ sơ của bạn cho vị trí <span className="bg-blue-100 text-blue-800 px-1 rounded font-mono text-xs">{`{Role}`}</span>. Chúng tôi trân trọng mời bạn tham gia phỏng vấn.</p>
                            <div className="bg-white p-3 rounded border border-slate-200 inline-block mb-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-1"><Calendar size={14} className="text-blue-500" /> <span className="font-bold">{`{Date}`}</span></div>
                                <div className="flex items-center gap-2 mb-1"><Clock size={14} className="text-blue-500" /> <span className="font-bold">{`{Time}`}</span></div>
                            </div>
                            <p>Trân trọng,<br /><strong>Đội ngũ Tuyển dụng InternOS</strong></p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium text-sm hover:bg-slate-50">Hủy</button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center gap-2"><MessageSquare size={16} /> Lên lịch & Gửi (5)</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const LearningPathScreen = () => (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span> Lộ trình hiện tại
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">Phát triển Phần mềm</h1>
                <p className="text-slate-500 max-w-2xl">Nắm vững nguyên tắc cốt lõi kỹ thuật phần mềm. Giai đoạn 1 tập trung vào CSDL và Backend.</p>
            </div>
            <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 shadow-sm flex items-center gap-2"><Download size={18} /> Giáo trình</button>
                <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold shadow-lg flex items-center gap-2"><Calendar size={18} /> Lịch trình</button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8 relative pl-4">
                <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-200"></div>

                {/* Module 1 - Done */}
                <div className="relative flex gap-6">
                    <div className="absolute left-0 top-0 z-10 w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-slate-50 shadow-sm"><Check size={24} /></div>
                    <div className="flex-1 ml-16 bg-white p-6 rounded-xl border border-slate-200 opacity-70 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between mb-2">
                            <span className="text-emerald-600 font-bold text-xs uppercase">Đã hoàn thành</span>
                            <Badge color="green">100%</Badge>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Học phần 1: Nhập môn & Văn hóa</h3>
                        <p className="text-sm text-slate-500 mt-1">Giới thiệu giá trị cốt lõi, công cụ và team.</p>
                    </div>
                </div>

                {/* Module 2 - Active */}
                <div className="relative flex gap-6">
                    <div className="absolute left-0 top-0 z-10 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center border-4 border-slate-50 shadow-lg shadow-blue-200"><PlayCircle size={28} fill="currentColor" className="text-blue-600 bg-white rounded-full" /></div>
                    <div className="flex-1 ml-16 bg-white rounded-xl border border-blue-200 shadow-xl overflow-hidden">
                        <div className="h-1 w-full bg-slate-100"><div className="h-full bg-blue-600 w-[45%]"></div></div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <Badge>Đang thực hiện</Badge>
                                    <h3 className="text-2xl font-bold text-slate-900 mt-2">Học phần 2: Kiến trúc CSDL</h3>
                                    <p className="text-slate-500 mt-1">Thiết kế schema, query phức tạp và chuẩn hóa.</p>
                                </div>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700">Tiếp tục học →</button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle size={20} /></div>
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">Giới thiệu SQL</p>
                                        <span className="text-xs text-slate-500">Video • 15 phút</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center"><FileText size={20} /></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between"><p className="font-semibold text-blue-900 text-sm">Chuẩn hóa dữ liệu</p> <span className="text-[10px] bg-white px-2 rounded-full font-bold text-blue-600 border border-blue-100">Hiện tại</span></div>
                                        <span className="text-xs text-blue-600/70">Bài viết • Đọc 10 phút</span>
                                    </div>
                                    <PlayCircle size={24} className="text-blue-600" />
                                </div>
                                <div className="flex items-center gap-4 p-3 rounded-lg opacity-60">
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center"><ShieldCheck size={20} /></div>
                                    <div>
                                        <p className="font-semibold text-slate-700 text-sm">Bài kiểm tra: Truy vấn</p>
                                        <span className="text-xs text-slate-500">Trắc nghiệm • 10 câu</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Module 3 - Locked */}
                <div className="relative flex gap-6">
                    <div className="absolute left-0 top-0 z-10 w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-slate-50"><ShieldCheck size={24} /></div>
                    <div className="flex-1 ml-16 bg-white p-6 rounded-xl border border-slate-200 opacity-50 grayscale">
                        <h3 className="text-xl font-bold text-slate-900">Học phần 3: Tối ưu hóa</h3>
                        <p className="text-sm text-slate-500">Hoàn thành học phần 2 để mở khóa.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-6">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><div className="w-4 h-4 bg-blue-600 rounded-full"></div> Tiến độ</h3>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-4xl font-black text-slate-900">45%</span>
                        <span className="text-sm text-slate-500 mb-1">hoàn thành</span>
                    </div>
                    <ProgressBar percent={45} />
                    <div className="flex justify-between text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100">
                        <div><div className="font-bold text-slate-900 text-sm">12</div> Ngày còn lại</div>
                        <div className="text-right"><div className="font-bold text-slate-900 text-sm">2 / 5</div> Module xong</div>
                    </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2"><Clock size={14} /> Hạn chót sắp tới</div>
                        <h4 className="text-lg font-bold mb-1">Trắc nghiệm HP 2</h4>
                        <p className="text-slate-400 text-sm mb-4">Hoàn thành bài đánh giá cơ bản.</p>
                        <div className="flex bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10 gap-4">
                            <div className="text-center border-r border-white/20 pr-4">
                                <div className="text-xl font-bold">T6</div>
                                <div className="text-[10px] text-slate-400">NGÀY</div>
                            </div>
                            <div>
                                <div className="font-bold">5:00 PM</div>
                                <div className="text-xs text-rose-300">Còn 2 ngày</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const ProjectBoardScreen = () => (
    <div className="flex flex-col h-full bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">Phase 2 <ChevronRight size={14} /> Project Alpha</div>
                <h1 className="text-2xl font-bold text-slate-900">Phase 2: Deliverables</h1>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm"><Plus size={18} /> New Task</button>
        </div>

        <div className="flex-1 overflow-x-auto p-6 flex gap-6">
            {/* Column 1 */}
            <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="font-bold text-slate-700 text-sm">Cần làm <span className="bg-slate-200 px-2 rounded-full text-xs ml-1">2</span></h3>
                    <Plus size={18} className="text-slate-400 cursor-pointer" />
                </div>
                <div className="space-y-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex justify-between mb-2"><Badge color="red">High</Badge> <MoreHorizontal size={16} className="text-slate-400" /></div>
                        <h4 className="font-semibold text-slate-900 text-sm mb-3">Competitor Analysis Report</h4>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Calendar size={14} /> Oct 24</span>
                            <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer">
                        <div className="flex justify-between mb-2"><Badge color="yellow">Medium</Badge></div>
                        <h4 className="font-semibold text-slate-900 text-sm mb-3">Draft UI Mockups</h4>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Calendar size={14} /> Oct 26</span>
                            <div className="flex -space-x-2"><div className="w-6 h-6 rounded-full bg-slate-300 border border-white"></div><div className="w-6 h-6 rounded-full bg-slate-200 border border-white"></div></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Column 2 */}
            <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="font-bold text-slate-700 text-sm">Đang làm <span className="bg-blue-100 text-blue-700 px-2 rounded-full text-xs ml-1">1</span></h3>
                    <Plus size={18} className="text-slate-400 cursor-pointer" />
                </div>
                <div className="bg-slate-100 p-2 rounded-xl border-2 border-dashed border-slate-200">
                    <div className="bg-white p-4 rounded-xl shadow-[0_0_0_2px_rgba(37,99,235,1)] cursor-pointer relative">
                        <div className="absolute left-0 top-4 bottom-4 w-1 bg-blue-600 rounded-r"></div>
                        <div className="pl-2">
                            <div className="flex justify-between mb-2"><Badge color="blue">Doing</Badge> <Edit size={14} className="text-slate-400" /></div>
                            <h4 className="font-semibold text-slate-900 text-sm mb-1">API Integration Testing</h4>
                            <p className="text-xs text-slate-500 mb-3 line-clamp-2">Connect frontend to user endpoints and verify schemas.</p>
                            <div className="mb-3">
                                <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Progress</span> <span>60%</span></div>
                                <ProgressBar percent={60} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-amber-600 text-xs font-bold flex items-center gap-1"><Clock size={14} /> Due Tmrw</span>
                                <div className="w-6 h-6 rounded-full bg-emerald-200"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Detail Panel (Mocking the right side panel in image) */}
            <div className="w-[400px] bg-white border-l border-slate-200 h-full flex flex-col shadow-xl z-10 hidden xl:flex">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Selected Task</div>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div> Đang làm</div>
                    </div>
                    <X size={20} className="text-slate-400 cursor-pointer hover:text-slate-600" />
                </div>
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">API Integration Testing</h2>
                        <div className="flex gap-2 mb-4">
                            <Badge color="red">High</Badge>
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600 font-medium border border-slate-200">Oct 25</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">Connect the frontend React components to the user management endpoints. Ensure all error states are handled (404, 500).</p>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Upload size={16} /> Submit</h3>
                        <div className="relative mb-3">
                            <span className="absolute left-3 top-2.5 text-slate-400"><FileIcon size={16} /></span>
                            <input className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg" placeholder="PR Link..." />
                        </div>
                        <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold shadow-sm">Submit for Review</button>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-3">Feedback</h3>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-300 flex-shrink-0"></div>
                            <div className="space-y-2">
                                <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none text-sm text-slate-700">
                                    <span className="font-bold text-slate-900 text-xs block mb-1">Sarah Jenkins</span>
                                    Check edge cases for empty lists.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const PerformanceReviewScreen = () => (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-6 shadow-sm">
            <div className="relative">
                <Avatar src="https://picsum.photos/seed/alex/200" alt="Intern" size="xl" className="border-4 border-slate-50" />
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Alex Johnson</h1>
                <div className="flex gap-4 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Badge color="blue">Kỹ thuật</Badge></span>
                    <span>TTS Phần mềm • 6 tháng</span>
                </div>
            </div>
            <div className="ml-auto text-right border-l border-slate-100 pl-6">
                <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">Trạng thái</div>
                <div className="text-xl font-bold text-slate-900">Tuần 23 / 24</div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-4 right-4 opacity-10"><Clock size={60} /></div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase text-slate-500">Giai đoạn 1</span>
                    <CheckCircle size={20} className="text-emerald-500" />
                </div>
                <div className="text-3xl font-bold text-slate-900">82<span className="text-lg text-slate-400 font-normal">/100</span></div>
                <div className="text-emerald-600 text-sm font-bold flex items-center gap-1 mt-1">Done</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-4 right-4 opacity-10"><CheckCircle size={60} /></div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase text-slate-500">Giai đoạn 2</span>
                    <CheckCircle size={20} className="text-emerald-500" />
                </div>
                <div className="text-3xl font-bold text-slate-900">94<span className="text-lg text-slate-400 font-normal">/100</span></div>
                <div className="text-emerald-600 text-sm font-bold flex items-center gap-1 mt-1">Excellent</div>
            </div>
        </div>

        <div>
            <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-bold text-slate-900">Phiếu đánh giá cuối khóa</h2>
                <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">Bản nháp đã lưu 2 phút trước</span>
            </div>

            <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-5 flex items-center gap-4 bg-slate-50 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm"><CheckCircle size={24} /></div>
                        <div>
                            <h3 className="font-bold text-slate-900">Thái độ & Kỹ năng mềm</h3>
                            <p className="text-sm text-slate-500">Đúng giờ, chủ động.</p>
                        </div>
                        <div className="ml-auto"><ChevronDown className="text-slate-400" /></div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border-2 border-blue-100 overflow-hidden shadow-md">
                    <div className="p-5 flex items-center gap-4 bg-blue-50/50 border-b border-blue-100">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200"><Briefcase size={24} /></div>
                        <div>
                            <h3 className="font-bold text-slate-900">Năng lực chuyên môn</h3>
                            <p className="text-sm text-slate-500">Chất lượng code, công cụ.</p>
                        </div>
                        <div className="ml-auto"><Badge color="green">Đang thực hiện</Badge></div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                            <div className="max-w-xs">
                                <h4 className="font-bold text-sm text-slate-900">Chất lượng Code</h4>
                                <p className="text-xs text-slate-500 mt-1">Tuân thủ style guide, chú thích code.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs uppercase font-bold text-slate-300 mr-2">Kém</span>
                                {[1, 2, 3, 4, 5].map(n => (
                                    <div key={n} className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold cursor-pointer transition-all ${n === 4 ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}>{n}</div>
                                ))}
                                <span className="text-xs uppercase font-bold text-slate-300 ml-2">Tốt</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="max-w-xs">
                                <h4 className="font-bold text-sm text-slate-900">Thành thạo công cụ</h4>
                                <p className="text-xs text-slate-500 mt-1">Git, Docker, CI/CD.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs uppercase font-bold text-slate-300 mr-2">Kém</span>
                                {[1, 2, 3, 4, 5].map(n => (
                                    <div key={n} className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold cursor-pointer transition-all ${n === 5 ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}>{n}</div>
                                ))}
                                <span className="text-xs uppercase font-bold text-slate-300 ml-2">Tốt</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="sticky bottom-0 bg-white/80 backdrop-blur border-t border-slate-200 p-4 -mx-8 -mb-8 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="w-1/3 h-full bg-blue-600"></div></div>
                <span className="text-xs font-bold text-slate-700">35%</span>
            </div>
            <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700">Lưu nháp</button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-blue-700">Gửi đánh giá</button>
            </div>
        </div>
    </div>
);

const ExecutiveApprovalScreen = () => (
    <div className="flex h-full bg-slate-50">
        <div className="w-96 bg-white border-r border-slate-200 flex flex-col z-10 shadow-lg">
            <div className="p-4 border-b border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-slate-900">Danh sách yêu cầu</h2>
                    <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-bold">
                        <span className="px-2 py-1 bg-white shadow rounded text-slate-900">Đang chờ</span>
                        <span className="px-2 py-1 text-slate-500">Lịch sử</span>
                    </div>
                </div>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="Tìm kiếm..." />
                </div>
            </div>
            <div className="overflow-y-auto flex-1">
                {[
                    { name: "Alex Doe", type: "Chuyển đổi", time: "10:30 AM", role: "Đề xuất chính thức", active: true },
                    { name: "Java Dev Sr.", type: "Tuyển dụng", time: "Hôm qua", role: "Vị trí mới", active: false },
                    { name: "UX Intern", type: "Tuyển dụng", time: "2 ngày trước", role: "Thay thế", active: false },
                ].map((item, i) => (
                    <div key={i} className={`p-4 border-b border-slate-100 cursor-pointer border-l-4 ${item.active ? 'bg-blue-50/50 border-l-blue-600' : 'hover:bg-slate-50 border-l-transparent'}`}>
                        <div className="flex justify-between mb-2">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${item.type === 'Chuyển đổi' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{item.type}</span>
                            <span className="text-xs text-slate-400">{item.time}</span>
                        </div>
                        <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-full bg-slate-200 bg-cover" style={{ backgroundImage: `url(https://picsum.photos/seed/${item.name}/100)` }}></div>
                            <div>
                                <div className="font-bold text-sm text-slate-900">{item.name}</div>
                                <div className="text-xs text-slate-500">{item.role}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">Yêu cầu <ChevronRight size={12} /> #REQ-2023-8492</div>
                    <h1 className="text-2xl font-bold text-slate-900">Đề xuất lên chính thức: Alex Doe</h1>
                    <div className="flex gap-4 text-sm mt-2 items-center">
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200"><Briefcase size={14} /> Kỹ thuật</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-500">24/10/2023</span>
                    </div>
                </div>
                <Badge color="yellow">Chờ xem xét</Badge>
            </div>

            <div className="flex-1 overflow-y-auto p-8 pb-32">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><CreditCard size={20} className="text-blue-600" /> Hồ sơ</h3>
                            <div className="flex gap-6">
                                <div className="w-24 h-24 rounded-lg bg-slate-200 bg-cover" style={{ backgroundImage: 'url(https://picsum.photos/seed/alex/200)' }}></div>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4 flex-1">
                                    <div><div className="text-xs font-bold text-slate-400 uppercase">Hiện tại</div><div className="font-medium">TTS Phần mềm</div></div>
                                    <div><div className="text-xs font-bold text-slate-400 uppercase">Đề xuất</div><div className="font-medium">Chuyên viên PT</div></div>
                                    <div><div className="text-xs font-bold text-slate-400 uppercase">Mentor</div><div className="font-medium">Mike Ross</div></div>
                                    <div><div className="text-xs font-bold text-slate-400 uppercase">Ngày bắt đầu</div><div className="font-medium">15/11/2023</div></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Trello size={20} className="text-blue-600" /> Hiệu suất</h3>
                            <div className="text-4xl font-bold text-slate-900 mb-4">4.8 <span className="text-sm text-slate-400 font-normal">/ 5.0</span></div>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs mb-1"><span>Chuyên môn</span> <span className="font-bold">90%</span></div>
                                    <ProgressBar percent={90} />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1"><span>Teamwork</span> <span className="font-bold">85%</span></div>
                                    <ProgressBar percent={85} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><CreditCard size={20} className="text-blue-600" /> Tài chính</h3>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                                <div className="flex justify-between border-b border-slate-200 pb-3">
                                    <span className="text-sm text-slate-500">Ngân sách 2023</span>
                                    <span className="font-medium">$60,000</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-sm text-slate-500">Lương đề xuất</span>
                                    <span className="font-bold text-lg">$65,000</span>
                                </div>
                                <div className="bg-amber-50 text-amber-700 text-xs px-3 py-2 rounded border border-amber-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm font-bold">!</span> Vượt ngân sách $5,000 (8.3%)
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="font-bold text-slate-900 mb-4">Nhận xét Mentor</h3>
                            <p className="italic text-slate-600 text-sm leading-relaxed">"Alex vượt quá mong đợi. Code sạch, xử lý bug tốt. Xứng đáng với mức lương Junior II. Mất bạn ấy là một tổn thất."</p>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-300"></div>
                                <span className="text-xs font-bold text-slate-900">Mike Ross</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 p-6 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-bold text-slate-700 block mb-2">Ghi chú Giám đốc</label>
                        <textarea className="w-full border border-slate-300 rounded-lg p-3 text-sm h-20" placeholder="Nhập nhận xét..."></textarea>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="text-xs text-slate-400 flex gap-1 items-center"><ShieldCheck size={14} /> Chỉ hiển thị với HR & Mentor</div>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 flex gap-2 items-center"><X size={16} /> Từ chối</button>
                            <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-bold hover:bg-slate-50">Điều chỉnh</button>
                            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 flex gap-2 items-center"><CheckCircle size={16} /> Phê duyệt</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const JobDescriptionScreen = () => (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-lg"><div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">IF</div> InternFlow</div>
            <button className="text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-2"><ArrowLeft size={16} /> Về trang Tuyển dụng</button>
        </header>

        <div className="max-w-6xl mx-auto py-10 px-6 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
            <div className="space-y-8">
                <div>
                    <div className="flex gap-3 items-center mb-4">
                        <Badge color="blue">MARKETING</Badge>
                        <span className="text-sm text-slate-500 flex items-center gap-1"><Home size={14} /> Hồ Chí Minh</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-6">Thực tập sinh Marketing Mạng xã hội</h1>
                    <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1.5 bg-white border rounded-lg text-sm font-medium text-slate-600 flex gap-2 items-center"><Monitor size={16} /> Hybrid</span>
                        <span className="px-3 py-1.5 bg-white border rounded-lg text-sm font-medium text-slate-600 flex gap-2 items-center"><CreditCard size={16} /> Có lương</span>
                        <span className="px-3 py-1.5 bg-white border rounded-lg text-sm font-medium text-slate-600 flex gap-2 items-center"><Clock size={16} /> Full-time</span>
                        <span className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-sm font-bold flex gap-2 items-center"><Clock size={16} /> Hạn: 30/10</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-slate-200">
                    <div><div className="text-xs font-bold text-slate-400 uppercase">Thời gian</div><div className="font-bold">6 Tháng</div></div>
                    <div><div className="text-xs font-bold text-slate-400 uppercase">Trợ cấp</div><div className="font-bold">5tr / tháng</div></div>
                    <div><div className="text-xs font-bold text-slate-400 uppercase">Cấp bậc</div><div className="font-bold">Intern</div></div>
                    <div><div className="text-xs font-bold text-slate-400 uppercase">Bắt đầu</div><div className="font-bold">15/11/2023</div></div>
                </div>

                <div className="prose text-slate-600 max-w-none">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Chi tiết vị trí</h2>
                    <p className="mb-4">Chúng tôi tìm kiếm TTS Marketing sáng tạo tại HCM. Cơ hội xây dựng thương hiệu B2B.</p>

                    <h3 className="text-xl font-bold text-slate-900 mb-3">Trách nhiệm</h3>
                    <ul className="space-y-2 mb-6">
                        {[
                            "Quản lý kênh social (LinkedIn, Twitter).",
                            "Tương tác cộng đồng.",
                            "Nghiên cứu xu hướng.",
                            "Hỗ trợ webinar."
                        ].map((li, i) => <li key={i} className="flex gap-3 items-start"><CheckCircle size={20} className="text-blue-600 shrink-0 mt-0.5" /> <span>{li}</span></li>)}
                    </ul>

                    <h3 className="text-xl font-bold text-slate-900 mb-3">Yêu cầu</h3>
                    <ul className="space-y-2 mb-6 pl-1">
                        {[
                            "Sinh viên năm cuối Marketing/Truyền thông.",
                            "Kỹ năng viết tốt.",
                            "Biết Canva/Adobe là lợi thế.",
                            "Chủ động."
                        ].map((li, i) => <li key={i} className="flex gap-3 items-start"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0"></div> <span>{li}</span></li>)}
                    </ul>
                </div>
            </div>

            <div className="relative">
                <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/50">
                    <h3 className="text-xl font-bold mb-1">Sẵn sàng ứng tuyển?</h3>
                    <p className="text-sm text-slate-500 mb-6">Điền form bên dưới.</p>

                    <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Tên</label><input className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm" placeholder="Lan" /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Họ</label><input className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm" placeholder="Nguyễn" /></div>
                        </div>
                        <div><label className="text-xs font-bold text-slate-500 uppercase">Email</label><input className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm" placeholder="email@example.com" /></div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">CV / Hồ sơ</label>
                            <div className="mt-1 border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors group">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform"><Upload size={20} className="text-blue-600" /></div>
                                <span className="text-sm font-medium">Upload CV</span>
                                <span className="text-xs text-slate-400">PDF, DOCX (Max 5MB)</span>
                            </div>
                        </div>

                        <button className="w-full bg-blue-600 text-white h-12 rounded-lg font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">Ứng tuyển ngay <ArrowRight size={18} /></button>
                    </form>
                </div>
            </div>
        </div>
    </div>
);

const LMSEditorScreen = () => (
    <div className="flex h-full flex-col bg-slate-50">
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center"><BookOpen size={20} /></div>
                <div><h2 className="font-bold text-sm">Thiết kế Lộ trình</h2><p className="text-xs text-slate-500">Frontend Dev - Q3</p></div>
            </div>
            <div className="flex gap-3">
                <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-200">Xem trước</button>
                <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-bold text-white shadow-sm hover:bg-blue-700">Xuất bản</button>
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <label className="text-xs font-bold text-slate-500 uppercase">Tên Lộ trình</label>
                    <input className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm font-medium" defaultValue="Thực tập Frontend - Quý 3" />
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                    <div className="bg-white p-3 rounded-xl border-2 border-blue-500 shadow-sm relative">
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-500 rounded-r"></div>
                        <div className="flex justify-between items-center mb-2 ml-2">
                            <span className="font-bold text-sm">1. Văn hóa Công ty</span>
                            <Badge color="green">Sẵn sàng</Badge>
                        </div>
                        <div className="pl-2 space-y-1">
                            <div className="flex items-center gap-2 text-xs text-slate-500"><PlayCircle size={14} /> Video CEO</div>
                            <div className="flex items-center gap-2 text-xs text-slate-500"><FileText size={14} /> Sổ tay.pdf</div>
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 cursor-pointer">
                        <div className="flex justify-between items-center"><span className="font-semibold text-sm text-slate-700">2. Git Basics</span> <Badge color="yellow">Nháp</Badge></div>
                    </div>
                    <button className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-blue-500 hover:text-blue-500">+ Thêm học phần</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold">Học phần 1: Văn hóa Công ty</h1>
                        <div className="flex gap-2">
                            <button className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-slate-900"><Settings size={14} /> Cài đặt</button>
                            <button className="text-xs font-bold text-red-500 flex items-center gap-1 hover:text-red-700"><Trash size={14} /> Xóa</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4 group hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0"><PlayCircle size={24} /></div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm">Video chào mừng CEO</h4>
                                <p className="text-xs text-slate-500">Link Youtube • 5 phút</p>
                                <div className="mt-3 bg-black rounded-lg aspect-video w-60 relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40"><PlayCircle size={32} className="text-white" /></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4 group hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0"><FileText size={24} /></div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm">Sổ tay nhân viên 2024</h4>
                                <p className="text-xs text-slate-500">PDF • 2.4 MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-slate-300 pt-6">
                        <h3 className="font-bold text-sm mb-4">Thêm tài liệu</h3>
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <button className="p-4 bg-white border border-blue-500 text-blue-600 rounded-lg shadow-sm font-bold text-sm flex flex-col items-center gap-2"><Monitor size={20} /> Video Link</button>
                            <button className="p-4 bg-white border border-slate-200 text-slate-500 rounded-lg font-medium text-sm flex flex-col items-center gap-2 hover:border-slate-300"><Upload size={20} /> Upload File</button>
                            <button className="p-4 bg-white border border-slate-200 text-slate-500 rounded-lg font-medium text-sm flex flex-col items-center gap-2 hover:border-slate-300"><ShieldCheck size={20} /> Quiz</button>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div><label className="text-xs font-bold text-slate-500">Tiêu đề</label><input className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm" placeholder="VD: Video giới thiệu" /></div>
                                <div><label className="text-xs font-bold text-slate-500">URL Video</label><input className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm" placeholder="https://youtube.com/..." /></div>
                            </div>
                            <div><label className="text-xs font-bold text-slate-500">Mô tả</label><textarea className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm" rows={2}></textarea></div>
                            <div className="flex justify-end mt-4">
                                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow hover:bg-blue-700">+ Thêm Video</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const SettingsScreen = () => (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900">Cấu hình Hệ thống</h1>
            <p className="text-slate-500">Quản lý cài đặt chung, mẫu email.</p>
        </div>

        <div className="border-b border-slate-200">
            <div className="flex gap-8">
                <button className="px-1 pb-3 text-sm font-bold text-blue-600 border-b-2 border-blue-600 flex items-center gap-2"><Mail size={18} /> Mẫu Email</button>
                <button className="px-1 pb-3 text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-2"><Home size={18} /> Phòng ban</button>
                <button className="px-1 pb-3 text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-2"><ShieldCheck size={18} /> Phân quyền</button>
            </div>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[600px]">
            <div className="col-span-12 md:col-span-3 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <div className="relative">
                        <Search size={16} className="absolute left-2.5 top-2.5 text-slate-400" />
                        <input className="w-full pl-9 py-2 bg-slate-50 border-none rounded-lg text-sm" placeholder="Tìm kiếm..." />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    <button className="w-full text-left p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <div className="flex justify-between items-center mb-1"><span className="font-bold text-sm text-slate-900">Mời phỏng vấn</span> <div className="w-2 h-2 bg-green-500 rounded-full"></div></div>
                        <div className="text-xs text-slate-500 truncate">Chủ đề: Lời mời phỏng vấn...</div>
                    </button>
                    <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50">
                        <div className="flex justify-between items-center mb-1"><span className="font-medium text-sm text-slate-700">Thư mời nhận việc</span> <div className="w-2 h-2 bg-green-500 rounded-full"></div></div>
                        <div className="text-xs text-slate-500 truncate">Chủ đề: Offer Letter...</div>
                    </button>
                    <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50">
                        <div className="flex justify-between items-center mb-1"><span className="font-medium text-sm text-slate-700">Email từ chối</span> <div className="w-2 h-2 bg-slate-300 rounded-full"></div></div>
                        <div className="text-xs text-slate-500 truncate">Chủ đề: Cập nhật hồ sơ...</div>
                    </button>
                </div>
                <div className="p-3 border-t border-slate-200">
                    <button className="w-full py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg flex items-center justify-center gap-2"><Plus size={16} /> Tạo mẫu mới</button>
                </div>
            </div>

            <div className="col-span-12 md:col-span-9 bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Chỉnh sửa mẫu</h3>
                        <span className="text-xs text-slate-400">Đã lưu: 10:23 AM</span>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-500">Tiêu đề Email</label>
                        <input className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" defaultValue="Lời mời phỏng vấn - {{ten_vi_tri}}" />
                    </div>
                </div>

                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex gap-2">
                    <button className="p-1.5 hover:bg-slate-200 rounded"><span className="font-bold serif">B</span></button>
                    <button className="p-1.5 hover:bg-slate-200 rounded"><span className="italic serif">I</span></button>
                    <button className="p-1.5 hover:bg-slate-200 rounded"><span className="underline serif">U</span></button>
                    <div className="w-px h-6 bg-slate-300 mx-1"></div>
                    <button className="px-2 py-1 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1">Chèn biến <ChevronDown size={12} /></button>
                </div>

                <div className="flex-1 p-6 font-sans text-sm text-slate-800 leading-relaxed">
                    <p>Chào <span className="bg-blue-100 text-blue-700 px-1 rounded text-xs font-mono">{`{{ten_ung_vien}}`}</span>,</p>
                    <br />
                    <p>Cảm ơn bạn đã ứng tuyển vào vị trí <span className="bg-slate-100 px-1 rounded text-xs font-mono">{`{{ten_vi_tri}}`}</span> tại InternshipOS. Chúng tôi rất ấn tượng với hồ sơ của bạn.</p>
                    <br />
                    <p>Buổi phỏng vấn sẽ được thực hiện bởi <span className="bg-slate-100 px-1 rounded text-xs font-mono">{`{{nguoi_phong_van}}`}</span> và kéo dài 45 phút.</p>
                    <br />
                    <p>Vui lòng chọn lịch tại: <a href="#" className="text-blue-600 underline">Link đặt lịch</a></p>
                    <br />
                    <p>Trân trọng,<br />Team Tuyển dụng</p>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-between items-center">
                    <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold bg-white hover:bg-slate-50">Gửi test</button>
                    <div className="flex gap-3">
                        <button className="text-slate-500 text-sm font-medium hover:text-slate-900">Hủy</button>
                        <button className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 flex items-center gap-2"><CreditCard size={16} /> Lưu mẫu</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const App = () => {
    const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const renderScreen = () => {
        switch (currentScreen) {
            case 'dashboard': return <DashboardScreen />;
            case 'candidates': return <CandidateListScreen />;
            case 'interviews': return <InterviewSchedulerScreen />;
            case 'learning': return <LearningPathScreen />;
            case 'projects': return <ProjectBoardScreen />;
            case 'evaluation': return <PerformanceReviewScreen />;
            case 'approval': return <ExecutiveApprovalScreen />;
            case 'jobpost': return <JobDescriptionScreen />;
            case 'lms': return <LMSEditorScreen />;
            case 'settings': return <SettingsScreen />;
            default: return <DashboardScreen />;
        }
    };

    // Special layout for Job Post (Full screen public view style)
    if (currentScreen === 'jobpost') {
        return (
            <div className="min-h-screen bg-white">
                {renderScreen()}
                {/* Simple Floating Back Button for Demo */}
                <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="fixed bottom-4 right-4 bg-slate-800 text-white p-3 rounded-full shadow-lg z-50 hover:bg-slate-900"
                    title="Back to Admin"
                >
                    <LayoutDashboard size={20} />
                </button>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 
        transform transition-transform duration-200 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <LayoutDashboard size={20} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">InternShip OS</h1>
                            <p className="text-xs text-slate-400 font-medium">HR Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Tổng quan"
                        active={currentScreen === 'dashboard'}
                        onClick={() => { setCurrentScreen('dashboard'); setSidebarOpen(false); }}
                    />
                    <SidebarItem
                        icon={Briefcase}
                        label="Tuyển dụng"
                        active={currentScreen === 'candidates'}
                        onClick={() => { setCurrentScreen('candidates'); setSidebarOpen(false); }}
                        badge={12}
                    />
                    <SidebarItem
                        icon={Calendar}
                        label="Lịch phỏng vấn"
                        active={currentScreen === 'interviews'}
                        onClick={() => { setCurrentScreen('interviews'); setSidebarOpen(false); }}
                    />
                    <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Đào tạo</div>
                    <SidebarItem
                        icon={BookOpen}
                        label="Lộ trình học tập"
                        active={currentScreen === 'learning'}
                        onClick={() => { setCurrentScreen('learning'); setSidebarOpen(false); }}
                    />
                    <SidebarItem
                        icon={Edit}
                        label="Thiết kế nội dung"
                        active={currentScreen === 'lms'}
                        onClick={() => { setCurrentScreen('lms'); setSidebarOpen(false); }}
                    />
                    <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Quản lý</div>
                    <SidebarItem
                        icon={Trello}
                        label="Bảng công việc"
                        active={currentScreen === 'projects'}
                        onClick={() => { setCurrentScreen('projects'); setSidebarOpen(false); }}
                    />
                    <SidebarItem
                        icon={ClipboardCheck}
                        label="Đánh giá cuối khóa"
                        active={currentScreen === 'evaluation'}
                        onClick={() => { setCurrentScreen('evaluation'); setSidebarOpen(false); }}
                    />
                    <SidebarItem
                        icon={ShieldCheck}
                        label="Cổng phê duyệt"
                        active={currentScreen === 'approval'}
                        onClick={() => { setCurrentScreen('approval'); setSidebarOpen(false); }}
                    />
                    <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Hệ thống</div>
                    <SidebarItem
                        icon={Settings}
                        label="Cấu hình"
                        active={currentScreen === 'settings'}
                        onClick={() => { setCurrentScreen('settings'); setSidebarOpen(false); }}
                    />
                    <SidebarItem
                        icon={Smartphone}
                        label="Trang Tuyển dụng"
                        active={currentScreen === 'jobpost'}
                        onClick={() => { setCurrentScreen('jobpost'); setSidebarOpen(false); }}
                    />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                        <Avatar src="https://picsum.photos/seed/admin/100" alt="Admin" size="sm" />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">Sarah Jenkins</p>
                            <p className="text-xs text-slate-500 truncate">HR Manager</p>
                        </div>
                        <Settings size={16} className="text-slate-400" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 lg:hidden">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-slate-900">InternShip OS</span>
                    <Avatar src="https://picsum.photos/seed/admin/100" alt="Admin" size="sm" />
                </header>

                {/* Screen Content */}
                <div className="flex-1 overflow-auto bg-slate-50">
                    {renderScreen()}
                </div>
            </div>
        </div>
    );
};

export default App;