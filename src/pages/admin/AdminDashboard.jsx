import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-card p-6 flex items-center gap-4 group hover:scale-[1.02] transition-all duration-300">
    <div className={`p-4 rounded-2xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 group-hover:bg-${color}-600 group-hover:text-white transition-colors`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-gray-900 dark:text-white">{value}</h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 font-black uppercase tracking-widest">Loading Dashboard...</div>;
  if (!stats) return <div className="p-20 text-center text-rose-500 font-bold uppercase tracking-widest">Error: Could not load dashboard.</div>;

  const resourceData = Object.entries(stats.resourceTypeDistribution).map(([name, value]) => ({ name, value }));
  const ticketData = Object.entries(stats.ticketPriorityDistribution).map(([name, value]) => ({ name, value }));
  const trendData = Object.entries(stats.bookingTrends).map(([name, value]) => ({ name, value }));

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246);
    doc.text("SMART CAMPUS ANALYTICS", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    // Section 1: Key Statistics
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("System Overview", 14, 40);
    
    autoTable(doc, {
      body: [
        ["Total Users", stats.totalUsers.toString()],
        ["Total Resources", stats.totalResources.toString()],
        ["Pending Bookings", stats.pendingBookings.toString()],
        ["Open Tickets", stats.openTickets.toString()]
      ],
      startY: 45,
      theme: 'plain',
      styles: { fontSize: 11, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', width: 50 } }
    });

    // Section 2: Resource Distribution
    doc.text("Resources by Type", 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
      head: [["Resource Type", "Count"]],
      body: resourceData.map(d => [d.name, d.value.toString()]),
      startY: doc.lastAutoTable.finalY + 20,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    // Section 3: Ticket Priority
    doc.text("Tickets by Priority", 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
      head: [["Priority Level", "Count"]],
      body: ticketData.map(d => [d.name, d.value.toString()]),
      startY: doc.lastAutoTable.finalY + 20,
      theme: 'striped',
      headStyles: { fillColor: [244, 63, 94] } // rose-500
    });

    // Section 4: Booking Trends
    doc.addPage();
    doc.text("Booking Trends (Last 7 Days)", 14, 20);
    autoTable(doc, {
      head: [["Date", "Bookings"]],
      body: trendData.map(d => [d.name, d.value.toString()]),
      startY: 25,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] } // emerald-500
    });

    doc.save(`analytics_report_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic">Dashboard Overview</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">Overview of the Smart Campus system.</p>
        </div>
        <button onClick={downloadPDF} className="px-5 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl shadow-sm border border-red-100 dark:border-red-800 hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export PDF Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          color="blue"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
        <StatCard 
          title="Total Resources" 
          value={stats.totalResources} 
          color="emerald"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 002 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
        />
        <StatCard 
          title="Pending Bookings" 
          value={stats.pendingBookings} 
          color="amber"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <StatCard 
          title="Open Tickets" 
          value={stats.openTickets} 
          color="rose"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resource Usage Chart */}
        <div className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Resources by Type</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Priority Chart */}
        <div className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Tickets by Priority</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ticketData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ticketData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Booking Trends Line Chart */}
      <div className="glass-card p-8 space-y-6">
        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Recent Bookings (Last 7 Days)</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
              <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} dot={{r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
