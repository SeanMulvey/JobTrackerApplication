import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import SankeyChart from '../components/SankeyChart';
import JobMarketComparison from '../components/JobMarketComparison';

interface AnalyticsStats {
  totalApplications: number;
  recentApplications: number;
  totalInterviews: number;
  totalOffers: number;
  rejectionRate: number;
  successRate: number;
  averageResponseDays: number | null;
  statusCounts: Record<string, number>;
  applicationsByMonth: Array<{
    date: string;
    count: number;
  }>;
}

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/analytics/stats');
        
        if (response.data && response.data.success) {
          setStats(response.data.data);
        } else {
          toast.error('Failed to load analytics data');
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Error loading analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Render status bar for application status distribution
  const renderStatusBar = (status: string, colorClass: string) => {
    if (!stats || !stats.statusCounts) return null;
    
    const count = stats.statusCounts[status] || 0;
    const percentage = stats.totalApplications > 0
      ? (count / stats.totalApplications) * 100
      : 0;
    
    return (
      <div key={status} className="flex flex-col">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">{status}</span>
          <span className="text-sm font-medium">{count} ({percentage.toFixed(1)}%)</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClass}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Render monthly applications chart
  const renderMonthlyChart = () => {
    if (!stats || !stats.applicationsByMonth || stats.applicationsByMonth.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          No application data available for timeline
        </div>
      );
    }

    // Sort data by date
    const sortedData = [...stats.applicationsByMonth].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Find the max count for scaling
    const maxCount = Math.max(...sortedData.map(item => item.count));
    
    return (
      <div className="flex items-end h-full space-x-2">
        {sortedData.map((item, index) => {
          const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          const date = new Date(item.date);
          const month = date.toLocaleString('default', { month: 'short' });
          const year = date.getFullYear();
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${height}%` }}
              ></div>
              <div className="text-xs mt-2 text-gray-600">{month} {year}</div>
              <div className="text-xs font-medium">{item.count}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Job Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Application Summary</h2>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Applications */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold">{stats?.totalApplications || 0}</p>
              </div>
              
              {/* Recent Applications */}
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Last 30 Days</p>
                <p className="text-2xl font-bold">{stats?.recentApplications || 0}</p>
              </div>
              
              {/* Interviews */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Interviews</p>
                <p className="text-2xl font-bold">{stats?.totalInterviews || 0}</p>
              </div>
              
              {/* Offers */}
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Offers Received</p>
                <p className="text-2xl font-bold">{stats?.totalOffers || 0}</p>
              </div>
              
              {/* Rejection Rate */}
              <div className="bg-pink-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Rejection Rate</p>
                <p className="text-2xl font-bold">{stats?.rejectionRate ? `${stats.rejectionRate.toFixed(1)}%` : '0%'}</p>
              </div>
              
              {/* Success Rate */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{stats?.successRate ? `${stats.successRate.toFixed(1)}%` : '0%'}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Applications by Status</h2>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {renderStatusBar('Applied', 'bg-blue-500')}
              {renderStatusBar('Interviewing', 'bg-orange-500')}
              {renderStatusBar('Offer Received', 'bg-green-500')}
              {renderStatusBar('Accepted', 'bg-teal-500')}
              {renderStatusBar('Rejected', 'bg-red-500')}
              {renderStatusBar('Withdrawn', 'bg-purple-500')}
            </div>
          )}
        </div>
      </div>
      
      {/* Sankey Diagram */}
      <div className="mb-6">
        <SankeyChart />
      </div>
      
      {/* Job Market Comparison */}
      <div className="mb-6">
        <JobMarketComparison />
      </div>
      
      {/* Monthly Applications Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Applications Over Time</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="h-64">
            {renderMonthlyChart()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics; 