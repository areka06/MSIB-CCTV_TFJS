import { createLazyFileRoute } from "@tanstack/react-router";
import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import Hls from 'hls.js'; 
import "/src/style/dashboard.css";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

const INITIAL_CENTER = [
  110.37424299228306,
  -7.747562190505447
]

const INITIAL_ZOOM = 10.5


const LOCATIONS = [
  { name: 'Tugu Selamat DatangGunung Kidul', coordinate: [-7.847243631986033, 110.4794747893814], videoUrl: 'https://mam.jogjaprov.go.id:1937/cctv-kominfogk/TUGU_SELAMAT_DATANG_GK.stream/playlist.m3u8' },
  { name: 'Flyover Jombor', coordinate: [-7.749070461654027, 110.36301031703312], videoUrl: 'https://mam.jogjaprov.go.id:1937/cctv-kominfosleman/FlyOver_JomborTimur.stream/playlist.m3u8' },
  { name: 'Perempatan Demak Ijo', coordinate: [-7.777434938727133, 110.33131712427983], videoUrl: 'https://mam.jogjaprov.go.id:1937/cctv-kominfosleman/Perempatan_DemakIjo2.stream/playlist.m3u8' },
  { name: 'Perempatan Ketandan', coordinate: [-7.81172209035597, 110.40918387469969], videoUrl: 'https://mam.jogjaprov.go.id:1937/atcs/Ketandan2.stream/playlist.m3u8' },
  { name: 'Perempatan Tempel', coordinate: [-7.653802394653584, 110.32567795311402], videoUrl: 'https://mam.jogjaprov.go.id:1937/cctv-kominfosleman/Perempatan_Tempel1.stream/playlist.m3u8' },
  { name: 'Perempatan Godean', coordinate: [-7.766216387980382, 110.28993556660772], videoUrl: 'https://mam.jogjaprov.go.id:1937/cctv-kominfosleman/Perempatan_Godean1.stream/playlist.m3u8' },
  { name: 'Pertigaan Pasar Gamping', coordinate: [-7.800311714786746, 110.32513232728601], videoUrl: 'https://mam.jogjaprov.go.id:1937/cctv-kominfosleman/Pertigaan_PasarGamping.stream/playlist.m3u8' },
  { name: 'NOL Kilometer', coordinate: [-7.801070737467599, 110.3647652995262], videoUrl: 'https://mam.jogjaprov.go.id:1937/cctv-public/ViewNolKilo.stream/playlist.m3u8' },
  { name: 'Maliboro', coordinate: [-7.792438205321327, 110.3658215377721], videoUrl: 'https://mam.jogjaprov.go.id:1937/cctv-public/ViewDepanGaruda.stream/playlist.m3u8' },
  { name: 'Tugu Jogja', coordinate: [-7.782687932063255, 110.36707569544406], videoUrl: 'https://mam.jogjaprov.go.id:1937/atcs-kota/SimpangTugu.stream/playlist.m3u8' }
]

const CITY_BOUNDARY = 'Data Kendaraan Batas Kota';
const PROVINCE_BOUNDARY = 'Data Kendaraan Batas Provinsi';
const IN_CITY_BOUNDARY = 'Data Kendaraan  Dalam Kota';
const TOTAL_BOUNDARY = 'Data Total Kendaraan';

