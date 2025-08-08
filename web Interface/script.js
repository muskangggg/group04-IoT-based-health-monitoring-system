// ✅ Store gauges in a global object
const gauges = {};

// ✅ Function to create and update the temperature gauge
function createTempGauge() {
    const ctx = document.getElementById('bodyTempGauge').getContext('2d');
    const tempGauge = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Temperature', ''],
            datasets: [{
                data: [30, 100],
                backgroundColor: ['#f39c12', '#e0e0e0'],
                borderWidth: 0
            }]
        },
        options: {
            rotation: -90,
            circumference: 360,
            cutout: "75%",
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });

    gauges['bodyTempGauge'] = { chart: tempGauge, max: 100 };
}

// ✅ Function to create and update the pulse gauge
function createPulseGauge() {
    const ctx = document.getElementById('pulseGauge').getContext('2d');
    const pulseGauge = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pulse Rate', ''],
            datasets: [{
                data: [80, 150],
                backgroundColor: ['#3498db', '#e0e0e0'],
                borderWidth: 0
            }]
        },
        options: {
            rotation: -90,
            circumference: 360,
            cutout: "75%",
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });

    gauges['pulseGauge'] = { chart: pulseGauge, max: 150 };
}

// ✅ Function to fetch data from ESP32 and update gauges
async function fetchData() {
    try {
        const response = await fetch('http://192.168.0.113/data'); // Change IP if needed
        const data = await response.json();

        // ✅ Scale IR value to approximate BPM
        const estimatedBPM = Math.min(140, Math.max(10, Math.round(data.pulseRaw / 1000)));

        updateGauge('bodyTempGauge', data.bodyTemp);
        updateGauge('pulseGauge', estimatedBPM);

        // ✅ Display values
        document.getElementById("bodyTemp").innerText = data.bodyTemp.toFixed(1) + " °C";
        document.getElementById("pulseRate").innerText = estimatedBPM + " BPM";

        // ✅ Warnings
        document.getElementById("tempAlert").innerText =
            data.bodyTemp > 38 ? "🔥 High Temperature Detected!" : "";

        document.getElementById("pulseAlert").innerText =
            estimatedBPM > 100 ? "⚠ High Pulse Rate!" : "";

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// ✅ Function to update the gauge value
function updateGauge(canvasId, value) {
    const gaugeObj = gauges[canvasId];
    if (!gaugeObj) return;

    const max = gaugeObj.max || 100;
    const chart = gaugeObj.chart;
    chart.data.datasets[0].data = [value, Math.max(0, max - value)];
    chart.update();
}

// ✅ Auto fetch data every 10 seconds
setInterval(fetchData, 10000);

// ✅ Initialize gauges on page load
window.onload = () => {
    createTempGauge();
    createPulseGauge();
    fetchData(); // Initial fetch
};