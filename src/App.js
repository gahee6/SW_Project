import React, { useState } from 'react';
import './App.css';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Suninfo from './Suninfo';
import Main from './Main';

const MAP_API_KEY = 'AIzaSyDLaff4Af2a3lO_UvfNsy-QzKCnDnV9Ol0';
const MOUNTAIN_API_KEY = 'GM2bKdaGinIelgRZx7EEEyYv27HTHfFwZruRfGFxIWsjag8Xj%2BMATGK5rS38CISJTlRIIziNpe4eiVFpW97zlQ%3D%3D';

const containerStyle = {
  width: '100%',
  height: '500px'
};

function App() {
  const [mountainName, setMountainName] = useState('');
  const [trailData, setTrailData] = useState(null);
  const [searchError, setSearchError] = useState(false);
  const [center, setCenter] = useState(null);
  const [zoom, setZoom] = useState(null);
  const [mountainInfo, setMountainInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    setMountainName(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTrailData(null);
    setMountainInfo(null);
    setSearchError(false);
    setLoading(true);

    if (!mountainName.trim()) {
      setSearchError(true);
      setLoading(false);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: mountainName }, async (results, status) => {
      if (status === "OK") {
        const mt_pt = results[0].geometry.location;

        setCenter({
          lat: mt_pt.lat(),
          lng: mt_pt.lng(),
        });
        setZoom(14);
      } else {
        console.error("지리적 검색 요청 실패:", status);
      }
    });

    try {
      const infoUrl = `http://openapi.forest.go.kr/openapi/service/trailInfoService/getforeststoryservice?mntnNm=${encodeURIComponent(mountainName)}&serviceKey=${MOUNTAIN_API_KEY}`;
      const infoResponse = await fetch(infoUrl);
      const infoData = await infoResponse.text();
      const parser = new DOMParser();
      const infoDataParsed = parser.parseFromString(infoData, "text/xml");
      console.log("infoData", infoDataParsed);

      const mountainDetails = {
        detailedInfo: infoDataParsed.getElementsByTagName('mntninfodtlinfocont')[0].textContent,
        tourismInfo: infoDataParsed.getElementsByTagName('crcmrsghtnginfoetcdscrt')[0].textContent,
        famousMountainMap: infoDataParsed.getElementsByTagName('hndfmsmtnmapimageseq')[0].textContent,
        mountainImage: infoDataParsed.getElementsByTagName('mntnattchimageseq')[0].textContent,
        subTitle: infoDataParsed.getElementsByTagName('mntnsbttlinfo')[0].textContent,
        height: infoDataParsed.getElementsByTagName('mntninfohght')[0].textContent,
        trafficinfo: infoDataParsed.getElementsByTagName('pbtrninfodscrt')[0].textContent
      };

      setMountainInfo(mountainDetails);
    } catch (error) {
      console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
      setSearchError(true);
    } finally {
      setLoading(false);
    }
  };

  const createMarkup = (html) => {
    return { __html: html };
  };

  return (
    <LoadScript googleMapsApiKey={MAP_API_KEY}>
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/suninfo" element={<Suninfo />} />
          <Route path="/app" element={
            <div className="App">
              <header className="App-header">
                <h1>산행</h1>
                <Link to="/suninfo"><button>오늘의 일출&일몰</button></Link>
              </header>
              <form onSubmit={handleSubmit}>
                <label>
                  찾으려는 산 이름을 검색하세요:
                  <input type="text" value={mountainName} onChange={handleInputChange} />
                </label>
                <button type="submit">검색</button>
              </form>
              {loading && <p>검색 중입니다...</p>}
              {trailData && <p>{mountainName}에 대한 등산로 정보를 검색합니다.</p>}
              {searchError && <p>검색 결과가 없습니다.</p>}
              
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center || { lat: 37.018000, lng: 127.835941 }} 
                zoom={zoom || 9}
              >
                {/* 등산로 정보를 표시하는 기능(추가 예정) */}
              </GoogleMap>

              {mountainInfo && (
                <div className="mountain-info">
                  <h2>{mountainName}</h2>
                  <img src={mountainInfo.famousMountainMap} alt="100대명산 지도" />
                  <img src={mountainInfo.mountainImage} alt="산 정보 이미지" />
                  <div>
                    <h3>부제</h3>
                    <p>{mountainInfo.subTitle}</p>
                  </div>
                  <div>
                    <h3>높이</h3>
                    <p>{mountainInfo.height}m</p>
                  </div>
                  <div style={{ marginBottom: '1em' }}>
                    <h3>상세정보</h3>
                    <div dangerouslySetInnerHTML={createMarkup(mountainInfo.detailedInfo)} />
                  </div>
                  <div style={{ marginBottom: '1em' }}>
                    <h3>주변관광정보와 기타코스</h3>
                    <div dangerouslySetInnerHTML={createMarkup(mountainInfo.tourismInfo)} />
                  </div>
                  <div>
                    <h3>대중교통 정보</h3>
                    <div dangerouslySetInnerHTML={createMarkup(mountainInfo.trafficinfo)}/>
                  </div>
                </div>
              )}
            </div>
          } />
        </Routes>
      </Router>
    </LoadScript>
  );
}

export default App;











