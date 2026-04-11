import React, { forwardRef, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

const AnalyticsReport = forwardRef(({ bookings, resources = [] }, ref) => {
    
    const { resourceData, dayData, dateData, locationData, userData } = useMemo(() => {
        const rData = {};
        const dyData = { 'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0 };
        const dtData = {};
        const lData = {};
        const uData = {};

        bookings.forEach(b => {
            // Resource Data
            rData[b.resourceName] = (rData[b.resourceName] || 0) + 1;

            // Location Data
            const matchedResource = resources.find(r => r.id === b.resourceId || r.name === b.resourceName);
            const location = matchedResource ? matchedResource.location : 'N/A';
            lData[location] = (lData[location] || 0) + 1;
            
            // User Data
            uData[b.userName] = (uData[b.userName] || 0) + 1;

            if (b.date) {
                // Day Data
                const dateObj = new Date(b.date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                dyData[dayName] += 1;

                // Date Data
                dtData[b.date] = (dtData[b.date] || 0) + 1;
            }
        });

        // Format for Recharts
        const resourceChart = Object.keys(rData).map(k => ({ name: k, value: rData[k] })).sort((a,b) => b.value - a.value).slice(0, 10);
        const dayChart = Object.keys(dyData).map(k => ({ name: k, Bookings: dyData[k] }));
        const dateChart = Object.keys(dtData).sort().map(k => ({ name: k, Bookings: dtData[k] })); // chronological
        const locChart = Object.keys(lData).map(k => ({ name: k === 'N/A' ? 'Unknown' : `Location: ${k}`, Bookings: lData[k] })).sort((a,b) => b.Bookings - a.Bookings).slice(0, 10);
        const userChart = Object.keys(uData).map(k => ({ name: k, Bookings: uData[k] })).sort((a,b) => b.Bookings - a.Bookings).slice(0, 10);

        return { resourceData: resourceChart, dayData: dayChart, dateData: dateChart, locationData: locChart, userData: userChart };
    }, [bookings, resources]);

    return (
        <div className="absolute top-0 left-0 w-full min-h-[1400px] z-[9999] bg-gray-900/95 flex justify-center pt-20 animate-fade-in shadow-2xl pb-20">
            <div className="fixed top-5 text-white font-extrabold text-md uppercase tracking-[0.2em] animate-pulse z-[10000] bg-gray-900/50 px-6 py-2 rounded-full border border-gray-700 backdrop-blur-md">Compiling High-Res Document Layout...</div>
            <div id="analytics-report-container" ref={ref} className="bg-white p-10 font-sans shadow-2xl rounded-2xl relative" style={{ width: '1200px', height: 'fit-content' }}>
            {/* Header */}
            <div className="flex justify-between items-end border-b pb-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight">Smart Campus Resource Analytics</h1>
                    <p className="text-gray-500 mt-2 text-lg">Comprehensive booking and utilization report</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-gray-800 text-xl">Total Bookings: {bookings.length}</p>
                    <p className="text-gray-500">Generated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-10">
                
                {/* Most Booked Resource - Pie Chart */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Most Booked Resources</h3>
                    <div className="h-[300px] flex justify-center items-center">
                        <PieChart width={500} height={300}>
                            <Pie
                                data={resourceData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                isAnimationActive={false}
                            >
                                {resourceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                        </PieChart>
                    </div>
                </div>

                {/* Popular Days - Bar Chart */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Peak Booking Days</h3>
                    <div className="h-[300px] flex justify-center items-center">
                        <BarChart width={500} height={300} data={dayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.5} vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} />
                            <RechartsTooltip cursor={{ fill: '#e2e8f0' }} />
                            <Bar dataKey="Bookings" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} isAnimationActive={false} />
                        </BarChart>
                    </div>
                </div>

                {/* Most Booked Locations - Bar Chart */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Most Booked Locations</h3>
                    <div className="h-[300px] flex justify-center items-center">
                        <BarChart width={500} height={300} data={locationData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.5} vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 14, fontWeight: 'bold', fill: '#4B5563' }} />
                            <YAxis allowDecimals={false} />
                            <RechartsTooltip cursor={{ fill: '#e2e8f0' }} contentStyle={{ borderRadius: '10px', fontWeight: 'bold' }} />
                            <Bar dataKey="Bookings" fill="#F59E0B" radius={[8, 8, 0, 0]} barSize={50} isAnimationActive={false} />
                        </BarChart>
                    </div>
                </div>

                {/* Bookings Timeline - Line Chart */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Booking Flow Over Dates</h3>
                    <div className="h-[300px] flex justify-center items-center">
                        <LineChart width={500} height={300} data={dateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} />
                            <RechartsTooltip />
                            <Line type="monotone" dataKey="Bookings" stroke="#2563EB" strokeWidth={4} activeDot={{ r: 8 }} isAnimationActive={false} />
                        </LineChart>
                    </div>
                </div>

                {/* Top Users - HTML Table */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm col-span-2 mt-4 mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Leading Users by Booking Volume</h3>
                    <div className="h-[300px] w-full overflow-hidden text-center flex flex-col items-center px-10">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-blue-600">
                                <tr>
                                    <th className="px-8 py-4 text-left text-xs font-extrabold text-white uppercase tracking-wider rounded-tl-xl">Rank</th>
                                    <th className="px-8 py-4 text-left text-xs font-extrabold text-white uppercase tracking-wider">Student / User Name</th>
                                    <th className="px-8 py-4 text-right text-xs font-extrabold text-white uppercase tracking-wider rounded-tr-xl">Total Bookings</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white border border-gray-100 border-t-0 rounded-bl-xl rounded-br-xl shadow-sm">
                                {userData.map((user, idx) => (
                                    <tr key={user.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-8 py-4 whitespace-nowrap text-sm font-extrabold text-gray-500 text-left border-b border-gray-100">#{idx + 1}</td>
                                        <td className="px-8 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-left border-b border-gray-100">{user.name}</td>
                                        <td className="px-8 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-right border-b border-gray-100">{user.Bookings} Reservation(s)</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
            </div>
        </div>
    );
});

export default AnalyticsReport;
