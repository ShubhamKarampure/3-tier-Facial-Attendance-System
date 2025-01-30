import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Calendar } from 'lucide-react';

const AttendanceTable = ({ attendanceData }) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredData = attendanceData.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const factor = sortDirection === 'asc' ? 1 : -1;
    return a[sortColumn] > b[sortColumn] ? factor : -factor;
  });

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp size={16} className="inline" /> : 
      <ChevronDown size={16} className="inline" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden mt-4 transition-all">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Today's Attendance</h2>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: 'rollNumber', label: 'Roll Number' },
                { key: 'name', label: 'Name' },
                { key: 'status', label: 'Status' },
                { key: 'time', label: 'Time' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    {label}
                    <SortIcon column={key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.map((student) => (
              <tr 
                key={student.id} 
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-gray-700">{student.rollNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{student.name}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all
                    ${student.status === 'Present' 
                      ? 'bg-green-100 text-green-700 ring-1 ring-green-600/20' 
                      : 'bg-red-100 text-red-700 ring-1 ring-red-600/20'
                    }`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sortedData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No matching records found
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;