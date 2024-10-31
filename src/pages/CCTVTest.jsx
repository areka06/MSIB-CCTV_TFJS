import MultiVideoDetection from '/src/components/Elements/MultiDetection';

function App() {
  const streamUrls = [
    "rtsp://103.131.105.122:1935/atcs/Jatikencana.stream",
    "rtsp://103.131.105.122:1935/atcs/Ketandan2.stream",
  ];

  return (
    <div className="App mt-20">
      <MultiVideoDetection initialStreams={streamUrls} />
    </div>
  );
}

export default App;