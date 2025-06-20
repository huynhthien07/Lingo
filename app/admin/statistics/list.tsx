"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@mui/material';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface UserStats {
  totalUsers: number;
  monthlyActiveUsers: number;
}

interface LessonStats {
  usersWithCompletedLessons: number;
  totalLessonCompletions: number;
  monthlyLessonCompletions: number;
}

interface SubscriptionStats {
  totalSubscribers: number;
  activeSubscribers: number;
  monthlyNewSubscribers: number;
}

interface OverallStats {
  users: UserStats;
  lessons: LessonStats;
  subscriptions: SubscriptionStats;
}

export const StatisticsList = () => {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics/overview');
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading Statistics...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h2>Error: {error}</h2>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>No statistics available</h2>
      </div>
    );
  }

  // Chart data configurations
  const userChartData = {
    labels: ['Total Users', 'Monthly Active Users'],
    datasets: [
      {
        label: 'User Statistics',
        data: [stats.users.totalUsers, stats.users.monthlyActiveUsers],
        backgroundColor: ['#3b82f6', '#10b981'],
        borderColor: ['#2563eb', '#059669'],
        borderWidth: 1,
      },
    ],
  };

  const lessonChartData = {
    labels: ['Users with Completed Lessons', 'Total Lesson Completions', 'Monthly Completions'],
    datasets: [
      {
        label: 'Lesson Statistics',
        data: [
          stats.lessons.usersWithCompletedLessons,
          stats.lessons.totalLessonCompletions,
          stats.lessons.monthlyLessonCompletions,
        ],
        backgroundColor: ['#f59e0b', '#ef4444', '#8b5cf6'],
        borderColor: ['#d97706', '#dc2626', '#7c3aed'],
        borderWidth: 1,
      },
    ],
  };

  const subscriptionChartData = {
    labels: ['Total Subscribers', 'Active Subscribers', 'Monthly New Subscribers'],
    datasets: [
      {
        data: [
          stats.subscriptions.totalSubscribers,
          stats.subscriptions.activeSubscribers,
          stats.subscriptions.monthlyNewSubscribers,
        ],
        backgroundColor: ['#06b6d4', '#84cc16', '#f97316'],
        borderColor: ['#0891b2', '#65a30d', '#ea580c'],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Statistics Overview',
      },
    },
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '30px', fontSize: '2rem', fontWeight: 'bold' }}>
        Admin Statistics Dashboard
      </h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <Card>
          <CardHeader
            title={<span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total Users</span>}
          />
          <CardContent>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {stats.users.totalUsers}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Monthly Active: {stats.users.monthlyActiveUsers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title={<span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Lesson Completions</span>}
          />
          <CardContent>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {stats.lessons.totalLessonCompletions}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Users with completions: {stats.lessons.usersWithCompletedLessons}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title={<span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Premium Subscribers</span>}
          />
          <CardContent>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {stats.subscriptions.activeSubscribers}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Total: {stats.subscriptions.totalSubscribers} | Monthly: {stats.subscriptions.monthlyNewSubscribers}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
        <Card>
          <CardHeader
            title={<span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>User Statistics</span>}
          />
          <CardContent>
            <Bar data={userChartData} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title={<span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Lesson Completion Statistics</span>}
          />
          <CardContent>
            <Bar data={lessonChartData} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title={<span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Premium Subscription Distribution</span>}
          />
          <CardContent>
            <Doughnut data={subscriptionChartData} options={chartOptions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
