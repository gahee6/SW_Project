import React, { useState } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import JSZip from 'jszip';

const MAP_API_KEY = ' ';
const MOUNTAIN_API_KEY = ' ';

const containerStyle = {
  width: '100%',
  height: '800px'
};

function App() {
  const [mountainName, setMountainName] = useState('');
  const [trailData, setTrailData] = useState(null);
  const [searchError, setSearchError] = useState(false); // 검색 오류 여부
  const [center, setCenter] = useState(null); // 중심 좌표 상태 추가

  const handleInputChange = (event) => {
    setMountainName(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!mountainName.trim()) {
      setSearchError(true);
      return; // 공백 검색시 검색을 수행하지 않음
    }

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: mountainName }, (results, status) => {
      if (status === "OK") {
        const mt_pt = results[0].geometry.location;

        setCenter({
          lat: mt_pt.lat(),
          lng: mt_pt.lng()
        });
      } else {
        console.error("지리적 검색 요청 실패:", status);
      }
    });

    try {
      const url = `http://openapi.forest.go.kr/openapi/service/trailInfoService/getforestspatialdataservice?mntnNm=${encodeURIComponent(mountainName)}&serviceKey=${MOUNTAIN_API_KEY}&pageNo=1&numOfRows=10&`;
      const response = await fetch(url);
      const data = await response.text();
      const parser = new DOMParser();
      const data_info = parser.parseFromString(data, "text/xml");
      console.log("data", data_info);

      const zipFileURL = data_info.getElementsByTagName('mntnfile')[0].textContent;
      handleZipFile(zipFileURL);

      if (data_info.getElementsByTagName('totalCount')[0].textContent === '0') {
        setSearchError(true);
      } else {
        setTrailData(data_info);
        setSearchError(false);
      }
    } catch (error) {
      console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
      setSearchError(true);
    }
  };

  const handleZipFile = async (zipFileURL) => {
    try {
      const zipResponse = await fetch(zipFileURL);
      const zipBlob = await zipResponse.blob();
      const zip = await JSZip.loadAsync(zipBlob);
      zip.forEach((relativePath, zipEntry) => {
        console.log("File:", relativePath);
      });
    } catch (error) {
      console.error('ZIP 파일을 다운로드하거나 해제하는 중 오류가 발생했습니다:', error);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>구글 지도 위에 등산로 표시하기</h1>
      </header>
      <form onSubmit={handleSubmit}>
        <label>
          찾으려는 산 이름을 검색하세요:
          <input
            type="text"
            value={mountainName}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">검색</button>
      </form>
      {trailData && <p>{mountainName}에 대한 등산로 정보를 검색합니다.</p>}
      {searchError && <p>검색 결과가 없습니다.</p>}
      <LoadScript googleMapsApiKey={MAP_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center || { lat: 37.018000, lng: 127.835941 }} 
          zoom={14}
        >
          {/* 등산로 정보를 표시하는 기능(추가예정)*/}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default App;

