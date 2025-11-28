"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WeightRecord {
    date: string;
    weight: number;
}

interface PuppyData {
    name: string;
    data: WeightRecord[];
    color: string;
}

interface LitterGrowthChartProps {
    litterName: string;
    puppies: PuppyData[];
}

export default function LitterGrowthChart({ litterName, puppies }: LitterGrowthChartProps) {
    // Transform data for Recharts
    // We need a unified array of objects where keys are puppy names
    // This assumes all puppies are weighed on the same dates for simplicity, 
    // or we need to merge based on dates.
    // For this MVP, let's assume we pass a unified dataset or process it.

    // Let's create a unified set of dates
    const allDates = Array.from(new Set(puppies.flatMap(p => p.data.map(d => d.date)))).sort();

    const chartData = allDates.map(date => {
        const entry: any = { date };
        puppies.forEach(puppy => {
            const record = puppy.data.find(d => d.date === date);
            if (record) {
                entry[puppy.name] = record.weight;
            }
        });
        return entry;
    });

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                Litter Growth: {litterName}
            </h3>
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280' }}
                        />
                        <YAxis
                            label={{ value: 'Weight (oz)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '8px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Legend />
                        {puppies.map((puppy) => (
                            <Line
                                key={puppy.name}
                                type="monotone"
                                dataKey={puppy.name}
                                stroke={puppy.color}
                                activeDot={{ r: 8 }}
                                strokeWidth={2}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
