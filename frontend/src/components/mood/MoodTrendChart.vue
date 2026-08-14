<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js'
import { useMoodStore } from '../../stores/mood'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

const mood = useMoodStore()

function formatLabel(dateIso: string) {
  return new Date(dateIso).toLocaleDateString(undefined, {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
  })
}

const chartData = computed(() => ({
  labels: mood.sortedLogs.map((log) => formatLabel(log.date)),
  datasets: [
    {
      label: 'Daily mood',
      data: mood.sortedLogs.map((log) => log.rating),
      borderColor: '#2a78d6',
      backgroundColor: '#2a78d6',
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 5,
      tension: 0.2,
    },
    {
      label: '7-day average',
      data: mood.rollingAverageSeries.map((point) => point.average),
      borderColor: '#eb6834',
      backgroundColor: '#eb6834',
      borderWidth: 2,
      pointRadius: 0,
      borderDash: [4, 3],
      tension: 0.2,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      min: 1,
      max: 10,
      ticks: { stepSize: 1, color: '#898781' },
      grid: { color: '#e1e0d9' },
    },
    x: {
      ticks: { color: '#898781' },
      grid: { display: false },
    },
  },
  plugins: {
    legend: {
      display: true,
      labels: { color: '#52514e' },
    },
  },
}
</script>

<template>
  <div class="h-72">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
