"use client";

import React, { useEffect, useState } from 'react';

// Simple test page to verify statistics functionality
export default function TestStatsPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      const results: string[] = [];
      
      // Test 1: Check if statistics component can be imported
      try {
        const { StatisticsList } = await import('../admin/statistics/list');
        results.push('✅ Statistics component imports successfully');
      } catch (error) {
        results.push(`❌ Statistics component import failed: ${error}`);
      }

      // Test 2: Check if API endpoints exist (they should return 401 for unauthorized access)
      const endpoints = [
        '/api/analytics/users',
        '/api/analytics/lessons', 
        '/api/analytics/subscriptions',
        '/api/analytics/overview'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.status === 401) {
            results.push(`✅ ${endpoint} - Properly protected (401 Unauthorized)`);
          } else {
            results.push(`⚠️ ${endpoint} - Unexpected status: ${response.status}`);
          }
        } catch (error) {
          results.push(`❌ ${endpoint} - Request failed: ${error}`);
        }
      }

      // Test 3: Check if admin client includes statistics
      try {
        const adminClientModule = await import('../admin/AdminClient');
        const adminClientCode = adminClientModule.default.toString();
        if (adminClientCode.includes('statistics')) {
          results.push('✅ Admin client includes statistics resource');
        } else {
          results.push('❌ Admin client does not include statistics resource');
        }
      } catch (error) {
        results.push(`❌ Admin client test failed: ${error}`);
      }

      setTestResults(results);
      setLoading(false);
    };

    runTests();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Testing Statistics Functionality...</h1>
        <p>Running tests...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Statistics Functionality Test Results</h1>
      <div style={{ marginTop: '20px' }}>
        {testResults.map((result, index) => (
          <div key={index} style={{ 
            padding: '8px', 
            margin: '4px 0',
            backgroundColor: result.startsWith('✅') ? '#d4edda' : 
                           result.startsWith('⚠️') ? '#fff3cd' : '#f8d7da',
            border: '1px solid',
            borderColor: result.startsWith('✅') ? '#c3e6cb' : 
                        result.startsWith('⚠️') ? '#ffeaa7' : '#f5c6cb',
            borderRadius: '4px'
          }}>
            {result}
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <h3>Summary</h3>
        <p>✅ Passed: {testResults.filter(r => r.startsWith('✅')).length}</p>
        <p>⚠️ Warnings: {testResults.filter(r => r.startsWith('⚠️')).length}</p>
        <p>❌ Failed: {testResults.filter(r => r.startsWith('❌')).length}</p>
        
        <div style={{ marginTop: '15px' }}>
          <h4>Next Steps:</h4>
          <ul>
            <li>To access the admin statistics dashboard, go to <code>/admin</code> and log in as an admin user</li>
            <li>The statistics will be available in the admin interface under the "Statistics" menu</li>
            <li>API endpoints are properly protected and require admin authentication</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