// Register the necessary chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Dashboard() {
  const mapRef = useRef();
  const mapContainerRef = useRef();

  const [center, setCenter] = useState(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  
  const [activeTab, setActiveTab] = useState('city'); // Menambahkan state untuk tab aktif

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // State untuk menyimpan data dari API
  const [trafficData, setTrafficData] = useState(null);
  const [objectInOutData, setObjectInOutData] = useState(null); // For object-inout API data
  const [detailedSum, setDetailedSum] = useState(null); // For detailed-sum API data
  const [sortCCTV, setSortCCTV] = useState(null); // For sort-cctv API data


  // Fetch data from the category-detail API
  const fetchCategoryDetailData = async (category, startDate, endDate) => {
    try {
      const url = `http://172.20.10.3:3013/statistik/category-detail?category=${encodeURIComponent(category)}&start_date=${startDate}&end_date=${endDate}`;
      const response = await fetch(url);
      const result = await response.json();
      setTrafficData(result.data);
    } catch (error) {
      console.error('Error fetching category-detail data:', error);
    }
  };

  // Fetch data from the object-inout API
  const fetchObjectInOutData = async (category, startDate, endDate) => {
    try {
      const url = `http://172.20.10.3:3013/statistik/object-inout?category=${encodeURIComponent(category)}&start_date=${startDate}&end_date=${endDate}`;
      const response = await fetch(url);
      const result = await response.json();
      setObjectInOutData(result.data);
    } catch (error) {
      console.error('Error fetching object-inout data:', error);
    }
  };

  // Fetch data from the detailed-sum API
  const fetchDetailedSum = async (startDate, endDate) => {
    try {
      const url = `http://172.20.10.3:3013/statistik/detailed-sum?start_date=${startDate}&end_date=${endDate}`;
      const response = await fetch(url);
      const result = await response.json();
      setDetailedSum(result.data);
    } catch (error) {
      console.error('Error fetching detailed-sum data:', error);
    }
  };

  // Fetch data from the sort-cctv API
  const fetchSortCCTV = async (category, startDate, endDate) => {
    try {
      const url = `http://172.20.10.3:3013/statistik/sort-cctv?category=${encodeURIComponent(category)}&start_date=${startDate}&end_date=${endDate}`;
      const response = await fetch(url);
      const result = await response.json();
      setSortCCTV(result.data);
    } catch (error) {
      console.error('Error fetching category-detail data:', error);
    }
  }

  // Fetch data whenever the activeTab changes
  useEffect(() => {
    const startDate = '2024-09-01'; // Example start date
    const endDate = '2024-10-11';   // Example end date

    let category = ''; // Define category based on activeTab
    if (activeTab === 'province') {
      category = 'Perbatasan Provinsi';
    } else if (activeTab === 'city') {
      category = 'Perbatasan Kota';
    } else if (activeTab === 'incity') {
      category = 'Dalam Kota';
    }

    // Fetch category detail data based on the tab
    fetchCategoryDetailData(category, startDate, endDate);

    // Fetch object in/out data (this API is assumed to be used across all tabs)
    fetchObjectInOutData(category, startDate, endDate);

    // Fetch detailed sum data (this API is assumed to be used across all tabs)
    // fetchDetailedSum(startDate, endDate);

    // Fetch sort cctv
    // fetchSortCCTV(startDate, endDate);

  }, [activeTab]);

  // Separate useEffect for fetchDetailedSum and fetchSortCCTV
useEffect(() => {
  const startDate = '2024-09-01'; // Example start date
  const endDate = '2024-10-11';   // Example end date

  let category = ''; // Define category 

  // Fetch detailed sum data (not dependent on activeTab)
  fetchDetailedSum(startDate, endDate);

  // Fetch sorted CCTV data (not dependent on activeTab)
  fetchSortCCTV(category, startDate, endDate);

}, []); 

// Prepare data for the line chart with total masuk, total keluar, and total masuk_keluar
const chartData = {
  labels: trafficData && trafficData.top_locations
    ? trafficData.top_locations.map((locationData) => locationData.location || 'Tidak tersedia') // x-axis labels (location)
    : [], 
  datasets: [
    {
      label: 'Total Masuk',
      data: trafficData && trafficData.top_locations
        ? trafficData.top_locations.map((locationData) => locationData.total_masuk || 0) // y-axis data (total_masuk)
        : [], 
      borderColor: 'rgba(75, 192, 192, 1)', // Line color
      fill: false,
    },
    {
      label: 'Total Keluar',
      data: trafficData && trafficData.top_locations
        ? trafficData.top_locations.map((locationData) => locationData.total_keluar || 0) // y-axis data (total_keluar)
        : [], 
      borderColor: 'rgba(255, 99, 132, 1)', // Line color
      fill: false,
    },
    {
      label: 'Total Masuk dan Keluar',
      data: trafficData && trafficData.top_locations
        ? trafficData.top_locations.map((locationData) => locationData.total_masuk_keluar || 0) // y-axis data (total_masuk_keluar)
        : [], 
      borderColor: 'rgba(54, 162, 235, 1)', // Line color
      fill: false,
    },
  ],
};

// Prepare data for the line chart with total masuk, total keluar, and total masuk_keluar
const chartDataTotal = {
  labels: sortCCTV 
    ? sortCCTV.map((locationData) => locationData.lokasi || 'Tidak tersedia') // x-axis labels (location)
    : [], 
  datasets: [
    {
      label: 'Total Kendaraan',
      data: sortCCTV 
        ? sortCCTV.map((locationData) => locationData.total_count || 0) // y-axis data (total_masuk)
        : [], 
      borderColor: 'rgba(75, 192, 192, 1)', // Line color
      fill: false,
    },
  ],
};

const options = {
  responsive: true,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Jumlah Kendaraan', // y-axis title
      },
    },
    x: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Lokasi CCTV', // x-axis title
      },
    },
  },
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Perbandingan Lokasi CCTV dan Lalu Lintas (Masuk/Keluar)',
    },
  },
};


  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZmFkaWxhaDI0OCIsImEiOiJja3dnZXdmMnQwbno1MnRxcXYwdjB3cG9qIn0.v4gAtavpn1GzgtD7f3qapA'
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: center,
      zoom: zoom
    });

    // Add markers for each location with embedded video
    LOCATIONS.forEach(location => {
      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <h3 class="custom-popup">${location.name}</h3>
        <video id="video-${location.name}" width="600" controls muted></video>`; // 'muted' is required for autoplay

      const videoElement = popupContent.querySelector(`video`);
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundImage = 'url(/public/cctv-marker.png)'; // Path to your PNG file
      el.style.width = '50px'; // Set marker width
      el.style.height = '50px'; // Set marker height
      el.style.backgroundSize = 'cover';

      // Create popup with custom class
      const popup = new mapboxgl.Popup({
        className: 'custom-popup',
        maxWidth: '600px', // Limit the width of the popup to avoid overflow
        // offset: -5, // Add an offset to prevent the popup from overlapping with the marker
        // anchor: 'auto', // Automatically adjust the position to ensure visibility
      })
      .setDOMContent(popupContent);

      // Create the marker and attach the popup
      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.coordinate[1], location.coordinate[0]]) // lngLat uses [longitude, latitude]
        .setPopup(popup)
        .addTo(mapRef.current);

      // Handle popup open event to autoplay the video
      popup.on('open', () => {
        // Use HLS.js if the browser doesn't support HLS natively
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(location.videoUrl);
          hls.attachMedia(videoElement);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoElement.play(); // Autoplay the video when HLS is ready
          });
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
          // For Safari or browsers that support HLS natively
          videoElement.src = location.videoUrl;
          videoElement.play(); // Autoplay the video for browsers with native HLS support
        }
      });
    });

    mapRef.current.on('move', () => {
      // get the current center coordinates and zoom level from the map
      const mapCenter = mapRef.current.getCenter()
      const mapZoom = mapRef.current.getZoom()

      // update state
      setCenter([ mapCenter.lng, mapCenter.lat ])
      setZoom(mapZoom)
    })

    return () => {
      mapRef.current.remove()
    }
  }, [])

  return (
    <div id="dashboard-container">
      {/* Left Container */}
      <div id="left-container">
        <div className="tab-container">
          <button 
            className={`tab-button ${activeTab === 'city' ? 'active' : ''}`} 
            onClick={() => handleTabChange('city')}>
            Batas Kota
          </button>
          <button 
            className={`tab-button ${activeTab === 'province' ? 'active' : ''}`} 
            onClick={() => handleTabChange('province')}>
            Batas Provinsi
          </button>
          <button 
            className={`tab-button ${activeTab === 'incity' ? 'active' : ''}`} 
            onClick={() => handleTabChange('incity')}>
            Dalam Kota
          </button>
        </div>

        <div className="content-container">
          {activeTab === 'city' && (
            <div>
              <h3>Top CCTV Batas Kota</h3>
              {trafficData ? (
                <table>
                  <thead>
                    <tr>
                      <th>Lokasi</th>
                      <th className="in">Masuk</th>
                      <th className="out">Keluar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trafficData?.top_locations && trafficData.top_locations.length > 0 ? (
                      (() => {
                        const rows = []; // Array to hold the table rows
                        for (let i = 0; i < trafficData.top_locations.length; i++) {
                          const locationData = trafficData.top_locations[i]; // Access each location data
                          rows.push(
                            <tr key={i}>
                              <td>{locationData?.location || 'Tidak tersedia'}</td>
                              <td>{locationData?.total_masuk || 0}</td>
                              <td>{locationData?.total_keluar || 0}</td>
                            </tr>
                          );
                        }
                        return rows; // Return the generated rows to be rendered
                      })()
                    ) : (
                      <tr>
                        <td colSpan="3">Data tidak tersedia</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <p>Memuat data...</p>
              )}
              <br />
              <h3>Jumlah Jenis Kendaraan</h3>
              {objectInOutData ? (
                <table>
                  <thead>
                    <tr>
                      <th>Objek</th>
                      <th className="in">Masuk</th>
                      <th className="out">Keluar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Mobil</td>
                      <td>{objectInOutData?.kendaraan_masuk?.total_mobil || 0}</td>
                      <td>{objectInOutData?.kendaraan_keluar?.total_mobil || 0}</td>
                    </tr>
                    <tr>
                      <td>Motor</td>
                      <td>{objectInOutData?.kendaraan_masuk?.total_motor || 0}</td>
                      <td>{objectInOutData?.kendaraan_keluar?.total_motor || 0}</td>
                    </tr>
                    <tr>
                      <td>Truk</td>
                      <td>{objectInOutData?.kendaraan_masuk?.total_truk || 0}</td>
                      <td>{objectInOutData?.kendaraan_keluar?.total_truk || 0}</td>
                    </tr>
                    <tr>
                      <td>Bus</td>
                      <td>{objectInOutData?.kendaraan_masuk?.total_bus || 0}</td>
                      <td>{objectInOutData?.kendaraan_keluar?.total_bus || 0}</td>
                    </tr>
                    <tr>
                      <td>Pejalan Kaki</td>
                      <td>{objectInOutData?.kendaraan_masuk?.total_pejalan_kaki || 0}</td>
                      <td>{objectInOutData?.kendaraan_keluar?.total_pejalan_kaki || 0}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p>Memuat data...</p>
              )}
              <br />
              {/* <div style={{ width: '100%', height: '50vh' }}>
                <h3>Grafik CCTV Batas Kota</h3>
                {trafficData ? <Line data={chartData} options={options} id="linegraf" /> : <p>Memuat data...</p>}
              </div> */}
            </div>
          )}
           {activeTab === 'province' && (
            <div>
              <h3>Top CCTV Batas Provinsi</h3>
              {trafficData ? (
                <table>
                  <thead>
                    <tr>
                      <th>Lokasi</th>
                      <th className="in">Masuk</th>
                      <th className="out">Keluar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trafficData?.top_locations && trafficData.top_locations.length > 0 ? (
                      (() => {
                        const rows = []; // Array to hold the table rows
                        for (let i = 0; i < trafficData.top_locations.length; i++) {
                          const locationData = trafficData.top_locations[i]; // Access each location data
                          rows.push(
                            <tr key={i}>
                              <td>{locationData?.location || 'Tidak tersedia'}</td>
                              <td>{locationData?.total_masuk || 0}</td>
                              <td>{locationData?.total_keluar || 0}</td>
                            </tr>
                          );
                        }
                        return rows; // Return the generated rows to be rendered
                      })()
                    ) : (
                      <tr>
                        <td colSpan="3">Data tidak tersedia</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <p>Memuat data...</p>
              )}
              <br />
              <h3>Jumlah Jenis Kendaraan</h3>
              {objectInOutData ? (
                <table>
                  <thead>
                    <tr>
                      <th>Objek</th>
                      <th className="in">Masuk</th>
                      <th className="out">Keluar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Mobil</td>
                      <td>{objectInOutData?.kendaraan_masuk?.total_mobil || 0}</td>
                      <td>{objectInOutData?.kendaraan_keluar?.total_mobil || 0}</td>
                    </tr>
                    <tr>
                      <td>Motor</td>
                      <td>{objectInOutData?.kendaraan_masuk?.total_motor || 0}</td>
                      <td>{objectInOutData?.kendaraan_keluar?.total_motor || 0}</td>
                    </tr>
                    <tr>
                      <td>Truk</td>
                      <td>{objectInOutData?.kendaraan_masuk?.total_truk || 0}</td>
                      <td>{objectInOutData?.kendaraan_keluar?.total_truk || 0}</td>
                    </tr>
                    <tr>
                      <td>Bus</td>
                      <td>{objectInOutData?.kendaraan_masuk?.total_bus || 0}</td>
                      <td>{objectInOutData?.kendaraan_keluar?.total_bus || 0}</td>
                    </tr>
                    <tr>
                      <td>Pejalan Kaki</td>
                      <td>{objectInOutData?.kendaraan_masuk?.total_pejalan_kaki || 0}</td>
                      <td>{objectInOutData?.kendaraan_keluar?.total_pejalan_kaki || 0}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p>Memuat data...</p>
              )}
              <br />
                
            </div>
          )}
          {activeTab === 'incity' && (
            <div>
              <h3>Top CCTV Dalam Kota</h3>
              {trafficData ? (
                <table>
                  <thead>
                    <tr>
                      <th>Lokasi</th>
                      <th className="in">Masuk</th>
                      <th className="out">Keluar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trafficData?.top_locations && trafficData.top_locations.length > 0 ? (
                      (() => {
                        const rows = []; // Array to hold the table rows
                        for (let i = 0; i < trafficData.top_locations.length; i++) {
                          const locationData = trafficData.top_locations[i]; // Access each location data
                          rows.push(
                            <tr key={i}>
                              <td>{locationData?.location || 'Tidak tersedia'}</td>
                              <td>{locationData?.total_masuk || 0}</td>
                              <td>{locationData?.total_keluar || 0}</td>
                            </tr>
                          );
                        }
                        return rows; // Return the generated rows to be rendered
                      })()
                    ) : (
                      <tr>
                        <td colSpan="3">Data tidak tersedia</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <p>Memuat data...</p>
              )}
              <br />
              <h3>Jumlah Jenis Kendaraan</h3>
              {objectInOutData ? (
                <table>
                  <thead>
                    <tr>
                      <th>Objek</th>
                      <th className="in">Masuk</th>
                      <th className="out">Keluar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Mobil</td>
                      <td>{objectInOutData?.kendaraan_masuk?.total_mobil || 0}</td>
                      <td>{objectInOutData?.kendaraan_keluar?.total_mobil || 0}</td>
                    </tr>
                    <tr>
                      <td>Motor</td>
                      <td>{objectInOutData?.kendaraan_masuk?.total_motor || 0}</td>
                      <td>{objectInOutData?.kendaraan_keluar?.total_motor || 0}</td>
                    </tr>
                    <tr>
                      <td>Truk</td>
                      <td>{objectInOutData?.kendaraan_masuk?.total_truk || 0}</td>
                      <td>{objectInOutData?.kendaraan_keluar?.total_truk || 0}</td>
                    </tr>
                    <tr>
                      <td>Bus</td>
                      <td>{objectInOutData?.kendaraan_masuk?.total_bus || 0}</td>
                      <td>{objectInOutData?.kendaraan_keluar?.total_bus || 0}</td>
                    </tr>
                    <tr>
                      <td>Pejalan Kaki</td>
                      <td>{objectInOutData?.kendaraan_masuk?.total_pejalan_kaki || 0}</td>
                      <td>{objectInOutData?.kendaraan_keluar?.total_pejalan_kaki || 0}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p>Memuat data...</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map and Right Container Wrapper */}
      <div id="map-container-wrapper">
        <div id="map-container" ref={mapContainerRef}></div>

        {/* Right Container */}
        <div id="right-container">
        <div className="content-container">
          <h3>Total Pantauan Kendaraan DIY</h3>
          {detailedSum ? (
                <table>
                  <thead>
                    <tr>
                      <th>Objek</th>
                      <th className="in">Masuk</th>
                      <th className="out">Keluar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Mobil</td>
                      <td>{detailedSum?.total_mobil || 0}</td>
                      <td>{detailedSum?.total_mobil || 0}</td>
                    </tr>
                    <tr>
                      <td>Motor</td>
                      <td>{detailedSum?.total_motor || 0}</td>
                      <td>{detailedSum?.total_motor || 0}</td>
                    </tr>
                    <tr>
                      <td>Truk</td>
                      <td>{detailedSum?.total_truk || 0}</td>
                      <td>{detailedSum?.total_truk || 0}</td>
                    </tr>
                    <tr>
                      <td>Bus</td>
                      <td>{detailedSum?.total_bus || 0}</td>
                      <td>{detailedSum?.total_bus || 0}</td>
                    </tr>
                    <tr>
                      <td>Pejalan Kaki</td>
                      <td>{detailedSum?.total_pejalan_kaki || 0}</td>
                      <td>{detailedSum?.total_pejalan_kaki || 0}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p>Memuat data...</p>
              )}
              <br />
              <h3>Top CCTV DIY</h3>
              {trafficData ? (
                <table>
                  <thead>
                    <tr>
                      <th>Lokasi</th>
                      <th className="in">Total </th>
                      {/* <th className="out">Keluar</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {sortCCTV && sortCCTV.length > 0 ? (
                      (() => {
                        const rows = []; // Array to hold the table rows
                        for (let i = 0; i < sortCCTV.length; i++) {
                          const locationData = sortCCTV[i]; // Access each location data
                          rows.push(
                            <tr key={i}>
                              <td>{locationData?.lokasi || 'Tidak tersedia'}</td>
                              <td>{locationData?.total_count || 0}</td>
                              {/* <td>{locationData?.total_keluar || 0}</td> */}
                            </tr>
                          );
                        }
                        return rows; // Return the generated rows to be rendered
                      })()
                    ) : (
                      <tr>
                        <td colSpan="3">Data tidak tersedia</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <p>Memuat data...</p>
              )}
          </div>
        </div>
      </div>

      {/* Bottom Container */}
      <div id="bottom-container">
        <div className="bottom-left">
          <h3>Grafik CCTV : {activeTab === 'city' ? CITY_BOUNDARY 
                        : activeTab === 'province' ? PROVINCE_BOUNDARY 
                        : activeTab === 'incity' ? IN_CITY_BOUNDARY 
                        : TOTAL_BOUNDARY}</h3>
          {trafficData ? <Line data={chartData} options={options} /> : <p>Memuat data...</p>}
        </div>
        <div className="bottom-right">
          <h3>Grafik CCTV : Total Kendaraan </h3>
          {trafficData ? <Line data={chartDataTotal} options={options} /> : <p>Memuat data...</p>}
        </div>
      </div>
    </div>
  )
}

export default Dashboard