"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, Button, TextField, Typography, Box } from '@mui/material';

export const SearchTest = () => {
    const [searchResults, setSearchResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const testSearch = async (endpoint: string, searchParam: string, searchValue: string) => {
        setLoading(true);
        setError(null);
        
        try {
            const url = searchValue 
                ? `/api/${endpoint}?${searchParam}=${encodeURIComponent(searchValue)}`
                : `/api/${endpoint}`;
            
            console.log('Testing URL:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
            }
            
            setSearchResults({
                endpoint,
                searchParam,
                searchValue,
                count: Array.isArray(data) ? data.length : 'N/A',
                data: Array.isArray(data) ? data.slice(0, 3) : data // Show first 3 results
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            setSearchResults(null);
        } finally {
            setLoading(false);
        }
    };

    const testCases = [
        { endpoint: 'courses', searchParam: 'title', searchValue: 'English' },
        { endpoint: 'units', searchParam: 'title', searchValue: 'Unit' },
        { endpoint: 'lessons', searchParam: 'title', searchValue: 'Lesson' },
        { endpoint: 'challenges', searchParam: 'question', searchValue: 'the' },
        { endpoint: 'challengeOptions', searchParam: 'text', searchValue: 'a' },
        { endpoint: 'users', searchParam: 'userName', searchValue: 'user' },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                🔍 Admin Search Functionality Test
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
                This component tests the search functionality for all admin endpoints.
                Click the buttons below to test different search scenarios.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                {testCases.map((testCase, index) => (
                    <Button
                        key={index}
                        variant="outlined"
                        onClick={() => testSearch(testCase.endpoint, testCase.searchParam, testCase.searchValue)}
                        disabled={loading}
                        sx={{ p: 2, textAlign: 'left', flexDirection: 'column', alignItems: 'flex-start' }}
                    >
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {testCase.endpoint}
                        </Typography>
                        <Typography variant="caption">
                            {testCase.searchParam}: "{testCase.searchValue}"
                        </Typography>
                    </Button>
                ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                    variant="contained"
                    onClick={() => testSearch('courses', '', '')}
                    disabled={loading}
                >
                    Test All Courses (No Filter)
                </Button>
                <Button
                    variant="contained"
                    onClick={() => testSearch('challenges', 'type', 'VOCABULARY')}
                    disabled={loading}
                >
                    Test Challenge Type Filter
                </Button>
                <Button
                    variant="contained"
                    onClick={() => testSearch('challengeOptions', 'correct', 'true')}
                    disabled={loading}
                >
                    Test Correct Answers Filter
                </Button>
            </Box>

            {loading && (
                <Card sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography>🔄 Testing search functionality...</Typography>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card sx={{ mb: 2, borderColor: 'error.main', borderWidth: 1, borderStyle: 'solid' }}>
                    <CardHeader title="❌ Error" />
                    <CardContent>
                        <Typography color="error">{error}</Typography>
                    </CardContent>
                </Card>
            )}

            {searchResults && (
                <Card sx={{ borderColor: 'success.main', borderWidth: 1, borderStyle: 'solid' }}>
                    <CardHeader title="✅ Search Results" />
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Endpoint: {searchResults.endpoint}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            Search: {searchResults.searchParam} = "{searchResults.searchValue}"
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            Results Count: {searchResults.count}
                        </Typography>
                        
                        {searchResults.data && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Sample Data (first 3 results):
                                </Typography>
                                <pre style={{ 
                                    background: '#f5f5f5', 
                                    padding: '10px', 
                                    borderRadius: '4px', 
                                    overflow: 'auto',
                                    fontSize: '12px'
                                }}>
                                    {JSON.stringify(searchResults.data, null, 2)}
                                </pre>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card sx={{ mt: 3, backgroundColor: '#f8f9fa' }}>
                <CardHeader title="ℹ️ How to Test Search in React Admin" />
                <CardContent>
                    <Typography variant="body2" paragraph>
                        1. Navigate to any list page (Courses, Units, Lessons, etc.)
                    </Typography>
                    <Typography variant="body2" paragraph>
                        2. Look for the search/filter controls at the top of the list
                    </Typography>
                    <Typography variant="body2" paragraph>
                        3. Enter search terms in the filter fields
                    </Typography>
                    <Typography variant="body2" paragraph>
                        4. The list should automatically filter based on your search criteria
                    </Typography>
                    <Typography variant="body2" paragraph>
                        5. If you see "No results found" or the list doesn't filter, there may be an issue
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};
